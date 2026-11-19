'use strict';
// Run from repository root after all 25 reviewed WebP illustrations have been supplied.
// Usage: node scripts/integrate-rigging-illustrations.cjs /path/to/reviewed-webp-files
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const plan = require('../docs/lasten-quiz-bildplan.json');
const input = process.argv[2];
assert(input, 'Please supply a directory with the 25 reviewed, question-ID-named WebP files.');
function read(p) { return fs.readFileSync(p, 'utf8'); }
function dimensions(b) {
  assert(b.length >= 30 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP', 'Invalid WebP file');
  const t=b.toString('ascii',12,16);
  if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
  if(t==='VP8L') {
    assert.equal(b[20],0x2f); const n=b.readUInt32LE(21); return [(n&0x3fff)+1,((n>>>14)&0x3fff)+1];
  }
  if(t==='VP8 ') {
    assert.equal(b.toString('hex',23,26),'9d012a');return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  }
  throw Error('Unsupported WebP encoding');
}
const qscope={};
for(const p of ['dist/practice-bank.js','dist/practice-expansion.js','dist/practice-expansion-final.js']) vm.runInNewContext(read(p),qscope);
const questions=qscope.ABBATE_PRACTICE_BANK.questions;
assert.equal(questions.filter(q=>q.course==='lasten').length,50);
assert.equal(plan.questions.length,25);
assert.equal(new Set(plan.questions.map(q=>q.id)).size,25);
const seen=new Set();
const assets=plan.questions.map(q=>{
  assert(questions.some(x=>x.id===q.id&&x.course==='lasten'),'Unknown rigging question: '+q.id);
  assert.equal(q.file,q.id+'.webp');
  const bytes=fs.readFileSync(path.join(input,q.file));
  assert(bytes.length>10000&&bytes.length<200000,'Expected 10–200 KB: '+q.file);
  const [w,h]=dimensions(bytes);
  assert(w>=320&&h>=160&&w/h>=1&&w/h<=4,'Unexpected image dimensions: '+q.file);
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');
  assert(!seen.has(hash),'Duplicate illustration: '+q.file);seen.add(hash);
  return {id:q.id,bytes,dims:[w,h],url:'./assets/quiz/premium/'+q.file};
});
const appPath='dist/app.js',htmlPath='dist/index.html',swPath='dist/sw.js';
let app=read(appPath),html=read(htmlPath),sw=read(swPath);
function object(name) {
  const match=app.match(new RegExp('const '+name+' = Object\\.freeze\\((\\{[^\\n]+\\})\\);'));
  assert(match,'Missing illustration mapping: '+name);return [match[0],JSON.parse(match[1])];
}
const [mapSource,map]=object('QUIZ_ILLUSTRATIONS');
const [dimsSource,dims]=object('QUIZ_ILLUSTRATION_DIMENSIONS');
const [coursesSource,courses]=object('QUIZ_ILLUSTRATION_COURSES');
const originalForklift=Object.fromEntries(Object.entries(map).filter(([id])=>!courses[id]));
assert.equal(Object.keys(originalForklift).length,25);
// Preserve every forklift mapping; replace existing rigging mappings, including the reused angle image.
const oldRiggingUrls=Object.keys(courses).filter(id=>courses[id]==='lasten').map(id=>map[id]);
for(const id of Object.keys(courses)) if(courses[id]==='lasten'){delete map[id];delete dims[id];delete courses[id];}
for(const a of assets){map[a.id]=a.url;dims[a.id]=a.dims;courses[a.id]='lasten';}
assert.equal(Object.keys(map).length,50);
assert.deepEqual(Object.fromEntries(Object.entries(map).filter(([id])=>!courses[id])),originalForklift);
for(const [source,name,obj] of [[mapSource,'QUIZ_ILLUSTRATIONS',map],[dimsSource,'QUIZ_ILLUSTRATION_DIMENSIONS',dims],[coursesSource,'QUIZ_ILLUSTRATION_COURSES',courses]]) app=app.replace(source,'const '+name+' = Object.freeze('+JSON.stringify(obj)+');');
const cacheAssets=sw.match(/const ASSETS=(\[[^\n]+\]);/);
assert(cacheAssets,'Missing service worker asset list');
const urls=JSON.parse(cacheAssets[1]).filter(u=>!oldRiggingUrls.includes(u)||Object.values(originalForklift).includes(u));
for(const a of assets)if(!urls.includes(a.url))urls.push(a.url);
sw=sw.replace(cacheAssets[0],'const ASSETS='+JSON.stringify(urls)+';');
const version=html.match(/app\.js\?v=(\d+)/);
assert(version,'Missing application asset version');
const previous=version[0],next='app.js?v='+(Number(version[1])+1);
assert(sw.includes(previous));html=html.replaceAll(previous,next);sw=sw.replaceAll(previous,next);
assert.match(sw,/abbate-learning-v\d+/);
sw=sw.replace(/abbate-learning-v(\d+)/,(_,n)=>'abbate-learning-v'+(Number(n)+1));
new vm.Script(app);new vm.Script(sw);
// Update the former two-image pilot test to reflect the approved 25-question mapping.
const testPath='tests/quiz-illustrations.test.cjs';
const testSource=read(testPath);
assert(testSource.includes("27 illustrated questions")&&testSource.includes("recovered neutral rigging photo"),'Pilot tests changed; review before integration.');
const forkliftIds=Object.keys(originalForklift).sort();
const newTest="'use strict';\n"+
"const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');\n"+
"const read=p=>fs.readFileSync(p,'utf8');\n"+
"const app=read('dist/app.js'),html=read('dist/index.html'),sw=read('dist/sw.js'),css=read('dist/experience.css');\n"+
"const scope={};for(const p of ['dist/practice-bank.js','dist/practice-expansion.js','dist/practice-expansion-final.js'])vm.runInNewContext(read(p),scope);\n"+
"const prefix=app.slice(app.indexOf('const QUIZ_ILLUSTRATIONS ='),app.indexOf('function quizView() {'));\n"+
"const {map,render}=new Function('esc','I18N',prefix+'return {map:QUIZ_ILLUSTRATIONS,render:questionIllustration};')(String,{t:()=> 'Vorschau'});\n"+
"const forkliftIds="+JSON.stringify(forkliftIds)+", riggingIds="+JSON.stringify(assets.map(a=>a.id).sort())+";\n"+
"test('exactly 25 illustrated questions in each approved course',()=>{"+
"const qs=scope.ABBATE_PRACTICE_BANK.questions;assert.equal(qs.length,350);assert.equal(Object.keys(map).length,50);"+
"for(const [course,ids] of [['gabelstapler',forkliftIds],['lasten',riggingIds]]){"+
"const group=qs.filter(q=>q.course===course);assert.equal(group.length,50);assert.deepEqual(Array.from(group.filter(q=>render(q)),q=>q.id).sort(),ids);}"+
"for(const q of qs){const r=render(q);if(!Object.hasOwn(map,q.id)){assert.equal(r,'');continue;}"+
"assert.match(r,/data-action=\"quiz-illustration\"/);assert.match(r,/aria-haspopup=\"dialog\"/);assert.match(r,/width=\"\\d+\" height=\"\\d+\"/);assert.match(render(q,true),/question-illustration-large/);"+
"assert.match(map[q.id],/\\/premium\\/[\\w-]+\\.webp$/);const b=fs.readFileSync('dist/'+map[q.id].slice(2));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.ok(b.length>10000&&b.length<200000);"+
"assert.ok(sw.includes(JSON.stringify(map[q.id])));}"+
"assert.equal(render({id:riggingIds[0],course:'gabelstapler'}),'');assert.equal(render({id:forkliftIds[0],course:'lasten'}),'');assert.equal(render(null),'');});\n"+
"test('25 distinct rigging assets are cached exactly once',()=>{const list=JSON.parse(sw.match(/const ASSETS=(\\[[^\\n]+\\]);/)[1]);const hashes=riggingIds.map(id=>{const u=map[id];assert.equal(list.filter(x=>x===u).length,1);return crypto.createHash('sha256').update(fs.readFileSync('dist/'+u.slice(2))).digest('hex');});assert.equal(new Set(hashes).size,25);});\n"+
"test('illustration interaction and asset versions stay intact',()=>{assert.match(app,/\\$\\{questionIllustration\\(q\\)\\}<div class=\"answers\"/);assert.match(app,/action==='quiz-illustration'&&run&&route==='uebung'/);assert.match(css,/\\.question-illustration img,\\.question-illustration-large img\\{[^}]*height:auto/);assert.ok(sw.includes(html.match(/app\\.js\\?v=\\d+/)[0]));});\n";
new vm.Script(newTest);
// Nothing above writes to the repository: missing or invalid assets fail before any updates.
for(const a of assets)fs.writeFileSync(path.join('dist',a.url.slice(2)),a.bytes);
fs.writeFileSync(appPath,app);fs.writeFileSync(htmlPath,html);fs.writeFileSync(swPath,sw);fs.writeFileSync(testPath,newTest);
console.log('Integrated exactly 25 unique rigging assets. Run node --test tests/quiz-illustrations.test.cjs and the full regression suite before publishing.');
