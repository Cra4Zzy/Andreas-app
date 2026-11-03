'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const read=filename=>fs.readFileSync(path.join(__dirname,'..',filename),'utf8');
const customerFiles=[
  'index.html',
  'dist/index.html',
  'dist/konto.html',
  'dist/nachweise.html',
  'dist/verwaltung.html',
  'dist/datenschutz.html',
  'dist/app.js',
  'dist/portal.js'
];

test('customer pages contain no demo or pilot operation banners',()=>{
  for(const file of customerFiles){
    const content=read(file);
    assert.doesNotMatch(content,/Pilotbetrieb|Technischer Pilotbetrieb|Frühere Bedienungsdemo|Die Fragen dienen zur Vorschau|Pilotadresse/i,file);
  }
});

test('customer portal remains accessible to authenticated users',()=>{
  for(const p of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
    const text=read(p);
    assert.match(text,/id="portal-content"/,p);
    assert.match(text,/portal\.js\?v=8/,p);
    assert.doesNotMatch(text,/class="portal-preview"/,p);
  }
});

test('legal and account links stay on all customer entry points',()=>{
  assert.match(read('index.html'),/dist\/datenschutz\.html/);
  assert.match(read('dist/konto.html'),/backend-config\.js/);
  assert.match(read('dist/app.js'),/\.\/datenschutz\.html/);
  assert.match(read('dist/datenschutz.html'),/Deine Rechte/);
});

test('unreleased mobile store links remain disabled',()=>{
  const links=JSON.parse(read('downloads.json'));
  assert.equal(links.ios,'');
  assert.equal(links.android,'');
  assert.match(read('index.html'),/aria-disabled="true"/);
});

test('cached offline shell gets fresh app JavaScript',()=>{
  assert.match(read('dist/index.html'),/app\.js\?v=17/);
  assert.match(read('dist/sw.js'),/app\.js\?v=17/);
  assert.match(read('dist/sw.js'),/abbate-learning-v19/);
});

test('learning UI stays focused and identifies simulation honestly',()=>{
  assert.doesNotMatch(read('dist/index.html'),/id="download-banner"/);
  assert.doesNotMatch(read('dist/index.html'),/download-banner\.css/);
  assert.match(read('dist/app.js'),/Eine verbindliche Abschlussprüfung oder Unterweisung findet hier nicht statt/);
  assert.match(read('dist/styles.css'),/\.exam-disclaimer/);
});
