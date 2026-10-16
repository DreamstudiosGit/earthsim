# Das Evolutionssystem von SimEarth 2.0

Stand: Oktober 2026. Alle Angaben beziehen sich auf `src/evolution.ts` (Baum, Bedingungen, Texte),
`src/constants.ts` (Lebensräume und Ernährung je Gruppe), `src/flora.ts` (Pflanzenschicht) und
`src/life.ts` (Tierschicht). Die Tabelle unten wird aus den Spieldaten erzeugt – Spielmechanik,
Baumansicht und Ereignistexte lesen dieselben Einträge.

## Grundsätze

**Drei Beziehungen, drei Darstellungen.** Der Baum trennt strikt:

| Beziehung | Bedeutung | Darstellung im Baum | Geprüft durch |
|---|---|---|---|
| Abstammung | Eine Gruppe geht aus *frühen Vertretern* der Vorgängergruppe hervor. Die Vorgänger leben weiter. | durchgezogene Linie, Notiz über dem Knoten (z. B. „Amnioten · Synapsiden“) | Vorgänger entwickelt **und** lebt derzeit auf dem Planeten |
| Lebensraum | Umweltbedingungen: Meer, Ufer, Feuchtgebiet, trockenes Land, Kälte, Sauerstoff | Lebensraum-Symbole am Knoten, Abschnitt „Lebensraum“ in der Detailansicht | Es gibt mindestens einen Ort **neben** den Vorfahren, an dem die neue Gruppe auch dann noch Platz hat, wenn alle Arten, die dort leben könnten, eingewandert sind (dieselbe Funktion, die auch Wachstum und Ausbreitung berechnet; seit 14. 10. 2026) |
| Ökologische Beziehung | Nahrung, Partner (Blüten für Bestäuber), Boden | gestrichelte Pfeile: grün = Pflanzen als Nahrung, orange = Beutetiere, violett = Partner, braun = Boden | eine der genannten Gruppen ist auf mindestens 24 Feldern verbreitet |

Eine Futterpflanze wird nie als Vorfahr dargestellt; ein automatischer Test stellt sicher, dass kein
Tier von einer Pflanze und keine Pflanze von einem Tier abstammt (`tests/evolution.test.js`).
Ein weiterer Test prüft, dass jede im Baum genannte Nahrung auch in der Ernährung der Simulation
vorkommt – was der Baum verspricht, tut die Simulation.

**Freischalten statt Zufall.** Neue Gruppen entstehen nicht mehr durch zufällige Artbildung.
Der Spieler entwickelt sie im Baum mit Evolutionspunkten (EP). Seit 14. 10. 2026 entsteht jede neue
Gruppe an **genau einem Ort** neben ihren Vorfahren (bis zu fünf benachbarte Felder, im größten
erreichbaren Lebensraum); von dort breitet sie sich selbst aus. Unterarten entstehen weiterhin von
selbst – seit 14. 10. 2026 acht Stufen je Tierklasse statt drei, mit Namen und Erstauftreten in
`src/species/` (siehe `docs/oekosystem-2026-10/bericht.md`).

**Die Natur wartet nicht ewig** (seit 12. 10. 2026, `src/spontaneous.ts`). Sind für einen Schritt alle
Bedingungen außer den EP-Kosten erfüllt, beginnt eine Uhr zu laufen. Nach einer Schonfrist von
240 Zeitschritten bekommt der Schritt eine sehr kleine Chance je Zeitschritt, ganz ohne EP von selbst
zu entstehen. Die Chance wächst, solange die Bedingungen erfüllt bleiben: Kumuliert liegt sie bei etwa
5 % nach 500, der Hälfte nach 2.000 und 94 % nach 4.000 weiteren Zeitschritten (Regler
„Evolutionstempo“ auf Standard). Fällt eine Bedingung weg, beginnt die Uhr von vorn. Der Zufall ist
ein Hash aus Planetensamen, Zeitschritt und Schritt; er verschiebt den übrigen Zufallsstrom der
Simulation nicht. Der Baum zeigt bei bereiten Schritten einen Hinweis; das Ereignis ist als
„Von selbst entstanden“ markiert.

