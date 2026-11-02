# Abbate Lernraum

Lern-App und persönlicher Schulungspass mit Supabase-Anmeldung. Teilnehmer registrieren sich mit E-Mail und Passwort, bestätigen ihre Adresse und warten auf Freischaltung durch die Fahrschule. Ein gemeinsamer Karten-QR führt zur Anmeldung. Das Konto bestimmt den eigenen Schulungsverlauf.

## Aktueller Stand: technischer Pilot

- Eigenes Supabase-Projekt **Abbate Lernraum**, Region Frankfurt; andere Projekte bleiben getrennt.
- Echte Auth-Anbindung statt lokaler Demo-Sitzungen. Kein Service-Key im Client.
- Geschützte Verwaltung: aktive Admins steuern Zugänge und Ablaufdaten; aktive Mitarbeiter erfassen durchgeführte Schulungen, Unterweisungen und bestandene/nicht bestandene Prüfungen.
- Schüler sehen ausschließlich ihre eigenen bestätigten Einträge. Übungsrunden werden getrennt auf dem Server gespeichert und sind keine Prüfungsnachweise.
- Passwortwiederherstellung, Kontoeinstellungen und serverseitige Teilnehmer-Kontolöschung mit erneuter Passwortbestätigung sind implementiert.
- Native Android-/iOS-Projekte mit Abbate-Icons und Startbildern, Android API 36, deaktivierten WebView-Logs und Android-Backup. Automatische Pilotbuilds in GitHub Actions.

**Noch kein öffentlicher Produktstart:** eigener E-Mail-Versand und Auth-Redirects müssen konfiguriert, das erste echte Adminkonto freigegeben und Anmeldung/Verwaltung auf echten Konten und Geräten durchgetestet werden. Entwicklerkonten, Produktionsidentität, Signing und Store-Einreichung fehlen. Die sechs Beispiel-Lernfragen, Fachübersetzungen und Datenschutzhinweise benötigen die Freigabe des Betreibers.

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
- [Konten und Schulungspass](docs/schulungspass.md)
- [App Stores und Testbuilds](docs/app-stores.md)

## Gestaltung und Inhalte

Original-Abbate-Logo, originale Schulungsbilder der Fahrschule, selbst gehostete Barlow-/Source-Sans-Schriften und Abbate-Gelb mit dunklem Petrol. Lizenztexte liegen unter `dist/assets/fonts/` und `dist/vendor/`.

Die redaktionellen Beispielfragen sind keine amtlichen Prüfungsfragen. Verbindliche Schulungs- und Prüfungsabschlüsse werden ausschließlich durch die Fahrschule dokumentiert.
