'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const p=fs.readFileSync('dist/portal.js','utf8'),css=fs.readFileSync('dist/admin-workspace.css','utf8'),page=fs.readFileSync('dist/verwaltung.html','utf8');
test('responsive admin workspace separates certificate, access, routine records and history',()=>{
 assert.match(page,/<link\b[^>]*\bhref="\.\/admin-workspace\.css\?v=[1-9]\d*(?:&amp;[a-z]+=\d+)*"[^>]*>/);
 assert.match(p,/<section class="cert-panel admin-section"/);
 assert.match(p,/class="portal-access-panel admin-section"/);
 assert.match(p,/class="portal-panel portal-entry admin-section"/);
 assert.match(p,/class="portal-history portal-admin-history admin-section"/);
 assert.match(p,/class="admin-tools"/);
 assert.match(css,/@media\(min-width:981px\)/);
 assert.match(css,/\.portal-header\{position:relative;background:var\(--ad-surface\)/);
 assert.doesNotMatch(css,/\.portal-header\{position:fixed/);
 assert.doesNotMatch(css,/margin-left:208px/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/\.admin-pdf-canvas\{display:block/);
 assert.match(p,/await renderCertificateCanvas\(canvas,bytes\)/);
 assert.doesNotMatch(p,/frame\.className='admin-pdf-frame'/);
 assert.match(p,/certificateConfirmed!=='yes'/);
});

test('certificate section uses manual accessible disclosure with no form recreation',()=>{
 assert.match(p,/type="button" class="admin-section-heading cert-section-toggle" data-admin-disclosure="certificate-section-content" aria-expanded="false" aria-controls="certificate-section-content"/);
 assert.match(p,/id="certificate-section-content" class="admin-section-body portal-disclosure-content"/);
 assert.match(css,/#certificate-section-content\.is-open\{display:block\}/);
 const toggle=p.slice(p.indexOf("const disclosure=event.target.closest('[data-admin-disclosure]')"),p.indexOf('const pickerToggle='));
 assert.match(toggle,/classList\.toggle\('is-open',open\)/);
 assert.doesNotMatch(toggle,/innerHTML|replaceChildren|renderDetail|certificateDraft|previewSequence/);
});
