'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('public install page uses clear iOS and Android instructions without redundant store slogans',()=>{
 const html=read('index.html');
 assert.match(html,/iOS · Safari/);
 assert.match(html,/Android · Chrome/);
 assert.match(html,/Zum Home-Bildschirm/);
 assert.match(html,/App installieren/);
 assert.doesNotMatch(html,/kein (?:Play-)?Store-Download nötig|ohne (?:App Store|Google Play)|wie eine normale App starten/i);
 assert.doesNotMatch(html,/Nutzung im Browser|Aktualisierung der Lerninhalte|Aktualisierte Lerninhalte werden beim nächsten Start geladen|desktop-update-overview|desktop-live-indicator/);
 assert.match(html,/Im Browser starten/);
});
test('learner interface describes actual results instead of implying confirmed practical safety',()=>{
 const learner=read('dist/app.js'),german=read('dist/i18n.js');
 for(const bad of ['Heute ein Stück sicherer','Das war eine sichere Runde','Gut, dass du drangeblieben bist','Schau dir an, was schon sitzt','Du musst nicht alles auf einmal können']){
   assert.ok(!learner.includes(bad),'Outdated learner wording: '+bad);
   assert.ok(!german.includes(bad),'Outdated German catalogue entry: '+bad);
 }
 assert.match(learner,/Alle Fragen richtig beantwortet/);
 assert.match(learner,/Dieses Ergebnis ist kein Prüfungsnachweis/);
 assert.match(german,/Alle Fragen richtig beantwortet/);
});
test('registration and staff admin headings remain functional and factual',()=>{
 const portal=read('dist/portal.js');
 assert.match(portal,/Schulungen und Prüfungsergebnisse/);
 assert.match(portal,/Teilnehmerverwaltung/);
 assert.match(portal,/Der QR-Code enthält keine personenbezogenen Daten/);
 assert.match(portal,/PNG \(Druckqualität\) herunterladen/);
 assert.match(portal,/SVG \(Vektorformat\) herunterladen/);
 assert.doesNotMatch(portal,/Ergebnisse mit einem Klick|Neu bei Abbate|Sicher anmelden/);
});
