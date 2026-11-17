'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=fs.readFileSync('dist/portal.js','utf8'),b=fs.readFileSync('scripts/build-web.cjs','utf8'),u=fs.readFileSync('dist/frontend-updates.js','utf8');
test('same-document mobile preview renders existing signed server PDF without native viewer',()=>{
 assert.match(p,/await renderCertificateCanvas\(canvas,bytes\)/);
 assert.match(p,/sequence===previewSequence/);
 assert.match(p,/certificatePreviewReady=true/);
 assert.match(p,/!certStatus\.signatureReady\|\|!certificatePreviewReady/);
 assert.match(p,/isEvalSupported:false/);
 assert.match(p,/standardFontDataUrl/);
 assert.match(b,/pdfjs-dist@5\.4\.624/);
 assert.match(u,/data-abbate-update-block/);
 assert.doesNotThrow(()=>new vm.Script(p));
 const part=p.slice(p.indexOf('async function showCertificate'),p.indexOf('function renderDetail'));
 assert.doesNotMatch(part,/target='_blank'|createElement\('iframe'\)|createObjectURL/);
});

test('certificate preview stays mounted on changes and rendering errors',()=>{
 const part=p.slice(p.indexOf('function invalidateCertificatePreview'),p.indexOf('function renderDetail'));
 assert.match(part,/stage\.dataset\.previewState='stale'/);
 assert.match(part,/stage\.dataset\.previewState='error'/);
 assert.match(part,/stage\.dataset\.previewState='ready'/);
 assert.doesNotMatch(part,/replaceChildren\(\)|replaceWith\(|\.remove\(\)/);
 assert.match(p,/<section class="cert-panel admin-section"/);
 assert.doesNotMatch(p,/<details class="cert-panel admin-section"/);
 assert.match(p,/!document\.querySelector\('#certificate-preview\[data-abbate-update-block\]'\)/);
});
