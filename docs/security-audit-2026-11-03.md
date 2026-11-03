# Abbate Lernraum — Sicherheits- und Stabilitätsprüfung

**Stand:** 03.11.2026 · Technische Prüfung im eigenen Repository und autorisierten Supabase-Projekt.  
**Ergebnis:** Schutzmaßnahmen verbessert; automatische Regressionstests bestanden. **Keine Garantie auf Fehlerfreiheit, kein vollständiger externer Penetrationstest und noch keine E2E-Abnahme mit echten Testidentitäten.**

## Umfang

Prüfung von Authentifizierung und Recovery, Rollen-/Zugriffsrechten, Mandantentrennung per RLS, bezahlten 30-Tage-Zugängen, Unterrichts-/Prüfungsnachweisen, Übungsfortschritt und Browser-Refresh-/Verbindungsunterbrechungen. Zusätzlich Supabase Security Advisor, Rollen-/Tabellengrants und PostgreSQL-Funktionen geprüft.

### Behobene bzw. gehärtete Punkte

1. **Passwort-Recovery:** Ein vorhandenes altes Login/Supabase-Session-Objekt genügt nicht, um das Formular zum Setzen eines neuen Passworts anzuzeigen. Das Frontend verlangt das vom Supabase-Client ausgelöste `PASSWORD_RECOVERY`-Ereignis, eine gültige Sitzung und passende authentifizierte Identität. Ungültige oder erneut verwendete Callback-URLs zeigen keine Kontoseite an. Nach erfolgreichem Reset wird global abgemeldet, damit vorhandene Refresh-Sitzungen widerrufen werden. Dies ersetzt **nicht** einen echten Einmal-Link-Test.
2. **Schulungs-/Prüfungsergebnisse:** `abbate_change_record` korrigiert ausschließlich Ergebnisse oder widerruft einen Eintrag. Jeder Aufruf verlangt live bestehende Sitzung, Schulzugehörigkeit und aktive Mitarbeiterrolle. Änderungen werden vom vorhandenen Datenbank-Trigger auditiert. Direkte Browser-`UPDATE`-Aufrufe sind nicht nötig.
3. **30-Tage-Zugänge:** `abbate_manage_access` erlaubt nur berechtigten Administratoren feste 30-Tage-Blöcke, manuelle Verlängerung, Pause und Fortsetzung. Prüfungen erfolgen im Backend und nutzen Zeilensperren. Ein Konto kann sich nicht selbst als Admin markieren.
4. **Übungsfortschritt:** `abbate_merge_practice` führt Ergebnisse bei gleichzeitigen/verspäteten Speicherungen transaktional je Benutzer zusammen. Stale Browser-Snapshots ersetzen nicht mehr den gesamten Stand. Direkte Browser-Berechtigungen für `INSERT`, `UPDATE` und `DELETE` an `abbate_practice` wurden entzogen. Nur die eigenen Daten können gelesen werden.
5. **Refresh-/Netzunterbrechung:** Überlappende Zugangsprüfungen werden im Frontend zusammengefasst. Vorübergehende Verbindungsfehler verwerfen eine offene Übungsrunde nicht. Eine fertiggestellte Übungsrunde wird erst nach bestätigter Server-Speicherung als abgeschlossen angezeigt; fehlgeschlagene Hintergrundspeicherungen werden nach Wiederverbindung erneut versucht.
6. **Tests:** Isolierte PostgreSQL/PGlite-Tests prüfen RLS, Berechtigungen gegen Schüler-Manipulation, widerrufene Sitzung, serverseitige Ergebniskorrektur, zurückgezogene Einträge und Zusammenführung alter/neuer Übungsdaten. Browser-simulierte Auth-Tests prüfen gebrauchte/fehlerhafte Reset-Links mit bereits bestehender Sitzung und die Recovery-Ereignisvoraussetzung.

**Automatisierter Testlauf:** 35 Tests bestanden / 0 fehlgeschlagen.  
**Veröffentlichung:** Sicherer ALL-INKL-FTPS-Upload erfolgreich nach Tests.

### Offene, konkret bekannte Sicherheitsthemen

