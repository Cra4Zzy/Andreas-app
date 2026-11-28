'use strict';
(() => {
 const C=globalThis.ABBATE_CONFIG;
 // A browser tab/window is an independent account context. We deliberately do
 // not reuse the legacy localStorage session shared between all open tabs.
 // window.name persists during same-tab navigation (login -> learning -> records),
 // while a newly opened window receives a separate name and auth BroadcastChannel.
 const WINDOW_PREFIX='abbate-auth-window:';
 let windowId=typeof window.name==='string'&&window.name.startsWith(WINDOW_PREFIX)
   ?window.name.slice(WINDOW_PREFIX.length):'';
 if(!/^[a-zA-Z0-9-]{20,80}$/.test(windowId)){
   windowId=globalThis.crypto.randomUUID();
   window.name=WINDOW_PREFIX+windowId;
 }
 const storageKey='abbate-auth-window-v2:'+windowId;
 // Remove legacy shared credentials once; never import them into a separate window.
 // Users must sign in again after this one-time migration.
 try{globalThis.localStorage.removeItem('abbate-auth-v1');}catch{}
 const client=globalThis.AbbateSupabase.createClient(C.url,C.publishableKey,{
   auth:{storageKey,storage:globalThis.sessionStorage,persistSession:true,
     autoRefreshToken:true,detectSessionInUrl:true}
 });
 const fail=error=>{if(error)throw error;};
 const person=(membership,profile)=>({id:membership.user_id,school:membership.school_id,
   role:membership.role,name:profile?.display_name||'Teilnehmer',email:profile?.email||'',company:profile?.company||'',
   access:membership.access_status,until:membership.access_until,registeredAt:profile?.registered_at,
   payment:membership.payment_status||'open',paymentReportedAt:membership.payment_reported_at||null,
   paymentConfirmedAt:membership.payment_confirmed_at||null});
 let me=null;
 // Non-admin accounts are signed out after five minutes of real inactivity.
 // Keep the deadline across navigation and scope it to the actual auth session.
 const USER_IDLE_MS=5*60*1000;
 let idle=null,idleWired=false,idleExpired=false;
 function idleSessionId(session){
   try{
     const payload=session.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
     return JSON.parse(atob(payload)).session_id||null;
   }catch{return null;}
 }
 function idleRecord(){
   if(!idle)return null;
   try{return JSON.parse(localStorage.getItem(idle.key)||'null');}catch{return null;}
 }
 function idleWrite(at){
   if(!idle)return;
   idle.lastAt=at;
   idle.lastWrite=Date.now();
   try{localStorage.setItem(idle.key,JSON.stringify({session:idle.session,at}));}catch{}
 }
 function idleLast(){
   const record=idleRecord();
   return Math.max(idle.lastAt,record?.session===idle.session&&Number.isFinite(record.at)?record.at:0);
 }
 async function checkUserIdle(){
   if(idleExpired)return true;
   if(!idle||Date.now()-idleLast()<USER_IDLE_MS)return false;
   idleExpired=true;
   // Save any recoverable examination draft before discarding the credentials.
   try{window.dispatchEvent(new Event('abbate:idle-expired'));}catch{}
   if(document.body){document.body.inert=true;document.body.style.visibility='hidden';}
   let timeout;
   try{
     const logout=Promise.resolve().then(()=>client.auth.signOut({scope:'local'}));
     await Promise.race([logout,new Promise(resolve=>{timeout=setTimeout(resolve,3000);})]);
   }catch{}finally{
     clearTimeout(timeout);
     // Even if offline, remove this window's credentials, never another account.
     try{globalThis.sessionStorage.removeItem(storageKey);}catch{}
     try{localStorage.removeItem(idle?.key||'');}catch{}
     me=null;
     location.replace('./konto.html?session=expired');
   }
   return true;
 }
 function userActivity(event){
   if(!idle||idleExpired||event?.isTrusted===false)return;
   const now=Date.now();
   if(now-idleLast()>=USER_IDLE_MS){void checkUserIdle();return;}
   idle.lastAt=now;
   if(now-idle.lastWrite>=1000)idleWrite(now);
 }
 async function monitorUserIdle(user,session){
   if(idleExpired)return false;
   if(user.role==='admin'){idle=null;return true;}
   const sid=idleSessionId(session)||windowId;
   const key='abbate-user-idle-v1:'+user.id+':'+sid;
   if(!idle||idle.key!==key){
     idle={key,session:sid,lastAt:Date.now(),lastWrite:0};
     const previous=idleRecord();
     if(previous?.session===sid&&Number.isFinite(previous.at))idle.lastAt=previous.at;
     else idleWrite(Date.now());
   }
   if(await checkUserIdle())return false;
   if(!idleWired){
     idleWired=true;
     for(const event of ['pointerdown','pointermove','keydown','touchstart','wheel','scroll','input'])
       document.addEventListener(event,userActivity,{passive:true,capture:true});
     document.addEventListener('visibilitychange',()=>{if(!document.hidden)void checkUserIdle();});
     addEventListener('focus',()=>{void checkUserIdle();});
     addEventListener('pageshow',()=>{void checkUserIdle();});
     addEventListener('pagehide',()=>{if(idle&&!idleExpired)idleWrite(idleLast());});
     setInterval(()=>{void checkUserIdle();},1000);
     client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')idle=null;});
   }
   return true;
 }
 async function identity(){
   if(idleExpired)return null;
   const {data:{session}}=await client.auth.getSession();if(!session){me=null;idle=null;return null;}
   const {data:{user},error}=await client.auth.getUser();fail(error);
   const membership=await client.from('abbate_memberships').select('*').eq('user_id',user.id).single();fail(membership.error);
   const profile=await client.from('abbate_profiles').select('*').eq('user_id',user.id).eq('school_id',membership.data.school_id).single();fail(profile.error);
   me=person(membership.data,profile.data);
   if(!await monitorUserIdle(me,session)){me=null;return null;}
   return me;
 }
 // Read all staff records in bounded, deterministically ordered pages rather than
 // silently letting PostgREST's default row limit truncate the certificate archive.
 async function allPages(query,pageSize=200){
   const data=[];
   for(let start=0;;start+=pageSize){
     const r=await query().range(start,start+pageSize-1);fail(r.error);
     data.push(...r.data);
     if(r.data.length<pageSize)return {data,error:null};
   }
 }
 async function state(){
   const user=await identity();if(!user)return {me:null,students:[],completions:[]};
   const membersQuery=()=>client.from('abbate_memberships').select('*').eq('school_id',user.school).order('user_id');
   const profilesQuery=()=>client.from('abbate_profiles').select('*').eq('school_id',user.school).order('user_id');
   const recordsQuery=()=>client.from('abbate_completions').select('id,participant_id,kind,outcome,completed_at,reference,revoked_at,abbate_courses(title)').eq('school_id',user.school).order('completed_at',{ascending:false}).order('id');
   const read=query=>['admin','trainer'].includes(user.role)?allPages(query):query();
   const [members,profiles,records]=await Promise.all([read(membersQuery),read(profilesQuery),read(recordsQuery)]);[members,profiles,records].forEach(r=>fail(r.error));
   return {me:user,students:members.data.map(m=>person(m,profiles.data.find(p=>p.user_id===m.user_id))),
     completions:records.data.map(r=>({id:r.id,student:r.participant_id,title:r.abbate_courses?.title||'Schulung',
       kind:r.kind==='refresher'?'instruction':r.kind,outcome:r.outcome,completedAt:r.completed_at,reference:r.reference,revokedAt:r.revoked_at}))};
 }
 async function setRole(id,role){
   if(!me||me.role!=='admin')throw Error('Administrator access required');
   if(!id||id===me.id||!['admin','learner'].includes(role))
     throw Error('Invalid role change');
   const r=await client.rpc('abbate_manage_member_role',{
     p_school:me.school,p_target:id,p_new_role:role
   });
   fail(r.error);
   return r.data;
 }
 async function setAccess(id,action){
   if(!['activate','pause','resume'].includes(action))throw Error('Ungültige Zugangsaktion.');
   const r=await client.rpc('abbate_manage_access',{p_school:me.school,p_participant:id,p_action:action});
   fail(r.error);
   return r.data;
 }
 async function setCompany(id,value){
   if(!me?.id||!me?.school)throw Error('Please sign in again');
   if(id!==me.id && me.role!=='admin')throw Error('Administrator access required');
   if(typeof value!=='string'||value.trim().length>120)throw Error('Bitte einen Firmennamen mit maximal 120 Zeichen angeben.');
   const r=await client.rpc('abbate_set_participant_company',{p_target:id,p_company:value.trim()});
   fail(r.error);return r.data;
 }
 async function setPayment(id,action){
   if(!me||!['report','confirm','reopen'].includes(action))throw Error('Ungültige Zahlungsaktion.');
   if(action==='report' && (id!==me.id||me.role!=='learner'))throw Error('Nur Teilnehmer dürfen ihre eigene Zahlung melden.');
   if(action!=='report' && me.role!=='admin')throw Error('Administrator access required');
   const r=await client.rpc('abbate_manage_payment',{p_school:me.school,p_participant:id,p_action:action});
   fail(r.error);
   return r.data;
 }
 async function termsAccepted(){
   const r=await client.rpc('abbate_terms_accepted');
   fail(r.error);return r.data===true;
 }
 async function acceptTerms(){
   const r=await client.rpc('abbate_accept_terms',{p_version:'2026-11-02'});
   fail(r.error);
 }
  async function addCompletion(input){const r=await client.rpc('abbate_record_completion',{
   school:me.school,participant:input.student,title:input.title,kind:input.kind==='instruction'?'refresher':input.kind,
   outcome:input.outcome,completed_on:input.completedAt});fail(r.error);return r.data;}
 async function updateRecord(id,patch){
   if(!me?.id||!me?.school)throw Error('Please sign in again');
   let action,outcome=null;
   if(Object.keys(patch).length===1 && typeof patch.outcome==='string'){
     action='correct_outcome';outcome=patch.outcome;
   }else if(Object.keys(patch).length===1 && Object.hasOwn(patch,'revoked_at')){
     action='revoke';
   }else throw Error('Ungültige Änderung am Schulungsnachweis.');
   const r=await client.rpc('abbate_change_record',{p_school:me.school,p_record:id,p_action:action,p_outcome:outcome});
   fail(r.error);
 }
 async function reauthenticate(password){
   const r=await client.auth.signInWithPassword({email:me.email,password});fail(r.error);
 }
 async function deleteAccount(id,password){await reauthenticate(password);const r=await client.rpc('abbate_delete_account',{target:id});fail(r.error);if(id===me.id)await client.auth.signOut({scope:'local'});}
 async function loadPractice(){const r=await client.from('abbate_practice').select('payload').eq('user_id',me.id).maybeSingle();fail(r.error);return r.data?.payload||{results:[],mastered:[]};}
 async function savePractice(payload){
   if(!me?.id)throw Error('Please sign in again');
   const r=await client.rpc('abbate_merge_practice',{p_payload:payload});
   fail(r.error);return r.data;
 }
 const examFields='id,participant_id,guest_name,course,language,started_at,submitted_at,score,total,review,reviewed_at,bank_version';
 async function openExam(){if(!me?.id)return null;const r=await client.from('abbate_exam_attempts').select('id,course,language,started_at,question_ids').eq('participant_id',me.id).is('submitted_at',null).is('cancelled_at',null).order('started_at',{ascending:false}).limit(1).maybeSingle();fail(r.error);return r.data;}
 async function listExams(){
   if(!me?.id)throw Error('Bitte erneut anmelden.');
   const query=()=>client.from('abbate_exam_attempts').select(examFields).eq('school_id',me.school).not('submitted_at','is',null).order('submitted_at',{ascending:false}).order('id');
   return (await allPages(query)).data;
 }
 async function examRpc(name,args){if(!me?.id)throw Error('Bitte erneut anmelden.');const r=await client.rpc(name,args);fail(r.error);return r.data;}
 async function startExam(course,language){return examRpc('abbate_exam_start',{p_school:me.school,p_course:course,p_language:language});}
 async function submitExam(id,answers){return examRpc('abbate_exam_submit',{p_attempt:id,p_answers:answers});}
 async function cancelExam(id){return examRpc('abbate_exam_cancel',{p_attempt:id});}
 async function reviewExam(id,review){if(!['admin','trainer'].includes(me?.role))throw Error('Staff access required');return examRpc('abbate_exam_review',{p_attempt:id,p_review:review});}
 async function examDetail(id){const r=await client.from('abbate_exam_attempts').select(examFields+',details').eq('id',id).eq('school_id',me.school).not('submitted_at','is',null).single();fail(r.error);return r.data;}
 function message(error){
   const text=String(error?.message||'');
   if(/invalid login|invalid_credentials/i.test(text))return 'E-Mail oder Passwort stimmt nicht.';
   if(/email not confirmed/i.test(text))return 'Bitte bestätige zuerst deine E-Mail-Adresse.';
   if(/email.*not authorized|email_address_not_authorized/i.test(text))return 'Der E-Mail-Versand wird noch eingerichtet. Bitte wende dich an die Fahrschule.';
   if(error?.code==='over_email_send_rate_limit'||/over_email_send_rate_limit|you can only request this after/i.test(text)){
     const seconds=Number(text.match(/after\s+(\d+)\s+seconds?/i)?.[1]||0);
     return (seconds>0?'Bitte warte noch '+seconds+' Sekunden, bevor du eine weitere E-Mail anforderst. ':'Bitte warte kurz, bevor du eine weitere E-Mail anforderst. ')+'Falls du dich eben registriert hast, prüfe zuerst dein E-Mail-Postfach und den Spamordner. Du musst dich nicht erneut registrieren.';
   }
   if(/rate limit|too many|over_email_send_rate_limit/i.test(text))return 'Zu viele Versuche. Bitte warte kurz und versuche es erneut.';
   if(/password.*(short|least|weak)|weak_password/i.test(text))return 'Bitte ein sicheres Passwort mit mindestens 12 Zeichen verwenden.';
   if(/access is already active/i.test(text))return 'Der Zugang ist bereits aktiviert. Bitte aktualisiere die Kontenübersicht.';
   if(/paused access is still valid/i.test(text))return 'Der pausierte Zugang ist noch gültig. Verwende „Zugang fortsetzen“.';
   if(/payment already reported or confirmed/i.test(text))return 'Die Zahlung wurde bereits gemeldet oder bestätigt. Bitte aktualisieren.';
   if(/payment already confirmed/i.test(text))return 'Diese Zahlung wurde bereits bestätigt.';
   if(/payment status already open/i.test(text))return 'Der Zahlungsstatus ist bereits offen.';
   if(/only the participant may report/i.test(text))return 'Nur der Teilnehmer kann seine eigene Zahlung melden.';
   if(/account already has this role/i.test(text))return 'Dieses Konto besitzt die ausgewählte Rolle bereits.';
   if(/administrators cannot change their own role/i.test(text))return 'Die eigene Administratorrolle kann hier nicht geändert werden.';
   if(/company name too long/i.test(text))return 'Der Firmenname darf maximal 120 Zeichen enthalten.';
   if(/account not found in this school|learner not found/i.test(text))return 'Das Konto wurde in der Fahrschule nicht gefunden. Bitte die Liste aktualisieren.';
   if(/administrator access required/i.test(text))return 'Für diese Änderung ist ein aktives Administratorkonto erforderlich. Bitte die Anmeldung prüfen.';
   if(/row-level|permission|42501|Staff access|Administrator access/i.test(text))return 'Für diese Aktion fehlt die Berechtigung.';
   if(/fetch|network/i.test(text))return 'Keine Serververbindung. Bitte Internetverbindung prüfen.';
   if(/sign in again/i.test(text))return 'Bitte melde dich zur Bestätigung erneut an.';
   return 'Die Anfrage konnte nicht abgeschlossen werden. Bitte neu laden oder die Fahrschule kontaktieren.';
 }
 globalThis.ABBATE_BACKEND={client,identity,state,setRole,setAccess,setPayment,setCompany,termsAccepted,acceptTerms,addCompletion,updateRecord,deleteAccount,loadPractice,savePractice,listExams,openExam,startExam,submitExam,cancelExam,reviewExam,examDetail,message,
   isStaff:p=>!!p&&['admin','trainer'].includes(p.role)&&p.access==='active'&&(!p.until||p.until>=globalThis.ABBATE_ACCOUNTS.today()),
   get idleExpired(){return idleExpired;},get me(){return me;}};
})();
