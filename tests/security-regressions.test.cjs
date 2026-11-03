'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');

test('server disallows learner record tampering, revoked sessions, and stale practice overwrites',async()=>{
 const db=new PGlite();
 const school='10000000-0000-0000-0000-000000000001';
 const admin='20000000-0000-0000-0000-000000000001';
 const learner='20000000-0000-0000-0000-000000000002';
 const sid=id=>id.replace('20000000','30000000');
 const as=async id=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';set request.jwt.claims='{"session_id":"${sid(id)}"}';`);
 const migration=file=>readFileSync(file,'utf8');
 try{
   await db.exec(`create schema auth;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users on delete cascade,created_at timestamptz default now(),not_after timestamptz);
    create role anon;create role authenticated;create role service_role bypassrls;
    grant usage on schema auth to authenticated;
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    grant execute on function auth.uid(),auth.jwt() to authenticated;`);
   for(const name of ['schema','accounts','live']) await db.exec(migration('backend/'+name+'.sql'));
   await db.exec(migration('supabase/migrations/20261102223000_fixed_30_day_access.sql'));
   await db.exec(migration('supabase/migrations/20261102234000_terms_acceptances.sql'));
   await db.exec(migration('supabase/migrations/20261103161000_secure_record_changes.sql'));
   await db.exec(migration('supabase/migrations/20261103163500_atomic_practice_merge.sql'));
   await db.exec(`insert into abbate_schools values('${school}','School');
      insert into abbate_private.registration_settings values(true,'${school}');`);
   for(const id of [admin,learner]){
     await db.query('insert into auth.users(id,email) values($1,$2)',[id,id+'@example.test']);
     await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid(id),id]);
   }
   await db.exec(`update public.abbate_memberships
     set role='admin',access_status='active'
     where user_id='${admin}';
     update public.abbate_memberships
     set access_status='active',access_until='2099-01-01'
     where user_id='${learner}';`);
   await as(admin);
   const record=(await db.query(`select abbate_record_completion($1,$2,'Stapler Theorie','exam','failed','2026-11-01') as id`,[school,learner])).rows[0].id;
   await as(learner);
   await assert.rejects(db.query('select abbate_change_record($1,$2,$3,$4)',[school,record,'correct_outcome','passed']),/Staff access required/);
   await assert.rejects(db.query("update public.abbate_completions set outcome='passed'"),/permission denied|row-level/i);
   await assert.rejects(db.query("update public.abbate_memberships set access_until='2099-12-31'"),/permission denied|row-level/i);
   const r1={results:[{id:'round-a',at:'2026-11-03T08:00:00Z'}],mastered:['q1']};
   const r2={results:[{id:'round-b',at:'2026-11-03T09:00:00Z'}],mastered:['q2']};
   for(const payload of [r1,r2,r1])await db.query('select abbate_merge_practice($1::jsonb)',[JSON.stringify(payload)]);
   let row=(await db.query('select payload from public.abbate_practice')).rows[0].payload;
   assert.deepEqual(row.results.map(r=>r.id),['round-a','round-b']);
   assert.deepEqual(row.mastered,['q1','q2']);
   await assert.rejects(db.query("delete from public.abbate_practice"),/permission denied/i);
   await assert.rejects(db.query("update public.abbate_practice set payload='{}'::jsonb"),/permission denied/i);
   await as(admin);
   await db.query('select abbate_change_record($1,$2,$3,$4)',[school,record,'correct_outcome','passed']);
   assert.equal((await db.query('select outcome from abbate_completions where id=$1',[record])).rows[0].outcome,'passed');
   await db.query('select abbate_change_record($1,$2,$3,$4)',[school,record,'revoke',null]);
   await assert.rejects(db.query('select abbate_change_record($1,$2,$3,$4)',[school,record,'correct_outcome','failed']),/Record unavailable/);
   await db.exec(`reset role;delete from auth.sessions where user_id='${learner}';`);
   await as(learner);
   await assert.rejects(db.query('select abbate_merge_practice($1::jsonb)',[JSON.stringify(r2)]),/Active learning access required/);
 }finally{await db.close();}
});
