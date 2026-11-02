const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('database denies forged completions and isolates schools and learners',async()=>{
  const db=new PGlite();
  const s1='10000000-0000-0000-0000-000000000001', s2='10000000-0000-0000-0000-000000000002';
  const a='20000000-0000-0000-0000-000000000001', b='20000000-0000-0000-0000-000000000002', trainer='20000000-0000-0000-0000-000000000003', other='20000000-0000-0000-0000-000000000004';
  const course='30000000-0000-0000-0000-000000000001', course2='30000000-0000-0000-0000-000000000002';
  try{
    await db.exec(`create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema auth to authenticated; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant execute on function auth.uid() to authenticated;`);
    await db.exec(readFileSync('backend/schema.sql','utf8'));
    await db.exec(`insert into auth.users values('${a}'),('${b}'),('${trainer}'),('${other}'); insert into abbate_schools values('${s1}','A'),('${s2}','B'); insert into abbate_memberships values('${s1}','${a}','learner'),('${s1}','${b}','learner'),('${s1}','${trainer}','trainer'),('${s2}','${other}','learner'); insert into abbate_courses values('${course}','${s1}','Stapler','1'),('${course2}','${s2}','Andere Schule','1');`);
    const issue=(person,school=s1,c=course,issuer=trainer)=>`insert into public.abbate_completions(school_id,participant_id,course_id,course_version,kind,completed_at,issued_by,reference) values('${school}','${person}','${c}','1','training','2026-10-01','${issuer}','TEST')`;
    await db.exec(issue(a));await db.exec(issue(b));
    const act=async id=>db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${id}';`);
    await act(a);
    assert.equal((await db.query('select * from abbate_completions')).rows.length,1);
    await assert.rejects(db.exec(issue(a,s1,course,a)),/row-level security/i);
    await assert.rejects(db.exec(`update abbate_memberships set role='admin'`),/permission denied/i);
    await assert.rejects(db.exec('select * from abbate_private.shares'),/permission denied/i);
    await act(trainer);
    assert.equal((await db.query('select * from abbate_completions')).rows.length,2);
    await db.exec(issue(a));
    await assert.rejects(db.exec(issue(other,s2,course2)),/row-level security/i);
    await assert.rejects(db.exec(`update abbate_completions set participant_id='${b}'`),/permission denied/i);
    await db.exec('update abbate_completions set revoked_at=now()');
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.exec('select * from abbate_completions'),/permission denied/i);
    await db.exec('reset role;');
    const policies=(await db.query("select tablename from pg_tables where schemaname='public' and tablename like 'abbate_%' and not rowsecurity")).rows;
    assert.equal(policies.length,0);
  }finally{await db.close();}
});
