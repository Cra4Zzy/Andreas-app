'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const js=fs.readFileSync('dist/confirm-email.js','utf8');
function setup(hash,status=200){
 let handler,calls=0,request,cleaned=false;
 const button={disabled:true,hidden:false,addEventListener:(name,fn)=>{handler=fn;}},message={},title={};
 const document={querySelector:id=>({'#confirm':button,'#message':message,'#title':title}[id])};
 const fetch=async(url,options)=>{calls++;request={url,options};return {ok:status===200,status};};
 new Function('document','location','history','fetch','globalThis','AbortSignal',js)(document,{hash,pathname:'/dist/confirm-email.html'},{replaceState:()=>{cleaned=true;}},fetch,{ABBATE_CONFIG:{url:'https://test.example',publishableKey:'test'}},{timeout:()=>null});
 return {button,message,title,click:()=>handler?.(),get calls(){return calls;},get request(){return request;},get cleaned(){return cleaned;}};
}
test('confirmation requires explicit click and posts token only once',async()=>{
 const token='a'.repeat(64),s=setup('#token_hash='+token);
 assert.equal(s.calls,0);assert.equal(s.cleaned,true);assert.equal(s.button.disabled,false);
 await s.click();await s.click();assert.equal(s.calls,1);assert.equal(s.request.options.method,'POST');
 assert.deepEqual(JSON.parse(s.request.options.body),{token_hash:token,type:'email'});assert.equal(s.button.hidden,true);
});
test('invalid and expired links never claim success',async()=>{
 const bad=setup('#token_hash=bad');await bad.click();assert.equal(bad.calls,0);
 const expired=setup('#token_hash='+'a'.repeat(64),403);await expired.click();assert.equal(expired.button.disabled,true);assert.match(expired.message.textContent,/ungültig/);
});
test('template uses branded fragment and no direct auto-verification link',()=>{
 const html=fs.readFileSync('emails/confirm-signup.html','utf8');
 assert.match(html,/https:\/\/app\.gabelstaplerfahrschule-andreas\.de\/dist\/confirm-email\.html#token_hash=\{\{ \.TokenHash \}\}/);
 assert.doesNotMatch(html,/\.ConfirmationURL/);
});