- **Supabase Security Advisor: `auth_leaked_password_protection` = WARN.** Der Schutz gegen bereits bekannte kompromittierte Passwörter ist nicht aktiviert. Im Supabase Dashboard unter Authentication/Sicherheitsoptionen aktivieren, ggf. abhängig vom Tarif. Dokumentation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- **5 Hinweise `authenticated_security_definer_function_executable` (WARN):** Gemeint sind `abbate_accept_terms`, `abbate_change_record`, `abbate_manage_access`, `abbate_merge_practice`, `abbate_terms_accepted`. Die Aufrufbarkeit durch authentifizierte Nutzer ist für diese eng definierten Server-RPCs beabsichtigt; innerhalb der Funktionen sind Identität, Live-Sitzung, Rolle oder eigener Datensatz begrenzt. Nach späteren Änderungen erneut prüfen, insbesondere `EXECUTE`-Grants, `search_path` und Mandantenzuordnung. Dokumentation: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- **5 private Tabellen mit RLS ohne Policies (INFO):** private Audit-, Registrierungskonfigurations-, Freigabe- und AGB-Tabellen sind nicht für direkte Browserabfragen freigegeben; das ist beabsichtigt. https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- **Reset-Link Ende-zu-Ende:** Echten Link an eine autorisierte Testadresse schicken, genau einmal verwenden, auf demselben Browser erneut klicken, zusätzlich bei bereits angemeldeter Sitzung und auf zweitem Gerät prüfen. Auch Ablauf/ungültiger Token und Passwortwechsel mit globalem Session-Widerruf prüfen. Automatische Tests allein können den externen E-Mail-/Supabase-Austausch nicht nachweisen.
- **Auth- und Betriebs-Konfiguration:** SMTP SPF/DKIM, Passwortschutz, Rate-Limits, eventuelles CAPTCHA/MFA (insbesondere Admin), erlaubte Redirect-URLs, Backup/Restore und Datensicherheitsprozesse vor zahlenden Kunden verbindlich testen.
- **Keine verbindliche Online-Prüfung:** Das aktuelle Client-Quiz ist **ausschließlich unverbindliches Training**. Es ist technisch nicht gegen Manipulation der eigenen Übungsantworten/Ergebnisdaten als offizieller Prüfungsnachweis ausgelegt. Falls Andreas verbindliche Prüfungen möchte, müssen Fragenausgabe, Versuchsbegrenzung, Zeitmessung, Auswertung und verbindliche Ergebnisse vollständig serverseitig und nachvollziehbar gestaltet werden.
- **Konto löschen vs. Nachweise:** Derzeit entfernt die Kontolöschung auch verknüpfte Schulungs-/Prüfungseinträge. Zukünftige gesetzliche Dokumentations-/Aufbewahrungspflichten vor echten Abschlüssen klären; daraus darf keine Selbstlöschung verbindlicher Prüfungsnachweise entstehen.
- **Unfertige Runde bei vollständigem Browser-Neuladen:** Eine nicht abgeschlossene Fragerunde wird weiterhin nicht serverseitig als Entwurf gespeichert. Bereits bestätigte Ergebnisse bleiben dagegen erhalten. Falls Unterbrechungsfortsetzung durch hartes Neuladen gewünscht ist, benötigt das eine separate datenschutzgerechte Draft-Funktion.
- **Weder fehlerfreie Serverantworten noch vollständige Angriffssicherheit garantierbar:** Authentifizierte Live-End-to-End-Szenarien, Last-/Rate-Limit-Tests und gegebenenfalls ein unabhängiger Penetrationstest sind vor größerem Betrieb sinnvoll.

## Änderungen

- `supabase/migrations/20261103161000_secure_record_changes.sql`
- `supabase/migrations/20261103163500_atomic_practice_merge.sql`
- `dist/backend.js`, `dist/portal.js`, `dist/app.js`
- `tests/security-regressions.test.cjs`, `tests/auth-recovery-ui.test.cjs`, `tests/auth-callback.test.cjs`

Der Schutz gegen Datenbankmanipulation beruht auf der serverseitigen PostgreSQL-Zugriffskontrolle und den geschützten RPCs, **nicht** auf ausgeblendeten Frontend-Schaltflächen.
