'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('login and portal pages expose the four-language choice before authentication',()=>{
 for(const p of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
   const html=read(p);
   assert.match(html,/id="portal-language"/);
   for(const lang of ['de','uk','ru','cs'])assert.ok(html.includes('option value="'+lang+'"'),p+' lacks '+lang);
   assert.match(html,/portal-language\.js\?v=1/);
   assert.match(html,/portal\.css\?v=6/);
 }
});
test('portal translation does not modify password, form values, or stored user data',()=>{
 const code=read('dist/portal-language.js');
 assert.match(code,/abbate-language-v1/);
 assert.match(code,/MutationObserver\(apply\)/);
 assert.match(code,/NodeFilter\.SHOW_TEXT/);
 assert.doesNotMatch(code,/\.innerHTML\s*=/);
 for(const term of ['Зареєструвати обліковий запис','Зарегистрировать учётную запись','Zaregistrovat účet']){
   assert.ok(code.includes(term),'Missing '+term);
 }
});
