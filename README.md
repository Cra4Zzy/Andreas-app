# Abbate · Dein Lernbegleiter

## Nächste Entwicklungsstufe

Gemeinsamer Karten-QR zur [Portal-Vorschau](dist/konto.html), [Kontenverwaltung](dist/verwaltung.html) und [persönlichem Schulungsverlauf](dist/nachweise.html). Neue Demo-Registrierungen warten auf Freischaltung. Andreas kann Zugänge aktivieren, pausieren, ihre Laufzeit setzen und Demo-Konten nach Bestätigung löschen. Durchgeführte Schulungen und Prüfungen werden mit Datum und „Teilgenommen“, „Bestanden“ oder „Nicht bestanden“ erfasst; Teilnehmer sehen ausschließlich eine Leseansicht.

**Ausschließlich fiktive Browserdaten:** Es gibt weiterhin keine echte Authentifizierung, produktive API, Zahlungsanbindung oder zentrale Datenbank. Die öffentliche Verwaltungsdemo ist kein geschützter Admin-Bereich. Echte Kontolöschung und Passwortfunktionen sind noch nicht implementiert.

Das lokal geprüfte Datenbankmodell (`backend/schema.sql`, danach `backend/accounts.sql`) enthält ausstehende Registrierungen, Rollen-/Schulgrenzen, aktuelle Zugangssperren und protokollierte Ergebnisänderungen. Es wurde in keinem Cloud-Projekt ausgeführt. Native Android-/iOS-Projekte sind vorbereitet, aber nicht signiert oder als Store-Binaries gebaut.

- [Konten, Nachweise und offene Backend-Anbindung](docs/schulungspass.md)
- [Store-Vorbereitung und offene Freigaben](docs/app-stores.md)

Entwicklung: `npm ci`, `npm run build`, `npm test`, `npm run native:sync`.

Die bestehende Lern-App nutzt weiterhin sechs redaktionelle Beispielfragen und alle 24 EU-Sprachen für ihre Navigation. Die neue Portal-Vorschau ist vorerst deutsch. Angaben und Übungsrunden bleiben lokal im Browser.

## Gestaltung

Teilnehmerorientierter Einstieg statt Admin-Dashboard. Warmes Papierweiß, Abbate-Gelb und dunkle petrolblaue Akzente. Selbst gehostete Barlow- und Source-Sans-3-Schriften, Fließtext 18–20 px, große Antwortflächen und klare mobile Navigation. Original-Abbate-Logo und echte Schulungsfotos von der Kundenwebsite.

## Funktionen

- Start, Lernen, Prüfungsvorbereitung und Ergebnisse als Hauptnavigation. Verwaltung im Profil.
- Drei Themenbereiche mit sechs redaktionellen Beispielfragen.
- Lernmodus mit unmittelbarer Erklärung und Rückmeldung.
- Prüfungstraining mit nachträglicher Auswertung, änderbaren Antworten und Hinweis auf offene Fragen.
- Ergebnisverlauf und tatsächlicher, lokal gespeicherter Lernfortschritt.
- Teilnehmer anlegen/bearbeiten, Suche, Monatsverlängerung und Demo-Sperre abgelaufener Zugänge.
- Manifest-Identität und Abbate-App-Icons erhalten; Installationshilfe für Windows, Mac, iPhone und Android.
- Europäische Spracharchitektur mit automatischer Browsererkennung, gespeicherter Auswahl und allen 24 EU-Amtssprachen. Navigation und Sprachstatus reagieren auf die Auswahl; fachlich geprüfte Fragenübersetzungen werden später pro Sprache ergänzt.
- Vorhandene lokale v1-Demodaten werden übernommen; alte Bedienungsdemorunden als solche gekennzeichnet.

## Grenzen

Keine echte Authentifizierung, Datenbank, Zahlungsanbindung oder serverseitige Rechteprüfung. Die Beispielfragen ersetzen keinen verbindlichen Fragenkatalog und keinen Prüfungsnachweis; fachliche Freigabe, Originalfragen und geprüfte Fachübersetzungen durch den Auftraggeber fehlen. Daten und Sprachauswahl bleiben im Browser. Installation auf echten Mobilgeräten nicht durchgeführt.

## Referenzen

- https://www.fahren-lernen.de/de — lernschrittbezogener Einstieg und sichtbarer Lernstand.
- https://de.babbel.com/ — kurze Lernrunden und verständliche Rückmeldung.
- https://design-system.service.gov.uk/styles/type-scale/ — gut lesbare Schriftgrößen, insbesondere 19 px für Fließtext.
- https://gabelstaplerfahrschule-andreas.de/ — originales Logo, Markenfarben und Schulungsbilder.
- https://publikationen.dguv.de/regelwerk/dguv-vorschriften/1123/flurfoerderzeuge — fachliche Orientierung der Beispiele an DGUV Vorschrift 68, besonders §§ 7, 9, 11, 12, 15 und 16. Keine amtlichen Prüfungsfragen übernommen.

Startmotiv: Originalfoto der Kundenwebsite, `assets/img/gallery-new-02.webp`, unverändert als `dist/assets/stapler-schulung.webp` übernommen.

Fontlizenzen liegen in `dist/assets/fonts/`.

## Validierung

JavaScript-Syntax; vollständige Lernrunde mit bewusst falscher Antwort (5/6), Erklärung und Speicherung; Prüfungstraining ohne vorzeitige Lösungen, Antwortänderung über Rücknavigation, Abgabe mit vier offenen Fragen und korrektem Ergebnis (1/6); abgelaufener Zugang; Monatsverlängerung; neuer Teilnehmer; Suche; responsive Ansicht mit 375 px Inhaltsbreite; nachgeladene Schriften und 20 px Fließtext im Browser geprüft.
