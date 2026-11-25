'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../dist/certificate-model.js');
const p={id:'p',role:'learner',name:'Test',email:'test@example.org'};
const v={course:'gabelstapler',completedAt:'2026-11-25',notification:'email',recipientEmail:'firma@example.org',examSelection:'yes'};
const prep=x=>C.prepareSelection(p,{...v,...x},'2026-11-25');
test('theory, practice and combined create separate records',()=>{assert.deepEqual(prep({examTheory:'yes',examPractice:'yes'}).map(x=>x.title),['Fahr- und Steuerpersonal / Gabelstaplerfahrer · Theorieprüfung','Fahr- und Steuerpersonal / Gabelstaplerfahrer · Praxisprüfung']);assert.equal(prep({examTheory:'yes'}).length,1);assert.equal(prep({examPractice:'yes'})[0].examType,'practice');assert.throws(()=>prep({}));});
test('both retain alternate recipient without altering account',()=>{const ds=prep({examTheory:'yes',examPractice:'yes'});assert.ok(ds.every(d=>d.email==='firma@example.org'&&d.alternateRecipient));assert.equal(p.email,'test@example.org');assert.doesNotMatch(ds[1].standard,/Theoretische/);});
test('annual instruction stays independent',()=>{const ds=prep({course:'jaehrliche-unterweisung',field:'krane',examPractice:'yes'});assert.equal(ds.length,1);assert.equal(ds[0].kind,'instruction');});
