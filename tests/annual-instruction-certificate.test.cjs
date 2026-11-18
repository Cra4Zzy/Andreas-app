'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const C=require('../dist/certificate-model.js');
const participant={id:'test',role:'learner',name:'Test Person',email:'test@example.invalid'};
const draft=course=>C.prepare(participant,{course,field:'gabelstapler',completedAt:'2026-11-17',notification:'none'},'2026-11-18');
test('annual instruction is attendance, not an exam',()=>{const x=draft('jaehrliche-unterweisung');assert.equal(x.kind,'instruction');assert.equal(x.outcome,'attended');assert.equal(x.title,'Jährliche Unterweisung · Fahr- und Steuerpersonal / Gabelstaplerfahrer · Unterweisungsnachweis');});
test('existing theory certificate retains semantics',()=>{const x=draft('gabelstapler');assert.equal(x.kind,'exam');assert.equal(x.outcome,'passed');assert.ok(x.title.endsWith(' · Theorieprüfung'));});

test('requires an explicit annual field',()=>assert.throws(()=>C.prepare(participant,{course:'jaehrliche-unterweisung',completedAt:'2026-11-17',notification:'none'},'2026-11-18')));
test('leap date and latest non-revoked reminder per field',()=>{assert.equal(C.nextDue('2024-02-29'),'2025-02-28');const x=draft('jaehrliche-unterweisung');const rows=[{...x,completedAt:'2025-11-17'},{...x,completedAt:'2026-10-01',revokedAt:'2026-10-02'}];assert.equal(C.reminders(rows,'2026-11-18')[0].days,-1);assert.equal(C.reminders([...rows,{...x,completedAt:'2026-11-01'}],'2026-11-18').length,0);});
