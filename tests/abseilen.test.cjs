'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8'),ctx={};ctx.globalThis=ctx;
for(const file of ['practice-bank.js','practice-expansion.js','practice-expansion-final.js','i18n-modern.js','konten-model.js'])vm.runInNewContext(read('dist/'+file),ctx);
const bank=ctx.ABBATE_PRACTICE_BANK,questions=bank.questions.filter(q=>q.course==='abseilen');
test('abseiling has 50 distinct questions, balanced answer positions and labels in 26 languages',()=>{
 assert.equal(questions.length,50);assert.equal(new Set(questions.map(q=>q.title)).size,50);
 assert.equal(bank.courses.abseilen.reviewed,false);
 assert.match(read('dist/app.js'),/String\(COURSES.length\).padStart\(2,'0'\)/);
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
test('new category supports exam simulation and repeats only mistakes with the same answer key',()=>{
 const app=read('dist/app.js');const context={activeCourseId:'gabelstapler',COURSES:Object.keys(bank.courses).map(id=>({id})),run:null,latestResult:null,active:()=>true,student:()=>({id:'learner'}),selectRoundQuestions:id=>bank.questions.filter(q=>q.course===id).slice(0,20).map(q=>q.id),question:id=>bank.questions.find(q=>q.id===id),close(){},go(){},toast(){},Date};
 vm.runInNewContext(app.slice(app.indexOf('function startRun('),app.indexOf('function quizView()'))+app.slice(app.indexOf('function wrongQuestionIds('),app.indexOf('function reviewCards(')),context);
 context.startRun('exam',undefined,'abseilen');assert.equal(context.run.mode,'exam');assert.equal(context.run.course,'abseilen');assert.equal(context.run.ids.length,20);
 const [correctId,wrongId,unansweredId]=context.run.ids;
 const result={course:'abseilen',ids:[correctId,wrongId,unansweredId],answers:{[correctId]:context.question(correctId).correct,[wrongId]:(context.question(wrongId).correct+1)%3}};
 context.run=null;context.startMistakeTraining(result);assert.equal(context.run.course,'abseilen');assert.equal(context.run.training,true);assert.deepEqual(Array.from(context.run.ids),[wrongId,unansweredId]);assert.equal(context.run.mode,'learn');
});
