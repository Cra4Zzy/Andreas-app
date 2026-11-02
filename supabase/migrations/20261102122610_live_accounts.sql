begin;
-- Proposed Supabase schema. Tested locally; NOT deployed to a remote database.
-- Practice attempts are intentionally separate from confirmed completions.
create schema if not exists abbate_private;
revoke all on schema abbate_private from public, anon;

create table public.abbate_schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200)
);
create table public.abbate_memberships (
  school_id uuid not null references public.abbate_schools(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('learner','trainer','admin')),
  primary key (school_id,user_id)
);
-- This narrowly scoped helper avoids recursive membership policies.
-- It is private, checks auth.uid(), and never uses editable JWT user_metadata.
create function abbate_private.is_staff(school uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.abbate_memberships m
    where m.school_id = school and m.user_id = auth.uid() and m.role in ('trainer','admin')
  );
$$;
revoke all on function abbate_private.is_staff(uuid) from public, anon;
grant usage on schema abbate_private to authenticated;
grant execute on function abbate_private.is_staff(uuid) to authenticated;

create table public.abbate_profiles (
  school_id uuid not null,
  user_id uuid not null,
  display_name text not null check (char_length(display_name) between 1 and 120),
  primary key (school_id,user_id),
  foreign key (school_id,user_id) references public.abbate_memberships(school_id,user_id)
);
create table public.abbate_courses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.abbate_schools(id),
  title text not null check (char_length(title) between 1 and 200),
  version text not null,
  unique (id,school_id)
);
create table public.abbate_completions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  participant_id uuid not null,
  course_id uuid not null,
  course_version text not null,
  kind text not null check (kind in ('training','exam','refresher')),
  completed_at date not null,
  reminder_due date,
  issued_by uuid not null references auth.users(id),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  reference text not null,
  unique (id,participant_id),
  foreign key (school_id,participant_id) references public.abbate_memberships(school_id,user_id),
  foreign key (course_id,school_id) references public.abbate_courses(id,school_id),
  check (reminder_due is null or reminder_due >= completed_at)
);
create index on public.abbate_memberships(user_id,school_id);
create index on public.abbate_completions(participant_id,completed_at desc);

alter table public.abbate_schools enable row level security;
alter table public.abbate_memberships enable row level security;
alter table public.abbate_profiles enable row level security;
alter table public.abbate_courses enable row level security;
alter table public.abbate_completions enable row level security;

create policy school_member_read on public.abbate_schools for select to authenticated
using (exists(select 1 from public.abbate_memberships m where m.school_id=id and m.user_id=(select auth.uid())));
create policy membership_read on public.abbate_memberships for select to authenticated
using (user_id=(select auth.uid()) or abbate_private.is_staff(school_id));
create policy profile_read on public.abbate_profiles for select to authenticated
using (user_id=(select auth.uid()) or abbate_private.is_staff(school_id));
create policy course_read on public.abbate_courses for select to authenticated
using (exists(select 1 from public.abbate_memberships m where m.school_id=abbate_courses.school_id and m.user_id=(select auth.uid())));
create policy completion_read on public.abbate_completions for select to authenticated
using (participant_id=(select auth.uid()) or abbate_private.is_staff(school_id));
create policy completion_issue on public.abbate_completions for insert to authenticated
with check (abbate_private.is_staff(school_id) and issued_by=(select auth.uid()));
create policy completion_revoke on public.abbate_completions for update to authenticated
using (abbate_private.is_staff(school_id))
with check (abbate_private.is_staff(school_id));

revoke all on public.abbate_schools, public.abbate_memberships, public.abbate_profiles,
  public.abbate_courses, public.abbate_completions from anon, authenticated;
grant select on public.abbate_schools, public.abbate_memberships, public.abbate_profiles,
  public.abbate_courses, public.abbate_completions to authenticated;
grant insert on public.abbate_completions to authenticated;
-- An issued record cannot be silently rewritten by the client.
grant update(revoked_at) on public.abbate_completions to authenticated;

-- Only trusted server code can create/resolve/revoke sharing tokens.
-- Store SHA-256(token), never the plaintext token. Generate 32 random bytes server-side.
create table abbate_private.shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  unique (id,owner_id),
  check (expires_at > created_at and expires_at <= created_at + interval '7 days')
);
create table abbate_private.share_items (
  share_id uuid not null,
  owner_id uuid not null,
  completion_id uuid not null,
  primary key (share_id,completion_id),
  foreign key (share_id,owner_id) references abbate_private.shares(id,owner_id) on delete cascade,
  foreign key (completion_id,owner_id) references public.abbate_completions(id,participant_id)
);
alter table abbate_private.shares enable row level security;
alter table abbate_private.share_items enable row level security;
revoke all on abbate_private.shares,abbate_private.share_items from public,anon,authenticated;
grant usage on schema abbate_private to service_role;
grant all on public.abbate_schools,public.abbate_memberships,public.abbate_profiles,
  public.abbate_courses,public.abbate_completions,abbate_private.shares,abbate_private.share_items to service_role;

-- Draft extension for backend/schema.sql. Not deployed to a cloud project.
-- Apply only to this app's database, after configuring the registration school.
alter table public.abbate_memberships add column access_status text not null default 'pending'
  check (access_status in ('pending','active','paused'));
alter table public.abbate_memberships add column access_until date;
alter table public.abbate_profiles add column email text;
alter table public.abbate_profiles add column registered_at timestamptz not null default now();
alter table public.abbate_completions add column outcome text not null default 'attended'
  check (outcome in ('attended','passed','failed'));
