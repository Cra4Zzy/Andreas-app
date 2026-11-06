'use strict';
// Original Abbate study exercises, authored from public DGUV safety requirements.
// No copied DGUV sample questions or imported official answer keys.
// All content remains subject to Andreas' practical/specialist approval before certified use.
(() => {
  const specs={
  "gabelstapler": {
    "source": "DGUV Grundsatz 308-001 (2022), DGUV Vorschrift 68",
    "url": "https://publikationen.dguv.de/widgets/pdf/download/article/48",
    "items": [
      [
        "g-flurpruefung",
        "grundlagen",
        "Was gehört zu einer Sicht- und Funktionsprüfung vor Arbeitsbeginn?",
        "Vor dem ersten Einsatz des Tages.",
        "Nur Kraftstoffstand und Fahrzeugfarbe prüfen.",
        "Bremsen, Lenkung, Gabeln, Reifen und Sicherheitseinrichtungen nach Betriebsanleitung prüfen.",
        "Eine Probefahrt mit angehobener Last durchführen.",
        1,
        "Die arbeitstägliche Prüfung umfasst die sicherheitsrelevanten Teile und Funktionen gemäß Betriebsanleitung."
      ],
      [
        "g-rueckhalt",
        "grundlagen",
        "Wie gehst du mit dem vorhandenen Fahrerrückhaltesystem um?",
        "Der Stapler verfügt über ein vorgeschriebenes Rückhaltesystem.",
        "Es während der Fahrt ordnungsgemäß benutzen.",
        "Nur auf unebenen Böden benutzen.",
        "Es bei kurzen Fahrten außer Betrieb setzen.",
        0,
        "Vorgesehene Rückhaltesysteme sind entsprechend Herstellerangaben zu verwenden; sie schützen besonders bei Kippereignissen."
      ],
      [
        "g-mangelmelden",
        "grundlagen",
        "Was gilt für einen Stapler mit beschädigter Gabelzinke?",
        "Bei der Prüfung bemerkst du eine deutlich verbogene Zinke.",
        "Die Last möglichst auf die andere Zinke verteilen.",
        "Bis zur nächsten Wartung ausschließlich leichte Lasten fahren.",
        "Stapler nicht einsetzen und den Mangel der zuständigen Person melden.",
        2,
        "Beschädigte Lastaufnahmemittel können versagen; sicherheitsrelevante Mängel erfordern Stillsetzung bis zur Klärung."
      ],
      [
        "g-einweisung",
        "grundlagen",
        "Du wechselst auf einen Stapler mit anderer Bedienung. Was ist vor dem Einsatz erforderlich?",
        "Die Bedienung weicht von deinem bisherigen Fahrzeug ab.",
        "Eine gerätebezogene Einweisung und die Beachtung der Betriebsanleitung.",
        "Eine kurze Erklärung durch einen unbeteiligten Kollegen genügt immer.",
        "Keine zusätzliche Information, wenn du einen Staplerschein besitzt.",
        0,
        "Eine allgemeine Qualifizierung ersetzt nicht die erforderliche Einweisung in das tatsächlich eingesetzte Gerät."
      ],
      [
        "g-anbaugeraet",
        "grundlagen",
        "Du sollst ein Anbaugerät verwenden. Was prüfst du zuerst?",
        "Ein neues Arbeitsgerät verändert die Lastaufnahme.",
        "Ob das Anbaugerät zur Fahrzeugfreigabe und zur zulässigen Belastung passt.",
        "Nur, ob sich das Gerät optisch befestigen lässt.",
        "Ob das Anbaugerät ohne Dokumentation montiert werden kann.",
        0,
        "Anbaugeräte können Resttragfähigkeit und Lastschwerpunkt verändern; Freigaben und Tragfähigkeitsangaben sind zu prüfen."
      ],
      [
        "g-diagramm",
        "lasten",
        "Wofür benötigst du das Tragfähigkeitsdiagramm?",
        "Eine schwere Last liegt mit weit außen liegendem Schwerpunkt vor.",
        "Um den kürzesten Fahrweg festzulegen.",
        "Um die maximal zulässige Last in Abhängigkeit von Hubhöhe und Lastschwerpunkt zu beurteilen.",
        "Um die Tankfüllmenge zu bestimmen.",
        1,
        "Zulässige Lasten hängen unter anderem von Lastschwerpunktabstand und Hubhöhe ab."
      ],
      [
        "g-lastschwerpunkt",
        "lasten",
        "Was passiert typischerweise, wenn der Lastschwerpunkt weiter nach vorn rückt?",
        "Eine lange Last ragt weit vor die Gabelzinken.",
        "Die zulässige Tragfähigkeit kann sinken.",
        "Die Tragfähigkeit steigt immer.",
        "Der Abstand hat keinen Einfluss auf das Kippmoment.",
        0,
        "Ein größerer Abstand des Lastschwerpunkts vergrößert das Kippmoment und kann die zulässige Tragfähigkeit verringern."
      ],
      [
        "g-gabelabstand",
        "lasten",
        "Wie sollen die Gabelzinken eine passende Palette aufnehmen?",
        "Du willst eine gleichmäßig beladene Palette aufnehmen.",
        "Mit möglichst engem Zinkenabstand und nur an einer Ecke.",
        "Mit so großem Abstand, dass die Palette seitlich überkippt.",
        "Mit geeignetem Zinkenabstand und ausreichender Unterfahr- und Auflagefläche.",
        2,
        "Die Last muss sicher und möglichst gleichmäßig über die Gabelzinken abgestützt werden."
      ],
      [
        "g-schieflast",
        "lasten",
        "Eine Last ist instabil gestapelt. Was ist richtig?",
        "Kartons können beim Anheben herunterfallen.",
        "Langsam anfahren; die Ladung stabilisiert sich selbst.",
        "Last vor der Aufnahme ausreichend sichern oder neu zusammenstellen lassen.",
        "Last über Kopfhöhe anheben, damit sie nicht stört.",
        1,
        "Lose oder instabile Ladung kann herunterfallen und Personen gefährden; erst sichernde Maßnahmen durchführen."
      ],
      [
        "g-personen",
        "lasten",
        "Darf eine Person auf gewöhnlichen Gabelzinken angehoben werden?",
        "Ein Kollege möchte eine Leuchte erreichen.",
        "Ja, wenn der Kollege einen Helm trägt.",
        "Nein, für Personen sind nur dafür vorgesehene und zulässige Einrichtungen nach besonderen Vorgaben nutzbar.",
        "Ja, wenn nur eine geringe Höhe angefahren wird.",
        1,
        "Normale Gabelzinken sind keine Personenarbeitsbühne; Personentransport und -heben unterliegen besonderen Anforderungen."
      ],
      [
        "g-transporthoehe",
        "betrieb",
        "Wie transportierst du eine Palette üblicherweise?",
        "Der Fahrweg ist frei und eben.",
        "Mit nur so weit wie nötig angehobener Last und gemäß Betriebsanleitung.",
        "Mit möglichst hoch gehobener Last, um besser gesehen zu werden.",
        "Mit stark nach vorn geneigtem Hubmast unabhängig von der Last.",
        0,
        "Eine niedrige Transportstellung verringert das Kipp- und Anstoßrisiko; maßgeblich sind die Geräteanweisungen."
      ],
      [
        "g-kurvenfahrt",
        "betrieb",
        "Warum ist zügiges Kurvenfahren mit dem Stapler gefährlich?",
        "Du möchtest einen engen Weg schnell verlassen.",
        "Weil nur die Batterie schneller entladen wird.",
        "Weil der Stapler dadurch automatisch besser lenkt.",
        "Weil seitliche Kräfte die Standsicherheit beeinträchtigen und zum Umkippen führen können.",
        2,
        "Bei Kurvenfahrten wirken zusätzliche Kräfte; die Geschwindigkeit muss der Last und den Bedingungen angepasst werden."
      ],
      [
        "g-ladebruecke",
        "betrieb",
        "Was kontrollierst du vor dem Befahren einer Ladebrücke?",
        "Du sollst in einen Lkw fahren.",
        "Nur, ob der Weg breit genug aussieht.",
        "Tragfähigkeit, sichere Auflage und Sicherung gegen Verschieben sowie die Sicherung des Fahrzeugs.",
        "Nur, ob die Beleuchtung eingeschaltet ist.",
        1,
        "Ladebrücken und Fahrzeuge müssen gegen Bewegung gesichert und für die Belastung geeignet sein."
      ],
      [
        "g-fussgaenger",
        "betrieb",
        "Wie verhältst du dich an einem unübersichtlichen Kreuzungsbereich mit Fußgängern?",
        "Sichtbeziehungen sind eingeschränkt.",
        "Mit angepasster Geschwindigkeit fahren, erforderlichenfalls anhalten und für sichere Sicht sorgen.",
        "Stets Vorfahrt beanspruchen, wenn du eine Last trägst.",
        "Ausschließlich hupen und weiterfahren.",
        0,
        "Fußgänger haben besondere Schutzbedürfnisse; Geschwindigkeit, Sicht und Verständigung sind dem Verkehrsweg anzupassen."
      ],
      [
        "g-batterieladen",
        "betrieb",
        "Was ist beim Laden einer Antriebsbatterie besonders zu beachten?",
        "Es wird ein Batterieladeplatz genutzt.",
        "Der Ladeplatz kann ohne Rücksicht auf Herstellerhinweise ausgewählt werden.",
        "Offene Flammen sind zulässig, solange der Stapler steht.",
        "Geeigneter Ladebereich, ausreichende Lüftung und Vorgaben des Herstellers sowie zum Brand- und Explosionsschutz.",
        2,
        "Beim Laden können Gefährdungen durch elektrische Energie, Gase und Chemikalien entstehen; die vorgesehenen Schutzmaßnahmen sind einzuhalten."
      ]
    ]
  },
  "hebebuehnen": {
    "source": "DGUV Grundsatz 308-008, DGUV Information 208-019",
    "url": "https://publikationen.dguv.de/widgets/pdf/download/article/90",
    "items": [
      [
        "h-beauftragt",
        "hebebuehnen",
        "Unter welcher Voraussetzung darfst du eine Hubarbeitsbühne selbstständig bedienen?",
        "Du sollst eine Arbeitsbühne im Betrieb einsetzen.",
        "Wenn du einen Pkw-Führerschein besitzt.",
        "Wenn du geeignet, unterwiesen bzw. qualifiziert und vom Arbeitgeber beauftragt bist.",
        "Wenn du eine Arbeitsbühne schon einmal gesehen hast.",
        1,
        "Der Arbeitgeber muss Eignung, Befähigung und Beauftragung entsprechend den betrieblichen Anforderungen sicherstellen."
      ],
      [
        "h-vorpruefung",
        "hebebuehnen",
        "Was ist vor Beginn der Arbeit mit der Hubarbeitsbühne zu prüfen?",
        "Die Bühne stand über Nacht im Freien.",
        "Sicht- und Funktionsprüfung nach Herstellerangaben einschließlich Sicherheitseinrichtungen.",
        "Nur die Farbe und das Alter der Bühne.",
        "Ob das Arbeitsmaterial bereits auf der Plattform liegt.",
        0,
        "Vor dem Einsatz sind Maschine, Steuerungen, Notfunktionen und erkennbare Schäden gemäß Betriebsanleitung zu prüfen."
      ],
      [
        "h-tragfaehigkeit",
        "hebebuehnen",
        "Welche Angaben bestimmen die zulässige Belastung des Arbeitskorbs?",
        "Zwei Personen möchten zusätzlich Werkzeug mitnehmen.",
        "Die Personen dürfen das zulässige Gesamtgewicht frei schätzen.",
        "Nur das Gewicht der schwersten Person zählt.",
        "Die Tragfähigkeitsangabe für Personen, Werkzeuge und Material darf nicht überschritten werden.",
        2,
        "Die Nennlast bezieht sich auf die gesamte zulässige Belastung, einschließlich mitgeführtem Material."
      ],
      [
        "h-untergrund",
        "hebebuehnen",
        "Worauf achtest du vor dem Aufstellen einer Bühne mit Abstützungen?",
        "Du arbeitest nahe einer aufgefüllten Fläche.",
        "Nur auf die Reichweite des Auslegers.",
        "Auf Tragfähigkeit und Ebenheit des Untergrunds sowie auf geeignete Abstützung nach Anleitung.",
        "Auf eine möglichst geringe Zahl ausgefahrener Stützen.",
        1,
        "Unzureichender Untergrund oder unsachgemäße Abstützung können zum Verlust der Standsicherheit führen."
      ],
      [
        "h-wind",
        "hebebuehnen",
        "Starker Wind setzt ein. Wie gehst du vor?",
        "Du befindest dich mit einer Bühne im Freien.",
        "Herstellergrenzen beachten und bei Überschreitung den Betrieb einstellen beziehungsweise den Korb sicher absenken.",
        "Die Bühne möglichst weit ausfahren, damit sie stabiler steht.",
        "Nur dann reagieren, wenn lose Gegenstände herunterfallen.",
        0,
        "Die vom Hersteller zugelassenen Windbedingungen sind Einsatzgrenzen; Wind kann gefährliche zusätzliche Kräfte erzeugen."
      ],
      [
        "h-strom",
        "hebebuehnen",
        "Du musst in der Nähe einer Freileitung arbeiten. Was ist entscheidend?",
        "Eine spannungsführende Leitung liegt im Arbeitsbereich.",
        "Ein Helm ersetzt die Einhaltung des Sicherheitsabstands.",
        "Nur den Korb isolieren und ohne Abstimmung arbeiten.",
        "Gefahrenbereich klären und notwendige Schutzabstände oder andere geeignete Maßnahmen sicherstellen.",
        2,
        "Stromüberschlag ist auch ohne unmittelbaren Kontakt möglich; erforderliche Schutzmaßnahmen sind vor Einsatzbeginn festzulegen."
      ],
      [
        "h-notablass",
        "hebebuehnen",
        "Warum muss das Verfahren für den Notablass bekannt sein?",
        "Ein Ausfall der normalen Steuerung ist möglich.",
        "Damit bei einer Störung eine sichere Rettung entsprechend dem Gerät möglich ist.",
        "Damit das Gerät schneller im normalen Betrieb fährt.",
        "Um die regelmäßige Prüfung zu ersetzen.",
        0,
        "Notsteuerung, Notablass und Rettungskonzept müssen vor dem Einsatz bekannt und funktionsfähig sein."
      ],
      [
        "h-gelaender",
        "hebebuehnen",
        "Wie erreichst du zusätzliche Höhe im Arbeitskorb?",
        "Ein Montagepunkt liegt knapp über deiner Reichweite.",
        "Auf die Korbumwehrung steigen.",
        "Ein Brett auf das Geländer legen.",
        "Eine geeignete Bühne mit ausreichender Arbeitshöhe einsetzen; nicht auf Geländer steigen.",
        2,
        "Das Besteigen der Umwehrung oder improvisierte Erhöhungen gefährden den Absturzschutz."
      ],
      [
        "h-psaga",
        "hebebuehnen",
        "Welche Vorgaben gelten für persönliche Absturzschutzausrüstung?",
        "Du nutzt eine Arbeitsbühne, für die ein Rückhaltesystem vorgesehen ist.",
        "Ein beliebiger Anschlagpunkt außerhalb des Korbs reicht immer.",
        "Gefährdungsbeurteilung, Herstellerangaben und geeignete Anschlagpunkte beachten.",
        "Auf jede Sicherung verzichten, wenn der Korb ein Geländer besitzt.",
        1,
        "Ob und welche PSAgA nötig ist, ergibt sich aus Gefährdungsbeurteilung, Bühnenbauart und Betriebsanleitung."
      ],
      [
        "h-verfahren",
        "hebebuehnen",
        "Darf die Bühne mit angehobener Plattform verfahren werden?",
        "Die Arbeitsstelle liegt wenige Meter weiter.",
        "Nur wenn das Modell und die Einsatzbedingungen es nach Herstellerangaben zulassen.",
        "Immer, solange alle Personen sich festhalten.",
        "Nein, unabhängig von Bauart und Herstellerfreigabe niemals.",
        0,
        "Das Verfahren in angehobener Stellung ist geräteabhängig und nur innerhalb der zugelassenen Betriebsbedingungen zulässig."
      ],
      [
        "h-kollision",
        "hebebuehnen",
        "Was ist bei Arbeiten nahe Kranen oder anderen Maschinen zu organisieren?",
        "Bewegte Teile könnten den Arbeitskorb erreichen.",
        "Nichts; der Arbeitskorb ist immer sichtbar.",
        "Den Arbeitskorb grundsätzlich über die anderen Maschinen fahren.",
        "Arbeitsbereiche koordinieren, damit keine Kollision oder Quetschstelle entsteht.",
        2,
        "Gleichzeitiger Maschinenbetrieb erfordert abgestimmte Arbeitsabläufe und Schutz vor Anstoßen oder Einklemmen."
      ],
      [
        "h-einstieg",
        "hebebuehnen",
        "Wie erfolgt das Betreten oder Verlassen des Arbeitskorbs?",
        "Du erreichst den Korb auf Bodenhöhe.",
        "Über das Außengeländer klettern.",
        "Über den vorgesehenen Zugang bei sicherer Stellung gemäß Betriebsanleitung.",
        "Über eine daneben gestellte Leiter bei ausgefahrenem Ausleger.",
        1,
        "Vorgesehene Zugänge und Herstellerangaben müssen eingehalten werden; unkontrolliertes Übersteigen birgt Absturzgefahr."
      ],
      [
        "h-defekt",
        "hebebuehnen",
        "Die Not-Aus-Einrichtung funktioniert nicht. Was tust du?",
        "Bei der Prüfung stellst du den Mangel fest.",
        "Die Bühne nicht einsetzen und den Mangel melden.",
        "Weiterarbeiten, wenn die normale Steuerung funktioniert.",
        "Den Schalter abkleben, damit niemand ihn betätigt.",
        0,
        "Versagen einer Sicherheitseinrichtung ist ein sicherheitsrelevanter Mangel und verhindert den sicheren Betrieb."
      ],
      [
        "h-sicht",
        "hebebuehnen",
        "Die Fahrbewegung ist wegen eines Hindernisses nicht einsehbar. Wie gehst du vor?",
        "Du sollst eine fahrbare Bühne versetzen.",
        "Ohne Sicht langsam weiterfahren.",
        "Nur auf den Abstandsanzeiger verlassen.",
        "Bewegung stoppen und Sicht oder sichere Einweisung nach Betriebsanweisung sicherstellen.",
        2,
        "Vor dem Verfahren müssen Personen, Hindernisse und Verkehrswege sicher überblickt werden."
      ],
      [
        "h-rettung",
        "hebebuehnen",
        "Was gehört zur Einsatzplanung bei Arbeiten in größerer Höhe?",
        "Die Bühne wird in einem abgelegenen Bereich eingesetzt.",
        "Nur die geplante Arbeitsdauer.",
        "Ein geeignetes Rettungskonzept mit erreichbaren, eingewiesenen Personen und Notablassverfahren.",
        "Die Annahme, dass die Feuerwehr jede Störung sofort lösen wird.",
        1,
        "Eine wirksame Rettung muss vorab organisiert sein, auch wenn die normale Steuerung ausfällt."
      ]
    ]
  },
  "krane": {
    "source": "DGUV Grundsatz 309-003, DGUV Vorschrift 52",
    "url": "https://publikationen.dguv.de/regelwerk/dguv-grundsaetze/45/auswahl-unterweisung-und-befaehigungsnachweis-von-kranfuehrern",
    "items": [
      [
        "k-befaehigung",
        "krane",
        "Was ist für das selbstständige Führen eines Krans erforderlich?",
        "Ein neuer Mitarbeiter soll Kranarbeiten übernehmen.",
        "Eignung und erforderliche Qualifikation, Einweisung sowie entsprechende Beauftragung.",
        "Ein Pkw-Führerschein reicht aus.",
        "Einmaliges Zuschauen genügt.",
        0,
        "Kranarbeiten dürfen nur befähigten und beauftragten Personen übertragen werden; Geräteeinweisung gehört dazu."
      ],
      [
        "k-funktionspruefung",
        "krane",
        "Was gehört vor Schichtbeginn zur Kontrolle des Krans?",
        "Du übernimmst einen Hallenkran.",
        "Nur die Laufzeit auf dem Typenschild ablesen.",
        "Sicherheitsrelevante Funktionen und sichtbare Mängel nach Betriebsanleitung kontrollieren.",
        "Den Kran ohne Kontrolle mit maximaler Last testen.",
        1,
        "Die vorgeschriebene Einsatzkontrolle dient dazu, gefährliche Mängel frühzeitig zu erkennen."
      ],
      [
        "k-traglast",
        "krane",
        "Welche Bedeutung hat die zulässige Tragfähigkeit?",
        "Eine Last soll angehoben werden.",
        "Sie ist eine unverbindliche Empfehlung.",
        "Sie gilt nur bei vollständig eingefahrenem Haken.",
        "Die für den jeweiligen Betriebszustand zulässige Tragfähigkeit darf nicht überschritten werden.",
        2,
        "Zulässige Lasten können bei bestimmten Kranarten von Ausladung, Auslegerstellung und Rüstung abhängen."
      ],
      [
        "k-personen",
        "krane",
        "Was gilt für Personen unter schwebenden Lasten?",
        "Die Last wird über einen Arbeitsbereich bewegt.",
        "Der Gefahrenbereich ist freizuhalten; niemand darf unter die schwebende Last treten.",
        "Ein Helm erlaubt den Aufenthalt direkt darunter.",
        "Kurzes Unterqueren ist zulässig, wenn der Kran langsam fährt.",
        0,
        "Schwebende Lasten bergen Absturz- und Quetschgefahren; Personen sind aus dem Gefahrenbereich fernzuhalten."
      ],
      [
        "k-signale",
        "krane",
        "Du kannst den Anschläger nicht sehen und erhältst widersprüchliche Signale. Was tust du?",
        "Die Verständigung ist unklar.",
        "Den letzten Fahrbefehl fortsetzen.",
        "Die Bewegung stoppen und die Verständigung eindeutig klären.",
        "Die Last schneller absetzen, ohne Rücksprache.",
        1,
        "Sichere Lastbewegungen setzen eindeutige Signale und klare Kommunikation voraus."
      ],
      [
        "k-sicht",
        "krane",
        "Wer unterstützt beim Transport, wenn der Kranführer den Lastweg nicht vollständig einsehen kann?",
        "Ein Hallenpfeiler verdeckt den Weg.",
        "Eine zufällig vorbeigehende Person ohne Absprache.",
        "Niemand; nur der Haken ist entscheidend.",
        "Eine geeignete, eingewiesene Person mit eindeutig vereinbarter Verständigung.",
        2,
        "Wenn der Lastweg nicht einsehbar ist, ist eine geeignete Einweisung oder andere sichere Lösung erforderlich."
      ],
      [
        "k-ruck",
        "krane",
        "Warum sind ruckartige Kranbewegungen zu vermeiden?",
        "Eine schwere Last beginnt zu pendeln.",
        "Sie erzeugen zusätzliche dynamische Beanspruchungen und können die Last destabilisieren.",
        "Sie vermindern grundsätzlich jede Pendelbewegung.",
        "Sie erhöhen stets die Nenntragfähigkeit.",
        0,
        "Beschleunigungs- und Bremskräfte erhöhen die Beanspruchung von Kran und Anschlagmitteln."
      ],
      [
        "k-sperrbereich",
        "krane",
        "Was ist vor dem Schwenken einer Last in einem gemeinsam genutzten Bereich zu prüfen?",
        "Andere Beschäftigte arbeiten in der Nähe.",
        "Ob die Last optisch zum Kran passt.",
        "Ob der Gefahrenbereich gesichert ist und keine Personen gefährdet werden.",
        "Ob die Last möglichst hoch über allen Personen geführt werden kann.",
        1,
        "Schwenk- und Lastweg müssen frei von ungeschützten Personen sein."
      ],
      [
        "k-stuetzen",
        "krane",
        "Was ist bei einem Mobilkran mit Abstützungen entscheidend?",
        "Ein Kran wird auf teilweise aufgefülltem Boden aufgestellt.",
        "Nur die Breite der Fahrbahn.",
        "Die Farbe der Abstützteller.",
        "Tragfähiger Untergrund sowie Abstützung und Lastverteilung nach Aufstell- und Herstellerangaben.",
        2,
        "Die Aufstellung beeinflusst die Standsicherheit maßgeblich, besonders bei wechselnden Bodenverhältnissen."
      ],
      [
        "k-wetter",
        "krane",
        "Eine Windböe bringt die Last stark ins Pendeln. Was ist richtig?",
        "Du arbeitest im Freien.",
        "Bewegung sicher anhalten und zulässige Einsatzbedingungen beachten.",
        "Die Bewegung ruckartig beschleunigen.",
        "Die Last trotz Überschreitung der Herstellergrenzen weiterheben.",
        0,
        "Wind und Pendelbewegungen können Last und Kran destabilisieren; Einsatzgrenzen sind einzuhalten."
      ],
      [
        "k-freileitung",
        "krane",
        "Was gilt beim Kraneinsatz in der Nähe elektrischer Freileitungen?",
        "Ausleger oder Last könnten sich der Leitung nähern.",
        "Mit einer nichtleitenden Last sind Abstände unwichtig.",
        "Gefahrenbereich und erforderliche Schutzmaßnahmen vor Arbeitsbeginn mit den Verantwortlichen klären.",
        "Den Kranführer nur auf die eigene Reaktion verlassen.",
        1,
        "Es bestehen Gefahren durch Berührung und Spannungsüberschlag; sichere Schutzabstände oder andere Maßnahmen sind erforderlich."
      ],
      [
        "k-sichern",
        "krane",
        "Was machst du, bevor du den Kran verlässt?",
        "Die Arbeit wird unterbrochen.",
        "Die Last schwebend hängen lassen.",
        "Den Kran mit laufendem Antrieb unbeaufsichtigt stehen lassen.",
        "Last sicher absetzen und den Kran gemäß Betriebsanleitung sichern.",
        2,
        "Schwebende Lasten dürfen nicht unkontrolliert zurückgelassen werden; Kran und Last sind sicher abzustellen."
      ],
      [
        "k-lastanschlag",
        "krane",
        "Woran erkennst du, ob das verwendete Anschlagmittel geeignet ist?",
        "Die Last soll mit einem Hebeband gehoben werden.",
        "An Kennzeichnung, Tragfähigkeit, Zustand und Eignung für die Anschlagart.",
        "Allein an der Farbe des Hebebandes.",
        "Daran, dass es bereits gestern verwendet wurde.",
        0,
        "Tragfähigkeit und Zustand müssen unter Berücksichtigung der Anschlagbedingungen ausreichend sein."
      ],
      [
        "k-stopp",
        "krane",
        "Eine Person betritt unerwartet den Lastweg. Was tust du?",
        "Der Kran bewegt gerade eine Last.",
        "Die Bewegung unverzüglich sicher stoppen und den Gefahrenbereich räumen lassen.",
        "Nur ein Warnsignal geben und weiterfahren.",
        "Die Last höher anheben und darüber hinwegfahren.",
        0,
        "Personen müssen vor Lastbewegungen geschützt werden; bei unmittelbarer Gefährdung ist die Bewegung zu stoppen."
      ],
      [
        "k-neuerkran",
        "krane",
        "Du erhältst einen Kran mit einer unbekannten Steuerung. Was ist richtig?",
        "Die Bedienelemente sind anders als bisher.",
        "Die üblichen Tasten auf Verdacht ausprobieren.",
        "Eine andere Person ohne Ausbildung vorfahren lassen.",
        "Vor dem selbstständigen Einsatz die erforderliche gerätebezogene Einweisung erhalten.",
        2,
        "Auch erfahrene Kranführer benötigen Kenntnisse der konkret eingesetzten Steuerung, Schutzeinrichtungen und Grenzen."
      ]
    ]
  },
  "lasten": {
    "source": "DGUV Regel 109-017 (2020), DGUV Information 209-013",
    "url": "https://publikationen.dguv.de/regelwerk/dguv-regeln/3920/betreiben-von-lastaufnahmemitteln-und-anschlagmitteln-im-hebezeugbetrieb",
    "items": [
      [
        "a-kennzeichnung",
        "lasten",
        "Woran erkennst du die zulässige Belastbarkeit eines Anschlagmittels?",
        "Du möchtest ein Anschlagmittel auswählen.",
        "Am Materialgeruch.",
        "An der geeigneten, lesbaren Tragfähigkeitskennzeichnung und Herstellerangabe.",
        "An der Länge der Lagerzeit.",
        1,
        "Die zulässige Tragfähigkeit wird durch Kennzeichnung und Einsatzbedingungen bestimmt."
      ],
      [
        "a-sichtpruefung",
        "lasten",
        "Du bemerkst einen deutlichen Schnitt im Hebeband. Wie gehst du vor?",
        "Das Band soll eine Last tragen.",
        "Das Band nicht verwenden und der Prüfung bzw. Aussonderung zuführen.",
        "Den Schnitt mit Klebeband abdecken.",
        "Es nur für besonders leichte Lasten verwenden.",
        0,
        "Beschädigte textile Anschlagmittel können versagen und müssen nach den Ablegekriterien beurteilt werden."
      ],
      [
        "a-neigungswinkel",
        "lasten",
        "Was passiert bei größerem Neigungswinkel der Anschlagstränge zur Senkrechten?",
        "Ein zweisträngiges Gehänge spreizt sich stärker.",
        "Die Strangkräfte sinken immer.",
        "Die Strangkräfte bleiben gleich.",
        "Die Kräfte in den Strängen steigen; zulässige Winkel und Tragfähigkeiten sind einzuhalten.",
        2,
        "Mit zunehmender Spreizung steigt die Zugkraft je tragendem Strang."
      ],
      [
        "a-schwerpunkt",
        "lasten",
        "Warum musst du den Schwerpunkt der Last kennen?",
        "Die Last ist ungleichmäßig aufgebaut.",
        "Damit die Last beim Anheben stabil bleibt und nicht unkontrolliert kippt.",
        "Um die Farbe der Anschlagmittel auszuwählen.",
        "Damit die Last schneller gedreht werden kann.",
        0,
        "Ungünstige Anschlagpunkte oder Schwerpunktlage können zu Kippen, Rutschen oder Schräghängen führen."
      ],
      [
        "a-kantenschutz",
        "lasten",
        "Ein Hebeband liegt an einer scharfen Bauteilkante an. Was ist zu tun?",
        "Das Bauteil soll angehoben werden.",
        "Die Last schnell anheben, bevor das Band beschädigt wird.",
        "Geeigneten Kantenschutz verwenden und Anschlagart prüfen.",
        "Nur die Lastfläche mit einem Tuch reinigen.",
        1,
        "Scharfe Kanten können tragende Fasern beschädigen; das Anschlagmittel ist entsprechend zu schützen."
      ],
      [
        "a-haken",
        "lasten",
        "Was beachtest du beim Einhängen eines Anschlagmittels?",
        "Du benutzt einen Lasthaken.",
        "Das Anschlagmittel seitlich auf die Hakenspitze legen.",
        "Die Sicherungsklappe dauerhaft offenhalten.",
        "Den Haken bestimmungsgemäß im Hakengrund belasten und Sicherungseinrichtungen beachten.",
        2,
        "Unzulässige Belastung der Hakenspitze und fehlende Sicherung können zum Aushängen führen."
      ],
      [
        "a-knoten",
        "lasten",
        "Darfst du ein zu langes Hebeband mit einem Knoten verkürzen?",
        "Die Anschlaglänge passt nicht.",
        "Nein; nur eine geeignete, zugelassene Anschlagart oder passendes Anschlagmittel verwenden.",
        "Ja, wenn der Knoten sehr fest gezogen wird.",
        "Ja, sofern die Last im Moment stillsteht.",
        0,
        "Knoten können textile Anschlagmittel erheblich schwächen und sind keine zulässige improvisierte Längenanpassung."
      ],
      [
        "a-probehub",
        "lasten",
        "Warum wird eine Last zunächst vorsichtig angehoben?",
        "Du möchtest sicher transportieren.",
        "Damit sie möglichst schnell pendelt.",
        "Um Sitz der Anschlagmittel, Stabilität und Schwerpunktlage zu kontrollieren.",
        "Weil sich die Tragfähigkeit dabei automatisch erhöht.",
        1,
        "Ein kontrollierter erster Hub hilft, Fehlanschlag und instabile Lastlage zu erkennen."
      ],
      [
        "a-lastweg",
        "lasten",
        "Wo dürfen sich Personen während des Lasttransports aufhalten?",
        "Die Last wird mit einem Kran verfahren.",
        "Direkt unter der Last mit Schutzhelm.",
        "Auf der Last, wenn sie festhalten können.",
        "Außerhalb des Gefahrenbereichs und nicht unter schwebenden Lasten.",
        2,
        "Auch bei sorgfältigem Anschlagen bleiben Gefahren durch fallende oder pendelnde Lasten."
      ],
      [
        "a-haende",
        "lasten",
        "Wie vermeidest du Quetschverletzungen beim Absetzen?",
        "Die Last nähert sich der Auflagefläche.",
        "Hände und Füße aus dem Quetschbereich halten und geeignete Hilfsmittel verwenden.",
        "Die Last mit der bloßen Hand unterfassen.",
        "Zwischen Last und Wand stehen, um die Lage zu korrigieren.",
        0,
        "Zwischen Last und Auflage entstehen gefährliche Quetschstellen."
      ],
      [
        "a-vierstraenge",
        "lasten",
        "Was gilt für die Lastverteilung bei einem viersträngigen Gehänge ohne Lastausgleich?",
        "Eine starre Last wird angeschlagen.",
        "Alle vier Stränge tragen zwangsläufig gleich viel.",
        "Ohne Nachweis der gleichmäßigen Verteilung darf die Tragfähigkeit nicht pauschal für vier gleich belastete Stränge angesetzt werden.",
        "Der Neigungswinkel ist dann unerheblich.",
        1,
        "Ungleiche Strangbelastung ist bei starren Lasten möglich; Bemessung und zulässige Tragfähigkeit müssen das berücksichtigen."
      ],
      [
        "a-chemikalien",
        "lasten",
        "Was gilt beim Einsatz textiler Anschlagmittel in Kontakt mit Chemikalien?",
        "Du arbeitest mit einer unbekannten Flüssigkeit.",
        "Die Farbe des Bands zeigt zuverlässig die Beständigkeit.",
        "Jedes textile Band ist gegen alle Chemikalien beständig.",
        "Beständigkeit und Herstellerangaben prüfen; ungeeignete Mittel nicht verwenden.",
        2,
        "Chemikalien können Anschlagmittel angreifen und deren Tragfähigkeit unbemerkt mindern."
      ],
      [
        "a-aufbewahrung",
        "lasten",
        "Wie werden Anschlagmittel nach dem Gebrauch gelagert?",
        "Der Einsatz ist beendet.",
        "Sauber, trocken und vor Beschädigung geschützt nach Herstellervorgaben.",
        "Unter einer ungeschützten Last am Boden eingeklemmt.",
        "An einem beliebigen scharfen Haken im Freien.",
        0,
        "Geeignete Lagerung verhindert vorzeitigen Verschleiß und erleichtert die Sichtprüfung."
      ],
      [
        "a-auswahl",
        "lasten",
        "Was ist bei empfindlichen oder scharfkantigen Lasten besonders zu berücksichtigen?",
        "Eine lackierte Maschinenkomponente soll bewegt werden.",
        "Nur die Transportgeschwindigkeit.",
        "Geeignete Anschlagmittel und Schutzmaßnahmen für Lastoberfläche und Kanten.",
        "Unabhängig von der Last immer das gleiche Stahlseil.",
        1,
        "Anschlagart und Material müssen zur Geometrie, Oberfläche und Gefährdung passen."
      ],
      [
        "a-abstimmung",
        "lasten",
        "Der Kranführer hat keine Sicht auf dich. Wie gibst du Anweisungen?",
        "Du bist als Anschläger eingesetzt.",
        "Du winkst beliebig, bis eine Bewegung beginnt.",
        "Du gibst nur einmal einen Ruf und gehst weg.",
        "Über eindeutig vereinbarte Zeichen oder eine andere zuverlässige Verständigung.",
        2,
        "Anschläger und Kranführer müssen eindeutig kommunizieren; bei Unklarheit ist die Bewegung zu stoppen."
      ]
    ]
  },
  "bagger": {
    "source": "DGUV Grundsatz 301-005 (2022), für Hydraulikbagger und Radlader",
    "url": "https://publikationen.dguv.de/widgets/pdf/download/article/4418",
    "items": [
      [
        "b-qualifikation",
        "bagger",
        "Was braucht eine Person für das sichere Führen eines Hydraulikbaggers im Betrieb?",
        "Eine neue Person soll Baustellenarbeiten übernehmen.",
        "Geeignete Qualifikation, gerätebezogene Unterweisung und erforderliche Beauftragung.",
        "Ausschließlich einen Pkw-Führerschein.",
        "Nur eine kurze Beobachtung der Bedienung.",
        0,
        "Der Arbeitgeber muss die notwendige Befähigung sicherstellen und die Bedienperson passend zur Aufgabe unterweisen."
      ],
      [
        "b-pruefung",
        "bagger",
        "Was gehört zur arbeitstäglichen Maschinenkontrolle?",
        "Du übernimmst einen Bagger.",
        "Die Lackfarbe und die Sitzpolster kontrollieren.",
        "Sichtkontrolle und Funktionsprüfungen nach Betriebsanleitung, etwa auf Leckagen und Schäden.",
        "Den Ausleger bei voller Geschwindigkeit bis zum Anschlag bewegen.",
        1,
        "Beschädigungen an Hydraulik, Fahrwerk und Sicherheitseinrichtungen können zu schweren Unfällen führen."
      ],
      [
        "b-leitungen",
        "bagger",
        "Was muss vor Erdarbeiten über unterirdische Leitungen bekannt sein?",
        "Du sollst einen Graben ausheben.",
        "Nur die ungefähre Tiefe der geplanten Baugrube.",
        "Die Farbe der oberirdischen Markierungen genügt.",
        "Lage möglicher Leitungen klären und geeignete Sicherungs- und Erkundungsmaßnahmen festlegen.",
        2,
        "Strom-, Gas- oder Wasserleitungen können bei Beschädigung lebensgefährliche Folgen haben."
      ],
      [
        "b-schwenkbereich",
        "bagger",
        "Wie schützt du Personen im Schwenkbereich des Baggers?",
        "Du hebst Material mit dem Ausleger auf.",
        "Gefahrenbereich absperren beziehungsweise sichern und Personen fernhalten.",
        "Vor dem Schwenken nur die Schaufel langsam bewegen.",
        "Den Bereich über die Köpfe hinweg überfahren.",
        0,
        "Schwenkende Oberwagen und Arbeitsgeräte erzeugen Quetsch- und Anstoßgefahren."
      ],
      [
        "b-boeschung",
        "bagger",
        "Was ist beim Arbeiten in der Nähe einer Baugrubenkante wichtig?",
        "Der Bagger steht auf gewachsenem oder aufgefülltem Boden.",
        "Die Grabtiefe allein bestimmt die zulässige Aufstellung.",
        "Tragfähigkeit und Sicherung der Kante sowie erforderliche Abstände nach Gefährdungsbeurteilung beachten.",
        "So dicht wie möglich an den Rand fahren, um Reichweite zu sparen.",
        1,
        "Bei unzureichendem Abstand oder tragfähigem Boden kann die Böschung versagen und die Maschine abstürzen."
      ],
      [
        "b-standsicherheit",
        "bagger",
        "Warum sind Neigung und Untergrund beim Einsatz entscheidend?",
        "Die Baustelle liegt an einem Hang.",
        "Die Maschine steht auf jedem Untergrund gleich stabil.",
        "Raupenfahrwerke schließen jede Kippgefahr aus.",
        "Unebenheiten und Gefälle können die Standsicherheit beeinflussen; Einsatzgrenzen beachten.",
        2,
        "Die Stand- und Kippsicherheit hängt von Boden, Ausrüstung, Last und Maschinenstellung ab."
      ],
      [
        "b-wechselgeraet",
        "bagger",
        "Was prüfst du nach dem Wechsel einer Baggerschaufel über einen Schnellwechsler?",
        "Ein neues Anbaugerät wurde montiert.",
        "Ob es entsprechend Betriebsanleitung korrekt verriegelt und gesichert ist.",
        "Nur, ob die Schaufel farblich passt.",
        "Ob die Hydraulik möglichst leise arbeitet.",
        0,
        "Fehlerhafte Verriegelungen können dazu führen, dass Anbaugeräte herabfallen."
      ],
      [
        "b-heben",
        "bagger",
        "Was ist beim Heben einer frei hängenden Last mit dem Bagger zu beachten?",
        "Der Bagger wird zum Hebeeinsatz verwendet.",
        "Nur die übliche Grabkraft ist entscheidend.",
        "Zulässige Hublast, geeignete Anschlagpunkte und vorgeschriebene Schutzeinrichtungen beachten.",
        "Die Last kann an den Zähnen der Schaufel eingehängt werden.",
        1,
        "Heben ist nur innerhalb der vorgesehenen Betriebsbedingungen mit geeigneter Ausstattung zulässig."
      ],
      [
        "b-rueckwaerts",
        "bagger",
        "Du musst rückwärtsfahren, siehst aber den Fahrweg nicht. Was ist richtig?",
        "Andere Beschäftigte sind in der Nähe.",
        "Ohne Sicht vorsichtig losfahren.",
        "Nur hupen und weiterfahren.",
        "Anhalten, Sicht und Gefahrenbereich sicherstellen oder eine geeignete Einweisung organisieren.",
        2,
        "Rückwärtsfahrten dürfen Personen nicht gefährden; eingeschränkte Sicht erfordert zusätzliche Maßnahmen."
      ],
      [
        "b-kabel",
        "bagger",
        "Der Ausleger könnte in die Nähe einer Freileitung gelangen. Was tust du?",
        "Du arbeitest auf einer engen Baustelle.",
        "Vorher Gefahrenbereich und geeignete Schutzmaßnahmen mit den Verantwortlichen klären.",
        "Die Leitung ignorieren, wenn der Ausleger lackiert ist.",
        "Den Ausleger nur besonders schnell bewegen.",
        0,
        "Elektrische Gefährdungen bestehen durch Berührung und Überschlag; sichere Abstände und Schutzmaßnahmen sind nötig."
      ],
      [
        "b-verlassen",
        "bagger",
        "Wie stellst du den Bagger vor dem Verlassen ab?",
        "Du machst eine Pause.",
        "Den Ausleger frei schwebend stehen lassen.",
        "Arbeitsausrüstung sicher absetzen, Maschine gegen Bewegung und unbefugte Nutzung sichern.",
        "Den Motor laufen lassen und die Kabine offen lassen.",
        1,
        "Abgesenkte Arbeitsausrüstung und Sicherung gegen unbeabsichtigte Bewegung vermindern Unfallgefahren."
      ],
      [
        "b-hydraulik",
        "bagger",
        "Du bemerkst Hydrauliköl unter hohem Druck an einer beschädigten Leitung. Was ist richtig?",
        "Eine Leitung ist undicht.",
        "Die Leckage mit der Hand ertasten.",
        "Unter Druck eine neue Schelle anbringen.",
        "Maschine sicher stillsetzen, Druck abbauen lassen und Reparatur durch befugtes Fachpersonal veranlassen.",
        2,
        "Hydraulikflüssigkeit unter hohem Druck kann schwerste Verletzungen verursachen; nie mit der Hand nach Lecks suchen."
      ],
      [
        "b-unterbau",
        "bagger",
        "Welche Gefahr besteht beim Befahren eines nicht tragfähigen Untergrunds?",
        "Der Boden ist nach Regen aufgeweicht.",
        "Die Maschine kann einsinken, rutschen oder kippen.",
        "Das Laufwerk wird automatisch breiter.",
        "Der Schwenkbereich wird dadurch sicherer.",
        0,
        "Unzureichende Tragfähigkeit kann die Stand- und Fahrsicherheit erheblich beeinträchtigen."
      ],
      [
        "b-arbeitsgeraet",
        "bagger",
        "Darf jemand unter einem angehobenen Arbeitsgerät arbeiten?",
        "Eine Person möchte unter der Schaufel etwas kontrollieren.",
        "Ja, wenn der Motor im Leerlauf läuft.",
        "Nein, nicht ohne die dafür vorgeschriebene sichere Abstützung und Sicherung der Arbeitsausrüstung.",
        "Ja, wenn die Person einen Schutzhelm trägt.",
        1,
        "Hydraulische Einrichtungen können absinken; Wartungsarbeiten benötigen gesicherte Arbeitsmittel."
      ],
      [
        "b-geraeteart",
        "bagger",
        "Du wechselst von einem Hydraulikbagger auf einen Radlader. Was ist erforderlich?",
        "Bedienung und Bewegungsverhalten sind unterschiedlich.",
        "Nur das gleiche Schuhwerk.",
        "Eine Probefahrt ohne Einweisung.",
        "Die für den neuen Maschinentyp erforderliche Qualifizierung beziehungsweise Einweisung.",
        2,
        "Die Befähigung muss zur eingesetzten Maschinenart und den konkreten betrieblichen Anforderungen passen."
      ]
    ]
  }
};
  const courses=Object.freeze(Object.fromEntries(Object.entries(specs).map(([id,s])=>
    [id,Object.freeze({source:s.source,url:s.url,reviewed:false})]
  )));
  const questions=Object.freeze(Object.entries(specs).flatMap(([course,s])=>
    s.items.map(([id,topic,title,context,a,b,c,correct,why])=>Object.freeze({
      id,course,topic,title,context,answers:Object.freeze([a,b,c]),correct,why,
      source:s.source
    }))
  ));
  globalThis.ABBATE_PRACTICE_BANK=Object.freeze({courses,questions});
})();
