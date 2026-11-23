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
 vm.runInNewContext(s.slice(start,end)+';globalThis.progress={answeredQuestions,correctlyAnsweredQuestions,courseProgress,rememberAnswered};',context);
 return context;
}
test('only correct learning answers count in category and total progress',()=>{
 const ctx=load({results:[{student:'learner',ids:['g1','h1'],answers:{g1:2,h1:0}}]});
 const p=ctx.progress;
 assert.deepEqual(Array.from(p.correctlyAnsweredQuestions()).sort(),['h1']);
 assert.equal(p.courseProgress('gabelstapler').done,0,'wrong answer is not progress');
 assert.equal(p.courseProgress('hebebuehnen').done,1);
 assert.equal(p.courseProgress('krane').done,0);
 p.rememberAnswered('g1');p.rememberAnswered('g2');
 assert.equal(p.answeredQuestions().size,3,'answered history remains stored');
 assert.equal(p.correctlyAnsweredQuestions().size,1,'answered history does not inflate correct progress');
});
test('historical correct questions count once each per category',()=>{
 const ctx=load({mastered:['k1','g1','g1'],answered:['g1','h1','no-longer-valid'],results:[{student:'learner',ids:['g1','g2'],answers:{g1:0,g2:1}}]});
 const p=ctx.progress;
 assert.equal(p.correctlyAnsweredQuestions().size,3);
 assert.equal(p.courseProgress('gabelstapler').done,2);
 assert.equal(p.courseProgress('krane').done,1);
 assert.equal(p.courseProgress('hebebuehnen').done,0);
});
test('learner overview shows correct answers and removes unwanted explanatory paragraph',()=>{
 assert.match(s,/Dein Fortschritt nach Fachbereich/);
 assert.match(s,/Richtig beantwortete Fragen/);
 assert.match(s,/courseProgress\(course\.id,correct\)/);
 assert.doesNotMatch(s,/Jede beantwortete Lernfrage zählt einmal/);
 assert.match(s,/\['Lernrunden',rounds\]/);
});