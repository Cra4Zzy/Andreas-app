-- Abbate Lernraum: explicit, audited administrator role management.
-- No account is changed by applying this migration. Roles can change only
-- when an active administrator confirms a target account in the UI.
create or replace function public.abbate_manage_member_role(
  p_school uuid,
  p_target uuid,
  p_new_role text
)
returns table(role text, access_status text, access_until date)
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_before public.abbate_memberships%rowtype;
  v_after public.abbate_memberships%rowtype;
begin
  if auth.uid() is null
     or not abbate_private.live_session()
     or not abbate_private.is_admin(p_school) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;

  if p_target is null or p_target=auth.uid() then
    raise exception 'Administrators cannot change their own role' using errcode='42501';
  end if;
  if p_new_role is null or p_new_role not in ('admin','learner') then
    raise exception 'Unsupported account role' using errcode='22023';
  end if;

  select * into v_before
    from public.abbate_memberships
   where school_id=p_school and user_id=p_target
   for update;
  if not found then
    raise exception 'Account not found in this school' using errcode='P0002';
  end if;
  if v_before.role=p_new_role then
    raise exception 'Account already has this role' using errcode='22023';
  end if;
  if p_new_role='learner' and v_before.role<>'admin' then
    raise exception 'Only administrator rights can be removed here' using errcode='22023';
  end if;

  -- Admin role must not expire at the learner's paid-access expiry date.
  -- When admin rights are revoked, learner access must be approved separately.
  update public.abbate_memberships m
     set role=p_new_role,
         access_status=case when p_new_role='admin' then 'active' else 'pending' end,
         access_until=null
   where m.school_id=p_school and m.user_id=p_target
   returning m.* into v_after;

  insert into abbate_private.account_audit
    (school_id,actor_id,target_id,action,before_value,after_value)
  values
    (p_school,auth.uid(),p_target,'role_changed',
     jsonb_build_object('role',v_before.role,'status',v_before.access_status,'until',v_before.access_until),
     jsonb_build_object('role',v_after.role,'status',v_after.access_status,'until',v_after.access_until));

  return query select v_after.role,v_after.access_status,v_after.access_until;
end
$function$;
revoke all on function public.abbate_manage_member_role(uuid,uuid,text) from public,anon;
grant execute on function public.abbate_manage_member_role(uuid,uuid,text) to authenticated;
comment on function public.abbate_manage_member_role(uuid,uuid,text)
  is 'Live-session-only administrator role promotion and revocation, restricted to same-school accounts and audited.';
