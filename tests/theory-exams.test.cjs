'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const vm=require('node:vm');
test('exam bank matches every current question and server picks an isolated course',()=>{
 const scope={};for(const f of ['practice-bank.js','practice-expansion.js','practice-expansion-final.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),scope);
 const sql=fs.readFileSync('backend/theory-exams.sql','utf8');
 const bank=JSON.parse(sql.split('$exam_bank$')[1]),qs=scope.ABBATE_PRACTICE_BANK.questions;
 assert.equal(bank.length,350);assert.equal(qs.length,350);const map=new Map(bank.map(q=>[q.id,q]));
 for(const q of qs){const b=map.get(q.id);assert.equal(b.course,q.course);assert.equal(b.correct,q.correct);assert.deepEqual(b.answers,Array.from(q.answers));assert.equal(b.title,q.title);}
});
test('actual PostgreSQL exam start, scoring, retry, staff review and isolation',async()=>{
 const db=new PGlite();
 const school='10000000-0000-0000-0000-000000000001',otherSchool='10000000-0000-0000-0000-000000000002';
 const admin='20000000-0000-0000-0000-000000000001',alice='20000000-0000-0000-0000-000000000002',bob='20000000-0000-0000-0000-000000000003',foreign='20000000-0000-0000-0000-000000000004';
 const sid=id=>id.replace('20000000','30000000');
 const as=async id=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';set request.jwt.claims='{"session_id":"${sid(id)}"}';`);
 const value=async(q,p=[]) => (await db.query(q,p)).rows[0].result;
 try{
  await db.exec(`create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');create table auth.sessions(id uuid primary key,user_id uuid references auth.users on delete cascade,created_at timestamptz default now(),not_after timestamptz);create role anon;create role authenticated;create role service_role bypassrls;grant usage on schema auth to authenticated;
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
  grant execute on function auth.uid(),auth.jwt() to authenticated;`);
  for(const name of ['schema','accounts','live','theory-exams','guest-theory-exams','account-only-theory-exams','mandatory-exam-completion'])await db.exec(fs.readFileSync('backend/'+name+'.sql','utf8'));
  await db.exec(`insert into abbate_schools values('${school}','Test'),('${otherSchool}','Other');insert into abbate_private.registration_settings values(true,'${school}');`);
  for(const id of [admin,alice,bob,foreign]){await db.query('insert into auth.users(id,email) values($1,$2)',[id,id+'@example.invalid']);await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid(id),id]);}
  await db.exec(`update abbate_memberships set role='admin',access_status='active' where user_id='${admin}';update abbate_memberships set access_status='active',access_until='2099-01-01' where user_id in ('${alice}','${bob}');insert into abbate_memberships(school_id,user_id,role,access_status) values('${otherSchool}','${foreign}','admin','active');`);
  const keys=new Map(JSON.parse(fs.readFileSync('backend/theory-exams.sql','utf8').split('$exam_bank$')[1]).map(q=>[q.id,q]));
  await as(alice);const start=()=>value("select abbate_exam_start($1,'abseilen','de') as result",[school]);
  const a=await start();assert.equal(a.ids.length,20);assert.equal(new Set(a.ids).size,20);assert.ok(a.ids.every(id=>keys.get(id).course==='abseilen'));assert.equal((await start()).id,a.id);
  assert.deepEqual(Object.keys(a).sort(),['course','id','ids','language','started_at']);
  await assert.rejects(value("select abbate_exam_start($1,'krane','de') as result",[school]),/EXAM_IN_PROGRESS/);
  await assert.rejects(value('select abbate_exam_cancel($1) as result',[a.id]),/permission denied/i);
  await assert.rejects(db.query('select * from abbate_private.exam_keys'),/permission denied/i);
  await assert.rejects(db.query('select * from abbate_private.exam_bank'),/permission denied/i);
  await assert.rejects(value('select abbate_exam_submit($1,$2::jsonb) as result',[a.id,JSON.stringify({fake:0})]),/Invalid answers/);
  const answers=Object.fromEntries(a.ids.slice(0,15).map(id=>[id,keys.get(id).correct]));
  const result=await value('select abbate_exam_submit($1,$2::jsonb) as result',[a.id,JSON.stringify(answers)]);
  assert.equal(result.score,15);assert.equal(result.total,20);assert.equal(result.review,'pending');assert.equal(result.details.length,20);assert.equal(result.details.filter(x=>x.selected===null).length,5);
  const retry=await value('select abbate_exam_submit($1,$2::jsonb) as result',[a.id,'{}']);assert.equal(retry.score,15);assert.equal(retry.submitted_at,result.submitted_at);
  await assert.rejects(db.query("update public.abbate_exam_attempts set score=20"),/permission denied/i);
  await assert.rejects(value("select abbate_exam_review($1,'passed') as result",[a.id]),/Staff access/);
  await assert.rejects(start(),/DAILY_EXAM_LIMIT/);
  await assert.rejects(value("select abbate_exam_start($1,'gabelstapler','de') as result",[school]),/DAILY_EXAM_LIMIT/);
  await as(bob);assert.equal((await db.query('select * from abbate_exam_attempts')).rows.length,0);await assert.rejects(value('select abbate_exam_submit($1,$2::jsonb) as result',[a.id,'{}']),/not available/);
  await as(foreign);assert.equal((await db.query('select * from abbate_exam_attempts')).rows.length,0);await assert.rejects(value("select abbate_exam_review($1,'failed') as result",[a.id]),/Staff access/);
  await as(admin);assert.equal((await db.query('select * from abbate_exam_attempts where submitted_at is not null')).rows.length,1);const assessed=await value("select abbate_exam_review($1,'passed') as result",[a.id]);assert.equal(assessed.review,'passed');assert.equal(assessed.score,15);assert.equal(assessed.reviewed_by,admin);
  assert.equal((await db.query('select * from abbate_completions')).rows.length,0,'no automatic qualification');
  await as(alice);assert.equal((await db.query('select review from abbate_exam_attempts where id=$1',[a.id])).rows[0].review,'passed');
  await db.exec('reset role');assert.equal((await db.query('select * from abbate_private.exam_reviews')).rows.length,1);
  await db.exec("delete from auth.sessions where user_id='"+alice+"'");await as(alice);await assert.rejects(start(),/Active learner access required/);assert.equal((await db.query('select * from abbate_exam_attempts')).rows.length,0);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from abbate_exam_attempts'),/permission denied/i);
 }finally{await db.close();}
});
test('frontend separates immutable examination submissions from adaptive learning and provides staff archive',()=>{
 const a=fs.readFileSync('dist/app.js','utf8'),b=fs.readFileSync('dist/backend.js','utf8'),p=fs.readFileSync('dist/portal.js','utf8');
 assert.match(a,/await B\.startExam\(course,selectedLanguage\)/);assert.match(a,/await B\.submitExam\(run\.attemptId/);assert.match(a,/mode:'official-exam'/);
 assert.match(a,/run\.mode==='learn'\)\{/);assert.match(a,/Früheres Prüfungstraining \(Übung\)/);
 assert.match(b,/abbate_exam_attempts/);assert.match(b,/abbate_exam_submit/);assert.match(b,/abbate_exam_review/);
 assert.match(p,/data-exam-overview-open/);assert.match(p,/data-exam-detail/);assert.match(p,/data-exam-review/);
});
