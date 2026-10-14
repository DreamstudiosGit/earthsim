# Spezifikation: Höhe, Gebirge und Fels-Regel

Stand: 14. 10. 2026 · **Entwurf, wartet auf Freigabe** (offene Entscheidungen in Abschnitt 6).

Ziel: Gebirge sind auf der Karte deutlich zu sehen und haben Höhenstufen. Nackter Fels gibt es nur noch dort, wo
er hingehört. Höhe wirkt auf Klima und Vegetation. Das bestehende Biom-System (`docs/biomes-spec.md`) wird
nur um die Höhe erweitert, nicht umgebaut.

**Nicht Teil dieses Schritts:** Plattenbewegung und Drift-Logik, die geraden Schnittkanten der Plattengrenzen,
Startbildschirm, Epochen-Auswahl, Zivilisations-Code (`civ.ts`), Übersichtskarte, alter SVG-Pfad (`?terrain=legacy`).

---

## 1. Ist-Zustand (Code gelesen, Messwerte Headless)

Messung: `simulation.js` vom 14. 10. 2026, gieriger Evolutionsbaum. Seed 777 entwickelt sich normal. Bei Seed 12345
bleibt die Pflanzenentwicklung stecken (17 von 31 Stufen, keine Farne, keine Bäume), so wie in einem Spiel ohne
Eingriff. Raster 256 × 128, eine Kachel ist rund 156 km × 156 km. Höhen sind also **Kachelmittel**. Einzelne
Gipfel liegen unterhalb der Kachelauflösung.

### 1.1 Was es schon gibt

| Baustein | Stand | Ort |
|---|---|---|
| Höhe | `elevation` Float32 −1..1, 1,0 = 4,5 km, < 0 Meer; fährt mit der Drift; gespeichert (i16) | `world.ts`, `geo.ts`, `save.ts` |
| Gebirgsbildung bei der Generierung | Grat-Rauschen (ridged fBm), nur oberste 45 %, quadriert; Gürtel 7 Kacheln landeinwärts, Küste bleibt flach | `TerrainGenerator.orogeny` |
| Hebung pro Kachel | `uplift` 0..1 (Gürtelstärke), fährt mit der Drift, gespeichert (u16); `GeoSystem.uplift` hebt pro Tick um `uplift · 3e-5` | `world.ts`, `geo.ts` |
| Erosion | Ausgleich zum Nachbarmittel, nasse Kacheln schneller; nur Land; kein Ablagerungsort | `GeoSystem.erode` |
| Plattenmodell | 4 waagrechte Bänder, die sich in X verschieben | `GeoSystem.drift` |
| Vulkanismus | glattes `magma`-Feld (fährt mit), Ausbrüche an Magma-Maxima: +0,45 Höhe (≈ 2 km) im Zentrum, Boden weg, Fels | `EventSystem.volcano` |
| Temperatur | Höhengradient 6,5 °C/km im Energiehaushalt | `climate.ts` |
| Regenschatten | Steigungsregen auf der Luvseite (+bis 0,35), Feuchte-Obergrenze kalter Kämme | `ClimateSystem.updateMoisture` |
| Höhenstufen | feste Höhen: Baumgrenze `TREE_LINE` 0,5 (2,25 km), Schneegrenze `SNOW_LINE` 0,78 (3,5 km), überall auf dem Planeten gleich | `constants.ts`, `landscape.ts` |
| Fels | Leiter-Stufe 0 = Fels, wenn Boden < `SOIL_EARTH` und nicht trocken-warm; Boden entsteht **nur unter Pflanzen** | `landscape.ts`, `succession.ts` |
| Darstellung | Hangschattierung pro Kachel (Licht oben links, Totzone, ±2 Rampenstufen), Höhe leicht aufgehellt; nur Geröll- und Felsbrocken-Objekte | `landfield.ts`, `landcompose.ts` |

### 1.2 Befunde

1. **Das Plattenmodell liefert nur Transformgrenzen.** Die Bänder gleiten waagrecht aneinander vorbei. Es gibt
   keine Kollision, keine Subduktion und kein Auseinanderdriften. Der Kommentar in `geo.ts` („convergent and
   divergent margins“) trifft nicht zu. Gebirgstypen nach Grenztyp kann das heutige Modell also nicht liefern.
   Sie müssen bei der Generierung angelegt und über eine Schnittstelle angebunden werden (Abschnitt 3.2).
