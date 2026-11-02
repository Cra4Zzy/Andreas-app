-- Live hardening, applied after schema.sql and accounts.sql.
begin;
create function abbate_private.live_session() returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists (
   select 1 from auth.sessions s where s.user_id=auth.uid()
     and s.id::text=(auth.jwt()->>'session_id')
     and (s.not_after is null or s.not_after>now())
 );
$$;
revoke all on function abbate_private.live_session() from public,anon;
grant execute on function abbate_private.live_session() to authenticated;
create or replace function abbate_private.has_active_access(school uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select abbate_private.live_session() and exists(select 1 from public.abbate_memberships m
 where m.school_id=school and m.user_id=auth.uid() and m.access_status='active'
 and (m.access_until is null or m.access_until>=(now() at time zone 'Europe/Berlin')::date));
$$;
create or replace function abbate_private.is_staff(school uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select abbate_private.has_active_access(school) and exists(select 1 from public.abbate_memberships m
 where m.school_id=school and m.user_id=auth.uid() and m.role in ('trainer','admin'));
$$;
create or replace function abbate_private.is_admin(school uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select abbate_private.has_active_access(school) and exists(select 1 from public.abbate_memberships m
 where m.school_id=school and m.user_id=auth.uid() and m.role='admin');
$$;
drop policy membership_read on public.abbate_memberships;
create policy membership_read on public.abbate_memberships for select to authenticated
 using(abbate_private.live_session() and (user_id=(select auth.uid()) or abbate_private.is_staff(school_id)));
drop policy profile_read on public.abbate_profiles;
create policy profile_read on public.abbate_profiles for select to authenticated
 using(abbate_private.live_session() and (user_id=(select auth.uid()) or abbate_private.is_staff(school_id)));

-- Learner-owned practice state is separate from staff-issued records.
create table public.abbate_practice (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{"results":[],"mastered":[]}'::jsonb
 check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=262144),
 updated_at timestamptz not null default now()
);
alter table public.abbate_practice enable row level security;
create policy practice_own on public.abbate_practice for all to authenticated
 using(user_id=(select auth.uid()) and exists(select 1 from public.abbate_memberships m
 where m.user_id=(select auth.uid()) and abbate_private.has_active_access(m.school_id)))
 with check(user_id=(select auth.uid()) and exists(select 1 from public.abbate_memberships m
 where m.user_id=(select auth.uid()) and abbate_private.has_active_access(m.school_id)));
revoke all on public.abbate_practice from public,anon,authenticated;
grant select,insert,update,delete on public.abbate_practice to authenticated;
grant all on public.abbate_practice to service_role;

-- Atomic staff command. Public RPC is SECURITY INVOKER; the privileged implementation
-- is private, explicitly checks current identity/session/school, and cannot issue roles.
create function abbate_private.record_completion(school uuid, participant uuid, title text,
 kind text, outcome text, completed_on date) returns uuid
language plpgsql security definer set search_path='' as $$
declare course uuid; record_id uuid;
begin
 if not abbate_private.is_staff(school) then raise exception 'Staff access required' using errcode='42501'; end if;
 if not exists(select 1 from public.abbate_memberships m where m.school_id=school and m.user_id=participant and m.role='learner')
 then raise exception 'Participant does not belong to this school' using errcode='42501'; end if;
 if length(trim(title)) not between 1 and 200 then raise exception 'Invalid title'; end if;
 if kind not in ('training','refresher','exam') or outcome not in ('attended','passed','failed')
 or (kind='exam' and outcome='attended') or completed_on is null
 or completed_on>(now() at time zone 'Europe/Berlin')::date then raise exception 'Invalid completed event'; end if;
 insert into public.abbate_courses(school_id,title,version) values(school,trim(title),'1') returning id into course;
 record_id:=gen_random_uuid();
 insert into public.abbate_completions(id,school_id,participant_id,course_id,course_version,kind,outcome,completed_at,issued_by,reference)
 values(record_id,school,participant,course,'1',kind,outcome,completed_on,auth.uid(),'AB-'||upper(left(record_id::text,8)));
 insert into abbate_private.account_audit(school_id,actor_id,target_id,action,after_value)
 values(school,auth.uid(),participant,'record_created',jsonb_build_object('record',record_id,'outcome',outcome));
 return record_id;
end;
$$;
revoke all on function abbate_private.record_completion(uuid,uuid,text,text,text,date) from public,anon;
grant execute on function abbate_private.record_completion(uuid,uuid,text,text,text,date) to authenticated;
create function public.abbate_record_completion(school uuid,participant uuid,title text,kind text,outcome text,completed_on date)
returns uuid language sql security invoker set search_path='' as $$
 select abbate_private.record_completion(school,participant,title,kind,outcome,completed_on);
$$;
revoke all on function public.abbate_record_completion(uuid,uuid,text,text,text,date) from public,anon;
grant execute on function public.abbate_record_completion(uuid,uuid,text,text,text,date) to authenticated;
revoke insert on public.abbate_completions from authenticated;

-- Real account deletion is one transaction, including auth sessions. A fresh password
-- sign-in is required. Staff accounts are not deletable via this learner-management API.
create function abbate_private.delete_account(target uuid) returns void
language plpgsql security definer set search_path='' as $$
declare school uuid;
begin
 if not abbate_private.live_session() or not exists(select 1 from auth.sessions s
 where s.id::text=(auth.jwt()->>'session_id') and s.user_id=auth.uid() and s.created_at>now()-interval '10 minutes')
 then raise exception 'Please sign in again before deleting an account' using errcode='42501'; end if;
 if not exists(select 1 from public.abbate_memberships where user_id=target)
 or exists(select 1 from public.abbate_memberships where user_id=target and role<>'learner')
 then raise exception 'Only learner accounts can be deleted here' using errcode='42501'; end if;
 if target<>auth.uid() and exists(select 1 from public.abbate_memberships m
 where m.user_id=target and not abbate_private.is_admin(m.school_id))
 then raise exception 'Administrator access required for every target school' using errcode='42501'; end if;
 -- Remove all dependent personal records before deleting the Auth identity.
 delete from abbate_private.share_items where owner_id=target or completion_id in
 (select id from public.abbate_completions where participant_id=target);
 delete from abbate_private.shares where owner_id=target;
 delete from public.abbate_completions where participant_id=target;
 delete from public.abbate_profiles where user_id=target;
 delete from public.abbate_memberships where user_id=target;
 delete from public.abbate_practice where user_id=target;
 delete from abbate_private.account_audit where target_id=target;
 update abbate_private.account_audit set actor_id=null where actor_id=target;
 delete from auth.users where id=target;
end;
$$;
revoke all on function abbate_private.delete_account(uuid) from public,anon;
grant execute on function abbate_private.delete_account(uuid) to authenticated;
create function public.abbate_delete_account(target uuid) returns void
language sql security invoker set search_path='' as $$select abbate_private.delete_account(target);$$;
revoke all on function public.abbate_delete_account(uuid) from public,anon;
grant execute on function public.abbate_delete_account(uuid) to authenticated;

create index on public.abbate_profiles(user_id);
create index on public.abbate_completions(school_id,participant_id);
create index on public.abbate_completions(issued_by);
create index on public.abbate_completions(course_id,school_id);
create index on public.abbate_memberships(school_id,role,access_status);
create index on abbate_private.shares(owner_id);
create index on abbate_private.share_items(completion_id,owner_id);
-- The private schema is never exposed through PostgREST.
commit;
