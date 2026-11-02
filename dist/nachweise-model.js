'use strict';
(function(root) {
  const records = [
    { id:'demo-grundausbildung', ownerId:'demo-a', title:'Gabelstapler · Grundausbildung', kind:'Schulung', completedAt:'2026-09-18', reminderDue:null, issuer:'Fahrschule Abbate · Beispieldaten', reference:'DEMO-2026-001', state:'confirmed' },
    { id:'demo-pruefung', ownerId:'demo-a', title:'Gabelstapler · Abschlussprüfung', kind:'Prüfung', completedAt:'2026-09-18', reminderDue:null, issuer:'Fahrschule Abbate · Beispieldaten', reference:'DEMO-2026-002', state:'confirmed' },
    { id:'demo-unterweisung', ownerId:'demo-a', title:'Unterweisung · Sicherer Betrieb', kind:'Unterweisung', completedAt:'2026-10-15', reminderDue:'2027-10-15', issuer:'Fahrschule Abbate · Beispieldaten', reference:'DEMO-2026-003', state:'confirmed' },
    { id:'demo-andere-person', ownerId:'demo-b', title:'Andere Person', kind:'Schulung', completedAt:'2026-10-01', state:'confirmed' },
    { id:'demo-widerrufen', ownerId:'demo-a', title:'Ersetzter Beispieldatensatz', kind:'Schulung', completedAt:'2026-08-01', issuer:'Fahrschule Abbate · Beispieldaten', reference:'DEMO-2026-000', state:'revoked' }
  ];
  function ownRecords(ownerId) { return records.filter(r=>r.ownerId===ownerId).slice().sort((a,b)=>b.completedAt.localeCompare(a.completedAt)); }
  function candidates(ownerId) { return ownRecords(ownerId).filter(r=>r.state==='confirmed'); }
  function selection(ownerId, ids) {
    if(!Array.isArray(ids) || !ids.length) throw Error('Wähle mindestens einen bestätigten Abschluss aus.');
    const unique=[...new Set(ids)], allowed=new Map(candidates(ownerId).map(r=>[r.id,r]));
    if(unique.some(id=>!allowed.has(id))) throw Error('Dieser Abschluss kann nicht freigegeben werden.');
    return unique.map(id=>allowed.get(id));
  }
  function resolveShare(shares, token, now=Date.now()) {
    if(!/^[a-f0-9]{64}$/.test(token||'')) return null;
    const share=shares.find(s=>s.token===token);
    if(!share || share.revokedAt || !Number.isFinite(Date.parse(share.expiresAt)) || Date.parse(share.expiresAt)<=now) return null;
    try {
      const rows=selection(share.ownerId,share.completionIds);
      // Explicit allowlist: the verifier never receives notes, scores, email or full history.
      return { expiresAt:share.expiresAt, person:'Beispielteilnehmer A', records:rows.map(r=>({title:r.title,kind:r.kind,completedAt:r.completedAt,issuer:r.issuer,reference:r.reference})) };
    } catch { return null; }
  }
  const api={ownRecords,candidates,selection,resolveShare};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  root.ABBATE_PASS=api;
})(globalThis);
