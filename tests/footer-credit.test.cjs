'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=["index.html","dist/index.html","dist/konto.html","dist/nachweise.html","dist/verwaltung.html","dist/theorie-katalog.html","dist/agb.html","dist/datenschutz.html","dist/widerruf.html","dist/konto-loeschen.html","dist/impressum.html"];
test('all Abbate footers contain a linked Kaiser Webdesign design credit',()=>{
 for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  const footer=html.slice(html.indexOf('<footer'));
  assert.ok(footer.includes('Konzeption &amp; Design der App:'),file);
  assert.ok(footer.includes('href="https://www.kaiser-webdesign.de/" target="_blank" rel="noopener noreferrer"'),file);
  assert.ok(footer.includes('>Kaiser Webdesign</a>'),file);
  assert.ok(footer.includes('Abbate Lernraum')||footer.includes('Mit Wissen wächst Sicherheit.'),file);
 }
});
test('footer styling exists on landing, learner, portal and legal pages',()=>{
 for(const [file,marker] of [['index.html','footer-signature'],['dist/experience.css','page-footer .footer-signature'],['dist/portal.css','portal-legal-footer .app-credit'],['dist/legal.css','legal-signature']])
 assert.ok(fs.readFileSync(file,'utf8').includes(marker),file);
});
