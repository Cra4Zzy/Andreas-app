const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('personal learning overview is reachable directly from desktop and mobile header outside exams',()=>{
 const html=fs.readFileSync('dist/index.html','utf8'),app=fs.readFileSync('dist/app.js','utf8'),css=fs.readFileSync('dist/experience.css','utf8');
 assert.match(html,/<a id="header-progress"[^>]*href="#ergebnisse"/);
 assert.match(app,/Mein Lernstand/);assert.match(app,/nav-progress/);assert.match(app,/learningOverview\(list\)\+officialExamHistory\(\)/);
 assert.match(css,/\.exam-locked \.header-progress\{display:none!important\}/);assert.match(css,/@media\(max-width:650px\)/);
});