-- Existing ungraded exam drafts must be assigned a real result by staff before publication.
update public.abbate_completions set revoked_at=coalesce(revoked_at,now()) where kind='exam';
alter table public.abbate_completions add constraint exam_result_required
  check (kind<>'exam' or outcome in ('passed','failed') or revoked_at is not null);
alter table public.abbate_completions add constraint no_future_completion
  check (completed_at <= (now() at time zone 'Europe/Berlin')::date);

create function abbate_private.has_active_access(school uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(
    select 1 from public.abbate_memberships m where m.school_id=school and m.user_id=auth.uid()
      and m.access_status='active' and (m.access_until is null or m.access_until >= (now() at time zone 'Europe/Berlin')::date)
  );
$$;
create or replace function abbate_private.is_staff(school uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(
    select 1 from public.abbate_memberships m where m.school_id=school and m.user_id=auth.uid()
      and m.role in ('trainer','admin') and m.access_status='active'
      and (m.access_until is null or m.access_until >= (now() at time zone 'Europe/Berlin')::date)
  );
$$;
create function abbate_private.is_admin(school uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(
    select 1 from public.abbate_memberships m where m.school_id=school and m.user_id=auth.uid()
      and m.role='admin' and m.access_status='active'
      and (m.access_until is null or m.access_until >= (now() at time zone 'Europe/Berlin')::date)
  );
$$;
revoke all on function abbate_private.has_active_access(uuid),abbate_private.is_admin(uuid) from public,anon;
grant execute on function abbate_private.has_active_access(uuid),abbate_private.is_admin(uuid) to authenticated;

drop policy course_read on public.abbate_courses;
create policy course_read on public.abbate_courses for select to authenticated
using (abbate_private.has_active_access(school_id));
drop policy completion_read on public.abbate_completions;
create policy completion_read on public.abbate_completions for select to authenticated
using (abbate_private.is_staff(school_id) or
  (participant_id=(select auth.uid()) and revoked_at is null and abbate_private.has_active_access(school_id)));
create policy membership_admin_access on public.abbate_memberships for update to authenticated
using (role='learner' and abbate_private.is_admin(school_id))
with check (role='learner' and abbate_private.is_admin(school_id));
grant update(access_status,access_until) on public.abbate_memberships to authenticated;
grant update(outcome) on public.abbate_completions to authenticated;

-- Registration's school and every authorization role come from trusted server configuration.
-- No user-supplied metadata is used for authorization.
create table abbate_private.registration_settings (
  singleton boolean primary key default true check(singleton),
  school_id uuid not null references public.abbate_schools(id)
);
create table abbate_private.account_audit (
  id bigint generated always as identity primary key,
  school_id uuid not null,
  actor_id uuid,
  target_id uuid not null,
  action text not null,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);
alter table abbate_private.registration_settings enable row level security;
alter table abbate_private.account_audit enable row level security;
revoke all on abbate_private.registration_settings,abbate_private.account_audit from public,anon,authenticated;
grant all on abbate_private.registration_settings,abbate_private.account_audit to service_role;
grant usage,select on sequence abbate_private.account_audit_id_seq to service_role;
create function abbate_private.register_learner() returns trigger
language plpgsql security definer set search_path='' as $$
declare school uuid;
begin
  select school_id into school from abbate_private.registration_settings where singleton;
  if school is null then raise exception 'App registration is not configured'; end if;
  insert into public.abbate_memberships(school_id,user_id,role,access_status)
    values(school,new.id,'learner','pending');
  insert into public.abbate_profiles(school_id,user_id,display_name,email)
    values(school,new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Neuer Teilnehmer'),120),new.email);
  insert into abbate_private.account_audit(school_id,actor_id,target_id,action)
    values(school,new.id,new.id,'registered_pending');
  return new;
end;
$$;
revoke all on function abbate_private.register_learner() from public,anon,authenticated;
create trigger abbate_register_learner after insert on auth.users
for each row execute function abbate_private.register_learner();
create function abbate_private.audit_account_change() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_table_name='abbate_memberships' then
    if (old.access_status,old.access_until) is distinct from (new.access_status,new.access_until) then
      insert into abbate_private.account_audit(school_id,actor_id,target_id,action,before_value,after_value)
      values(new.school_id,auth.uid(),new.user_id,'access_changed',
        jsonb_build_object('status',old.access_status,'until',old.access_until),
        jsonb_build_object('status',new.access_status,'until',new.access_until));
    end if;
  else
    if (old.outcome,old.revoked_at) is distinct from (new.outcome,new.revoked_at) then
      insert into abbate_private.account_audit(school_id,actor_id,target_id,action,before_value,after_value)
      values(new.school_id,auth.uid(),new.participant_id,'result_changed',
        jsonb_build_object('record',old.id,'outcome',old.outcome,'revoked_at',old.revoked_at),
        jsonb_build_object('record',new.id,'outcome',new.outcome,'revoked_at',new.revoked_at));
    end if;
  end if;
  return new;
end;
$$;
revoke all on function abbate_private.audit_account_change() from public,anon,authenticated;
create trigger abbate_audit_access after update on public.abbate_memberships
for each row execute function abbate_private.audit_account_change();
create trigger abbate_audit_result after update on public.abbate_completions
for each row execute function abbate_private.audit_account_change();

-- Live hardening, applied after schema.sql and accounts.sql.
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
