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
    assert.match(text,p==='dist/konto.html'?/portal\.js\?v=16/:/portal\.js\?v=16/,p);
    assert.doesNotMatch(text,/class="portal-preview"/,p);
  }
});

test('legal and account links stay on all customer entry points',()=>{
  assert.match(read('index.html'),/dist\/datenschutz\.html/);
  assert.match(read('dist/konto.html'),/backend-config\.js/);
  assert.match(read('dist/app.js'),/\.\/datenschutz\.html/);
  assert.match(read('dist/datenschutz.html'),/Deine Rechte/);
});

test('mobile website installation is ready without store links',()=>{
  const links=JSON.parse(read('downloads.json'));
  assert.equal(links.ios,'');
  assert.equal(links.android,'');
  const landing=read('index.html');
  assert.match(landing,/data-platform="ios"/);
  assert.match(landing,/data-platform="android"/);
  assert.match(landing,/Zum Home-Bildschirm hinzufügen/);
  assert.match(landing,/Zum Startbildschirm hinzufügen/);
  assert.match(landing,/iOS · Safari/);
  assert.match(landing,/Android · Chrome/);
  assert.match(landing,/class="pwa-steps"/);
  assert.equal((landing.match(/<details class="install-accordion">/g)||[]).length,2);
  assert.equal((landing.match(/<summary>/g)||[]).length,2);
  assert.equal((landing.match(/Installationsanleitung anzeigen/g)||[]).length,2);
  assert.doesNotMatch(landing,/<details class="install-accordion" open/);
  assert.match(landing,/Einrichtung unter iOS/);
  assert.match(landing,/Einrichtung unter Android/);
  assert.doesNotMatch(landing,/class="pwa-howto"/);
  assert.equal((landing.match(/<strong>Lernraum öffnen<\/strong>/g)||[]).length,2);
  assert.doesNotMatch(landing,/Download über (den App Store|Google Play)/);
  const login=read('dist/konto.html');
  assert.match(login,/rel="manifest"/);
  assert.match(login,/serviceWorker\.register/);
});

test('download cards retain live download logic without redundant update callouts',()=>{
  const landing=read('index.html');
  assert.doesNotMatch(landing,/desktop-live-indicator|desktop-update-overview|data-desktop-live/);
  assert.doesNotMatch(landing,/Aktualisierung der Lerninhalte|Aktualisierte Lerninhalte werden beim nächsten Start geladen/);
  assert.doesNotMatch(landing,/Nutzung im Browser|browser-box/);
  assert.match(landing,/data-download="windows"/);
  assert.match(landing,/data-download="macos"/);
  assert.match(landing,/for \(const platform of \["windows","macos"\]\)/);
  assert.match(landing,/href="#downloads"/);
  assert.match(landing,/Im Browser starten/);
  const pilot=JSON.parse(read('src-tauri/tauri.conf.json'));
  assert.equal(pilot.build.frontendDist,'https://app.gabelstaplerfahrschule-andreas.de/dist/');
  const workflow=read('.github/workflows/desktop-builds.yml');
  assert.match(workflow,/j\.desktopLiveFrontend=/);
  assert.match(workflow,/j\.desktopPreviewVersion=/);
});

test('cached PWA shell uses current app JavaScript and CSS',()=>{
  assert.match(read('dist/index.html'),/app\.js\?v=32/);
  assert.match(read('dist/sw.js'),/app\.js\?v=32/);
  assert.match(read('dist/sw.js'),/styles\.css\?v=18/);
  assert.match(read('dist/sw.js'),/practice-bank\.js\?v=1/);
  assert.match(read('dist/index.html'),/practice-expansion\.js\?v=1/);
  assert.match(read('dist/sw.js'),/practice-expansion\.js\?v=1/);
  assert.match(read('dist/index.html'),/experience\.css\?v=2/);
  assert.match(read('dist/sw.js'),/experience\.css\?v=2/);
  assert.match(read('dist/index.html'),/practice-bank\.js\?v=1/);
  assert.match(read('dist/sw.js'),/abbate-learning-v36/);
  const html=read('dist/index.html'),worker=read('dist/sw.js');
  for(const file of ['i18n-ru.js?v=1','i18n-uk.js?v=1','i18n-modern.js?v=2','i18n.js?v=12']){
    assert.ok(html.includes(file),'HTML missing '+file);
    assert.ok(worker.includes(file),'Service worker missing '+file);
  }
});

test('learning UI stays focused and identifies simulation honestly',()=>{
  assert.doesNotMatch(read('dist/index.html'),/id="download-banner"/);
  assert.doesNotMatch(read('dist/index.html'),/download-banner\.css/);
  assert.match(read('dist/app.js'),/Eine verbindliche Abschlussprüfung oder Unterweisung findet hier nicht statt/);
  assert.match(read('dist/styles.css'),/\.exam-disclaimer/);
});


test('server-side desktop web updates verify release revisions and protect in-progress sessions',()=>{
  const manager=read('dist/frontend-updates.js');
  const pipeline=read('.github/workflows/deploy-allinkl.yml');
  assert.match(manager,/build-info\.json/);
  assert.match(manager,/cache:'no-store'/);
  assert.match(manager,/abbate-update-tried/);
  assert.match(manager,/unsafe/);
  assert.match(manager,/access_token/);
  assert.match(pipeline,/website\/dist\/build-info\.json/);
  assert.match(pipeline,/meta name="abbate-build"/);
  assert.match(pipeline,/frontend-updates\.js/);
  assert.match(pipeline,/--transfer-all/);
  assert.doesNotMatch(pipeline,/--only-newer/);
  assert.match(pipeline,/Verify real HTTPS publication/);
  assert.doesNotThrow(()=>new (require('node:vm').Script)(manager));
});
