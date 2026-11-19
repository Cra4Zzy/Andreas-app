'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const riggingMap={"a-neigungswinkel":"lasten","l-spreizwinkel":"lasten","l2-tragfaehigkeit":"lasten","l2-aufhaengung":"lasten","a-probehub":"lasten","l2-anheben":"lasten","a-schwerpunkt":"lasten","l-schwerpunkt":"lasten","l2-einseitig":"lasten","a-kantenschutz":"lasten","l-kantenschutz":"lasten","a-sichtpruefung":"lasten","l-sichtpruefung":"lasten","l2-kettenriss":"lasten","l2-fasern":"lasten","a-haken":"lasten","l2-lasthaken":"lasten","l2-schaekel":"lasten","l-ablegen":"lasten","a-lastweg":"lasten","l2-transportweg":"lasten","a-abstimmung":"lasten","l-zeichen":"lasten","l2-einweiserrolle":"lasten","a-vierstraenge":"lasten"};
const app=read('dist/app.js'),html=read('dist/index.html'),sw=read('dist/sw.js'),css=read('dist/experience.css');
const scope={};for(const path of ['dist/practice-bank.js','dist/practice-expansion.js','dist/practice-expansion-final.js'])vm.runInNewContext(read(path),scope);
const prefix=app.slice(app.indexOf('const QUIZ_ILLUSTRATIONS ='),app.indexOf('function quizView() {'));
const {map,render}=new Function('esc','I18N',prefix+'return {map:QUIZ_ILLUSTRATIONS,render:questionIllustration};')(v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),{t:()=> 'Vorschau'});
test('50 illustrated questions use the approved forklift and slinging question IDs only',()=>{
 assert.equal(Object.keys(map).length,50);
 const questions=scope.ABBATE_PRACTICE_BANK.questions;assert.equal(questions.length,350);
 for(const q of questions){
   const result=render(q);
   if(Object.hasOwn(map,q.id)){
     assert.equal(q.course,Object.hasOwn(riggingMap,q.id)?'lasten':'gabelstapler');
     assert.match(result,/data-action="quiz-illustration"/);
     assert.match(result,/aria-haspopup="dialog"/);
     assert.match(render(q,true),/question-illustration-large/);
     const file='dist/'+map[q.id].slice(2);
     const bytes=fs.readFileSync(file);
     assert.match(file,/\/premium\/[\w-]+\.webp$/);
     assert.equal(bytes.toString('ascii',0,4),'RIFF');
     assert.equal(bytes.toString('ascii',8,12),'WEBP');
     assert.ok(bytes.length>10000&&bytes.length<200000);
     assert.match(result,/width="\d+" height="\d+"/);
     assert.ok(sw.includes(JSON.stringify(map[q.id])));
   }else assert.equal(result,'');
 }
 assert.equal(render({course:'krane',id:Object.keys(map)[0]},true),'');
 assert.equal(render({course:'gabelstapler',id:'a-neigungswinkel'},true),'');
 assert.equal(render({course:'lasten',id:'g-kurvenfahrt'},true),'');
 assert.equal(render(null),'');
});
test('pilot is optional in all learning modes and does not modify answers',()=>{
 assert.match(app,/\$\{questionIllustration\(q\)\}<div class="answers"/);
 assert.match(app,/action==='quiz-illustration'&&run&&route==='uebung'/);
 assert.match(app,/if\(illustration\)modal\(esc\(I18N\.t\(10\)\),illustration\)/);
 assert.match(css,/\.question-illustration img,\.question-illustration-large img\{[^}]*height:auto/);
 assert.match(app,/event\.target\.closest\('figure'\)\.hidden=true/);
 assert.match(html,/app\.js\?v=45"/);
 assert.match(sw,/"\.\/app\.js\?v=45"/);
 assert.match(html,/experience\.css\?v=8"/);
 assert.match(sw,/"\.\/experience\.css\?v=8"/);
});

test('half the forklift questions have neutral photo scenes and retired vectors are not cached',()=>{
 assert.equal(new Set(Object.values(map)).size,34);
 assert.deepEqual(Object.keys(map).sort(),["a-abstimmung","a-haken","a-kantenschutz","a-lastweg","a-neigungswinkel","a-probehub","a-schwerpunkt","a-sichtpruefung","a-vierstraenge","g-anbaugeraet","g-batterieladen","g-flurpruefung","g-fussgaenger","g-gabelabsenken","g-gabelabstand","g-kurvenfahrt","g-ladebruecke","g-ladungssicherung","g-lastschwerpunkt","g-mangelmelden","g-neigung","g-personen","g-reifen","g-rueckhalt","g-schieflast","g-tore","g-transporthoehe","g-verkehrswege","g2-lagerregal","g2-rampe","g2-sichtladung","g2-transportsicherung","g2-uebergabe","g2-zinke","l-ablegen","l-kantenschutz","l-schwerpunkt","l-sichtpruefung","l-spreizwinkel","l-zeichen","l2-anheben","l2-aufhaengung","l2-einseitig","l2-einweiserrolle","l2-fasern","l2-kettenriss","l2-lasthaken","l2-schaekel","l2-tragfaehigkeit","l2-transportweg"]);
 assert.equal(scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='gabelstapler').length,50);
 assert.equal(scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='gabelstapler'&&render(q)).length,25);
 assert.doesNotMatch(sw,/assets\/quiz\/g[^"]+\.svg/);
 assert.doesNotMatch(css,/\.question-illustration img,\.question-illustration-large img\{[^}]*aspect-ratio:2\/1/);
});


test('25 rigging questions are illustrated and the original neutral angle image remains',()=>{
 const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='lasten');
 assert.equal(qs.length,50);
 assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),["a-abstimmung","a-haken","a-kantenschutz","a-lastweg","a-neigungswinkel","a-probehub","a-schwerpunkt","a-sichtpruefung","a-vierstraenge","l-ablegen","l-kantenschutz","l-schwerpunkt","l-sichtpruefung","l-spreizwinkel","l-zeichen","l2-anheben","l2-aufhaengung","l2-einseitig","l2-einweiserrolle","l2-fasern","l2-kettenriss","l2-lasthaken","l2-schaekel","l2-tragfaehigkeit","l2-transportweg"]);
 assert.equal(map['a-neigungswinkel'],"./assets/quiz/premium/a-neigungswinkel.webp");
 assert.equal(map['l-spreizwinkel'],map['a-neigungswinkel']);
 assert.match(render(qs.find(q=>q.id==='a-neigungswinkel')),/width="682" height="200"/);
 assert.equal(JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]).filter(a=>a===map['a-neigungswinkel']).length,1);
});
