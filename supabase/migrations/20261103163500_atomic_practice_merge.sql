-- Abbate: protect practice progress from lost updates across tabs/devices.
-- Practice scores are PERSONAL EXERCISES only, never a binding examination result.
-- The client no longer receives direct write privileges to the practice table.
create or replace function public.abbate_merge_practice(p_payload jsonb)
returns jsonb
language plpgsql security definer
set search_path=''
as $function$
declare
 v_current jsonb;
 v_results jsonb;
 v_mastered jsonb;
 v_incoming jsonb;
 v_result jsonb;
 v_topic jsonb;
begin
 if auth.uid() is null
   or not abbate_private.live_session()
   or not exists(
     select 1 from public.abbate_memberships m
     where m.user_id=auth.uid()
       and abbate_private.has_active_access(m.school_id)
   ) then
   raise exception 'Active learning access required' using errcode='42501';
 end if;
 if p_payload is null or jsonb_typeof(p_payload)<>'object'
   or pg_column_size(p_payload)>262144 then
   raise exception 'Invalid practice payload' using errcode='22023';
 end if;
 v_incoming := coalesce(p_payload->'results','[]'::jsonb);
 v_topic := coalesce(p_payload->'mastered','[]'::jsonb);
 if jsonb_typeof(v_incoming)<>'array'
   or jsonb_typeof(v_topic)<>'array'
   or jsonb_array_length(v_incoming)>100
   or jsonb_array_length(v_topic)>300 then
   raise exception 'Invalid practice data' using errcode='22023';
 end if;

 insert into public.abbate_practice(user_id,payload)
 values(auth.uid(),'{"results":[],"mastered":[]}'::jsonb)
 on conflict (user_id) do nothing;

 select payload into v_current from public.abbate_practice
 where user_id=auth.uid() for update;
 v_results := coalesce(v_current->'results','[]'::jsonb);
 v_mastered := coalesce(v_current->'mastered','[]'::jsonb);
 if jsonb_typeof(v_results)<>'array' then v_results:='[]'::jsonb; end if;
 if jsonb_typeof(v_mastered)<>'array' then v_mastered:='[]'::jsonb; end if;

 for v_result in select value from jsonb_array_elements(v_incoming)
 loop
   if jsonb_typeof(v_result)<>'object'
      or jsonb_typeof(v_result->'id')<>'string'
      or length(v_result->>'id') not between 1 and 80
      or jsonb_typeof(v_result->'at')<>'string'
      or length(v_result->>'at')>64 then
     raise exception 'Invalid round data' using errcode='22023';
   end if;
   if not exists(
      select 1 from jsonb_array_elements(v_results) e
      where e->>'id'=v_result->>'id'
   ) then
     v_results:=v_results||jsonb_build_array(v_result);
   end if;
 end loop;

 -- Keep the newest 100 exercise rounds regardless of arrival order.
 select coalesce(jsonb_agg(value order by value->>'at', value->>'id'),'[]'::jsonb)
 into v_results
 from (
   select value from jsonb_array_elements(v_results) e(value)
   order by value->>'at' desc, value->>'id' desc limit 100
 ) latest;

 for v_topic in select value from jsonb_array_elements(v_topic)
 loop
   if jsonb_typeof(v_topic)<>'string' or length(v_topic #>> '{}') not between 1 and 80 then
     raise exception 'Invalid mastered topic' using errcode='22023';
   end if;
   if not (v_mastered ? (v_topic #>> '{}')) then
     v_mastered:=v_mastered||jsonb_build_array(v_topic);
   end if;
 end loop;

 v_current:=jsonb_build_object('results',v_results,'mastered',v_mastered);
 if pg_column_size(v_current)>262144 then
   raise exception 'Practice data too large' using errcode='22023';
 end if;
 update public.abbate_practice
   set payload=v_current,updated_at=current_timestamp where user_id=auth.uid();
 return v_current;
end
$function$;
revoke all on function public.abbate_merge_practice(jsonb) from public,anon;
grant execute on function public.abbate_merge_practice(jsonb) to authenticated;
revoke insert, update, delete on public.abbate_practice from authenticated;
comment on function public.abbate_merge_practice(jsonb)
is 'Atomic union of unofficial practice rounds and mastered questions, preventing stale concurrent writes.';
