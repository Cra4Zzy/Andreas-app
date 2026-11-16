# Abbate Lernraum – fachliche Quellen für die fünf bestehenden Ausbildungsbereiche

Stand 6. November 2026. Diese Datei dokumentiert die Quellenbasis des eigenständig formulierten Übungsfragenpools in `dist/practice-bank.js`. **Es wurden keine weiteren Ausbildungsbereiche angelegt.**

| Vorhandener Bereich | Neu formulierte Übungsfragen | Fachliche Grundlage |
|---|---:|---|
| Gabelstapler | 15 + 6 bisherige Übungen | [DGUV Grundsatz 308-001 (2022)](https://publikationen.dguv.de/widgets/pdf/download/article/48), DGUV Vorschrift 68 |
| Hebebühnen | 15 | [DGUV Grundsatz 308-008](https://publikationen.dguv.de/widgets/pdf/download/article/90), DGUV Information 208-019 |
| Krane | 15 | [DGUV Grundsatz 309-003](https://publikationen.dguv.de/regelwerk/dguv-grundsaetze/45/auswahl-unterweisung-und-befaehigungsnachweis-von-kranfuehrern), DGUV Vorschrift 52 |
| Anschlagen von Lasten | 15 | [DGUV Regel 109-017](https://publikationen.dguv.de/regelwerk/dguv-regeln/3920/betreiben-von-lastaufnahmemitteln-und-anschlagmitteln-im-hebezeugbetrieb), DGUV Information 209-013 |
| Erdbaumaschinen & Bagger | 15 | [DGUV Grundsatz 301-005 (2022)](https://publikationen.dguv.de/widgets/pdf/download/article/4418). Gilt für Hydraulikbagger und Radlader. |

## Freigabe vor verbindlicher Nutzung

- Der Pool umfasst 75 neue, eigenständig verfasste Multiple-Choice-Fragen, plus sechs bisherige Übungen.
- Die 52 im System hinterlegten älteren Staplerfragen stammen aus einem anderen Schulungsbogen und haben derzeit **keinen bestätigten Lösungsschlüssel**. Ihre Antworten werden unverändert nicht bewertet.
- Die neuen Übungsantworten und Erläuterungen dienen zur unverbindlichen Vorbereitung. Andreas muss jede Frage und jede Erklärung fachlich prüfen und freigeben, insbesondere für andere Maschinenarten, Sonderfälle und geänderte Vorschriften.
- Dies ist **keine** behördliche Anerkennung, DGUV-Zertifizierung, Befähigung oder Ersatz für theoretische und praktische Abschlussprüfungen.
- Die November-2026-Entwurfsfassung des überarbeiteten DGUV Grundsatzes 308-001 ist **noch kein geltender veröffentlichter Grundsatz**; Referenz bleibt die Fassung Dezember 2022, solange keine neue offizielle Fassung herausgegeben wurde.
- Alle neuen Inhalte liegen zunächst auf Deutsch vor. Andere Sprachfassungen benötigen Fachübersetzung und Freigabe; automatische Übersetzung darf nicht als geprüft gelten.
- Eine etwaige spätere Prüfung in der App benötigt eigenständige Anforderungen an Identitätsprüfung, Prüfungsaufsicht, Bewertung und Nachweisführung.

## Redaktionelle Prüfung durch Ausbilder

1. Stimmt der technische Inhalt und ist die angegebene Lösung eindeutig?
2. Sind die drei Antwortmöglichkeiten fachlich trennscharf und nicht irreführend?
3. Stimmen Hersteller-, Betriebs-, Geräte- und Sonderfallvorbehalte?
4. Ist die Formulierung für die Zielgruppe verständlich?
5. Sind Quellenfassung und Datum noch aktuell?

## Ergänzung 14. November 2026: Ladungssicherung

50 eigenständige Übungsfragen zur Sicherung von Ladegut im deutschen Straßenverkehr. Grundlagen: [§ 22 StVO](https://www.gesetze-im-internet.de/stvo_2013/__22.html), [§ 23 StVO](https://www.gesetze-im-internet.de/stvo_2013/__23.html), [DGUV Regel 114-615](https://publikationen.dguv.de/widgets/pdf/download/article/3696), [BG Verkehr: Lastverteilung und Ladungssicherung](https://www.bg-verkehr.de/arbeitssicherheit-gesundheit/branchen/gueterkraftverkehr/laden-und-sichern/lastverteilung-und-ladungssicherung) und [Be- und Entladen](https://www.bg-verkehr.de/arbeitssicherheit-gesundheit/branchen/gueterkraftverkehr/laden-und-sichern/be-und-entladen). 300 Fragen in sechs Kategorien nach dieser Erweiterung. Fachliche Freigabe einschließlich maschineller Übersetzungen steht aus; keine verbindliche Prüfung oder Unterweisung. Vor Auslieferung vollständige Sprachpakete, Kategoriegrenzen und PWA-Aktualisierung validieren.

### Technischer Prüfstand der Erweiterung (14.11.2026)

- 300 eindeutige Fragen-IDs, 50 je Kategorie. 25 nichtdeutsche statische Sprachpakete mit je 300 identischen IDs und sechs nichtleeren Textfeldern geprüft; in allen 50 neuen Fragen je Sprache drei unterschiedliche Antworttexte.
- Adaptiver Auswahltest: zwei aufeinanderfolgende Runden mit je 20 unterschiedlichen Fragen aus Ladungssicherung, ohne Vermischung mit Gabelstapler.
- Übersetzungslauf [43633691593](https://github.com/Cra4Zzy/Andreas-app/actions/runs/43633691593) erfolgreich; ursprünglich italienisches Anfrage-Limit im zweiten Versuch behoben.
- Fachliche Quellen: [DGUV Regel 114-615 (04/2021)](https://publikationen.dguv.de/regelwerk/dguv-regeln/3696/branche-gueterkraftverkehr-guetertransport-im-strassenverkehr), §§ 22/23 StVO (geltende Fassung). Technische Validierung ist keine fachsprachliche Freigabe. Die Fahrschule muss die Fragen und Übersetzungen vor verbindlicher Verwendung prüfen; die App bleibt ein unverbindliches Lerntraining.

## Abseilen aus Höhen – Theorie (50 Fragen)

Eigenständig formulierte Theorieübungen mit stabilen IDs `as-*`, ergänzend zu den bestehenden 300 Fragen. Themen: Einsatzvorbereitung, Ausrüstung, Grenzen der eigenen Befähigung, Gefahren erkennen, Rettungsorganisation und Nachbereitung. Keine gerätespezifische Bedienungsanleitung und kein praktischer Befähigungsnachweis.

Fachliche Referenzen:
- DGUV Regel 112-198: https://publikationen.dguv.de/widgets/pdf/download/article/1013
- DGUV Regel 112-199: https://publikationen.dguv.de/widgets/pdf/download/article/1014

Die konkrete Gerätebedienung richtet sich nach Herstelleranleitung, betrieblicher Planung und praktischer Einweisung. Redaktioneller Stand 16.11.2026; Fachprüfung durch Andreas sowie fachliche Prüfung der maschinellen Übersetzungen ausstehend (`reviewed: false`). Wie die bisherigen Kategorien ist der Bereich als Theorietraining nutzbar, ohne bestätigte Schulungsnachweise zu erzeugen.
