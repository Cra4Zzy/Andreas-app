'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('three public legal pages are reachable and share navigation',()=>{
 for(const p of ['agb','datenschutz','widerruf']){
   const body=file('dist/'+p+'.html');
   assert.match(body,/<html lang="de">/);
   assert.match(body, /legal\.css\?v=2/);
   for(const link of ['./agb.html','./datenschutz.html','./widerruf.html'])assert.ok(body.includes(link),p+' missing '+link);
 }
 assert.match(file('index.html'),/dist\/agb\.html/);
 assert.match(file('index.html'),/dist\/widerruf\.html/);
});

test('registration requires explicit current AGB acceptance and links to customer information',()=>{
 const s=file('dist/portal.js');
 assert.match(s,/name="termsAccepted" value="yes" required/);
 assert.match(s,/abbate_terms_version:'2026-11-02'/);
 assert.match(s,/values\.termsAccepted!=='yes'/);
 assert.match(s,/\.\/agb\.html/);
 assert.match(s,/\.\/datenschutz\.html/);
 assert.match(s,/\.\/widerruf\.html/);
 assert.match(s,/B\.termsAccepted\(\)/);
});

test('terms acknowledgement is server-side and tied to auth identity',()=>{
 const migration=file('supabase/migrations/20261102234000_terms_acceptances.sql');
 assert.match(migration,/accepted_at timestamptz not null default now\(\)/);
 assert.match(migration,/references auth\.users\(id\) on delete cascade/);
 assert.match(migration,/revoke all on table abbate_private\.terms_acceptances/);
 assert.match(migration,/auth\.uid\(\) is null/);
 assert.match(file('dist/backend.js'),/abbate_terms_accepted/);
 assert.match(file('dist/backend.js'),/abbate_accept_terms/);
 assert.match(file('dist/app.js'),/B\.termsAccepted\(\)/);
});

test('no payment is initiated in free account creation',()=>{
 const s=file('dist/portal.js');
 assert.match(s,/Die Registrierung ist kostenlos/);
 assert.doesNotMatch(s,/stripe\.checkout|paypal\.Buttons/i);
 const agb=file('dist/agb.html');
 assert.match(agb,/Bar oder per Banküberweisung|bar bei Andreas oder per Banküberweisung/i);
 assert.match(agb,/keine automatische Verlängerung/i);
});
