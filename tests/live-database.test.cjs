'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {readFileSync}=require('node:fs'),{PGlite}=require('@electric-sql/pglite');
test('live sessions, atomic records, suspension and account deletion work in PostgreSQL',async()=>{
 const db=new PGlite();
 const school='10000000-0000-0000-0000-000000000001';
 const admin='20000000-0000-0000-0000-000000000001',alice='20000000-0000-0000-0000-000000000002',bob='20000000-0000-0000-0000-000000000003';
 const sid=id=>id.replace('20000000','30000000');
 const as=async id=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';set request.jwt.claims='{"session_id":"${sid(id)}"}';`);
 try{
  await db.exec(`create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
  create table auth.sessions(id uuid primary key,user_id uuid references auth.users on delete cascade,created_at timestamptz default now(),not_after timestamptz);
  create role anon;create role authenticated;create role service_role bypassrls;grant usage on schema auth to authenticated;
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
  grant execute on function auth.uid(),auth.jwt() to authenticated;`);
  for(const name of ['schema','accounts','live'])await db.exec(readFileSync(`backend/${name}.sql`,'utf8'));
  await db.exec(`insert into abbate_schools values('${school}','Test school');insert into abbate_private.registration_settings values(true,'${school}');`);
  for(const id of [admin,alice,bob])await db.query("insert into auth.users(id,email) values($1,$2)",[id,id+'@example.test']);
  for(const id of [admin,alice,bob])await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid(id),id]);
  await db.exec(`update abbate_memberships set role='admin',access_status='active' where user_id='${admin}'`);
  await as(alice);
  assert.equal((await db.query('select access_status,role from abbate_memberships')).rows[0].access_status,'pending');
  await assert.rejects(db.query("select abbate_record_completion($1,$2,'Exam','exam','passed','2026-01-01')",[school,alice]),/Staff access/);
  await assert.rejects(db.query('insert into abbate_practice(user_id) values($1)',[alice]),/row-level/);
  await as(admin);await db.exec(`update abbate_memberships set access_status='active' where user_id in ('${alice}','${bob}')`);
  const record=(await db.query("select abbate_record_completion($1,$2,'Exam','exam','failed','2026-01-01') as id",[school,alice])).rows[0].id;
  await assert.rejects(db.query("select abbate_record_completion($1,$2,'Exam','exam','attended','2026-01-01')",[school,alice]),/Invalid completed/);
  await assert.rejects(db.query("select abbate_record_completion($1,$2,'Future','exam','passed','2099-01-01')",[school,alice]),/Invalid completed/);
  await as(alice);assert.equal((await db.query('select outcome from abbate_completions')).rows[0].outcome,'failed');
  await db.query('update abbate_completions set outcome=\'passed\' where id=$1',[record]);
  assert.equal((await db.query('select outcome from abbate_completions')).rows[0].outcome,'failed');
  await db.query('insert into abbate_practice(user_id,payload) values($1,$2)',[alice,{results:[],mastered:['check']}]);
  await as(bob);assert.equal((await db.query('select * from abbate_completions')).rows.length,0);
  assert.equal((await db.query('select * from abbate_practice')).rows.length,0);
  await assert.rejects(db.query('select abbate_delete_account($1)',[alice]),/Administrator access/);
  await as(admin);await db.query("update abbate_completions set outcome='passed' where id=$1",[record]);
  await db.exec(`update abbate_memberships set access_status='paused' where user_id='${alice}'`);
  await as(alice);assert.equal((await db.query('select * from abbate_completions')).rows.length,0);
  assert.equal((await db.query('select * from abbate_practice')).rows.length,0);
  await db.exec(`reset role;delete from auth.sessions where user_id='${alice}';`);await as(alice);
  assert.equal((await db.query('select * from abbate_memberships')).rows.length,0);
  await assert.rejects(db.query('select abbate_delete_account($1)',[alice]),/sign in again/);
  await db.exec(`reset role;insert into auth.sessions(id,user_id) values('${sid(alice)}','${alice}');`);await as(alice);
  // Paused learners retain the right to delete their own account.
  await db.query('select abbate_delete_account($1)',[alice]);
  await db.exec('reset role');
  for(const table of ['auth.users','auth.sessions','public.abbate_memberships','public.abbate_profiles','public.abbate_practice']){
   const key=table==='auth.users'?'id':'user_id';assert.equal((await db.query(`select * from ${table} where ${key}=$1`,[alice])).rows.length,0);
  }
  assert.equal((await db.query('select * from abbate_completions')).rows.length,0);
  await as(admin);await assert.rejects(db.query('select abbate_delete_account($1)',[admin]),/Only learner/);
  await db.query('select abbate_delete_account($1)',[bob]);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select abbate_delete_account($1)',[admin]),/permission denied/);
 }finally{await db.close();}
});
