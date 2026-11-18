'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const app=read('dist/app.js'),html=read('dist/index.html'),sw=read('dist/sw.js'),css=read('dist/experience.css');
const scope={};for(const path of ['dist/practice-bank.js','dist/practice-expansion.js','dist/practice-expansion-final.js'])vm.runInNewContext(read(path),scope);
const prefix=app.slice(app.indexOf('const QUIZ_ILLUSTRATIONS ='),app.indexOf('function quizView() {'));
const {map,render}=new Function('esc','I18N',prefix+'return {map:QUIZ_ILLUSTRATIONS,render:questionIllustration};')(v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),{t:()=> 'Vorschau'});
test('eight optional pilot images use existing forklift question IDs only',()=>{
 assert.equal(Object.keys(map).length,8);
 const questions=scope.ABBATE_PRACTICE_BANK.questions;assert.equal(questions.length,350);
 for(const q of questions){
   const result=render(q);
   if(Object.hasOwn(map,q.id)){
     assert.equal(q.course,'gabelstapler');
     assert.match(result,/data-action="quiz-illustration"/);
     assert.match(result,/aria-haspopup="dialog"/);
     assert.match(render(q,true),/question-illustration-large/);
     const file='dist/'+map[q.id].slice(2);
     assert.match(read(file),/^<svg[^>]*viewBox="0 0 800 400"/);
     assert.doesNotMatch(read(file),/<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/);
     assert.ok(sw.includes(JSON.stringify(map[q.id])));
   }else assert.equal(result,'');
 }
 assert.equal(render({course:'krane',id:Object.keys(map)[0]},true),'');
 assert.equal(render(null),'');
});
test('pilot is optional in all learning modes and does not modify answers',()=>{
 assert.match(app,/\$\{questionIllustration\(q\)\}<div class="answers"/);
 assert.match(app,/action==='quiz-illustration'&&run&&route==='uebung'/);
 assert.match(app,/if\(illustration\)modal\(esc\(I18N\.t\(10\)\),illustration\)/);
 assert.match(css,/\.question-illustration img,\.question-illustration-large img\{[^}]*height:auto/);
 assert.match(app,/event\.target\.closest\('figure'\)\.hidden=true/);
 assert.match(html,/app\.js\?v=41"/);
 assert.match(sw,/"\.\/app\.js\?v=41"/);
 assert.match(html,/experience\.css\?v=7"/);
 assert.match(sw,/"\.\/experience\.css\?v=7"/);
});