2. **Erosion und Hebung laufen pro Tick, unabhängig von der Zeitskala.** In „Zivilisation“ (100 Jahre pro Tick)
   tragen sie Berge so schnell ab wie im Devon (125.000 Jahre pro Tick). Hebung und Erosion sind auf einen
   Gleichgewichtszustand geeicht (`params.ts`), deshalb verändert sich in einem Spiel praktisch nichts.
   Ein Gebirgsgürtel ohne Hebung verliert in 12.000 Ticks nur einen kleinen Teil seiner Höhe.
3. **Fels im Flachland ist kein Höhenproblem, sondern ein Bodenproblem.** Ohne Pflanzen entsteht nie Boden, also
   bleibt jede pflanzenlose Fläche Fels, egal wie alt oder wie tief sie liegt.

   | Seed 12345 (Pflanzen bleiben stecken) | 435 Mio. J. | 171 Mio. J. | 21 Mio. J. |
   |---|---|---|---|
   | Fels, Anteil am Land | 61 % | 31 % | 27 %, davon 22,7 Prozentpunkte unter der Baumgrenze |

   Bei Seed 777 sinkt der Fels-Anteil von 64 % (435 Mio. J.) auf 1,5 % (21 Mio. J.). Der Rest liegt fast
   vollständig unter 0,5 km.
4. **Gebirge sind unsichtbar.** Bei Seed 777, 21 Mio. Jahre vor heute:
   - Über 2 km liegen 1.110 Kacheln. Davon sind **1 Kachel Gipfelschnee und 24 Kacheln Fels**.
   - In den Tropen tragen 41–62 % dieser Kacheln Wald.
   - Frostige Gipfel werden zu „Eis“ (Eisschild), nicht zu Gipfelschnee.
   - Hangneigung zwischen Nachbarkacheln: Median 0,055, 90. Perzentil 0,16. Mit der Totzone der Schattierung bekommt
     ein typischer Gebirgshang weniger als eine Rampenstufe Schatten.
5. **Höhenverteilung je nach Seed sehr verschieden.**

   | Anteil des Festlands | > 1 km | > 2 km | > 3 km |
   |---|---|---|---|
   | Seed 777 | 39 % | 8 % | 0,6 % |
   | Seed 12345 (Hochplateau-Welt) | 55 % | 27 % | 7 % |
   | Nordamerika zum Vergleich | ~28 % | ~9 % | ~1 % |
6. **Der Höhengradient der Temperatur wirkt.** Gemessen sind 5,7–7,3 °C/km je Breitenband.
   - Die 7 × 7-Glättung der Sukzession wärmt Kacheln über 2 km nur um 1,0–1,9 °C (Median).
   - Zwischen 50° und 70° fällt die Temperatur über Hochland viel steiler (Eis-Albedo).
7. **Der Regenschatten ist schwach.** Gemessen an Kämmen über 2 km, je 3 Kacheln vor (Luv) und hinter dem Kamm (Lee):

   | | Seed 777 | Seed 12345 |
   |---|---|---|
   | Feuchte Lee / Luv (Median) | 0,83 | 0,69 |
   | Lee eine Feuchteklasse trockener | 43 % der Kämme | 62 % der Kämme |
8. **Rechenzeit heute** (Node, ms pro Tick über 4.500 Ticks):

   | geo | Klima | Flora | Biom + Sukzession | gesamt mit Leben |
   |---|---|---|---|---|
   | 0,23 | 0,84–0,90 | 1,1–1,7 | 1,9–2,2 | 13–18 |

Nebenbefund (nicht Teil des Auftrags): Der Standard-Probe meldet für Seed 12345 im heutigen Arbeitsstand
„196 land tiles drain nowhere“. Erosion und Ablagerung verändern die Flussnetze, deshalb wird das vor dem Umbau geklärt.

---

## 2. Recherche (kurz) und Übertragung ins Spiel

