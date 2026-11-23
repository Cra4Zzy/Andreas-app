'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const portal=fs.readFileSync('dist/portal.js','utf8'),backend=fs.readFileSync('dist/backend.js','utf8');
const companySql=fs.readFileSync('supabase/migrations/20261123223000_participant_company_profile.sql','utf8');
const adminPage=fs.readFileSync('dist/verwaltung.html','utf8');
test('payment overview is only in standalone admin modal, not below account stats',()=>{
  assert.match(portal,/function paymentDialog\(\)/);
  assert.match(portal,/id="payment-overview-dialog" class="admin-cert-overview"/);
  assert.match(portal,/data-payment-overview-open aria-haspopup="dialog"/);
  assert.match(portal,/\$\{certificateOverview\(\)\}\$\{examOverview\(\)\}\$\{paymentDialog\(\)\}/);
  assert.doesNotMatch(portal,/class="abbate-payment-stats" aria-label="Zahlungsübersicht"/);
  assert.match(portal,/\['cert-overview-dismiss','exam-overview-dismiss','payment-overview-dismiss'\]/);
  assert.match(portal,/const modalOpen=!!root\.querySelector\('#payment-overview-dialog'\)\?\.open/);
  assert.match(portal,/if\(modalOpen\)root\.querySelector\('#payment-overview-dialog'\)\?\.showModal\(\)/);
  assert.match(portal,/if\(dialog\?\.open\)dialog\.close\(\)/);
});
test('registration captures optional company, profile and list show escaped company',()=>{
  assert.match(portal,/name="company" type="text" maxlength="120" autocomplete="organization"/);
  assert.match(portal,/company:\(values\.company\|\|''\)\.trim\(\)/);
  assert.match(portal,/id="self-company-form"/);
  assert.match(portal,/id="admin-company-form"/);
  assert.match(portal,/abbate-person-company/);
  assert.match(portal,/abbate-account-company/);
  assert.match(portal,/\$\{p\.company\?'<small class="abbate-person-company">'\+safe\(p\.company\)/);
  assert.match(backend,/company:profile\?\.company\|\|''/);
  assert.match(backend,/abbate_set_participant_company/);
  assert.match(backend,/setCompany,/);
  assert.match(portal,/B\.setCompany\(state\.me\.id,values\.company\|\|''\)/);
  assert.match(portal,/B\.setCompany\(selected,values\.company\|\|''\)/);
});
test('company DB migration cannot change roles, accesses or other users',()=>{
  assert.match(companySql,/add column if not exists company text/);
  assert.match(companySql,/insert into public\.abbate_profiles\(school_id,user_id,display_name,email,company\)/);
  assert.match(companySql,/new\.raw_user_meta_data->>'company'/);
  assert.match(companySql,/abbate_private\.live_session\(\)/);
  assert.match(companySql,/p\.user_id=auth\.uid\(\) or abbate_private\.is_admin\(p\.school_id\)/);
  assert.match(companySql,/for update of p/);
  assert.match(companySql,/account_audit/);
  assert.match(companySql,/revoke all on function public\.abbate_set_participant_company/);
  assert.match(companySql,/grant execute on function public\.abbate_set_participant_company/);
  assert.doesNotMatch(companySql,/grant update\s*\(/i);
  assert.doesNotMatch(companySql,/update public\.abbate_memberships/i);
});
test('new modal and registered company assets bust stale web caches',()=>{
  assert.match(adminPage,/admin-workspace\.css\?v=22/);
  assert.match(adminPage,/portal\.js\?v=23/);
  for(const path of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
    const page=fs.readFileSync(path,'utf8');
    assert.match(page,/backend\.js\?v=10/);
    assert.match(page,/portal\.css\?v=10/);
  }
});
