'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=fs.readFileSync('dist/portal.js','utf8'),b=fs.readFileSync('scripts/build-web.cjs','utf8'),u=fs.readFileSync('dist/frontend-updates.js','utf8');
test('same-document mobile preview renders existing signed server PDF without native viewer',()=>{
 assert.match(p,/await renderCertificateCanvas\(canvas,bytes\)/);
 assert.match(p,/sequence!==previewSequence/);
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