| Thema | Befund | Übertragung |
|---|---|---|
| Kollision Kontinent–Kontinent | Faltengebirge, breit und hoch, ohne Vulkane (Himalaya, Alpen) | Gürtel im Kontinentinneren, hoch, ohne Vulkane |
| Subduktion Ozean–Kontinent | Küstengebirge mit Vulkankette, Tiefseerinne davor (Anden, Kaskaden) | Gürtel 2–8 Kacheln hinter der Küste, Vulkane auf dem Kamm, tieferes Meer davor |
| Subduktion Ozean–Ozean | gebogene Inselbögen aus Vulkaninseln (Japan, Aleuten, Marianen) | gebogene Ketten kleiner Vulkaninseln im Meer |
| Hotspots | Manteldiapir bleibt ortsfest, die Platte wandert darüber, so entsteht eine Inselkette (Hawaii) | ortsfeste Punkte, die bestehende Drift zieht die Kette von selbst |
| Divergenz | Mittelozeanische Rücken, Grabenbrüche mit Schulter (Ostafrika) | nur Meerestiefe (Rücken), niedrige Priorität |
| Transform | kaum Relief (San Andreas) | die heutigen Bandgrenzen: kein Gebirge |
| Temperatur mit der Höhe | Standardatmosphäre 6,5 °C/km; trockenadiabatisch 9,8, feucht 5–6 | vorhanden (6,5) |
| Regenschatten | Luv bekommt Steigungsregen, Lee sinkende, trockene Luft. Westghats: über 6.000 mm Luv, unter 600 mm Lee. Weitere Beispiele: Great Basin hinter der Sierra Nevada, Atacama, Patagonien | Lee-Trocknung abhängig von der Kammhöhe |
| Erosionsraten | Felsflächen 5–12 m/Mio. J., Einzugsgebiete Median 54, Mittel 218 m/Mio. J. Aktive Gebirge mehrere mm/Jahr, Abtrag wächst stark mit dem Relief. Alte Gebirge (Appalachen, Ural) tragen nach 300 Mio. J. noch 1–2 km Relief | aktive Gürtel halten sich (Hebung = Abtrag); Gürtel ohne Hebung verlieren die Hälfte ihrer Überhöhung in rund 150 Mio. J. |
| Baumgrenze | Wärmegrenze: Wachstumszeit-Mittel 6,4 °C (Luft) bzw. 6,7 °C (Boden). Lage: Tropen ~3,5–4 km, Alpen ~2 km, polar bei Meereshöhe | Baumgrenze über die Temperatur der Kachel statt fester Höhe |
| Schneegrenze | Äquator ~4,5–5 km, trockene Subtropen bis 5,7 km, Alpen ~3 km, polar bei Meereshöhe; in sehr trockenen Gebieten keine | Schneegrenze über die Temperatur, in trockener Luft höher |
| Höhenstufen | kollin/montan (Laubwald), subalpin (Nadelwald), alpin (Matten), subnival (Fels, Schutt), nival (Schnee) | Wald → Nadelwald → alpine Matte → Fels → Schnee |

Das Spiel kennt nur Jahresmittel, keine Jahreszeiten. Die Schwellen in 3.6 werden deshalb an der Lage der
Grenzen geeicht (Baumgrenze 2 km bei 45°), nicht an den Wachstumszeit-Temperaturen.

---

## 3. Soll-Modell

### 3.1 Daten (pro Kachel)

| Feld | Status | Bedeutung |
|---|---|---|
| `elevation` | bleibt | **der** zentrale Höhenwert; keine zweite Höhe |
| `uplift` | bleibt, wird Teil der Schnittstelle | Hebungsrate 0..1 pro Kachel |
| `upliftKind` | **neu**, Uint8, fährt mit der Drift, gespeichert | Gebirgstyp: 0 keiner, 1 Faltengebirge, 2 Küstengebirge mit Vulkanen, 3 Inselbogen, 4 Hotspot-Spur |
| `soil` | bleibt | bekommt zusätzlich Verwitterung (3.7) |
| `substrate` | bleibt (abgeleitet) | neuer Wert `Lava`: frisches Vulkangestein (Boden 0 auf vulkanischem `upliftKind`) |
| Hotspots | **neu**, je Welt 3–6 Punkte aus dem Seed | mantelfest: nicht gespeichert (aus dem Seed ableitbar), nicht gedriftet |

- **Speicherformat 8** mit `migrateV7`. Alte Spielstände bekommen `upliftKind` aus `uplift` und dem
  Küstenabstand: nahe der Küste Typ 2, sonst Typ 1.
