-- Abbate Lernraum: a paid, manually approved 30-calendar-day access block.
-- The free registration itself does not create a paid booking.
-- "30 days" means activation day + following 29 days (Berlin dates).
-- No invoices, auto-renewal, recurring payments or automatic extension are created.
-- No existing rows are modified by this migration.

create or replace function public.abbate_manage_access(
  p_school uuid,
  p_participant uuid,
  p_action text
)
returns table(access_status text, access_until date)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_before public.abbate_memberships%rowtype;
  v_today date := (current_timestamp at time zone 'Europe/Berlin')::date;
  v_status text;
  v_until date;
begin
  if auth.uid() is null
    or not abbate_private.live_session()
    or not abbate_private.is_admin(p_school) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;

  if p_action is null or p_action not in ('activate','extend','resume','pause') then
    raise exception 'Unsupported access action' using errcode='22023';
  end if;

  select m.* into v_before
    from public.abbate_memberships m
    where m.school_id=p_school
      and m.user_id=p_participant
      and m.role='learner'
    for update;

  if not found then
    raise exception 'Learner not found' using errcode='P0002';
  end if;

  v_status := v_before.access_status;
  v_until := v_before.access_until;

  if p_action='activate' then
    if v_before.access_status='active' and
       (v_before.access_until is null or v_before.access_until>=v_today) then
      raise exception 'Access is already active: use extend after payment' using errcode='22023';
    end if;
    if v_before.access_status='paused' and
       v_before.access_until is not null and v_before.access_until>=v_today then
      raise exception 'Paused access is still valid: use resume or extend' using errcode='22023';
    end if;
    v_status := 'active';
    v_until := v_today+29;

  elsif p_action='extend' then
    if v_before.access_status not in ('active','paused')
       or v_before.access_until is null
       or v_before.access_until<v_today then
      raise exception 'Only a still-valid paid access can be extended' using errcode='22023';
    end if;
    v_status := 'active';
    -- Preserve the remainder of the already paid block.
    v_until := v_before.access_until+30;

  elsif p_action='resume' then
    if v_before.access_status<>'paused'
       or v_before.access_until is null
       or v_before.access_until<v_today then
      raise exception 'No valid paused access remains' using errcode='22023';
    end if;
    v_status := 'active';

  elsif p_action='pause' then
    if v_before.access_status not in ('active','paused') then
      raise exception 'Only an active access may be paused' using errcode='22023';
    end if;
    v_status := 'paused';
    -- A pause does not stop or extend the paid period.
  end if;

  update public.abbate_memberships m
    set access_status=v_status, access_until=v_until
    where m.school_id=p_school
      and m.user_id=p_participant
      and m.role='learner';

  -- Existing abbate_audit_access trigger logs the change and actor.
  return query select v_status,v_until;
end
$function$;

revoke all on function public.abbate_manage_access(uuid,uuid,text) from public;
revoke all on function public.abbate_manage_access(uuid,uuid,text) from anon;
grant execute on function public.abbate_manage_access(uuid,uuid,text) to authenticated;

comment on function public.abbate_manage_access(uuid,uuid,text)
is 'Administrator-only, audited manual 30-day activation or extension. No automated billing or auto-renewal.';
