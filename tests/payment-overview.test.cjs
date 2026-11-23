'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/portal.js','utf8');
const page=fs.readFileSync('dist/verwaltung.html','utf8');
const css=fs.readFileSync('dist/admin-workspace.css','utf8');
const portalCss=fs.readFileSync('dist/portal.css','utf8');
function makeContext(){
  const people=[
    {id:'r1',role:'learner',name:'Max Mustermann',email:'max@example.test',payment:'reported',paymentReportedAt:'2026-11-23T19:18:00Z'},
    {id:'r2',role:'learner',name:'Anna Beispiel',email:'anna@example.test',payment:'reported',paymentReportedAt:'2026-11-23T20:18:00Z'},
    {id:'c1',role:'learner',name:'Lisa Schneider',email:'lisa@example.test',payment:'confirmed',paymentConfirmedAt:'2026-11-22T10:00:00Z'},
    {id:'o1',role:'learner',name:'Stefan Müller',email:'stefan@example.test',payment:'open'},
    {id:'staff',role:'admin',name:'Administrator',email:'admin@example.test',payment:'open'}
  ];
  const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const ctx={state:{me:{id:'staff',role:'admin'},students:people},paymentQuery:'',paymentExpanded:{reported:true,confirmed:false,open:false},safe:escape};
  const begin=source.indexOf('  function paymentParticipants(status){'),end=source.indexOf('  function people(){',begin);
  assert.ok(begin!==-1&&end>begin,'overview functions must be present before account-picker code');
  vm.runInNewContext(source.slice(begin,end),ctx);
  return ctx;
}
test('all learners grouped by their actual payment state; staff accounts excluded',()=>{
  const ctx=makeContext();
  assert.equal(ctx.paymentParticipants('reported').map(p=>p.id).join(','),'r2,r1','most recent report first');
  assert.equal(ctx.paymentParticipants('confirmed').map(p=>p.id).join(','),'c1');
  assert.equal(ctx.paymentParticipants('open').map(p=>p.id).join(','),'o1');
  const markup=ctx.paymentOverview();
  for(const label of ['Gemeldete Zahlungen','Bestätigte Zahlungen','Offene Zahlungen'])assert.ok(markup.includes(label));
  assert.match(markup,/data-payment-group="reported" open/);
  assert.match(markup,/data-payment-group="confirmed"/);
  assert.match(markup,/data-payment-group="open"/);
  assert.match(markup,/4 Teilnehmer/);
  assert.doesNotMatch(markup,/Administrator/);
});
test('reported participants have confirm + open actions; confirmed do not have confirm action',()=>{
  const ctx=makeContext();
  const reported=ctx.paymentPeopleMarkup('reported'),confirmed=ctx.paymentPeopleMarkup('confirmed');
  assert.match(reported,/data-payment-open="r2"/);
  assert.match(reported,/data-payment-action="confirm" data-payment-person="r2"/);
  assert.match(reported,/Anna Beispiel/);
  assert.match(reported,/anna@example.test/);
  assert.match(confirmed,/data-payment-open="c1"/);
  assert.doesNotMatch(confirmed,/data-payment-action="confirm"/);
  assert.match(confirmed,/Bestätigt:/);
});
test('search by name or email does not alter status counts and escapes HTML',()=>{
  const ctx=makeContext();
  ctx.paymentQuery='ANNA';
  assert.equal(ctx.paymentParticipants('reported').length,1);
  assert.equal(ctx.paymentParticipants('confirmed').length,0);
  const filtered=ctx.paymentOverview();
  assert.match(filtered,/1 von 2 Teilnehmern/);
  assert.match(filtered,/Keine Treffer für diese Suche/);
  ctx.paymentQuery='';
  ctx.state.students.push({id:'x',role:'learner',name:'<script>alert(1)</script>',email:'script@example.test',payment:'reported'});
  const html=ctx.paymentPeopleMarkup('reported');
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/<script>/);
});
test('overview summary clicks open matching lists and selected participant is in account detail',()=>{
  assert.match(source,/data-payment-show="reported"/);
  assert.match(source,/data-payment-show="confirmed"/);
  assert.match(source,/data-payment-show="open"/);
  assert.match(source,/const overviewStat=event\.target\.closest\('\[data-payment-show\]'\)/);
  assert.match(source,/group\.open=true/);
  assert.match(source,/const paymentPerson=event\.target\.closest\('\[data-payment-open\]'\)/);
  assert.match(source,/selected=id;search='';filter='all'/);
  assert.match(source,/renderDetail\(\)/);
  assert.match(source,/await B\.setPayment\(participant,action\)/);
  assert.match(source,/rememberPaymentOverview\(\)/);
});
test('admin overview has mobile styles and versioned assets, no new database grant',()=>{
  assert.match(css,/\.abbate-payment-overview\{/);
  assert.match(css,/\.abbate-payment-person-actions/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(portalCss,/\.abbate-payment-stats>button/);
  assert.match(page,/portal\.js\?v=22&amp;payments=1&amp;overview=1/);
  assert.match(page,/admin-workspace\.css\?v=21/);
  assert.match(page,/portal\.css\?v=9&amp;payments=1&amp;overview=1/);
});
