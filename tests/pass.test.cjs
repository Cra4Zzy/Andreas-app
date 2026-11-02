const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../dist/nachweise-model.js');
test('sharing accepts only selected, confirmed completions owned by this learner',()=>{
  assert.equal(model.selection('demo-a',['demo-pruefung']).length,1);
  assert.throws(()=>model.selection('demo-a',[]));
  assert.throws(()=>model.selection('demo-a',['demo-andere-person']));
  assert.throws(()=>model.selection('demo-a',['demo-widerrufen']));
});
test('verifier rejects expired, revoked, missing and malformed shares',()=>{
  const token='ab'.repeat(32), now=Date.parse('2026-11-02T12:00:00Z');
  const share={token,ownerId:'demo-a',completionIds:['demo-pruefung'],expiresAt:new Date(now+1000).toISOString()};
  assert.ok(model.resolveShare([share],token,now));
  assert.equal(model.resolveShare([share],token,now+1001),null);
  assert.equal(model.resolveShare([{...share,revokedAt:new Date(now).toISOString()}],token,now),null);
  assert.equal(model.resolveShare([],token,now),null);
  assert.equal(model.resolveShare([share],'wrong',now),null);
});
test('verifier output is limited to the explicitly selected evidence',()=>{
  const token='bc'.repeat(32), share={token,ownerId:'demo-a',completionIds:['demo-pruefung'],expiresAt:'2099-01-01T00:00:00Z'};
  const proof=model.resolveShare([share],token);
  assert.equal(proof.records.length,1);
  assert.deepEqual(Object.keys(proof.records[0]).sort(),['completedAt','issuer','kind','reference','title']);
  assert.equal(proof.records[0].reference,'DEMO-2026-002');
});
