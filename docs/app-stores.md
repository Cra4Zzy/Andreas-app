# Vorbereitung auf die App Stores

## Vorbereitet

Capacitor 8.6.0 und festgeschriebene Abhängigkeiten sind eingerichtet. Die Android-Studio- und Xcode-Projekte unter `android/` und `ios/` wurden erzeugt und mit den lokalen Web-Inhalten synchronisiert. Es gibt keine externe `server.url`. Die Lern-App erkennt die native Laufzeit und startet dort keinen PWA-Service-Worker. Der QR-Generator ist lokal gebündelt.

Noch keine signierten Binaries, Emulator-/Gerätetests oder Store-Uploads. Die erzeugten Projekte sind ein Entwicklungsgerüst.

## Lokal öffnen

```sh
npm ci
npm run build
npm test
npm run native:sync
npm run native:android
# Auf einem Mac mit Xcode:
npm run native:ios
```

Die vorläufige Identität `de.abbate.lernraum.preview` muss vor produktiver Registrierung mit dem Kunden abgestimmt und konsistent in Capacitor, Android und Xcode ersetzt werden. Zertifikate und Signing-Schlüssel gehören nicht ins Repository.

## Vor TestFlight oder Google Play Test

- Entwicklerkonten und dauerhaften Kontoinhaber festlegen, vorzugsweise den Kunden.
- Produktiven Namen und Bundle-/Package-ID abstimmen. Native Vorlagen enthalten noch Vorschau-Identität und Standard-Icons/Splash-Dateien; freigegebene Native-Assets einsetzen.
- Anmeldung, zentrale Datenbank und echte Rechte anschließen. Frei umschaltbare Teilnehmer-/Verwaltungsdemo aus dem Kundenrelease entfernen.
- Verbindliche Fragen und alle Übersetzungen fachlich freigeben. Aktuell sind sechs redaktionelle Fragen und fiktive Teilnehmer eingebaut.
- Datenschutz-/Support-URLs, Kontolöschung, Aufbewahrung sowie App-Privacy- und Data-Safety-Angaben auf tatsächliche Datenflüsse abstimmen.
- Universal Links und Android App Links mit der endgültigen HTTPS-Domain konfigurieren und testen. Aktuelle QR-Links öffnen die Webansicht.
- Testkonto und Beispiel-QR für Store-Review bereitstellen. Backend während Review erreichbar halten.
- Auf Geräten Offlineverhalten, aktuellen Nachweisstatus, Anmeldung, Deep Links, Zurück-Navigation, Schriftgrößen und Bedienbarkeit prüfen.
- Bezahlung und Zugangskauf klären und anhand der dann geltenden Store-Regeln planen. Es gibt noch kein Zahlungssystem.

Die jetzige Vorschau ist noch nicht einreichungsfertig. Das native Gerüst allein ersetzt die fehlenden Funktionen und Inhaltsfreigaben nicht.

## Primärquellen

- https://capacitorjs.com/docs/getting-started
- https://capacitorjs.com/docs/basics/workflow
- https://developer.apple.com/app-store/review/guidelines/
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://supabase.com/docs/guides/database/postgres/row-level-security
