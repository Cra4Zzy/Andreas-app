'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const C=require('../dist/certificate-model.js');
const participant={id:'test',role:'learner',name:'Test Person',email:'test@example.invalid'};
const draft=course=>C.prepare(participant,{course,completedAt:'2026-11-17',notification:'none'},'2026-11-18');
test('annual instruction is attendance, not an exam',()=>{const x=draft('jaehrliche-unterweisung');assert.equal(x.kind,'instruction');assert.equal(x.outcome,'attended');assert.equal(x.title,'Jährliche Unterweisung · Unterweisungsnachweis');});
test('existing theory certificate retains semantics',()=>{const x=draft('gabelstapler');assert.equal(x.kind,'exam');assert.equal(x.outcome,'passed');assert.ok(x.title.endsWith(' · Theorieprüfung'));});
