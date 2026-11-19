'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../dist/certificate-model.js');
const p={id:'test',role:'learner',name:'Test Person',email:'test@example.invalid'};
const v={completedAt:'2026-11-18',notification:'none',birthDate:'1990-01-01',birthPlace:'Berlin',company:'Muster GmbH',location:'Satteldorf',theoryConfirmed:'yes',practiceConfirmed:'yes'};
test('special templates use staff-confirmed training records and do not add learning courses',()=>{assert.equal(C.fields.length,7);for(const t of Object.values(C.templates)){const d=C.prepare(p,{...v,course:t.course,proofType:t.id},'2026-11-19');assert.equal(d.title,t.title);assert.equal(d.kind,'training');assert.equal(d.outcome,t.outcome);assert.ok(C.specialRecord(d));}assert.equal(C.prepare(p,{...v,course:'abseilen'},'2026-11-19').kind,'exam');});
test('rope proof requires both examinations and verified person details',()=>{for(const patch of [{practiceConfirmed:''},{theoryConfirmed:''},{birthDate:'2027-01-01'},{birthPlace:''},{location:''},{company:''},{course:'krane'}])assert.throws(()=>C.prepare(p,{...v,course:'abseilen',proofType:'rope',...patch},'2026-11-19'));});
test('fire proof is not an employer appointment; live function checks template and confirmation',()=>{const e=fs.readFileSync('backend/functions/abbate-certificates/index.ts','utf8'),s=fs.readFileSync('dist/portal.js','utf8');assert.match(e,/Die betriebliche Bestellung erfolgt gesondert durch den Arbeitgeber/);assert.match(e,/body.theory!==true\|\|body.practice!==true/);assert.match(e,/specialOf\(r\)/);assert.match(s,/templatesV2/);assert.match(s,/draft.template&&!issuing/);assert.match(e,/PDF-Vorschau · Noch nicht ausgestellt/);});

test('server template rules match the client and reject forged or incomplete attestations',()=>{
 const {transformSync}=require('esbuild'),source=fs.readFileSync('backend/functions/abbate-certificates/index.ts','utf8');
 const isolated=source.slice(source.indexOf('const courses:'),source.indexOf('const uuid='));
 const js=transformSync('function load(){'+isolated+'\nreturn {templates,templateDetails,specialOf,eligible};}',{loader:'ts',target:'es2022'}).code;
 const S=new Function('Fault',js+'\nreturn load();')(Error);
 for(const t of Object.values(C.templates)){
   assert.deepEqual(S.templates[t.id],t);
   const d=C.prepare(p,{...v,course:t.course,proofType:t.id},'2026-11-19');
   const r={kind:d.kind,outcome:d.outcome,abbate_courses:{title:d.title}};
   assert.ok(S.eligible(r));assert.equal(S.specialOf(r).id,t.id);
   assert.deepEqual(S.templateDetails(t,d,d.completedAt),d.details);
   assert.throws(()=>S.templateDetails(t,{...d,template:'invalid'},d.completedAt));
   if(t.id!=='cargo')assert.throws(()=>S.templateDetails(t,{...d,practice:false},d.completedAt));
   assert.equal(S.specialOf({...r,outcome:'failed'}),undefined);
 }
 assert.ok(S.eligible({kind:'exam',outcome:'passed'}));
});
