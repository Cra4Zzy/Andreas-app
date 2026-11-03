# Abbate Lernraum – HTML-E-Mails für Supabase

Dieses Verzeichnis enthält drei bewusst als **Transaktions-E-Mails** gestaltete HTML-Vorlagen. Alle Styles sind inline, Bilder nutzen eine öffentliche absolute HTTPS-URL, und Sicherheitslinks kommen direkt aus der Supabase-Vorlage.

| Datei | Supabase-Einstellung | Betreff |
|---|---|---|
| `confirm-signup.html` | Authentication → Email Templates → **Confirm signup** | `Bestätige deine E-Mail-Adresse | Abbate Lernraum` |
| `reset-password.html` | Authentication → Email Templates → **Reset password** | `Passwort zurücksetzen | Abbate Lernraum` |
| `welcome.html` | **Nicht** als Standard-Auth-Vorlage verfügbar | `Willkommen im Abbate Lernraum!` |

## Produktionsveröffentlichung

**Wichtig:** Diese Dateien im GitHub-Repository verändern die produktiven Supabase-E-Mail-Einstellungen nicht von selbst.

Der Zugang zu den Auth-E-Mail-Einstellungen wird über die **Supabase Management API** oder über das **Dashboard** benötigt. Das eingebundene Supabase-Tool bietet für E-Mail-Templates momentan keine Schreibaktion.

**Variante A – Dashboard (ohne Token):**
1. [Abbate Email Templates](https://supabase.com/dashboard/project/qyizzwqrruwojtriqfuc/auth/templates) öffnen.
2. `Confirm signup` aufrufen, Betreff aus der Tabelle übernehmen und den Inhalt von `confirm-signup.html` als HTML einsetzen. Speichern.
3. `Reset password` aufrufen, Betreff und `reset-password.html` einsetzen. Speichern.
4. Vor dem Produktivbetrieb einen Testnutzer registrieren, die E-Mail bestätigen, einen Passwort-Reset anfordern, **verbrauchten Link erneut öffnen**, anschließend neu anmelden und alle Weiterleitungen auf der eigenen App-Domain prüfen.

**Variante B – Management API (lokal, ohne Token im Repository):**
```bash
# Im lokalen Repository ausführen; benötigte Variablen nur in der lokalen Shell setzen.
export SUPABASE_ACCESS_TOKEN="..."
node scripts/publish-auth-email-templates.mjs
node scripts/publish-auth-email-templates.mjs --apply
```

Der erste Aufruf validiert nur die Dateien. `--apply` aktualisiert **ausschließlich** Betreff und Inhalt der beiden Auth-Vorlagen, vergleicht danach die Konfiguration über die Management API und meldet etwaige Fehler. Das Script gibt keinen Access-Token aus. Es setzt standardmäßig das Projekt `qyizzwqrruwojtriqfuc` voraus. Niemals einen Supabase Access Token ins GitHub-Repository oder in einen Chat kopieren.

## Willkommensmail

Die Willkommensmail ist **keine** eingebaute Auth-Template-Kategorie. Sie darf nicht in eine der Supabase-Bestätigungs- oder Reset-Vorlagen eingefügt werden. Der HTML-Entwurf liegt für eine spätere serverseitige Zustellung bereit. Dafür ist ein eigener Versandprozess nötig (zum Beispiel über einen E-Mail-Provider) und dieser sollte erst nach **tatsächlich bestätigter E-Mail-Adresse** auslösen.

## Hinweise

- `{{ .ConfirmationURL }}` ist eine **Supabase-Templatevariable** und darf nicht durch eine feste URL ersetzt werden.
- Nach dem Wechsel per Dashboard/API sollte ein echter End-to-End-Test mit Testkonto folgen.
- Die eigene App-Domain sowie die Redirect-URL-Allowlist müssen in Supabase Auth korrekt hinterlegt sein.
- Das Repository beinhaltet weder SMTP-Passwort noch Supabase Management API Access Tokens.
- Da E-Mail-Clients externe Bilder blockieren können, bleibt das Abbate-Wortlogo als HTML-Text sichtbar.

Referenz: https://supabase.com/docs/guides/auth/auth-email-templates