**Evolutionspunkte** entstehen aus der Vielfalt: je Schritt 0,05 EP + 0,025 EP je lebender
entwickelter Gruppe, multipliziert mit dem Regler „Evolutionstempo“. Ohne Leben gibt es keine EP.

**Keine Sackgassen.** Stirbt eine Gruppe aus, meldet die Chronik das mit dem Hinweis, wie man sie
mit „Leben ansiedeln“ bzw. „Pflanzen“ wieder ansiedelt; abhängige Schritte zeigen
„… sind ausgestorben – neu ansiedeln“. Drei vollständige Testdurchläufe mit verschiedenen Strategien
(günstigste zuerst, Tiere zuerst, Pflanzen zuerst und teuerste zuerst) erreichen alle 31 Schritte.

## Sauerstoff seit 16. 10. 2026

Erste Mikroben erzeugen noch keinen Sauerstoff. Cyanobakterien bleiben die fünfte Unterart der „Ersten Zellen“. Sobald sie auftreten und entdeckt werden, produziert ihre lebende Biomasse Sauerstoff, der zunächst ins Meer und über den Gasaustausch später auch in die Luft gelangt. Komplexe Zellen und wasseratmende Meerestiere brauchen gelösten Sauerstoff; Wale bleiben Luftatmer. Die Mindestwerte sind Spielbalance. Die Entstehung von Eukaryoten besitzt keine gesicherte universelle Sauerstoffschwelle. Die Einheiten und Vereinfachungen stehen im [Ökosystem-Bericht](../oekosystem-2026-10/bericht.md).

## Vom Wasser zur lebendigen Landschaft

Die Reihenfolge, in der der Planet grün wird, ergibt sich aus den Lebensraumansprüchen der
Pflanzengruppen, nicht aus Skripten:

1. **Meer:** Erste Zellen (einschließlich Cyanobakterien) und Komplexe Zellen bilden das Plankton; Meeresalgen bilden Wiesen im
   lichtdurchfluteten Küstenmeer.
2. **Süßwasser:** Eine Grünalgen-Linie besiedelt Flussmündungen, Flüsse und Feuchtgebiete.
3. **Uferzonen:** Erste Landpflanzen brauchen offenes Wasser direkt nebenan (Küste, Flussufer,
   Feuchtgebiet) und einen Mindestgehalt an Sauerstoff (Ozonschicht). Sie wachsen nirgends sonst.
4. **Feuchte und sumpfige Lebensräume:** Moose (feuchte, auch kalte Standorte bis in die Tundra) und
   Bärlapppflanzen (warme Sümpfe, Schuppenbaum-Sumpfwälder).
5. **Flussläufe:** Frühe Gefäßpflanzen sind stark an Wasser gebunden und folgen den Flüssen
   ins Landesinnere; Farne erobern feuchte Gebiete abseits der Flüsse.
6. **Landesinneres:** Urbäume bilden die ersten Wälder; Samenpflanzen, Nadelbäume und später Gräser
   erreichen trockenere und kältere Regionen.

Technisch: Jedes Feld trägt eine Bitmaske der dort wachsenden Pflanzengruppen und einen
Bedeckungswert. Die Eignung einer Gruppe für ein Feld ist Temperatur × relative Feuchte ×
Wasserzugang × Höhenlage. Gruppen breiten sich in geeignete Nachbarfelder aus, selten auch weiter
(Sporen, Samen, später durch Vögel), und sterben dort ab, wo das Klima nicht mehr passt. Frühere
Gruppen werden nicht ersetzt – ein Feld kann viele Gruppen tragen, die Moose bleiben in Tundra und Moor.