- Die Faunen-Sitzung ergänzt `save.ts` gerade um ein optionales Feld; das wird vor dem Umbau abgestimmt.
- Drift: Eine Zeile `rollU8(world.upliftKind, …)` kommt in `GeoSystem.drift` dazu. Sonst ändert sich an der Drift nichts.

### 3.2 Hebungs-Schnittstelle (`src/tectonics.ts`, neu)

```ts
export const enum UpliftKind { None, Fold, Arc, IslandArc, Hotspot }
/** Was die Kruste hebt. Heute: Generator-Gürtel und Hotspots. Später: das Plattenmodell. */
export interface UpliftSource {
  /** Schreibt Hebung pro Kachel für diesen Tick; `timeF` = Zeitfaktor aus 3.4. */
  apply(world: WorldState, timeF: number): void;
}
/** Der einzige Schreibweg für Hebung: begrenzt, setzt terrainDirty, Lava → frisches Vulkangestein. */
export function raiseCrust(world: WorldState, i: number, amount: number, kind: UpliftKind): void;
```

- `GeoSystem` ruft eine Liste von Quellen auf: heute `BeltUplift` (liest `uplift`) und `Hotspots`.
- Die spätere Tektonik-Überarbeitung ersetzt oder ergänzt eine Quelle.
- Ausbrüche (`EventSystem.volcano`), Hotspots und Gürtel schreiben alle über `raiseCrust`.

### 3.3 Generierung

`TerrainGenerator.orogeny` bleibt der Einstieg. Es legt Gürtel nach Typ an und füllt `uplift` und `upliftKind`:

1. **Faltengebirge:**
   - wo: Grat-Gürtel im Kontinentinneren, ab 8 Kacheln von der Küste
   - Kamm 3–4,5 km, schmaler als heute
   - etwa die Hälfte der Gürtel ist aktiv (Hebung), der Rest ist alt, niedriger und gerundet
2. **Küstengebirge mit Vulkanen:**
   - wo: Grat-Gürtel 2–8 Kacheln hinter der Küste
   - Vulkane auf dem Kamm (Abstand 4–8 Kacheln, Hash)
   - davor eine Rinne (tieferes Meer)
3. **Inselbögen:** 1–3 je Welt, gebogene Ketten von Vulkaninseln im Meer, 4–12 Kacheln vor einer Küste.
4. **Hotspots:** 3–6 mantelfeste Punkte, davon die Hälfte unter dem Meer. Die Drift erzeugt die Inselketten von selbst.
5. **Mittelozeanische Rücken:** nur als Meerestiefe, niedrige Priorität.

Das Grundrelief außerhalb der Gürtel bleibt, es sei denn, Entscheidung **E1** fällt auf Variante (b).

### 3.4 Erosion und Ablagerung

- **Zeitfaktor:** `timeF = min(1, Jahre pro Tick / 125.000)`. Das gilt für Hebung, Erosion und Ablagerung.
  - Geologie und Evolution bleiben wie geeicht (Faktor 1).
  - Quartär 0,08, Zivilisation 0,0008, Technologie 0,00008: Das Relief steht in menschlichen Zeiträumen still.
- **Abtrag:**
  - Der heutige Ausgleich zum Nachbarmittel wird **massenerhaltend**.
  - Was ein Hang verliert, landet bei den Nachbarn, auch auf dem Schelf.
  - Schelfkacheln (über `COAST_DEPTH`) nehmen Material auf, steigen aber höchstens bis knapp unter den
    Meeresspiegel. So entsteht kein neues Land und die Küsten bleiben ruhig.
- **Flusstransport (vereinfacht):**
  - Ein Anteil des Abtrags wandert entlang `riverDown` bis zur ersten flachen Kachel (Tiefland) oder an die Mündung.
  - Dort lagert er sich ab. Tiefländer und Schelfe vor Flussmündungen wachsen langsam.
- **Ziele:**
  - Aktive Gürtel halten ihre Höhe über 12.000 Ticks (±10 %).
  - Gürtel ohne Hebung verlieren die Hälfte ihrer Überhöhung in rund 1.000–1.500 Ticks des Phanerozoikums
    (≈ 150–200 Mio. J.). Das ist im Zeitraffer sichtbar.
