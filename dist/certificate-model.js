'use strict';
(function(root){
  // Only a staff-confirmed, actually passed THEORY examination is represented here.
  // No credential generation or mail transport is enabled by this preview.
  const courses=Object.freeze([
    {id:'gabelstapler',label:'Fahr- und Steuerpersonal / Gabelstaplerfahrer',standard:'Theoretische Ausbildungsinhalte nach DGUV Grundsatz 308-001'},
    {id:'hebebuehnen',label:'Hebebühnen',standard:''},
    {id:'krane',label:'Krane',standard:''},
    {id:'lasten',label:'Anschlagen von Lasten',standard:''},
    {id:'bagger',label:'Erdbaumaschinen & Bagger',standard:''},
    {id:'ladungssicherung',label:'Ladungssicherung',standard:''},
    {id:'abseilen',label:'Abseilen aus Höhen',standard:''}
  ].map(Object.freeze));
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
  const dateOK=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
  function prepare(person,values,asOf=today()){
    if(!person||person.role!=='learner'||!person.id||!String(person.name||'').trim())throw Error('Bitte ein Teilnehmerkonto auswählen.');
    const course=courses.find(c=>c.id===values.course);
    if(!course)throw Error('Bitte den Ausbildungsbereich auswählen.');
    if(!dateOK(values.completedAt)||values.completedAt>asOf)throw Error('Bitte das tatsächliche Prüfungsdatum angeben; es darf nicht in der Zukunft liegen.');
    if(!['none','email'].includes(values.notification))throw Error('Bitte eine Versandoption auswählen.');
    const email=String(person.email||'').trim();
    if(values.notification==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Für den E-Mail-Versand fehlt eine gültige Teilnehmeradresse.');
    return Object.freeze({student:person.id,name:person.name,email,course:course.id,label:course.label,standard:course.standard,completedAt:values.completedAt,notification:values.notification,title:course.label+' · Theorieprüfung',kind:'exam',outcome:'passed'});
  }
  const api=Object.freeze({courses,today,prepare});if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ABBATE_CERTIFICATES=api;
})(globalThis);
