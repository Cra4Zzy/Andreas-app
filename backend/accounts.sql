-- Account extension for backend/schema.sql. Deployed through the combined migration.
-- Apply only to this app's database, after configuring the registration school.
begin;
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
commit;
