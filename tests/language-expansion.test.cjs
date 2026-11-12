'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function boot(){
  const context={console};
  context.globalThis=context;
  vm.createContext(context);
  for(const name of ['i18n-packs.js','i18n-ru.js','i18n-uk.js','i18n-modern.js','i18n.js']){
    vm.runInContext(read('dist/'+name),context,{filename:name});
  }
  return context.ABBATE_I18N;
}
test('Russian, Ukrainian and Czech are selectable and have complete phrase catalogues',async()=>{
 const i18n=boot();
 for(const code of ['ru','uk','cs']){
   const lang=i18n.languages.find(x=>x.code===code);
   assert.ok(lang,code+' not selectable');
   assert.ok(lang.name&&lang.locale);
   const pack=await i18n.load(code);
   assert.equal(pack.length,i18n.sourceCount,code+' incomplete catalogue');
   assert.ok(pack.every(x=>typeof x==='string'&&x.trim().length>0),code+' has empty phrase');
   assert.notEqual(i18n.t(0),'Start',code+' retained untranslated home label');
   assert.equal(i18n.code,code);
   const translated=i18n.text('Gabelstapler');
   assert.notEqual(translated,'Gabelstapler',code+' has no production forklift terminology');
   assert.ok(i18n.text('Hebebühnen').length>0);
 }
});
test('critical German source format variables remain available for all 3 languages',async()=>{
 const i18n=boot();
 const ids=[15,18,41,42,49,65,75,91,100,165,206,209,236,237,238];
 for(const code of ['ru','uk','cs']){
   const pack=await i18n.load(code);
   const german=await i18n.load('de');
   for(const id of ids){
      const keys=(german[id].match(/\{[a-z]+\}/g)||[]);
      for(const key of keys){
        assert.ok(pack[id].includes(key),code+' lost '+key+' in phrase '+id);
      }
   }
 }
});
test('the original 52 theory questions are not falsely presented as reviewed translations',()=>{
  const source=read('dist/app.js');
  assert.doesNotMatch(source,/theoryLang/,'Ungraded legacy catalogue is no longer in learner navigation');
  assert.match(source,/Die Fachfragen und Antworten liegen derzeit nur auf Deutsch vor/);
  assert.match(source,/Die richtige Antwort wurde noch nicht von Andreas bestätigt/);
});
