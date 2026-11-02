# Android, iOS und Store-Start

Stand: 2. November 2026. Technischer Pilot, keine Store-Einreichung erfolgt.

## Erledigte Vorbereitung

Capacitor **8.6.0**, festgeschriebene npm-Abhängigkeiten und Lockfile, native Android-/Xcode-Projekte, lokale Webassets ohne externe `server.url`. Anmeldung, Verwaltung und Schulungspass verwenden das getrennte Supabase-Projekt. Der native Start verlangt eine echte Anmeldung; der alte Teilnehmerwechsel und lokale Admin-Editor sind entfernt.

Original-Abbate-App-Icons und Startbilder ersetzen die nativen Standardgrafiken. Native WebView-Logs sind deaktiviert. Android-Backups sind deaktiviert und Klartextverkehr ist ausgeschlossen. In der nativen Laufzeit wird kein PWA-Service-Worker gestartet. Persönliche Serverantworten werden nicht im Service Worker gespeichert.

Android verwendet `compileSdkVersion/targetSdkVersion 36`. Apple verlangt seit 28. April 2026 Xcode 26 und ein iOS-26-SDK oder neuer; das ist eine Buildanforderung, keine iOS-26-Mindestversion für Nutzer.

## Automatische Pilotbuilds

`.github/workflows/native-builds.yml` baut bei Push/PR bzw. manuellem Start:

- Android mit Java 21: Debug-APK als **abbate-android-pilot-apk**. Zum internen Testen; Debugsignierung ersetzt keinen Play-Upload-Key.
- iOS auf macOS: Simulator-App mit Xcode, ohne Signatur, als ZIP **abbate-ios-simulator**. Das ist keine auf einem iPhone installierbare IPA.

Aktionsversionen sind auf konkrete SHAs festgeschrieben. Es werden keine Signing-Secrets benötigt oder in der Quelle hinterlegt. Native Geräte-/Emulatortests sind dadurch nicht ersetzt.

## Vor TestFlight und Play-Testspur

1. Kundenkonten in Apple Developer/App Store Connect und Google Play Console festlegen, idealerweise Andreas als rechtlichen Inhaber. Kaiser Webdesign erhält Entwicklerzugriff. Vorhandene Konten nutzen; keine kostenpflichtige Anmeldung ohne Auftrag.
2. Dauerhaften Appnamen und Package-/Bundle-ID bestätigen. Aktuell bewusst `de.abbate.lernraum.preview`; vor Registrierung der Produktiv-App konsistent ersetzen. Keine versehentliche Store-Einreichung mit Vorschau-ID.
3. SMTP, Redirects, erstes echtes Adminkonto und authentifizierte Live-Abnahme abschließen; siehe [Backend-Inbetriebnahme](backend-launch.md).
4. Endgültige Kundendomain, Support- und Datenschutzseite freigeben. Die vorhandene technische Pilot-Datenschutzseite ist kein fertiger Rechtstext. Datenkategorien, Verantwortlicher, Empfänger, Auftragsverarbeitung und Aufbewahrung auf tatsächliche Datenflüsse abstimmen.
5. Apple App Privacy und Google Data Safety für Namen, E-Mail, Konto-ID, Schulungsverlauf, Prüfungsergebnisse und Lernfortschritt ausfüllen. Kein Werbetracking eingebaut. Die tatsächliche Nutzung durch Hosting-/Auth-Dienste berücksichtigen.
6. Kontolöschung in der App und über die Webansicht testen. Google benötigt zusätzlich einen öffentlich erreichbaren Löschpfad; `konto.html#einstellungen` und der hervorgehobene Link in den Datenschutzhinweisen sind vorbereitet. Produktionsdomain und Supportkontakt verwenden.
7. Sechs Beispielfragen durch den fachlich freigegebenen Katalog ergänzen/ersetzen und Fachübersetzungen abnehmen. Konto- und Verwaltungsansichten derzeit deutsch.
8. Zahlungsmodell vor Einreichung klären. Manuelle Freischaltung ist keine Ausnahme von Store-Zahlungsregeln. Zugriff auf separat verkaufte digitale Inhalte kann In-App-Purchase/Play-Billing erfordern; Begleitung vor Ort erbrachter Schulungen ist gesondert zu bewerten. Derzeit gibt es keine Kauf-/Bezahlfunktion oder externen Zahlungslink in der App.
9. Auf echten Android-/iPhone-Geräten Anmeldung, Bestätigung, Reset, Pause während einer Sitzung, Zugriff auf fremde Konten, Lernfortschritt auf zwei Geräten, QR-Scan, Kontolöschung, Offlinefehler, Tastatur, Safe Areas, große Schrift und Zurücknavigation abnehmen.
10. Android-Upload-Key/Play App Signing und Apple-Team/Distribution-Profil sicher einrichten. Release-AAB bzw. signiertes iOS-Archiv erzeugen, intern verteilen, danach Review mit freigegebenem Testkonto und erreichbarem Backend.

Universal/App Links werden erst mit der endgültigen Domain eingerichtet. Bis dahin öffnet der Karten-QR die Web-Anmeldung. Die App ist nicht allein durch das native Grundgerüst einreichungsfertig.

## Lokal

```sh
npm ci
npm run native:sync
npm run native:android
# macOS und Xcode:
npm run native:ios
```

## Primärquellen

- https://capacitorjs.com/docs/basics/workflow
- https://developer.apple.com/news/upcoming-requirements/?id=04282026a
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://support.google.com/googleplay/android-developer/answer/11926878?hl=de
- https://support.google.com/googleplay/android-developer/answer/13327111
