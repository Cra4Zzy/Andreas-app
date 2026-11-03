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
test('admin and backend do not expose arbitrary paid expiry dates',()=>{
 const portal=read('dist/portal.js');
 const backend=read('dist/backend.js');
 assert.doesNotMatch(portal,/name="until"/);
 assert.match(portal,/Nach Zahlung 30 Tage freischalten/);
 assert.match(portal,/Nach Zahlung um 30 Tage verlängern/);
 assert.match(backend,/abbate_manage_access/);
 assert.doesNotMatch(backend,/\.from\('abbate_memberships'\)\.update/);
});
test('access controls load newest scripts',()=>{
 for(const p of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
   const s=read(p);
   assert.match(s,/backend\.js\?v=4/);
   assert.match(s,/portal\.js\?v=8/);
 }
});
