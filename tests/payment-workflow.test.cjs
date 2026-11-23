'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const sql=read('supabase/migrations/20261123211000_participant_payment_confirmation.sql');
const portal=read('dist/portal.js'),backend=read('dist/backend.js');
test('payment reporting is server-side, audited, and independent from 30-day access',()=>{
  assert.match(sql,/payment_status text not null default 'open'/);
  assert.match(sql,/payment_status in \('open','reported','confirmed'\)/);
  assert.match(sql,/p_action='report' and p_participant is distinct from auth.uid\(\)/);
  assert.match(sql,/p_action in \('confirm','reopen'\) and not abbate_private.is_admin\(p_school\)/);
  assert.match(sql,/not abbate_private.live_session\(\)/);
  assert.match(sql,/for update;/);
  assert.match(sql,/insert into abbate_private.account_audit/);
  assert.match(sql,/revoke all on function public.abbate_manage_payment/);
  assert.match(sql,/grant execute on function public.abbate_manage_payment/);
  assert.doesNotMatch(sql,/set access_status|set access_until/i);
});
test('learner sees payment status even when learning access is locked',()=>{
  assert.match(backend,/payment:membership.payment_status\|\|'open'/);
  assert.match(backend,/setPayment,setCompany,termsAccepted/);
  assert.match(portal,/if\(!proof\)\{root.innerHTML=paymentPanel\(person\)/);
  assert.match(portal,/root.innerHTML=paymentPanel\(person\)\+`<section class="portal-identity"/);
  assert.match(portal,/data-payment-action="report"/);
  assert.match(portal,/participant!==state\?\.me\?\.id/);
});
test('admin can confirm or reopen, filter by payment state and see totals',()=>{
  assert.match(portal,/data-payment-action="confirm"/);
  assert.match(portal,/data-payment-action="reopen"/);
  assert.match(portal,/payment:reported/);
  assert.match(portal,/payment:confirmed/);
  assert.match(portal,/data-payment-overview-open/);
  assert.match(portal,/B\.setPayment\(participant,action\)/);
  assert.match(portal,/state\.me\?\.role!=='admin'/);
});
test('new interface files are referenced with cache-busting params',()=>{
  for(const page of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
    const html=read(page);
    assert.match(html,/backend\.js\?v=\d+&amp;payments=1/);
    assert.match(html,/portal\.js\?v=23&amp;payments=1/);
    assert.match(html,/portal\.css\?v=10&amp;payments=1/);
  }
});
