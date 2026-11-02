'use strict';
(() => {
  const M=globalThis.ABBATE_ACCOUNTS,view=document.body.dataset.view,root=document.querySelector('#portal-content');
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day=value=>new Intl.DateTimeFormat('de-DE',{dateStyle:'long'}).format(new Date(value+'T12:00:00'));
  let state,selected=null,search='',filter='all';
  function load(){try{state=M.migrate(JSON.parse(localStorage.getItem(M.STORE)));}catch{state=M.migrate();}}
  function save(){localStorage.setItem(M.STORE,JSON.stringify(state));}
  function session(){return sessionStorage.getItem(M.SESSION);}
  function notice(text){document.querySelector('#portal-status').textContent=text;}
  const uuid=()=>globalThis.crypto?.randomUUID?.()||'demo-'+Date.now().toString(36)+'-'+Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
  const nextMonth=()=>{const d=new Date();d.setDate(d.getDate()+30);return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(d);};
  function personStatus(person){return person.access==='active'&&!M.access(person)?'Abgelaufen':M.statuses[person.access];}
  function badge(person){return `<span class="portal-badge ${M.access(person)?'active':person.access}">${safe(personStatus(person))}</span>`;}
  function recordCard(r,editable=false){return `<article class="portal-record"><div class="portal-record-top"><span>${safe(M.kinds[r.kind])}</span><span class="portal-result ${r.outcome}">${r.outcome==='failed'?'×':'✓'} ${safe(M.outcomes[r.outcome])}</span></div><h3>${safe(r.title)}</h3><dl><div><dt>Durchgeführt am</dt><dd>${day(r.completedAt)}</dd></div><div><dt>Erfasst durch</dt><dd>Fahrschule Abbate · Demo</dd></div><div><dt>Referenz</dt><dd>${safe(r.reference)}</dd></div></dl>${editable?`<label class="portal-result-edit">Ergebnis ändern<select data-result="${safe(r.id)}">${Object.entries(M.outcomes).filter(([value])=>r.kind!=='exam'||value!=='attended').map(([value,label])=>`<option value="${value}" ${r.outcome===value?'selected':''}>${safe(label)}</option>`).join('')}</select></label><button class="portal-text" data-revoke="${safe(r.id)}">Fehleintrag zurückziehen</button>`:''}</article>`;}
  function login(){
    root.innerHTML=`<section class="portal-login-heading"><span class="portal-eyebrow">Ein QR-Code. Dein persönlicher Bereich.</span><h1>Deine Schulungen.<br>Dein Überblick.</h1><p>Melde dich mit deinem eigenen Konto an. Du siehst ausschließlich deinen persönlichen Verlauf.</p></section><div class="portal-login-grid"><section class="portal-panel"><span class="portal-step">01 / Bereits registriert</span><h2>Deinen Bereich öffnen</h2><p class="portal-hint">Die Vorschau simuliert die Anmeldung über eine fiktive E-Mail-Adresse. Es wird kein Passwort abgefragt oder gespeichert.</p><form id="login-form"><label>E-Mail-Adresse<input type="email" name="email" value="lena@example.test" required autocomplete="off"></label><button class="primary" type="submit">Demo-Konto öffnen ↗</button><p role="alert" class="portal-error"></p></form><p class="portal-hint">Beispielkonto: lena@example.test</p></section><section class="portal-panel"><span class="portal-step">02 / Neu bei Abbate</span><h2>Registrierung ausprobieren</h2><p class="portal-hint">Neue Konten warten auf Andreas’ Freischaltung. Bitte ausschließlich ausgedachte Angaben verwenden.</p><form id="register-form"><label>Name<input name="name" maxlength="120" required placeholder="Fiktiver Beispielname" autocomplete="off"></label><label>E-Mail-Adresse<input name="email" type="email" maxlength="160" required placeholder="name@example.test" autocomplete="off"></label><button class="secondary" type="submit">Demo-Konto registrieren</button><p role="alert" class="portal-error"></p></form></section></div>`;
  }
  function reader(){
    const person=state.students.find(p=>p.id===session());
    if(!person){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Persönlicher Schulungspass</span><h1>Bitte zuerst anmelden.</h1><p>Über deinen Zugang wird dein eigener Schulungsverlauf geladen.</p><a class="primary" href="./konto.html">Zur Demo-Anmeldung ↗</a></section>`;return;}
    const proof=M.ownPass(state,person.id);
    if(!proof){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">${safe(person.name)}</span><h1>${person.access==='pending'?'Deine Freischaltung steht noch aus.':person.access==='paused'?'Dein Zugang ist pausiert.':'Dein Zugang ist abgelaufen.'}</h1><p>${person.access==='pending'?'Dein Demo-Konto ist registriert. Andreas kann es jetzt in der Verwaltung freischalten.':'Bitte wende dich an deine Fahrschule. Deine bisherigen Einträge bleiben bei einer Pause gespeichert.'}</p><button class="secondary" data-logout>Demo-Konto wechseln</button></section>`;return;}
    const records=proof.records;
    root.innerHTML=`<section class="portal-identity"><div class="portal-avatar" aria-hidden="true">${safe(person.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><div><span class="portal-eyebrow">Dein persönlicher Schulungspass</span><h1>${safe(person.name)}</h1><p>Durchgeführte Schulungen, Unterweisungen und Prüfungen.</p></div><span class="portal-readonly">Nur ansehen</span></section><section class="portal-overview"><div><small>Dokumentierter Verlauf</small><strong>${records.length} <span>${records.length===1?'Eintrag':'Einträge'}</span></strong></div><div><small>Zuletzt durchgeführt</small><strong class="portal-date">${records[0]?day(records[0].completedAt):'Noch kein Eintrag'}</strong></div></section><section class="portal-history"><div class="portal-section-title"><div><span class="portal-eyebrow">Von deiner Fahrschule erfasst</span><h2>Das hast du bereits absolviert.</h2></div><span>Neueste zuerst</span></div><div class="portal-records">${records.map(r=>recordCard(r)).join('')||'<section class="portal-panel"><h3>Noch keine Einträge.</h3><p>Hier erscheinen durchgeführte Schulungen und Prüfungen, sobald die Fahrschule sie erfasst hat.</p></section>'}</div></section><footer class="portal-reader-footer"><p>Die Angaben werden von der Fahrschule gepflegt. Übungsrunden aus der Lern-App erzeugen keine bestätigten Schulungs- oder Prüfungseinträge.</p><button class="portal-text" data-logout>Demo abmelden</button></footer>`;
  }
  function people(){return state.students.filter(p=>(p.name+' '+p.email).toLowerCase().includes(search.toLowerCase())&&(filter==='all'||(filter==='expired'?p.access==='active'&&!M.access(p):p.access===filter)));}
  function peopleList(){return people().map(p=>`<button class="portal-person ${selected===p.id?'selected':''}" data-person="${safe(p.id)}" aria-pressed="${selected===p.id}"><span class="portal-person-name">${safe(p.name)}<small>${safe(p.email)}</small></span>${badge(p)}</button>`).join('')||'<p class="portal-hint">Keine passenden Konten.</p>';}
  function detail(){
    const p=state.students.find(p=>p.id===selected);if(!p)return '<section class="portal-panel"><h2>Konto auswählen</h2><p>Wähle links einen Teilnehmer aus. Neue Registrierungen erscheinen dort automatisch in dieser Browserdemo.</p></section>';
    const records=M.recordsFor(state,p.id);
    return `<section class="portal-account-heading"><div><span class="portal-eyebrow">Teilnehmerkonto</span><h2>${safe(p.name)}</h2><p>${safe(p.email)}</p></div>${badge(p)}</section><section class="portal-access-panel"><div><h3>Zugang steuern</h3><p>Nach Zahlung freischalten oder bei Bedarf pausieren. Der Zahlstatus wird hier manuell geprüft.</p></div><form id="access-form"><label>Zugang gültig bis<input name="until" type="date" value="${safe(p.access!=='pending'&&M.dateOK(p.until)&&p.until>=M.today()?p.until:nextMonth())}" required></label><div class="portal-actions"><button class="primary" name="intent" value="active" type="submit">${M.access(p)?'Aktivierung speichern':'Zugang aktivieren'}</button><button class="secondary" name="intent" value="paused" type="submit" ${p.access==='paused'?'disabled':''}>Zugang pausieren</button></div><p role="alert" class="portal-error"></p></form></section><section class="portal-panel portal-entry"><span class="portal-eyebrow">Tatsächlich durchgeführte Schulung oder Prüfung</span><h3>Ergebnis eintragen</h3><form id="record-form" class="portal-record-form"><label class="portal-wide">Bezeichnung<input name="title" maxlength="200" required placeholder="z. B. Gabelstapler · Abschlussprüfung"></label><label>Art<select name="kind" id="record-kind" aria-label="Art"><option value="training">Schulung</option><option value="instruction">Unterweisung</option><option value="exam">Prüfung</option></select></label><label>Durchgeführt am<input name="completedAt" type="date" max="${M.today()}" required></label><label>Ergebnis<select name="outcome" id="record-outcome" aria-label="Ergebnis"><option value="attended">Teilgenommen</option><option value="passed">Bestanden</option><option value="failed">Nicht bestanden</option></select></label><div class="portal-submit"><button class="primary" type="submit">Im Schulungspass speichern</button></div><p role="alert" class="portal-error portal-wide"></p></form></section><section class="portal-history"><div class="portal-section-title"><h3>Schulungsverlauf</h3><span>${records.length} ${records.length===1?'Eintrag':'Einträge'}</span></div><div class="portal-records">${records.map(r=>recordCard(r,true)).join('')||'<p>Noch keine durchgeführten Schulungen oder Prüfungen eingetragen.</p>'}</div></section><details class="portal-delete"><summary>Konto endgültig löschen …</summary><p>Hiermit werden das fiktive Konto und seine Demo-Ergebnisse entfernt. Pausieren erhält alle Einträge.</p><button class="portal-danger" data-delete-open>Demo-Konto löschen</button></details><dialog id="delete-dialog" class="portal-dialog"><h2>Demo-Konto wirklich löschen?</h2><p>${safe(p.name)} und die zugehörigen Demo-Einträge werden aus diesem Browser entfernt.</p><div class="portal-actions"><button class="secondary" data-delete-cancel>Abbrechen</button><button class="portal-danger" data-delete-confirm>Endgültig löschen</button></div></dialog>`;
  }
  function renderDetail(){document.querySelector('#account-detail').innerHTML=detail();}
  function admin(){
    root.innerHTML=`<section class="portal-admin-heading"><div><span class="portal-eyebrow">Andreas’ Verwaltungsbereich · Demo</span><h1>Konten im Blick.<br>Ergebnisse mit einem Klick.</h1><p>Freischalten, pausieren und tatsächliche Schulungen dokumentieren.</p></div><details class="portal-qr"><summary>QR-Code für alle Karten</summary><p>Dieser eine Code führt zur Anmeldung. Das angemeldete Konto bestimmt den persönlichen Schulungsverlauf.</p><canvas id="portal-qr" aria-label="Gemeinsamer Demo-Karten-QR-Code"></canvas><button class="secondary" id="download-qr">Gemeinsamen QR-Code als PNG speichern</button><p class="portal-hint">Vorschau-Link – vor dem Druck echter Karten durch die endgültige Portaladresse ersetzen.</p></details></section><section class="portal-stats" aria-label="Kontenübersicht"><div><span>Registrierte Konten</span><strong>${state.students.length}</strong></div><div><span>Warten auf Freischaltung</span><strong>${state.students.filter(p=>p.access==='pending').length}</strong></div><div><span>Aktive Zugänge</span><strong>${state.students.filter(M.access).length}</strong></div><div><span>Pausiert / abgelaufen</span><strong>${state.students.filter(p=>p.access==='paused'||(p.access==='active'&&!M.access(p))).length}</strong></div></section><div class="portal-admin-layout"><aside class="portal-sidebar"><label for="account-search">Konten suchen</label><input id="account-search" type="search" placeholder="Name oder E-Mail" value="${safe(search)}"><label class="portal-filter-label" for="account-filter">Zugangsstatus</label><select id="account-filter"><option value="all">Alle Konten</option><option value="pending">Wartet auf Freischaltung</option><option value="active">Aktiviert</option><option value="paused">Pausiert</option><option value="expired">Abgelaufen</option></select><div id="account-list" class="portal-people">${peopleList()}</div><a href="./konto.html#registrieren" class="portal-text">Demo-Registrierung ausprobieren ↗</a></aside><div id="account-detail" class="portal-detail">${detail()}</div></div>`;
    document.querySelector('#account-filter').value=filter;
    const canvas=document.querySelector('#portal-qr');
    AbbateQR.toCanvas(canvas,new URL('./konto.html',location.href).href,{width:240,margin:4,errorCorrectionLevel:'M'}).catch(()=>{canvas.hidden=true;});
  }
  function render(){load();if(view==='admin')admin();else if(view==='login'){if(location.hash!=='#registrieren'&&state.students.some(p=>p.id===session())){location.replace('./nachweise.html');return;}login();}else reader();}
  root.addEventListener('submit',event=>{
    const form=event.target;if(!['login-form','register-form','access-form','record-form'].includes(form.id))return;
    event.preventDefault();const values=Object.fromEntries(new FormData(form));load();
    try{
      if(form.id==='login-form'){
        const p=state.students.find(s=>s.email.toLowerCase()===String(values.email).trim().toLowerCase());
        if(!p)throw Error('Dieses Demo-Konto existiert in diesem Browser nicht. Bitte zuerst registrieren.');
        state.selected=p.id;save();sessionStorage.setItem(M.SESSION,p.id);location.href='./nachweise.html';return;
      }
      if(form.id==='register-form'){
        const p=M.register(state,values,uuid());state.selected=p.id;save();sessionStorage.setItem(M.SESSION,p.id);location.href='./nachweise.html';return;
      }
      if(view!=='admin')return;
      if(form.id==='access-form')M.setAccess(state,selected,event.submitter?.value||'active',values.until);
      else M.addCompletion(state,{...values,student:selected},uuid());
      save();admin();notice(form.id==='access-form'?'Zugangsstatus gespeichert. Die Schüleransicht berücksichtigt die Änderung sofort.':'Durchführung mit Datum und Ergebnis gespeichert. Der Eintrag erscheint im persönlichen Verlauf.');
    }catch(error){const el=form.querySelector('[role="alert"]');if(el)el.textContent=error.message;}
  });
  root.addEventListener('input',event=>{if(view==='admin'&&event.target.id==='account-search'){search=event.target.value;document.querySelector('#account-list').innerHTML=peopleList();}});
  root.addEventListener('change',event=>{
    if(view!=='admin')return;
    if(event.target.matches('[data-result]')){try{load();M.updateOutcome(state,event.target.dataset.result,event.target.value,selected);save();renderDetail();notice('Ergebnis aktualisiert und im Demo-Verlauf protokolliert.');}catch(error){notice(error.message);}return;}
    if(event.target.id==='account-filter'){filter=event.target.value;document.querySelector('#account-list').innerHTML=peopleList();}
    if(event.target.id==='record-kind'){
      const outcome=document.querySelector('#record-outcome');outcome.querySelector('[value="attended"]').disabled=event.target.value==='exam';
      if(event.target.value==='exam'&&outcome.value==='attended')outcome.value='passed';
    }
  });
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-logout]')){sessionStorage.removeItem(M.SESSION);location.href='./konto.html';return;}
    if(view!=='admin')return;
    const person=event.target.closest('[data-person]');if(person){selected=person.dataset.person;document.querySelector('#account-list').innerHTML=peopleList();renderDetail();return;}
    if(event.target.closest('#download-qr')){const canvas=document.querySelector('#portal-qr');if(!canvas||canvas.hidden){notice('QR-Code konnte nicht erzeugt werden.');return;}const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='abbate-gemeinsamer-demo-kartencode.png';a.click();return;}
    if(event.target.closest('[data-delete-open]')){document.querySelector('#delete-dialog').showModal();return;}
    if(event.target.closest('[data-delete-cancel]')){document.querySelector('#delete-dialog').close();return;}
    try{
      if(event.target.closest('[data-delete-confirm]')){
        load();M.removePerson(state,selected);save();if(session()===selected)sessionStorage.removeItem(M.SESSION);selected=state.students[0]?.id||null;admin();notice('Demo-Konto und zugehörige Demo-Daten gelöscht.');return;
      }
      const revoke=event.target.closest('[data-revoke]');if(revoke){load();const record=state.completions.find(r=>r.id===revoke.dataset.revoke&&r.student===selected);if(record){record.revokedAt=new Date().toISOString();save();renderDetail();notice('Fehleintrag zurückgezogen. Er erscheint nicht mehr im Schulungspass.');}}
    }catch(error){notice(error.message);}
  });
  addEventListener('storage',event=>{if(event.key===M.STORE)render();});
  load();selected=state.students.find(p=>p.access==='pending')?.id||state.students[0]?.id||null;
  if(view==='admin'&&location.hash){const id=location.hash.slice(1);if(state.students.some(p=>p.id===id))selected=id;}
  // This shared browser store deliberately contains fictitious data only. No real authentication is simulated as security.
  try{save();}catch{notice('Browserspeicher ist gesperrt. Änderungen können in dieser Demo nicht gespeichert werden.');}
  render();
})();
