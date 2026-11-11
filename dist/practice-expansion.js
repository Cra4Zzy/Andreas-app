'use strict';
// Additional independently written DGUV-based exercises, not official examination questions.
// Fachliche Endfreigabe und Übersetzungen müssen von der Fahrschule geprüft werden.
(()=>{
 const current=globalThis.ABBATE_PRACTICE_BANK;
 if(!current||!Array.isArray(current.questions))throw Error('Original questions must load first');
 const extra={
  "sources": {
    "gabelstapler": [
      "DGUV Vorschrift 68, DGUV Grundsatz 308-001",
      "https://publikationen.dguv.de/regelwerk/dguv-vorschriften/1123/flurfoerderzeuge"
    ],
    "hebebuehnen": [
      "DGUV Information 208-019, DGUV Grundsatz 308-008",
      "https://publikationen.dguv.de/regelwerk/dguv-informationen/472/sicherer-umgang-mit-fahrbaren-hubarbeitsbuehnen"
    ],
    "krane": [
      "DGUV Information 209-012, DGUV Grundsatz 309-003",
      "https://publikationen.dguv.de/regelwerk/dguv-informationen/320/kranfuehrer"
    ],
    "lasten": [
      "DGUV Regel 109-017",
      "https://publikationen.dguv.de/regelwerk/dguv-regeln/3920/betreiben-von-lastaufnahmemitteln-und-anschlagmitteln-im-hebezeugbetrieb"
    ],
    "bagger": [
      "DGUV Regel 101-604, DGUV Grundsatz 301-005",
      "https://publikationen.dguv.de/regelwerk/dguv-regeln/3364/branche-tiefbau"
    ]
  },
  "rows": {
    "gabelstapler": [
      [
        "g-neigung",
        "betrieb",
        "Du fährst mit einem beladenen Stapler an einer Steigung. Was ist wichtig?",
        "Die Fahrstrecke hat deutliches Gefälle.",
        "Die Last immer talseitig führen, auch wenn sie schwer ist.",
        "Last bergseitig führen und betriebliche Vorgaben zum Befahren von Steigungen beachten.",
        "Unabhängig von der Fahrtrichtung die Gabel maximal hochfahren.",
        1,
        "Bei Steigungen und Gefällen ist die Last grundsätzlich bergseitig zu führen; Fahrzeug- und Betriebsanleitung sind zu beachten."
      ],
      [
        "g-gabelabsenken",
        "betrieb",
        "Warum muss die Gabel beim Abstellen abgesenkt werden?",
        "Der Stapler wird für eine Pause abgestellt.",
        "Damit andere die Gabel zum Hochsteigen nutzen können.",
        "Damit die Gabel von Weitem besser sichtbar bleibt.",
        "Damit von der Lastaufnahme keine unnötige Stolper- oder Verletzungsgefahr ausgeht.",
        2,
        "Abgesenkte Lastaufnahmemittel vermindern Unfallrisiken durch vorstehende oder ungesicherte Gabelzinken."
      ],
      [
        "g-fahrerwechsel",
        "grundlagen",
        "Ein Kollege möchte den Stapler ausleihen. Was muss vorliegen?",
        "Der Kollege besitzt nur eine mündliche Erlaubnis von dir.",
        "Er muss die erforderliche Befähigung und eine betriebliche Beauftragung besitzen.",
        "Deine eigene Beauftragung gilt automatisch auch für ihn.",
        "Ein privater Pkw-Führerschein genügt für jeden Betrieb.",
        0,
        "Das selbstständige Führen ist an persönliche Eignung, Ausbildung, Befähigung und betriebliche Beauftragung gebunden."
      ],
      [
        "g-ladungssicherung",
        "lasten",
        "Eine Palette enthält lose, übereinanderstehende Kartons. Was ist richtig?",
        "Ein Karton kann bei der Fahrt herunterfallen.",
        "Die Last vor dem Transport gegen Verrutschen und Herabfallen sichern.",
        "Nur auf besonders unebenem Boden langsam fahren.",
        "Lose Kartons durch eine höhere Gabelposition ausgleichen.",
        0,
        "Die Ladung muss stabil und gegen Herabfallen gesichert sein, bevor sie mit dem Flurförderzeug transportiert wird."
      ],
      [
        "g-bodenbelastung",
        "betrieb",
        "Vor dir liegt eine Decke mit beschränkter Tragfähigkeit. Wie entscheidest du?",
        "Die Strecke führt über eine Zwischenebene.",
        "Nur auf das Gewicht des Staplers ohne Last achten.",
        "Die zulässige Bodenbelastung für Stapler samt Last sicher klären.",
        "Mit Schwung fahren, damit die Decke kürzer belastet wird.",
        1,
        "Maßgeblich ist die gesamte tatsächliche Beanspruchung der Fläche einschließlich Fahrzeug, Last und dynamischer Einflüsse."
      ],
      [
        "g-verkehrswege",
        "betrieb",
        "Ein markierter Fußweg kreuzt deinen Fahrweg. Was ist richtig?",
        "Fußgänger können die Querung jederzeit betreten.",
        "Du darfst mit der Hupe immer Vorrang beanspruchen.",
        "Du darfst die Markierung ohne Beobachtung überfahren.",
        "Geschwindigkeit anpassen, Fußgänger beachten und nur bei freiem Weg weiterfahren.",
        2,
        "Verkehrswege sind mit Rücksicht auf Personen zu befahren; Warnzeichen ersetzen keine sichere Sicht und freie Strecke."
      ],
      [
        "g-parkbremse",
        "betrieb",
        "Du parkst einen Gabelstapler auf ebenem Gelände. Was gehört dazu?",
        "Du willst den Fahrerplatz für mehrere Minuten verlassen.",
        "Abstellen, Parkbremse betätigen und gegen unbefugte Verwendung sichern.",
        "Fahrzeug nur in Neutralstellung zurücklassen.",
        "Gabel in Kopfhöhe lassen, damit sie niemand berührt.",
        0,
        "Vor dem Verlassen muss das Flurförderzeug sicher stillgesetzt und gegen unbeabsichtigte Bewegung gesichert werden."
      ],
      [
        "g-typenschild",
        "lasten",
        "Welche Angabe ist bei der Belastung eines Staplers verbindlich?",
        "Du willst eine schwere Maschine aufnehmen.",
        "Die geschätzte Tragkraft aus der Fahrzeuggröße.",
        "Die Angaben des Herstellers im Last- beziehungsweise Tragfähigkeitsdiagramm.",
        "Das Gewicht der zuletzt transportierten Palette.",
        1,
        "Die zulässige Belastung ergibt sich aus den Herstellerangaben und hängt unter anderem von Lastschwerpunkt und Hubhöhe ab."
      ],
      [
        "g-tore",
        "betrieb",
        "Du näherst dich mit einem Stapler einer niedrigen Durchfahrt. Was prüfst du?",
        "Auf dem Fahrzeug steht eine hoch aufragende Last.",
        "Ob die Durchfahrt einschließlich Last und Anbaugerät sicher möglich ist.",
        "Nur die Höhe des Gabelträgers ohne Last.",
        "Ob du schneller hindurchfahren kannst, bevor das Tor schließt.",
        0,
        "Vor Durchfahrten sind lichte Höhe und Breite sowie Ausmaße von Last und Fahrzeug zu berücksichtigen."
      ],
      [
        "g-reifen",
        "grundlagen",
        "Beim täglichen Check findest du einen stark beschädigten Reifen. Was machst du?",
        "Am Reifen ist ein sicherheitsrelevanter Schaden sichtbar.",
        "Du fährst langsam bis zum regulären Wartungstermin.",
        "Du erhöhst den Reifendruck und fährst weiter.",
        "Du nimmst das Fahrzeug nicht in Betrieb und meldest den Schaden.",
        2,
        "Beschädigte Reifen können Standsicherheit und Fahrverhalten beeinträchtigen; der Mangel muss vor dem Einsatz geklärt werden."
      ]
    ],
    "hebebuehnen": [
      [
        "h-absperren",
        "betrieb",
        "Unter deiner Arbeitsbühne gehen Beschäftigte vorbei. Was ist nötig?",
        "Es besteht Gefahr durch herabfallende Werkzeuge.",
        "Ein geeigneter Schutz- beziehungsweise Sperrbereich unter der Arbeitsstelle.",
        "Lediglich ein Hinweis beim ersten Vorbeigehen.",
        "Werkzeuge möglichst weit außen am Korbrand lagern.",
        0,
        "Ein Arbeitsbereich unter erhöhten Arbeitsplätzen ist gegen Gefahren durch herabfallende Teile abzusichern."
      ],
      [
        "h-werkzeuge",
        "betrieb",
        "Wie transportierst du Werkzeuge im Arbeitskorb?",
        "Mehrere kleine Werkzeuge werden in der Höhe gebraucht.",
        "Lose auf das Geländer legen, damit sie griffbereit sind.",
        "So verstauen und sichern, dass sie nicht herunterfallen oder die Bedienung behindern.",
        "In der Hosentasche auf der Außenseite des Geländers befestigen.",
        1,
        "Lose Gegenstände können herabfallen und Personen gefährden; eine sichere Ablage ist erforderlich."
      ],
      [
        "h-abstuetzung",
        "grundlagen",
        "Eine Abstützung steht auf einem Kanaldeckel. Was ist zu prüfen?",
        "Du willst die Plattform anheben.",
        "Nur ob der Deckel trocken ist.",
        "Ob die Belastung an der Stelle gefahrlos aufgenommen werden kann.",
        "Ob die anderen Stützen nicht benutzt werden müssen.",
        1,
        "Untergrund und Aufstandsflächen müssen die Abstützkräfte sicher aufnehmen können; Abdeckungen sind gesondert zu bewerten."
      ],
      [
        "h-notaus",
        "betrieb",
        "Wann soll die Not-Aus-Einrichtung benutzt werden?",
        "Es entsteht unmittelbar eine gefährliche Bewegung.",
        "Nur am Ende einer regulären Schicht.",
        "Zum Anhalten bei akuter Gefahr gemäß Betriebsanleitung.",
        "Als Ersatz für das planmäßige Absenken.",
        1,
        "Der Not-Aus dient der Gefahrenabwehr, nicht der üblichen Steuerung oder dem normalen Abstellen."
      ],
      [
        "h-schraegstellung",
        "betrieb",
        "Die Neigungswarnung der Bühne spricht an. Wie reagierst du?",
        "Die Maschine steht auf einem geneigten Untergrund.",
        "Du ignorierst die Warnung bei geringer Arbeitshöhe.",
        "Du fährst trotz Warnung zur höchsten Hubposition.",
        "Du stoppst, bringst die Bühne nach Herstellerangaben in einen sicheren Zustand.",
        2,
        "Neigungswarnungen können unzureichende Standsicherheit anzeigen; weitere Bewegungen dürfen die Gefahr nicht vergrößern."
      ],
      [
        "h-umgebung",
        "grundlagen",
        "Was ist beim Aufstellen nahe einer Verkehrsfläche zu organisieren?",
        "Fahrzeuge können die Bühne berühren.",
        "Absicherung gegen Anfahren und geeignete Verkehrsführung.",
        "Den Arbeitskorb möglichst weit über die Fahrbahn schwenken.",
        "Nur ein Warnruf, bevor du hochfährst.",
        0,
        "Hubarbeitsbühnen müssen gegen Kollisionen mit Verkehrsteilnehmern geschützt werden; die Aufstellung ist entsprechend abzusichern."
      ],
      [
        "h-ueberlast",
        "lasten",
        "Die Überlastwarnung im Korb wird ausgelöst. Was tust du?",
        "Zusätzliche Werkzeuge wurden eingeladen.",
        "Mit höherer Geschwindigkeit die Arbeit beenden.",
        "Die zulässige Korblast herstellen und die Herstellervorgaben beachten.",
        "Das Warnsignal dauerhaft ausschalten.",
        1,
        "Die maximal zulässige Belastung des Korbs einschließlich Personen und Material darf nicht überschritten werden."
      ],
      [
        "h-quetschen",
        "betrieb",
        "Du fährst den Korb nahe unter ein Dach. Welche Gefahr ist besonders wichtig?",
        "Über dem Korb bleibt nur wenig Platz.",
        "Einklemmen beziehungsweise Quetschen zwischen Korb und Bauwerk.",
        "Dass der Motor mehr Kraftstoff verbraucht.",
        "Dass die Fahrtrichtung immer automatisch umkehrt.",
        0,
        "Enge Stellen oberhalb oder neben dem Arbeitskorb können schwere Quetschverletzungen verursachen."
      ],
      [
        "h-stromausfall",
        "betrieb",
        "Die Bühne bleibt in großer Höhe ohne Hauptantrieb stehen. Was ist richtig?",
        "Die normale Korbsteuerung reagiert nicht mehr.",
        "Du kletterst ohne Sicherung am Ausleger hinunter.",
        "Du wartest ohne Verständigung bis zum Schichtende.",
        "Die vorbereitete Rettung über geschulte Personen und Notablass einleiten.",
        2,
        "Für Störungen muss eine sichere Rettung geplant sein; geschulte Personen müssen Notfunktionen kennen."
      ],
      [
        "h-transportstellung",
        "grundlagen",
        "Wie bereitest du die Bühne für einen Transport vor?",
        "Die Hubarbeitsbühne wird auf ein geeignetes Fahrzeug verladen.",
        "Ausleger und Plattform entsprechend Betriebsanleitung in Transportstellung bringen.",
        "Die Bühne möglichst weit ausgefahren verzurren.",
        "Stützen ausgefahren lassen, damit sie mehr Platz beansprucht.",
        0,
        "Die vorgeschriebene Transportstellung und Ladungssicherung richten sich nach Hersteller- und Transportvorgaben."
      ]
    ],
    "krane": [
      [
        "k-bremsprobe",
        "grundlagen",
        "Was zeigt eine Funktionsprobe der Kranbremse vor dem Einsatz?",
        "Du möchtest eine Last sicher halten können.",
        "Ob die Bremse die Bewegung bestimmungsgemäß stoppt und hält.",
        "Nur ob die Kabinenbeleuchtung funktioniert.",
        "Ob der Haken automatisch eine Last aufnehmen kann.",
        0,
        "Vor dem Einsatz sind sicherheitsrelevante Funktionen entsprechend den Vorgaben zu prüfen."
      ],
      [
        "k-schraegzug",
        "lasten",
        "Darfst du eine seitlich stehende Last mit dem Kran schräg ziehen?",
        "Der Haken steht nicht senkrecht über der Last.",
        "Ja, wenn der Kran noch Tragreserve besitzt.",
        "Nein, Lasten dürfen nicht durch unzulässigen Schrägzug gezogen werden.",
        "Ja, wenn die Anschlagmittel besonders kurz sind.",
        1,
        "Schrägzug kann unkontrollierte Bewegungen sowie zusätzliche Belastungen von Kran und Anschlagmitteln hervorrufen."
      ],
      [
        "k-verhakt",
        "lasten",
        "Eine Last hängt an der Unterkonstruktion fest. Was ist richtig?",
        "Beim Anheben wird Widerstand spürbar.",
        "Du hebst weiter, bis sie sich löst.",
        "Du bewegst die Last ruckartig seitwärts.",
        "Du stoppst und lässt die Befestigung beziehungsweise Blockierung sicher beseitigen.",
        2,
        "Festsitzende Lasten dürfen nicht mit Gewalt losgerissen werden, da unzulässige Kräfte entstehen können."
      ],
      [
        "k-anzuheben",
        "lasten",
        "Was prüfst du beim ersten kurzen Anheben einer angeschlagenen Last?",
        "Die Last hebt wenige Zentimeter vom Boden ab.",
        "Ob sie im Gleichgewicht hängt und die Anschlagung sicher sitzt.",
        "Ob sich eine Person unmittelbar unter die Last stellen kann.",
        "Ob der Kran durch schnelles Drehen stabiler wird.",
        0,
        "Kurzes kontrolliertes Anheben dient dem Prüfen von Anschlagung, Gleichgewicht und sicherem Lastverhalten."
      ],
      [
        "k-lastweg",
        "betrieb",
        "Wo sollte der Transportweg einer Kranlast liegen?",
        "Mehrere Arbeitsplätze befinden sich unter dem möglichen Lastweg.",
        "Möglichst über besetzten Arbeitsplätzen.",
        "Auf einem geplanten, freigehaltenen Weg ohne gefährdete Personen.",
        "Immer diagonal durch den belebtesten Bereich.",
        1,
        "Lastwege müssen so organisiert werden, dass Personen nicht durch schwebende Lasten gefährdet werden."
      ],
      [
        "k-signalverlust",
        "betrieb",
        "Die Funkverbindung zum Einweiser bricht ab. Was tust du?",
        "Du kannst den Lastweg selbst nicht einsehen.",
        "Du setzt die Bewegung langsam fort.",
        "Du schwenkst probeweise in die bisherige Richtung.",
        "Du stoppst die Bewegung, bis eine eindeutige sichere Verständigung besteht.",
        2,
        "Bei fehlender Kommunikation darf eine unübersichtliche Lastbewegung nicht fortgesetzt werden."
      ],
      [
        "k-haken",
        "grundlagen",
        "Der Sicherheitshaken schließt nicht zuverlässig. Was ist richtig?",
        "Bei der Kontrolle fällt ein defekter Verschluss auf.",
        "Der Fehler muss vor weiterer Benutzung fachgerecht behoben werden.",
        "Du bindest den Verschluss mit einem Kabelbinder fest.",
        "Du benutzt den Haken nur bei leichten Lasten.",
        0,
        "Defekte Sicherungen von Lasthaken können zum Aushängen von Anschlagmitteln führen und müssen behoben werden."
      ],
      [
        "k-zugrichtung",
        "lasten",
        "Was ist für die senkrechte Aufnahme einer Last wichtig?",
        "Die Last soll aus einer Maschine gehoben werden.",
        "Der Kranhaken sollte über dem Lastschwerpunkt ausgerichtet sein.",
        "Der Haken soll möglichst seitlich angeordnet sein.",
        "Die Last muss vor dem Heben angeschoben werden.",
        0,
        "Eine möglichst senkrechte Kraftwirkung über dem Lastschwerpunkt vermeidet unzulässige Querkräfte und unkontrolliertes Ausschwenken."
      ],
      [
        "k-wartung",
        "grundlagen",
        "Am Kran fällt ein ungewohntes Schleifgeräusch auf. Wie gehst du vor?",
        "Das Geräusch tritt beim Heben auf.",
        "Die Geräuschentwicklung durch höhere Geschwindigkeit überdecken.",
        "Den Betrieb sicher stoppen, Mangel melden und klären lassen.",
        "Bis zur Pause ohne Hinweis weiterarbeiten.",
        1,
        "Auffällige Veränderungen können auf sicherheitsrelevante Schäden hinweisen und erfordern eine Prüfung."
      ],
      [
        "k-absetzen",
        "lasten",
        "Was muss beim Absetzen einer Kranlast gewährleistet sein?",
        "Eine schwere Last wird auf einer Unterlage positioniert.",
        "Die Last darf ungesichert auf einer schrägen Fläche liegen.",
        "Anschlagmittel werden entfernt, solange sie noch schwebt.",
        "Die Last steht stabil und ist gegen Kippen oder Wegrollen gesichert.",
        2,
        "Erst nach sicherem Absetzen und Herstellen der Standsicherheit darf die Last vom Anschlagmittel gelöst werden."
      ]
    ],
    "lasten": [
      [
        "l-schwerpunkt",
        "lasten",
        "Warum muss der Schwerpunkt vor dem Anschlagen bekannt sein?",
        "Eine asymmetrisch geformte Maschine soll transportiert werden.",
        "Damit die Last beim Anheben möglichst im Gleichgewicht bleibt.",
        "Damit die Anschlagmittel beliebig lang gewählt werden können.",
        "Damit die zulässige Tragfähigkeit keine Rolle spielt.",
        0,
        "Die Schwerpunktlage beeinflusst die Lastverteilung und das sichere Gleichgewicht beim Heben."
      ],
      [
        "l-etikett",
        "grundlagen",
        "Ein Hebeband hat kein lesbares Tragfähigkeitsetikett. Was ist richtig?",
        "Die Kennzeichnung ist unkenntlich geworden.",
        "Die Tragfähigkeit anhand der Farbe schätzen.",
        "Das Hebeband nicht benutzen, bis die Eignung eindeutig nachgewiesen ist.",
        "Das Band nur einmal für kleine Lasten einsetzen.",
        1,
        "Für Anschlagmittel sind geeignete Kennzeichnungen erforderlich; ungeklärte Tragfähigkeit schließt eine sichere Auswahl aus."
      ],
      [
        "l-kantenschutz",
        "lasten",
        "Ein Textilband liegt über einer scharfen Stahlkante. Was ist nötig?",
        "Die Last weist scharfe Kanten auf.",
        "Das Band möglichst stramm ungeschützt ziehen.",
        "Den Hub schneller durchführen.",
        "Geeigneten Kantenschutz oder ein anderes passendes Anschlagmittel einsetzen.",
        2,
        "Scharfe Kanten können textile Anschlagmittel beschädigen oder durchtrennen; geeigneter Schutz ist erforderlich."
      ],
      [
        "l-spreizwinkel",
        "lasten",
        "Wie beeinflusst ein größerer Neigungswinkel die Belastung von Anschlagsträngen?",
        "Eine Last wird mit zwei schrägen Strängen gehoben.",
        "Bei ungünstigeren Winkeln können die Kräfte in den Strängen zunehmen.",
        "Die Strangkräfte verschwinden.",
        "Der Winkel hat keinen Einfluss auf die Beanspruchung.",
        0,
        "Mit ungünstigerem Anschlagwinkel können die Kräfte pro Strang steigen; Tragfähigkeitstabellen sind zu beachten."
      ],
      [
        "l-knoten",
        "grundlagen",
        "Darf ein Anschlagseil durch einen Knoten beliebig verkürzt werden?",
        "Das Seil ist für die geplante Last zu lang.",
        "Ja, ein fester Knoten verbessert die Tragfähigkeit.",
        "Nein, nur zugelassene Verkürzungs- und Anschlagverfahren verwenden.",
        "Ja, wenn der Knoten mit Klebeband gesichert wird.",
        1,
        "Unzulässige Knoten schwächen Anschlagmittel und verändern ihre zulässige Belastbarkeit."
      ],
      [
        "l-zeichen",
        "betrieb",
        "Was gilt für die Kommunikation mit der kranführenden Person?",
        "Der Lastweg ist teilweise verdeckt.",
        "Mehrere Personen geben gleichzeitig unterschiedliche Zeichen.",
        "Es werden eindeutige, zuvor vereinbarte Signale genutzt.",
        "Eine Kommunikation ist bei Funkkranen nie erforderlich.",
        1,
        "Eindeutige Zeichen und klare Zuständigkeiten verhindern gefährliche Fehlbewegungen."
      ],
      [
        "l-sichtpruefung",
        "grundlagen",
        "Wann sind Anschlagmittel auf erkennbare Mängel zu kontrollieren?",
        "Du willst eine Anschlagkette einsetzen.",
        "Vor der Verwendung auf äußerlich erkennbare Schäden achten.",
        "Nur wenn bereits ein Unfall passiert ist.",
        "Nur einmal bei der erstmaligen Anschaffung.",
        0,
        "Vor jeder Verwendung ist der arbeitssichere Zustand zu beurteilen; erkennbare Schäden schließen eine sichere Nutzung aus."
      ],
      [
        "l-drehung",
        "betrieb",
        "Eine angehobene Last beginnt sich unkontrolliert zu drehen. Was machst du?",
        "Die Last bewegt sich im Lastweg.",
        "Du greifst mit der Hand zwischen Last und Wand.",
        "Du stellst dich unter die Last und hältst sie fest.",
        "Du hältst Abstand und lässt die Bewegung kontrolliert stoppen.",
        2,
        "Unkontrollierte Lastbewegungen schaffen Quetsch- und Anstoßgefahren; Personen müssen den Gefahrenbereich verlassen."
      ],
      [
        "l-ablegen",
        "lasten",
        "Wann dürfen Anschlagmittel von der Last gelöst werden?",
        "Die Last wird auf Böcken abgesetzt.",
        "Wenn die Last stabil steht und gegen Umstürzen oder Wegrollen gesichert ist.",
        "Sobald sie den Boden erstmals berührt, unabhängig von ihrer Lage.",
        "Noch während des Schwebens, um Zeit zu sparen.",
        0,
        "Anschlagmittel dürfen erst nach sicherem und stabilem Absetzen entfernt werden."
      ],
      [
        "l-ketten",
        "grundlagen",
        "Eine Anschlagkette weist ein stark verbogenes Glied auf. Was tust du?",
        "Der Schaden ist schon vor dem Heben sichtbar.",
        "Die beschädigte Stelle mit Draht umwickeln.",
        "Die Kette aus dem Einsatz nehmen und fachgerecht prüfen lassen.",
        "Die Last nur halb so hoch anheben.",
        1,
        "Verformte Kettenglieder sind erkennbare Schäden, die den sicheren Einsatz ausschließen können."
      ]
    ],
    "bagger": [
      [
        "b-einweiser",
        "betrieb",
        "Was ist bei eingeschränkter Sicht aus dem Bagger wichtig?",
        "Ein Gebäudeteil verdeckt den Fahrbereich.",
        "Geeignete Sichtmaßnahmen beziehungsweise Einweisung und klare Verständigung.",
        "Nur die Motorhaube beobachten.",
        "Den Schwenkbereich trotz Unsichtbarkeit befahren.",
        0,
        "Bei eingeschränkter Sicht müssen Gefährdungen durch zusätzliche organisatorische und technische Maßnahmen verhindert werden."
      ],
      [
        "b-aushub",
        "betrieb",
        "Wo darf Aushubmaterial nahe einer Baugrube gelagert werden?",
        "Die Grubenkante darf nicht zusätzlich gefährdet werden.",
        "Direkt an der Kante aufschütten, damit Fahrwege frei bleiben.",
        "Mit ausreichend sicherem Abstand und nach Baustellenvorgaben lagern.",
        "Auf losem Verbau ohne weitere Prüfung ablegen.",
        1,
        "Aushubmaterial kann Böschungen und Verbau durch Zusatzlasten gefährden; Sicherheitsabstände sind einzuhalten."
      ],
      [
        "b-personen",
        "betrieb",
        "Dürfen Personen während der Baggerbewegung im Schwenkbereich bleiben?",
        "Eine Person möchte während des Schwenkens messen.",
        "Ja, solange sie einen Schutzhelm trägt.",
        "Ja, wenn der Bagger langsam schwenkt.",
        "Nein, der Gefahrenbereich muss vor der Bewegung frei sein.",
        2,
        "Im Schwenkbereich drohen schwere Quetsch- und Anstoßverletzungen; der Bereich ist freizuhalten."
      ],
      [
        "b-ladung",
        "lasten",
        "Wie transportierst du Material mit einem Radlader sicher?",
        "Eine gefüllte Schaufel soll über den Hof gefahren werden.",
        "Mit geeigneter niedriger Transportstellung und freiem Fahrweg.",
        "Mit hochgehobener Schaufel für bessere Fernsicht.",
        "Mit offenen Türen und starkem Lenkeinschlag.",
        0,
        "Eine geeignete Transportstellung verringert Umsturzrisiken und verbessert die Fahrstabilität."
      ],
      [
        "b-anbaupruefung",
        "grundlagen",
        "Was kontrollierst du nach dem Ankoppeln eines Anbaugeräts?",
        "Eine neue Schaufel wurde befestigt.",
        "Nur die Sauberkeit der Lackierung.",
        "Die sichere Verriegelung und Funktion gemäß Betriebsanleitung.",
        "Nur ob das Gerät von außen gleich aussieht.",
        1,
        "Fehlerhafte Verriegelungen an Schnellwechslern können zum unbeabsichtigten Lösen von Anbaugeräten führen."
      ],
      [
        "b-einstieg",
        "grundlagen",
        "Wie steigst du sicher in die Baggerkabine ein?",
        "Die Trittstufen sind nach Regen verschmutzt.",
        "Über den Ausleger auf die Kabine klettern.",
        "Mit einem Sprung auf die Raupen steigen.",
        "Vorgesehene Aufstiege und Haltegriffe nutzen und verschmutzte Tritte reinigen.",
        2,
        "Geeignete Aufstiege und sichere Haltepunkte vermindern die Gefahr des Abrutschens und Abstürzens."
      ],
      [
        "b-graben",
        "betrieb",
        "Eine Grabenwand zeigt Risse und bröckelt. Was ist richtig?",
        "Du arbeitest unmittelbar neben dem Graben.",
        "Arbeit stoppen und Sicherung der Baugrube durch Verantwortliche veranlassen.",
        "Einfach näher an die Kante fahren, um den Graben zu schließen.",
        "Den Graben ohne Absicherung weiter vertiefen.",
        0,
        "Risse und Bodenbewegungen können auf Instabilität hinweisen und erfordern eine erneute Sicherungsbeurteilung."
      ],
      [
        "b-betanken",
        "grundlagen",
        "Was beachtest du beim Betanken einer Erdbaumaschine?",
        "Der Tank ist beinahe leer.",
        "Motor und Zündquellen nach Herstellervorgaben sichern und Verschütten vermeiden.",
        "Benzin oder Diesel stets in der Kabine umfüllen.",
        "Während des Betankens rauchen, wenn kein Wind weht.",
        0,
        "Brand- und Umweltgefahren beim Umgang mit Kraftstoff erfordern geeignete Schutzmaßnahmen."
      ],
      [
        "b-laufwerk",
        "grundlagen",
        "Warum müssen Raupen und Laufwerk regelmäßig kontrolliert werden?",
        "Du bemerkst ungewöhnliche Vibrationen beim Fahren.",
        "Damit die Maschine schneller fahren kann.",
        "Weil Schäden die sichere Führung und Standsicherheit beeinträchtigen können.",
        "Weil der Arbeitseinsatz ohne Sichtprüfung immer zulässig ist.",
        1,
        "Schäden am Laufwerk können die Manövrierfähigkeit, Standfestigkeit und den sicheren Betrieb beeinträchtigen."
      ],
      [
        "b-einweisen",
        "betrieb",
        "Was ist bei Arbeiten nahe öffentlichem Fußgängerverkehr erforderlich?",
        "Ein Bagger arbeitet direkt an einer Gehwegkante.",
        "Fußgänger sollen sich selbst durch den Schwenkbereich bewegen.",
        "Nur ein Schild an die Schaufel kleben.",
        "Gefahrenbereich wirksam absperren und Verkehr sicher führen.",
        2,
        "Dritte dürfen nicht in den Gefahrenbereich von Erdbaumaschinen gelangen; geeignete Absperrung und Verkehrsführung sind notwendig."
      ]
    ]
  }
};
 const added=Object.entries(extra.rows).flatMap(([course,items])=>items.map(([id,topic,title,context,a,b,c,correct,why])=>Object.freeze({id,course,topic,title,context,answers:Object.freeze([a,b,c]),correct,why,source:extra.sources[course][0],sourceUrl:extra.sources[course][1]})));
 const ids=new Set(current.questions.map(q=>q.id));
 if(added.length!==50||added.some(q=>{if(ids.has(q.id))return true;ids.add(q.id);return false;}))throw Error('Duplicate or incomplete expansion');
 globalThis.ABBATE_PRACTICE_BANK=Object.freeze({courses:current.courses,questions:Object.freeze([...current.questions,...added])});
})();
