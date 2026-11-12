'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('dist/app.js','utf8');
const begin=app.indexOf('function localizedQuestion(q){');
const end=app.indexOf('\n// Fifty',begin);
assert.ok(begin>=0&&end>begin,'Localized question function exists');
const block=app.slice(begin,end);
test('question translation replaces six visible fields without touching grading or identity',()=>{
  const ctx={
    selectedLanguage:'en',
    QUESTION_LOCALES:{en:{'q-test':['Translated question?','Scenario.','First choice.','Second choice.','Third choice.','Explanation.']}}
  };
  vm.runInNewContext(block+'\nglobalThis.translate=localizedQuestion;',ctx);
  const source={id:'q-test',course:'krane',topic:'betrieb',title:'Deutsch',context:'Deutsch',answers:['A','B','C'],correct:1,why:'Deutsch',source:'DGUV'};
  const output=ctx.translate(source);
  assert.equal(output.id,'q-test');
  assert.equal(output.correct,1);
  assert.equal(output.course,'krane');
  assert.equal(output.source,'DGUV');
  assert.deepEqual(Array.from(output.answers),['First choice.','Second choice.','Third choice.']);
  assert.equal(output.title,'Translated question?');
  assert.equal(output.why,'Explanation.');
  assert.deepEqual(source.answers,['A','B','C'],'Original question must never be mutated');
});
test('missing or malformed language pack falls back to original question',()=>{
  const ctx={selectedLanguage:'uk',QUESTION_LOCALES:{uk:{bad:['missing']}}};
  vm.runInNewContext(block+'\nglobalThis.translate=localizedQuestion;',ctx);
  const source={id:'bad',title:'Original',answers:['A','B','C'],correct:2};
  assert.equal(ctx.translate(source),source);
  ctx.selectedLanguage='de';
  assert.equal(ctx.translate(source),source);
});
test('learning, history and language switching use translated question fields',()=>{
  assert.match(app,/const q=localizedQuestion\(question\(run\.ids\[run\.index\]\)\)/);
  assert.match(app,/const q=localizedQuestion\(question\(id\)\),choice=result\.answers/);
  assert.match(app,/await ensureQuestionLocale\(nextLanguage\)/);
  assert.match(app,/await ensureQuestionLocale\(selectedLanguage\)/);
  assert.match(app,/practice-translations\/.*\.js\?v=1/);
});
