begin;
create or replace function abbate_private.exam_start(p_school uuid,p_course text,p_language text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a public.abbate_exam_attempts%rowtype; chosen jsonb; ids text[]; day_start timestamptz; day_end timestamptz; today_count integer;
begin
 if not abbate_private.has_active_access(p_school) or not exists(select 1 from public.abbate_memberships m where m.school_id=p_school and m.user_id=auth.uid() and m.role='learner') then raise exception 'Active learner access required' using errcode='42501'; end if;
 if p_course is null or p_course not in ('gabelstapler','hebebuehnen','krane','lasten','bagger','ladungssicherung','abseilen') or p_language is null or p_language !~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$' then raise exception 'Invalid exam'; end if;
 perform pg_advisory_xact_lock(hashtextextended('abbate-exam-day:'||auth.uid()::text,0));
 day_start:=((now() at time zone 'Europe/Berlin')::date::timestamp at time zone 'Europe/Berlin');
 day_end:=(((now() at time zone 'Europe/Berlin')::date+1)::timestamp at time zone 'Europe/Berlin');
 -- An attempt consumes the day at start, not only after submission.
 select * into a from public.abbate_exam_attempts where participant_id=auth.uid() and submitted_at is null and cancelled_at is null order by started_at desc limit 1 for update;
 if found then
   if a.school_id<>p_school or a.course<>p_course then raise exception 'EXAM_IN_PROGRESS'; end if;
   return jsonb_build_object('id',a.id,'course',a.course,'ids',a.question_ids,'started_at',a.started_at,'language',a.language);
 end if;
 select count(*) into today_count from public.abbate_exam_attempts
 where participant_id=auth.uid() and ((started_at>=day_start and started_at<day_end) or (submitted_at>=day_start and submitted_at<day_end));
 if today_count>0 then
   if today_count<>1 then raise exception 'DAILY_EXAM_LIMIT'; end if;
   select * into a from public.abbate_exam_attempts
    where participant_id=auth.uid() and school_id=p_school and course=p_course
    and started_at>=day_start and started_at<day_end and submitted_at is null and cancelled_at is null for update;
   if not found then raise exception 'DAILY_EXAM_LIMIT'; end if;
 else
   select jsonb_agg(x.content order by x.ord),array_agg(x.id order by x.ord) into chosen,ids
    from (select b.id,b.content,random() as ord from abbate_private.exam_bank b where b.course=p_course order by ord limit 20) x;
   if cardinality(ids) is distinct from 20 then raise exception 'Exam question pool unavailable'; end if;
   insert into public.abbate_exam_attempts(school_id,participant_id,course,language,question_ids)
    values(p_school,auth.uid(),p_course,p_language,ids) returning * into a;
   insert into abbate_private.exam_keys(attempt_id,questions) values(a.id,chosen);
 end if;
 return jsonb_build_object('id',a.id,'course',a.course,'ids',a.question_ids,'started_at',a.started_at,'language',a.language);
end; $$;


create or replace function abbate_private.exam_submit(p_attempt uuid,p_answers jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a public.abbate_exam_attempts%rowtype; key_data jsonb; scored jsonb; points integer;
begin
 perform pg_advisory_xact_lock(hashtextextended('abbate-exam-day:'||coalesce(auth.uid()::text,''),0));
 select * into a from public.abbate_exam_attempts where id=p_attempt and participant_id=auth.uid() for update;
 if not found or not abbate_private.has_active_access(a.school_id) or not exists(select 1 from public.abbate_memberships m where m.school_id=a.school_id and m.user_id=auth.uid() and m.role='learner') then raise exception 'Exam not available' using errcode='42501'; end if;
 if a.cancelled_at is not null then raise exception 'Exam cancelled'; end if;
 if a.submitted_at is not null then return to_jsonb(a); end if;

 if p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>10000 then raise exception 'Invalid answers'; end if;
 if exists(select 1 from jsonb_each(p_answers) x where not(x.key=any(a.question_ids)) or jsonb_typeof(x.value)<>'number' or x.value::text not in ('0','1','2')) then raise exception 'Invalid answers'; end if;
 select questions into key_data from abbate_private.exam_keys where attempt_id=a.id;
 if key_data is null or jsonb_array_length(key_data)<>20 then raise exception 'Exam key missing'; end if;
 select count(*) filter(where p_answers->(q->>'id')=q->'correct'),jsonb_agg(q||jsonb_build_object('selected',p_answers->(q->>'id')) order by ord)
 into points,scored from jsonb_array_elements(key_data) with ordinality as z(q,ord);
 update public.abbate_exam_attempts set answers=p_answers,details=scored,score=points,submitted_at=now() where id=a.id returning * into a;
 return to_jsonb(a);
end; $$;


create or replace function abbate_private.exam_cancel(p_attempt uuid) returns boolean language plpgsql security definer set search_path='' as $$begin raise exception 'EXAM_MUST_BE_COMPLETED' using errcode='42501'; end;$$;
revoke execute on function public.abbate_exam_cancel(uuid),abbate_private.exam_cancel(uuid) from public,anon,authenticated;
commit;