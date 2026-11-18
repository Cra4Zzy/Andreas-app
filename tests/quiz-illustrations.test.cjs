'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const app=read('dist/app.js'),html=read('dist/index.html'),sw=read('dist/sw.js'),css=read('dist/experience.css');
const scope={};for(const path of ['dist/practice-bank.js','dist/practice-expansion.js','dist/practice-expansion-final.js'])vm.runInNewContext(read(path),scope);
const prefix=app.slice(app.indexOf('const QUIZ_ILLUSTRATIONS ='),app.indexOf('function quizView() {'));
const {map,render}=new Function('esc','I18N',prefix+'return {map:QUIZ_ILLUSTRATIONS,render:questionIllustration};')(v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),{t:()=> 'Vorschau'});
test('five premium pilot images use existing forklift question IDs only',()=>{
 assert.equal(Object.keys(map).length,5);
 const questions=scope.ABBATE_PRACTICE_BANK.questions;assert.equal(questions.length,350);
 for(const q of questions){
   const result=render(q);
   if(Object.hasOwn(map,q.id)){
     assert.equal(q.course,'gabelstapler');
     assert.match(result,/data-action="quiz-illustration"/);
     assert.match(result,/aria-haspopup="dialog"/);
     assert.match(render(q,true),/question-illustration-large/);
     const file='dist/'+map[q.id].slice(2);
     const bytes=fs.readFileSync(file);
     assert.match(file,/\/premium\/[\w-]+\.webp$/);
     assert.equal(bytes.toString('ascii',0,4),'RIFF');
     assert.equal(bytes.toString('ascii',8,12),'WEBP');
     assert.ok(bytes.length>25000&&bytes.length<200000);
     assert.match(result,/width="\d+" height="\d+"/);
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
 assert.match(html,/app\.js\?v=42"/);
 assert.match(sw,/"\.\/app\.js\?v=42"/);
 assert.match(html,/experience\.css\?v=8"/);
 assert.match(sw,/"\.\/experience\.css\?v=8"/);
});

test('only the five approved question IDs are illustrated and retired vectors are not cached',()=>{
 assert.deepEqual(Object.keys(map).sort(),['g-kurvenfahrt','g-lastschwerpunkt','g-personen','g2-lagerregal','g2-sichtladung']);
 assert.doesNotMatch(sw,/assets\/quiz\/g[^"]+\.svg/);
 assert.doesNotMatch(css,/\.question-illustration img,\.question-illustration-large img\{[^}]*aspect-ratio:2\/1/);
});