- **Leistung:** Erosion läuft jeden 4. Tick mit vierfacher Rate. Das gleicht den Flusstransport aus.

### 3.5 Klima

- **Temperatur:** Der Höhengradient bleibt bei 6,5 °C/km.
  - Neu: Die 7 × 7-Glättung der Sukzession mittelt die **auf Meereshöhe zurückgerechnete** Temperatur
    (`T + 6,5 · h`). Danach zieht sie für jede Kachel ihren eigenen Höhenanteil wieder ab.
  - Klimazonen bleiben dadurch großflächig, Höhenstufen folgen den Höhenlinien.
- **Regenschatten:** Neu ist eine Lee-Trocknung.
  - Luft, die einen Kamm überquert hat, verliert einen Anteil ihrer Feuchte, abhängig von der Kammhöhe.
  - Der Anteil klingt nach einigen Kacheln ab.
  - Der Steigungsregen auf der Luvseite bleibt.
  - Ziel: Lee ist in mindestens 70 % der Kämme über 2 km eine Feuchteklasse trockener (heute 43–62 %).
- **Albedo:** Gipfelschnee reflektiert wie Eis. Dafür zählt die Landschaft „Gipfelschnee“ als Lebensraum Arktis
  statt Fels. Es bleibt bei 11 Lebensräumen, die Tier-Tabellen ändern sich nicht.

### 3.6 Höhenstufen der Vegetation

Es gilt nur für Gebirgskacheln (Höhe ≥ 0,9 km). Maßgeblich ist die höhenbereinigte Temperatur `T_h` der Kachel aus 3.5.
Alle Schwellen haben ein Schmitt-Band wie die übrigen Zonen.

| Stufe | Bedingung (Startwert, wird geeicht) | Landschaft | Zielhöhe 45° / Äquator |
|---|---|---|---|
| montan, subalpin | unter der Baumgrenze | bestehende Leiter (Kälteklasse → Nadelwald) | — |
| Baumgrenze | `T_h` < 0 °C | — | ~2 km / ~3,5–4 km |
| alpin | 0 bis −3 °C | **alpine Matte** (E2) | +0–0,5 km über der Baumgrenze |
| subnival | −3 bis −6 °C | Fels, Geröll | bis ~3 km / ~4,5 km |
| nival | < −6 °C | Gipfelschnee | ab ~3 km / ~4,5–5 km |

- **Tropen (E5):**
  - Ob eine Kachel tropisch ist, entscheidet ihre Temperatur auf Meereshöhe (`T + 6,5 · h`), nicht ihre
    eigene Höhe. Feuchtes Hochland am Äquator wird so **Bergregenwald** (Landschaft Regenwald), und zwar bis
    zur Baumgrenze.
  - Das behebt den Hauptmangel des Landschafts-Reviews: Bei Seed 777 gibt es 20 Mio. J. vor heute in ±10° Breite
    keinen Regenwald, weil das Äquatorland 1–3 km hoch liegt und nur 7–12 °C hat.
  - Außerhalb der Tropen bestimmt weiter die echte Temperatur die Klasse (Laubwald → Nadelwald am Hang).
- In sehr trockener Luft (Feuchteklasse „trocken“) liegt die Schneegrenze um 2 °C tiefer, also höher im Gelände.
- Eis-Landschaft bleibt für Eisschilde im Flachland (Frostklasse unter 0,9 km).
- `TREE_LINE` und `SNOW_LINE` bleiben nur für den alten SVG-Pfad bestehen, bis er entfernt ist.
- Die Höhengrenzen der Pflanzengruppen (`maxElevation`) bleiben unverändert. Sie begrenzen die tropische
  Baumgrenze auf etwa 3 km. Das ist bekannt und gewollt.

### 3.7 Fels-Regel

Nackter Fels (Landschaft Fels) nur noch:

1. **Junge Erde:** Boden hat sich noch nicht gebildet.
2. **Hochgebirge:** subnivale Stufe (3.6). Darüber liegt Gipfelschnee.
3. **Frisches Vulkangestein:** nach einem Ausbruch, an Hotspots und Vulkanen, Substrat `Lava` mit eigener Textur.
   Einschlagkrater zählen ebenso (E4).

Überall sonst bildet sich Boden:

