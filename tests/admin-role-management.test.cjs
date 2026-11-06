'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');

const sql=path=>readFileSync(path,'utf8');

test('only an active, live-session admin can grant or revoke admin role in own school',async()=>{
  const db=new PGlite();
  const school='10000000-0000-0000-0000-000000000001';
  const otherSchool='10000000-0000-0000-0000-000000000002';
  const owner='20000000-0000-0000-0000-000000000001';
  const learner='20000000-0000-0000-0000-000000000002';
  const learner2='20000000-0000-0000-0000-000000000003';
  const outsider='20000000-0000-0000-0000-000000000004';
  const sid=id=>id.replace('20000000','30000000');
  const as=async id=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';set request.jwt.claims='{"session_id":"${sid(id)}"}';`);
  const setRole=(id,newRole)=>db.query('select * from public.abbate_manage_member_role($1,$2,$3)',[school,id,newRole]);
  try {
    await db.exec(`create schema auth;
       create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
       create table auth.sessions(id uuid primary key,user_id uuid references auth.users on delete cascade,
              created_at timestamptz default now(),not_after timestamptz);
       create role anon;create role authenticated;create role service_role bypassrls;
       grant usage on schema auth to authenticated;
       create function auth.uid() returns uuid language sql stable
         as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
       create function auth.jwt() returns jsonb language sql stable
         as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
       grant execute on function auth.uid(),auth.jwt() to authenticated;`);
    for(const file of ['backend/schema.sql','backend/accounts.sql','backend/live.sql',
      'supabase/migrations/20261102223000_fixed_30_day_access.sql',
      'supabase/migrations/20261106150500_secure_admin_role_management.sql'])
       await db.exec(sql(file));
    await db.exec(`insert into abbate_schools values('${school}','School'),('${otherSchool}','Second');
       insert into abbate_private.registration_settings values(true,'${school}');`);
    for(const id of [owner,learner,learner2,outsider]){
      await db.query('insert into auth.users(id,email) values ($1,$2)',[id,id+'@example.test']);
      await db.query('insert into auth.sessions(id,user_id) values ($1,$2)',[sid(id),id]);
    }
    await db.exec(`update public.abbate_memberships
       set role='admin',access_status='active' where user_id='${owner}';
       insert into public.abbate_memberships(school_id,user_id,role,access_status)
       values('${otherSchool}','${outsider}','admin','active');`);
    await as(learner);
    await assert.rejects(setRole(learner2,'admin'),/Administrator access required/);
    await assert.rejects(db.query("update public.abbate_memberships set role='admin'"),/permission denied/i);
    await as(owner);
    await assert.rejects(setRole(owner,'learner'),/own role/i);
    await assert.rejects(db.query('select * from public.abbate_manage_member_role($1,$2,$3)',[otherSchool,outsider,'admin']),/Administrator access required/);
    await assert.rejects(setRole(learner,'trainer'),/Unsupported account role/);
    const promoted=(await setRole(learner,'admin')).rows[0];
    assert.deepEqual(promoted,{role:'admin',access_status:'active',access_until:null});
    await db.exec('reset role'); // The protected audit table must remain unreadable to client sessions.
    const audit=await db.query("select actor_id,target_id,action from abbate_private.account_audit where action='role_changed' order by id desc limit 1");
    await as(owner);
    assert.equal(audit.rows[0].actor_id,owner);
    assert.equal(audit.rows[0].target_id,learner);
    await assert.rejects(setRole(learner,'admin'),/already has this role/);
    await as(learner);
    const newAdminAction=(await setRole(learner2,'admin')).rows[0];
    assert.equal(newAdminAction.role,'admin','New admin can manage other members');
    await as(owner);
    const revoked=(await setRole(learner,'learner')).rows[0];
    assert.deepEqual(revoked,{role:'learner',access_status:'pending',access_until:null});
    await as(learner);
    await assert.rejects(setRole(learner2,'learner'),/Administrator access required/);
    await as(owner);
    await db.exec(`reset role;delete from auth.sessions where user_id='${owner}';`);
    await as(owner);
    await assert.rejects(setRole(learner2,'learner'),/Administrator access required/);
  } finally {await db.close();}
});

test('admin role controls require explicit confirmation and prevent self-changes',()=>{
 const portal=sql('dist/portal.js'),backend=sql('dist/backend.js');
 assert.match(portal,/p\.id!==state\.me\.id/);
 assert.match(portal,/roleConfirmed/);
 assert.match(portal,/id="role-form"/);
 assert.match(portal,/Zum Administrator ernennen/);
 assert.match(portal,/Administratorrechte entziehen/);
 assert.match(portal,/submit\?\.value/);
 assert.match(portal,/B\.setRole\(selected,newRole\)/);
 assert.match(backend,/abbate_manage_member_role/);
 assert.match(backend,/students:members\.data\.map/);
 for(const page of ['dist/index.html','dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
  assert.match(sql(page),/backend\.js\?v=6/);
 }
 for(const page of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
  assert.match(sql(page),/portal\.js\?v=13/);
 }
});
