# Abbate Lernraum – Launch-Readiness und Kundenabnahme

Stand: 2. November 2026. **Die Oberfläche wird für Kunden aufbereitet; die vollständige Produktionsfreigabe ist noch nicht erteilt.**

## Bereits erledigt

- Neue eigene Domain `app.gabelstaplerfahrschule-andreas.de` ist beim Kunden im ALL-INKL-KAS angelegt und HTTPS aktiviert; der GitHub Actions FTPS-Upload wurde im gemeinsamen Test erfolgreich abgeschlossen.
- E-Mail-Postfach `noreply@gabelstaplerfahrschule-andreas.de` und Custom-SMTP in Supabase eingerichtet. Eine Reset-Mail wurde empfangen und die neue Passwortseite erreicht.
- Supabase Auth, serverseitige Mitgliedschaften und RLS, Konto-Freigabe, Schulungspass und geschützte Verwaltungsrollen sind implementiert.
- Die störenden Pilot-/Demo-Statusbanner wurden aus der öffentlichen Oberfläche, dem Lernraum, Datenschutz-Intro und Admin-QR-Bereich entfernt. Technische Projektdokumentation bleibt weiterhin transparent.
- Lernfortschritt und echte Schulungsnachweise sind voneinander getrennt.
- Download-Seite verlinkt vorhandene Desktop-Pakete nur unter ihrem tatsächlichen Veröffentlichungsstatus. Mobile Store-Links bleiben bis zur realen Veröffentlichung deaktiviert.

## Freigabeblocker (vor echten Kundendaten / offiziellem Launch)

- [ ] **Datenschutz & Vertragliches:** Verantwortlicher, Rechtsgrundlagen, Aufbewahrungs- und Löschfristen, Subprozessoren, ALL-INKL/Supabase AVV, Datentransfers, Schulungsnachweise und Betroffenenrechte fachlich/rechtlich prüfen und rechtsgültige Datenschutzinformation freigeben. Die Seite `dist/datenschutz.html` ist eine technische Datenverarbeitungsübersicht, keine anwaltlich überprüfte vollständige Datenschutzerklärung.
- [ ] **Katalog & fachliche Abnahme:** Aktuell nur sechs redaktionelle Übungsfragen. Original- bzw. vom Betreiber genehmigter Fragenkatalog, korrekte Antworten, Erläuterungen und Übersetzungen fachlich prüfen. Keine Behauptung, dass sechs Fragen eine vollständige Vorbereitung ersetzen.
- [ ] **Auth-End-to-End:** Supabase Site URL + Redirect URLs auf neue Domain umstellen (alte URL zeitweise behalten), Bestätigungs-/Reset-E-Mails testen, zweiten Klick auf verwendeten Link und Reset bei eingeloggter Sitzung prüfen; neue Anmeldung mit geändertem Passwort testen.
- [ ] **Erster Administrator:** Konto ausdrücklich vom Betreiber registrieren und Berechtigung sorgfältig setzen; Mitarbeiterrollen und Zugriffssperren an echten Testkonten prüfen.
- [ ] **Sicherheit/Betrieb:** Auth-Limits, Passwortregeln, Recovery und ggf. CAPTCHA/MFA; SMTP SPF/DKIM; Restore-/Backup-Prozess und Notfallkontakte verifizieren; Audit-Logs und Zugriffsschutz überprüfen.
- [ ] **Gerätetests:** Windows und Mac (Install, Login, Updates, Passwortreset), Android und iPhone/iPad, offline/Netzausfall, Safe Areas, Tastatur, Rechte nach Ablauf.
- [ ] **Windows/Mac Releases:** Herausgebbare, vertrauenswürdig signierte Windows-Installationsdatei und Apple Developer ID signierte/notarisierte DMG erstellen. Bis dahin Systemwarnungen bei aktuellen Vorschauinstallern transparent ausweisen.
- [ ] **App Stores:** Apple Developer / Google Play Console beim Kunden, endgültige App-ID/Bundle-ID, signierte AAB/IPA, reale Geräteabnahme, Datenschutzangaben, Prüfung des Zahlungsmodells und Store-Review.
- [ ] **Link- und Druckfreigabe:** Schulungspass-QR-Code, Kontakt- und Impressumslinks, Kunden-Supportadresse, Downloadlinks und Domain per HTTPS testen.
- [ ] **SEO:** Die öffentliche Landingpage und Account/Datenschutzseiten enthalten bewusst noch `noindex,nofollow`. SEO-Entscheidung zur Landingpage erst nach Rechtstexten und Freigabe treffen; geschützte Konto-/Verwaltungsseiten sollen nicht indexiert werden.

## Veröffentlichungsworkflow

`/.github/workflows/deploy-allinkl.yml` baut und testet `dist` und lädt nur
`index.html`, `downloads.json`, `dist/` per FTPS auf den isolierten
ALL-INKL-FTP-Zugang hoch, der in KAS auf den App-Ordner beschränkt ist.
Das ist **nicht** die Freigabe für zahlende Endkunden oder Stores.
