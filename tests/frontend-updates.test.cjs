'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {URL,URLSearchParams}=require('node:url');
const source=fs.readFileSync('dist/frontend-updates.js','utf8');
const A='a'.repeat(40),B='b'.repeat(40);
function setup({build=A,remote=B,published=B,dirty=false,store=new Map()}={}){
 const handlers={},nodes=[],navigations=[];let tick,marker=remote,page=published;
 function element(){return {textContent:'',children:[],removed:false,style:{},events:{},setAttribute(){},append(...items){this.children.push(...items)},addEventListener(k,f){this.events[k]=f},remove(){this.removed=true}};}
 const document={readyState:'loading',baseURI:'https://example.test/dist/verwaltung.html',visibilityState:'visible',querySelector(q){return q.includes('abbate-build')?{content:build}:null},addEventListener(k,f){handlers[k]=f},createElement:element,body:{append(x){nodes.push(x)}}};
 const context={document,URL,URLSearchParams,Map,Date,location:{href:document.baseURI,search:'',hash:'',replace(u){navigations.push(u)}},sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},window:{addEventListener(){},confirm:()=>true},setInterval(f){tick=f},fetch:async url=>String(url).includes('build-info.json')?{ok:true,json:async()=>({commit:marker})}:{ok:true,text:async()=>'<meta name="abbate-build" content="'+page+'">'}};
 vm.runInNewContext(source,context);if(dirty)handlers.input({target:{closest:()=>true}});
 return {nodes,navigations,store,check:()=>tick(),setRemote:v=>marker=v,setPage:v=>page=v};
}
test('does not reload a partially deployed revision',async()=>{const s=setup({published:A});await s.check();assert.equal(s.navigations.length,0);s.setPage(B);await s.check();assert.equal(s.navigations.length,1);assert.match(s.navigations[0],/abbate_reload=/)});
test('current release clears existing banner',async()=>{const s=setup({dirty:true});await s.check();assert.equal(s.nodes.length,1);s.setRemote(A);await s.check();assert.equal(s.nodes[0].removed,true)});
test('dismissal persists for same version, new releases may notify again',async()=>{const s=setup({dirty:true});await s.check();s.nodes[0].children[2].events.click();await s.check();assert.equal(s.nodes.length,1);s.setRemote('c'.repeat(40));await s.check();assert.equal(s.nodes.length,2)});
test('manual refresh is bounded to prevent notification loop',async()=>{const s=setup({dirty:true});await s.check();await s.nodes[0].children[1].events.click();assert.equal(s.navigations.length,1);const next=setup({store:s.store});await next.check();assert.equal(next.nodes.length,0);assert.equal(next.navigations.length,0)});
