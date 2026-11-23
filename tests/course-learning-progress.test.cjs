'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('dist/app.js','utf8');
const start=s.indexOf('const mastered = ()'),end=s.indexOf('let saveTimer,',start);
assert.ok(start>=0&&end>start);
const Q=[
{id:'g1',course:'gabelstapler',correct:0},{id:'g2',course:'gabelstapler',correct:1},
{id:'h1',course:'hebebuehnen',correct:0},{id:'k1',course:'krane',correct:0}];
function load({answered=[],mastered=[],results=[]}={}){
const context={QUESTIONS:Q,data:{selected:'learner',students:[{id:'learner'}],results,mastered:{learner:mastered},answered:{learner:answered}},
 student:()=>({id:'learner'}),courseQuestions:id=>Q.filter(q=>q.course===id),question:id=>Q.find(q=>q.id===id),Set,Number,Array,Object};
vm.runInNewContext(s.slice(start,end)+';globalThis.progress={answeredQuestions,courseProgress,rememberAnswered};',context);
return context;
}
test('correct and wrong attempts both count, repeats only once, courses remain isolated',()=>{
const ctx=load({results:[{student:'learner',ids:['g1','h1'],answers:{g1:2,h1:0}}]});
const p=ctx.progress;
assert.deepEqual(Array.from(p.answeredQuestions()).sort(),['g1','h1']);
assert.equal(p.courseProgress('gabelstapler').done,1);
assert.equal(p.courseProgress('hebebuehnen').done,1);
assert.equal(p.courseProgress('krane').done,0);
p.rememberAnswered('g1');p.rememberAnswered('g1');p.rememberAnswered('g2');
assert.equal(p.courseProgress('gabelstapler').done,2);
assert.equal(p.answeredQuestions().size,3);
});
test('historical mastered records remain counted after loss of old rounds',()=>{
const ctx=load({mastered:['k1','g1'],answered:['g1','h1','no-longer-valid'],results:[]});
assert.equal(ctx.progress.answeredQuestions().size,3);
assert.equal(ctx.progress.courseProgress('krane').done,1);
});
test('full learner overview displays per-category and overall unique counts',()=>{
assert.match(s,/Dein Fortschritt nach Fachbereich/);
assert.match(s,/courseProgress\(course\.id,answered\)/);
assert.match(s,/answered\.size\+' \/ '\+QUESTIONS\.length/);
assert.match(s,/rememberAnswered\(q\.id\);save\(\)/);
assert.match(s,/data\.answered=\{\[B\.me\.id\]:practice\.answered\}/);
});