'use strict';
(() => {
 const C=globalThis.ABBATE_CONFIG;
 const client=globalThis.AbbateSupabase.createClient(C.url,C.publishableKey,{
   auth:{storageKey:'abbate-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
 });
 const fail=error=>{if(error)throw error;};
 const person=(membership,profile)=>({id:membership.user_id,school:membership.school_id,
   role:membership.role,name:profile?.display_name||'Teilnehmer',email:profile?.email||'',
   access:membership.access_status,until:membership.access_until,registeredAt:profile?.registered_at});
 let me=null;
 async function identity(){
   const {data:{session}}=await client.auth.getSession();if(!session){me=null;return null;}
   const {data:{user},error}=await client.auth.getUser();fail(error);
   const membership=await client.from('abbate_memberships').select('*').eq('user_id',user.id).single();fail(membership.error);
   const profile=await client.from('abbate_profiles').select('*').eq('user_id',user.id).eq('school_id',membership.data.school_id).single();fail(profile.error);
   me=person(membership.data,profile.data);return me;
 }
 async function state(){
   const user=await identity();if(!user)return {me:null,students:[],completions:[]};
   const [members,profiles,records]=await Promise.all([
     client.from('abbate_memberships').select('*').eq('school_id',user.school),
     client.from('abbate_profiles').select('*').eq('school_id',user.school),
     client.from('abbate_completions').select('id,participant_id,kind,outcome,completed_at,reference,revoked_at,abbate_courses(title)').eq('school_id',user.school).order('completed_at',{ascending:false})
   ]);[members,profiles,records].forEach(r=>fail(r.error));
   return {me:user,students:members.data.filter(m=>m.role==='learner'||m.user_id===user.id)
      .map(m=>person(m,profiles.data.find(p=>p.user_id===m.user_id))),
     completions:records.data.map(r=>({id:r.id,student:r.participant_id,title:r.abbate_courses?.title||'Schulung',
       kind:r.kind==='refresher'?'instruction':r.kind,outcome:r.outcome,completedAt:r.completed_at,reference:r.reference,revokedAt:r.revoked_at}))};
 }
 async function setAccess(id,action){
   if(!['activate','extend','pause','resume'].includes(action))throw Error('Ungültige Zugangsaktion.');
   const r=await client.rpc('abbate_manage_access',{p_school:me.school,p_participant:id,p_action:action});
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
 function message(error){
   const text=String(error?.message||'');
   if(/invalid login|invalid_credentials/i.test(text))return 'E-Mail oder Passwort stimmt nicht.';
   if(/email not confirmed/i.test(text))return 'Bitte bestätige zuerst deine E-Mail-Adresse.';
   if(/email.*not authorized|email_address_not_authorized/i.test(text))return 'Der E-Mail-Versand wird noch eingerichtet. Bitte wende dich an die Fahrschule.';
   if(/rate limit|too many|over_email_send_rate_limit/i.test(text))return 'Zu viele Versuche. Bitte warte kurz und versuche es erneut.';
   if(/password.*(short|least|weak)|weak_password/i.test(text))return 'Bitte ein sicheres Passwort mit mindestens 12 Zeichen verwenden.';
   if(/row-level|permission|42501|Staff access|Administrator access/i.test(text))return 'Für diese Aktion fehlt die Berechtigung.';
   if(/fetch|network/i.test(text))return 'Keine Serververbindung. Bitte Internetverbindung prüfen.';
   if(/sign in again/i.test(text))return 'Bitte melde dich zur Bestätigung erneut an.';
   return 'Die Anfrage konnte nicht abgeschlossen werden. Bitte neu laden oder die Fahrschule kontaktieren.';
 }
 globalThis.ABBATE_BACKEND={client,identity,state,setAccess,termsAccepted,acceptTerms,addCompletion,updateRecord,deleteAccount,loadPractice,savePractice,message,
   isStaff:p=>!!p&&['admin','trainer'].includes(p.role)&&p.access==='active'&&(!p.until||p.until>=globalThis.ABBATE_ACCOUNTS.today()),
   get me(){return me;}};
})();
