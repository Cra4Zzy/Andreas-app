'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(read('dist/practice-bank.js'),sandbox);
vm.runInNewContext(read('dist/practice-expansion.js'),sandbox);
const existing=sandbox.ABBATE_PRACTICE_BANK.questions;
const added=sandbox.ABBATE_PRACTICE_EXPANSION.questions;
const courses=['gabelstapler','hebebuehnen','krane','lasten','bagger'];
const app=read('dist/app.js'),html=read('dist/index.html'),sw=read('dist/sw.js'),css=read('dist/styles.css');

test('25 additional original source-linked, awaiting-review questions in existing five courses',()=>{
 assert.equal(existing.length,75,'preexisting bank must remain untouched');
 assert.equal(added.length,25);
 assert.deepEqual(Object.keys(sandbox.ABBATE_PRACTICE_EXPANSION.sources).sort(),courses.slice().sort());
 const ids=new Set(existing.map(q=>q.id));
 for(const course of courses){
   const list=added.filter(q=>q.course===course);
   assert.equal(list.length,5,course);
   const source=sandbox.ABBATE_PRACTICE_EXPANSION.sources[course];
   assert.match(source.url,/^https:\/\/publikationen\.dguv\.de\//);
   assert.match(source.title,/DGUV/);
   for(const q of list){
     assert.ok(!ids.has(q.id),'duplicate: '+q.id);
     ids.add(q.id);
     assert.equal(q.reviewed,false,'question cannot claim approved status');
     assert.equal(q.sourceUrl,source.url);
     assert.equal(q.source,source.title);
     assert.ok(q.title.length>20);
     assert.ok(q.context.length>10);
     assert.equal(q.answers.length,3);
     assert.equal(new Set(q.answers).size,3);
     assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<3);
     assert.ok(q.why.length>35);
   }
 }
});
test('existing 52 ungraded source questions never move into graded quiz',()=>{
 assert.match(app,/52 Originalfragen \(unbewertet\)/);
 assert.match(app,/\.\.\.PRACTICE_BANK\.questions,/);
 assert.match(app,/PRACTICE_EXPANSION\?\.questions/);
 assert.match(app,/const courseQuestions=id=>QUESTIONS\.filter/);
});
test('error-only replay builds fresh learn run from actually incorrect or unanswered IDs',()=>{
 assert.match(app,/else if\(action==='retry-wrong'\)/);
 assert.match(app,/source\.answers\[id\]!==q\.correct/);
 assert.match(app,/startRun\('learn',undefined,source\.course,wrongIds\)/);
 assert.match(app,/ids=Array\.isArray\(onlyIds\)\?\[\.\.\.new Set\(onlyIds\)\]\.filter\(id=>baseIds\.includes\(id\)\):baseIds/);
 assert.match(app,/retry:Array\.isArray\(onlyIds\)/);
 assert.match(app,/data-action="retry-wrong"/);
});
test('simulation keeps scoring transparent and never claims official certification',()=>{
 assert.match(app,/mock-exam-banner/);
 assert.match(app,/MAXIMAL/);
 assert.match(app,/1 Punkt je richtige Antwort/);
 assert.match(app,/mock-exam-summary/);
 assert.match(app,/keine offizielle Bestehensgrenze/);
 assert.match(css,/quiz-shell-exam/);
});
test('page and service worker load versioned expanded bank before app bundle',()=>{
 assert.ok(html.indexOf('practice-bank.js?v=1')<html.indexOf('practice-expansion.js?v=1'));
 assert.ok(html.indexOf('practice-expansion.js?v=1')<html.indexOf('app.js?v=29'));
 assert.ok(sw.includes('practice-expansion.js?v=1'));
 assert.ok(sw.includes('app.js?v=29'));
});

test('result screen is compact, has accessible expanded details and retains wrong-only replay',()=>{
 assert.match(app,/function resultBreakdown\(result\)/);
 assert.match(app,/function reviewCards\(result\)/);
 assert.match(app,/compact-result-metrics/);
 assert.match(app,/compact-result-meter/);
 assert.match(app,/compact-review-item/);
 assert.match(app,/compact-review-correct-group/);
 assert.match(app,/data-action="retry-wrong"/);
 assert.match(app,/source\.answers\[id\]!==q\.correct/);
 assert.match(css,/\.compact-review-item\[open\]/);
 assert.match(css,/\.compact-result-actions/);
 assert.doesNotMatch(app,/function reviewCards\(result\) \{ return \(result\.ids/);
});
