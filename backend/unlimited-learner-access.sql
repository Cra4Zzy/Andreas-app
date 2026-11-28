-- Reviewed rollout candidate; apply as a tracked migration before deploying the matching frontend.
-- All existing learner dates are removed; explicit pauses are retained.
-- Payment and learning records are deliberately untouched.
begin;
create or replace function abbate_private.register_learner()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare school uuid;
begin
  select school_id into school from abbate_private.registration_settings where singleton;
  if school is null then raise exception 'App registration is not configured'; end if;
  insert into public.abbate_memberships(school_id,user_id,role,access_status)
    values(school,new.id,'learner','active');
  insert into public.abbate_profiles(school_id,user_id,display_name,email,company)
    values(school,new.id,
      left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Neuer Teilnehmer'),120),
      new.email,
      left(nullif(btrim(new.raw_user_meta_data->>'company'),''),120));
  insert into abbate_private.account_audit(school_id,actor_id,target_id,action)
    values(school,new.id,new.id,'registered_active');
  return new;
end;
$function$;
revoke all on function abbate_private.register_learner() from public,anon,authenticated;


create or replace function public.abbate_manage_access(
 p_school uuid, p_participant uuid, p_action text
)
returns table(access_status text, access_until date)
language plpgsql security definer set search_path=''
as $function$
declare
 v_before public.abbate_memberships%rowtype;
 v_status text;
begin
 if auth.uid() is null or not abbate_private.live_session()
    or not abbate_private.is_admin(p_school) then
   raise exception 'Administrator access required' using errcode='42501';
 end if;
 if p_action is null or p_action not in ('activate','extend','resume','pause') then
   raise exception 'Unsupported access action' using errcode='22023';
 end if;
 select m.* into v_before from public.abbate_memberships m
 where m.school_id=p_school and m.user_id=p_participant and m.role='learner' for update;
 if not found then raise exception 'Learner not found' using errcode='P0002'; end if;
 -- Older clients may still send extend: do not silently unlock a paused user.
 if p_action='extend' then
   v_status := v_before.access_status;
 elsif p_action='pause' then
   v_status := 'paused';
 else
   v_status := 'active';
 end if;
 update public.abbate_memberships m set access_status=v_status,access_until=null
 where m.school_id=p_school and m.user_id=p_participant and m.role='learner';
 return query select v_status,null::date;
end
$function$;
revoke all on function public.abbate_manage_access(uuid,uuid,text) from public,anon;
grant execute on function public.abbate_manage_access(uuid,uuid,text) to authenticated;
comment on function public.abbate_manage_access(uuid,uuid,text)
is 'Administrator-only audited pause and restore of unlimited learner access; payment independent.';

-- Pending accounts created by deliberate admin demotion remain blocked.
update public.abbate_memberships m
set access_status=case
 when m.access_status='paused' then 'paused'
 when m.access_status='pending' and exists(
   select 1 from abbate_private.account_audit a
   where a.school_id=m.school_id and a.target_id=m.user_id
   and a.action='role_changed' and a.after_value->>'role'='learner'
 ) then 'paused'
 else 'active' end,
 access_until=null
where m.role='learner' and (m.access_until is not null or m.access_status='pending');
-- Keep the existing live-session/RLS/role checks and existing deliberate staff restrictions.
-- Version the revised terms without overwriting earlier acknowledgements.
-- Keep existing acknowledgements valid: this rollout removes a restriction.
-- During the frontend rollout both supported versions can still be acknowledged.
create or replace function abbate_private.capture_signup_terms()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
begin
  if new.raw_user_meta_data->>'abbate_terms_version' in ('2026-11-02','2026-11-28')
     and new.raw_user_meta_data->>'abbate_terms_accepted'='true' then
    insert into abbate_private.terms_acceptances(user_id,terms_version,source)
    values(new.id,new.raw_user_meta_data->>'abbate_terms_version','signup')
    on conflict (user_id,terms_version) do nothing;
  end if;
  return new;
end
$fn$;

create or replace function public.abbate_terms_accepted()
returns boolean
language sql
stable security definer
set search_path=''
as $fn$
  select auth.uid() is not null
    and abbate_private.live_session()
    and exists (
      select 1 from abbate_private.terms_acceptances t
      where t.user_id=auth.uid() and t.terms_version in ('2026-11-02','2026-11-28')
    );
$fn$;

create or replace function public.abbate_accept_terms(p_version text)
returns void
language plpgsql
security definer
set search_path=''
as $fn$
begin
  if auth.uid() is null or not abbate_private.live_session()
     or p_version is null or p_version not in ('2026-11-02','2026-11-28') then
    raise exception 'Valid login and current AGB version required' using errcode='42501';
  end if;
  insert into abbate_private.terms_acceptances(user_id,terms_version,source)
  values(auth.uid(),p_version,'account')
  on conflict (user_id,terms_version) do nothing;
end
$fn$;
revoke all on function public.abbate_terms_accepted() from public,anon;
revoke all on function public.abbate_accept_terms(text) from public,anon;
grant execute on function public.abbate_terms_accepted() to authenticated;
grant execute on function public.abbate_accept_terms(text) to authenticated;
comment on table abbate_private.terms_acceptances is
'Versioned acknowledgment of Abbate AGB. Does not represent GDPR marketing consent.';

commit;
