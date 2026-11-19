'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('dist/portal.js','utf8');
const source=js.slice(js.indexOf('  function issuedCertificateRows('),js.indexOf('  function completionOverviewMarkup('));
const {completedRecordRows,filterCompletedRecords}=new Function('certificateEligible',source+'return {completedRecordRows,filterCompletedRecords};')(r=>r.kind==='exam'&&r.outcome==='passed'||r.kind==='instruction'&&r.outcome==='attended');
const person={id:'p',name:'Max Muster',email:'max@example.test'};
const make=(id,kind,outcome,date,extra={})=>({id,student:'p',kind,outcome,completedAt:date,title:'Krane · '+kind,reference:'REF-'+id,...extra});
const snapshot={students:[person],completions:[make('a','exam','passed','2026-11-10'),make('b','exam','failed','2026-11-15'),make('c','training','attended','2026-11-14'),make('d','instruction','attended','2026-11-16'),make('e','exam','passed','2026-11-17',{revokedAt:'2026-11-18'}),make('f','exam','passed','2026-11-19'),make('g','practice','passed','2026-11-14'),make('h','exam','passed','2026-02-30'),make('i','exam','passed','2026-11-12',{student:'unknown'})],results:[{id:'self-study',score:20}]};
const stored=new Map([['a',{issued_at:'2026-11-18',mail_status:'accepted'}],['d',{invalidated_at:'2026-11-18'}]]);
test('archive includes documented exams, training and instruction even without certificates; excludes withdrawn, future, invalid and study records',()=>{
 const rows=completedRecordRows(snapshot,stored,false,'2026-11-18');
 assert.deepEqual(rows.map(r=>r.id),['d','b','c','i','a']);
 assert.equal(rows.find(r=>r.id==='a').certificate,'issued');
 assert.equal(rows.find(r=>r.id==='a').completedAt,'2026-11-10');
 assert.equal(rows.find(r=>r.id==='d').certificate,'none');
 assert.equal(rows.find(r=>r.id==='b').outcome,'failed');
 assert.equal(rows.find(r=>r.id==='i').personAvailable,false);
});
test('filter by person, record type, result and inclusive completion date',()=>{
 const rows=completedRecordRows(snapshot,stored,false,'2026-11-18');
 assert.deepEqual(filterCompletedRecords(rows,{query:'max',kind:'exam'}).map(r=>r.id),['b','a']);
 assert.deepEqual(filterCompletedRecords(rows,{outcome:'attended',from:'2026-11-14',to:'2026-11-16'}).map(r=>r.id),['d','c']);
 assert.deepEqual(filterCompletedRecords(rows,{query:'REF-b',outcome:'failed'}).map(r=>r.id),['b']);
});
test('certificate outage does not hide completed records or claim a certificate is missing',()=>{
 const rows=completedRecordRows(snapshot,new Map(),true,'2026-11-18');
 assert.equal(rows.length,5);
 assert.equal(rows.find(r=>r.id==='a').certificate,'unknown');
 assert.equal(rows.find(r=>r.id==='c').certificate,'none');
});
test('completed records are read-only inside the existing administrator archive',()=>{
 assert.match(js,/function certificateOverview\(\)\{\s*if\(state\.me\?\.role!=='admin'\)return ''/);
 assert.match(js,/data-overview-mode="completions"/);
 assert.match(js,/if\(dialog\.dataset\.overviewMode==='completions'\)\{renderCompletionOverview\(dialog\);return;\}/);
 assert.match(js,/event\.target\.closest\('#certificate-overview'\)\?\.close\(\)/);
 const markup=js.slice(js.indexOf('  function completionOverviewMarkup('),js.indexOf('  function admin(){'));
 assert.doesNotMatch(markup,/data-cert-issue|data-cert-mail|B\.addCompletion|B\.updateRecord/);
 assert.match(markup,/Durchgeführt am/);
});

test('archive close button uses native dialog submission, bypassing all mutation handlers',async()=>{
 const markup=js.slice(js.indexOf('  function certificateOverview(){'),js.indexOf('  function renderCertificateOverview(){'));
 assert.match(markup,/<form method="dialog" id="cert-overview-dismiss"[^>]*><button type="submit"[^>]*data-cert-overview-close/);
 const eventSource=js.slice(js.indexOf("  root.addEventListener('submit'"),js.indexOf("  root.addEventListener('keydown'"));
 let submit;new Function('root',eventSource)({addEventListener:(type,fn)=>{if(type==='submit')submit=fn;}});
 let prevented=false;await submit({target:{id:'cert-overview-dismiss',method:'dialog'},preventDefault(){prevented=true;}});
 assert.equal(prevented,false);
 const css=fs.readFileSync('dist/admin-workspace.css','utf8');
 assert.match(css,/\.admin-overview-dismiss button\{[^}]*pointer-events:auto/);
});

test('archive offers the issued PDF or a distinctly labelled printable record',()=>{
 const markup=js.slice(js.indexOf('  function renderCompletionOverview('),js.indexOf('  function setCertificateOverviewMode('));
 assert.match(markup,/r\.certificate==='issued'[\s\S]*PDF öffnen \/ speichern[\s\S]*data-record-print/);
 assert.match(markup,/data-overview-record/);
 const helper=js.slice(js.indexOf('  function completionPrintMarkup('),js.indexOf('  function printCompletionRecord('));
 const print=new Function('M','day','safe',helper+'return completionPrintMarkup;')({kinds:{training:'Schulung'},outcomes:{passed:'Bestanden'}},v=>v,v=>String(v??'').replace(/</g,'&lt;'));
 const output=print({title:'<script>',kind:'training',outcome:'passed',completedAt:'2026-11-14',reference:'AB-123'},{name:'Muster'});
 assert.match(output,/Kein ausgestelltes Zertifikat/);assert.match(output,/AB-123/);assert.doesNotMatch(output,/<script>/);
});
test('archive record navigation opens history and focuses and scrolls to the exact record',()=>{
 const helper=js.slice(js.indexOf('  function focusOverviewRecord('),js.indexOf('  function completionOverviewMarkup('));
 const history={open:false},calls=[],record={dataset:{recordId:'r2'},classList:{add:v=>calls.push(v)},setAttribute:(k,v)=>calls.push(k+v),focus:()=>calls.push('focus'),scrollIntoView:()=>calls.push('scroll')};
 const detail={querySelector:()=>history,querySelectorAll:()=>[{dataset:{recordId:'r1'}},record]};
 new Function('document',helper+'return focusOverviewRecord;')({querySelector:()=>detail})('r2');
 assert.equal(history.open,true);assert.deepEqual(calls,['admin-record-target','tabindex-1','focus','scroll']);
});

test('archive action clicks are not intercepted as tab switches by the dialog mode attribute',async()=>{
 const source=js.slice(js.indexOf("  root.addEventListener('click'"),js.indexOf("    const certButton=",js.indexOf("  root.addEventListener('click'")));
 let click,printed=null,switches=0;
 const dialog={dataset:{overviewMode:'completions'}};
 const button={dataset:{recordPrint:'record-123'}};
 const root={addEventListener:(type,fn)=>{click=fn;}};
 new Function('root','printCompletionRecord','setCertificateOverviewMode',source+'\n});')(root,id=>{printed=id;},()=>{switches++;});
 await click({target:{closest:selector=>selector==='[data-overview-mode]'?dialog:selector==='[data-record-print]'?button:null}});
 assert.equal(printed,'record-123');
 assert.equal(switches,0);
});
