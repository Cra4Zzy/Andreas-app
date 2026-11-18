'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../dist/certificate-model.js');
const p={id:'participant-1',role:'learner',name:'Max Mustermann',email:'max@example.test'};
const v={course:'gabelstapler',completedAt:'2026-11-17',notification:'none'};
test('certificate preview uses selected participant, date and confirmed forklift standard',()=>{const d=C.prepare(p,v,'2026-11-17');assert.equal(d.name,p.name);assert.equal(d.email,p.email);assert.equal(d.student,p.id);assert.equal(d.completedAt,v.completedAt);assert.equal(d.outcome,'passed');assert.equal(d.kind,'exam');assert.match(d.standard,/308-001/);assert.equal(C.fields.length,7);assert.equal(C.courses.length,8);assert.match(C.prepare(p,{...v,course:'krane'},'2026-11-17').standard,/309-003/);});
test('certificate rejects invalid recipients, unknown courses and impossible dates',()=>{for(const x of [{...v,course:'unknown'},{...v,completedAt:'2026-02-30'},{...v,completedAt:'2026-11-18'},{...v,notification:'unknown'}])assert.throws(()=>C.prepare(p,x,'2026-11-17'));assert.throws(()=>C.prepare({...p,role:'admin'},v,'2026-11-17'));assert.throws(()=>C.prepare({...p,email:''},{...v,notification:'email'},'2026-11-17'));});
test('unsigned certificate preview is not sent and saving needs explicit confirmation',()=>{const s=fs.readFileSync('dist/portal.js','utf8');assert.match(s,/Noch nicht ausgestellt/);assert.match(s,/certificateConfirmed!=='yes'/);assert.match(s,/Keine E-Mail versendet\.|keine E-Mail versendet\./);assert.match(s,/certificateDraft!==JSON.stringify\(draft\)/);assert.match(s,/Nur Nachweis speichern/);});

test('certificate integration uses server-issued PDFs and explicit mail confirmation',()=>{const p=fs.readFileSync('dist/portal.js','utf8');assert.match(p,/functions\.invoke\('abbate-certificates'/);assert.match(p,/data-cert-download/);assert.match(p,/action:'issue',completionId:id,confirmed:true/);assert.match(p,/action:'mail',completionId:id,confirmed:true,email:draft.email/);assert.match(p,/signature-form/);});

test('signed preview uses server PDF and is marked as draft before issuance',()=>{const p=fs.readFileSync('dist/portal.js','utf8'),e=fs.readFileSync('backend/functions/abbate-certificates/index.ts','utf8');assert.match(p,/action:'preview'/);assert.match(p,/data\?\.draft!==true/);assert.match(e,/action==="preview"/);assert.match(e,/PDF-Vorschau · Noch nicht ausgestellt/);assert.match(e,/await sig\.arrayBuffer\(\),true/);});

test('all seven certificate categories use verified subject references in frontend and server PDF',()=>{
 const expected={gabelstapler:'308-001',hebebuehnen:'308-008',krane:'309-003',lasten:'109-017',bagger:'301-005',ladungssicherung:'114-615',abseilen:'112-198'};
 const edge=fs.readFileSync('backend/functions/abbate-certificates/index.ts','utf8');
 const server=JSON.parse(edge.match(/const courses:Record<string,string>=(\{[^\n]+\});/)[1]);
 assert.equal(Object.keys(server).length,7);
 for(const course of C.fields){
  assert.ok(course.standard.includes(expected[course.id]),course.id);
  assert.equal(server[course.label],course.standard);
  assert.equal(C.prepare(p,{...v,course:course.id},'2026-11-17').standard,course.standard);
 }
 assert.match(C.courses.find(c=>c.id==='bagger').standard,/Hydraulikbagger und Radlader/);
 assert.match(C.courses.find(c=>c.id==='abseilen').standard,/112-199/);
 assert.match(edge,/center\(courses\[label\],231,12,regular,muted\)/);
 assert.match(edge,/Nur Theorieprüfung/);
});
