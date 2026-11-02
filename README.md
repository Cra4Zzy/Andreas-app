# Abbate Lernraum

Lern-App und persönlicher Schulungspass mit Supabase-Anmeldung. Teilnehmer registrieren sich mit E-Mail und Passwort, bestätigen ihre Adresse und warten auf Freischaltung durch die Fahrschule. Ein gemeinsamer Karten-QR führt zur Anmeldung. Das Konto bestimmt den eigenen Schulungsverlauf.

## Entwicklungsstand und Kundenabnahme

- Eigenes Supabase-Projekt **Abbate Lernraum**, Region Frankfurt; andere Projekte bleiben getrennt.
- Echte Auth-Anbindung statt lokaler Demo-Sitzungen. Kein Service-Key im Client.
- Geschützte Verwaltung: aktive Admins steuern Zugänge und Ablaufdaten; aktive Mitarbeiter erfassen durchgeführte Schulungen, Unterweisungen und bestandene/nicht bestandene Prüfungen.
- Schüler sehen ausschließlich ihre eigenen bestätigten Einträge. Übungsrunden werden getrennt auf dem Server gespeichert und sind keine Prüfungsnachweise.
- Passwortwiederherstellung, Kontoeinstellungen und serverseitige Teilnehmer-Kontolöschung mit erneuter Passwortbestätigung sind implementiert.
- Native Android-/iOS-Projekte mit Abbate-Icons und Startbildern, Android API 36, deaktivierten WebView-Logs und Android-Backup. Automatische Pilotbuilds in GitHub Actions.
- Desktop-Pilot mit Tauri 2: GitHub Actions erstellt Windows-NSIS-Installer (.exe) und universelle macOS-DMGs (Intel/Apple Silicon). Noch keine öffentliche, signierte Distribution; siehe [Desktop-Installer](docs/desktop-installers.md).

**Kundenoberfläche für Abnahme aufbereitet:** Die störenden Pilot-/Demo-Banner sind aus der Benutzeroberfläche entfernt. Die eigene ALL-INKL-App-Subdomain und der verschlüsselte Upload aus GitHub sind eingerichtet; Website-Änderungen werden nach bestandenen Tests automatisch bereitgestellt. Der SMTP-Versand wurde eingerichtet und eine Reset-Mail empfangen. **Noch keine vollständige Produktionsfreigabe:** Die neue Supabase-Redirect-URL, der vollständige Passwort-Reset-End-to-End-Test, ein vom Betreiber freigegebenes Adminkonto, echte Inhaltsfreigabe (derzeit sechs Übungsfragen), Rechtsprüfung, Installer-Signierung und App Stores fehlen noch. Siehe [Launch-Checkliste](docs/launch-readiness.md).

## Einstieg

- `dist/konto.html` — Registrierung/Anmeldung, Passwort-Reset und Kontoeinstellungen.
- `dist/nachweise.html` — persönlicher Schulungsverlauf, nur Lesen.
- `dist/verwaltung.html` — ausschließlich berechtigte Mitarbeiter, keine öffentliche Verwaltungsdemo mehr.
- `dist/index.html` — persönliches Theorietraining nach Freischaltung.
- `dist/datenschutz.html` — technische Pilothinweise, ausdrücklich noch keine freigegebene finale Datenschutzerklärung.

Die bestehende Lernoberfläche und Beispiel-Fragenpacks unterstützen 24 EU-Sprachen; die neuen Konto-/Verwaltungsansichten sind vorerst deutsch. Passwörter werden nicht in eigenen Tabellen gespeichert. Personenbezogene Datensätze werden nicht im Browsercache oder alten Demo-LocalStorage gehalten. Die Anmeldesitzung und die Sprachauswahl bleiben auf dem Gerät.

## Entwicklung

```sh
npm ci
npm run build
npm test
npm run native:sync
npm run native:android
# macOS mit Xcode:
npm run native:ios
```

Die zusammengefasste Migration unter `supabase/migrations/` entspricht der Cloud-Migration. `backend/schema.sql`, `accounts.sql` und `live.sql` dokumentieren dieselben Schritte in lesbarer Reihenfolge. Nicht erneut über eine bereits migrierte Datenbank ausführen.

- [Backend und Inbetriebnahme](docs/backend-launch.md)
- [Eigene App-Subdomain: ALL-INKL und Supabase](docs/custom-domain.md)
- [Launch-Checkliste](docs/launch-readiness.md)
- [Konten und Schulungspass](docs/schulungspass.md)
- [App Stores und Testbuilds](docs/app-stores.md)

## Gestaltung und Inhalte

Original-Abbate-Logo, originale Schulungsbilder der Fahrschule, selbst gehostete Barlow-/Source-Sans-Schriften und Abbate-Gelb mit dunklem Petrol. Lizenztexte liegen unter `dist/assets/fonts/` und `dist/vendor/`.

Die redaktionellen Beispielfragen sind keine amtlichen Prüfungsfragen. Verbindliche Schulungs- und Prüfungsabschlüsse werden ausschließlich durch die Fahrschule dokumentiert.
