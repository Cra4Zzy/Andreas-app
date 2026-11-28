'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('30-day activation and extension are server-managed',()=>{
 const sql=read('supabase/migrations/20261102223000_fixed_30_day_access.sql');
 assert.match(sql,/v_until := v_today\+29;/);
 assert.match(sql,/v_until := v_before.access_until\+30;/);
 assert.match(sql,/not abbate_private.is_admin\(p_school\)/);
 assert.match(sql,/for update;/);
 assert.match(sql,/p_action not in \('activate','extend','resume','pause'\)/);
});
test('admin and backend use explicit pause and restore without expiry controls',()=>{
 const portal=read('dist/portal.js');
 const backend=read('dist/backend.js');
 assert.doesNotMatch(portal,/name="until"/);
 assert.match(portal,/Zugang sperren/);
 assert.match(portal,/Zugang freigeben/);
 assert.doesNotMatch(portal,/Nach Zahlung (?:um )?30 Tage/);
 assert.match(backend,/abbate_manage_access/);
 assert.doesNotMatch(backend,/\.from\('abbate_memberships'\)\.update/);
});
test('access controls load newest scripts',()=>{
 for(const p of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
   const s=read(p);
   assert.match(s,/backend\.js\?v=(?:[89]|[1-9]\d+)(?=["&])/);
   assert.match(s,p==='dist/konto.html'?/portal\.js\?v=23/:/portal\.js\?v=23/);
 }
});

test('non-admin sessions use five-minute inactivity logout',()=>{
 const backend=read('dist/backend.js');
 assert.match(backend,/const USER_IDLE_MS=5\*60\*1000;/);
 assert.match(backend,/if\(user\.role==='admin'\)\{idle=null;return true;\}/);
 assert.match(backend,/client\.auth\.signOut\(\{scope:'local'\}\)/);
 assert.match(backend,/location\.replace\('\.\/konto\.html\?session=expired'\)/);
 assert.match(backend,/async function checkUserIdle\(\)/);
 assert.match(backend,/document\.addEventListener\('visibilitychange'/);
});
test('unlimited access rollout preserves explicit pauses and server authorization',()=>{
 const sql=read('backend/unlimited-learner-access.sql');
 assert.match(sql,/'learner','active'/);
 assert.match(sql,/not abbate_private.is_admin\(p_school\)/);
 assert.match(sql,/for update;/);
 assert.match(sql,/when m.access_status='paused' then 'paused'/);
 assert.match(sql,/access_until=null/);
 assert.doesNotMatch(sql,/set payment_status|delete from/i);
});