Seit 14. 10. 2026 trägt jedes Landfeld eine **Landschaft** (`src/landscape.ts`, `src/succession.ts`,
Spezifikation `docs/biomes-spec.md` Abschnitt 3): eine von 19 Sukzessionsstufen wie Fels, Flechten & Moos,
Farnflur, Steppe, Gebüsch, Wald oder Regenwald, dazu Untergrund (Fels, Sand, Erde, Moor) und
Bodenreife. Das Ziel eines Feldes ergibt sich aus geglättetem Klima (7 × 7 Felder) und den Pflanzengruppen,
die auf ihm oder auf mindestens 3 seiner 8 Nachbarn wachsen. Fehlt eine Gruppe, gilt die nächstniedrigere
Stufe derselben Kette: Offenland vor den Gräsern ist Farnflur, vor den Gefäßpflanzen Moos oder Flechten,
Holzpflanzen ohne Kräuter ergeben Gebüsch. Bewachsenes Land wird außer kurz nach einer Störung nicht als
nackter Fels gezeigt.
Die Landschaft wechselt stufenweise: mindestens 3 Ticks pro Stufe (in den Zeitskalen Zivilisation und
Technologie echte Jahre), pro Feld leicht gestreut, an Fronten schneller. Roden, Feuer, Lava, Vereisung und
Überflutung setzen sofort zurück; danach wächst das Land über die Stufen nach.

Das **Biom** (der Lebensraum der Tiere, weiterhin 11 Werte) wird aus der Landschaft abgeleitet und hängt
damit weiter davon ab, welche Pflanzen das Feld prägen: Wald, Regenwald und Nadelwald brauchen baumbildende
Gruppen (Nadelwald: Nadelbäume), kalte bemooste Ebenen werden zur Tundra, offenes Land heißt „Offenland“
(nicht „Grasland“, solange es keine Gräser gibt). Neu seit 14. 10. 2026: Regenwald beginnt bei 16 °C statt
21 °C, oberhalb der Baumgrenze liegt alpine Tundra statt Fels, und Kälte trägt schon ab mäßiger Feuchte
Nadelwald. Ein Breitenfaktor im Niederschlag (Regler „Klimazonen“) macht den Äquator feuchter und die
Subtropen (20–35°) und Pole trockener; das verschiebt, wo Pflanzen wachsen.

## Pflanzen und Tiere greifen ineinander

Die Tragfähigkeit eines Feldes für eine Tiergruppe ist Biom-Eignung × Temperatur × Sauerstoff ×
**Nahrung auf diesem Feld**: Plankton (meerweit), die Algenwiese des Feldes, die dort wachsenden
Pflanzengruppen oder die dort lebenden Beutetiere. Konkurrenz ist stark nur innerhalb gleicher
Lebensweisen (Gilden: Mikroben, Einzeller, Wirbellose und Wirbeltiere je Meer und Land).

Besondere Wechselwirkungen mit echter Spielwirkung:

- **Bestäuber:** Wo Bienen & Bestäuber leben, wachsen Blütenpflanzen, Laubbäume und fleischfressende
  Pflanzen 20 % dichter und breiten sich doppelt so schnell aus. Blütenpflanzen sind ohne Bestäuber
  entwickelbar – die ersten Blüten bestäubten Käfer, Fliegen und Thripse.
- **Fleischfressende Pflanzen** (im Original „Carnifern“) wachsen dichter, wo Insekten leben.
- **Vögel** verdoppeln die Fernverbreitung von Samenpflanzen, Nadelbäumen, Blütenpflanzen und Laubbäumen.
- **Moose oder Farne** sind als Bodenbildner Voraussetzung für die Urbäume.

## Der Baum (aus den Spieldaten)

