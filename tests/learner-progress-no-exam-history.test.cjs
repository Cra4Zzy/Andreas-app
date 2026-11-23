'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('learner progress shows only answered questions, learning rounds, category progress and learning history',()=>{
 const app=fs.readFileSync('dist/app.js','utf8');
 const learnerPage=app.slice(app.indexOf('function learningOverview(list){'),app.indexOf('function topicInfo(',app.indexOf('function learningOverview(list){')));
 assert.match(learnerPage,/Richtig beantwortete Fragen/);
 assert.match(learnerPage,/Lernrunden/);
 assert.match(learnerPage,/Dein Fortschritt nach Fachbereich/);
 assert.match(learnerPage,/Dein Lernverlauf/);
 assert.doesNotMatch(learnerPage,/abgegebene Prüfungen|Theorieprüfungen|officialExamHistory|review-exam/);
 assert.match(app,/function officialExamView\(r\)/,'submission result remains available immediately after a real exam');
 assert.match(app,/await B\.submitExam\(run\.attemptId/,'authoritative submission remains available');
 const portal=fs.readFileSync('dist/portal.js','utf8');
 assert.match(portal,/data-exam-overview-open/,'staff examination archive remains available');
 assert.match(portal,/data-exam-detail/,'staff answer details remain available');
 assert.doesNotMatch(app,/await B\.listExams\(\)/,'learner no longer fetches unnecessary exam history');
});