- **Verwitterung** baut Rohboden auch ohne Pflanzen auf. Warm und feucht geht es schneller, kalt und trocken langsamer.
  - Ziel: Das Flachland ist nach 0,5–1 Mrd. Jahren (Archaikum) überwiegend Rohboden bzw. Wüste/Sand.
- **Hangabtrag** kann Boden nur bis auf Rohboden abtragen, nicht mehr bis auf Fels. Eis und Lava setzen ihn auf 0.
- **Danach** läuft die bestehende Sukzession: Rohboden → Pionierflur → … wie gehabt.
  Trockenes Tiefland wird Sand oder Wüste wie heute.

### 3.8 Darstellung

Alles läuft im bestehenden Pixel-Renderer und Generator: dieselbe Palette, Licht oben links, Rangfolge und Randmasken.

- **Höhenschattierung:**
  - Die Verstärkung wächst mit der Höhe; im Flachland bleibt sie unverändert.
  - In Gebirgen bis ±3 Rampenstufen.
  - Grate werden über ein feines Rauschen in der Kachel betont, damit Gebirge zerklüftet wirken und nicht wie weiche Hügel.
- **Gebirgs-Sprites** (neue Familie `tools/terrain/mountain.js`), Draufsicht 3/4:

  | Sprite | Größe | Varianten |
  |---|---|---|
  | Felsgipfel | 16×12, 20×16, 24×20 | je 2 Formen, mit und ohne Schneekappe |
  | Vulkankegel | 20×16 | ruhend und frisch (dunkler Basalt) |
  | bewaldeter Vorberg | 16×12 | — |

  - Überhang höchstens 8 px nach oben und 4 px seitlich; das Chunk-Pad wird entsprechend vergrößert.
  - Die Sprites werden zeilenweise mit den Bäumen sortiert und werfen kleine Schlagschatten.
  - Dichte abhängig von Höhe und Relief der Kachel; am Gürtelrand dünnen sie aus, Platzierung über Hash wie bei den Bäumen.
  - **Schneekappe**, wenn die Gipfelhöhe (Kachelmittel plus Relief der Kachel) über der Schneegrenze liegt.
    So tragen hohe Kämme Schnee, auch wenn das Kachelmittel darunter liegt.
- **Neue Bodentexturen:**
  - alpine Matte
  - Basalt (frisches Vulkangestein)
  - Schutt (Felsstufe)
  - Gipfelschnee: die vorhandene Textur, eventuell mit durchscheinendem Fels
- **Rangfolge:** Schnee bleibt oben. Darunter folgen Wald, alpine Matte, Schutt, Fels und Basalt.
  Gipfelschnee franst über Fels aus, Matte über Schutt: dieselben 16 Randmasken.
- **Kachelparallele Helligkeitskanten** (Mangel aus dem Landschafts-Review). Ursache:
  - Die Schattierung wird pro Kachel berechnet und in schmale Stufen (`RELIEF_BAND` 0,3) gequantelt.

  Behebung (mit der neuen Höhenschattierung):
  - Licht und Schatten werden aus der bilinear interpolierten Höhe pro Pixelblock berechnet.
  - Das Stufenband wird breiter.
- **Natürliche Nachbarn auf Materialebene** (Mangel aus dem Landschafts-Review). Problem:
  - Fels auf Sand wird als Sand gezeichnet und grenzt dann an Eis.
  - Gipfelschnee steht nicht in der Ausschluss-Tabelle.

  Behebung:
  - Die Prüfung läuft künftig auf den gezeichneten Materialien.
  - Zwischen Eis/Schnee und Sand/Wüste kommt Fels, Schutt oder Tundra als Zwischenstufe.
- **Untersuchen-Fenster:** Höhe in m und Höhenstufe (Text, Deutsch).
- **Tiere:** Sie bleiben obenauf und müssen auf Fels, Schnee und Basalt lesbar sein; das wird im Review geprüft.

---

## 4. Abnahmekriterien (prüfbar)

Geprüft wird mit dem Headless-Probe (neu: `--relief`) auf den Seeds 777, 12345 und einem dritten.
Dazu kommen Zeitraffer-Screenshots bei 4,0 Mrd., 2,5 Mrd., 1 Mrd., 500 Mio., 250 Mio. und 66 Mio. Jahren sowie heute.

