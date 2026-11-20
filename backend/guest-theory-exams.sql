begin;
alter table public.abbate_exam_attempts alter column participant_id drop not null;
alter table public.abbate_exam_attempts add column guest_name text;
alter table public.abbate_exam_attempts add constraint abbate_exam_identity check(
 (participant_id is not null and guest_name is null) or
 (participant_id is null and guest_name is not null and char_length(guest_name) between 2 and 120));
create table abbate_private.guest_exam_tokens(
 attempt_id uuid primary key references public.abbate_exam_attempts(id) on delete cascade,
 token_hash bytea not null
);
create table abbate_private.guest_exam_rate(
 bucket bytea not null, hour timestamptz not null, starts integer not null,
 primary key(bucket,hour)
);
alter table abbate_private.guest_exam_tokens enable row level security;
alter table abbate_private.guest_exam_rate enable row level security;
revoke all on abbate_private.guest_exam_tokens,abbate_private.guest_exam_rate from public,anon,authenticated;
create function public.abbate_guest_exam_start(p_name text,p_course text,p_language text,p_bucket text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare school uuid; a public.abbate_exam_attempts%rowtype; chosen jsonb; ids text[]; token text; n integer;
begin
 if p_name is null or char_length(btrim(p_name)) not between 2 and 120 or p_name ~ '[[:cntrl:]]' then raise exception 'Invalid name'; end if;
 if p_course is null or p_course not in ('gabelstapler','hebebuehnen','krane','lasten','bagger','ladungssicherung','abseilen') or p_language is null or p_language !~ '^[a-z]{2,3}$' then raise exception 'Invalid course'; end if;
 if p_bucket is null or char_length(p_bucket)>512 then raise exception 'Invalid rate key'; end if;
 select school_id into school from abbate_private.registration_settings where singleton;
 if school is null then raise exception 'School unavailable'; end if;
 insert into abbate_private.guest_exam_rate(bucket,hour,starts)
 values(sha256(convert_to(p_bucket,'UTF8')),date_trunc('hour',now()),1)
 on conflict(bucket,hour) do update set starts=guest_exam_rate.starts+1 returning starts into n;
 if n>60 then raise exception 'Too many attempts'; end if;
 delete from abbate_private.guest_exam_rate where hour<now()-interval '2 days';
 select jsonb_agg(x.content order by x.ord),array_agg(x.id order by x.ord) into chosen,ids
 from (select b.id,b.content,random() ord from abbate_private.exam_bank b where b.course=p_course order by ord limit 20) x;
 if cardinality(ids) is distinct from 20 then raise exception 'Question pool unavailable'; end if;
 token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
 insert into public.abbate_exam_attempts(school_id,guest_name,course,language,question_ids)
 values(school,btrim(p_name),p_course,p_language,ids) returning * into a;
 insert into abbate_private.exam_keys(attempt_id,questions) values(a.id,chosen);
 insert into abbate_private.guest_exam_tokens(attempt_id,token_hash) values(a.id,sha256(convert_to(token,'UTF8')));
 return jsonb_build_object('id',a.id,'token',token,'course',a.course,'name',a.guest_name,'language',a.language,'questions',(select jsonb_agg(q-'correct' order by ord) from jsonb_array_elements(chosen) with ordinality z(q,ord)));
end; $$;
create function public.abbate_guest_exam_submit(p_attempt uuid,p_token text,p_answers jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.abbate_exam_attempts%rowtype; key_data jsonb; scored jsonb; points integer;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Exam not available'; end if;
 select x.* into a from public.abbate_exam_attempts x join abbate_private.guest_exam_tokens t on t.attempt_id=x.id
 where x.id=p_attempt and x.participant_id is null and t.token_hash=sha256(convert_to(p_token,'UTF8')) for update of x;
 if not found or a.cancelled_at is not null then raise exception 'Exam not available'; end if;
 if a.submitted_at is null then
 if a.started_at<now()-interval '7 days' then raise exception 'Exam expired'; end if;
 if p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>10000 then raise exception 'Invalid answers'; end if;
 if exists(select 1 from jsonb_each(p_answers) x where not(x.key=any(a.question_ids)) or jsonb_typeof(x.value)<>'number' or x.value::text not in ('0','1','2')) then raise exception 'Invalid answers'; end if;
 select questions into key_data from abbate_private.exam_keys where attempt_id=a.id;
 if key_data is null or jsonb_array_length(key_data)<>20 then raise exception 'Exam key missing'; end if;
 select count(*) filter(where p_answers->(q->>'id')=q->'correct'),jsonb_agg(q||jsonb_build_object('selected',p_answers->(q->>'id')) order by ord)
 into points,scored from jsonb_array_elements(key_data) with ordinality z(q,ord);
 update public.abbate_exam_attempts set answers=p_answers,details=scored,score=points,submitted_at=now() where id=a.id returning * into a;
 end if;
 return jsonb_build_object('id',a.id,'course',a.course,'name',a.guest_name,'score',a.score,'total',a.total,'submitted_at',a.submitted_at,'review',a.review);
end; $$;
revoke all on function public.abbate_guest_exam_start(text,text,text,text),public.abbate_guest_exam_submit(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.abbate_guest_exam_start(text,text,text,text),public.abbate_guest_exam_submit(uuid,text,jsonb) to service_role;
commit;