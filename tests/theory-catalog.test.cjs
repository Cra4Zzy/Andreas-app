'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
test('52 imported theory questions are shown only in staff review page',()=>{
 const html=read('dist/theorie-katalog.html'),script=read('dist/theory-review.js');
 assert.match(html,/theory-review\.js/);
 assert.match(script,/API\.isStaff\(me\)/);
 assert.match(script,/abbate_theory_questions/);
 assert.match(script,/theorie-ro-2019/);
 assert.match(script,/status.*'draft'/);
 assert.match(script,/select\('question_no,source_page/);
 assert.doesNotMatch(script,/correct\s*[:=]|score\s*[:=]|answer_key/);
 assert.doesNotMatch(read('dist/index.html'),/andreas-questions\.js/);
 assert.equal(fs.existsSync('dist/andreas-questions.js'),false);
});
test('question review page explicitly flags translation and diagram gaps',()=>{
 const page=read('dist/theorie-katalog.html'),script=read('dist/theory-review.js');
 assert.match(page,/Deutsch · Arbeitsübersetzung/);
 assert.match(page,/Română · Original/);
 assert.match(script,/Sprachfassungen sind noch nicht übersetzt/);
 assert.match(script,/Abbildung erforderlich/);
});