| Kriterium | Messung | Ziel |
|---|---|---|
| Gebirge nach der Generierung erkennbar | Tick 0: Gürtel ≥ 15 Kacheln lang; Screenshot bei Zoom 16 | ≥ 3 Gürtel je Welt, mit Schatten und Gipfeln sichtbar |
| Fels nur in den drei Fällen | Fels unterhalb der subnivalen Stufe, ohne Lava der letzten 50 Ticks, ab 1 Mrd. J. | ≤ 0,5 % des Landes, auch bei Seed 12345 |
| Junge Erde ist Fels | Tick 1 | ≥ 90 % des Landes Fels oder Eis |
| Baumgrenze | Median der untersten alpinen Kachel | 45°: 1,7–2,4 km · 0–15°: 3,0–4,0 km |
| Schneekappen | Gürtel, die über die Schneegrenze reichen | alle mit Schneekappe; Gipfelschnee ≥ 0,5 % des Landes heute |
| Regenschatten auf Feuchte | Lee/Luv an Kämmen ≥ 2 km | Lee eine Klasse trockener in ≥ 70 % |
| Regenschatten auf Vegetation | Wald- bzw. Steppen-Anteil Luv gegenüber Lee | Lee sichtbar offener (Steppe, Halbwüste) |
| Vegetationsgrenzen | `--biomes`: Grenzkanten, Einzelkacheln, unnatürliche Paare, Breitenprofil | nicht schlechter als heute (11–13 %, ≤ 0,35 %, 0, Ziele aus `biomes-spec.md` §3.8) |
| Erosion | aktive Gürtel und Gürtel ohne Hebung über 12.000 Ticks | ±10 % bzw. halbe Überhöhung nach 1.000–1.500 Ticks |
| Leistung | ms/Tick (Median aus 3 Läufen); Erstaufbau und Neuzeichnen im Browser | gleich oder besser als in Abschnitt 1.2, Punkt 8 |
| Tests | `npm test` plus neue Tests | grün |

Neue Tests decken ab:
- Schnittstelle `raiseCrust`
- Fels-Regel
- Migration 7 → 8
- `upliftKind` fährt mit der Drift
- der Atlas enthält die neuen Gebirgs-Sprites

---

## 5. Umsetzung und Agenten (nach Freigabe)

1. **H0, Lead (zuerst, allein):**
   - `upliftKind`, `src/tectonics.ts` mit `UpliftSource` und `raiseCrust`
   - Speicherformat 8, Drift-Zeile
   - Katalog-Vertrag: neue Material-, Landschafts- und Objekt-IDs
   - Konstanten, Probe-Gerüst `--relief`
2. **Danach parallel**, jeder mit eigenem Bundle (`SE_BUNDLE`):
   - **H1, Geo:** Generierung nach Typen, Hotspots, Zeitfaktor, massenerhaltende Erosion, Flusstransport, Ausbrüche über `raiseCrust`
   - **H2, Klima und Vegetation:** Glättung auf Meereshöhe, Lee-Trocknung, Höhenstufen, alpine Matte, Fels-Regel mit Verwitterung, Albedo des Gipfelschnees
   - **H3, Darstellung:** Höhenschattierung, `mountain.js` (Sprites), neue Texturen, Objektart „Gebirge“ im Renderer, Untersuchen-Fenster
3. **H4, Review (zum Schluss, unabhängig):** Zeitraffer-Screenshots über die Epochen gegen Abschnitt 4,
   Probe-Werte und Leistungsvergleich. Bericht in `docs/hoehe-2026-10/`.

---

## 6. Entscheidungen (zur Freigabe)

- **E1, Höhenverteilung:**
  - (a) **Empfohlen:** Das Grundrelief bleibt. Nur die Gebirgsgürtel werden schärfer, höher und nach Typ angelegt.
    Geringes Risiko für die geeichten Klimazonen.
  - (b) Erdähnliche Verteilung: rund 70 % des Festlands unter 1 km, Gebirge stechen stärker heraus.
    Dafür müssen die Klimaschwellen nachgeeicht werden, unter anderem `TROPICAL_TEMP`, das wegen des 1 km hohen
    Tieflands auf 16 °C gesenkt wurde. Das gefährdet die heute guten Vegetationsgrenzen.
