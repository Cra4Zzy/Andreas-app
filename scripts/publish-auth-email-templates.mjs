#!/usr/bin/env node
// Publishes Abbate transactional email templates to Supabase via the Management API.
// Run locally with SUPABASE_ACCESS_TOKEN set. No credential is stored in this repository.
import { readFile } from 'node:fs/promises';

const projectRef = process.env.SUPABASE_PROJECT_REF || 'qyizzwqrruwojtriqfuc';
const apply = process.argv.includes('--apply');
const token = process.env.SUPABASE_ACCESS_TOKEN;
const templates = [
  ['emails/confirm-signup.html', 'mailer_subjects_confirmation', 'mailer_templates_confirmation_content', 'Bestätige deine E-Mail-Adresse | Abbate Lernraum'],
  ['emails/reset-password.html', 'mailer_subjects_recovery', 'mailer_templates_recovery_content', 'Passwort zurücksetzen | Abbate Lernraum'],
];
if (!/^[a-z0-9]{20}$/.test(projectRef)) throw new Error('Ungültige Supabase-Projektreferenz.');
const patch = {};
for (const [file, subjectKey, contentKey, subject] of templates) {
  const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
  if (!html.includes('{{ .ConfirmationURL }}') || !html.includes('<!doctype html>') || html.includes('<script')) {
    throw new Error('HTML-Vorlage ungültig: ' + file);
  }
  patch[subjectKey] = subject;
  patch[contentKey] = html;
}
console.log('Validiert: Confirm signup und Reset password. Projekt:', projectRef);
if (!apply) {
  console.log('Dry-run: keine Änderungen. Für die produktive Veröffentlichung --apply verwenden.');
  process.exit(0);
}
if (!token) throw new Error('SUPABASE_ACCESS_TOKEN fehlt. Bitte nur lokal setzen.');
const url = 'https://api.supabase.com/v1/projects/' + projectRef + '/config/auth';
const headers = {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'};
const send = async (method, body) => {
  const res = await fetch(url, {method, headers, ...(body ? {body:JSON.stringify(body)} : {})});
  if (!res.ok) throw new Error('Supabase Management API ' + method + ' fehlgeschlagen (HTTP ' + res.status + ').');
  return await res.json();
};
const before = await send('GET');
for (const key of Object.keys(patch)) if (!(key in before)) {
  throw new Error('Konfigurationsschlüssel nicht erkannt: ' + key + '. Veröffentlichung gestoppt.');
}
await send('PATCH', patch);
const after = await send('GET');
const mismatches = Object.entries(patch).filter(([key, value]) => after[key] !== value).map(([key]) => key);
if (mismatches.length) throw new Error('Veröffentlichung nicht vollständig verifiziert: ' + mismatches.join(', '));
console.log('Bestätigt: Beide HTML-Vorlagen samt Betreff sind in Supabase gespeichert.');
