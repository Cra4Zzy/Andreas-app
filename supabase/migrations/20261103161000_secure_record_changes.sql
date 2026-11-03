-- Abbate: only server-authorized and audited corrections to real school records.
-- No browser UPDATE privilege is granted on abbate_completions.
create or replace function public.abbate_change_record(
 p_school uuid,
 p_record uuid,
 p_action text,
 p_outcome text default null
)
returns void
language plpgsql
security definer
set search_path=''
as $function$
declare v_record public.abbate_completions%rowtype;
begin
 if auth.uid() is null
    or not abbate_private.live_session()
    or not abbate_private.is_staff(p_school) then
   raise exception 'Staff access required' using errcode='42501';
 end if;

 if p_action not in ('correct_outcome','revoke') or p_action is null then
   raise exception 'Unsupported record action' using errcode='22023';
 end if;

 select c.* into v_record
 from public.abbate_completions c
 where c.school_id=p_school and c.id=p_record
 for update;
 if not found or v_record.revoked_at is not null then
   raise exception 'Record unavailable' using errcode='P0002';
 end if;

 if p_action='correct_outcome' then
   if p_outcome is null or p_outcome not in ('attended','passed','failed')
     or (v_record.kind='exam' and p_outcome='attended') then
     raise exception 'Invalid outcome' using errcode='22023';
   end if;
   update public.abbate_completions c set outcome=p_outcome
     where c.school_id=p_school and c.id=p_record;
 else
   update public.abbate_completions c set revoked_at=current_timestamp
     where c.school_id=p_school and c.id=p_record;
 end if;
 -- The existing AFTER UPDATE trigger records actor, before/after and target.
end
$function$;
revoke all on function public.abbate_change_record(uuid,uuid,text,text) from public;
revoke all on function public.abbate_change_record(uuid,uuid,text,text) from anon;
grant execute on function public.abbate_change_record(uuid,uuid,text,text) to authenticated;
comment on function public.abbate_change_record(uuid,uuid,text,text) is
'Authenticated school staff may correct only outcome or revoke a school record, logged by existing audit trigger.';
