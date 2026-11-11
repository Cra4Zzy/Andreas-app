'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync('dist/app.js','utf8');
const begin=code.indexOf('const ROUND_QUESTION_LIMIT=20;');
const end=code.indexOf('function startRun(',begin);
assert.ok(begin>0&&end>begin,'Round selection function must be present');
const pickerCode=code.slice(begin,end)+'\n globalThis.pick=selectRoundQuestions;';
function setup(count,history=[]){
 const questions=Array.from({length:count},(_,i)=>({id:'q'+i,topic:i%3===0?'a':'b'}));
 const ctx={data:{results:history},student:()=>({id:'learner'}),courseQuestions:()=>questions,Math,Map};
 ctx.globalThis=ctx;
 vm.runInNewContext(pickerCode,ctx);
 return ctx.pick;
}
const round=(ids)=>({student:'learner',course:'gabelstapler',mode:'learn',ids});
test('every learning round contains up to 20 distinct, valid questions',()=>{
 for(const n of [1,5,20,25,50]){
  const result=Array.from(setup(n)('gabelstapler'));
  assert.equal(result.length,Math.min(n,20));
  assert.equal(new Set(result).size,result.length);
  assert.ok(result.every(id=>Number(id.slice(1))<n));
 }
});
test('50-question pool gives fully different consecutive sets while varying order',()=>{
 const first=Array.from(setup(50)('gabelstapler'));
 const second=Array.from(setup(50,[round(first)])('gabelstapler'));
 assert.equal(second.length,20);
 assert.equal(first.filter(id=>second.includes(id)).length,0);
});
test('25-question pool minimizes unavoidable overlap with preceding round',()=>{
 const first=Array.from(setup(25)('gabelstapler'));
 const second=Array.from(setup(25,[round(first)])('gabelstapler'));
 assert.equal(first.filter(id=>second.includes(id)).length,15);
});
test('topic-specific practice draws only questions in that topic',()=>{
 const items=Array.from(setup(50)('gabelstapler','a'));
 assert.equal(items.length,17);
 assert.ok(items.every(id=>Number(id.slice(1))%3===0));
});
