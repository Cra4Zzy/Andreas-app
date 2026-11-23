-- Abbate Lernraum: optional company attribution on user profiles.
-- Existing profiles remain unchanged (company NULL); no role or access changes.
alter table public.abbate_profiles
  add column if not exists company text;
alter table public.abbate_profiles
  add constraint abbate_profiles_company_length
  check (company is null or (char_length(company) between 1 and 120));

comment on column public.abbate_profiles.company is
  'Optional employer/company as provided by the participant or their school administrator.';

-- Retain existing trusted registration school lookup, role and audit logic.
create or replace function abbate_private.register_learner()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare school uuid;
begin
  select school_id into school from abbate_private.registration_settings where singleton;
  if school is null then raise exception 'App registration is not configured'; end if;
  insert into public.abbate_memberships(school_id,user_id,role,access_status)
    values(school,new.id,'learner','pending');
  insert into public.abbate_profiles(school_id,user_id,display_name,email,company)
    values(school,new.id,
      left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Neuer Teilnehmer'),120),
      new.email,
      left(nullif(btrim(new.raw_user_meta_data->>'company'),''),120));
  insert into abbate_private.account_audit(school_id,actor_id,target_id,action)
    values(school,new.id,new.id,'registered_pending');
  return new;
end;
$function$;
revoke all on function abbate_private.register_learner() from public,anon,authenticated;

-- Only a participant themselves or an active administrator of their school
-- can update a learner's company. Do not grant direct UPDATE on profiles.
create or replace function public.abbate_set_participant_company(
  p_target uuid, p_company text
)
returns text
language plpgsql security definer set search_path=''
as $function$
declare
  v_school uuid;
  v_before text;
  v_company text := nullif(btrim(coalesce(p_company,'')),'');
begin
  if auth.uid() is null or not abbate_private.live_session() then
    raise exception 'Please sign in again' using errcode='42501';
  end if;
  if v_company is not null and char_length(v_company)>120 then
    raise exception 'Company name too long' using errcode='22023';
  end if;
  select p.school_id,p.company into v_school,v_before
    from public.abbate_profiles p
    join public.abbate_memberships m on m.school_id=p.school_id and m.user_id=p.user_id
    where p.user_id=p_target and m.role='learner'
      and (p.user_id=auth.uid() or abbate_private.is_admin(p.school_id))
    for update of p;
  if not found then
    raise exception 'Learner not found or not authorized' using errcode='42501';
  end if;
  if v_before is distinct from v_company then
    update public.abbate_profiles set company=v_company
      where school_id=v_school and user_id=p_target;
    insert into abbate_private.account_audit
      (school_id,actor_id,target_id,action,before_value,after_value)
      values(v_school,auth.uid(),p_target,'company_changed',
        jsonb_build_object('company',v_before),
        jsonb_build_object('company',v_company));
  end if;
  return v_company;
end;
$function$;
revoke all on function public.abbate_set_participant_company(uuid,text) from public,anon;
grant execute on function public.abbate_set_participant_company(uuid,text) to authenticated;
comment on function public.abbate_set_participant_company(uuid,text) is
  'Authenticated learner self-edit or same-school active administrator correction, with audit. No direct table update grant.';
