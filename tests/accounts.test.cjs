const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../dist/konten-model.js');
test('registration waits for approval and access changes preserve the entire history',()=>{
 const s=M.migrate(),p=M.register(s,{name:'Demo Neu',email:'NEU@example.test'},'new');
 assert.equal(p.access,'pending');assert.equal(M.ownPass(s,p.id),null);
 M.addCompletion(s,{student:p.id,title:'Prüfung',kind:'exam',outcome:'failed',completedAt:'2026-01-01'},'failed');
 M.setAccess(s,p.id,'active','2099-01-01');assert.equal(M.ownPass(s,p.id).records[0].outcome,'failed');
 M.setAccess(s,p.id,'paused');assert.equal(M.ownPass(s,p.id),null);assert.equal(M.recordsFor(s,p.id).length,1);
 M.setAccess(s,p.id,'active');assert.equal(M.ownPass(s,p.id).records.length,1);
 assert.throws(()=>M.register(s,{name:'Duplicate',email:'neu@example.test'},'dup'));
});
test('personal history excludes other learners, future dates, revoked entries and practice rounds',()=>{
 const s=M.migrate();s.results.push({student:'lena',score:6});
 assert.equal(M.recordsFor(s,'lena').length,4);assert.equal(M.recordsFor(s,'max').length,0);
 assert.equal(M.recordsFor(s,'lena','2026-09-12').length,2);
 s.completions[0].revokedAt='now';assert.equal(M.recordsFor(s,'lena').length,3);
 assert.throws(()=>M.addCompletion(s,{student:'lena',title:'Future',kind:'exam',outcome:'passed',completedAt:'2099-01-01'},'future'));
 assert.throws(()=>M.addCompletion(s,{student:'lena',title:'Exam',kind:'exam',outcome:'attended',completedAt:'2026-01-01'},'bad'));
 assert.equal(M.dateOK('2026-02-30'),false);
});
test('deleting a demo account invalidates its lookup and removes associated learning data',()=>{
 const s=M.migrate();s.results=[{student:'lena'},{student:'max'}];s.mastered.lena=['question'];
 M.removePerson(s,'lena');assert.equal(M.ownPass(s,'lena'),null);assert.equal(M.recordsFor(s,'lena').length,0);
 assert.deepEqual(s.results,[{student:'max'}]);assert.equal(s.mastered.lena,undefined);
 assert.equal(s.students.some(p=>p.id==='max'),true);
});

test('result corrections are explicit, scoped to the selected learner and logged',()=>{
 const s=M.migrate();M.updateOutcome(s,'demo-2','passed','lena');
 assert.equal(M.recordsFor(s,'lena').find(r=>r.id==='demo-2').outcome,'passed');
 assert.equal(s.audit.at(-1).before,'failed');
 assert.throws(()=>M.updateOutcome(s,'demo-2','failed','max'));
 assert.throws(()=>M.updateOutcome(s,'demo-2','attended','lena'));
});
