'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ctx={};ctx.globalThis=ctx;
for(const name of ['practice-bank.js','practice-expansion.js','practice-expansion-final.js','i18n-modern.js'])vm.runInNewContext(read('dist/'+name),ctx);
const bank=ctx.ABBATE_PRACTICE_BANK;
const ids=bank.questions.map(q=>q.id);
const cargo=bank.questions.filter(q=>q.course==='ladungssicherung');
const locales=['uk','ru','cs','bg','hr','da','nl','en','et','fi','fr','el','hu','ga','it','lv','lt','mt','pl','pt','ro','sk','sl','es','sv'];
test('cargo category has exactly 50 isolated stable questions and all app labels',()=>{
 assert.equal(cargo.length,50);
 assert.equal(new Set(ids).size,350);
 for(const q of cargo){assert.match(q.id,/^ls-/);assert.equal(new Set(q.answers).size,3);assert.ok(q.correct>=0&&q.correct<3);}
 for(const code of locales){for(const phrase of ['Ladungssicherung','Ladung sicher verteilen, verstauen und sichern.','50 Übungsfragen','Ladungssicherung üben'])assert.ok(ctx.ABBATE_I18N_MODERN[phrase]?.[code],code+' '+phrase);}
 const app=read('dist/app.js');
 assert.match(app,/"id":"ladungssicherung"/);
 assert.match(app,/const ROUND_QUESTION_LIMIT=20/);
 assert.match(app,/const courseQuestions=id=>QUESTIONS.filter/);
});
test('all 25 translated packs must match the complete question IDs before deployment',()=>{
 for(const code of locales){
  const locale={};locale.globalThis=locale;
  vm.runInNewContext(read('dist/practice-translations/'+code+'.js'),locale);
  const pack=locale.ABBATE_QUESTION_TRANSLATIONS[code];
  assert.equal(Object.keys(pack).length,350,code+' count');
  for(const id of ids){const fields=pack[id];assert.ok(Array.isArray(fields)&&fields.length===6&&fields.every(s=>typeof s==='string'&&s.trim().length>=3),code+'/'+id);}
  for(const q of bank.questions){const fields=pack[q.id];assert.equal(new Set(fields.slice(2,5).map(s=>s.trim().toLocaleLowerCase())).size,3,code+'/'+q.id+' duplicate choices');}
 }
});