| Schritt | Reich | Abstammung | Lebensraum | Ökologische Voraussetzung | EP |
|---|---|---|---|---|---|
| Erste Zellen | Ursprung | – | Lichtdurchflutetes Küstenmeer | – | 0 |
| Komplexe Zellen | Ursprung | Erste Zellen (Endosymbiose) | Küstenmeer; gelöster O₂ ≥ 2 % der heutigen Sättigung | – | 10 |
| Meeresalgen | Pflanze | Komplexe Zellen (Chloroplasten) | Lichtdurchflutetes, nicht vereistes Küstenmeer | – | 15 |
| Süßwasser-Grünalgen | Pflanze | Meeresalgen (Grünalgen-Linie) | Flüsse, Flussmündungen und Feuchtgebiete | – | 25 |
| Erste Landpflanzen | Pflanze | Süßwasser-Grünalgen (Landgang) | Feuchte Uferzonen an Küsten und Flüssen; O₂ ≥ 2 % | – | 35 |
| Moose | Pflanze | Erste Landpflanzen | Feuchte Standorte – Sümpfe, Ufer, Tundra | – | 40 |
| Frühe Gefäßpflanzen | Pflanze | Erste Landpflanzen (Leitgewebe) | Flussufer, Auen und feuchte Ebenen | – | 50 |
| Bärlapppflanzen | Pflanze | Frühe Gefäßpflanzen (Bärlapp-Linie) | Warme Sümpfe und nasse Niederungen | – | 60 |
| Farne & Schachtelhalme | Pflanze | Frühe Gefäßpflanzen (Farn-Linie) | Feuchte, auch schattige Standorte | – | 60 |
| Urbäume | Pflanze | Frühe Gefäßpflanzen (Progymnospermen) | Feuchte Tiefländer | Boden: Moose / Farne & Schachtelhalme | 75 |
| Samenpflanzen | Pflanze | Urbäume | Auch trockenere Böden im Landesinneren | – | 85 |
| Nadelbäume | Pflanze | Samenpflanzen | Kühle, auch trockenere Regionen und Gebirge | – | 95 |
| Blütenpflanzen | Pflanze | Samenpflanzen (Bedecktsamer) | Zuerst feuchte Ufer und Unterholz, später fast überall | – | 110 |
| Laubbäume | Pflanze | Blütenpflanzen | Gemäßigte und tropische feuchte Regionen | – | 120 |
| Gräser | Pflanze | Blütenpflanzen | Offene, eher trockene Ebenen | – | 110 |
| Fleischfressende Pflanzen | Pflanze | Blütenpflanzen | Nährstoffarme Moore und Sümpfe | Nahrung: Insekten | 90 |
| Schwämme & Nesseltiere | Tier | Komplexe Zellen (Vielzeller) | Lichtdurchflutetes Küstenmeer; gelöster O₂ ≥ 19,1 % der heutigen Sättigung | Nahrung: Erste Zellen / Komplexe Zellen | 20 |
| Frühe Zweiseitentiere | Tier | Schwämme & Nesseltiere (Bilateria) | Meeresboden im Küstenmeer; gelöster O₂ ≥ 23,9 % der heutigen Sättigung | Nahrung: Erste Zellen / Komplexe Zellen / Meeresalgen | 25 |
| Gliederfüßer des Meeres | Tier | Frühe Zweiseitentiere | Meeresgrund im Küstenmeer; gelöster O₂ ≥ 28,6 % der heutigen Sättigung | Nahrung: Meeresalgen / Frühe Zweiseitentiere | 30 |
| Weichtiere | Tier | Frühe Zweiseitentiere | Algenreiches Küstenmeer; gelöster O₂ ≥ 38,1 % der heutigen Sättigung | Nahrung: Meeresalgen | 30 |
| Fische | Tier | Frühe Zweiseitentiere (über Chordatiere) | Küstenmeer und Hochsee; gelöster O₂ ≥ 47,7 % der heutigen Sättigung | Nahrung: Gliederfüßer des Meeres / Weichtiere / Frühe Zweiseitentiere | 45 |
| Landgliederfüßer | Tier | Gliederfüßer des Meeres (Landgang) | Bewachsenes Ufer in Küstennähe; O₂ ≥ 9 % | Nahrung: Erste Landpflanzen / Moose / Frühe Gefäßpflanzen | 45 |
| Insekten | Tier | Gliederfüßer des Meeres (krebsartige Vorfahren) | Land mit Gefäßpflanzen in Küstennähe; O₂ ≥ 11 % | Nahrung: Frühe Gefäßpflanzen / Farne & Schachtelhalme / Bärlapppflanzen | 60 |
| Bienen & Bestäuber | Tier | Insekten (Blüten-Spezialisten) | Offenes Land und Wälder mit Blüten; O₂ ≥ 13 % | Partner: Blütenpflanzen / Laubbäume | 100 |
| Amphibien | Tier | Fische (über Fleischflosser) | Sümpfe, Ufer und Feuchtgebiete; O₂ ≥ 12 % | Nahrung: Insekten / Landgliederfüßer | 70 |
| Reptilien | Tier | Amphibien (Amnioten · Sauropsiden) | Auch trockenes Land und Wüsten; O₂ ≥ 13 % | Nahrung: Insekten / Landgliederfüßer / Samenpflanzen | 85 |
| Säugetiere | Tier | Amphibien (Amnioten · Synapsiden) | Vielfältig – auch kalte Regionen; O₂ ≥ 15 % | Nahrung: Insekten / Landgliederfüßer / Samenpflanzen / Blütenpflanzen | 110 |
| Dinosaurier | Tier | Reptilien (Archosaurier) | Offenes Land und Wälder; O₂ ≥ 14 % | Nahrung: Farne & Schachtelhalme / Bärlapppflanzen / Samenpflanzen / Nadelbäume | 110 |
| Vögel | Tier | Dinosaurier (Theropoden) | Fast überall – auch Inseln; O₂ ≥ 15 % | Nahrung: Insekten / Bienen & Bestäuber / Samenpflanzen / Blütenpflanzen | 120 |
| Wale | Tier | Säugetiere (zurück ins Meer) | Hochsee nahe der Küsten mit Säugetieren; O₂ ≥ 13,5 % | Nahrung: Fische / Gliederfüßer des Meeres | 130 |
| Huftiere & Weidetiere | Tier | Säugetiere | Grasland und offene Ebenen; O₂ ≥ 15 % | Nahrung: Gräser | 130 |

