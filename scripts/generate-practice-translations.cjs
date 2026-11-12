'use strict';
// Generate static, per-locale practice question packs via Google Translate's public
// endpoint. No learner information is sent: only the authored, public study copy.
// This is a build-time tool, never called by a learner's browser.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const langs=['uk','ru','cs','bg','hr','da','nl','en','et','fi','fr','el','hu','ga','it','lv','lt','mt','pl','pt','ro','sk','sl','es','sv'];
const ctx={};ctx.globalThis=ctx;
for(const file of ['practice-bank.js','practice-expansion.js','practice-expansion-final.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),ctx,{filename:file});
}
const source=ctx.ABBATE_PRACTICE_BANK.questions;
if(source.length!==250)throw Error('Expected exactly 250 questions');
const outputDir=path.join(root,'dist','practice-translations');
fs.mkdirSync(outputDir,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function translate(text,lang){
  const url=new URL('https://translate.googleapis.com/translate_a/single');
  for(const [key,value] of Object.entries({client:'gtx',sl:'de',tl:lang,dt:'t',q:text}))url.searchParams.set(key,value);
  for(let attempt=0;attempt<7;attempt++){
    try{
      const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Abbate-Translation-Build/1.0'},signal:AbortSignal.timeout(25000)});
      if(!r.ok)throw Error('HTTP '+r.status);
      const result=await r.json();
      const translated=result[0]?.map(segment=>segment[0]).join('');
      if(!translated||typeof translated!=='string')throw Error('Empty translation');
      return translated.trim();
    }catch(error){
      if(attempt===6)throw Error('Translation '+lang+' failed after retries: '+error.message);
      await sleep(Math.min(45000,(2**attempt)*1400+Math.floor(Math.random()*600)));
    }
  }
}
async function translateQuestion(q,lang){
  const inputs=[q.title,q.context,...q.answers,q.why];
  const grouped=await translate(inputs.join('\n'),lang);
  let lines=grouped.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  // An unexpected line count can silently change the answer key. Fall back
  // to one field per request rather than allow a shifted/missing answer.
  if(lines.length!==6||lines.some(x=>x.length<3)){
    lines=await Promise.all(inputs.map(x=>translate(x,lang)));
  }
  if(lines.length!==6||lines.some(x=>!x||x.length<3))throw Error('Malformed '+lang+'/'+q.id);
  return lines;
}
async function runLocale(lang,limit=source.length){
  const outFile=path.join(outputDir,lang+'.js');
  let translated={};
  if(fs.existsSync(outFile)){
    const previous={};previous.globalThis=previous;
    try{vm.runInNewContext(fs.readFileSync(outFile,'utf8'),previous);translated=previous.ABBATE_QUESTION_TRANSLATIONS?.[lang]||{};}catch{}
  }
  const pending=source.slice(0,limit).filter(q=>!Array.isArray(translated[q.id])||translated[q.id].length!==6);
  let cursor=0,done=0;
  const concurrency=Number(process.env.TRANSLATE_WORKERS||'6');
  async function worker(){
    while(cursor<pending.length){
      const q=pending[cursor++];
      translated[q.id]=await translateQuestion(q,lang);
      done++;
      if(done%25===0){
        writeFile();
        process.stdout.write(lang+' '+done+'/'+pending.length+' translated\n');
      }
      await sleep(110);
    }
  }
  function writeFile(){
    const sorted=Object.fromEntries(source.filter(q=>translated[q.id]).map(q=>[q.id,translated[q.id]]));
    fs.writeFileSync(outFile,"'use strict';\n(globalThis.ABBATE_QUESTION_TRANSLATIONS||(globalThis.ABBATE_QUESTION_TRANSLATIONS={}))["+JSON.stringify(lang)+"]="+JSON.stringify(sorted)+';\n');
  }
  await Promise.all(Array.from({length:Math.min(concurrency,pending.length)},()=>worker()));
  writeFile();
  if(limit===source.length && Object.keys(translated).length!==250)throw Error('Incomplete '+lang);
  process.stdout.write(lang+' complete: '+Object.keys(translated).length+' questions\n');
}
(async()=>{
  const requested=process.argv.slice(2);
  const selected=requested.filter(x=>langs.includes(x));
  if(!selected.length)selected.push(...langs);
  const limit=process.env.TRANSLATE_SMOKE==='1'?2:source.length;
  for(const lang of selected)await runLocale(lang,limit);
})().catch(err=>{console.error(err);process.exitCode=1;});
