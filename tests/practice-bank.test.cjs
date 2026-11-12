'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
const names=['gabelstapler','hebebuehnen','krane','lasten','bagger'];
const ctx={};
ctx.globalThis=ctx;
vm.runInNewContext(read('dist/practice-bank.js'),ctx,{filename:'dist/practice-bank.js'});
vm.runInNewContext(read('dist/practice-expansion.js'),ctx,{filename:'dist/practice-expansion.js'});
vm.runInNewContext(read('dist/practice-expansion-final.js'),ctx,{filename:'dist/practice-expansion-final.js'});
const bank=ctx.ABBATE_PRACTICE_BANK;

test('new questions populate ONLY the five existing qualification areas',()=>{
 assert.deepEqual(Object.keys(bank.courses).sort(),names.slice().sort());
 assert.equal(bank.questions.length,250);
 const seen=new Set();
 for(const name of names){
   const questions=bank.questions.filter(q=>q.course===name);
   assert.equal(questions.length,50,name+' needs 50 independently written graded questions');
   const ref=bank.courses[name];
   assert.match(ref.url,/^https:\/\/(publikationen\.dguv\.de)\//);
   assert.ok(ref.source.includes('DGUV'));
   assert.equal(ref.reviewed,false,'Fachprüfung must never be claimed as completed');
   for(const q of questions){
     assert.ok(!seen.has(q.id),'Duplicate ID '+q.id);seen.add(q.id);
     assert.ok(q.id.length<=80);
     assert.ok(q.title.length>22);
     assert.ok(q.context.length>=17);
     assert.equal(q.answers.length,3);
     assert.ok(q.answers.every(a=>a.length>13));
     assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<3);
     assert.ok(q.why.length>=45);
     assert.equal(q.source,ref.source);
   }
 }
});

test('existing course list is preserved and new exercises use its course-specific quiz flow',()=>{
 const app=read('dist/app.js');
 assert.match(app,/const COURSES=\[/);
 assert.match(app,/PRACTICE_BANK\.questions/);
 assert.match(app,/courseQuestions\(activeCourseId\)/);
 assert.match(app,/data-action="start-learn" data-course/);
 assert.match(app,/data-action="start-exam" data-course/);
 assert.match(app,/run=\{mode,course:activeCourseId,ids:/);
 assert.match(app,/categoryLabel=t\?\.name\|\|courseName/,'Quiz header must use current course for non-forklift exercises');
 assert.match(app,/course:COURSES\.some\(c=>c\.id===r\.course\)/);
 assert.doesNotMatch(app,/#lernfragen|theoryStudy|52 Originalfragen \(unbewertet\)/,'Legacy unanswered 52 items must not appear in learner practice');
 assert.match(app,/fachliche Freigabe durch die Fahrschule steht noch aus/i);
 assert.doesNotMatch(app,/offiziell.*zertifiziert/i);
 assert.doesNotThrow(()=>new vm.Script(app), 'app code must remain syntactically valid');
});

test('PWA loads offline question bank before the app and caches both',()=>{
 const html=read('dist/index.html'),sw=read('dist/sw.js');
 assert.ok(html.indexOf('practice-bank.js?v=1')<html.indexOf('app.js?v=34'));
 assert.ok(sw.includes('practice-bank.js?v=1'));
 assert.ok(html.includes('practice-expansion.js?v=1'));
 assert.ok(sw.includes('practice-expansion.js?v=1'));
 assert.ok(html.includes('practice-expansion-final.js?v=1'));
 assert.ok(sw.includes('practice-expansion-final.js?v=1'));
 assert.ok(html.indexOf('practice-expansion.js?v=1')<html.indexOf('practice-expansion-final.js?v=1'));
 assert.ok(html.indexOf('practice-expansion-final.js?v=1')<html.indexOf('app.js?v=34'));
 assert.ok(html.indexOf('practice-bank.js?v=1')<html.indexOf('practice-expansion.js?v=1'));
 assert.ok(html.indexOf('practice-expansion.js?v=1')<html.indexOf('app.js?v=34'));
 assert.ok(sw.includes('app.js?v=34'));
 assert.ok(sw.includes('abbate-learning-v40'));
});
