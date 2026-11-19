# Hubarbeitsbühnen-Bilder – Integrationsentwurf

Dieser Branch ist nicht zur Veröffentlichung geeignet, bevor die sieben WebP-Dateien aus dem ZIP im Ordner dist/assets/quiz/premium/ liegen und die Tests erfolgreich laufen.

- hub-abstuetzung.webp: h2-abstuetzplatte
- hub-gefahrenbereich.webp: h-absperren, h2-sicherheitsabstand
- hub-quetschgefahr.webp: h-quetschen, h2-aufbaukontakt
- hub-untergrund.webp: h-untergrund
- hub-ueberlastung.webp: h-ueberlast
- hub-transportstellung.webp: h-transportstellung, h2-transporthoehe
- hub-wind.webp: h-wind

Drei Originalmotive bleiben bis fachlicher Freigabe zurückgestellt: Absturzsicherung (Anschlagpunkt), Stromleitungen (nicht nachgewiesener Sicherheitsabstand), Notablass (gerätespezifische Bedienung). Bilder sind symbolisch, keine Bedienanleitungen. Auch die übrigen Motive fachlich freigeben lassen.

Vor Merge: node --test tests/quiz-illustrations.test.cjs; danach npm test. Keine Änderungen am Fragenpool oder den Übersetzungen.
