'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const app=fs.readFileSync('dist/app.js','utf8');
const begin=app.indexOf('const ROUND_QUESTION_LIMIT=20;');
const end=app.indexOf('function startRun(',begin);
assert.ok(begin>0&&end>begin,'Adaptive picker must be present');
const pickerCode=app.slice(begin,end)+'\nglobalThis.pick=selectRoundQuestions;globalThis.state=questionLearningState;';
const BASE=Date.parse('2026-11-12T12:00:00Z');
const day=n=>new Date(BASE+n*86400000).toISOString();
const result=(ids,answers,at=day(0),course='gabelstapler',student='learner')=>
 ({id:'r-'+at,student,course,mode:'learn',ids,answers,at});
function setup(count,history=[]){
 const questions=Array.from({length:count},(_,i)=>({id:'q'+i,topic:i%3===0?'a':'b',correct:0,course:'gabelstapler'}));
 const context={data:{results:history},student:()=>({id:'learner'}),
   courseQuestions:()=>questions,question:id=>questions.find(q=>q.id===id),Math,Map,Set,Date};
 context.globalThis=context;
 vm.runInNewContext(pickerCode,context,{filename:'adaptive-picker'});
 return context;
}
test('adaptive rounds cap at 20 and use unique valid questions',()=>{
 for(const n of [1,5,20,25,50]){
  const ids=Array.from(setup(n).pick('gabelstapler',undefined,BASE));
  assert.equal(ids.length,Math.min(20,n));
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(ids.every(id=>Number(id.slice(1))<n));
 }
});
test('with 50 questions, two consecutive rounds use disjoint unseen sets',()=>{
 const first=Array.from(setup(50).pick('gabelstapler',undefined,BASE));
 const prior=result(first,Object.fromEntries(first.map(id=>[id,0])));
 const second=Array.from(setup(50,[prior]).pick('gabelstapler',undefined,BASE+3600000));
 assert.equal(second.length,20);
 assert.equal(second.filter(id=>first.includes(id)).length,0);
});
test('with 25 questions, only the unavoidable 15 repeat',()=>{
 const first=Array.from(setup(25).pick('gabelstapler',undefined,BASE));
 const prior=result(first,Object.fromEntries(first.map(id=>[id,0])));
 const second=Array.from(setup(25,[prior]).pick('gabelstapler',undefined,BASE+3600000));
 assert.equal(second.filter(id=>first.includes(id)).length,15);
});
test('unseen questions precede all repeated questions',()=>{
 const prior=result(['q0','q1','q2'],{q0:1,q1:0,q2:0});
 const selected=Array.from(setup(23,[prior]).pick('gabelstapler',undefined,BASE+2*86400000));
 assert.equal(selected.length,20);
 assert.ok(selected.every(id=>!['q0','q1','q2'].includes(id)));
});
test('due mistakes outrank correct due reviews and mastered items',()=>{
 const ids=Array.from({length:25},(_,i)=>'q'+i);
 const answers=Object.fromEntries(ids.map(id=>[id,0]));
 answers.q0=1;
 const prior=result(ids,answers);
 const ctx=setup(25,[prior]);
 const selection=Array.from(ctx.pick('gabelstapler',undefined,BASE+86400000+1000));
 assert.ok(selection.includes('q0'),'due error must be included');
 const state=ctx.state('gabelstapler',BASE+86400000+1000);
 assert.equal(state.get('q0').correct,false);
 assert.equal(state.get('q0').streak,0);
});
test('failed answers are delayed one day and correct streaks expand spacing',()=>{
 const first=result(['q0','q1'],{q0:0,q1:2},day(0));
 const second=result(['q0'],{q0:0},day(1));
 const third=result(['q0'],{q0:0},day(4));
 const states=setup(5,[first,second,third]).state('gabelstapler',BASE+4*86400000);
 assert.equal(states.get('q0').streak,3);
 assert.equal(states.get('q0').dueAt,BASE+11*86400000);
 assert.equal(states.get('q1').dueAt,BASE+86400000);
});
test('wrong answer resets mastery streak and becomes due after a day',()=>{
 const a=result(['q0'],{q0:0},day(0));
 const b=result(['q0'],{q0:0},day(1));
 const c=result(['q0'],{q0:1},day(4));
 const state=setup(4,[a,b,c]).state('gabelstapler',BASE+4*86400000).get('q0');
 assert.equal(state.streak,0);
 assert.equal(state.correct,false);
 assert.equal(state.dueAt,BASE+5*86400000);
});
test('another user or course does not influence personal learning state',()=>{
 const external=result(['q0'],{q0:1},day(0),'gabelstapler','other');
 const elsewhere=result(['q1'],{q1:1},day(0),'krane','learner');
 const ids=Array.from(setup(2,[external,elsewhere]).pick('gabelstapler',undefined,BASE));
 assert.deepEqual(ids.sort(),['q0','q1']);
});
test('topic practice remains within selected topic',()=>{
 const ids=Array.from(setup(50).pick('gabelstapler','a',BASE));
 assert.equal(ids.length,17);
 assert.ok(ids.every(id=>Number(id.slice(1))%3===0));
});