- **E2, alpine Matte:**
  - **Empfohlen:** eine eigene neue Landschaft. Sie wird angehängt, eigene Textur, Lebensraum Tundra.
  - Alternative: die Tundra-Landschaft wiederverwenden (weniger Arbeit, optisch nicht von Polartundra zu unterscheiden).
- **E3, Erosion:**
  - **Empfohlen:** Gürtel ohne Hebung werden im Zeitraffer sichtbar niedriger (3.4). In menschlichen Zeitskalen
    steht das Relief still.
  - Alternative: Raten wie heute (das Relief ändert sich im Spiel kaum).
- **E4, Einschlagkrater:**
  - **Empfohlen:** Sie zählen wie frisches Vulkangestein (Schmelzgestein) und wachsen danach zu.
- **E5, Äquator-Regenwald auf Hochland:**
  - **Empfohlen:** Die Einstufung „tropisch“ folgt der Temperatur auf Meereshöhe (3.6). Feuchtes Hochland in
    den Tropen wird Bergregenwald.
  - Erst damit gilt der Beschluss „Äquator immer Regenwald“ aus der Landschafts-Freigabe auch auf hoch liegenden
    Kontinenten.
- **Hinweis zu den Plattengrenzen:** Das heutige Modell liefert keine Grenztypen (1.2, Punkt 1). Gebirgstypen
  legt die Generierung an. Die spätere Tektonik dockt an `UpliftSource` an.

---

## 7. Risiken

- **Höhenstufen entlang der Höhenlinien** können die Zonen zerstückeln. Gegenmittel: die bestehenden
  Modusfilter und Schmitt-Bänder; Messung mit `--biomes`.
- **Mehr Gipfelschnee und Basalt** verändern die Albedo und damit das Klima leicht. Gegenmittel: Messung
  mit dem Probe, nachjustieren über die Schneeschwelle.
- **Verwitterung macht das Präkambrium braun** (Rohboden) statt grau. Das ist erdgeschichtlich richtig,
  sieht aber anders aus als heute.
- **Flusstransport und Ablagerung** verändern die Flussnetze. Gegenmittel: Messung mit dem Probe,
  Ablagerung im Meer nur bis knapp unter den Meeresspiegel. Den Abflussfehler aus 1.2 vorher klären.
- **Größere Sprites** brauchen ein größeres Chunk-Pad. Das kostet etwas Zeichenzeit; das Ziel „gleich oder
  besser“ gilt trotzdem. Ausgleich: seltenere Erosion (3.4) und Zwischenspeichern der Gebirgs-Platzierung.
- **Getestet wird nur Headless Chrome.**

## Quellen

- Körner & Paulsen (2004), J. Biogeogr. 31: 713–732; Paulsen & Körner (2014), TREELIM, Alpine Botany:
  [Treeline-Definition (GMBA)](https://www.gmba.unibe.ch/tools/definitions/treeline_definition/index_eng.html),
  [Paulsen & Körner 2014](https://doc.rero.ch/record/324784?ln=fr)
- Portenga & Bierman (2011), GSA Today 21(8):
  [Understanding Earth's eroding surface with 10Be](https://www.geosociety.org/gsatoday/archive/21/8/article/i1052-5173-21-8-4.htm)
- Montgomery & Brandon (2002), EPSL 201: 481–489:
  [Topographic controls on erosion rates](https://repository.geologyscience.ru/handle/123456789/28097)
- Schneegrenze und Gleichgewichtslinie: [Polarpedia, ELA](https://polarpedia.eu/?p=16226)
- Regenschatten: [AMS Glossary, rain shadow](https://glossary.ametsoc.org/wiki/Rain_shadow),
  [Wikipedia, Orographic lift](https://en.wikipedia.org/wiki/Orographic_lift)
- Hypsometrie Nordamerika: [Dutch, Hypsometric data](https://stevedutch.net/usefuldata/earthhypso1deg.htm)
- Plattengrenzen: USGS „This Dynamic Planet“ (Auszug: [earthref.org](https://earthref.org/ERDA/download:347/))
- Messwerte: eigene Headless-Messung mit `simulation.js` vom 14. 10. 2026 (Skripte nicht eingecheckt; H0 übernimmt sie in `--relief`)
