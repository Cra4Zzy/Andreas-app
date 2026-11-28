'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/backend.js','utf8');
function setup(role='learner',storage=new Map(),start=1000000){
 let now=start,checks=[],events={},signouts=[],redirects=[],authListeners=[];
 const local={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const session={getItem:()=>null,removeItem:k=>checks.push(k)};
 const doc={body:{style:{}},hidden:false,addEventListener:(name,f)=>events[name]=f};
 const jwt='header.'+Buffer.from(JSON.stringify({session_id:'session-1'})).toString('base64url')+'.signature';
 const auth={getSession:async()=>({data:{session:{access_token:jwt}}}),getUser:async()=>({data:{user:{id:'u'}}}),signOut:async opts=>{signouts.push(opts.scope);authListeners.forEach(f=>f('SIGNED_OUT'));return {error:null};},onAuthStateChange:f=>authListeners.push(f)};
 const membership={user_id:'u',school_id:'s',role,access_status:'active'};
 const client={auth,from:table=>{const obj={select:()=>obj,eq:()=>obj,single:async()=>({data:table==='abbate_memberships'?membership:{display_name:'Test'},error:null})};return obj;}};
 const win={name:'',dispatchEvent:e=>checks.push(e.type)};
 const timers=[];
 const context={window:win,document:doc,sessionStorage:session,localStorage:local,crypto:{randomUUID:()=> '00000000-0000-4000-8000-000000000001'},atob:s=>Buffer.from(s,'base64').toString(),Date:{now:()=>now},Event:class{constructor(type){this.type=type}},location:{replace:x=>redirects.push(x)},setTimeout,clearTimeout,setInterval:f=>timers.push(f),addEventListener:(n,f)=>events[n]=f,ABBATE_CONFIG:{url:'https://example.test',publishableKey:'test'},AbbateSupabase:{createClient:()=>client},ABBATE_ACCOUNTS:{today:()=>''}};
 vm.runInNewContext(source,context);
 return {B:context.ABBATE_BACKEND,events,signouts,redirects,checks,doc,storage,set:t=>{now=t},tick:async()=>{for(const f of timers)f();await new Promise(r=>setImmediate(r));}};
}
test('learner is logged out at exactly five minutes and only locally',async()=>{const s=setup();await s.B.identity();s.set(1299999);await s.tick();assert.equal(s.signouts.length,0);s.set(1300000);await s.tick();assert.deepEqual(s.signouts,['local']);assert.deepEqual(s.redirects,['./konto.html?session=expired']);assert.equal(s.B.idleExpired,true);assert.equal(s.doc.body.inert,true);assert.ok(s.checks.includes('abbate:idle-expired'));});
test('administrator is exempt and trainer is not',async()=>{for(const role of ['admin','trainer']){const s=setup(role);await s.B.identity();s.set(4600000);await s.tick();assert.equal(s.signouts.length,role==='admin'?0:1);}});
test('activity resets deadline and automated events do not',async()=>{const s=setup();await s.B.identity();s.set(1200000);s.events.pointerdown({isTrusted:true});s.set(1400000);s.events.input({isTrusted:false});await s.tick();assert.equal(s.signouts.length,0);s.set(1500000);await s.tick();assert.equal(s.signouts.length,1);});
test('deadline survives navigation and first interaction after inactivity cannot revive session',async()=>{const a=setup();await a.B.identity();a.set(1200000);a.events.pagehide();const b=setup('learner',a.storage,1300000);assert.equal(await b.B.identity(),null);assert.equal(b.signouts.length,1);const c=setup();await c.B.identity();c.set(1300000);c.events.pointermove({isTrusted:true});await c.tick();assert.equal(c.signouts.length,1);});
test('exam draft is preserved without unload confirmation on idle expiration',()=>{const s=fs.readFileSync('dist/app.js','utf8');assert.match(s,/addEventListener\('abbate:idle-expired',stashExam\)/);assert.match(s,/run\?\.mode==='exam'&&!B\.idleExpired/);});
