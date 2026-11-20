'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=["index.html","dist/index.html","dist/konto.html","dist/nachweise.html","dist/verwaltung.html","dist/theorie-katalog.html","dist/agb.html","dist/datenschutz.html","dist/widerruf.html","dist/konto-loeschen.html","dist/impressum.html"];
test('all published pages retain Abbate operator identification and omit developer credits',()=>{
 for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(html,/Kaiser Webdesign|kaiser-webdesign\.de|Konzeption &amp; Design der App:/i,file);
  assert.match(html,/Abbate|Mit Wissen wächst Sicherheit\./,file);
 }
});
