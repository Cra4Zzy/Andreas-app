'use strict';
(function(root){
  const STORE='abbate-lernraum-v5', SESSION='abbate-portal-demo-session';
  const statuses={pending:'Wartet auf Freischaltung',active:'Aktiv',paused:'Pausiert'};
  const outcomes={attended:'Teilgenommen',passed:'Bestanden',failed:'Nicht bestanden'};
  const kinds={training:'Schulung',instruction:'Unterweisung',exam:'Prüfung'};
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
  const dateOK=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!isNaN(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  function seed(){return {selected:'lena',students:[
    {id:'lena',name:'Lena M.',email:'lena@example.test',until:'2026-12-31',access:'active'},
    {id:'max',name:'Max T.',email:'max@example.test',until:'2026-12-31',access:'active'},
    {id:'sarah',name:'Sarah K.',email:'sarah@example.test',until:'2026-12-31',access:'paused'},
    {id:'jonas',name:'Jonas B.',email:'jonas@example.test',until:'2026-12-31',access:'pending'}
  ],results:[],mastered:{}};}
  function migrate(input){
    const state=JSON.parse(JSON.stringify(input||seed()));
    if(!Array.isArray(state.students))state.students=[];
    state.students=state.students.filter(p=>p&&typeof p.id==='string'&&typeof p.email==='string'&&typeof p.name==='string');
    for(const p of state.students){if(!statuses[p.access])p.access='active';}
    if(!state.portalVersion){
      state.completions=[
        {id:'demo-1',student:'lena',title:'Gabelstapler · Grundausbildung',kind:'training',outcome:'attended',completedAt:'2026-09-10',reference:'DEMO-001'},
        {id:'demo-2',student:'lena',title:'Gabelstapler · Abschlussprüfung',kind:'exam',outcome:'failed',completedAt:'2026-09-11',reference:'DEMO-002'},
        {id:'demo-3',student:'lena',title:'Gabelstapler · Wiederholungsprüfung',kind:'exam',outcome:'passed',completedAt:'2026-09-18',reference:'DEMO-003'},
        {id:'demo-4',student:'lena',title:'Unterweisung · Sicherer Betrieb',kind:'instruction',outcome:'attended',completedAt:'2026-10-15',reference:'DEMO-004'}
      ].filter(r=>state.students.some(p=>p.id===r.student));
      state.portalVersion=1;
    }
    state.completions=Array.isArray(state.completions)?state.completions:[];
    state.audit=Array.isArray(state.audit)?state.audit:[];
    state.results=Array.isArray(state.results)?state.results:[];
    state.mastered ||= {};
    return state;
  }
  const access=p=>!!p&&p.access==='active'&&(!p.until||(dateOK(p.until)&&p.until>=today()));
  function register(state,{name,email},id){
    name=String(name||'').trim();email=String(email||'').trim().toLowerCase();
    if(!name||name.length>120)throw Error('Bitte einen Namen mit höchstens 120 Zeichen angeben.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>160)throw Error('Bitte eine gültige E-Mail-Adresse angeben.');
    if(state.students.some(p=>p.email.toLowerCase()===email))throw Error('Diese E-Mail-Adresse ist bereits registriert.');
    if(!id||state.students.some(p=>p.id===id))throw Error('Ungültige Konto-Kennung.');
    const person={id,name,email,access:'pending',until:today()};state.students.push(person);
    state.audit.push({action:'registered',student:id,at:new Date().toISOString()});return person;
  }
  function setAccess(state,id,status,until){
    const person=state.students.find(p=>p.id===id);
    if(!person||!statuses[status])throw Error('Konto oder Zugangsstatus ist ungültig.');
    if(until!==undefined&&!dateOK(until))throw Error('Bitte ein gültiges Ablaufdatum wählen.');
    if(status==='active'&&((until||person.until)<today()))throw Error('Zum Aktivieren bitte ein heutiges oder zukünftiges Ablaufdatum wählen.');
    person.access=status;if(until!==undefined)person.until=until;
    state.audit.push({action:'access:'+status,student:id,at:new Date().toISOString()});
  }
  function recordsFor(state,id,asOf=today()){
    return state.completions.filter(r=>r.student===id&&!r.revokedAt&&dateOK(r.completedAt)&&r.completedAt<=asOf&&kinds[r.kind]&&outcomes[r.outcome])
      .slice().sort((a,b)=>b.completedAt.localeCompare(a.completedAt)||a.id.localeCompare(b.id));
  }
  function ownPass(state,id){const person=state.students.find(p=>p.id===id);if(!access(person))return null;
    return {name:person.name,records:recordsFor(state,id).map(r=>({id:r.id,title:r.title,kind:r.kind,outcome:r.outcome,completedAt:r.completedAt,reference:r.reference}))};}
  function addCompletion(state,input,id,asOf=today()){
    if(!state.students.some(p=>p.id===input.student))throw Error('Dieses Konto existiert nicht mehr.');
    const title=String(input.title||'').trim();
    if(!title||title.length>200)throw Error('Bitte eine Bezeichnung mit höchstens 200 Zeichen eingeben.');
    if(!kinds[input.kind]||!outcomes[input.outcome]||(input.kind==='exam'&&input.outcome==='attended'))throw Error('Für Prüfungen bitte „Bestanden“ oder „Nicht bestanden“ wählen.');
    if(!dateOK(input.completedAt)||input.completedAt>asOf)throw Error('Nur bereits durchgeführte Schulungen und Prüfungen mit tatsächlichem Datum eintragen.');
    if(!id||state.completions.some(r=>r.id===id))throw Error('Dieser Eintrag existiert bereits.');
    const r={id,student:input.student,title,kind:input.kind,outcome:input.outcome,completedAt:input.completedAt,reference:'DEMO-'+id.slice(-8).toUpperCase()};
    state.completions.push(r);state.audit.push({action:'recorded:'+r.outcome,student:r.student,at:new Date().toISOString()});return r;
  }
  function updateOutcome(state,id,outcome,studentId){
    const r=state.completions.find(record=>record.id===id&&record.student===studentId&&!record.revokedAt);
    if(!r||!outcomes[outcome]||(r.kind==='exam'&&outcome==='attended'))throw Error('Ungültiger Eintrag oder Ergebnisstatus.');
    const before=r.outcome;r.outcome=outcome;
    state.audit.push({action:'outcome_changed',student:r.student,before,after:outcome,at:new Date().toISOString()});
  }
  function removePerson(state,id){
    if(!state.students.some(p=>p.id===id))throw Error('Dieses Konto existiert nicht mehr.');
    state.students=state.students.filter(p=>p.id!==id);state.completions=state.completions.filter(r=>r.student!==id);
    state.results=state.results.filter(r=>r.student!==id);delete state.mastered[id];
    if(state.selected===id)state.selected=state.students[0]?.id||null;
    state.audit.push({action:'deleted',student:id,at:new Date().toISOString()});
  }
  const api={STORE,SESSION,statuses,outcomes,kinds,today,dateOK,seed,migrate,access,register,setAccess,recordsFor,ownPass,addCompletion,updateOutcome,removePerson};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ABBATE_ACCOUNTS=api;
})(globalThis);
