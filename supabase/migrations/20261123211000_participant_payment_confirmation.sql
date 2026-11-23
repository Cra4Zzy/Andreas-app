-- Abbate Lernraum: payment confirmation is independent from the 30-day learning access.
-- Existing participants start as "open"; neither access status nor expiry is modified.
alter table public.abbate_memberships
  add column if not exists payment_status text not null default 'open',
  add column if not exists payment_reported_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by uuid;

alter table public.abbate_memberships
  add constraint abbate_memberships_payment_status_check
  check (payment_status in ('open','reported','confirmed'));

comment on column public.abbate_memberships.payment_status is
  'open = not reported, reported = learner claims to have paid, confirmed = verified by an administrator. Independent from access_status.';

-- No direct client UPDATE grants on these columns. All transitions are validated and audited server-side.
create or replace function public.abbate_manage_payment(
  p_school uuid, p_participant uuid, p_action text
)
returns table(payment_status text, payment_reported_at timestamptz, payment_confirmed_at timestamptz)
language plpgsql security definer
set search_path = ''
as $function$
declare
  v_before public.abbate_memberships%rowtype;
  v_status text;
  v_reported timestamptz;
  v_confirmed timestamptz;
  v_confirmer uuid;
begin
  if auth.uid() is null or not abbate_private.live_session() then
    raise exception 'Please sign in again' using errcode='42501';
  end if;
  if p_action is null or p_action not in ('report','confirm','reopen') then
    raise exception 'Unsupported payment action' using errcode='22023';
  end if;
  if p_action='report' and p_participant is distinct from auth.uid() then
    raise exception 'Only the participant may report a payment' using errcode='42501';
  end if;
  if p_action in ('confirm','reopen') and not abbate_private.is_admin(p_school) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;

  select m.* into v_before from public.abbate_memberships m
    where m.school_id=p_school and m.user_id=p_participant and m.role='learner'
    for update;
  if not found then
    raise exception 'Learner not found' using errcode='P0002';
  end if;

  v_status := v_before.payment_status;
  v_reported := v_before.payment_reported_at;
  v_confirmed := v_before.payment_confirmed_at;
  v_confirmer := v_before.payment_confirmed_by;

  if p_action='report' then
    if v_status<>'open' then
      raise exception 'Payment already reported or confirmed' using errcode='22023';
    end if;
    v_status := 'reported';
    v_reported := clock_timestamp();
    v_confirmed := null;
    v_confirmer := null;
  elsif p_action='confirm' then
    if v_status='confirmed' then
      raise exception 'Payment already confirmed' using errcode='22023';
    end if;
    v_status := 'confirmed';
    v_confirmed := clock_timestamp();
    v_confirmer := auth.uid();
  else
    if v_status='open' then
      raise exception 'Payment status already open' using errcode='22023';
    end if;
    v_status := 'open';
    v_reported := null;
    v_confirmed := null;
    v_confirmer := null;
  end if;

  update public.abbate_memberships m set
    payment_status=v_status,
    payment_reported_at=v_reported,
    payment_confirmed_at=v_confirmed,
    payment_confirmed_by=v_confirmer
    where m.school_id=p_school and m.user_id=p_participant;

  insert into abbate_private.account_audit
    (school_id,actor_id,target_id,action,before_value,after_value)
  values (p_school,auth.uid(),p_participant,'payment_' || p_action || 'ed',
    jsonb_build_object('status',v_before.payment_status,
      'reported_at',v_before.payment_reported_at,
      'confirmed_at',v_before.payment_confirmed_at),
    jsonb_build_object('status',v_status,
      'reported_at',v_reported,'confirmed_at',v_confirmed));

  return query select v_status,v_reported,v_confirmed;
end
$function$;
revoke all on function public.abbate_manage_payment(uuid,uuid,text) from public,anon;
grant execute on function public.abbate_manage_payment(uuid,uuid,text) to authenticated;
comment on function public.abbate_manage_payment(uuid,uuid,text)
is 'Learners may report their own payment; active administrators may confirm/reopen same-school learner payments. All changes are audited. Access is unchanged.';
