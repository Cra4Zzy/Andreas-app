# Android, iOS und Store-Start

> **Vertriebsentscheidung vom 4. November 2026:** Für den ersten Abbate-Launch wird die bestehende installierbare **PWA per Browser** genutzt; **keine** Veröffentlichung bei Apple oder Google geplant. Diese Datei dokumentiert nur die optional vorbereiteten nativen Builds für eine spätere Wiederaufnahme. Mobilinstallation, unabhängiger 30-Tage-Zugang, externe Bezahlung, manuelle Freischaltung und echte Abnahmetests stehen in [PWA-Launch](pwa-launch.md).


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


## Release-Pipelines vorbereitet (noch nicht freigeschaltet)

Am 2. November 2026 wurden zwei **manuell startbare** GitHub-Actions-Workflows vorbereitet. **Es wird nichts automatisch bei Google oder Apple veröffentlicht.** Die Debug- und Simulator-Builds bleiben zum Entwickeln erhalten.

### Google Play – signiertes Android App Bundle

Workflow: [Prepare signed Google Play bundle](../.github/workflows/prepare-play-release.yml).

- Das Android-Gradle-Projekt liest eine Upload-Signatur nur aus Umgebungsvariablen. Keine privaten Schlüssel im Quellcode.
- Der manuelle Workflow baut bei korrekter Konfiguration ein signiertes Android App Bundle (AAB). Nach erfolgreichem Lauf steht es als GitHub-Actions-Artefakt **abbate-play-internal-signed-aab** für 7 Tage bereit. Noch **kein Upload** in die Google Play Console.
- Vorher muss die **endgültige App-ID** vom Kunden festgelegt, in Capacitor / Android / iOS konsistent eingetragen und mit dem Skript scripts/check-mobile-release-id.cjs geprüft werden. Der bisherige Paketname mit .preview wird für Release-Builds absichtlich zurückgewiesen.
- Erforderliche GitHub **Actions Secrets**: ABBATE_ANDROID_KEYSTORE_BASE64 (Base64-Datei des Upload-Keystores), ABBATE_ANDROID_KEYSTORE_PASSWORD, ABBATE_ANDROID_KEY_ALIAS, ABBATE_ANDROID_KEY_PASSWORD. Niemals private Schlüssel im Chat oder Repository hinterlegen.
- Google Play Console und Play App Signing unter einem autorisierten Kundenkonto einrichten. Danach das geprüfte AAB in die interne Testspur hochladen und auf realen Android-Geräten testen.

### TestFlight – signiertes iOS-Archiv und IPA

Workflow: [Prepare signed TestFlight IPA](../.github/workflows/prepare-testflight.yml).

- Auf macos-26 wird ein signiertes iOS-Archiv erzeugt und als IPA exportiert. Nach erfolgreichem Lauf liegt es für 7 Tage als Artefakt **abbate-signed-ios-testflight-ipa** bereit. **Kein automatischer TestFlight-Upload**.
- Erforderliche GitHub **Actions Variables**: ABBATE_APPLE_TEAM_ID und ABBATE_APPLE_PROFILE_NAME.
- Erforderliche GitHub **Actions Secrets**: ABBATE_IOS_DISTRIBUTION_P12_BASE64 (Base64-P12 mit privatem Distribution-Schlüssel), ABBATE_IOS_DISTRIBUTION_P12_PASSWORD, ABBATE_IOS_APPSTORE_PROFILE_BASE64 (Base64-Provisioning-Profil).
- Die endgültige Bundle-ID muss im Apple Developer Portal registriert sein, mit dem Profil übereinstimmen und in App Store Connect als App existieren. Teamzugang und Signing gehören zu Andreas als Betreiber.
- Alternative am autorisierten Mac: APPLE_TEAM_ID in der Umgebung setzen und den Befehl **bash scripts/prepare-testflight.sh** ausführen. Das signierte Archiv lässt sich anschließend über Xcode Organizer zu App Store Connect hochladen.
- **TestFlight freigeben** ist ein zusätzlicher Schritt. Der signierte Build ist noch keine für Tester zugängliche Version.

### Release-Vorprüfung im bestehenden Build

native-builds.yml prüft zusätzlich einen **unsignierten Android-Release-Bundle-Build** und ein **unsigniertes iOS-Release-Gerätearchiv**. Diese Vorprüfungen ersetzen keine Signatur, keinen Store-Upload und keine Endgerätetests. Die Kompilierung gilt erst als bestätigt, wenn der jeweilige GitHub-Actions-Lauf erfolgreich abgeschlossen wurde.

**Weiterhin offen:** Produkt-IDs, Apple-/Play-Zugänge und Zertifikate, echte End-to-End-Tests, SMTP, abschließende Rechtstexte, geprüfte Lerninhalte und Klärung des Zahlungsmodells.

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
