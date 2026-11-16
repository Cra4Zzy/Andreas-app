'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8'),ctx={};ctx.globalThis=ctx;
for(const file of ['practice-bank.js','practice-expansion.js','practice-expansion-final.js','i18n-modern.js','konten-model.js'])vm.runInNewContext(read('dist/'+file),ctx);
const bank=ctx.ABBATE_PRACTICE_BANK,questions=bank.questions.filter(q=>q.course==='abseilen');
test('abseiling has 50 distinct questions, balanced answer positions and labels in 26 languages',()=>{
 assert.equal(questions.length,50);assert.equal(new Set(questions.map(q=>q.title)).size,50);
 assert.equal(bank.courses.abseilen.reviewed,false);
 for(const q of questions){assert.match(q.id,/^as-/);assert.equal(new Set(q.answers).size,3);}
 const counts=[0,1,2].map(i=>questions.filter(q=>q.correct===i).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);
 for(const phrase of ['Abseilen aus Höhen – Theorie','Ausrüstung, Vorbereitung und Rettungsplanung sicher verstehen.','Abseilen aus Höhen – Theorie üben'])assert.equal(Object.keys(ctx.ABBATE_I18N_MODERN[phrase]).length,25);
});
test('abseiling selection and history stay within the new category',()=>{
 const app=read('dist/app.js');const begin=app.indexOf('const ROUND_QUESTION_LIMIT=20;'),end=app.indexOf('function startRun(',begin);
 const context={data:{results:[]},student:()=>({id:'learner'}),courseQuestions:id=>bank.questions.filter(q=>q.course===id),question:id=>bank.questions.find(q=>q.id===id),Math,Map,Set,Date};
 vm.runInNewContext(app.slice(begin,end)+';globalThis.pick=selectRoundQuestions;',context);
 const first=Array.from(context.pick('abseilen'));assert.equal(first.length,20);assert.ok(first.every(id=>id.startsWith('as-')));
 context.data.results=[{student:'learner',course:'abseilen',mode:'learn',ids:first,answers:Object.fromEntries(first.map(id=>[id,bank.questions.find(q=>q.id===id).correct])),at:new Date().toISOString()}];
 const second=Array.from(context.pick('abseilen'));assert.equal(second.length,20);assert.ok(second.every(id=>id.startsWith('as-')&&!first.includes(id)));
});
test('annual instruction is stored through the supported instruction kind and appears in own pass',()=>{
 const portal=read('dist/portal.js');assert.match(portal,/<option value="annual_instruction">Jährliche Unterweisung<\/option>/);
 const begin=portal.indexOf("if(values.kind==='annual_instruction')"),end=portal.indexOf('\n        M.addCompletion',begin);
 for(const title of ['Absturzschutz','Jährliche Unterweisung · Absturzschutz']){
  const context={values:{kind:'annual_instruction',title}};vm.runInNewContext(portal.slice(begin,end),context);
  assert.equal(context.values.kind,'instruction');assert.equal(context.values.title,'Jährliche Unterweisung · Absturzschutz');
  const M=ctx.ABBATE_ACCOUNTS,state=M.migrate(M.seed());const person=state.students[0];
  M.addCompletion(state,{...context.values,student:person.id,outcome:'attended',completedAt:'2026-11-16'},'annual-test','2026-11-16');
  assert.ok(M.ownPass(state,person.id).records.some(r=>r.title===context.values.title&&r.kind==='instruction'));
 }
});
