const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('exams require accounts and an in-progress attempt locks learning',()=>{
 const a=fs.readFileSync('dist/app.js','utf8'),h=fs.readFileSync('dist/pruefung.html','utf8'),edge=fs.readFileSync('backend/functions/abbate-guest-exams/index.ts','utf8'),sql=fs.readFileSync('backend/mandatory-exam-completion.sql','utf8');
 assert.match(h,/\.\/index\.html#pruefung/);assert.doesNotMatch(h,/guest-exam\.js/);assert.match(edge,/status:410/);
 assert.match(a,/await restoreExam\(\)/);assert.match(a,/exam-locked/);assert.match(a,/confirm-exam-course/);assert.match(a,/Viel Erfolg bei deiner Theorieprüfung!/);
 assert.match(sql,/EXAM_MUST_BE_COMPLETED/);assert.match(sql,/DAILY_EXAM_LIMIT/);
 assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/Theorieprüfung ohne Anmeldung/);
});