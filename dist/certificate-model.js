'use strict';
(function(root){
  // Only a staff-confirmed, actually passed THEORY examination is represented here.
  // No credential generation or mail transport is enabled by this preview.
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
  const fields=Object.freeze(courses.filter(c=>!c.kind));
  const annualPrefix='Jährliche Unterweisung · ';
  const annualSuffix=' · Unterweisungsnachweis';
  const annualField=title=>fields.find(c=>title===annualPrefix+c.label+annualSuffix);
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
  const dateOK=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
  function prepare(person,values,asOf=today()){
    if(!person||person.role!=='learner'||!person.id||!String(person.name||'').trim())throw Error('Bitte ein Teilnehmerkonto auswählen.');
    const course=courses.find(c=>c.id===values.course);
    if(!course)throw Error('Bitte den Ausbildungsbereich auswählen.');
    if(!dateOK(values.completedAt)||values.completedAt>asOf)throw Error('Bitte das tatsächliche Datum angeben; es darf nicht in der Zukunft liegen.');
    if(!['none','email'].includes(values.notification))throw Error('Bitte eine Versandoption auswählen.');
    const field=course.kind==='instruction'?fields.find(c=>c.id===values.field):null;
    if(course.kind==='instruction'&&!field)throw Error('Bitte den unterwiesenen Fachbereich auswählen.');
    const email=String(person.email||'').trim();
    if(values.notification==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Für den E-Mail-Versand fehlt eine gültige Teilnehmeradresse.');
    return Object.freeze({student:person.id,name:person.name,email,course:course.id,label:course.label,standard:course.standard,completedAt:values.completedAt,notification:values.notification,field:field?.label||null,title:field?annualPrefix+field.label+annualSuffix:course.label+' · Theorieprüfung',kind:course.kind||'exam',outcome:course.kind==='instruction'?'attended':'passed'});
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
  const api=Object.freeze({courses,fields,annualField,today,prepare,nextDue,reminders});if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ABBATE_CERTIFICATES=api;
})(globalThis);
