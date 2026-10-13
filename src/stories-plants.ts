/* =============================================================================
 * SimEarth 2.0 — what the evolution films tell: origin and plants
 * -----------------------------------------------------------------------------
 * Short, true and a little surprising. Each step names when it happened on
 * Earth, four captions for the four beats of its film, the breakthrough and
 * why it spread, a few sentences on what happened, and one fact to remember.
 *
 * The advantage is told as selection, never as purpose: variants that left
 * more offspring became common — evolution has no goal. Dates follow
 * docs/ueberarbeitung-2026-10/quellenpruefung.md; where science still argues,
 * the text says "rund" or "vermutlich" and names fossils as relatives, never
 * as ancestors. The storyboards are in docs/grafik-2026-10/drehbuecher.md.
 * ========================================================================== */

namespace SE {
  export interface EvoStory {
    /** When it happened on Earth, as the film's date stamp. */
    readonly when: string;
    /** Geological period or era. */
    readonly era: string;
    /**
     * Captions for the film's four beats (0, 3, 6 and 9 s): the world before,
     * the change under way, the breakthrough, what it leads to.
     */
    readonly beats: readonly [string, string, string, string];
    /** The breakthrough in a few words. */
    readonly innovation: string;
    /** Why it spread: the advantage that made such variants more common. */
    readonly advantage: string;
    /** A few sentences: what happened and what was new. */
    readonly story: string;
    /** "Wusstest du?" — one surprising, true detail. */
    readonly fact: string;
  }

