'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('dist/app.js','utf8'),legacy=fs.readFileSync('dist/pruefung.html','utf8');
function accessContext(me,terms=true,active=true){
 const redirects=[];const ctx={accessRequest:null,B:{identity:async()=>me,termsAccepted:async()=>terms},active:()=>active,data:{students:[]},location:{replace:to=>redirects.push(to)},toast(){},$:()=>({}),document:{documentElement:{removeAttribute(){}}}};
 vm.runInNewContext(app.slice(app.indexOf('async function checkAccess(){'),app.indexOf('function examDraftKey(){')),ctx);
 return {ctx,redirects};
}
test('desktop boot without session lands on login, never the retired examination page',async()=>{
 const {ctx,redirects}=accessContext(null);
 assert.equal(await ctx.checkAccess(),false);assert.deepEqual(redirects,['./konto.html']);
 assert.match(legacy,/url=\.\/konto\.html/);assert.doesNotMatch(legacy,/url=\.\/index\.html/);
});
test('valid account keeps normal access; terms and active-access gates remain enforced',async()=>{
 const me={id:'test',role:'learner'};
 for(const [terms,active,target] of [[false,true,'./konto.html#bedingungen'],[true,false,'./nachweise.html'],[true,true,null]]){
  const {ctx,redirects}=accessContext(me,terms,active);assert.equal(await ctx.checkAccess(),target===null);assert.deepEqual(redirects,target?[target]:[]);if(!target)assert.equal(ctx.data.students[0].id,me.id);
 }
});