Sauerstoffangaben sind Volumenprozent der Atmosphäre (wie in der Statusleiste). Die Schwelle eines
Tieres liegt einen Punkt über dem Wert, ab dem es überhaupt Tragfähigkeit hat.

## Korrekturen gegenüber dem Vorgänger

| Vorgänger (Version 4) | Jetzt | Grund |
|---|---|---|
| Fische aus Gliederfüßern oder Weichtieren | Fische aus frühen Zweiseitentieren (über Chordatiere) | Fische sind Chordatiere |
| Wale aus Fischen oder Säugetieren | Wale aus Säugetieren | Wale sind Paarhufer |
| Säugetiere aus Reptilien oder Trichordaten | Säugetiere aus frühen Vierfüßern über Amnioten/Synapsiden | Säugetiere sind Schwesterlinie der Reptilien |
| Carnifern (Pflanze) entsteht aus Insekten | Fleischfressende Pflanzen als Blütenpflanzen, brauchen Insekten als Beute | Tiere und Pflanzen sind getrennte Linien |
| Trichordaten (fiktiv) | Landgliederfüßer (Tausendfüßer, Spinnentiere) | naturorientierter Baum; alte Spielstände werden umgedeutet |
| Vegetation als ein einziges Feld, entsteht von selbst | 14 Pflanzengruppen mit eigenen Lebensräumen | getrennte Pflanzenentwicklung |
| Radiaten betrieben Photosynthese | Schwämme & Nesseltiere filtern Plankton | Tiere sind Verbraucher |

## Quellen

Die biologischen Annahmen wurden anhand von Fachliteratur geprüft; die vollständige Prüftabelle mit
58 Quellen (Nature, Science, PNAS, Current Biology, UCMP Berkeley u. a.) steht in
[quellenpruefung.md](quellenpruefung.md). Alle Kernaussagen zur Abstammung wurden bestätigt;
Formulierungen zu ersten Bäumen, Bestäubung früher Blüten, Säugetier-Abstammung, Moosen und
Fossilbeispielen wurden daraufhin präzisiert.

Der Baum zeigt spielerische Freischaltungen und ausgewählte Linien. Viele Spielgruppen (Algen,
Fische, Amphibien, Samenfarne) sind Entwicklungsstufen, keine geschlossenen Abstammungsgemeinschaften.
Die Reihenfolge Meer → Ufer → Sumpf → Fluss → Inland ist eine Spieldramaturgie, keine Aussage darüber,
wann Flüsse oder Sümpfe auf der Erde entstanden.
