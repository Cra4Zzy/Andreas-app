'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('unlimited learner access migration preserves explicit blocks, records, roles and authorization',async()=>{
 const db=new PGlite();
 const school='10000000-0000-0000-0000-000000000001';
 const admin='20000000-0000-0000-0000-000000000001';
 const learner='20000000-0000-0000-0000-000000000002';
 const paused='20000000-0000-0000-0000-000000000003';
 const fresh='20000000-0000-0000-0000-000000000004';
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

   await db.exec(migration('supabase/migrations/20261123211000_participant_payment_confirmation.sql'));
   await db.exec(migration('supabase/migrations/20261123223000_participant_company_profile.sql'));
   await db.exec(`insert into abbate_schools values('${school}','School');
      insert into abbate_private.registration_settings values(true,'${school}');`);
   for(const id of [admin,learner,paused]){
     await db.query('insert into auth.users(id,email) values($1,$2)',[id,id+'@example.test']);
     await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid(id),id]);
   }
   await db.query("update public.abbate_memberships set role='admin',access_status='active' where user_id=$1",[admin]);
   await db.query("update public.abbate_memberships set access_status='active',access_until='2000-01-01',payment_status='confirmed' where user_id=$1",[learner]);
   await db.query("update public.abbate_memberships set access_status='paused',access_until='2000-01-01' where user_id=$1",[paused]);
   await as(admin);
   const record=(await db.query("select abbate_record_completion($1,$2,'Stapler Theorie','exam','failed','2026-11-01') as id",[school,learner])).rows[0].id;
   await db.exec('reset role;reset request.jwt.claim.sub;reset request.jwt.claims');
   await db.exec(migration('backend/unlimited-learner-access.sql'));
   const row=async id=>(await db.query('select role,access_status,access_until,payment_status from public.abbate_memberships where user_id=$1',[id])).rows[0];
   assert.deepEqual(await row(learner),{role:'learner',access_status:'active',access_until:null,payment_status:'confirmed'});
   assert.equal((await row(paused)).access_status,'paused');
   await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3::jsonb)',[fresh,'new@example.test',JSON.stringify({role:'admin',company:'Example',abbate_terms_version:'2026-11-28',abbate_terms_accepted:true})]);
   await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid(fresh),fresh]);
   assert.deepEqual(await row(fresh),{role:'learner',access_status:'active',access_until:null,payment_status:'open'});
   await as(fresh);
   assert.equal((await db.query('select abbate_terms_accepted() as accepted')).rows[0].accepted,true);
   await assert.rejects(db.query("select abbate_manage_access($1,$2,'activate')",[school,paused]),/Administrator access required/);
   await as(admin);
   await db.query("select abbate_manage_access($1,$2,'pause')",[school,learner]);
   await as(learner);
   assert.equal((await db.query('select * from public.abbate_completions where id=$1',[record])).rows.length,0);
   await assert.rejects(db.query("select abbate_manage_access($1,$2,'activate')",[school,learner]),/Administrator access required/);
   await as(admin);
   await db.query("select abbate_manage_access($1,$2,'activate')",[school,learner]);
   await as(learner);
   assert.equal((await db.query('select outcome from public.abbate_completions where id=$1',[record])).rows[0].outcome,'failed');
 }finally{await db.close();}
});
