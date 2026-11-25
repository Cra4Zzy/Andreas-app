'use strict';
(function(root){
  // Client-side preparation only; the server authorizes and issues actual certificates.
  const courses=Object.freeze([
    {id:'gabelstapler',label:'Fahr- und Steuerpersonal / Gabelstaplerfahrer',standard:'Theoretische Ausbildungsinhalte nach DGUV Grundsatz 308-001'},
    {id:'hebebuehnen',label:'Hebebühnen',standard:'Fachlicher Bezug: DGUV Grundsatz 308-008 (Hubarbeitsbühnen)'},
    {id:'krane',label:'Krane',standard:'Fachlicher Bezug: DGUV Grundsatz 309-003'},
    {id:'lasten',label:'Anschlagen von Lasten',standard:'Fachlicher Bezug: DGUV Regel 109-017 (Anhang B)'},
    {id:'bagger',label:'Erdbaumaschinen & Bagger',standard:'Fachlicher Bezug: DGUV Grundsatz 301-005 (Hydraulikbagger und Radlader)'},
    {id:'ladungssicherung',label:'Ladungssicherung',standard:'Fachlicher Bezug: DGUV Regel 114-615 und VDI 2700'},
    {id:'abseilen',label:'Abseilen aus Höhen',standard:'Fachlicher Bezug: DGUV Regeln 112-198 und 112-199'},
    {id:'jaehrliche-unterweisung',label:'Jährliche Unterweisung',standard:'DGUV Vorschrift 1 § 4; bei Arbeitsmitteln § 12 BetrSichV',kind:'instruction'}
  ].map(Object.freeze));
  const templates=Object.freeze(Object.fromEntries(Object.entries({"cargo":{"id":"cargo","course":"ladungssicherung","label":"Ladungssicherung","title":"Ladungssicherung nach VDI 2700ff · Teilnahmebescheinigung","outcome":"attended","proof":"Teilnahmebescheinigung","standard":"VDI 2700ff"},"rope":{"id":"rope","course":"abseilen","label":"Abseilen aus Höhen","title":"Abseilen aus Höhen und Tiefen · Ausbildungsnachweis","outcome":"passed","proof":"Ausbildungsnachweis (Theorie & Praxis)","standard":"DGUV Regeln 112-198 und 112-199"},"fire":{"id":"fire","course":"brandschutzhelfer","label":"Brandschutzhelfer","title":"Brandschutzhelfer · Ausbildungsbescheinigung","outcome":"attended","proof":"Ausbildungsbescheinigung (Theorie & Praxis)","standard":"§ 10 ArbSchG · ASR A2.2 · DGUV Information 205-023"}}).map(([k,v])=>[k,Object.freeze(v)])));
  const specialRecord=r=>r.kind==='training'&&Object.values(templates).some(t=>r.title===t.title&&r.outcome===t.outcome);
  const fields=Object.freeze(courses.filter(c=>!c.kind));
  const annualPrefix='Jährliche Unterweisung · ';
  const annualSuffix=' · Unterweisungsnachweis';
  const annualField=title=>fields.find(c=>title===annualPrefix+c.label+annualSuffix);
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
  const dateOK=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
  function prepare(person,values,asOf=today()){
    if(!person||person.role!=='learner'||!person.id||!String(person.name||'').trim())throw Error('Bitte ein Teilnehmerkonto auswählen.');
    const course=courses.find(c=>c.id===values.course)||(values.course==='brandschutzhelfer'?{id:'brandschutzhelfer',label:'Brandschutzhelfer',standard:templates.fire.standard}:null);
    const type=values.proofType||'theory';
    const template=type==='theory'?null:templates[type];
    if((type!=='theory'&&(!template||template.course!==values.course))||(values.course==='brandschutzhelfer'&&type!=='fire'))throw Error('Bitte eine passende Nachweisart auswählen.');
    if(!course)throw Error('Bitte den Ausbildungsbereich auswählen.');
    if(!dateOK(values.completedAt)||values.completedAt>asOf)throw Error('Bitte das tatsächliche Datum angeben; es darf nicht in der Zukunft liegen.');
    if(!['none','email'].includes(values.notification))throw Error('Bitte eine Versandoption auswählen.');
    const field=course.kind==='instruction'?fields.find(c=>c.id===values.field):null;
    if(course.kind==='instruction'&&!field)throw Error('Bitte den unterwiesenen Fachbereich auswählen.');
    const accountEmail=String(person.email||'').trim();
    const email=values.notification==='email'&&values.recipientEmail!==undefined?String(values.recipientEmail).trim():accountEmail;
    const alternateRecipient=values.notification==='email'&&email.toLowerCase()!==accountEmail.toLowerCase();
    if(values.notification==='email'&&(email.length>254||!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)))throw Error('Bitte eine gültige Empfänger-E-Mail-Adresse eingeben.');
    if(template){
      const clean=(v,max,label)=>{const s=String(v||'').trim();if(!s||s.length>max||/[\x00-\x1f\x7f]/.test(s))throw Error(label+' bitte vollständig angeben.');return s;};
      const details={};
      if(template.id==='cargo'||template.id==='rope'){
        if(!dateOK(values.birthDate)||values.birthDate>values.completedAt)throw Error('Bitte gültiges Geburtsdatum angeben.');
        details.birthDate=values.birthDate;
      }
      if(template.id!=='cargo'){details.company=clean(values.company,100,'Unternehmen');details.location=clean(values.location,80,'Schulungsort');}
      if(template.id==='rope')details.birthPlace=clean(values.birthPlace,80,'Geburtsort');
      if(template.id==='fire'&&String(values.department||'').trim())details.department=String(values.department).trim();
      if(details.department&&(details.department.length>100||/[\x00-\x1f\x7f]/.test(details.department)))throw Error('Bitte gültigen Einsatzbereich eingeben.');
      const theory=values.theoryConfirmed==='yes',practice=values.practiceConfirmed==='yes';
      if(template.id!=='cargo'&&(!theory||!practice))throw Error('Bitte Theorie und praktische Durchführung ausdrücklich bestätigen.');
      return Object.freeze({student:person.id,name:person.name,email,alternateRecipient,course:course.id,label:template.label,standard:template.standard,completedAt:values.completedAt,notification:values.notification,field:null,title:template.title,kind:'training',outcome:template.outcome,template:template.id,details:Object.freeze(details),theory,practice});
    }
    return Object.freeze({student:person.id,name:person.name,email,alternateRecipient,course:course.id,label:course.label,standard:course.standard,completedAt:values.completedAt,notification:values.notification,field:field?.label||null,title:field?annualPrefix+field.label+annualSuffix:course.label+' · Theorieprüfung',kind:course.kind||'exam',outcome:course.kind==='instruction'?'attended':'passed'});
  }
  // A separate completion is recorded for each selected examination.
  function prepareSelection(person,values,asOf=today()){
    const base=prepare(person,values,asOf);
    if(base.kind!=='exam'||base.template||values.examSelection!=='yes')return [base];
    const drafts=[];
    if(values.examTheory==='yes')drafts.push(base);
    if(values.examPractice==='yes')drafts.push(Object.freeze({...base,examType:'practice',title:base.label+' · Praxisprüfung',standard:base.course==='gabelstapler'?'Fachlicher Bezug: DGUV Grundsatz 308-001':base.standard}));
    if(!drafts.length)throw Error('Bitte mindestens eine bestandene Prüfung auswählen.');
    return drafts;
  }
  function nextDue(date){
    if(!dateOK(date))throw Error('Ungültiges Unterweisungsdatum.');
    const [y,m,d]=date.split('-').map(Number),last=new Date(Date.UTC(y+1,m,0)).getUTCDate();
    return [y+1,String(m).padStart(2,'0'),String(Math.min(d,last)).padStart(2,'0')].join('-');
  }
  function reminders(records,asOf=today(),windowDays=30){
    const latest=new Map();
    for(const r of records){
      const field=annualField(r.title);
      if(!field||r.kind!=='instruction'||r.outcome!=='attended'||r.revokedAt||!dateOK(r.completedAt)||r.completedAt>asOf)continue;
      const key=JSON.stringify([r.student,field.id]);
      if(!latest.has(key)||latest.get(key).completedAt<r.completedAt)latest.set(key,{...r,field:field.label});
    }
    return [...latest.values()].map(r=>({...r,due:nextDue(r.completedAt)})).map(r=>({...r,days:(Date.parse(r.due+'T00:00:00Z')-Date.parse(asOf+'T00:00:00Z'))/86400000})).filter(r=>r.days<=windowDays).sort((a,b)=>a.due.localeCompare(b.due));
  }
  const api=Object.freeze({courses,fields,annualField,today,prepare,prepareSelection,nextDue,reminders,templates,specialRecord});if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ABBATE_CERTIFICATES=api;
})(globalThis);
