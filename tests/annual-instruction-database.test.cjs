'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('annual certificate migration: actual PostgreSQL trigger behavior in an isolated database',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create schema abbate_private;
 create table public.abbate_courses(id uuid primary key,school_id uuid,title text);
 create table public.abbate_completions(id uuid primary key,school_id uuid,course_id uuid,participant_id uuid,kind text,outcome text,completed_at date,revoked_at timestamptz);
 create table public.abbate_certificates(completion_id uuid primary key,invalidated_at timestamptz);`);
 await db.exec(readFileSync('staging/annual-instruction/database.sql','utf8'));
 await db.exec(`create trigger guard before insert on public.abbate_certificates for each row execute function abbate_private.guard_certificate_insert();
 create trigger invalidate after update on public.abbate_completions for each row execute function abbate_private.invalidate_certificate();`);
 const school='10000000-0000-4000-8000-000000000001',person='10000000-0000-4000-8000-000000000002';
 const annual='10000000-0000-4000-8000-000000000003',exam='10000000-0000-4000-8000-000000000004',other='10000000-0000-4000-8000-000000000005';
 for(const [id,title] of [[annual,'Jährliche Unterweisung · Krane · Unterweisungsnachweis'],[exam,'Krane · Theorieprüfung'],[other,'Unrelated instruction']])await db.query('insert into public.abbate_courses values($1,$2,$3)',[id,school,title]);
 const completion=async(n,course,kind,outcome,revoked=null)=>{const id='20000000-0000-4000-8000-'+String(n).padStart(12,'0');await db.query("insert into public.abbate_completions values($1,$2,$3,$4,$5,$6,'2026-11-17',$7)",[id,school,course,person,kind,outcome,revoked]);return id;};
 const issue=id=>db.query('insert into public.abbate_certificates values($1,null)',[id]);
 const a=await completion(1,annual,'refresher','attended'), b=await completion(2,exam,'exam','passed');
 await issue(a);await issue(b);
 for(const [i,c,k,o,r] of [[3,annual,'refresher','failed',null],[4,other,'refresher','attended',null],[5,exam,'exam','failed',null],[6,annual,'refresher','attended','2026-11-18T12:00:00Z'],[7,annual,'training','attended',null]]){const id=await completion(i,c,k,o,r);await assert.rejects(issue(id),/Completion not eligible/);}
 assert.equal((await db.query('select count(*)::int as n from public.abbate_certificates')).rows[0].n,2);
 await db.query('update public.abbate_completions set outcome=outcome where id=$1',[a]);
 assert.equal((await db.query('select invalidated_at from public.abbate_certificates where completion_id=$1',[a])).rows[0].invalidated_at,null);
 await db.query("update public.abbate_completions set outcome='failed' where id=$1",[a]);
 assert.ok((await db.query('select invalidated_at from public.abbate_certificates where completion_id=$1',[a])).rows[0].invalidated_at);
 await db.query("update public.abbate_completions set revoked_at=now() where id=$1",[b]);
 assert.ok((await db.query('select invalidated_at from public.abbate_certificates where completion_id=$1',[b])).rows[0].invalidated_at);
 }finally{await db.close();}
});
