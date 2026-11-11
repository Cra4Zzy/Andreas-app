'use strict';
// Independent training additions based on publicly accessible DGUV guidance.
// These are original learning exercises, NOT official DGUV exam questions or certified answer keys.
// Technical sign-off from Abbate Fachschule is still required before certification claims.
(() => {
  const sources={
  "gabelstapler": {
    "title": "DGUV Grundsatz 308-001, DGUV Vorschrift 68",
    "url": "https://publikationen.dguv.de/regelwerk/dguv-grundsaetze/48/qualifizierung-und-beauftragung-der-fahrerinnen-und-fahrer-von-flurfoerderzeugen-ausser-gelaendegaengige"
  },
  "hebebuehnen": {
    "title": "DGUV Information 208-019, Grundsatz 308-008",
    "url": "https://publikationen.dguv.de/widgets/pdf/download/article/472"
  },
  "krane": {
    "title": "DGUV Grundsatz 309-003",
    "url": "https://publikationen.dguv.de/regelwerk/dguv-grundsaetze/45/auswahl-unterweisung-und-befaehigungsnachweis-von-kranfuehrern"
  },
  "lasten": {
    "title": "DGUV Regel 109-017",
    "url": "https://publikationen.dguv.de/regelwerk/dguv-regeln/3920/betreiben-von-lastaufnahmemitteln-und-anschlagmitteln-im-hebezeugbetrieb"
  },
  "bagger": {
    "title": "DGUV Regel 100-500 Kapitel 2.12 (2024)",
    "url": "https://publikationen.dguv.de/regelwerk/dguv-regeln/997/betreiben-von-arbeitsmitteln"
  }
};
  const sets={
  "gabelstapler": [
    [
      "Eine betriebliche Verkehrsregel verlangt Schrittgeschwindigkeit in einem Bereich. Was gilt?",
      "Du fährst mit einem Flurförderzeug in diesen Bereich.",
      [
        "Für Stapler gilt immer die individuell gewählte Geschwindigkeit.",
        "Die betriebliche Regel und eine den Verhältnissen angepasste sichere Geschwindigkeit einhalten.",
        "Nur bei sichtbaren Fußgängern langsamer fahren."
      ],
      1,
      "Betriebliche Verkehrsregelungen und eine situationsangepasste Fahrweise sind einzuhalten."
    ],
    [
      "Bei der täglichen Kontrolle fällt eine Leckage am Fahrzeug auf. Was machst du?",
      "Die Ursache ist nicht geklärt.",
      [
        "Mangel melden und das Fahrzeug bei sicherheitsrelevantem Defekt außer Betrieb lassen.",
        "Hydraulikflüssigkeit nachfüllen und ungeprüft fahren.",
        "Die Leckage ignorieren, solange der Stapler fährt."
      ],
      0,
      "Auffällige Mängel sind zu melden und die sichere Verwendung ist vor Weiterbetrieb zu klären."
    ],
    [
      "Warum muss das Lastdiagramm beim Lasttransport berücksichtigt werden?",
      "Die Last hat einen ungewöhnlichen Schwerpunktabstand.",
      [
        "Weil es ausschließlich die Hubhöhe angibt.",
        "Weil es nur für leere Gabeln gilt.",
        "Weil die zulässige Tragfähigkeit unter anderem vom Lastschwerpunktabstand und der Hubhöhe abhängt."
      ],
      2,
      "Das Tragfähigkeitsdiagramm und die Herstellerangaben begrenzen die sichere Lastaufnahme."
    ],
    [
      "Ein Fußgänger betritt den Fahrweg unmittelbar vor dem Stapler. Wie reagierst du?",
      "Es besteht Kollisionsgefahr.",
      [
        "Weiterfahren, solange du hupst.",
        "Anhalten bzw. Gefährdung ausschließen und erst bei freiem Fahrweg weiterfahren.",
        "Den Fußgänger durch langsames Heranfahren zum Ausweichen bewegen."
      ],
      1,
      "Personen dürfen durch Flurförderzeuge nicht gefährdet werden."
    ],
    [
      "Welche Aussage zur schriftlichen Beauftragung ist richtig?",
      "Eine Person hat eine Ausbildung erfolgreich abgeschlossen.",
      [
        "Für den selbstständigen betrieblichen Einsatz ist zusätzlich die vorgesehene Beauftragung erforderlich.",
        "Nach einer Ausbildung ist keine betriebliche Freigabe nötig.",
        "Ein Pkw-Führerschein ersetzt die Beauftragung."
      ],
      0,
      "Qualifikation und betriebliche Beauftragung sind unterschiedliche Voraussetzungen."
    ]
  ],
  "hebebuehnen": [
    [
      "Wie verhältst du dich, wenn die Hubarbeitsbühne auf ungeeignetem Untergrund stehen würde?",
      "Die Tragfähigkeit des Bodens ist unklar.",
      [
        "Ohne Prüfung aufstellen, solange die Bühne gerade steht.",
        "Die Bühne im ausgefahrenen Zustand ausrichten.",
        "Standplatz und Untergrund nach Herstellervorgaben prüfen und gegebenenfalls anderen Standort wählen."
      ],
      2,
      "Standsicherheit hängt unter anderem von Untergrund, Abstützung und Herstellervorgaben ab."
    ],
    [
      "Was gilt bei Annäherung einer Arbeitsbühne an elektrische Freileitungen?",
      "Die Leitung kann unter Spannung stehen.",
      [
        "Vorgeschriebene Sicherheitsabstände und Schutzmaßnahmen beachten; bei Unklarheit Arbeiten unterbrechen.",
        "Nur die Korbhöhe ist entscheidend.",
        "Eine Kunststoffplattform verhindert jede Stromgefährdung."
      ],
      0,
      "Elektrische Gefährdungen sind durch Sicherheitsabstände und geeignete Maßnahmen zu vermeiden."
    ],
    [
      "Wozu dient die Unterweisung an der konkret verwendeten Hubarbeitsbühne?",
      "Die Bedienperson ist bereits grundsätzlich ausgebildet.",
      [
        "Sie ersetzt sämtliche Betriebsanweisungen.",
        "Sie vermittelt insbesondere die gerätespezifische Bedienung, Notablass und Gefahren.",
        "Sie ist bei neuen Geräten ohne Bedeutung."
      ],
      1,
      "Gerätespezifische Einweisung ist auch bei bereits qualifizierten Bedienpersonen wichtig."
    ],
    [
      "Was ist beim Einsatz im Freien bei starkem Wind zu tun?",
      "Der Wind nimmt während des Arbeitens deutlich zu.",
      [
        "Nur die Fahrgeschwindigkeit erhöhen.",
        "Die Plattform gegen die Windrichtung drehen und unbegrenzt weiterarbeiten.",
        "Zulässige Windgrenzen des Herstellers einhalten und bei Überschreitung den Betrieb einstellen."
      ],
      2,
      "Die zulässigen Witterungsbedingungen sind Teil der sicheren Verwendung."
    ],
    [
      "Was gilt für das Verlassen des Arbeitskorbs in angehobener Position?",
      "Ein Arbeitsplatz liegt direkt neben dem Korb.",
      [
        "Nur bei ausdrücklich vorgesehenem, abgesichertem Verfahren nach Gefährdungsbeurteilung und Herstellervorgaben.",
        "Immer möglich, wenn ein Geländer vorhanden ist.",
        "Grundsätzlich erlaubt, sobald die Bühne stillsteht."
      ],
      0,
      "Ein Ausstieg in der Höhe benötigt besondere Freigaben und Schutzmaßnahmen."
    ]
  ],
  "krane": [
    [
      "Vor dem Anheben einer Last ist ihre Masse unbekannt. Was ist richtig?",
      "Die Masse lässt sich nicht sicher schätzen.",
      [
        "Erst kurz anheben und dann entscheiden.",
        "Masse ermitteln und mit zulässiger Tragfähigkeit bzw. Lastdiagramm abgleichen.",
        "Ein Kran kann jede Last bis zur maximalen Hakenhöhe tragen."
      ],
      1,
      "Ohne sichere Kenntnis von Lastgewicht und Tragfähigkeit ist ein kontrollierter Hebevorgang nicht möglich."
    ],
    [
      "Eine Person betritt den Bereich unter einer schwebenden Last. Was ist zu tun?",
      "Der Kran bewegt gerade eine Last.",
      [
        "Die Person soll sich beeilen.",
        "Das Signal zum schnellen Absenken geben.",
        "Gefahrenbereich sichern, Lastbewegung sicher unterbrechen; Personen nicht unter schwebenden Lasten dulden."
      ],
      2,
      "Der Aufenthalt im Gefahrenbereich schwebender Lasten muss vermieden werden."
    ],
    [
      "Wer gibt bei vereinbarter Einweiserführung die Zeichen?",
      "Kranführer und Einweiser haben sich abgestimmt.",
      [
        "Die eindeutig bestimmte einweisende Person nach vereinbarten Signalen; Not-Halt-Zeichen sind sofort zu beachten.",
        "Alle Umstehenden gleichzeitig.",
        "Wer am lautesten ruft."
      ],
      0,
      "Eindeutige Verständigung ist eine Grundvoraussetzung sicherer Lastbewegungen."
    ],
    [
      "Was ist bei auffälligen Geräuschen oder einer Störung des Kranes richtig?",
      "Eine Sicherheitseinrichtung reagiert unzuverlässig.",
      [
        "Betrieb fortsetzen, solange die Last leicht ist.",
        "Vorgang sicher stoppen, Mangel melden und Einsatz erst nach Klärung fortsetzen.",
        "Die Sicherheitseinrichtung abschalten."
      ],
      1,
      "Sicherheitsrelevante Funktionsstörungen müssen behoben werden, bevor der Kran weiter eingesetzt wird."
    ],
    [
      "Wie darf eine Last vor dem Transport angehoben werden?",
      "Die Anschlagmittel sind angeschlagen.",
      [
        "Sofort auf volle Höhe und mit hoher Geschwindigkeit.",
        "Mit ruckartigen Bewegungen Spannung aufbauen.",
        "Kontrolliert anheben und Sitz der Anschlagmittel sowie Stabilität der Last prüfen."
      ],
      2,
      "Ein kontrollierter Probeanhub kann Probleme mit Anschlagmitteln oder Schwerpunkt sichtbar machen."
    ]
  ],
  "lasten": [
    [
      "Welchen Einfluss hat ein größerer Neigungswinkel der Anschlagstränge?",
      "Eine Last wird mit einem mehrsträngigen Gehänge gehoben.",
      [
        "Die zulässige Tragfähigkeit kann sinken; die Kräfte in den Strängen steigen.",
        "Die Tragfähigkeit erhöht sich immer.",
        "Der Winkel spielt für die Tragfähigkeit keine Rolle."
      ],
      0,
      "Bei einem größeren Neigungswinkel steigen die Strangkräfte; die Tragfähigkeit ist entsprechend zu bewerten."
    ],
    [
      "Worauf ist bei der Wahl eines Anschlagmittels zuerst zu achten?",
      "Eine neue Last muss gehoben werden.",
      [
        "Nur auf die Farbe.",
        "Auf Lastgewicht, Schwerpunkt, Anschlagart und gekennzeichnete Tragfähigkeit.",
        "Nur auf die Länge des Anschlagmittels."
      ],
      1,
      "Anschlagmittel müssen für Last, Geometrie, Anschlagart und zulässige Tragfähigkeit geeignet sein."
    ],
    [
      "Ein Hebeband hat eine erkennbare Beschädigung. Was machst du?",
      "Es ist ein möglicherweise tragfähigkeitsrelevanter Schaden sichtbar.",
      [
        "Nur bei halber Last weiterverwenden.",
        "Die Stelle mit Klebeband sichern.",
        "Nicht verwenden, aussortieren bzw. sachkundig beurteilen lassen."
      ],
      2,
      "Beschädigte Anschlagmittel dürfen bei möglicher Sicherheitsgefährdung nicht eingesetzt werden."
    ],
    [
      "Warum wird die Schwerpunktlage vor dem Anheben geprüft?",
      "Die Last ist asymmetrisch geformt.",
      [
        "Damit die Last beim Heben nicht unkontrolliert kippt oder verrutscht.",
        "Damit der Kran schneller fahren kann.",
        "Weil der Schwerpunkt nur für das Absetzen wichtig ist."
      ],
      0,
      "Die Lage des Schwerpunkts beeinflusst das Verhalten der Last beim Anheben."
    ],
    [
      "Welcher Neigungswinkel darf bei einem üblichen mehrsträngigen Anschlag grundsätzlich nicht überschritten werden?",
      "Gemeint ist der Winkel zwischen Strang und Lot nach DGUV Regel 109-017.",
      [
        "90 Grad.",
        "60 Grad, sofern keine dafür ausdrücklich ausgelegte Sonderkonstruktion vorliegt.",
        "120 Grad."
      ],
      1,
      "DGUV Regel 109-017 nennt 60 Grad als Grenze für übliche Anschlagmittel."
    ]
  ],
  "bagger": [
    [
      "Was prüfst du zu Beginn der Arbeitsschicht an einer Erdbaumaschine?",
      "Du übernimmst die Maschine für den Einsatz.",
      [
        "Nur die Kraftstoffanzeige.",
        "Nur die Lackierung.",
        "Funktion der Bedieneinrichtungen und erkennbare Sicherheitsmängel."
      ],
      2,
      "DGUV Regel 100-500 Kapitel 2.12 fordert die Prüfung der Bedienfunktionen und Beobachtung auf Mängel."
    ],
    [
      "Bei der Kontrolle wird ein sicherheitsrelevanter Mangel festgestellt. Was gilt?",
      "Die Betriebssicherheit ist beeinträchtigt.",
      [
        "Betrieb einstellen und Mangel der zuständigen Person melden.",
        "Bis zum Schichtende besonders vorsichtig weiterarbeiten.",
        "Nur eine Notiz machen, aber ohne Meldung weiterarbeiten."
      ],
      0,
      "Bei gefährdenden Mängeln ist der Betrieb bis zur Behebung einzustellen."
    ],
    [
      "Eine Person steht im Schwenkbereich des Baggers. Wie verhältst du dich?",
      "Es droht eine gefährliche Bewegung.",
      [
        "Langsam schwenken, damit die Person ausweicht.",
        "Bewegung nicht ausführen; Gefahrenbereich räumen und absichern.",
        "Nur ein akustisches Signal geben und weitermachen."
      ],
      1,
      "Personen dürfen im Gefahrenbereich bewegter Arbeitseinrichtungen nicht gefährdet werden."
    ],
    [
      "Warum müssen Leitungen und andere Einbauten vor Erdarbeiten geklärt werden?",
      "Du beginnst eine neue Ausschachtung.",
      [
        "Weil sie nur die Arbeitsgeschwindigkeit beeinflussen.",
        "Weil Erdleitungen grundsätzlich immer sichtbar sind.",
        "Weil Beschädigungen an unterirdischen Leitungen erhebliche Gefahren verursachen können."
      ],
      2,
      "Vor Erdarbeiten sind mögliche Leitungen und Einbauten zu berücksichtigen und Schutzmaßnahmen festzulegen."
    ],
    [
      "Wie sicherst du eine abgestellte Erdbaumaschine?",
      "Die Schicht ist beendet.",
      [
        "Arbeitsausrüstung sicher absetzen und Maschine gegen unbeabsichtigte Bewegung und unbefugte Nutzung sichern.",
        "Motor laufen lassen und Schlüssel stecken lassen.",
        "Die Arbeitseinrichtung in maximal angehobener Position belassen."
      ],
      0,
      "Sicheres Abstellen verringert das Risiko unbeabsichtigter Bewegungen."
    ]
  ]
};
  const questions=Object.entries(sets).flatMap(([course,rows])=>rows.map(([title,context,answers,correct,why],index)=>Object.freeze({
    id:'extra-'+course+'-'+String(index+1).padStart(2,'0'),course,topic:course==='gabelstapler'?'grundlagen':course,
    title,context,answers:Object.freeze(answers),correct,why,reviewed:false,source:sources[course].title,sourceUrl:sources[course].url
  })));
  globalThis.ABBATE_PRACTICE_EXPANSION=Object.freeze({sources:Object.freeze(sources),questions:Object.freeze(questions)});
})();
