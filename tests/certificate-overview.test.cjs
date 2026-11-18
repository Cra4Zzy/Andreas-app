'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('dist/portal.js','utf8'),css=fs.readFileSync('dist/admin-workspace.css','utf8'),backend=fs.readFileSync('dist/backend.js','utf8');
const functions=js.slice(js.indexOf('  function issuedCertificateRows('),js.indexOf('  function certificateOverview('));
const {issuedCertificateRows,filterIssuedCertificates}=new Function('certificateEligible',functions+'return {issuedCertificateRows,filterIssuedCertificates};')(r=>r.kind==='exam'&&r.outcome==='passed'||r.kind==='instruction'&&r.outcome==='attended');
const snapshot={students:[{id:'p',name:'Max Muster',email:'max@example.test'}],completions:['a','b','c','d','e','f'].map(id=>({id,student:'p',title:id==='b'?'Jährliche Unterweisung · Krane':'Krane · Theorieprüfung',kind:id==='b'?'instruction':'exam',outcome:id==='b'?'attended':'passed',reference:'AB-'+id,revokedAt:id==='d'?'2026-11-18':null}))};
const stored=new Map([['a',{issued_at:'2026-11-16',mail_status:'accepted'}],['b',{issued_at:'2026-11-18',mail_status:'not_sent'}],['d',{mail_status:'accepted'}],['e',{invalidated_at:'2026-11-18',mail_status:'accepted'}],['f',{issued_at:'2026-11-17',mail_status:'uncertain'}]]);
test('archive contains actual issued and valid certificates only, newest first',()=>{
 const rows=issuedCertificateRows(snapshot,stored);assert.deepEqual(rows.map(r=>r.id),['b','f','a']);assert.equal(rows[0].name,'Max Muster');assert.equal(rows[0].status,'not_sent');
});
test('archive filters by name, title, reference and real mail status',()=>{
 const rows=issuedCertificateRows(snapshot,stored);
 assert.deepEqual(filterIssuedCertificates(rows,'max','accepted').map(r=>r.id),['a']);
 assert.deepEqual(filterIssuedCertificates(rows,'unterweisung','all').map(r=>r.id),['b']);
 assert.deepEqual(filterIssuedCertificates(rows,'AB-f','review').map(r=>r.id),['f']);
 assert.equal(filterIssuedCertificates(rows,'missing','all').length,0);
});
test('archive is admin-only, has no automatic send, and handles unavailable certificate data',()=>{
 assert.match(js,/function certificateOverview\(\)\{\s*if\(state\.me\?\.role!=='admin'\)return ''/);
 assert.match(js,/certStatus\.listUnavailable=true;certRecords\.clear\(\)/);
 assert.match(js,/data-cert-overview-open/);
 assert.match(js,/data-cert-overview-close/);
 assert.match(js,/data-cert-download/);
 const markup=js.slice(js.indexOf('  function certificateOverview('),js.indexOf('  function admin(){'));
 assert.doesNotMatch(markup,/data-cert-mail|data-cert-issue/);
 assert.match(css,/\.admin-cert-overview\[open\]/);
});
test('staff pagination reads beyond one page and propagates query errors',async()=>{
 const snippet=backend.slice(backend.indexOf(' async function allPages('),backend.indexOf(' async function state(){'));
 const allPages=new Function('fail',snippet+'return allPages;')(e=>{if(e)throw e;});
 const source=Array.from({length:1003},(_,i)=>i),ranges=[];
 const result=await allPages(()=>({range:async(a,b)=>{ranges.push([a,b]);return {data:source.slice(a,b+1),error:null};}}));
 assert.deepEqual(result.data,source);
 assert.equal(ranges.length,6);
 await assert.rejects(()=>allPages(()=>({range:async()=>({error:Error('offline')})})),/offline/);
});