  export const EVO_STORIES: Record<string, EvoStory> = {
    cells: {
      when: 'vor über 3,5 Mrd. Jahren', era: 'Archaikum',
      beats: ['Bausteine im Urmeer', 'Ein Molekül kopiert sich selbst', 'Eine Hülle – die erste Zelle', 'Sie teilt sich – mit kleinen Fehlern'],
      innovation: 'Die erste Zelle',
      advantage: 'Damit begann die Evolution: Was sich vermehrt, beim Kopieren kleine Fehler macht und nicht in jeder Variante gleich gut zurechtkommt, verändert sich von selbst. Die erfolgreicheren Varianten werden häufiger – ohne Ziel und Plan.',
      story: 'Wie das Leben begann, ist noch offen. Vermutlich entstanden im Urmeer, etwa an heißen Quellen, Bausteine wie Nukleotide. Daraus bildete sich ein Molekül, das sich selbst kopieren konnte – wohl RNA, eine nahe Verwandte der DNA. In einer Hülle aus Fettstoffen eingeschlossen, wurde es zur ersten Zelle. Später erfanden Cyanobakterien die Photosynthese und setzten Sauerstoff frei.',
      fact: 'Das Herzstück der Ribosomen, der Eiweißfabriken in jeder deiner Zellen, besteht bis heute aus RNA – vermutlich ein Überbleibsel aus der Zeit der ersten Zellen.',
    },
    eukaryotes: {
      when: 'vor rund 1,8 Mrd. Jahren', era: 'Proterozoikum',
      beats: ['Eine Archaee umarmt ein Bakterium', 'Es bleibt – und teilt sich mit', 'Das Kraftwerk: Mitochondrien', 'Groß, mit Kern – die komplexe Zelle'],
      innovation: 'Mitochondrien',
      advantage: 'Mit Bakterien als Kraftwerken hatte die Zelle ein Vielfaches an Energie. Sie konnte größer werden, viel mehr Erbgut versorgen und neue Werkzeuge ausprobieren – ihre Nachkommen eroberten Nischen, die einfachen Zellen verschlossen blieben.',
      story: 'Eine Archaee – aus einer Gruppe, die man Asgard-Archaeen nennt – lebte eng mit Bakterien zusammen und schloss eines davon ein. Statt es zu verdauen, behielt sie es: Es teilte sich mit ihr und wurde zum Mitochondrium. Diese Endosymbiose lieferte die Energie für große, komplexe Zellen mit Zellkern. Von ihnen stammen alle Pflanzen, Pilze und Tiere ab – auch du.',
      fact: 'Mitochondrien haben bis heute ihr eigenes, ringförmiges Erbgut – ein Erbe ihrer Bakterien-Vorfahren. Du hast deine nur von deiner Mutter geerbt.',
    },
    marineAlgae: {
      when: 'vor rund 1 Mrd. Jahren', era: 'Proterozoikum',
      beats: ['Eine Zelle schluckt ein Cyanobakterium', 'Es bleibt – als Sonnenkraftwerk', 'Zellen halten zusammen: vielzellig', 'Algenwiesen machen Sauerstoff'],
      innovation: 'Chloroplasten & Vielzelligkeit',
      advantage: 'Wer selbst aus Licht Zucker macht, ist nicht auf Beute angewiesen. Vielzellige Algen konnten sich zudem am Grund festhalten und dem Licht entgegenwachsen – und waren für winzige Fresser zu groß.',
      story: 'Ein Einzeller nahm ein Cyanobakterium auf und behielt es als Chloroplasten – eine zweite Endosymbiose, diesmal mit einem Sonnenkraftwerk. Daraus gingen Rot- und Grünalgen hervor. Die Rotalge Bangiomorpha, rund eine Milliarde Jahre alt, ist eines der ältesten bekannten vielzelligen Lebewesen: Ihre Zellen teilten sich die Arbeit, manche hielten die Alge am Fels fest.',
      fact: 'Rotalgen betreiben noch in über 200 Metern Tiefe Photosynthese – ihr roter Farbstoff nutzt das blaugrüne Licht, das dort noch ankommt.',
    },
    freshwaterAlgae: {
      when: 'vor über 500 Mio. Jahren', era: 'Proterozoikum bis Kambrium',
      beats: ['Grünalgen-Fäden im Tümpel', 'Zwei Fäden verbinden sich', 'Eine Dauerspore übersteht die Dürre', 'Regen – neues Grün am Ufer'],
      innovation: 'Überdauern im Trockenen',
      advantage: 'Tümpel trocknen aus. Algen, deren Dauersporen die Dürre überstanden, keimten beim nächsten Regen wieder – die anderen nicht. So sammelten sich über viele Generationen genau die Eigenschaften, die später das Leben an Land brauchte.',
      story: 'Eine Linie der Grünalgen eroberte Flüsse, Tümpel und feuchte Böden. Bei den Jochalgen legen sich zwei Fäden nebeneinander und bilden Brücken – das „Joch“. Durch sie verschmelzen zwei Zellen zu einer dickwandigen Dauerspore, die Trockenheit übersteht, bis wieder Wasser kommt. Aus Verwandten dieser Algen gingen die Landpflanzen hervor.',
      fact: 'Die Jochalgen, oft nur grüne Fäden im Gartenteich, sind laut Erbgutvergleichen die engsten lebenden Verwandten aller Landpflanzen.',
    },
    landPlants: {
      when: 'vor rund 470 Mio. Jahren', era: 'Ordovizium',
      beats: ['Kahles Land, harte UV-Strahlung', 'Die Ozonschicht hält UV ab', 'Wachshaut und Pilzpartner', 'Ein grüner Saum am Ufer'],
      innovation: 'Wachshaut & Pilzpartner',
      advantage: 'An Land gab es Licht im Überfluss und keine Konkurrenz. Pflanzen, die dort nicht austrockneten und mit Pilzen Nährstoffe aus dem Gestein tauschten, hatten einen ganzen Kontinent für sich.',
      story: 'Die ältesten Sporen von Landpflanzen sind rund 470 Millionen Jahre alt. Möglich wurde der Schritt an Land, weil Sauerstoff aus dem Meer eine schützende Ozonschicht gebildet hatte. Die ersten Landpflanzen waren winzig und ohne Wurzeln, ähnlich heutigen Lebermoosen. Eine Wachshaut schützte sie vor dem Austrocknen, Pilzfäden im Boden lieferten ihnen Nährstoffe.',
      fact: 'Ihre Sporenhülle ist so widerstandsfähig, dass sie 470 Millionen Jahre im Gestein überdauert hat – nur deshalb wissen wir, wann die Pflanzen an Land kamen.',
    },
    mosses: {
      when: 'seit über 400 Mio. Jahren', era: 'Silur bis Devon',
      beats: ['Moospolster auf nacktem Fels', 'Sonne: Es trocknet völlig aus', 'Regen – es lebt wieder auf', 'Sporen fliegen aus der Kapsel'],
      innovation: 'Austrocknen und wieder aufleben',
      advantage: 'Wer völlige Trockenheit übersteht, kann dort wachsen, wo andere Pflanzen verdursten: auf Fels, auf Dächern, in Kälte und Wüste. Moose besetzten genau diese Nischen – bis heute.',
      story: 'Moose sind keine Vorfahren der Farne, sondern ein eigener Weg, an Land zu leben – die Schwestergruppe der Gefäßpflanzen. Ohne echte Wurzeln saugen sie Wasser auf wie ein Schwamm. Viele Moose trocknen völlig aus, ohne zu sterben, und werden beim nächsten Regen in Minuten wieder grün. Ihre Sporen reifen in Kapseln auf feinen Stielen.',
      fact: 'In der Antarktis wuchs Moos wieder an, das über 1.500 Jahre im Eis gelegen hatte.',
    },
    vascular: {
      when: 'vor rund 430 Mio. Jahren', era: 'Silur',
      beats: ['Flach am Boden: grüne Matten', 'Röhren im Stängel', 'Wasser steigt – sie wächst empor', 'Sporen fliegen weiter'],
      innovation: 'Leitbündel – Wasserleitungen',
      advantage: 'Wer höher wächst, bekommt mehr Licht und streut seine Sporen weiter. Mit festen Leitungen konnten Pflanzen ihre Nachbarn überragen – der Wettlauf in die Höhe begann.',
      story: 'Mit Leitbündeln – feinen, mit Lignin versteiften Röhren – konnten Pflanzen Wasser vom Boden nach oben leiten und aufrecht wachsen. Cooksonia, eine der ersten Gefäßpflanzen, war kaum streichholzgroß: gegabelte Stängel ohne Blätter, an den Spitzen Sporenkapseln. Spaltöffnungen regelten, wie viel Wasser verdunstet.',
      fact: 'Pflanzen ziehen Wasser ohne Pumpe nach oben: Die Verdunstung an den Blättern saugt es durch die Leitbahnen – bei Mammutbäumen über 100 Meter hoch.',
    },
    clubmosses: {
      when: 'vor rund 420 Mio. Jahren', era: 'Silur bis Karbon',
      beats: ['Bärlappe am Sumpfrand', 'Schuppenbäume wachsen 30 m hoch', 'Riesige Sumpfwälder entstehen', 'Versunkene Stämme werden Kohle'],
      innovation: 'Baumriesen im Sumpf',
      advantage: 'Im Sumpf gab es Wasser im Überfluss, aber Gedränge ums Licht. Wer höher wuchs, beschattete die anderen – so wurden aus kleinen Bärlappen Bäume, gestützt von dicker Rinde statt von Holz.',
      story: 'Bärlapppflanzen gehören zu den ältesten Gefäßpflanzen und trugen schon kleine, echte Blätter. Im Karbon wuchsen ihre Verwandten, die Schuppenbäume, 30 bis 40 Meter hoch. Ihre Stämme versanken im Sumpf, wurden zu Torf und unter Druck und Hitze über Jahrmillionen zu Steinkohle.',
      fact: 'Ein großer Teil der Steinkohle, die Menschen heute verbrennen, stammt aus diesen Sumpfwäldern – gespeichertes Sonnenlicht von vor 300 Millionen Jahren.',
    },
    ferns: {
      when: 'vor rund 390 Mio. Jahren', era: 'Devon',
      beats: ['Sporen rieseln vom Wedel', 'Befruchtung im Wassertropfen', 'Große Blätter: ein Wedel entrollt sich', 'Farne und Schachtelhalme überall'],
      innovation: 'Große Blätter (Wedel)',
      advantage: 'Große, fein geäderte Blätter fangen viel mehr Licht als kleine Schuppen. Farne mit breiten Wedeln wuchsen schneller und beschatteten ihre Konkurrenten. Große Blätter setzten sich später auch bei den Samenpflanzen durch.',
      story: 'Farne vermehren sich mit Sporen, die auf der Blattunterseite reifen. Aus einer Spore wächst ein winziges, herzförmiges Pflänzchen. Erst wenn Wasser da ist, schwimmen seine Spermien zur Eizelle – deshalb lieben Farne feuchte Orte. Aus der befruchteten Eizelle wächst ein neuer Farn, dessen Wedel sich wie ein Bischofsstab entrollen.',
      fact: 'Schachtelhalme lagern Kieselsäure in ihre Stängel ein. Früher putzte man damit Zinngeschirr – daher der Name „Zinnkraut“.',
    },
    firstTrees: {
      when: 'vor rund 385 Mio. Jahren', era: 'Devon',
      beats: ['Niedriges Grün, offenes Land', 'Holz: Der Stamm wächst in die Dicke', 'Die ersten echten Bäume', 'Wälder holen CO₂ aus der Luft'],
      innovation: 'Holz und tiefe Wurzeln',
      advantage: 'Holz trägt eine Krone hoch über alle Nachbarn – wer dort Blätter hat, bekommt das meiste Licht. Tiefe Wurzeln erreichten Wasser, das andere nicht fanden. Der Baum war so erfolgreich, dass er in der Geschichte der Pflanzen mehrmals neu entstand.',
      story: 'Archaeopteris gilt als erster „moderner“ Baum: ein Stamm aus Holz, der Jahr um Jahr dicker wird, echte Blätter und tiefe Wurzeln – aber Fortpflanzung mit Sporen wie ein Farn. Die ersten Wälder lockerten das Gestein zu tiefen Böden und zogen so viel CO₂ aus der Luft, dass das Klima merklich abkühlte.',
      fact: 'In Cairo im US-Bundesstaat New York fand man die Wurzeln eines 386 Millionen Jahre alten Waldes – mit Archaeopteris.',
    },
    seedPlants: {
      when: 'vor rund 365 Mio. Jahren', era: 'Devon',
      beats: ['Pollen fliegt – ohne Wasser', 'Ein Embryo mit Proviant', 'Der Samen wartet die Dürre ab', 'Regen – er keimt'],
      innovation: 'Der Samen',
      advantage: 'Ein Samen bringt Proviant und Schutz mit und kann warten, bis es regnet – Monate, Jahre, manchmal Jahrhunderte. So eroberten Samenpflanzen trockenes Land, auf dem Farne nicht mehr mitkamen.',
      story: 'Samen sind kleine Lebenspakete: ein Embryo mit Nahrungsvorrat in einer schützenden Hülle. Weil der Pollen durch die Luft zur Samenanlage fliegt, brauchen Samenpflanzen für die Befruchtung kein Wasser mehr. Die ersten waren sogenannte Samenfarne – trotz des Namens keine Farne.',
      fact: 'Samen überdauern erstaunlich lange: Aus einem rund 2.000 Jahre alten Dattelkern wuchs in Israel wieder eine Palme.',
    },
    conifers: {
      when: 'vor rund 300 Mio. Jahren', era: 'Karbon bis Perm',
      beats: ['Das Klima wird kälter und trockener', 'Nadeln sparen Wasser', 'Zapfen schützen die Samen', 'Geflügelte Samen segeln davon'],
      innovation: 'Nadeln und Zapfen',
      advantage: 'Als das Klima am Ende des Karbons trockener wurde, verloren viele Pflanzen zu viel Wasser. Bäume mit schmalen, wachsigen Nadeln hielten durch – und ihre gut geschützten Samen überstanden Frost und Dürre.',
      story: 'Nadelbäume erschienen am Ende des Karbons. Ihre schmalen, wachsüberzogenen Nadeln verlieren wenig Wasser, Harz schützt sie vor Verletzungen und Schädlingen. Die Samen reifen zwischen den Schuppen der Zapfen. So überstehen Nadelbäume Kälte und Trockenheit – bis heute bilden sie die großen Wälder des Nordens.',
      fact: 'Eine Langlebige Kiefer in Kalifornien ist fast 5.000 Jahre alt – älter als die Pyramiden von Gizeh.',
    },
    flowering: {
      when: 'vor rund 130 Mio. Jahren', era: 'Kreide',
      beats: ['Eine grüne, blütenlose Welt', 'Eine Knospe schwillt an', 'Die erste Blüte öffnet sich', 'Bestäubt: Eine Frucht reift'],
      innovation: 'Blüte und Frucht',
      advantage: 'Wind verteilt Pollen nach dem Zufallsprinzip; ein Insekt trägt ihn gezielt zur nächsten Blüte. Früchte locken Tiere an, die die Samen weit verbreiten. Mit diesen Helfern breiteten sich die Blütenpflanzen rasant aus.',
      story: 'Blütenpflanzen tauchen in der frühen Kreidezeit auf. Ihre Samenanlagen liegen gut geschützt im Fruchtknoten – daher der Name Bedecktsamer. Blüten locken Tiere an, die den Pollen weitertragen; die ersten Bestäuber waren Käfer, Fliegen und Thripse. Heute stellen Blütenpflanzen rund 90 % aller Landpflanzenarten.',
      fact: 'Darwin nannte den plötzlichen Siegeszug der Blütenpflanzen ein „abscheuliches Rätsel“ – ganz gelöst ist es bis heute nicht.',
    },
    broadleaf: {
      when: 'vor rund 100 Mio. Jahren', era: 'Kreide',
      beats: ['Frühling: breite Blätter treiben aus', 'Sommer: Laub fängt viel Licht', 'Herbst: Laub fällt – Wasser gespart', 'Winterruhe – und wieder Frühling'],
      innovation: 'Breites Laub mit Winterpause',
      advantage: 'Breite Blätter fangen viel Licht, verdunsten aber viel Wasser. Bäume, die sie in Kälte oder Dürre abwerfen und neu austreiben, kamen mit wechselnden Jahreszeiten besser zurecht – so eroberten Laubwälder kühle und wechselfeuchte Regionen.',
      story: 'In der mittleren Kreidezeit wuchsen die ersten blühenden Laubbäume, etwa frühe Magnolien und Verwandte der Platanen. Ihre breiten, fein geäderten Blätter betreiben besonders viel Photosynthese. Viele Arten werfen ihr Laub in kalten oder trockenen Jahreszeiten ab – vorher holen sie sich die wertvollen Nährstoffe aus den Blättern zurück.',
      fact: 'Die gelben Herbstfarben sind schon den ganzen Sommer im Blatt – sichtbar werden sie erst, wenn der Baum das grüne Chlorophyll abbaut.',
    },
    grasses: {
      when: 'Grasland seit rund 20 Mio. Jahren', era: 'Miozän',
      beats: ['Das Klima wird trockener', 'Gras breitet sich aus', 'Abgefressen? Es wächst von unten nach', 'Der Wind trägt den Pollen'],
      innovation: 'Wachsen von unten',
      advantage: 'Die meisten Pflanzen wachsen an der Spitze – wer sie abfrisst, trifft den Lebensnerv. Gras wächst von unten nach und übersteht Fraß, Tritt und Feuer. Wo viel gefressen wird und es oft brennt, gewinnt deshalb das Gras.',
      story: 'Gräser sind Blütenpflanzen, die auf Bestäuber verzichten: Der Wind trägt ihren Pollen. Erste Gräser gab es schon zur Zeit der Dinosaurier, weite Graslandschaften breiteten sich aber erst aus, als das Klima trockener wurde. Kieselkörnchen in den Halmen schleifen die Zähne der Fresser ab.',
      fact: 'In versteinertem Dinosaurierkot aus Indien fand man winzige Kieselkörper von Gräsern – Gras gab es also schon vor über 65 Millionen Jahren.',
    },
    carnivorous: {
      when: 'seit über 40 Mio. Jahren', era: 'Paläogen',
      beats: ['Nährstoffarmes Moor', 'Ein Insekt landet auf dem Klebstoff', 'Die Falle schließt sich', 'Stickstoff aus der Beute'],
      innovation: 'Fallen für Insekten',
      advantage: 'Im Moor fehlt Stickstoff im Boden. Pflanzen, die ihn aus gefangenen Insekten holten, wuchsen dort besser als ihre Nachbarn. Weil sich dieser Vorteil immer wieder bot, entstand der Insektenfang mindestens neunmal unabhängig voneinander.',
      story: 'In Mooren ist Stickstoff knapp. Fleischfressende Pflanzen wie der Sonnentau holen ihn sich aus Insekten: Klebrige Drüsenhaare halten die Beute fest, langsam rollt sich das Blatt um sie, Enzyme verdauen sie. Charles Darwin experimentierte jahrelang mit Sonnentau und fütterte ihn mit Fleischstückchen.',
      fact: 'Die Venusfliegenfalle schnappt erst zu, wenn ein Sinneshaar zweimal kurz nacheinander berührt wird – so spart sie sich Fehlalarme.',
    },
  };
}
