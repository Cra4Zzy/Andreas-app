'use strict';
(() => {
  const B=globalThis.ABBATE_BACKEND,M=globalThis.ABBATE_ACCOUNTS,view=document.body.dataset.view,root=document.querySelector('#portal-content');
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day=value=>new Intl.DateTimeFormat(localStorage.getItem('abbate-language-v1')||'de',{dateStyle:'long'}).format(new Date(value+'T12:00:00'));
  let state,selected=null,search='',filter='all',registrationSuccessEmail=null;
  let paymentQuery='';
  const paymentExpanded={reported:true,confirmed:false,open:false};
  let certStatus={signatureReady:false,mailReady:false}, certRecords=new Map(),examRows=[],examError=false,examPage=0;
  async function certCall(body){
    const {data,error}=await B.client.functions.invoke('abbate-certificates',{body});
    if(error){let detail;try{detail=await error.context?.json();}catch{}throw Error(detail?.error||'Zertifikatsdienst momentan nicht erreichbar.');}
    if(data?.error)throw Error(data.error);
    return data;
  }
  const annualRecord=r=>r.kind==='instruction'&&r.outcome==='attended'&&(r.title==='Jährliche Unterweisung · Unterweisungsnachweis'||!!globalThis.ABBATE_CERTIFICATES?.annualField(r.title));
  const certificateEligible=r=>r.kind==='exam'&&r.outcome==='passed'||annualRecord(r)||!!globalThis.ABBATE_CERTIFICATES?.specialRecord(r);
  async function load(){
    state=await B.state();certRecords=new Map();certStatus={signatureReady:false,mailReady:false};
    examRows=[];examError=false;
    if(!state.me||view==='login')return;
    if(view==='admin'&&B.isStaff(state.me)){try{examRows=await B.listExams();}catch{examError=true;}}
    if(view==='admin'&&state.me.role==='admin'){
      try{certStatus=await certCall({action:'status',school:state.me.school});}catch{certStatus.unavailable=true;}
    }
    try{
      const ids=state.completions.filter(r=>certificateEligible(r)&&!r.revokedAt).map(r=>r.id);
      for(let i=0;i<ids.length;i+=100){const result=await certCall({action:'list',ids:ids.slice(i,i+100)});for(const row of result.certificates||[])certRecords.set(row.completion_id,row);}
    }catch{certStatus.listUnavailable=true;certRecords.clear();}
  }
  function downloadCertificate(data){
    if(!data.pdf||!data.reference)throw Error('Keine PDF erhalten.');
    const bytes=Uint8Array.from(atob(data.pdf),x=>x.charCodeAt(0));
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const a=document.createElement('a');a.href=url;a.download='Abbate-'+data.reference.replace(/[^A-Za-z0-9-]/g,'')+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function mailLabel(status){return ({accepted:'Vom Mailserver angenommen',sending:'Versand läuft – nicht erneut senden',uncertain:'Versand unklar – Postfach prüfen',not_sent:'Keine E-Mail versendet.'})[status]||'Keine E-Mail versendet.';}
  function certActions(r,editable){
    if(!certificateEligible(r))return '';
    const stored=certRecords.get(r.id), admin=editable&&state.me?.role==='admin';
    if(!stored&&globalThis.ABBATE_CERTIFICATES?.specialRecord(r))return admin?'<p class="portal-hint">Noch nicht ausgestellt. Bitte dieselbe Vorlage mit demselben Schulungsdatum erneut öffnen.</p>':'';
    if(!stored)return admin&&(r.title.endsWith(' · Theorieprüfung')||annualRecord(r))?'<button class="secondary" type="button" data-cert-issue="'+safe(r.id)+'" '+(!certStatus.signatureReady?'disabled':'')+'>Zertifikat ausstellen</button>':'';
    return '<div class="portal-actions"><button type="button" class="secondary" data-cert-download="'+safe(r.id)+'">Zertifikat als PDF</button>'+ (admin&&certStatus.mailReady&&stored.mail_status==='not_sent'?'<button type="button" class="secondary" data-cert-mail="'+safe(r.id)+'">Per E-Mail versenden</button>':'')+'</div>'+(admin?'<p class="portal-hint">'+safe(mailLabel(stored.mail_status))+'</p>':'');
  }
  function signaturePanel(){
    if(state.me?.role!=='admin')return '';
    return '<details class="portal-panel"><summary>Zertifikatseinstellungen</summary><p>Unterschrift: '+(certStatus.signatureReady?'Geschützt hinterlegt':certStatus.unavailable?'Status nicht verfügbar':'Noch nicht hinterlegt')+' · E-Mail: '+(certStatus.mailReady?'Konfiguriert':'Nicht konfiguriert')+'</p><form id="signature-form"><label>Freigegebene Originalunterschrift (PNG, max. 1 MB)<input type="file" name="signature" accept="image/png" required></label><label class="portal-consent"><input type="checkbox" name="authorized" value="yes" required> Ich bin zur Verwendung dieser Unterschrift für Zertifikate berechtigt.</label><button type="submit" class="secondary">Unterschrift geschützt speichern</button><p role="alert" class="portal-error"></p></form></details>';
  }
  function session(){return state?.me?.id;}
  function canManageRoles(){return state?.me?.role==='admin'&&state.me.id==='353aceca-8524-4a28-bbd2-3b1026ab323e';}
  function syncShell(){const link=document.querySelector('[data-nav="admin"]');if(link)link.hidden=!state?.me||!B.isStaff(state.me);}
  function notice(text){document.querySelector('#portal-status').textContent=text;}
  const uuid=()=>globalThis.crypto?.randomUUID?.()||'local-'+Date.now().toString(36)+'-'+Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
  
  function personStatus(person){return person.access==='active'&&!M.access(person)?'Abgelaufen':M.statuses[person.access];}
  function badge(person){return `<span class="portal-badge ${M.access(person)?'active':person.access}">${safe(personStatus(person))}</span>`;}
  function recordCard(r,editable=false){return `<article class="portal-record" data-record-id="${safe(r.id)}"><div class="portal-record-top"><span>${safe(M.kinds[r.kind])}</span><span class="portal-result ${r.outcome}">${r.outcome==='failed'?'×':'✓'} ${safe(M.outcomes[r.outcome])}</span></div><h3>${safe(r.title)}</h3><dl><div><dt>Durchgeführt am</dt><dd>${day(r.completedAt)}</dd></div><div><dt>Erfasst durch</dt><dd>Fahrschule Abbate</dd></div><div><dt>Referenz</dt><dd>${safe(r.reference)}</dd></div></dl>${certActions(r,editable)}${editable?`<label class="portal-result-edit">Ergebnis ändern<select data-result="${safe(r.id)}">${Object.entries(M.outcomes).filter(([value])=>r.kind!=='exam'||value!=='attended').map(([value,label])=>`<option value="${value}" ${r.outcome===value?'selected':''}>${safe(label)}</option>`).join('')}</select></label><button class="portal-text" data-revoke="${safe(r.id)}">Fehleintrag zurückziehen</button>`:''}</article>`;}
  let resendUntil=0,resendBusy=false;
  function resendControl(){return '<button type="button" class="secondary" data-resend-confirmation '+(resendBusy||Date.now()<resendUntil?'disabled':'')+'>Bestätigungs-E-Mail erneut senden</button><p class="portal-hint" data-resend-status role="status" aria-live="polite"></p>';}
  function syncResendControls(){root.querySelectorAll('[data-resend-confirmation]').forEach(b=>{b.disabled=resendBusy||Date.now()<resendUntil;});}
  async function resendConfirmation(){
    if(view!=='login'||state?.me||resendBusy||Date.now()<resendUntil)return;
    const input=root.querySelector('#login-form [name="email"]');
    if(input&&!input.reportValidity()){input.focus();return;}
    const email=(input?.value||registrationSuccessEmail||'').trim();if(!email)return;
    const show=text=>{const status=root.querySelector('[data-resend-status]');if(status)status.textContent=text;notice(text);};
    resendBusy=true;resendUntil=Date.now()+60000;syncResendControls();
    show('Bestätigungs-E-Mail wird angefordert …');
    try{
      const {error}=await B.client.auth.resend({type:'signup',email,options:{emailRedirectTo:globalThis.ABBATE_CONFIG.portalUrl}});
      if(error)throw error;
      show('Falls deine E-Mail-Adresse noch nicht bestätigt ist, erhältst du einen neuen Bestätigungslink. Bitte prüfe auch deinen Spamordner.');
    }catch(error){
      const text=String(error?.message||'');
      if(error?.status===429||/rate_limit/.test(error?.code||'')||/you can only request this after/i.test(text)){
        const seconds=Number(text.match(/after\s+(\d+)\s+seconds?/i)?.[1]||0);
        resendUntil=Math.max(resendUntil,Date.now()+Math.min(3600,seconds)*1000);
        show('Bitte warte, bevor du eine weitere E-Mail anforderst. Prüfe in der Zwischenzeit deinen Spamordner.');
      }else show('Die E-Mail konnte momentan nicht angefordert werden. Bitte versuche es später erneut oder wende dich an die Fahrschule.');
    }finally{resendBusy=false;syncResendControls();setTimeout(syncResendControls,Math.max(0,resendUntil-Date.now())+100);}
  }
  function login(){
    root.innerHTML=`<section class="portal-login-heading"><span class="portal-eyebrow">Persönlicher Zugang</span><h1>Schulungen und Prüfungsergebnisse</h1><p>Melde dich an, um die von deiner Fahrschule dokumentierten Schulungen und Prüfungsergebnisse einzusehen.</p></section><div class="portal-login-grid"><section class="portal-panel"><span class="portal-step">01 / Bereits registriert</span><h2>Deinen Bereich öffnen</h2><form id="login-form"><label>E-Mail-Adresse<input type="email" name="email" required autocomplete="username" maxlength="254"></label><label>Passwort<input type="password" name="password" required autocomplete="current-password"></label><button class="primary" type="submit">Anmelden ↗</button><p role="alert" class="portal-error"></p></form><div class="portal-actions"><button class="portal-text" data-recovery>Passwort vergessen?</button>${resendControl()}</div></section><section class="portal-panel"><span class="portal-step">02 / Registrierung</span><h2>Konto erstellen</h2><p class="portal-hint">Die Registrierung ist kostenfrei. <strong>Wichtig:</strong> Nach dem Absenden musst du deine E-Mail-Adresse über einen Link in deinem Postfach bestätigen. Erst danach kannst du dich anmelden. Die Fahrschule schaltet deinen Lernzugang anschließend frei. Es entsteht kein Abonnement.</p><aside class="portal-spam-warning"><strong>Wichtig: Spamordner prüfen!</strong><p>Die Bestätigungs-E-Mail kann im Spamordner landen. Verschiebe sie gegebenenfalls in den Posteingang und öffne dort den Bestätigungslink.</p></aside><form id="register-form"><label>Vor- und Nachname<input name="name" maxlength="120" required autocomplete="name"></label><label>Firma / Arbeitgeber (optional)<input name="company" type="text" maxlength="120" autocomplete="organization" placeholder="z. B. Muster GmbH"></label><label>E-Mail-Adresse<input name="email" type="email" maxlength="254" required autocomplete="email"></label><label>Passwort<input name="password" type="password" minlength="12" required autocomplete="new-password" aria-describedby="password-hint"></label><p id="password-hint" class="portal-hint">Mindestens 12 Zeichen. Verwende ein eigenes, sicheres Passwort.</p><label class="portal-consent"><input type="checkbox" name="termsAccepted" value="yes" required> <span>Ich akzeptiere die <a href="./agb.html" target="_blank" rel="noopener">AGB und Nutzungsbedingungen</a> (Fassung 02.11.2026).</span></label><p class="portal-hint">Unsere <a href="./datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a> und Informationen zu <a href="./widerruf.html" target="_blank" rel="noopener">Widerruf und Verbraucherrechten</a> kannst du jederzeit einsehen. Die Registrierung ist kostenlos und keine Bestellung.</p><button class="secondary" type="submit">Konto registrieren</button><p role="alert" class="portal-error"></p></form></section></div>`;
  }
  function registrationComplete(email){
    // Do not hide the next steps in a short-lived toast: successful signup still requires e-mail confirmation.
    notice('');
    root.innerHTML=`<section class="portal-registration-complete" aria-labelledby="registration-complete-title">
      <div class="portal-registration-complete__icon" aria-hidden="true">✓</div>
      <span class="portal-eyebrow">Registrierungsanfrage eingegangen</span>
      <h1 id="registration-complete-title" tabindex="-1">Fast geschafft!<br>E-Mail bestätigen.</h1>
      <p class="portal-registration-complete__lead"><strong>Deine Anmeldung ist noch nicht abgeschlossen.</strong> Öffne den Bestätigungslink, den du per E-Mail erhältst. Ohne diese Bestätigung kannst du dich noch nicht anmelden.</p>
      <p class="portal-registration-complete__address">Bitte prüfe das Postfach von <strong>${safe(email)}</strong>.</p>
      <aside class="portal-spam-warning"><strong>Wichtig: Spamordner prüfen!</strong><p>Die Bestätigungs-E-Mail kann im Spamordner landen. Verschiebe sie gegebenenfalls in den Posteingang und öffne dort den Bestätigungslink.</p></aside>
      <ol class="portal-registration-complete__steps">
        <li class="done"><span class="portal-registration-complete__step-num">✓</span><div><strong>1. Registrierungsanfrage abgeschickt</strong><span>Deine Anfrage wurde angenommen.</span></div></li>
        <li class="current"><span class="portal-registration-complete__step-num">2</span><div><strong>2. E-Mail-Adresse bestätigen</strong><span>Öffne die E-Mail und klicke auf den Bestätigungslink.</span></div></li>
        <li><span class="portal-registration-complete__step-num">3</span><div><strong>3. Freischaltung durch die Fahrschule</strong><span>Nach der Bestätigung wird dein Lernzugang von der Fahrschule freigeschaltet.</span></div></li>
      </ol>
      <div class="portal-registration-complete__help"><strong>Keine E-Mail gefunden?</strong><p>Bitte prüfe auch deinen Spamordner und gib der Zustellung etwas Zeit. <strong>Registriere dich nicht erneut.</strong> </p>${resendControl()}</div>
      <a class="primary" href="./konto.html">Nach der Bestätigung zur Anmeldung ↗</a>
    </section>`;
    root.querySelector('#registration-complete-title')?.focus();
  }
  function recovery(){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Dein Zugang</span><h1>Passwort zurücksetzen.</h1><p>Wir senden dir einen Link, mit dem du ein neues Passwort festlegen kannst.</p><form id="recovery-form"><label>E-Mail-Adresse<input name="email" type="email" required autocomplete="email"></label><button class="primary">Link anfordern</button><p role="alert" class="portal-error"></p></form><a class="portal-text" href="./konto.html">Zur Anmeldung</a></section>`;}
  function newPassword(){root.innerHTML=`<section class="portal-empty"><h1>Dein neues Passwort.</h1><form id="password-form"><label>Neues Passwort<input name="password" type="password" minlength="12" required autocomplete="new-password"></label><button class="primary">Passwort speichern</button><p role="alert" class="portal-error"></p></form></section>`;}
  function termsGate(){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Dein Zugang</span><h1>Aktuelle Nutzungsbedingungen.</h1><p>Bevor du deinen Lernraum weiter nutzt, bestätige bitte die <a href="./agb.html" target="_blank" rel="noopener">AGB und Nutzungsbedingungen</a> (Stand 02.11.2026). Die <a href="./datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a> und <a href="./widerruf.html" target="_blank" rel="noopener">Widerrufsinformationen</a> findest du jederzeit hier.</p><form id="terms-form"><label class="portal-consent"><input type="checkbox" name="termsAccepted" value="yes" required> <span>Ich akzeptiere die AGB vom 02.11.2026.</span></label><button class="primary" type="submit">Weiter zum Lernraum</button><p role="alert" class="portal-error"></p></form><button class="portal-text" data-logout>Abmelden</button></section>`;}
  function settings(){const p=state.me;root.innerHTML=`<section class="portal-login-heading"><span class="portal-eyebrow">Dein Konto</span><h1>${safe(p.name)}</h1><p>${p.company?'<strong class="abbate-company-name">'+safe(p.company)+'</strong> · ':''}${safe(p.email)}</p></section>${p.role==='learner'?'<section class="portal-panel abbate-company-editor"><h2>Meine Firma</h2><p class="portal-hint">Deine Firma ist für die Fahrschule in der Teilnehmerverwaltung sichtbar.</p><form id="self-company-form"><label>Firma / Arbeitgeber (optional)<input type="text" name="company" maxlength="120" autocomplete="organization" value="'+safe(p.company||'')+'" placeholder="Firmenname eintragen"></label><button type="submit" class="secondary">Firma speichern</button><p class="portal-error" role="alert"></p></form></section>':''}<div class="portal-actions"><a class="primary" href="./nachweise.html">Meine Schulungen</a><a class="secondary" href="./index.html">Zum Lernen</a>${B.isStaff(p)?'<a class="secondary" href="./verwaltung.html">Verwaltung öffnen</a>':''}<button class="secondary" data-logout>Abmelden</button></div><section class="portal-panel portal-history"><h2>Passwort ändern</h2><form id="change-password-form"><label>Aktuelles Passwort<input name="current" type="password" required autocomplete="current-password"></label><label>Neues Passwort<input name="password" type="password" minlength="12" required autocomplete="new-password"></label><button class="secondary">Neues Passwort speichern</button><p class="portal-error" role="alert"></p></form></section>${p.role==='learner'?`<details class="portal-delete"><summary>Konto und persönliche Daten löschen</summary><p>Dein Zugang, deine Schulungs- und Prüfungseinträge sowie dein Lernfortschritt werden endgültig entfernt. Du kannst dich anschließend nicht mehr mit diesem Konto anmelden.</p><form id="self-delete-form"><label>Dein Passwort zur Bestätigung<input name="password" type="password" required autocomplete="current-password"></label><label class="portal-consent"><input type="checkbox" required> <span>Ich möchte mein Konto und alle zugehörigen Einträge endgültig löschen.</span></label><button class="portal-danger">Mein Konto endgültig löschen</button><p class="portal-error" role="alert"></p></form></details>`:'<p class="portal-hint">Mitarbeiterkonten werden durch den verantwortlichen Betreiber verwaltet.</p>'}`;}
  function paymentLabel(p){
    return ({open:'Zahlung offen',reported:'Zahlung gemeldet',confirmed:'Zahlung bestätigt'})[p?.payment]||'Zahlung offen';
  }
  function paymentBadge(p){
    return '<span class="abbate-payment-badge abbate-payment-'+safe(p?.payment||'open')+'">'+safe(paymentLabel(p))+'</span>';
  }
  function paymentPanel(p,manage=false){
    if(p.role!=='learner')return '';
    const status=p.payment||'open';
    const time=status==='confirmed'?p.paymentConfirmedAt:p.paymentReportedAt;
    const formatted=time?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(time)):'';
    const description=status==='confirmed'
      ?'Die Fahrschule hat den Zahlungseingang bestätigt.'
      :status==='reported'?'Die Zahlung wurde gemeldet. Die Fahrschule überprüft noch den tatsächlichen Eingang.'
      :'Es liegt noch keine bestätigte Zahlung vor.';
    const actions=manage&&state.me?.role==='admin'
      ?'<div class="portal-actions">'+(status==='confirmed'?'':'<button class="primary" type="button" data-payment-action="confirm" data-payment-person="'+safe(p.id)+'">Zahlung bestätigen</button>')+(status==='open'?'':'<button class="secondary" type="button" data-payment-action="reopen" data-payment-person="'+safe(p.id)+'">Auf offen zurücksetzen</button>')+'</div>'
      :!manage&&status==='open'&&state.me?.id===p.id
        ?'<button class="primary" type="button" data-payment-action="report" data-payment-person="'+safe(p.id)+'">Zahlung getätigt</button>'
        :'';
    return '<section class="abbate-payment-panel" aria-label="Zahlungsstatus"><div class="abbate-payment-heading"><div><span class="portal-eyebrow">Zahlungsübersicht</span><h2>Zahlungsstatus</h2></div>'+paymentBadge(p)+'</div><p>'+safe(description)+'</p>'+(formatted?'<small class="abbate-payment-date">'+safe(status==='confirmed'?'Bestätigt: ':'Gemeldet: ')+safe(formatted)+'</small>':'')+actions+'<p class="portal-hint">'+(manage?'Die Bestätigung dokumentiert den Zahlungseingang. Die 30-Tage-Freischaltung erfolgt weiterhin separat.':'Die Meldung ist kein Zahlungsnachweis. Erst die Fahrschule bestätigt den Geldeingang. Der Lernzugang wird getrennt verwaltet.')+'</p></section>';
  }
  function reader(){
    const person=state.students.find(p=>p.id===session());
    if(!person){root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Persönlicher Schulungspass</span><h1>Bitte zuerst anmelden.</h1><p>Über deinen Zugang wird dein eigener Schulungsverlauf geladen.</p><a class="primary" href="./konto.html">Zur Anmeldung ↗</a></section>`;return;}
    const proof=M.ownPass(state,person.id);
    if(!proof){root.innerHTML=paymentPanel(person)+`<section class="portal-empty"><span class="portal-eyebrow">${safe(person.name)}</span><h1>${person.access==='pending'?'Deine Freischaltung steht noch aus.':person.access==='paused'?'Dein Zugang ist pausiert.':'Dein Zugang ist abgelaufen.'}</h1><p>${person.access==='pending'?'Dein Konto ist registriert. Deine Freischaltung wird von der Fahrschule verwaltet. Sobald dein Zugang aktiviert ist, kannst du mit dem Lernen beginnen.':'Bitte wende dich an deine Fahrschule. Deine bisherigen Einträge bleiben bei einer Pause gespeichert.'}</p><a class="secondary" href="./konto.html#einstellungen">Konto verwalten oder löschen</a><button class="portal-text" data-logout>Abmelden</button></section>`;return;}
    const records=proof.records;
    root.innerHTML=paymentPanel(person)+`<section class="portal-identity"><div class="portal-avatar" aria-hidden="true">${safe(person.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><div><span class="portal-eyebrow">Dein persönlicher Schulungspass</span><h1>${safe(person.name)}</h1><p>Durchgeführte Schulungen, Unterweisungen und Prüfungen.</p></div></section><section class="portal-overview"><div><small>Dokumentierter Verlauf</small><strong>${records.length} <span>${records.length===1?'Eintrag':'Einträge'}</span></strong></div><div><small>Zuletzt durchgeführt</small><strong class="portal-date">${records[0]?day(records[0].completedAt):'Noch kein Eintrag'}</strong></div></section><section class="portal-history"><div class="portal-section-title"><div><span class="portal-eyebrow">Von deiner Fahrschule erfasst</span><h2>Dokumentierte Schulungen und Prüfungen</h2></div><span>Neueste zuerst</span></div><div class="portal-records">${records.map(r=>recordCard(r)).join('')||'<section class="portal-panel"><h3>Noch keine Einträge.</h3><p>Hier erscheinen durchgeführte Schulungen und Prüfungen, sobald die Fahrschule sie erfasst hat.</p></section>'}</div></section><footer class="portal-reader-footer"><p>Die Angaben werden von der Fahrschule gepflegt. Übungsrunden aus der Lern-App erzeugen keine bestätigten Schulungs- oder Prüfungseinträge.</p><a class="portal-text" href="./konto.html#einstellungen">Konto & Datenschutz</a><button class="portal-text" data-logout>Abmelden</button></footer>`;
  }

  // Account-level overview: no extra database requests, uses the already paginated staff state.
  // Status and access remain separate and are never inferred from one another.
  function paymentParticipants(status){
    const q=paymentQuery.trim().toLocaleLowerCase('de-DE');
    const list=state.students.filter(p=>p.role==='learner'&&(p.payment||'open')===status
      &&(!q||(p.name+' '+p.email+' '+(p.company||'')).toLocaleLowerCase('de-DE').includes(q)));
    const when=p=>status==='confirmed'?p.paymentConfirmedAt:status==='reported'?p.paymentReportedAt:null;
    list.sort((a,b)=>status==='open'
      ?a.name.localeCompare(b.name,'de',{sensitivity:'base'})
      :((Date.parse(when(b)||'')||0)-(Date.parse(when(a)||'')||0)
        ||a.name.localeCompare(b.name,'de',{sensitivity:'base'})));
    return list;
  }
  function paymentPeopleMarkup(status){
    const list=paymentParticipants(status);
    if(!list.length)return '<p class="abbate-payment-empty">'
      +(paymentQuery?'Keine Treffer für diese Suche.':status==='reported'?'Aktuell hat niemand eine Zahlung gemeldet.':status==='confirmed'?'Noch keine Zahlungen bestätigt.':'Keine offenen Zahlungen.')
      +'</p>';
    const format=value=>value&&Number.isFinite(Date.parse(value))
      ?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'}).format(new Date(value)):'';
    return list.map(p=>{
      const stamp=status==='confirmed'?p.paymentConfirmedAt:p.paymentReportedAt;
      const date=stamp?format(stamp):'';
      const caption=status==='reported'?'Gemeldet':status==='confirmed'?'Bestätigt':'';
      return '<article class="abbate-payment-person"><div class="abbate-payment-person-info"><strong>'+safe(p.name)+'</strong><small>'+safe(p.company||'Keine Firma hinterlegt')+'</small><small>'+safe(p.email)+'</small>'
        +(date?'<span class="abbate-payment-time">'+caption+': '+safe(date)+' Uhr</span>':'')
        +'</div><div class="abbate-payment-person-actions"><button type="button" class="secondary" data-payment-open="'+safe(p.id)+'">Teilnehmer öffnen</button>'
        +(status==='reported'?'<button type="button" class="primary" data-payment-action="confirm" data-payment-person="'+safe(p.id)+'">Zahlung bestätigen</button>':'')
        +'</div></article>';
    }).join('');
  }
  function paymentDialog(){
    if(state.me?.role!=='admin')return '';
    return '<dialog id="payment-overview-dialog" class="admin-cert-overview" aria-labelledby="payment-dialog-title">'
      +'<header class="admin-cert-overview-header"><div><span class="portal-eyebrow">Zahlungsarchiv</span><h2 id="payment-dialog-title">Zahlungsübersicht</h2><p>Gemeldete, bestätigte und offene Zahlungen deiner Teilnehmer.</p></div>'
      +'<form method="dialog" id="payment-overview-dismiss" class="admin-overview-dismiss"><button type="submit" class="admin-viewer-close" aria-label="Zahlungsübersicht schließen">×</button></form></header>'
      +'<div class="admin-cert-overview-body abbate-payment-dialog-body">'+paymentOverview()+'</div></dialog>';
  }
  function paymentOverview(){
    const groups=[
      {key:'reported',title:'Gemeldete Zahlungen',hint:'Auf Zahlungseingang prüfen',count:state.students.filter(p=>p.role==='learner'&&p.payment==='reported').length},
      {key:'confirmed',title:'Bestätigte Zahlungen',hint:'Von Andreas geprüfte Eingänge',count:state.students.filter(p=>p.role==='learner'&&p.payment==='confirmed').length},
      {key:'open',title:'Offene Zahlungen',hint:'Noch keine Zahlung gemeldet',count:state.students.filter(p=>p.role==='learner'&&(p.payment||'open')==='open').length}
    ];
    return '<section id="payment-overview" class="abbate-payment-overview" aria-labelledby="payment-overview-title">'
      +'<div class="abbate-payment-overview-heading"><div><span class="portal-eyebrow">Teilnehmerzahlungen</span><h2 id="payment-overview-title">Zahlungen im Überblick</h2><p>Namen und Zahlungsstatus direkt prüfen. Der Lernzugang wird unabhängig verwaltet.</p></div><span class="abbate-payment-overview-total">'+groups.reduce((sum,g)=>sum+g.count,0)+' Teilnehmer</span></div>'
      +'<label class="abbate-payment-overview-search" for="payment-overview-search">Teilnehmer suchen<input id="payment-overview-search" type="search" placeholder="Name, Firma oder E-Mail eingeben" autocomplete="off" value="'+safe(paymentQuery)+'"></label>'
      +'<div class="abbate-payment-accordions">'
      +groups.map(g=>'<details class="abbate-payment-group abbate-payment-group--'+g.key+'" data-payment-group="'+g.key+'"'+(paymentExpanded[g.key]?' open':'')+'>'
        +'<summary><span class="abbate-payment-group-marker" aria-hidden="true"></span><span class="abbate-payment-group-title"><strong>'+g.title+'</strong><small>'+g.hint+'</small></span><span class="abbate-payment-group-count">'+g.count+'</span><span class="abbate-payment-group-chevron" aria-hidden="true"></span></summary>'
        +'<div class="abbate-payment-group-content"><p class="abbate-payment-result-count" data-payment-count="'+g.key+'" role="status">'+paymentParticipants(g.key).length+' von '+g.count+' Teilnehmern</p><div data-payment-list="'+g.key+'" class="abbate-payment-person-list">'+paymentPeopleMarkup(g.key)+'</div></div></details>').join('')
      +'</div></section>';
  }
  function refreshPaymentOverview(){
    for(const key of ['reported','confirmed','open']){
      const list=root.querySelector('[data-payment-list="'+key+'"]');
      const count=root.querySelector('[data-payment-count="'+key+'"]');
      if(list)list.innerHTML=paymentPeopleMarkup(key);
      if(count)count.textContent=paymentParticipants(key).length+' von '+state.students.filter(p=>p.role==='learner'&&(p.payment||'open')===key).length+' Teilnehmern';
    }
  }
  function rememberPaymentOverview(){
    const previous=root.querySelector('#payment-overview');
    if(!previous)return;
    paymentQuery=previous.querySelector('#payment-overview-search')?.value||'';
    for(const key of ['reported','confirmed','open']){
      const group=previous.querySelector('[data-payment-group="'+key+'"]');
      if(group)paymentExpanded[key]=group.open;
    }
  }
  function matchesAccountStatus(p,key){
    if(p.id===state.me?.id)return false;
    if(key==='all')return true;
    if(p.role!=='learner')return false;
    if(key==='active')return M.access(p);
    if(key==='inactive')return p.access==='paused'||(p.access==='active'&&!M.access(p));
    if(key==='expired')return p.access==='active'&&!M.access(p);
    if(key.startsWith('payment:'))return (p.payment||'open')===key.slice(8);
    return p.access===key;
  }
  function people(){return state.students.filter(p=>matchesAccountStatus(p,filter)&&(p.name+' '+p.email+' '+(p.company||'')).toLowerCase().includes(search.toLowerCase()));}
  function accountStats(){
    return [['all','Konten'],['pending','Wartend'],['active','Aktiv'],['inactive','Inaktiv']].map(([key,label])=>`<button type="button" data-account-stat="${key}" aria-pressed="${filter===key}" aria-controls="account-list"><span>${label}</span><strong>${state.students.filter(p=>matchesAccountStatus(p,key)).length}</strong></button>`).join('');
  }
  function syncAccountStats(){
    root.querySelectorAll('[data-account-stat]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.accountStat===filter)));
  }
  function selectAccountStat(key){
    filter=key;search='';
    const input=root.querySelector('#account-search'),status=root.querySelector('#account-filter');
    if(input)input.value='';if(status)status.value=filter;
    const matching=people();
    if(!matching.some(p=>p.id===selected))selected=matching[0]?.id||null;
    root.querySelector('#account-list').innerHTML=peopleList();
    root.querySelector('#account-picker-toggle').innerHTML=pickerLabel();
    syncAccountStats();
    renderDetail();
    setPickerOpen(true);
    root.querySelector('#account-picker')?.scrollIntoView?.({block:'nearest',behavior:'smooth'});
  }
  function peopleList(){return people().map(p=>`<button class="portal-person ${selected===p.id?'selected':''}" data-person="${safe(p.id)}" aria-pressed="${selected===p.id}"><span class="portal-person-name">${safe(p.name)}${p.company?'<small class="abbate-person-company">'+safe(p.company)+'</small>':''}<small>${safe(p.email)}</small></span><span><small>${p.role==='admin'?'Administrator':p.role==='trainer'?'Ausbilder':'Teilnehmer'}</small>${badge(p)}${p.role==='learner'?paymentBadge(p):''}</span></button>`).join('')||'<p class="portal-hint">Keine passenden Konten.</p>';}
  function pickerLabel(){
    const person=state.students.find(p=>p.id===selected);
    return `<span><small>Teilnehmer auswählen</small><strong>${safe(person?.name||'Konto suchen')}</strong>${person?.company?'<span class="abbate-picker-company">'+safe(person.company)+'</span>':''}<span class="portal-picker-email">${safe(person?.email||'Name oder E-Mail')}</span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
  }
  function setPickerOpen(open,focus=false){
    const picker=document.querySelector('#account-picker');
    const toggle=document.querySelector('#account-picker-toggle');
    if(!picker||!toggle)return;
    picker.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    if(focus)(open?document.querySelector('#account-search'):toggle).focus({preventScroll:true});
  }
  const adminCopy=(desktop,mobile)=>`<span class="portal-desktop-copy">${desktop}</span><span class="portal-mobile-copy">${mobile}</span>`;
  const adminDisclosure=(id,title,hint)=>`<button type="button" class="portal-admin-disclosure" data-admin-disclosure="${id}" aria-controls="${id}" aria-expanded="false"><span><strong>${title}</strong><small>${hint}</small></span><span class="portal-disclosure-mark" aria-hidden="true">+</span></button>`;
  function detail(){
    const p=state.students.find(p=>p.id===selected);if(!p)return '<section class="portal-panel"><h2>Konto auswählen</h2><p>Wähle einen Teilnehmer über die Kontenauswahl aus. Neue Registrierungen erscheinen hier nach dem Aktualisieren.</p></section>';
    const rolePanel=canManageRoles()&&p.id!==state.me.id?`<section class="portal-panel portal-role-panel">
       ${adminDisclosure('account-role-options','Weitere Kontoeinstellungen','Administratorrechte verwalten')}
       <div id="account-role-options" class="portal-disclosure-content">
       <h3>Administratorrechte</h3>
       <p><strong>Aktuelle Rolle:</strong> ${p.role==='admin'?'Administrator':p.role==='trainer'?'Ausbilder':'Teilnehmer'}</p>
       <p>Administratorrechte ermöglichen die Verwaltung aller Teilnehmerzugänge und Schulungsnachweise. Rollenänderungen werden protokolliert.</p>
       <form id="role-form">
         <label class="portal-consent"><input type="checkbox" name="roleConfirmed" value="yes" required> <span>Ich bestätige die Änderung der Zugriffsrechte für dieses Konto.</span></label>
         <div class="portal-actions">
           <button class="${p.role==='admin'?'secondary':'primary'}" name="newRole" value="${p.role==='admin'?'learner':'admin'}" type="submit">${p.role==='admin'?'Administratorrechte entziehen':'Zum Administrator ernennen'}</button>
         </div>
         ${p.role==='admin'?'<p class="portal-hint">Nach dem Entzug ist der Lernzugang zunächst nicht freigeschaltet und muss bei Bedarf separat aktiviert werden.</p>':''}
         <p role="alert" class="portal-error"></p>
       </form></div></section>`:''; // injected below in native template
    if(p.role!=='learner')return `<section class="portal-account-heading"><div><span class="portal-eyebrow">Mitarbeiterkonto</span><h2>${safe(p.name)}</h2><p>${safe(p.email)}</p></div>${badge(p)}</section>`+rolePanel;
    const records=M.recordsFor(state,p.id);
    return `<section class="portal-account-heading"><div class="admin-avatar" aria-hidden="true">${safe(p.name.split(/\s+/).map(n=>n[0]).slice(0,2).join(''))}</div><div class="admin-identity"><span class="portal-eyebrow">Teilnehmer</span><h2>${safe(p.name)}</h2>${p.company?'<p class="abbate-account-company">'+safe(p.company)+'</p>':''}<p>${safe(p.email)}</p></div>${badge(p)}</section><section class="portal-panel abbate-admin-company"><details><summary>Firma bearbeiten</summary><form id="admin-company-form"><label>Firma / Arbeitgeber<input name="company" type="text" maxlength="120" value="${safe(p.company||'')}" placeholder="Firma eintragen"></label><button type="submit" class="secondary">Firma speichern</button><p role="alert" class="portal-error"></p></form></details></section>${paymentPanel(p,true)}<details class="portal-access-panel admin-section" ${state.me.role!=='admin'?'hidden':''}><summary><span class="admin-section-icon" aria-hidden="true">↗</span><span><strong>Lernzugang</strong><small>Gültig bis: ${safe(p.until?day(p.until):'Nicht freigeschaltet')}</small></span><span class="admin-chevron" aria-hidden="true"></span></summary><div class="admin-section-body"><div><details class="portal-mobile-help"><summary>Wie funktionieren Zahlung und Zugang?</summary><ol><li><strong>Zahlung prüfen:</strong> Kontrolliere selbst, ob die Barzahlung oder Überweisung eingegangen ist. Die App verarbeitet keine Zahlungen.</li><li><strong>Zugang freigeben:</strong> Schalte die Person nach Zahlung für 30 Tage frei oder verlängere ihren bestehenden Zugang um 30 Tage.</li><li><strong>Bei Bedarf pausieren:</strong> Die Person kann vorübergehend nicht lernen. Die bezahlte Laufzeit läuft trotzdem weiter.</li></ol><p>Es gibt keine automatische Verlängerung und keine automatische Abbuchung.</p></details></div><form id="access-form"><div class="portal-actions">${p.access==='paused'&&M.access({...p,access:'active'})?'<button class="secondary" name="intent" value="resume" type="submit">Zugang fortsetzen</button>':''}${(p.access==='active'||p.access==='paused')&&p.until&&p.until>=M.today()?'<button class="primary" name="intent" value="extend" type="submit">Nach Zahlung um 30 Tage verlängern</button>':'<button class="primary" name="intent" value="activate" type="submit">Nach Zahlung 30 Tage freischalten</button>'}<button class="secondary" name="intent" value="pause" type="submit" ${p.access!=='active'?'disabled':''}>Zugang pausieren</button></div><p role="alert" class="portal-error"></p></form></div></details>${certificatePanel(p)}<details class="portal-panel portal-entry admin-section"><summary><span class="admin-section-icon" aria-hidden="true">+</span><span><strong>Schulung / Prüfung erfassen</strong><small>Eintrag ohne Zertifikat</small></span><span class="admin-chevron" aria-hidden="true"></span></summary><div id="account-record-entry" class="admin-section-body"><form id="record-form" class="portal-record-form"><label class="portal-wide">${adminCopy('Bezeichnung','Was wurde durchgeführt?')}<input name="title" maxlength="200" required placeholder="z. B. Gabelstapler · Abschlussprüfung"></label><label>${adminCopy('Art','Art der Schulung oder Prüfung')}<select name="kind" id="record-kind" aria-label="Art"><option value="training">Schulung</option><option value="instruction">Unterweisung</option><option value="annual_instruction">Jährliche Unterweisung</option><option value="exam">Prüfung</option></select></label><label>Durchgeführt am<input name="completedAt" type="date" value="${M.today()}" max="${M.today()}" required></label><label>Ergebnis<select name="outcome" id="record-outcome" aria-label="Ergebnis"><option value="attended">Teilgenommen</option><option value="passed">Bestanden</option><option value="failed">Nicht bestanden</option></select></label><div class="portal-submit"><button class="primary" type="submit">Im Schulungspass speichern</button></div><p role="alert" class="portal-error portal-wide"></p></form></div></details><details class="portal-history portal-admin-history admin-section"><summary><span class="admin-section-icon" aria-hidden="true">≡</span><span><strong>Bisherige Einträge</strong><small>${records.length} ${records.length===1?'Eintrag':'Einträge'}</small></span><span class="admin-chevron" aria-hidden="true"></span></summary><div id="account-record-history" class="admin-section-body"><div class="portal-records">${records.map(r=>recordCard(r,true)).join('')||'<p>Noch keine durchgeführten Schulungen oder Prüfungen eingetragen.</p>'}</div></div></details>${rolePanel}<details class="portal-delete" ${state.me.role!=='admin'?'hidden':''}><summary>Konto endgültig löschen …</summary><p>Das Konto, der Lernfortschritt und alle Schulungs- und Prüfungseinträge werden unwiderruflich gelöscht. Pausieren erhält die Einträge.</p><button class="portal-danger" data-delete-open>Konto löschen</button></details><dialog id="delete-dialog" class="portal-dialog"><h2>Konto wirklich löschen?</h2><p>${safe(p.name)} und alle zugehörigen Einträge werden vom Server gelöscht.</p><label>Dein Admin-Passwort zur Bestätigung<input type="password" id="delete-password" required autocomplete="current-password"></label><p id="delete-error" role="alert" class="portal-error"></p><div class="portal-actions"><button class="secondary" data-delete-cancel>Abbrechen</button><button class="portal-danger" data-delete-confirm>Endgültig löschen</button></div></dialog>`;
  }

  let certificateDraft=null,certificatePreviewReady=false,previewSequence=0;
  let pdfLibrary;
  // Only the server-rendered, verified draft supplies the reading view's text and signature.
  const previewText=new WeakMap();
  function certificateText(content){
    const line=y=>content.items.filter(i=>typeof i.str==='string'&&i.transform&&Math.abs(i.transform[5]-y)<1).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim();
    const result={school:line(485),subtitle:line(403),intro:line(356),name:line(310),statement:line(281),subject:line(253),standard:line(231),date:line(208),note:line(169),signedDate:line(111),footer:line(42)};
    if(!['TEILNAHMENACHWEIS','ERFOLGREICH BESTANDENE THEORIEPRÜFUNG','ERFOLGREICH BESTANDENE PRAXISPRÜFUNG'].includes(result.subtitle)||Object.values(result).some(v=>!v)||result.school!=='FAHRSCHULE ANDREAS ABBATE'||!result.footer.includes('Noch nicht ausgestellt'))return null;
    return result;
  }
  function cropCertificateArt(source,canvas,x,y,w,h){
    const sx=source.width/842,sy=source.height/595;
    canvas.width=Math.max(1,Math.round(w*sx));canvas.height=Math.max(1,Math.round(h*sy));
    canvas.getContext('2d',{alpha:false}).drawImage(source,x*sx,(595-y-h)*sy,w*sx,h*sy,0,0,canvas.width,canvas.height);
  }
  function openCertificateViewer(target,trigger){
    if(!certificatePreviewReady||!target?.isConnected)return;
    const source=trigger?.querySelector('canvas')||target.querySelector('.admin-preview-stage canvas'),dialog=target.querySelector('.admin-certificate-viewer');
    const canvas=dialog?.querySelector('.admin-viewer-original canvas'),page=dialog?.querySelector('.admin-viewer-page');
    if(!source||source.hidden||!canvas||!page||dialog.open||typeof dialog.showModal!=='function')return;
    canvas.width=source.width;canvas.height=source.height;
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
    ctx.drawImage(source,0,0);
    const info=previewText.get(source),paper=page.querySelector('.admin-viewer-paper'),toggle=dialog.querySelector('[data-cert-viewer-mode]');
    if(info){
      for(const node of paper.querySelectorAll('[data-pdf-text]'))node.textContent=info[node.dataset.pdfText]||'';
      const annual=info.subtitle==='TEILNAHMENACHWEIS';
      paper.querySelector('[data-pdf-date-label]').textContent=annual?'Unterweisungsdatum':'Prüfungsdatum';
      paper.querySelector('[data-pdf-signer-role]').textContent=annual?'Unterweisungsverantwortlicher':'Prüfungsverantwortlicher';
      cropCertificateArt(source,paper.querySelector('[data-pdf-logo]'),388,504,66,49);
      cropCertificateArt(source,paper.querySelector('[data-pdf-signature]'),522,102,156,55);
    }
    page.dataset.mode=info&&window.matchMedia('(max-width:700px) and (orientation:portrait)').matches?'reading':'original';
    toggle.hidden=!info;toggle.textContent=page.dataset.mode==='reading'?'Original-PDF':'Leseansicht';
    dialog.showModal();page.scrollTop=0;
  }
  async function renderCertificateCanvas(canvas,bytes){
    if(!pdfLibrary)pdfLibrary=import(new URL('./vendor/pdfjs/pdf.min.mjs',document.baseURI).href).then(pdf=>{pdf.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.min.mjs',document.baseURI).href;return pdf;}).catch(error=>{pdfLibrary=null;throw error;});
    const pdf=await pdfLibrary;
    const task=pdf.getDocument({data:bytes,standardFontDataUrl:new URL('./vendor/pdfjs/standard_fonts/',document.baseURI).href,wasmUrl:new URL('./vendor/pdfjs/wasm/',document.baseURI).href,isEvalSupported:false,enableXfa:false,useSystemFonts:true});
    let doc;
    try{doc=await task.promise;if(doc.numPages!==1)throw Error('Ungültige Zertifikatsseitenzahl.');const page=await doc.getPage(1),base=page.getViewport({scale:1});const width=Math.min(2200,Math.max(window.matchMedia('(max-width:700px)').matches?1600:1200,Math.round((canvas.parentElement?.clientWidth||600)*Math.min(window.devicePixelRatio||1,2))));const viewport=page.getViewport({scale:width/base.width});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas nicht verfügbar.');await page.render({canvas,canvasContext:ctx,viewport}).promise;try{previewText.set(canvas,certificateText(await page.getTextContent()));}catch{previewText.delete(canvas);}page.cleanup();}finally{if(doc)await doc.destroy();else await task.destroy();}
  }
  function certificatePanel(p){
    const C=globalThis.ABBATE_CERTIFICATES;if(!C)return '';
    return `<section class="cert-panel admin-section" aria-labelledby="cert-heading"><button type="button" class="admin-section-heading cert-section-toggle" data-admin-disclosure="certificate-section-content" aria-expanded="false" aria-controls="certificate-section-content"><span class="admin-section-icon admin-gold" aria-hidden="true">✓</span><span><strong id="cert-heading">Prüfung &amp; Zertifikat</strong><small>Prüfung, Ausbildung oder Unterweisung</small></span><span class="admin-chevron" aria-hidden="true"></span></button><div id="certificate-section-content" class="admin-section-body portal-disclosure-content">${state.me.role==='admin'&&!certStatus.signatureReady?'<p class="admin-alert">Unterschrift fehlt. Bitte in den Einstellungen hinterlegen.</p>':''}<form id="certificate-form" class="portal-record-form"><label class="portal-wide">Zertifikat / Ausbildungsbereich<select name="course" required><option value="">Bitte auswählen …</option>${C.courses.map(c=>`<option value="${safe(c.id)}">${safe(c.label)}</option>`).join('')}${certStatus.templatesV2?'<option value="brandschutzhelfer">Brandschutzhelfer</option>':''}</select></label><label class="portal-wide" data-proof-type hidden>Art des Nachweises<select name="proofType" disabled><option value="theory">Bestandene Theorieprüfung</option><option value="cargo">Teilnahmebescheinigung</option><option value="rope">Ausbildungsnachweis (Theorie &amp; Praxis)</option><option value="fire">Ausbildungsbescheinigung (Theorie &amp; Praxis)</option></select></label><fieldset class="portal-wide cert-exam-choice" data-exam-selection hidden><legend>Bestandene Prüfungen</legend><input type="hidden" name="examSelection" value="yes" disabled><label class="portal-consent"><input type="checkbox" name="examTheory" value="yes" checked disabled> Theorieprüfung bestanden</label><label class="portal-consent"><input type="checkbox" name="examPractice" value="yes" disabled> Praxisprüfung bestanden</label><p class="portal-hint">Beide ausgewählt? Es entstehen zwei getrennte Zertifikate.</p></fieldset><div class="portal-wide portal-record-form" data-special-details hidden><label data-special="cargo rope">Geburtsdatum<input type="date" name="birthDate" disabled></label><label data-special="rope">Geburtsort<input name="birthPlace" maxlength="80" disabled></label><label data-special="rope fire">Unternehmen<input name="company" maxlength="100" disabled></label><label data-special="rope fire">Schulungsort<input name="location" maxlength="80" disabled></label><label data-special="fire">Abteilung / Bereich (optional)<input name="department" maxlength="100" disabled></label><label class="portal-consent portal-wide" data-special="rope fire"><input type="checkbox" name="theoryConfirmed" value="yes" disabled> Theorie erfolgreich absolviert / bei Abseilen Prüfung bestanden</label><label class="portal-consent portal-wide" data-special="rope fire"><input type="checkbox" name="practiceConfirmed" value="yes" disabled> Praxis erfolgreich absolviert / bei Abseilen praktische Prüfung bestanden</label><p class="portal-hint portal-wide" data-special="fire">Ausbildungsbescheinigung; die betriebliche Bestellung erfolgt durch den Arbeitgeber.</p></div><label class="portal-wide" data-annual-field hidden>Unterwiesener Fachbereich<select name="field" disabled><option value="">Bitte auswählen …</option>${C.fields.map(c=>`<option value="${safe(c.id)}">${safe(c.label)}</option>`).join('')}</select></label><label>Prüfungs- / Schulungsdatum<input name="completedAt" type="date" value="${C.today()}" max="${C.today()}" required></label><label>Versand<select name="notification"><option value="none">Keine E-Mail</option><option value="email" ${certStatus.mailReady?'':'disabled'}>Zertifikat per E-Mail</option></select></label><label class="portal-wide" data-certificate-recipient hidden>Empfänger-E-Mail (Teilnehmer oder Firma)<input type="email" name="recipientEmail" value="${safe(p.email||'')}" maxlength="254" autocomplete="off" disabled><small class="portal-hint">Gilt nur für diesen Versand. Bitte prüfen, ob der Empfänger das Zertifikat erhalten darf.</small></label><div class="portal-wide"><button class="primary admin-preview-button" name="intent" value="preview" type="submit">PDF-Vorschau prüfen</button></div><div id="certificate-preview" class="portal-wide" aria-live="polite"></div><p role="alert" class="portal-error portal-wide"></p></form></div></section>`;
  }
  function syncSpecialCertificate(form){
    const course=form.elements.course.value,type=form.elements.proofType;
    const special=certStatus.templatesV2&&({ladungssicherung:'cargo',abseilen:'rope',brandschutzhelfer:'fire'})[course];
    type.disabled=!special;form.querySelector('[data-proof-type]').hidden=!special;
    for(const opt of type.options){opt.hidden=opt.value!=='theory'&&opt.value!==special||special==='fire'&&opt.value==='theory';opt.disabled=opt.hidden;}
    if(!special)type.value='theory';else if(special==='fire')type.value='fire';else if(type.value!=='theory'&&type.value!==special)type.value='theory';
    const selectedType=special?type.value:'theory';
    const choice=form.querySelector('[data-exam-selection]');
    const showExams=!!certStatus.practiceV1&&state.me.role==='admin'&&selectedType==='theory'&&!!course&&course!=='jaehrliche-unterweisung'&&course!=='brandschutzhelfer';
    choice.hidden=!showExams;
    for(const input of choice.querySelectorAll('input'))input.disabled=!showExams;
    form.querySelector('[data-special-details]').hidden=selectedType==='theory';
    for(const row of form.querySelectorAll('[data-special]')){
      const enabled=row.dataset.special.split(' ').includes(selectedType);row.hidden=!enabled;
      const input=row.querySelector('input');if(input){input.disabled=!enabled;input.required=enabled&&input.name!=='department';if(!enabled){if(input.type==='checkbox')input.checked=false;else input.value='';}}
    }
  }
  function invalidateCertificatePreview(form){
    const target=form.querySelector('#certificate-preview');
    if(!target?.hasAttribute('data-abbate-update-block'))return;
    certificateDraft=null;certificatePreviewReady=false;previewSequence++;
    const stage=target.querySelector('.admin-preview-stage');
    if(stage){
      const status=stage.querySelector('.admin-preview-message');
      stage.dataset.previewState='stale';status.hidden=false;status.textContent='Angaben geändert. Bitte PDF-Vorschau erneut prüfen.';
      const canvas=stage.querySelector('canvas');if(canvas)canvas.hidden=true;
      for(const thumbnail of target.querySelectorAll('[data-cert-viewer-open]'))thumbnail.hidden=true;
      const viewer=target.querySelector('.admin-certificate-viewer');if(viewer?.open)viewer.close();
    }
    const confirmed=target.querySelector('[name="certificateConfirmed"]');if(confirmed)confirmed.checked=false;
    target.querySelectorAll('.admin-certificate-actions button').forEach(button=>button.disabled=true);
  }
  async function showCertificate(form,draft){
    const target=form.querySelector('#certificate-preview');
    const sequence=++previewSequence;certificatePreviewReady=false;
    const marker=JSON.stringify(draft);certificateDraft=marker;
    target.setAttribute('data-abbate-update-block','');
    target.innerHTML=`<div class="cert-review"><div class="admin-preview-status"><strong>PDF-Vorschau</strong><span>Noch nicht ausgestellt</span></div><div id="certificate-preview-stage" class="admin-preview-stage" data-preview-state="loading"><p class="admin-preview-message" role="status">PDF wird geladen …</p><button type="button" class="admin-preview-thumbnail" data-cert-viewer-open aria-haspopup="dialog" aria-label="PDF-Vorschau vergrößern" hidden><canvas class="admin-pdf-canvas" role="img" aria-label="Zertifikatsvorschau mit Unterschrift" hidden></canvas><span class="admin-preview-tap"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>Antippen zum Vergrößern</span></button></div><dialog class="admin-certificate-viewer" aria-label="Große PDF-Vorschau"><header class="admin-viewer-header"><div><strong>PDF-Vorschau</strong><small>Noch nicht ausgestellt</small></div><div class="admin-viewer-tools"><button type="button" class="admin-viewer-mode" data-cert-viewer-mode hidden>Original-PDF</button><button type="button" class="admin-viewer-close" data-cert-viewer-close aria-label="Vorschau schließen" autofocus><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div></header><div class="admin-viewer-page" data-mode="original"><div class="admin-viewer-original"><canvas class="admin-pdf-canvas" role="img" aria-label="Originale Zertifikatsvorschau"></canvas></div><article class="admin-viewer-paper" aria-label="Mobile Leseansicht der PDF-Vorschau"><div class="admin-paper-frame"><div class="admin-paper-brand"><canvas data-pdf-logo role="img" aria-label="Fahrschullogo"></canvas><p data-pdf-text="school"></p></div><div class="admin-paper-title"><h2>Zertifikat</h2><p data-pdf-text="subtitle"></p></div><div class="admin-paper-content"><p data-pdf-text="intro"></p><h3 data-pdf-text="name"></h3><p data-pdf-text="statement"></p><strong data-pdf-text="subject"></strong><p class="admin-paper-standard" data-pdf-text="standard"></p><p data-pdf-text="date"></p><p class="admin-paper-note" data-pdf-text="note"></p></div><div class="admin-paper-signoff"><div><span data-pdf-text="signedDate"></span><strong data-pdf-date-label></strong></div><div><canvas data-pdf-signature role="img" aria-label="Unterschrift aus der PDF-Vorschau"></canvas><strong>Andreas Abbate</strong><small data-pdf-signer-role></small></div></div><div class="admin-paper-footer"><span data-pdf-text="footer"></span><small>Mobile Leseansicht · Original-PDF unverändert</small></div></div></article></div></dialog><div class="cert-review-summary"><strong>${draft.notification==='email'?'Empfänger: '+safe(draft.email):'Ohne E-Mail-Versand'}</strong></div><label class="portal-consent"><input type="checkbox" name="certificateConfirmed" value="yes"> <span>${draft.template?'Ich bestätige die tatsächlich durchgeführte Schulung, die angegebenen Personendaten und alle bescheinigten Inhalte.':draft.kind==='instruction'?'Ich bestätige die tatsächlich durchgeführte jährliche Unterweisung und die Teilnahme.':draft.additional?.length?'Ich bestätige die tatsächlich bestandene Theorie- und Praxisprüfung.':draft.examType==='practice'?'Ich bestätige die tatsächlich bestandene Praxisprüfung.':'Ich bestätige die bestandene Theorieprüfung.'}</span></label><div class="admin-certificate-actions">${state.me.role==='admin'?'<button class="primary" name="intent" value="issue" type="submit" disabled>Zertifikat ausstellen'+(draft.notification==='email'?' und versenden':'')+'</button>':''}${draft.template?'':'<button class="secondary" name="intent" value="save" type="submit">Nur Nachweis speichern</button>'}</div></div>`;
    const stage=target.querySelector('.admin-preview-stage'),message=stage.querySelector('.admin-preview-message'),canvas=stage.querySelector('canvas'),issue=target.querySelector('[value="issue"]');
    const current=()=>target.isConnected&&certificateDraft===marker&&sequence===previewSequence&&stage.isConnected;
    if(state.me.role!=='admin'||!certStatus.signatureReady){
      stage.dataset.previewState='unavailable';message.textContent=state.me.role!=='admin'?'Zertifikate werden durch einen Administrator ausgestellt.':'Für die PDF-Vorschau fehlt die hinterlegte Unterschrift.';return;
    }
    try{
      const data=await certCall({action:'preview',school:state.me.school,participantId:draft.student,label:draft.label,field:draft.field,completedAt:draft.completedAt,...(draft.template?{template:draft.template,details:draft.details,theory:draft.theory,practice:draft.practice}:{}),...(draft.examType?{examType:draft.examType}:{})});
      if(!current())return;
      if(data?.draft!==true||!data.pdf)throw Error('Keine signierte PDF-Vorschau erhalten.');
      const bytes=Uint8Array.from(atob(data.pdf),x=>x.charCodeAt(0));
      message.textContent='PDF wird angezeigt …';
      await renderCertificateCanvas(canvas,bytes);
      if(!current())return;
      for(const extra of draft.additional||[]){
        const second=await certCall({action:'preview',school:state.me.school,participantId:extra.student,label:extra.label,field:extra.field,completedAt:extra.completedAt,examType:extra.examType});
        if(!current())return;
        if(second?.draft!==true||!second.pdf)throw Error('Keine Praxis-PDF-Vorschau erhalten.');
        const button=target.querySelector('[data-cert-viewer-open]').cloneNode(true);
        const secondCanvas=button.querySelector('canvas');
        button.setAttribute('aria-label','Praxis-Zertifikat vergrößern');
        button.querySelector('.admin-preview-tap').textContent='Praxisprüfung · Vergrößern';
        stage.append(button);
        await renderCertificateCanvas(secondCanvas,Uint8Array.from(atob(second.pdf),x=>x.charCodeAt(0)));
        if(!current())return;
        secondCanvas.hidden=false;button.hidden=false;
        target.querySelector('.admin-preview-tap').textContent='Theorieprüfung · Vergrößern';
      }
      stage.dataset.previewState='ready';canvas.hidden=false;message.hidden=true;
      target.querySelector('[data-cert-viewer-open]').hidden=false;
      certificatePreviewReady=true;
      if(issue)issue.disabled=false;
    }catch(e){
      if(!current())return;
      certificatePreviewReady=false;
      stage.dataset.previewState='error';message.hidden=false;canvas.hidden=true;
      for(const thumbnail of target.querySelectorAll('[data-cert-viewer-open]'))thumbnail.hidden=true;
      message.textContent='PDF-Vorschau konnte nicht geladen werden. Bitte oben erneut prüfen. '+String(e?.message||'').slice(0,180);
      if(issue)issue.disabled=true;
      console.warn('Abbate PDF preview:',e?.name||'error');
    }
  }

  function renderDetail(){certificateDraft=null;certificatePreviewReady=false;previewSequence++;document.querySelector('#account-detail').innerHTML=detail();}
  function annualOverview(){
    const C=globalThis.ABBATE_CERTIFICATES;if(!C)return '';
    const people=new Map(state.students.filter(p=>p.role==='learner').map(p=>[p.id,p]));
    const due=C.reminders(state.completions).filter(r=>people.has(r.student));
    return `<details class="portal-panel admin-section"><summary><span><strong>Jährliche Unterweisungen</strong> <small>${due.length} fällig oder in 30 Tagen</small></span></summary><div class="admin-section-body"><p class="portal-hint">Planungshilfe je Fachbereich, gerechnet ab der letzten dokumentierten Unterweisung. Frühere Unterweisungen können erforderlich sein. Kein automatischer Versand.</p>${due.map(r=>`<div class="portal-record"><strong>${safe(people.get(r.student).name)}</strong><p>${safe(r.field)} · ${safe(day(r.due))} · ${r.days<0?'Überfällig':r.days===0?'Heute fällig':'In '+r.days+' Tagen'}</p><button type="button" class="secondary" data-person="${safe(r.student)}">Teilnehmer öffnen</button></div>`).join('')||'<p>Keine anstehenden Wiederholungen aus den erfassten Fachbereichsnachweisen.</p>'}</div></details>`;
  }
  // An attendance or exam record alone is not an issued certificate.
  function issuedCertificateRows(snapshot,stored){
    const people=new Map(snapshot.students.map(p=>[p.id,p]));
    return snapshot.completions.filter(r=>certificateEligible(r)&&!r.revokedAt&&stored.has(r.id)&&!stored.get(r.id).invalidated_at).map(r=>{
      const c=stored.get(r.id),p=people.get(r.student);
      const status=['accepted','not_sent','sending','uncertain'].includes(c.mail_status)?c.mail_status:'unknown';
      return {...r,name:p?.name||'Teilnehmer nicht verfügbar',email:p?.email||'',issuedAt:c.issued_at,status};
    }).sort((a,b)=>String(b.issuedAt||'').localeCompare(String(a.issuedAt||''))||a.id.localeCompare(b.id));
  }
  function filterIssuedCertificates(rows,query,mode){
    const q=String(query||'').trim().toLocaleLowerCase('de-DE');
    return rows.filter(r=>(mode==='all'||(mode==='review'?['sending','uncertain','unknown'].includes(r.status):r.status===mode))&&(!q||[r.name,r.email,r.title,r.reference].some(v=>String(v||'').toLocaleLowerCase('de-DE').includes(q))));
  }
  // Staff-recorded completions, not self-study results, remain visible even without a PDF.
  function completedRecordRows(snapshot,stored,listUnavailable=false,asOf=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date())){
    const people=new Map(snapshot.students.map(p=>[p.id,p]));
    const issued=new Map(issuedCertificateRows(snapshot,stored).map(r=>[r.id,r]));
    return snapshot.completions.filter(r=>!r.revokedAt&&['exam','training','instruction'].includes(r.kind)&&['passed','failed','attended'].includes(r.outcome)&&/^\d{4}-\d{2}-\d{2}$/.test(r.completedAt||'')&&Number.isFinite(Date.parse(r.completedAt+'T12:00:00Z'))&&new Date(r.completedAt+'T12:00:00Z').toISOString().slice(0,10)===r.completedAt&&r.completedAt<=asOf).map(r=>{
      const p=people.get(r.student),c=issued.get(r.id);
      return {...r,name:p?.name||'Teilnehmer nicht verfügbar',email:p?.email||'',personAvailable:!!p,certificate:c?'issued':listUnavailable&&certificateEligible(r)?'unknown':'none'};
    }).sort((a,b)=>b.completedAt.localeCompare(a.completedAt)||a.id.localeCompare(b.id));
  }
  function filterCompletedRecords(rows,{query='',kind='all',outcome='all',from='',to=''}={}){
    const q=String(query).trim().toLocaleLowerCase('de-DE');
    return rows.filter(r=>(kind==='all'||r.kind===kind)&&(outcome==='all'||r.outcome===outcome)&&(!from||r.completedAt>=from)&&(!to||r.completedAt<=to)&&(!q||[r.name,r.email,r.title,r.reference].some(v=>String(v||'').toLocaleLowerCase('de-DE').includes(q))));
  }
  // Print a documentation extract, never an official certificate or a signature.
  function completionPrintMarkup(record,person){
    return '<h1>Schulungs- und Prüfungseintrag</h1><p>Fahrschule Abbate · Abbate Lernraum</p><dl>'+[
      ['Teilnehmer',person?.name||'Teilnehmer nicht verfügbar'],['Bezeichnung',record.title],['Nachweisart',M.kinds[record.kind]],['Ergebnis',M.outcomes[record.outcome]],['Durchgeführt am',day(record.completedAt)],['Referenz',record.reference]
    ].map(([label,value])=>'<div><dt>'+safe(label)+'</dt><dd>'+safe(value)+'</dd></div>').join('')+'</dl><p class="admin-print-note">Auszug aus der Teilnehmerverwaltung. Kein ausgestelltes Zertifikat und kein Ersatz für einen offiziellen Befähigungsnachweis.</p>';
  }
  function printCompletionRecord(id){
    if(view!=='admin'||state.me?.role!=='admin')return;
    const record=completedRecordRows(state,certRecords,!!certStatus.listUnavailable).find(r=>r.id===id);
    if(!record)return;
    document.querySelector('#admin-print-record')?.remove();
    const sheet=document.createElement('section');
    sheet.id='admin-print-record';
    sheet.innerHTML=completionPrintMarkup(record,state.students.find(p=>p.id===record.student));
    document.body.append(sheet);
    const clean=()=>{sheet.remove();window.removeEventListener('afterprint',clean);};
    window.addEventListener('afterprint',clean,{once:true});
    try{window.print();}catch(error){clean();throw error;}
  }
  function focusOverviewRecord(id){
    const detail=document.querySelector('#account-detail');
    if(!detail)return;
    const history=detail.querySelector('.portal-admin-history');
    if(history)history.open=true;
    const record=Array.from(detail.querySelectorAll('[data-record-id]')).find(node=>node.dataset.recordId===id);
    const target=record||history||detail.querySelector('.portal-account-heading')||detail;
    target.classList.add('admin-record-target');
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'start',behavior:'instant'});
  }
  function completionOverviewMarkup(){
    return '<section id="completion-overview-pane" hidden aria-label="Abgeschlossene Prüfungen und Schulungen"><div id="completion-overview-stats" class="admin-cert-overview-stats"></div><div class="admin-cert-overview-filters admin-completion-filters"><label class="admin-completion-search">Name, Fachbereich oder Referenz<input id="completion-overview-search" type="search" placeholder="Teilnehmer oder Schulung suchen" autocomplete="off"></label><label>Nachweisart<select id="completion-overview-kind"><option value="all">Alle Arten</option><option value="exam">Prüfungen</option><option value="training">Schulungen</option><option value="instruction">Unterweisungen</option></select></label><label>Ergebnis<select id="completion-overview-outcome"><option value="all">Alle Ergebnisse</option><option value="passed">Bestanden</option><option value="attended">Teilgenommen</option><option value="failed">Nicht bestanden</option></select></label><label>Durchgeführt ab<input id="completion-overview-from" type="date"></label><label>Durchgeführt bis<input id="completion-overview-to" type="date"></label></div><p class="portal-hint" id="completion-overview-count" role="status"></p><div id="completion-overview-results" class="admin-cert-overview-results"></div><p class="portal-hint">Nur von der Fahrschule bestätigte Einträge. Lern-App-Übungsrunden und zurückgezogene Einträge werden nicht berücksichtigt. Die Übersicht zählt einzelne Durchführungen, nicht eindeutige Teilnehmer.</p></section>';
  }
  function renderCompletionOverview(dialog){
    const rows=completedRecordRows(state,certRecords,!!certStatus.listUnavailable);
    const pane=dialog.querySelector('#completion-overview-pane'),value=id=>pane.querySelector('#completion-overview-'+id).value;
    const stats=[['Prüfungen bestanden',rows.filter(r=>r.kind==='exam'&&r.outcome==='passed').length],['Nicht bestanden',rows.filter(r=>r.kind==='exam'&&r.outcome==='failed').length],['Schulungen',rows.filter(r=>r.kind==='training').length],['Unterweisungen',rows.filter(r=>r.kind==='instruction').length]];
    pane.querySelector('#completion-overview-stats').innerHTML=stats.map(([label,n])=>'<div><small>'+label+'</small><strong>'+n+'</strong></div>').join('');
    const filtered=filterCompletedRecords(rows,{query:value('search'),kind:value('kind'),outcome:value('outcome'),from:value('from'),to:value('to')});
    pane.querySelector('#completion-overview-count').textContent=filtered.length+' von '+rows.length+' Einträgen · Neueste Durchführung zuerst';
    const list=pane.querySelector('#completion-overview-results');
    if(value('from')&&value('to')&&value('from')>value('to')){list.innerHTML='<p class="admin-cert-empty">Bitte einen gültigen Zeitraum auswählen.</p>';return;}
    const labels={issued:'Zertifikat ausgestellt',none:'Kein Zertifikat hinterlegt',unknown:'Zertifikatsstatus unbekannt'};
    list.innerHTML=filtered.map(r=>'<article class="admin-cert-row"><div class="admin-cert-row-main"><strong>'+safe(r.name)+'</strong><small>'+safe(r.email)+'</small><p>'+safe(r.title)+'</p><small>'+safe(M.kinds[r.kind])+' · Durchgeführt am '+safe(day(r.completedAt))+'</small><small>Referenz: '+safe(r.reference)+'</small></div><div class="admin-completion-row-actions"><span class="admin-cert-mail-status admin-record-outcome '+safe(r.outcome)+'">'+safe(M.outcomes[r.outcome])+'</span><small class="admin-completion-certificate">'+safe(labels[r.certificate])+'</small><div class="admin-completion-links">'+(r.certificate==='issued'?'<button type="button" class="secondary" data-cert-download="'+safe(r.id)+'">PDF öffnen / speichern</button>':'<button type="button" class="secondary" data-record-print="'+safe(r.id)+'">Eintrag als PDF speichern</button>')+(r.personAvailable?'<button type="button" class="primary" data-person="'+safe(r.student)+'" data-overview-record="'+safe(r.id)+'">Teilnehmer öffnen</button>':'')+'</div></div></article>').join('')||'<p class="admin-cert-empty">'+(rows.length?'Keine passenden Einträge gefunden.':'Noch keine Schulungen oder Prüfungen dokumentiert.')+'</p>';
  }
  function setCertificateOverviewMode(dialog,mode){
    if(!dialog||state.me?.role!=='admin')return;
    mode=mode==='completions'?'completions':'certificates';
    dialog.dataset.overviewMode=mode;
    for(const button of dialog.querySelectorAll('[data-overview-mode]'))button.setAttribute('aria-pressed',String(button.dataset.overviewMode===mode));
    dialog.querySelector('#certificate-overview-pane').hidden=mode!=='certificates';
    dialog.querySelector('#completion-overview-pane').hidden=mode!=='completions';
    dialog.querySelector('#cert-overview-error').textContent='';
    renderCertificateOverview();
    dialog.querySelector('.admin-cert-overview-body').scrollTop=0;
  }
  function certificateOverview(){
    if(state.me?.role!=='admin')return '';
    return '<dialog id="certificate-overview" class="admin-cert-overview" aria-labelledby="certificate-overview-title"><header class="admin-cert-overview-header"><div><span class="portal-eyebrow">Nachweisarchiv</span><h2 id="certificate-overview-title">Zertifikate &amp; Abschlüsse</h2><p>Schulungen, Prüfungen und ausgestellte Zertifikate im Überblick.</p></div><form method="dialog" id="cert-overview-dismiss" class="admin-overview-dismiss"><button type="submit" class="admin-viewer-close" data-cert-overview-close aria-label="Übersicht schließen"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></form></header><div class="admin-cert-overview-body"><div class="admin-overview-switch" role="group" aria-label="Übersichtsbereich"><button type="button" data-overview-mode="certificates" aria-pressed="true">Ausgestellte Zertifikate</button><button type="button" data-overview-mode="completions" aria-pressed="false">Prüfungen &amp; Schulungen</button></div><p class="portal-error" id="cert-overview-error" role="alert"></p><section id="certificate-overview-pane"><div id="cert-overview-stats" class="admin-cert-overview-stats"></div><div class="admin-cert-overview-filters"><label>Name, Fachbereich oder Referenz<input type="search" id="cert-overview-search" placeholder="Zertifikat suchen" autocomplete="off"></label><label>Versandstatus<select id="cert-overview-filter"><option value="all">Alle Zertifikate</option><option value="accepted">Vom Mailserver angenommen</option><option value="not_sent">Noch nicht versendet</option><option value="review">Versand prüfen</option></select></label></div><p class="portal-hint" id="cert-overview-count" role="status"></p><div id="cert-overview-results" class="admin-cert-overview-results"></div><p class="portal-hint">„Vom Mailserver angenommen“ bedeutet nicht, dass die E-Mail bereits gelesen oder im Posteingang zugestellt wurde. Zurückgezogene Nachweise werden nicht angezeigt.</p></section>'+completionOverviewMarkup()+'</div></dialog>';
  }
  function renderCertificateOverview(){
    const dialog=root.querySelector('#certificate-overview');
    if(!dialog||state.me?.role!=='admin')return;
    if(dialog.dataset.overviewMode==='completions'){renderCompletionOverview(dialog);return;}
    const stats=dialog.querySelector('#cert-overview-stats'),list=dialog.querySelector('#cert-overview-results'),count=dialog.querySelector('#cert-overview-count');
    if(certStatus.listUnavailable){
      stats.innerHTML='';list.innerHTML='<p class="admin-alert">Zertifikate konnten nicht vollständig geladen werden. Bitte die Verwaltung aktualisieren.</p>';count.textContent='';return;
    }
    const rows=issuedCertificateRows(state,certRecords);
    const accepted=rows.filter(r=>r.status==='accepted').length,open=rows.filter(r=>r.status==='not_sent').length;
    stats.innerHTML=[['Ausgestellt',rows.length],['Mail angenommen',accepted],['Nicht versendet',open],['Versand prüfen',rows.length-accepted-open]].map(([label,n])=>'<div><small>'+label+'</small><strong>'+n+'</strong></div>').join('');
    const filtered=filterIssuedCertificates(rows,dialog.querySelector('#cert-overview-search').value,dialog.querySelector('#cert-overview-filter').value);
    count.textContent=filtered.length+' von '+rows.length+' Zertifikaten';
    const issuedDate=value=>value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeZone:'Europe/Berlin'}).format(new Date(value)):'Unbekannt';
    const labels={accepted:'Vom Mailserver angenommen',not_sent:'Nicht versendet',sending:'Versand läuft',uncertain:'Versand unklar',unknown:'Status unbekannt'};
    list.innerHTML=filtered.map(r=>'<article class="admin-cert-row"><div class="admin-cert-row-main"><strong>'+safe(r.name)+'</strong><small>'+safe(r.email)+'</small><p>'+safe(r.title)+'</p><small>Ausgestellt: '+safe(issuedDate(r.issuedAt))+' · '+safe(r.reference)+'</small></div><div class="admin-cert-row-actions"><span class="admin-cert-mail-status '+safe(r.status)+'">'+safe(labels[r.status])+'</span><button type="button" class="secondary" data-cert-download="'+safe(r.id)+'">PDF öffnen / speichern</button></div></article>').join('')||'<p class="admin-cert-empty">'+(rows.length?'Keine passenden Zertifikate gefunden.':'Noch keine Zertifikate ausgestellt.')+'</p>';
  }
  const examCourses={gabelstapler:'Gabelstapler',hebebuehnen:'Hubarbeitsbühnen',krane:'Krane',lasten:'Anschlagen von Lasten',bagger:'Erdbaumaschinen & Bagger',ladungssicherung:'Ladungssicherung',abseilen:'Abseilen aus Höhen'};
  const examLabel=r=>({pending:'Bewertung offen',passed:'Bestanden',failed:'Nicht bestanden'})[r.review]||'Bewertung offen';
  const examDate=r=>new Date(r.submitted_at).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'});
  function examOverview(){
    if(!B.isStaff(state.me))return '';
    return '<dialog id="exam-overview" class="admin-cert-overview" aria-labelledby="exam-overview-title"><header class="admin-cert-overview-header"><div><span class="portal-eyebrow">Prüfungsarchiv</span><h2 id="exam-overview-title">Prüfungsergebnisse</h2><p>Alle verbindlich abgegebenen Theorieprüfungen, serverseitig ausgewertet.</p></div><form method="dialog" id="exam-overview-dismiss" class="admin-overview-dismiss"><button type="submit" class="admin-viewer-close" aria-label="Übersicht schließen">×</button></form></header><div class="admin-cert-overview-body"><div class="admin-cert-overview-filters exam-filters"><label>Teilnehmer / Referenz<input type="search" id="exam-search" placeholder="Name oder Referenz"></label><label>Fachbereich<select id="exam-course"><option value="">Alle Fachbereiche</option>'+Object.entries(examCourses).map(([id,name])=>'<option value="'+safe(id)+'">'+safe(name)+'</option>').join('')+'</select></label><label>Bewertung<select id="exam-review-filter"><option value="">Alle Ergebnisse</option><option value="pending">Bewertung offen</option><option value="passed">Bestanden</option><option value="failed">Nicht bestanden</option></select></label></div><div id="exam-stats" class="admin-cert-overview-stats"></div><p class="portal-hint">Die Fahrschule bewertet die Theorieprüfung. Eine praktische Befähigung oder ein Zertifikat wird nicht automatisch bestätigt.</p><p id="exam-error" class="portal-error" role="alert"></p><p id="exam-count" class="portal-hint" role="status"></p><div id="exam-results" class="admin-cert-overview-results"></div><div class="portal-actions"><button class="secondary" type="button" data-exam-page="-1">Zurück</button><button class="secondary" type="button" data-exam-page="1">Weitere Ergebnisse</button></div></div></dialog>';
  }
  function renderExamOverview(){
    const d=root.querySelector('#exam-overview');if(!d)return;
    const rows=d.querySelector('#exam-results'),stats=d.querySelector('#exam-stats'),count=d.querySelector('#exam-count');
    if(examError){rows.innerHTML='<p class="admin-alert">Prüfungsergebnisse konnten nicht geladen werden. Bitte Verwaltung aktualisieren.</p>';return;}
    const name=r=>r.guest_name||state.students.find(p=>p.id===r.participant_id)?.name||'Teilnehmer nicht verfügbar';
    const query=d.querySelector('#exam-search').value.trim().toLowerCase(),course=d.querySelector('#exam-course').value,review=d.querySelector('#exam-review-filter').value;
    const filtered=examRows.filter(r=>(!query||(name(r)+' '+r.id).toLowerCase().includes(query))&&(!course||r.course===course)&&(!review||r.review===review));
    stats.innerHTML=[['Abgegeben',examRows.length],['Bewertung offen',examRows.filter(r=>r.review==='pending').length],['Bestanden',examRows.filter(r=>r.review==='passed').length],['Nicht bestanden',examRows.filter(r=>r.review==='failed').length]].map(([label,n])=>'<div><small>'+label+'</small><strong>'+n+'</strong></div>').join('');
    const size=25;examPage=Math.min(Math.max(0,examPage),Math.max(0,Math.ceil(filtered.length/size)-1));
    count.textContent=filtered.length+' von '+examRows.length+' Prüfungen · Seite '+(examPage+1)+' / '+Math.max(1,Math.ceil(filtered.length/size));
    d.querySelector('[data-exam-page="-1"]').disabled=examPage===0;d.querySelector('[data-exam-page="1"]').disabled=(examPage+1)*size>=filtered.length;
    rows.innerHTML=filtered.slice(examPage*size,(examPage+1)*size).map(r=>'<article class="admin-cert-row exam-result-row"><div class="admin-cert-row-main"><strong>'+safe(name(r))+'</strong><p>'+safe(examCourses[r.course]||r.course)+' · '+r.score+' / '+r.total+' richtig ('+Math.round(r.score/r.total*100)+' %)</p><small>'+safe(examDate(r))+' · '+safe(r.id.slice(0,8).toUpperCase())+' · Sprache '+safe(r.language)+'</small><p><strong>'+safe(examLabel(r))+'</strong></p></div><div class="admin-cert-row-actions"><button class="secondary" type="button" data-exam-detail="'+safe(r.id)+'">Antworten ansehen</button><label>Bewertung<select data-exam-review="'+safe(r.id)+'"><option value="pending" '+(r.review==='pending'?'selected':'')+'>Offen</option><option value="passed" '+(r.review==='passed'?'selected':'')+'>Bestanden</option><option value="failed" '+(r.review==='failed'?'selected':'')+'>Nicht bestanden</option></select></label></div><div class="exam-answer-details portal-wide" data-exam-answers="'+safe(r.id)+'" hidden></div></article>').join('')||'<p class="admin-cert-empty">Keine passenden abgegebenen Prüfungen.</p>';
  }
  async function openExamAnswers(button){
    const id=button.dataset.examDetail,target=button.closest('.exam-result-row')?.querySelector('[data-exam-answers]');if(!target)return;
    if(!target.hidden){target.hidden=true;return;}target.hidden=false;target.textContent='Antworten werden geladen …';button.disabled=true;
    try{
      const r=await B.examDetail(id);
      target.innerHTML=(r.details||[]).map((q,i)=>'<div class="portal-record"><strong>'+String(i+1)+'. '+safe(q.title)+'</strong><p>'+safe(q.context||'')+'</p><p>Antwort: '+safe(Number.isInteger(q.selected)?q.answers[q.selected]:'Nicht beantwortet')+'</p><p>Richtige Antwort laut Fragenkatalog: '+safe(q.answers[q.correct])+'</p><small>'+ (q.correct===q.selected?'Richtig':'Falsch / offen')+'</small></div>').join('')||'<p>Keine Antwortdetails vorhanden.</p>';
    }catch{target.textContent='Antworten konnten nicht geladen werden.';}finally{button.disabled=false;}
  }
  function admin(){
    rememberPaymentOverview();
    certificateDraft=null;certificatePreviewReady=false;previewSequence++;
    root.innerHTML=`<section class="portal-admin-heading"><div><span class="portal-eyebrow">Abbate Lernraum</span><h1>Teilnehmerverwaltung</h1><p class="admin-sr-only">Schulungen und Prüfungsergebnisse</p></div><div class="admin-toolbar"><button type="button" class="secondary" data-refresh aria-label="Konten aktualisieren">Aktualisieren</button><button type="button" class="secondary admin-cert-overview-trigger" data-exam-overview-open aria-haspopup="dialog">Prüfungsergebnisse (${examError?'–':examRows.length})</button>${state.me.role==='admin'?'<button type="button" class="secondary admin-cert-overview-trigger" data-cert-overview-open aria-haspopup="dialog">Zertifikate &amp; Abschlüsse</button><button type="button" class="secondary admin-cert-overview-trigger" data-payment-overview-open aria-haspopup="dialog">Zahlungen</button>':''}<details class="admin-tools"><summary>Einstellungen</summary><div class="admin-tools-content">${signaturePanel()}<details class="portal-qr"><summary>QR-Code für alle Karten</summary><p>Der QR-Code führt zur Anmeldeseite und kann auf allen Schülerkarten verwendet werden.</p><canvas id="portal-qr" aria-label="Gemeinsamer Karten-QR-Code" style="image-rendering:pixelated"></canvas><p class="portal-hint">Der QR-Code enthält keine personenbezogenen Daten.</p><a class="portal-text" href="${AbbateCardQR.target}" target="_blank" rel="noopener noreferrer">Anmeldeseite öffnen ↗</a><button class="secondary" id="download-qr" type="button" disabled>PNG (Druckqualität) herunterladen</button><button class="secondary" id="download-qr-svg" type="button" disabled>SVG (Vektorformat) herunterladen</button></details><a class="portal-text" href="./konto.html#einstellungen">Mein Konto</a><button class="portal-text" data-logout>Abmelden</button></div></details></div></section><section class="portal-stats" aria-label="Kontenübersicht">${accountStats()}</section>${annualOverview()}<div class="portal-admin-layout"><aside class="portal-sidebar" id="account-picker"><button type="button" id="account-picker-toggle" class="portal-picker-toggle" aria-expanded="false" aria-controls="account-picker-panel">${pickerLabel()}</button><div id="account-picker-panel" class="portal-picker-panel"><h2 class="admin-list-heading">Teilnehmer</h2><label class="admin-sr-only" for="account-search">Konten suchen</label><input id="account-search" type="search" name="abbate-directory-query" autocomplete="off" autocapitalize="none" spellcheck="false" data-lpignore="true" data-1p-ignore placeholder="Teilnehmer suchen" value="${safe(search)}"><label class="admin-sr-only" for="account-filter">Zugangsstatus</label><select id="account-filter"><option value="all">Alle Konten</option><option value="pending">Wartet auf Freischaltung</option><option value="active">Aktiviert</option><option value="inactive">Inaktiv (alle)</option><option value="paused">Pausiert</option><option value="expired">Abgelaufen</option><option value="payment:open">Zahlung offen</option><option value="payment:reported">Zahlung gemeldet</option><option value="payment:confirmed">Zahlung bestätigt</option></select><div id="account-list" class="portal-people">${peopleList()}</div><a href="./konto.html#registrieren" class="portal-text">Registrierungsseite öffnen ↗</a></div></aside><div id="account-detail" class="portal-detail" tabindex="-1">${detail()}</div></div>${certificateOverview()}${examOverview()}${paymentDialog()}`;
    document.querySelector('#account-filter').value=filter;
    const canvas=document.querySelector('#portal-qr');
    AbbateCardQR.render(canvas).then(()=>{
      document.querySelector('#download-qr').disabled=false;
      document.querySelector('#download-qr-svg').disabled=false;
    }).catch(()=>{
      canvas.hidden=true;
      notice('QR-Code konnte nicht erstellt werden. Bitte die Seite aktualisieren.');
    });
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
  let recoveryMode = false, passwordResetCompleted = false;
  function passwordResetSuccess(){
    root.innerHTML=`<section class="portal-empty portal-reset-success" role="status"><span class="portal-reset-success-icon" aria-hidden="true">✓</span><span class="portal-eyebrow">Passwort erfolgreich geändert</span><h1>Dein neues Passwort ist gespeichert.</h1><p>Du kannst dich jetzt mit deinem neuen Passwort bei Abbate Lernraum anmelden.</p><a class="primary" href="./konto.html">Jetzt anmelden ↗</a></section>`;
  }
  function invalidResetLink(){
    root.innerHTML=`<section class="portal-empty"><span class="portal-eyebrow">Dein Zugang</span><h1>Dieser Link ist nicht mehr gültig.</h1><p>Der Link wurde möglicherweise bereits verwendet oder ist abgelaufen. Fordere bitte einen neuen Link an, um dein Passwort sicher zurückzusetzen.</p><a class="primary" href="./konto.html?reset=neu#passwort">Neuen Link anfordern</a><a class="portal-text" href="./konto.html">Zur Anmeldung</a></section>`;
  }
  async function render(){
    root.setAttribute('aria-busy','true');
    try{
      // Handle auth callbacks BEFORE resolving profiles or performing signed-in redirects.
      // A replayed/expired recovery link must never fall through to the account page,
      // even when the browser still holds a perfectly valid prior session.
      // A successful password update must win over the old one-time recovery token.
      // SIGNED_OUT may fire before location.replace and trigger another render.
      if(view==='login' && (passwordResetCompleted || (location.hash==='#passwort-gesetzt'&&!failedAuthLink))){
        passwordResetSuccess();return;
      }
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
        if(!state.students.some(p=>p.id===selected&&p.id!==state.me.id))selected=state.students.find(p=>p.role==='learner'&&p.access==='pending')?.id||state.students.find(p=>p.id!==state.me.id)?.id||null;
        admin();
      }else if(view==='login'){
        if(location.hash==='#passwort'){recovery();return;}
        if(state.me){if(!(await B.termsAccepted())){termsGate();return;}if(location.search==='?next=verwaltung'){location.replace('./verwaltung.html');return;}if(location.hash==='#einstellungen'){settings();return;}location.replace('./nachweise.html');return;}
        if(registrationSuccessEmail){registrationComplete(registrationSuccessEmail);return;}
        login();
      }else reader();
    }catch(error){failure(error);}finally{syncShell();root.removeAttribute('aria-busy');}
  }
  async function mutate(work,success){await work();await load();if(view==='admin')admin();else reader();notice(success);}
  root.addEventListener('submit',async event=>{
    const form=event.target;
    // Preserve the browser's native dialog dismissal; it must never enter mutation handling.
    if(['cert-overview-dismiss','exam-overview-dismiss','payment-overview-dismiss'].includes(form.id)&&form.method==='dialog')return;
    event.preventDefault();if(form.dataset.busy)return;
    const values=Object.fromEntries(new FormData(form));form.dataset.busy='true';form.setAttribute('aria-busy','true');
    const submit=event.submitter;if(submit)submit.disabled=true;
    if(form.id==='certificate-form'&&(!submit||submit.value==='preview'))form.querySelector('#certificate-preview')?.setAttribute('data-abbate-update-block','');
    try{
      let result;
      if(form.id==='terms-form'){if(values.termsAccepted!=='yes')throw Error('Bitte akzeptiere die AGB.');await B.acceptTerms();await render();return;}
      if(form.id==='login-form'){
        result=await B.client.auth.signInWithPassword({email:values.email.trim(),password:values.password});if(result.error)throw result.error;
        location.replace(location.search==='?next=verwaltung'?'./verwaltung.html':'./nachweise.html');return;
      }
      if(form.id==='register-form'){
        if(values.termsAccepted!=='yes')throw Error('Bitte akzeptiere die AGB vor der Registrierung.');
        result=await B.client.auth.signUp({email:values.email.trim(),password:values.password,options:{data:{display_name:values.name.trim(),company:(values.company||'').trim(),abbate_terms_version:'2026-11-02',abbate_terms_accepted:true},emailRedirectTo:globalThis.ABBATE_CONFIG.portalUrl}});if(result.error)throw result.error;
        if(result.data?.session){location.replace('./nachweise.html');return;}
        registrationSuccessEmail=values.email.trim();
        registrationComplete(registrationSuccessEmail);
        return;
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
          passwordResetCompleted=true;
          passwordResetSuccess();
          // Password recovery invalidates existing refresh sessions across devices.
          // The learner must authenticate again with the new password.
          const signOutResult=await B.client.auth.signOut({scope:'global'});
          if(signOutResult.error)throw signOutResult.error;
          location.replace('./konto.html#passwort-gesetzt');
          return;
        }
        location.hash='einstellungen';await render();notice('Dein neues Passwort ist gespeichert.');return;
      }
      if(form.id==='self-company-form'){
        if(state?.me?.role!=='learner')throw Error('Teilnehmerkonto erforderlich.');
        await B.setCompany(state.me.id,values.company||'');
        await render();notice('Firma gespeichert.');return;
      }
      if(form.id==='self-delete-form'){await B.deleteAccount(state.me.id,values.password);location.replace('./konto.html#konto-geloescht');return;}
      if(!B.isStaff(state.me))throw Error('Staff access required');
      if(form.id==='admin-company-form'){
        if(state.me?.role!=='admin'||!selected)throw Error('Administrator access required');
        await mutate(()=>B.setCompany(selected,values.company||''),'Firma gespeichert.');
      }
      else if(form.id==='access-form')await mutate(()=>B.setAccess(selected,submit?.value||'activate'),'Zugangsstatus auf dem Server gespeichert.');
      else if(form.id==='role-form'){
        if(values.roleConfirmed!=='yes')throw Error('Rollenänderung muss bestätigt werden.');
        if(!canManageRoles()||!selected||selected===state.me.id)throw Error('Administrator access required');
        const newRole=submit?.value;
        if(!['admin','learner'].includes(newRole))throw Error('Ungültige Rollenänderung.');
        await mutate(()=>B.setRole(selected,newRole),newRole==='admin'?'Administratorrechte vergeben.':'Administratorrechte entzogen.');
      }
      else if(form.id==='signature-form'){
        if(state.me.role!=='admin'||values.authorized!=='yes')throw Error('Administratorfreigabe erforderlich.');
        const file=form.elements.signature.files[0];
        if(!file||file.type!=='image/png'||file.size>1048576)throw Error('Bitte PNG bis 1 MB auswählen.');
        const bytes=new Uint8Array(await file.arrayBuffer());let binary='';
        for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
        await certCall({action:'signature',school:state.me.school,confirmed:true,png:btoa(binary)});
        await load();admin();notice('Unterschrift geschützt gespeichert.');
      }
      else if(form.id==='certificate-form'){
        const C=globalThis.ABBATE_CERTIFICATES;
        const person=state.students.find(p=>p.id===selected);
        const drafts=C.prepareSelection(person,values);
        const draft=drafts.length===1?drafts[0]:{...drafts[0],additional:drafts.slice(1)};
        if(drafts.some(d=>d.examType==='practice')&&(state.me.role!=='admin'||!certStatus.practiceV1))throw Error('Praxisnachweise erfordern Administratorrechte.');
        if(!['save','issue'].includes(submit?.value)){await showCertificate(form,draft);return;}
        if(certificateDraft!==JSON.stringify(draft)||values.certificateConfirmed!=='yes')throw Error('Bitte die aktuelle Vorschau und den tatsächlichen Abschluss ausdrücklich bestätigen.');
        const issuing=submit.value==='issue';
        if(draft.template&&!issuing)throw Error('Bitte diesen Nachweis direkt als PDF ausstellen.');
        if(issuing&&(state.me.role!=='admin'||!certStatus.signatureReady||!certificatePreviewReady))throw Error('Ausstellung noch nicht freigegeben.');
        if(issuing&&draft.notification==='email'&&!certStatus.mailReady)throw Error('E-Mail-Versand nicht eingerichtet.');
        if(issuing&&!confirm('Zertifikat für '+draft.name+' ausstellen'+(draft.notification==='email'?' und an '+draft.email+' senden':'')+'?'))return;
        if(drafts.length>1){
          const completed=[],problems=[];
          for(const item of drafts){
            try{
              const existing=M.recordsFor(state,selected).find(r=>!r.revokedAt&&r.kind===item.kind&&r.outcome===item.outcome&&r.title===item.title&&r.completedAt===item.completedAt);
              M.addCompletion({students:state.students,completions:[],audit:[]},item,uuid());
              const id=existing?.id||await B.addCompletion(item);
              if(issuing){const result=await certCall({action:'issue',completionId:id,confirmed:true});completed.push({id,mailStatus:result.mailStatus});}
              else completed.push({id});
            }catch(e){problems.push(item.title+': '+e.message);}
          }
          let msg=issuing?completed.length+' von 2 Zertifikaten ausgestellt.':completed.length+' von 2 Nachweisen gespeichert.';
          if(issuing&&draft.notification==='email'&&completed.length===2){
            try{const sent=await certCall({action:'mail_batch',completionIds:completed.map(x=>x.id),confirmed:true,email:draft.email,alternateRecipient:draft.alternateRecipient===true});msg+=' '+mailLabel(sent.mailStatus);}
            catch(e){problems.push('Gemeinsamer Versand: '+e.message);}
          }else if(issuing&&draft.notification==='email')msg+=' Kein gemeinsamer Versand; bitte fehlenden Nachweis prüfen.';
          if(problems.length)msg+=' '+problems.join(' ');
          await load();admin();notice(msg);certificateDraft=null;return;
        }
        const existing=M.recordsFor(state,selected).find(r=>!r.revokedAt&&r.kind===draft.kind&&r.outcome===draft.outcome&&r.title===draft.title&&r.completedAt===draft.completedAt);
        if(existing&&!issuing)throw Error('Dieser Nachweis ist bereits im Schulungspass gespeichert.');
        if(draft.template&&existing&&certRecords.has(existing.id))throw Error('Dieses Zertifikat ist bereits ausgestellt. Bitte das bestehende PDF öffnen; für eine Korrektur muss der alte Nachweis widerrufen werden.');
        M.addCompletion({students:state.students,completions:[],audit:[]},draft,uuid());
        const id=existing?.id||await B.addCompletion(draft);
        if(!issuing){await load();admin();notice('Nachweis gespeichert. Keine E-Mail versendet.');return;}
        let msg;
        try{
          const result=await certCall({action:'issue',completionId:id,confirmed:true,...(draft.template?{template:draft.template,details:draft.details,theory:draft.theory,practice:draft.practice}:{})});
          msg='Zertifikat ausgestellt. '+mailLabel(result.mailStatus);
          if(draft.notification==='email'){const sent=await certCall({action:'mail',completionId:id,confirmed:true,email:draft.email,alternateRecipient:draft.alternateRecipient===true});msg='Zertifikat ausgestellt. '+mailLabel(sent.mailStatus);}
        }catch(e){msg='Nachweis gespeichert. Zertifikatsaktion: '+e.message;}
        await load();admin();notice(msg);certificateDraft=null;
      }
      else if(form.id==='record-form'){
        if(values.kind==='annual_instruction'){
          values.kind='instruction';
          const subject=values.title.trim();
          values.title=/^Jährliche Unterweisung(?:\s|$)/i.test(subject)?subject:'Jährliche Unterweisung · '+subject;
        }
        M.addCompletion({students:state.students,completions:[],audit:[]},{...values,student:selected},uuid());
        await mutate(()=>B.addCompletion({...values,student:selected}),'Durchführung und Ergebnis gespeichert. Der Teilnehmer sieht den Eintrag in seinem Schulungspass.');
      }
    }catch(error){const msg=B.message(error);const el=form.querySelector('[role="alert"]');if(el)el.textContent=msg;notice(msg);}
    finally{delete form.dataset.busy;form.removeAttribute('aria-busy');if(submit)submit.disabled=form.id==='certificate-form'&&submit.value==='issue'&&!certificatePreviewReady;}
  });
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&event.target.closest('#account-picker')&&window.matchMedia('(max-width:700px)').matches){
      event.preventDefault();setPickerOpen(false,true);
    }
  });
  root.addEventListener('input',event=>{if(event.target.name==='recipientEmail'&&event.target.closest('#certificate-form')){invalidateCertificatePreview(event.target.closest('#certificate-form'));return;}if(view==='admin'&&state?.me?.role==='admin'&&event.target.id==='payment-overview-search'){paymentQuery=event.target.value;refreshPaymentOverview();return;}if(event.target.id==='exam-search'){examPage=0;renderExamOverview();return;}if(['cert-overview-search','completion-overview-search'].includes(event.target.id)){renderCertificateOverview();return;}if(view==='admin'&&event.target.id==='account-search'){const input=event.target;let autofilled=false;try{autofilled=input.matches?.(':autofill')===true;}catch{}if(autofilled||('activeElement' in document&&document.activeElement!==input)){input.value=search;return;}search=input.value;document.querySelector('#account-list').innerHTML=peopleList();}});
  root.addEventListener('change',async event=>{
    if(view!=='admin'||!B.isStaff(state.me))return;
    if(['exam-course','exam-review-filter'].includes(event.target.id)){examPage=0;renderExamOverview();return;}
    if(event.target.matches('[data-exam-review]')){const el=event.target,r=examRows.find(r=>r.id===el.dataset.examReview);if(!r)return;const next=el.value;if(!confirm('Bewertung wirklich auf „'+({passed:'Bestanden',failed:'Nicht bestanden',pending:'Offen'})[next]+'“ setzen?')){el.value=r.review;return;}el.disabled=true;try{const updated=await B.reviewExam(r.id,next);examRows=examRows.map(x=>x.id===r.id?updated:x);renderExamOverview();}catch{el.value=r.review;root.querySelector('#exam-error').textContent='Bewertung konnte nicht gespeichert werden.';}finally{el.disabled=false;}return;}
    if(['cert-overview-filter','completion-overview-kind','completion-overview-outcome','completion-overview-from','completion-overview-to'].includes(event.target.id)){renderCertificateOverview();return;}
    if(event.target.closest('#certificate-form')&&['course','field','completedAt','notification','recipientEmail','proofType','birthDate','birthPlace','company','location','department','theoryConfirmed','practiceConfirmed','examTheory','examPractice'].includes(event.target.name)){
      const current=event.target.closest('#certificate-form');
      if(event.target.name==='course'){current.elements.examTheory.checked=true;current.elements.examPractice.checked=false;}
      syncSpecialCertificate(current);
      const mail=current.elements.notification.value==='email';
      current.querySelector('[data-certificate-recipient]').hidden=!mail;
      current.elements.recipientEmail.disabled=!mail;
      current.elements.recipientEmail.required=mail;
      const annual=current.elements.course.value==='jaehrliche-unterweisung';
      current.querySelector('[data-annual-field]').hidden=!annual;
      current.elements.field.disabled=!annual;current.elements.field.required=annual;
      if(!annual)current.elements.field.value='';
      const values=Object.fromEntries(new FormData(current));
      try{const ds=globalThis.ABBATE_CERTIFICATES.prepareSelection(state.students.find(p=>p.id===selected),values);if(certificateDraft===JSON.stringify(ds.length===1?ds[0]:{...ds[0],additional:ds.slice(1)}))return;}catch{}
      invalidateCertificatePreview(current);
      return;
    }
    if(event.target.matches('[data-result]')){
      event.target.disabled=true;
      try{await B.updateRecord(event.target.dataset.result,{outcome:event.target.value});await load();renderDetail();notice('Ergebnis korrigiert. Die Änderung ist auf dem Server protokolliert.');}
      catch(error){notice(B.message(error));event.target.disabled=false;await load();renderDetail();}return;
    }
    if(event.target.id==='account-filter'){filter=event.target.value;document.querySelector('#account-list').innerHTML=peopleList();syncAccountStats();}
    if(event.target.id==='record-kind'){const title=document.querySelector('#record-form [name="title"]');title.maxLength=event.target.value==='annual_instruction'?176:200;const outcome=document.querySelector('#record-outcome');outcome.querySelector('[value="attended"]').disabled=event.target.value==='exam';if(event.target.value==='exam'&&outcome.value==='attended')outcome.value='passed';}
  });
  root.addEventListener('click',async event=>{
    const stat=event.target.closest('[data-account-stat]');
    if(stat&&view==='admin'&&B.isStaff(state?.me)){selectAccountStat(stat.dataset.accountStat);return;}
    if(event.target.closest('[data-payment-overview-open]')){
      if(view==='admin'&&state?.me?.role==='admin'){
        const d=root.querySelector('#payment-overview-dialog');
        if(d&&!d.open)d.showModal();
      }
      return;
    }
    if(event.target.closest('[data-exam-overview-open]')){if(view==='admin'&&B.isStaff(state.me)){const d=root.querySelector('#exam-overview');if(d&&!d.open){examPage=0;try{examRows=await B.listExams();examError=false;}catch{examError=true;}renderExamOverview();d.showModal();}}return;}
    const examDetailButton=event.target.closest('[data-exam-detail]');if(examDetailButton&&B.isStaff(state?.me)){await openExamAnswers(examDetailButton);return;}
    const examPageButton=event.target.closest('[data-exam-page]');if(examPageButton){examPage+=Number(examPageButton.dataset.examPage);renderExamOverview();return;}
    if(event.target.closest('[data-cert-overview-open]')){if(view==='admin'&&state.me?.role==='admin'){const d=root.querySelector('#certificate-overview');if(d&&!d.open){setCertificateOverviewMode(d,d.dataset.overviewMode||'certificates');d.showModal();}}return;}
    const overviewMode=event.target.closest('button[data-overview-mode]');if(overviewMode){setCertificateOverviewMode(overviewMode.closest('#certificate-overview'),overviewMode.dataset.overviewMode);return;}
    if(event.target.closest('[data-cert-overview-close]'))return; // Native method=dialog form handles dismissal.
    const viewerMode=event.target.closest('[data-cert-viewer-mode]');
    if(viewerMode){const page=viewerMode.closest('dialog')?.querySelector('.admin-viewer-page');if(page){page.dataset.mode=page.dataset.mode==='reading'?'original':'reading';viewerMode.textContent=page.dataset.mode==='reading'?'Original-PDF':'Leseansicht';page.scrollTop=0;}return;}
    const viewerClose=event.target.closest('[data-cert-viewer-close]');
    if(viewerClose){const dialog=viewerClose.closest('dialog'),trigger=dialog?.closest('#certificate-preview')?.querySelector('[data-cert-viewer-open]');dialog?.close();trigger?.focus({preventScroll:true});return;}
    const viewerOpen=event.target.closest('[data-cert-viewer-open]');
    if(viewerOpen){if(view==='admin'&&B.isStaff(state?.me))openCertificateViewer(viewerOpen.closest('#certificate-preview'),viewerOpen);return;}
    const paymentButton=event.target.closest('[data-payment-action]');
    if(paymentButton){
      const action=paymentButton.dataset.paymentAction,participant=paymentButton.dataset.paymentPerson;
      if(!['report','confirm','reopen'].includes(action))return;
      if(action==='report'&&(participant!==state?.me?.id||state.me.role!=='learner'))return;
      if(action!=='report'&&(view!=='admin'||state?.me?.role!=='admin'))return;
      const question={report:'Hast du die Zahlung bereits durchgeführt? Die Fahrschule wird den Geldeingang prüfen.',
        confirm:'Ist die Zahlung auf dem Konto oder bar eingegangen? Diese Bestätigung ist verbindlich.',
        reopen:'Zahlungsbestätigung wirklich zurücksetzen? Die Änderung wird protokolliert.'};
      if(!confirm(question[action]))return;
      paymentButton.disabled=true;
      try{
        const modalOpen=!!root.querySelector('#payment-overview-dialog')?.open;
        await B.setPayment(participant,action);
        await load();
        if(view==='admin'){
          admin();
          if(modalOpen)root.querySelector('#payment-overview-dialog')?.showModal();
        }else reader();
        notice(({report:'Zahlung gemeldet. Die Fahrschule prüft den Eingang.',confirm:'Zahlung bestätigt und gespeichert.',reopen:'Zahlungsstatus zurückgesetzt.'})[action]);
      }catch(error){notice(B.message(error));paymentButton.disabled=false;}
      return;
    }
    const paymentPerson=event.target.closest('[data-payment-open]');
    if(paymentPerson){
      if(view!=='admin'||state?.me?.role!=='admin')return;
      const id=paymentPerson.dataset.paymentOpen;
      if(!state.students.some(p=>p.id===id&&p.role==='learner'))return;
      const dialog=root.querySelector('#payment-overview-dialog');
      if(dialog?.open)dialog.close();
      selected=id;search='';filter='all';
      const searchInput=root.querySelector('#account-search'),accessFilter=root.querySelector('#account-filter');
      if(searchInput)searchInput.value='';
      if(accessFilter)accessFilter.value='all';syncAccountStats();
      root.querySelector('#account-list').innerHTML=peopleList();
      root.querySelector('#account-picker-toggle').innerHTML=pickerLabel();
      renderDetail();
      if(window.matchMedia('(max-width:700px)').matches)setPickerOpen(false);
      const target=root.querySelector('#account-detail');
      target?.scrollIntoView?.({behavior:'smooth',block:'start'});
      target?.focus?.({preventScroll:true});
      return;
    }
    if(event.target.closest('[data-refresh]')){await render();return;}
    if(event.target.closest('[data-resend-confirmation]')){await resendConfirmation();return;}
    if(event.target.closest('[data-recovery]')){location.hash='passwort';recovery();return;}
    if(event.target.closest('[data-logout]')){await B.client.auth.signOut({scope:'local'});location.replace('./konto.html');return;}
    const printButton=event.target.closest('[data-record-print]');
    if(printButton){try{printCompletionRecord(printButton.dataset.recordPrint);}catch(e){const error=printButton.closest('#certificate-overview')?.querySelector('#cert-overview-error');if(error)error.textContent='Druckansicht konnte nicht geöffnet werden.';}return;}
    const certButton=event.target.closest('[data-cert-download],[data-cert-issue],[data-cert-mail]');
    if(certButton){
      const id=certButton.dataset.certDownload||certButton.dataset.certIssue||certButton.dataset.certMail;
      const record=state.completions.find(r=>r.id===id);if(!record)return;
      const action=certButton.dataset.certDownload?'download':certButton.dataset.certIssue?'issue':'mail';
      if(action!=='download'&&(view!=='admin'||state.me.role!=='admin'))return;
      const person=state.students.find(p=>p.id===record.student);
      if(action!=='download'&&(!person||!confirm(action==='mail'?'Zertifikat an '+person.email+' versenden?':(annualRecord(record)?'Teilnahme an der jährlichen Unterweisung für ':'Bestandene Theorieprüfung für ')+person.name+' bestätigen und Zertifikat ausstellen?')))return;
      certButton.disabled=true;
      try{const data=await certCall({action,completionId:id,confirmed:true,email:person?.email});if(action==='download')downloadCertificate(data);else{await load();admin();notice(action==='mail'?mailLabel(data.mailStatus):'Zertifikat ausgestellt.');}}
      catch(e){const error=certButton.closest('#certificate-overview')?.querySelector('#cert-overview-error');if(error)error.textContent=e.message;else notice(e.message);}finally{certButton.disabled=false;}
      return;
    }
    if(view!=='admin'||!B.isStaff(state?.me))return;
    const disclosure=event.target.closest('[data-admin-disclosure]');
    if(disclosure){
      const open=disclosure.getAttribute('aria-expanded')!=='true';
      disclosure.setAttribute('aria-expanded',String(open));
      document.getElementById(disclosure.dataset.adminDisclosure)?.classList.toggle('is-open',open);
      const mark=disclosure.querySelector('.portal-disclosure-mark');if(mark)mark.textContent=open?'−':'+';
      return;
    }
    const pickerToggle=event.target.closest('#account-picker-toggle');
    if(pickerToggle){setPickerOpen(pickerToggle.getAttribute('aria-expanded')!=='true',true);return;}
    const person=event.target.closest('[data-person]');if(person){
      const archiveRecord=person.dataset.overviewRecord;
      event.target.closest('#certificate-overview')?.close();
      selected=person.dataset.person;
      if(archiveRecord){
        search='';filter='all';
        const input=document.querySelector('#account-search'),status=document.querySelector('#account-filter');
        if(input)input.value='';if(status)status.value='all';syncAccountStats();
      }
      document.querySelector('#account-list').innerHTML=peopleList();
      document.querySelector('#account-picker-toggle').innerHTML=pickerLabel();
      renderDetail();
      if(archiveRecord){
        setPickerOpen(false,false);
        const participant=selected;
        requestAnimationFrame(()=>{if(selected===participant)focusOverviewRecord(archiveRecord);});
      }else if(window.matchMedia('(max-width:700px)').matches)setPickerOpen(false,true);
      else document.querySelector('#account-list [data-person][aria-pressed="true"]')?.focus({preventScroll:true});
      return;
    }
    const qrButton=event.target.closest('#download-qr, #download-qr-svg');
    if(qrButton){
      if(qrButton.disabled)return;
      qrButton.disabled=true;
      try{
        if(qrButton.id==='download-qr-svg')await AbbateCardQR.downloadSvg();
        else await AbbateCardQR.downloadPng();
        notice('QR-Code als druckfähige Datei gespeichert. Bitte einmal mit dem Handy testen.');
      }catch(error){notice('QR-Code-Download fehlgeschlagen: '+error.message);}
      finally{qrButton.disabled=false;}
      return;
    }
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
    if(event==='PASSWORD_RECOVERY' && !failedAuthLink && !passwordResetCompleted && view==='login'){
      recoveryMode=true;
      setTimeout(render,0);
    }
    if(event==='SIGNED_OUT'&&!passwordResetCompleted)setTimeout(render,0);
  });
  addEventListener('hashchange',()=>{if(view==='login')render();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&view!=='admin')render();});
  setInterval(()=>{if(!document.hidden&&view==='reader')render();},30000);
  if(location.hash==='#konto-geloescht')notice('Dein Konto und die zugehörigen Daten wurden gelöscht.');
  if(location.hash==='#passwort-gesetzt')notice('Dein Passwort wurde geändert. Bitte melde dich mit deinem neuen Passwort an.');
  // Refresh dates and rendered account records after a language change without affecting credentials.
  addEventListener('abbate:language-change',()=>{if(view==='reader'||(view==='admin'&&!document.querySelector('#certificate-preview[data-abbate-update-block]')))render();});
  render();
})();
