'use strict';
(() => {
  const B=globalThis.ABBATE_BACKEND,M=globalThis.ABBATE_ACCOUNTS,view=document.body.dataset.view,root=document.querySelector('#portal-content');
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day=value=>new Intl.DateTimeFormat(localStorage.getItem('abbate-language-v1')||'de',{dateStyle:'long'}).format(new Date(value+'T12:00:00'));
  let state,selected=null,search='',filter='all';
  async function load(){state=await B.state();if(view==='admin')state.students=state.students.filter(p=>p.role==='learner');}
  function session(){return state?.me?.id;}
  function syncShell(){const link=document.querySelector('[data-nav="admin"]');if(link)link.hidden=!state?.me||!B.isStaff(state.me);}
  function notice(text){document.querySelector('#portal-status').textContent=text;}
  const uuid=()=>globalThis.crypto?.randomUUID?.()||'local-'+Date.now().toString(36)+'-'+Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
  
  function personStatus(person){return person.access==='active'&&!M.access(person)?'Abgelaufen':M.statuses[person.access];}
  function badge(person){return `<span class="portal-badge ${M.access(person)?'active':person.access}">${safe(personStatus(person))}</span>`;}
  function recordCard(r,editable=false){return `<article class="portal-record"><div class="portal-record-top"><span>${safe(M.kinds[r.kind])}</span><span class="portal-result ${r.outcome}">${r.outcome==='failed'?'×':'✓'} ${safe(M.outcomes[r.outcome])}</span></div><h3>${safe(r.title)}</h3><dl><div><dt>Durchgeführt am</dt><dd>${day(r.completedAt)}</dd></div><div><dt>Erfasst durch</dt><dd>Fahrschule Abbate</dd></div><div><dt>Referenz</dt><dd>${safe(r.reference)}</dd></div></dl>${editable?`<label class="portal-result-edit">Ergebnis ändern<select data-result="${safe(r.id)}">${Object.entries(M.outcomes).filter(([value])=>r.kind!=='exam'||value!=='attended').map(([value,label])=>`<option value="${value}" ${r.outcome===value?'selected':''}>${safe(label)}</option>`).join('')}</select></label><button class="portal-text" data-revoke="${safe(r.id)}">Fehleintrag zurückziehen</button>`:''}</article>`;}
  function login(){
    root.innerHTML=`<section class="portal-login-heading"><span class="portal-eyebrow">Ein QR-Code. Dein persönlicher Bereich.</span><h1>Deine Schulungen.<br>Dein Überblick.</h1><p>Melde dich an und sieh deine persönlichen Schulungen und Prüfungsergebnisse. Deine Fahrschule pflegt die Einträge für dich.</p></section><div class="portal-login-grid"><section class="portal-panel"><span class="portal-step">01 / Bereits registriert</span><h2>Deinen Bereich öffnen</h2><form id="login-form"><label>E-Mail-Adresse<input type="email" name="email" required autocomplete="username" maxlength="254"></label><label>Passwort<input type="password" name="password" required autocomplete="current-password"></label><button class="primary" type="submit">Sicher anmelden ↗</button><p role="alert" class="portal-error"></p></form><button class="portal-text" data-recovery>Passwort vergessen?</button></section><section class="portal-panel"><span class="portal-step">02 / Neu bei Abbate</span><h2>Dein Konto anlegen</h2><p class="portal-hint">Die Registrierung ist kostenlos. Der Zugang zu den Lerninhalten wird durch die Fahrschule freigeschaltet. Es gibt kein automatisches Abo.</p><form id="register-form"><label>Vor- und Nachname<input name="name" maxlength="120" required autocomplete="name"></label><label>E-Mail-Adresse<input name="email" type="email" maxlength="254" required autocomplete="email"></label><label>Passwort<input name="password" type="password" minlength="12" required autocomplete="new-password" aria-describedby="password-hint"></label><p id="password-hint" class="portal-hint">Mindestens 12 Zeichen. Verwende ein eigenes, sicheres Passwort.</p><label class="portal-consent"><input type="checkbox" name="termsAccepted" value="yes" required> <span>Ich akzeptiere die <a href="./agb.html" target="_blank" rel="noopener">AGB und Nutzungsbedingungen</a> (Fassung 02.11.2026).</span></label><p class="portal-hint">Unsere <a href="./datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a> und Informationen zu <a href="./widerruf.html" target="_blank" rel="noopener">Widerruf und Verbraucherrechten</a> kannst du jederzeit einsehen. Die Registrierung ist kostenlos und keine Bestellung.</p><button class="secondary" type="submit">Konto registrieren</button><p role="alert" class="portal-error"></p></form></section></div>`;
  }
  function recovery(){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Dein Zugang</span><h1>Passwort zurücksetzen.</h1><p>Wir senden dir einen Link, mit dem du ein neues Passwort festlegen kannst.</p><form id="recovery-form"><label>E-Mail-Adresse<input name="email" type="email" required autocomplete="email"></label><button class="primary">Link anfordern</button><p role="alert" class="portal-error"></p></form><a class="portal-text" href="./konto.html">Zur Anmeldung</a></section>`;}
  function newPassword(){root.innerHTML=`<section class="portal-empty"><h1>Dein neues Passwort.</h1><form id="password-form"><label>Neues Passwort<input name="password" type="password" minlength="12" required autocomplete="new-password"></label><button class="primary">Passwort speichern</button><p role="alert" class="portal-error"></p></form></section>`;}
  function termsGate(){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Dein Zugang</span><h1>Aktuelle Nutzungsbedingungen.</h1><p>Bevor du deinen Lernraum weiter nutzt, bestätige bitte die <a href="./agb.html" target="_blank" rel="noopener">AGB und Nutzungsbedingungen</a> (Stand 02.11.2026). Die <a href="./datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a> und <a href="./widerruf.html" target="_blank" rel="noopener">Widerrufsinformationen</a> findest du jederzeit hier.</p><form id="terms-form"><label class="portal-consent"><input type="checkbox" name="termsAccepted" value="yes" required> <span>Ich akzeptiere die AGB vom 02.11.2026.</span></label><button class="primary" type="submit">Weiter zum Lernraum</button><p role="alert" class="portal-error"></p></form><button class="portal-text" data-logout>Abmelden</button></section>`;}
  function settings(){const p=state.me;root.innerHTML=`<section class="portal-login-heading"><span class="portal-eyebrow">Dein Konto</span><h1>${safe(p.name)}</h1><p>${safe(p.email)}</p></section><div class="portal-actions"><a class="primary" href="./nachweise.html">Meine Schulungen</a><a class="secondary" href="./index.html">Zum Lernen</a>${B.isStaff(p)?'<a class="secondary" href="./verwaltung.html">Verwaltung öffnen</a>':''}<button class="secondary" data-logout>Abmelden</button></div><section class="portal-panel portal-history"><h2>Passwort ändern</h2><form id="change-password-form"><label>Aktuelles Passwort<input name="current" type="password" required autocomplete="current-password"></label><label>Neues Passwort<input name="password" type="password" minlength="12" required autocomplete="new-password"></label><button class="secondary">Neues Passwort speichern</button><p class="portal-error" role="alert"></p></form></section>${p.role==='learner'?`<details class="portal-delete"><summary>Konto und persönliche Daten löschen</summary><p>Dein Zugang, deine Schulungs- und Prüfungseinträge sowie dein Lernfortschritt werden endgültig entfernt. Du kannst dich anschließend nicht mehr mit diesem Konto anmelden.</p><form id="self-delete-form"><label>Dein Passwort zur Bestätigung<input name="password" type="password" required autocomplete="current-password"></label><label class="portal-consent"><input type="checkbox" required> <span>Ich möchte mein Konto und alle zugehörigen Einträge endgültig löschen.</span></label><button class="portal-danger">Mein Konto endgültig löschen</button><p class="portal-error" role="alert"></p></form></details>`:'<p class="portal-hint">Mitarbeiterkonten werden durch den verantwortlichen Betreiber verwaltet.</p>'}`;}
  function reader(){
    const person=state.students.find(p=>p.id===session());
    if(!person){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Persönlicher Schulungspass</span><h1>Bitte zuerst anmelden.</h1><p>Über deinen Zugang wird dein eigener Schulungsverlauf geladen.</p><a class="primary" href="./konto.html">Zur Anmeldung ↗</a></section>`;return;}
    const proof=M.ownPass(state,person.id);
    if(!proof){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">${safe(person.name)}</span><h1>${person.access==='pending'?'Deine Freischaltung steht noch aus.':person.access==='paused'?'Dein Zugang ist pausiert.':'Dein Zugang ist abgelaufen.'}</h1><p>${person.access==='pending'?'Dein Konto ist registriert. Deine Freischaltung wird von der Fahrschule verwaltet. Sobald dein Zugang aktiviert ist, kannst du mit dem Lernen beginnen.':'Bitte wende dich an deine Fahrschule. Deine bisherigen Einträge bleiben bei einer Pause gespeichert.'}</p><a class="secondary" href="./konto.html#einstellungen">Konto verwalten oder löschen</a><button class="portal-text" data-logout>Abmelden</button></section>`;return;}
    const records=proof.records;
    root.innerHTML=`<section class="portal-identity"><div class="portal-avatar" aria-hidden="true">${safe(person.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><div><span class="portal-eyebrow">Dein persönlicher Schulungspass</span><h1>${safe(person.name)}</h1><p>Durchgeführte Schulungen, Unterweisungen und Prüfungen.</p></div><span class="portal-readonly">Nur ansehen</span></section><section class="portal-overview"><div><small>Dokumentierter Verlauf</small><strong>${records.length} <span>${records.length===1?'Eintrag':'Einträge'}</span></strong></div><div><small>Zuletzt durchgeführt</small><strong class="portal-date">${records[0]?day(records[0].completedAt):'Noch kein Eintrag'}</strong></div></section><section class="portal-history"><div class="portal-section-title"><div><span class="portal-eyebrow">Von deiner Fahrschule erfasst</span><h2>Das hast du bereits absolviert.</h2></div><span>Neueste zuerst</span></div><div class="portal-records">${records.map(r=>recordCard(r)).join('')||'<section class="portal-panel"><h3>Noch keine Einträge.</h3><p>Hier erscheinen durchgeführte Schulungen und Prüfungen, sobald die Fahrschule sie erfasst hat.</p></section>'}</div></section><footer class="portal-reader-footer"><p>Die Angaben werden von der Fahrschule gepflegt. Übungsrunden aus der Lern-App erzeugen keine bestätigten Schulungs- oder Prüfungseinträge.</p><a class="portal-text" href="./konto.html#einstellungen">Konto & Datenschutz</a><button class="portal-text" data-logout>Abmelden</button></footer>`;
  }
  function people(){return state.students.filter(p=>(p.name+' '+p.email).toLowerCase().includes(search.toLowerCase())&&(filter==='all'||(filter==='expired'?p.access==='active'&&!M.access(p):p.access===filter)));}
  function peopleList(){return people().map(p=>`<button class="portal-person ${selected===p.id?'selected':''}" data-person="${safe(p.id)}" aria-pressed="${selected===p.id}"><span class="portal-person-name">${safe(p.name)}<small>${safe(p.email)}</small></span>${badge(p)}</button>`).join('')||'<p class="portal-hint">Keine passenden Konten.</p>';}
  function detail(){
    const p=state.students.find(p=>p.id===selected);if(!p)return '<section class="portal-panel"><h2>Konto auswählen</h2><p>Wähle links einen Teilnehmer aus. Neue Registrierungen erscheinen hier nach dem Aktualisieren.</p></section>';
    const records=M.recordsFor(state,p.id);
    return `<section class="portal-account-heading"><div><span class="portal-eyebrow">Teilnehmerkonto</span><h2>${safe(p.name)}</h2><p>${safe(p.email)}</p></div>${badge(p)}</section><section class="portal-access-panel" ${state.me.role!=='admin'?'hidden':''}><div><h3>30-Tage-Zugang verwalten</h3><p>Zahlung bar oder per Überweisung außerhalb der App prüfen, danach einmalig für 30 Tage freischalten. Keine automatische Verlängerung oder Abbuchung. Eine Pause stoppt die bezahlte Laufzeit nicht.</p><p><strong>Gültig bis:</strong> ${safe(p.until||'Noch nicht freigeschaltet')}</p></div><form id="access-form"><div class="portal-actions">${p.access==='paused'&&M.access({...p,access:'active'})?'<button class="secondary" name="intent" value="resume" type="submit">Zugang fortsetzen</button>':''}${(p.access==='active'||p.access==='paused')&&p.until&&p.until>=M.today()?'<button class="primary" name="intent" value="extend" type="submit">Nach Zahlung um 30 Tage verlängern</button>':'<button class="primary" name="intent" value="activate" type="submit">Nach Zahlung 30 Tage freischalten</button>'}<button class="secondary" name="intent" value="pause" type="submit" ${p.access!=='active'?'disabled':''}>Zugang pausieren</button></div><p role="alert" class="portal-error"></p></form></section><section class="portal-panel portal-entry"><span class="portal-eyebrow">Tatsächlich durchgeführte Schulung oder Prüfung</span><h3>Ergebnis eintragen</h3><form id="record-form" class="portal-record-form"><label class="portal-wide">Bezeichnung<input name="title" maxlength="200" required placeholder="z. B. Gabelstapler · Abschlussprüfung"></label><label>Art<select name="kind" id="record-kind" aria-label="Art"><option value="training">Schulung</option><option value="instruction">Unterweisung</option><option value="exam">Prüfung</option></select></label><label>Durchgeführt am<input name="completedAt" type="date" max="${M.today()}" required></label><label>Ergebnis<select name="outcome" id="record-outcome" aria-label="Ergebnis"><option value="attended">Teilgenommen</option><option value="passed">Bestanden</option><option value="failed">Nicht bestanden</option></select></label><div class="portal-submit"><button class="primary" type="submit">Im Schulungspass speichern</button></div><p role="alert" class="portal-error portal-wide"></p></form></section><section class="portal-history"><div class="portal-section-title"><h3>Schulungsverlauf</h3><span>${records.length} ${records.length===1?'Eintrag':'Einträge'}</span></div><div class="portal-records">${records.map(r=>recordCard(r,true)).join('')||'<p>Noch keine durchgeführten Schulungen oder Prüfungen eingetragen.</p>'}</div></section><details class="portal-delete" ${state.me.role!=='admin'?'hidden':''}><summary>Konto endgültig löschen …</summary><p>Das Konto, der Lernfortschritt und alle Schulungs- und Prüfungseinträge werden unwiderruflich gelöscht. Pausieren erhält die Einträge.</p><button class="portal-danger" data-delete-open>Konto löschen</button></details><dialog id="delete-dialog" class="portal-dialog"><h2>Konto wirklich löschen?</h2><p>${safe(p.name)} und alle zugehörigen Einträge werden vom Server gelöscht.</p><label>Dein Admin-Passwort zur Bestätigung<input type="password" id="delete-password" required autocomplete="current-password"></label><p id="delete-error" role="alert" class="portal-error"></p><div class="portal-actions"><button class="secondary" data-delete-cancel>Abbrechen</button><button class="portal-danger" data-delete-confirm>Endgültig löschen</button></div></dialog>`;
  }
  function renderDetail(){document.querySelector('#account-detail').innerHTML=detail();}
  function admin(){
    root.innerHTML=`<section class="portal-admin-heading"><div><span class="portal-eyebrow">Geschützter Verwaltungsbereich</span><h1>Konten im Blick.<br>Ergebnisse mit einem Klick.</h1><p>Freischalten, pausieren und tatsächliche Schulungen dokumentieren.</p></div><details class="portal-qr"><summary>QR-Code für alle Karten</summary><p>Dieser eine Code führt zur Anmeldung. Das angemeldete Konto bestimmt den persönlichen Schulungsverlauf.</p><canvas id="portal-qr" aria-label="Gemeinsamer Karten-QR-Code"></canvas><button class="secondary" id="download-qr">Gemeinsamen QR-Code als PNG speichern</button></details></section><div class="portal-actions portal-refresh"><button class="secondary" data-refresh>Konten aktualisieren</button><a class="portal-text" href="./konto.html#einstellungen">Mein Konto</a><button class="portal-text" data-logout>Abmelden</button></div><section class="portal-stats" aria-label="Kontenübersicht"><div><span>Registrierte Konten</span><strong>${state.students.length}</strong></div><div><span>Warten auf Freischaltung</span><strong>${state.students.filter(p=>p.access==='pending').length}</strong></div><div><span>Aktive Zugänge</span><strong>${state.students.filter(M.access).length}</strong></div><div><span>Pausiert / abgelaufen</span><strong>${state.students.filter(p=>p.access==='paused'||(p.access==='active'&&!M.access(p))).length}</strong></div></section><div class="portal-admin-layout"><aside class="portal-sidebar"><label for="account-search">Konten suchen</label><input id="account-search" type="search" placeholder="Name oder E-Mail" value="${safe(search)}"><label class="portal-filter-label" for="account-filter">Zugangsstatus</label><select id="account-filter"><option value="all">Alle Konten</option><option value="pending">Wartet auf Freischaltung</option><option value="active">Aktiviert</option><option value="paused">Pausiert</option><option value="expired">Abgelaufen</option></select><div id="account-list" class="portal-people">${peopleList()}</div><a href="./konto.html#registrieren" class="portal-text">Registrierungsseite öffnen ↗</a></aside><div id="account-detail" class="portal-detail">${detail()}</div></div>`;
    document.querySelector('#account-filter').value=filter;
    const canvas=document.querySelector('#portal-qr');
    AbbateQR.toCanvas(canvas,globalThis.ABBATE_CONFIG.portalUrl,{width:240,margin:4,errorCorrectionLevel:'M'}).catch(()=>{canvas.hidden=true;});
  }
  function failure(error){root.innerHTML=`<section class="portal-empty"><h1>Gerade nicht erreichbar.</h1><p>${safe(B.message(error))}</p><button class="primary" data-refresh>Erneut versuchen</button><a class="portal-text" href="./konto.html">Zur Anmeldung</a></section>`;}
  // A recovery link must be confirmed by Supabase's PASSWORD_RECOVERY event.
  // A previously-used link can coexist with an already-signed-in browser:
  // never treat that existing session as proof that a reset link is valid.
  // The callback was captured before Supabase initialized and removed the URL fragment.
  // Preserve only boolean flags; never copy tokens to storage or application logs.
  const authReturn = globalThis.ABBATE_AUTH_RETURN || {recovery:false, failed:false};
  const recoveryLinkAttempt = authReturn.recovery === true;
  const failedAuthLink = authReturn.failed === true;
  let recoveryMode = false;
  function invalidResetLink(){
    root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Dein Zugang</span><h1>Dieser Link ist nicht mehr gültig.</h1><p>Der Link wurde möglicherweise bereits verwendet oder ist abgelaufen. Fordere bitte einen neuen Link an, um dein Passwort sicher zurückzusetzen.</p><a class="primary" href="./konto.html?reset=neu#passwort">Neuen Link anfordern</a><a class="portal-text" href="./konto.html">Zur Anmeldung</a></section>`;
  }
  async function render(){
    root.setAttribute('aria-busy','true');
    try{
      // Handle auth callbacks BEFORE resolving profiles or performing signed-in redirects.
      // A replayed/expired recovery link must never fall through to the account page,
      // even when the browser still holds a perfectly valid prior session.
      if(view==='login' && failedAuthLink){invalidResetLink();return;}
      if(view==='login' && (recoveryLinkAttempt || recoveryMode)){
        // A session from an earlier login is NOT proof of a fresh recovery link.
        // Only Supabase's PASSWORD_RECOVERY callback authorizes this screen.
        // getSession waits for initial token processing, allowing the event to fire.
        const {data,error} = await B.client.auth.getSession();
        if(error || !data?.session || !recoveryMode){invalidResetLink();return;}
        const checked=await B.client.auth.getUser();
        if(checked.error || !checked.data?.user || checked.data.user.id!==data.session.user?.id){
          invalidResetLink();return;
        }
        newPassword();
        return;
      }
      await load();
      if(state.me && !(await B.termsAccepted())){termsGate();return;}
      if(view==='admin'){
        if(!state.me){root.innerHTML='<section class="portal-empty"><h1>Verwaltung anmelden.</h1><p>Dieser Bereich ist nur für berechtigte Mitarbeiter zugänglich.</p><a class="primary" href="./konto.html?next=verwaltung">Zur Anmeldung</a></section>';return;}
        if(!B.isStaff(state.me)){root.innerHTML='<section class="portal-empty"><h1>Kein Verwaltungszugang.</h1><p>Dein Konto besitzt keine aktive Mitarbeiterberechtigung.</p><a class="primary" href="./nachweise.html">Zu meinen Schulungen</a></section>';return;}
        if(!state.students.some(p=>p.id===selected))selected=state.students.find(p=>p.access==='pending')?.id||state.students[0]?.id||null;
        admin();
      }else if(view==='login'){
        if(location.hash==='#passwort'){recovery();return;}
        if(state.me){if(!(await B.termsAccepted())){termsGate();return;}if(location.search==='?next=verwaltung'){location.replace('./verwaltung.html');return;}if(location.hash==='#einstellungen'){settings();return;}location.replace('./nachweise.html');return;}
        login();
      }else reader();
    }catch(error){failure(error);}finally{syncShell();root.removeAttribute('aria-busy');}
  }
  async function mutate(work,success){await work();await load();if(view==='admin')admin();else reader();notice(success);}
  root.addEventListener('submit',async event=>{
    const form=event.target;event.preventDefault();if(form.dataset.busy)return;
    const values=Object.fromEntries(new FormData(form));form.dataset.busy='true';form.setAttribute('aria-busy','true');
    const submit=event.submitter;if(submit)submit.disabled=true;
    try{
      let result;
      if(form.id==='terms-form'){if(values.termsAccepted!=='yes')throw Error('Bitte akzeptiere die AGB.');await B.acceptTerms();await render();return;}
      if(form.id==='login-form'){
        result=await B.client.auth.signInWithPassword({email:values.email.trim(),password:values.password});if(result.error)throw result.error;
        location.replace(location.search==='?next=verwaltung'?'./verwaltung.html':'./nachweise.html');return;
      }
      if(form.id==='register-form'){
        if(values.termsAccepted!=='yes')throw Error('Bitte akzeptiere die AGB vor der Registrierung.');
        result=await B.client.auth.signUp({email:values.email.trim(),password:values.password,options:{data:{display_name:values.name.trim(),abbate_terms_version:'2026-11-02',abbate_terms_accepted:true},emailRedirectTo:globalThis.ABBATE_CONFIG.portalUrl}});if(result.error)throw result.error;
        form.reset();notice('Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach. Die Registrierung ist kostenlos. Dein Lernzugang wird von der Fahrschule freigeschaltet.');return;
      }
      if(form.id==='recovery-form'){
        result=await B.client.auth.resetPasswordForEmail(values.email.trim(),{redirectTo:globalThis.ABBATE_CONFIG.portalUrl});if(result.error)throw result.error;
        notice('Falls ein Konto mit dieser Adresse existiert, erhältst du einen Link zum Zurücksetzen. Bitte auch den Spamordner prüfen.');return;
      }
      if(form.id==='change-password-form'){
        result=await B.client.auth.signInWithPassword({email:state.me.email,password:values.current});if(result.error)throw result.error;
      }
      if(form.id==='password-form'||form.id==='change-password-form'){
        result=await B.client.auth.updateUser({password:values.password});if(result.error)throw result.error;
        recoveryMode=false;
        if(form.id==='password-form'){
          // Password recovery invalidates existing refresh sessions across devices.
          // The learner must authenticate again with the new password.
          const signOutResult=await B.client.auth.signOut({scope:'global'});
          if(signOutResult.error)throw signOutResult.error;
          location.replace('./konto.html#passwort-gesetzt');
          return;
        }
        location.hash='einstellungen';await render();notice('Dein neues Passwort ist gespeichert.');return;
      }
      if(form.id==='self-delete-form'){await B.deleteAccount(state.me.id,values.password);location.replace('./konto.html#konto-geloescht');return;}
      if(!B.isStaff(state.me))throw Error('Staff access required');
      if(form.id==='access-form')await mutate(()=>B.setAccess(selected,event.submitter?.value||'activate'),'Zugangsstatus auf dem Server gespeichert.');
      else if(form.id==='record-form'){
        M.addCompletion({students:state.students,completions:[],audit:[]},{...values,student:selected},uuid());
        await mutate(()=>B.addCompletion({...values,student:selected}),'Durchführung und Ergebnis gespeichert. Der Teilnehmer sieht den Eintrag in seinem Schulungspass.');
      }
    }catch(error){const el=form.querySelector('[role="alert"]');if(el)el.textContent=B.message(error);else notice(B.message(error));}
    finally{delete form.dataset.busy;form.removeAttribute('aria-busy');if(submit)submit.disabled=false;}
  });
  root.addEventListener('input',event=>{if(view==='admin'&&event.target.id==='account-search'){search=event.target.value;document.querySelector('#account-list').innerHTML=peopleList();}});
  root.addEventListener('change',async event=>{
    if(view!=='admin'||!B.isStaff(state.me))return;
    if(event.target.matches('[data-result]')){
      event.target.disabled=true;
      try{await B.updateRecord(event.target.dataset.result,{outcome:event.target.value});await load();renderDetail();notice('Ergebnis korrigiert. Die Änderung ist auf dem Server protokolliert.');}
      catch(error){notice(B.message(error));event.target.disabled=false;await load();renderDetail();}return;
    }
    if(event.target.id==='account-filter'){filter=event.target.value;document.querySelector('#account-list').innerHTML=peopleList();}
    if(event.target.id==='record-kind'){const outcome=document.querySelector('#record-outcome');outcome.querySelector('[value="attended"]').disabled=event.target.value==='exam';if(event.target.value==='exam'&&outcome.value==='attended')outcome.value='passed';}
  });
  root.addEventListener('click',async event=>{
    if(event.target.closest('[data-refresh]')){await render();return;}
    if(event.target.closest('[data-recovery]')){location.hash='passwort';recovery();return;}
    if(event.target.closest('[data-logout]')){await B.client.auth.signOut();location.replace('./konto.html');return;}
    if(view!=='admin'||!B.isStaff(state?.me))return;
    const person=event.target.closest('[data-person]');if(person){selected=person.dataset.person;document.querySelector('#account-list').innerHTML=peopleList();renderDetail();return;}
    if(event.target.closest('#download-qr')){const canvas=document.querySelector('#portal-qr');if(!canvas||canvas.hidden){notice('QR-Code konnte nicht erzeugt werden.');return;}const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='abbate-gemeinsamer-kartencode.png';a.click();return;}
    if(event.target.closest('[data-delete-open]')){document.querySelector('#delete-dialog').showModal();return;}
    if(event.target.closest('[data-delete-cancel]')){document.querySelector('#delete-dialog').close();return;}
    const del=event.target.closest('[data-delete-confirm]');
    if(del){del.disabled=true;try{
      const password=document.querySelector('#delete-password').value;if(!password)throw Error('Please sign in again');
      await B.deleteAccount(selected,password);selected=null;await render();notice('Konto und persönliche Einträge endgültig vom Server gelöscht.');
    }catch(error){document.querySelector('#delete-error').textContent=B.message(error);del.disabled=false;}return;}
    const revoke=event.target.closest('[data-revoke]');if(revoke){revoke.disabled=true;try{await B.updateRecord(revoke.dataset.revoke,{revoked_at:new Date().toISOString()});await load();renderDetail();notice('Fehleintrag zurückgezogen. Er erscheint nicht mehr beim Teilnehmer.');}catch(error){notice(B.message(error));revoke.disabled=false;}}
  });
  B.client.auth.onAuthStateChange(event=>{
    if(event==='PASSWORD_RECOVERY' && !failedAuthLink && view==='login'){
      recoveryMode=true;
      setTimeout(render,0);
    }
    if(event==='SIGNED_OUT')setTimeout(render,0);
  });
  addEventListener('hashchange',()=>{if(view==='login')render();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&view!=='admin')render();});
  setInterval(()=>{if(!document.hidden&&view==='reader')render();},30000);
  if(location.hash==='#konto-geloescht')notice('Dein Konto und die zugehörigen Daten wurden gelöscht.');
  if(location.hash==='#passwort-gesetzt')notice('Dein Passwort wurde geändert. Bitte melde dich mit deinem neuen Passwort an.');
  // Refresh dates and rendered account records after a language change without affecting credentials.
  addEventListener('abbate:language-change',()=>{if(view==='reader'||view==='admin')render();});
  render();
})();
