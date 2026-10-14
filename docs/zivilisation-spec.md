# Spezifikation: Zivilisation – Städte, Wanderung, Stämme, Konflikte

Stand: 14. 10. 2026 · **Entwurf, wartet auf Freigabe** (offene Entscheidungen in Abschnitt 7).

Ziel: Wenige, gut erkennbare Städte statt flächiger Bebauung. Städte wachsen mit ihrem Umland, senden Siedler aus,
die sichtbar über die Karte ziehen und neue Städte gründen. Jede Stadt gehört zu einem Volk mit eigener Farbe.
Später tragen benachbarte Völker selten und nachvollziehbar Konflikte aus. Die Stadtoptik wechselt mit dem Zeitalter.

**Nicht Teil dieses Schritts:** Geologie, Tektonik, Höhe, Biome, Landschaft und Vegetations-Rendering
(`geo.ts`, `climate.ts`, `succession.ts`, `biome.ts`, `land*.ts`, `tools/terrain/`). Gelände wird nur gelesen.
Ebenfalls unverändert: Entstehung der Intelligenz, Energiemix und Modellfenster, Übersichtskarte.

---

## 1. Ist-Zustand (Code gelesen, Messwerte Headless)

### 1.1 Was es gibt

| Baustein | Stand | Ort |
|---|---|---|
| Stadt | **pro Kachel**: `tech[i]` (Zeitalter, 0 = keine Stadt) und `cityPop[i]` (0..1). Keine Stadt-Objekte, keine Namen, keine Völker | `world.ts` |
| Zeitalter | 7 Stufen: Steinzeit, Bronzezeit, Eisenzeit, Industrie-, Atom-, Informations-, Nanotech-Zeitalter (`Tech`, `TECH_NAMES`, `TECH_COST`, `TECH_ENERGY`) | `constants.ts` |
| Intelligenz | Eine Art pro Welt (`sentientClass`). Möglich für Weichtiere, Wale (Meer), Insekten, Reptilien, Dinosaurier, Vögel, Säugetiere (letzte Unterart „Hominiden“) | `constants.ts` `LIFE[].sentient`, `civ.ts` |
| Wachstum | logistisch zur Lagequalität des **eigenen** Feldes (Biom × Temperatur × Agrar-Regler) | `CivSystem.growCities` |
| Ausbreitung | pro Tick 5 % aller Kacheln als Stichprobe; jede Stadt mit `cityPop ≥ 0,55` besetzt ein **direktes Nachbarfeld** | `CivSystem.growCities` |
| Fortschritt | jede Stadtkachel steigt einzeln auf (Wissenschafts-Regler) | `CivSystem.advanceTech` |
| Konflikt | nur Atomkrieg ab 16 Atom-Stadtkacheln (`scaledCount(4)`), gesteuert über Militär/Philosophie | `CivSystem.warfare` |
| Klima | Energie = Σ `TECH_ENERGY × cityPop` über alle Stadtkacheln → CO₂, Staub, O₂ | `CivSystem.consumeEnergy` |
| Drift, Katastrophen | Drift verschiebt `tech`/`cityPop` zeilenweise mit den Platten; Vulkan, Meteor, Flut, Atomschlag löschen Stadtkacheln, Erdbeben und Seuche senken `cityPop`. Seuche ab `totalCityPop > 32`, Ziel per 200 Zufallsversuchen (`pickCity`) | `geo.ts` (`GeoSystem`, `EventSystem`) |
| Darstellung | 8×8-Pixel-Sprite je Zeitalter (`CITY_SPRITES`), auf **jeder** Stadtkachel ins Grundbild gezeichnet | `sprites.ts`, `tilecache.ts`, `render.ts` `drawTileTop` |
| Landschaft | blendet Pflanzenobjekte auf Stadtkacheln aus; Herden meiden Stadtkacheln | `landfield.ts`, `herds.ts` |
| Spieler | Werkzeug „Städte“ (Zeitalter wählen, beliebiges Landfeld) und Monolith | `app.ts` `applyTool` |
| Speichern | Format 7; `tech` und `cityPop` als Felder; optionale Zusatzfelder ohne neue Formatnummer schon üblich (`fauna`) | `save.ts` |
| Icon-Pipeline | Kartenicons sind flache SVG-Pfaddaten (32 × 32, `ART_PALETTE`). `artdraw.ts` zeichnet sie mit einheitlicher Tintenkontur und Schatten: auf der Karte als Canvas, im Fenster als Inline-SVG. Prüfwerkzeuge `tools/artcheck.js`, `tools/species-sheet.js` | `species/types.ts`, `artdraw.ts` |
| Wandernde Figuren | `HerdLayer`: reine Grafik, gleitet zwischen Kacheln, spiegelt nach Laufrichtung, Sichtbegrenzung | `herds.ts` |

### 1.2 Messung (gieriger Evolutionsbaum, Headless, eigener Build)

| Seed | Intelligenz | +500 Ticks | +1000 Ticks | +1500 Ticks |
|---|---|---|---|---|
| 12345 | Insekten, natürlich bei Tick 4305 | 53 Stadtkacheln, **1 Cluster**, Eisenzeit | 160 Kacheln, 1 Cluster, Industrie | 278 Kacheln, 1 Cluster, CO₂ 400 → 503 ppm |
| 777 | keine bis Tick 6000, per Monolith gesetzt | 12 Kacheln, 1 Cluster | 17 Kacheln, 1 Cluster | 17 Kacheln, 1 Cluster, Atomzeitalter |

### 1.3 Befunde

1. **Die Ausbreitung kennt nur das Nachbarfeld.** Daraus entsteht immer ein einziger zusammenhängender Teppich,
   der sich ausfranst (Screenshot: helle Rasterflächen). Es gibt keinen Abstand und keine zweite Siedlung.
2. **Die Tragfähigkeit hängt nur am eigenen Feld.** Flüsse, Küsten und Umland spielen keine Rolle.
3. **Es gibt keine Völker.** Eine Welt hat genau eine Zivilisation, deshalb kann es außer dem Atomkrieg keine Konflikte geben.
4. **Die Höhe gibt es schon:** `elevation` (1,0 = 4,5 km), Baumgrenze 0,5 (2,25 km), Schneegrenze 0,78. Die
   Höhen-Spec (`docs/hoehe-spec.md`) behält `elevation` als einzigen Höhenwert. Die Lageprüfung wird trotzdem in
   einer Funktion gekapselt, damit neue Geländedaten (z. B. Almwiese, Gebirgsarten) nur dort eingebaut werden müssen.
5. **Schwellen sind auf die Fläche geeicht.** Seuche (`totalCityPop > 32`), Atomkrieg (16 Atom-Kacheln) und der
   CO₂-Ausstoß setzen hunderte Stadtkacheln voraus. Bei 20–50 Einzelstädten greifen sie sonst nicht mehr.
6. **Die Seuche trifft Einzelstädte kaum.** `pickCity` in `geo.ts` probiert 200 Zufallskacheln. Bei 30 Städten auf
   32 768 Kacheln trifft das in rund 17 % der Fälle (siehe E5).

---

## 2. Simulation

### 2.1 Datenmodell

- **Das Raster bleibt die Wahrheit für Ort, Zeitalter und Bevölkerung:** `tech[i]` und `cityPop[i]`. Eine Stadt
  belegt genau eine Kachel. Drift, Katastrophen, Überblickskarte, Untersuchen-Fenster und Speichern funktionieren
  damit ohne Änderung in `geo.ts`.
- **Neu: `world.civ: CivState`** mit Listen (Obergrenzen in Klammern):
  - `cities` (≤ 96): `id`, `tile`, `tribe`, `founded` (Tick), `name`, `capacity` (zwischengespeichert)
  - `tribes` (≤ 8): `id`, `color` (Index in die Stammesfarben), `parent`, `capital` (Stadt-id), `founded`, `name`,
    `peace` (Tick bis Friedensende je Nachbarvolk)
  - `settlers` (≤ 6): `id`, `tribe`, `from` (Stadt-id), `tech`, `path` (Kacheln), `step`, `pop`
  - `battles` (≤ 2, nur zur Anzeige, Phase 2): `tile`, `until` (Tick), `kind`
- **Abgleich** zu Beginn jedes `civ.step` (`reconcileCities`):
  - Stadt-Datensatz ohne Stadtkachel → in derselben Zeile ±2 Felder suchen (Drift verschiebt nur in x). Gefunden:
    `tile` nachführen. Sonst ist die Stadt untergegangen (Katastrophe): Datensatz entfernen, Chronik-Eintrag.
  - Stadtkachel ohne Datensatz (Spieler-Werkzeug, Monolith, alter Spielstand) → liegt eine Stadt näher als der
    Mindestabstand, wird die Bevölkerung dort aufgeschlagen und die Kachel geleert, sonst entsteht eine neue Stadt
    (Volk: nächstes Volk in Siedlerreichweite, sonst ein neues). Reihenfolge nach Bevölkerung, absteigend.
  - Siedler: Hat sich `world.driftShifts` geändert oder ist das nächste Feld unpassierbar, wird der Weg neu geplant.

### 2.2 Lage (`src/civsite.ts`)

Eine Funktion liest das Gelände, alles andere fragt nur sie: `cityGround(world, i)` liefert
`{ water, ice, highland, river, coast, fertility, slope }`. Darauf bauen auf:

- **`citySiteAllowed(world, i, species)`**, harte Ausschlüsse:
  - Wasser
  - Landschaft Eis oder Schnee
  - Höhe über der Baumgrenze (`TREE_LINE`, 2,25 km)
  - Temperatur außerhalb des Fensters der Art
  - Meeresarten nur an der Küste
- **`citySiteScore(world, i)`**, Vorlieben für die Siedlerwahl:
  - Fluss auf dem Feld +0,5, Fluss im Nachbarfeld +0,3
  - Küste +0,3
  - Fruchtbarkeit des Umlands (siehe 2.3)
  - Hangneigung −, Höhe über 1 km −
- Mindestabstand **`CITY_MIN_DIST` = 5 Felder** (euklidisch, x läuft um), zu Städten **und** zu Siedlerzielen.

### 2.3 Tragfähigkeit

`capacity(city)` ist die gewichtete Summe über das Umland, Radius `CITY_UMLAND` = 2 (21 Felder, Mitte zählt doppelt):

- **Landfelder:** Fruchtbarkeit der Landschaft × Boden × Temperaturfaktor.
  - Wiese, Steppe, Savanne und Laubwald hoch
  - Regenwald, Taiga und Sumpf mittel
  - Wüste, Halbwüste, Tundra, Fels, Moos und Flechten niedrig
  - Eis und Schnee 0
- **Flussfelder:** +50 % (Wasser, Schwemmland).
- **Meeresfelder:** Fischerei, Grundwert klein, ab Eisenzeit höher.
- **Gesamt:** × Zeitalter-Faktor (Ackerbau, Bewässerung, Industrie), × Agrar- und Medizin-Regler wie heute.
  Gedeckelt auf 1.
- Bei `CITY_MIN_DIST` = 5 überlappen sich die Umländer nicht. Knappheit entsteht, wenn um eine volle Stadt
  kein freier Bauplatz mehr in Reichweite liegt.
- Die Tragfähigkeit wird alle 10 Ticks und nach Drift neu berechnet, nicht pro Tick.

### 2.4 Größenstufen, Wachstum, Zeitalter

- **Größenstufe aus `cityPop`:** Dorf < 0,35 ≤ Stadt < 0,7 ≤ Großstadt. Wachstum logistisch zur Tragfähigkeit,
  wie heute. Liegt die Tragfähigkeit unter der Bevölkerung (Klima, Dürre), schrumpft die Stadt. Unter 0,03
  wird sie aufgegeben.
- **Zeitalter pro Stadt:** Der Aufstieg kommt wie heute über den Wissenschafts-Regler. Neu kommt **Austausch**
  hinzu: Eine Stadt unter dem höchsten Zeitalter ihres Volkes holt mit erhöhter Chance auf. Tochterstädte erben
  das Zeitalter der Mutterstadt.
- In der Steinzeit erreicht nur eine Bestlage (Flussoase) die Großstadt, ab der Industrie ist sie häufig.

### 2.5 Wanderung (`src/migration.ts`)

1. **Aufbruch:** Eine Stadt mit `cityPop ≥ 0,9 × capacity` und mindestens Größe „Dorf, voll“ (≥ 0,25) schickt eine
   Siedlergruppe los, wenn alle drei Bedingungen gelten:
   - Abklingzeit `SETTLER_COOLDOWN` = 40 Ticks pro Stadt ist abgelaufen
   - weniger als `SETTLERS_MAX` = 5 Gruppen sind auf dem Planeten unterwegs
   - weniger als 2 Gruppen ihres Volkes sind unterwegs

   Die Gruppe nimmt `SETTLER_POP` = 0,1 Bevölkerung mit.
2. **Ziel und Weg:** Eine Breitensuche ab der Stadt über passierbare Felder bis zur Reichweite des Zeitalters
   liefert die Kandidaten.
   - Kandidaten liegen zwischen `CITY_MIN_DIST` und Reichweite, `citySiteAllowed` ist erfüllt, und das Feld hat
     Abstand zu allen Städten und Siedlerzielen.
   - Gewählt wird nach `citySiteScore − 0,02 × Weglänge`. Bei Gleichstand entscheidet `world.rng`.
   - Der Weg wird aus der Suche zurückverfolgt und gespeichert.
   - Gibt es keinen Kandidaten, bricht niemand auf. Das Volk merkt sich „Land knapp“ (für Phase 2).

| Zeitalter | Reichweite (Felder Weg) | Wasser |
|---|---|---|
| Steinzeit | 10 | nein |
| Bronzezeit | 14 | bis 2 Wasserfelder am Stück (Boot über Meerengen) |
| Eisenzeit | 18 | bis 6 Wasserfelder (Küstenschifffahrt) |
| Industrie und später | 28 / 36 ab Atom | unbegrenzt innerhalb der Reichweite |

   - Meeresarten (Wale, Weichtiere) wandern durchs Wasser und gründen an der Küste.
   - Vögel überfliegen in jedem Zeitalter bis 3 Wasserfelder.
3. **Bewegung:** 1 Feld pro Tick, auf Wasser 2. Die Darstellung gleitet zwischen den Feldern (Abschnitt 3.4).
4. **Ankunft:** Das Ziel wird erneut geprüft. Ist es noch gültig, entsteht dort eine Stadt mit `tech` der Gruppe und
   `cityPop = SETTLER_POP`. Ist es inzwischen belegt, wird im Umkreis von 2 Feldern ausgewichen, sonst löst sich die
   Gruppe auf.
5. Zufall kommt nur aus `world.rng`. Der Ablauf ist deterministisch je Seed und in Node testbar.

### 2.6 Stämme und Völker

- Die erste Stadt gründet das erste Volk. Neugründungen gehören zum Volk der Mutterstadt.
- Ein **eigenständiges Volk** entsteht:
  - sofort, wenn die Neugründung ≥ 15 Felder von der Hauptstadt ihres Volkes entfernt liegt oder übers Wasser kam,
  - oder später: Eine Stadt, die ≥ 300 Ticks alt ist und ≥ 8 Felder von der Hauptstadt entfernt liegt, spaltet sich
    mit 1 % Chance pro 10 Ticks ab und nimmt Nachbarstädte desselben Volkes mit, die ihr näher sind als der Hauptstadt.
- **Höchstens 8 Völker.** Stammesfarben sind 8 Akzentfarben der Palette (`red`, `blue`, `gold`, `violet`, `orange`,
  `white`, `teal`, `pink`). Die Farbe eines ausgestorbenen Volkes wird wieder frei.
- **Hauptstadt** ist die älteste lebende Stadt des Volkes. Fällt sie, wird die größte Stadt Hauptstadt.
- **Namen für Völker und Städte** kommen aus einem kleinen Silbengenerator (Hash aus Seed und id, kein Verbrauch
  von `world.rng`). Sie erscheinen im Untersuchen-Fenster und in der Chronik („Die Arkani gründen Teluma.“).

### 2.7 Konflikte (Phase 2, `src/conflict.ts`)

- **Wann:**
  - Zwei Städte verschiedener Völker liegen höchstens 10 Felder auseinander,
  - **und** es ist knapp: Beide stehen über 85 % ihrer Tragfähigkeit, oder ein Volk fand zuletzt kein Siedlerziel,
  - **und** zwischen beiden Völkern ist kein Frieden.
- **Häufigkeit:**
  - Grundchance 0,4 % pro Tick und Paar, multipliziert mit dem Aggressionsfaktor aus Militär-, Philosophie- und
    Kunst-Regler (`CivSystem.aggression`, wie heute)
  - planetenweit höchstens 1 Konflikt gleichzeitig und mindestens 30 Ticks Pause
  - danach je Völkerpaar 200 Ticks Frieden
- **Ausgang:** Die Stärke ist Bevölkerung × (1 + 0,25 × Zeitalter) × Militär-Regler.
  - Der Verlierer verliert 30 % Bevölkerung.
  - Bei Stärkeverhältnis ≥ 2,5 oder Restbevölkerung < 0,12 wird die Stadt **übernommen**: Sie wechselt das Volk,
    der Wimpel die Farbe.
  - **Zerstört** wird eine Stadt nur, wenn ihre Bevölkerung unter 0,05 fällt.
  - Der Sieger verliert 10 %.
- **Sichtbar:** Kampf-Symbol zwischen den beiden Städten, mindestens 3 Ticks und mindestens 3 s lang. Dazu ein
  Chronik-Eintrag mit beiden Völkern, der Stadt und dem Ausgang.
- **Atomkrieg** bleibt die Ausnahme. Er setzt jetzt zwei Völker mit Atom-Städten voraus statt 16 Atom-Kacheln, und
  das Ziel ist eine Stadt des gegnerischen Volkes.

### 2.8 Klima, Seuche, Bevölkerungsindex

Eine Stadt steht künftig für ihr Umland. `CITY_WEIGHT` (Startwert 8) gewichtet ihre Bevölkerung in drei Stellen:
- im Energieverbrauch (`consumeEnergy`)
- im Atemanteil
- in `world.totalCityPop`; das betrifft auch den Bevölkerungsindex und die Seuchenschwelle in `geo.ts`, ohne
  dass `geo.ts` geändert werden muss

Kalibrierung mit der Probe: Eine Industrie-Zivilisation soll das CO₂ ähnlich spürbar heben wie heute bei Seed 12345
(rund +100 ppm in 500 Ticks).

### 2.9 Spieler

- **Werkzeug „Städte“:** `app.ts` prüft vor dem Abbuchen die Lage (`citySiteAllowed`) und den Mindestabstand.
  - Meldungen: „Zu nah an Teluma (mind. 5 Felder).“ bzw. „Hier kann keine Stadt stehen: Eis/Hochgebirge.“
  - Volk: wie beim Abgleich (2.1).
- **Monolith:** zusätzlich `citySiteAllowed`.

### 2.10 Speichern

- **Kein neues Format nötig.** Ein optionales Feld `civ` (Städte, Völker, Siedler mit Restweg, Frieden) kommt neben
  `fields`. `tech` und `cityPop` bleiben, wie sie sind.
- Fehlt `civ` (alte Spielstände) oder ist das Feld ungültig, baut der Abgleich (2.1) die Städte aus dem Raster neu
  auf. Flächige Altstädte werden dabei auf Einzelstädte mit Mindestabstand ausgedünnt, die Bevölkerung wird
  zusammengelegt. Alles wird ein Volk.
- Prüfung beim Laden: Listenlängen, Kachelbereich, gültige Volks-ids, Wege nur aus Nachbarfeldern. Bei Fehlern wird
  `civ` verworfen und neu aufgebaut, der Spielstand bleibt ladbar.

---

## 3. Darstellung

### 3.1 Stadt-Icons (`src/civart/`)

- **Format wie die Tier-Icons:** `Art` aus `species/types.ts` (32 × 32, nur `ART_PALETTE`, nur absolute Pfadbefehle),
  gezeichnet von `artdraw.ts` mit Tintenkontur und Schatten. Damit gelten Grafikstil, `artcheck` und
  Inline-SVG im Fenster unverändert.
- **3/4-Ansicht wie die Landschaft:** Gebäude mit sichtbarer Front und Dachfläche von leicht oben. Licht von links
  oben: linke und obere Flächen hell, rechte Seiten als dunklere Fläche mit `o` 0,5–0,6. Fuß bei y ≈ 28–30.
- **21 Icons:** 7 Zeitalter × 3 Größen. Größe auf der Karte: Dorf 1 Kachel, Stadt 1,5, Großstadt 2. Unten mittig
  auf der Stadtkachel verankert und nach y sortiert gezeichnet.
- **Stammesfarbe** als Wimpel. Jedes Stadt-Icon nennt einen Ankerpunkt, der Renderer setzt dort ein kleines
  Fahnen-Icon in der Volksfarbe (8 Varianten). Die Stadtkunst selbst bleibt farbneutral.

| Zeitalter | Dorf | Stadt | Großstadt |
|---|---|---|---|
| Steinzeit | 2–3 Rundhütten (Stroh, Fell), Feuerstelle | Hütten im Ring, Palisade | Langhäuser, Palisade, Steinkreis |
| Bronzezeit | Lehmziegelhäuser, Flachdach | Lehmhäuser, Mauer | Stufentempel (Zikkurat), Mauerring |
| Eisenzeit | Fachwerk- und Steinhäuser | Steinmauer, Tor, Säulentempel | Burg bzw. Festung auf dem Hügel, Türme |
| Industrie | Ziegelhäuser, ein Schlot | Fabrikhallen, Schlote, Rauch | Schlote, Bahnhofshalle, Mietshäuser |
| Atomzeitalter | Betonhäuser | Wohnblöcke, Kühlturm | Hochhäuser, Kühltürme |
| Informationszeitalter | Glaspavillons | Glastürme | Skyline mit Funkturm |
| Nanotech | Kuppeln mit Grün | organische Türme | schlanke Megatürme, begrünt |

### 3.2 Siedler-Figuren

| Zeitalter | Menschen (Säugetiere) | auf Wasser |
|---|---|---|
| Steinzeit | Mensch mit Keule und Bündel | – |
| Bronzezeit | Mensch mit Speer, Packesel | Einbaum |
| Eisenzeit | Ochsenkarren | Segelschiff |
| Industrie | Planwagen bzw. Dampfwagen | Dampfschiff |
| Atom- bis Nanotech | Lastwagen, später Schwebegleiter | Frachter, später Schwebegleiter |

- **Andere intelligente Arten:** ihr aktuelles Kartenicon (`tiles.life`) mit einem Bündel und dem Wimpel in der
  Volksfarbe, ohne eigene Zeitalter-Figuren. Meeresarten schwimmen, Vögel fliegen, mit derselben Figur.
- Alle Figuren schauen nach rechts. Der Renderer spiegelt sie bei Bewegung nach links (wie `HerdLayer`).

### 3.3 Kampf-Symbol (Phase 2)

Zwei Icons: Stein- bis Eisenzeit gekreuzte Waffen mit Staubwolke, ab der Industrie eine Rauchwolke mit Blitz.
Optional eine Ruine für 30 Ticks, wo eine Stadt zerstört wurde.

### 3.4 Kartenebene (`src/civlayer.ts`)

- **Eigene Ebene wie `HerdLayer`:** jedes Bild über dem Grundbild, Schalter „Städte“ (`layers.cities`).
- **Reihenfolge:** Städte, Siedler, Kampf-Symbole, alle nach y sortiert.
- **Raster-Cache:** Rasterbilder je Kachelgröße, Schlüssel aus Icon und Volksfarbe.
- **Altes Zeichnen entfällt:** `drawTileTop` zeichnet keine Städte mehr. `CITY_SPRITES` und `TileCache.city`
  werden entfernt, nachdem alle Verweise geprüft sind.
- **Siedler gleiten:** Bei jedem beobachteten Feldwechsel gleitet die Figur über min(gemessene Tickdauer, 800 ms)
  zum neuen Feld. Bei reduzierter Bewegung springt sie.
- **Größe:** Kleinste Darstellung 10 px pro Kachel. Dort bleibt das Dorf 10 px und die Großstadt 20 px.
- **Untersuchen-Fenster:** Name, Volk (Farbpunkt), Zeitalter, Größe, Bevölkerung in % der Tragfähigkeit, Lage
  (Fluss/Küste). Anfangs nur Text; ein Stadt-Icon als Inline-SVG folgt, wenn es günstig ist.
- **Chronik:** neues Volk, erste Stadt übers Meer, neues Zeitalter (wie heute), Konflikt und Ausgang. Keine
  Meldung pro gewöhnlicher Gründung.

---

## 4. Dateien

| Datei | Inhalt | Wer |
|---|---|---|
| `src/civstate.ts` (neu) | Typen `City`, `Tribe`, `Settler`, `Battle`, `CivState` mit `toJSON`/`fromJSON`/Prüfung, Namensgenerator | C0 |
| `src/civsite.ts` (neu) | `cityGround`, `citySiteAllowed`, `citySiteScore`, `cityCapacity`, `nearestCity` | C1 |
| `src/cities.ts` (neu) | Abgleich, Wachstum, Zeitalter-Austausch, Völker | C1 |
| `src/migration.ts` (neu) | Aufbruch, Zielsuche, Weg, Bewegung, Gründung | C1 |
| `src/conflict.ts` (neu) | Konflikte, Frieden, Atomkrieg zwischen Völkern | C3 |
| `src/civ.ts` | nur noch Taktgeber: Intelligenz, Aufruf der neuen Teile, Energie | C1 |
| `src/civart/types.ts`, `src/civart/<zeitalter>.ts` (neu) | Stadt-, Siedler-, Wimpel-, Kampf-Icons | C2 |
| `src/civlayer.ts` (neu) | Kartenebene | C2 |
| `tools/civ-sheet.js` (neu) | Kontaktbogen der Stadt- und Siedler-Icons auf echten Böden (wie `species-sheet.js`) | C2 |
| `tests/civ.test.js` (neu) | Abstand, Lage, Siedler, Völker, Speichern, Altstand, Konflikt-Häufigkeit | C1, C3 |
| `world.ts` | Feld `civ`, `reset`/`copyFrom`, `CITY_WEIGHT` in `totalCityPop` (≈ 6 Zeilen) | C0 |
| `save.ts` | optionales Feld `civ` (≈ 15 Zeilen) | C0 |
| `constants.ts`/`params.ts` | Abstände, Reichweiten, Raten, Stammesfarben | C0 |
| `render.ts` | `CivLayer` einhängen, Stadt aus `drawTileTop` entfernen | C2 |
| `app.ts`, `panels.ts` | Werkzeugprüfung, Chronik, Untersuchen-Fenster (nur Verdrahtung) | C1 |
| `tools/headless.js` | Schalter `--civ`: Städte, Abstände, Lagen, Siedler, Völker, Konflikte je 100 Ticks | C0 |
| `tsconfig.json` | neue Dateien nach `civ.ts` bzw. die Kunst vor `artdraw.ts` | C0 |

**Unberührt:** `geo.ts`, `climate.ts`, `succession.ts`, `biome.ts`, `landscape.ts`, `land*.ts`, `tools/terrain/`,
`herds.ts`. Die Landschaft blendet Pflanzenobjekte weiterhin nur auf der einen Stadtkachel aus.

---

## 5. Ablauf und Agenten

Alle arbeiten im selben Arbeitsbaum und bauen mit `SE_BUNDLE` in eigene Dateien. Committet wird nur auf Wunsch.

1. **C0 Lead:** Datenmodell, Weltfeld, Speicherfeld, Konstanten, Build-Reihenfolge, `--civ` in der Probe und
   Testgerüst. Danach können C1 und C2 parallel arbeiten.
2. **C1 Logik:** Lage, Tragfähigkeit, Wachstum, Wanderung, Völker, Spielerprüfung und Tests. Abstimmung mit der Probe
   über 3 Seeds (12345, 777, 4242).
3. **C2 Grafik:**
   - zuerst die **Steinzeit** (Dorf, Stadt, Großstadt, Siedler, Wimpel) als Kontaktbogen und Karten-Screenshot
     → **deine Freigabe**
   - danach die übrigen 6 Zeitalter, bei Bedarf auf zwei Agenten verteilt
   - parallel die Kartenebene
4. **C3 Konflikte:** startet, wenn C1 abgenommen ist.
5. **C4 Review:** ein unabhängiger Agent prüft gegen Abschnitt 6 mit Probe, Screenshots (Desktop, Telefon 390 × 844)
   und `npm test`. Bericht in `docs/zivilisation-2026-10/review.md`.
6. **Doku:** `docs/zivilisation-2026-10/bericht.md` (deutsch, mit Vorher/Nachher-Screenshots) und `AGENTS.md`
   (Layout-Liste).

---

## 6. Abnahmekriterien (messbar)

| Kriterium | Messung | Ziel |
|---|---|---|
| Keine flächige Bebauung | Probe `--civ`, jede Runde; Test | jedes Stadtpaar ≥ 5 Felder Abstand; nie zwei Stadtkacheln benachbart; Stadtkacheln < 0,5 % des Landes |
| Wenige, erkennbare Städte | Probe, 3 Seeds | Ende Steinzeit 3–10 Städte, Ende Eisenzeit 8–25, Industrie und später ≤ 60 |
| Lage sinnvoll | Probe: Anteil Neugründungen an Fluss oder Küste (Feld oder Nachbar) | ≥ 70 %; 0 auf Wasser, Eis, Schnee oder über 2,25 km |
| Siedler sichtbar | Probe; Screenshot mitten im Weg | während des Wachstums in ≥ 30 % der Ticks ≥ 1 Gruppe unterwegs; ≤ 5 gleichzeitig; Weglänge ≥ 5 |
| Wasser erst ab passendem Zeitalter | Test | Steinzeit nie über Wasser; Bronze ≤ 2, Eisen ≤ 6 Wasserfelder |
| Optik wechselt mit dem Zeitalter | Kontaktbogen; Screenshot-Folge Stein, Eisen, Industrie, Information | 21 klar verschiedene Icons, bei 16 px erkennbar (`artcheck` fehlerfrei) |
| Völker | Probe | ≥ 2 Völker auf großen Kontinenten bis zur Eisenzeit; Farben unterscheidbar |
| Konflikte selten, nachvollziehbar | Probe 1000 Ticks mit ≥ 2 benachbarten Völkern | 2–12 Konflikte; nie 2 gleichzeitig; Abstand ≥ 30 Ticks; je Paar ≥ 200 Ticks Frieden; jeder mit Chronik-Eintrag |
| Vegetation und Tiere bleiben sichtbar | Screenshot Zoom 16; Herdenzählung | Stadt-Icons decken < 5 % der Landfläche im Bild; Herden-Icons zwischen den Städten vorhanden |
| Klima bleibt wirksam | Probe Seed 12345 | Industrie hebt CO₂ um 60–150 ppm in 500 Ticks |
| Speichern | Test | Rundreise gleich; Altstand mit Stadtteppich lädt und wird ausgedünnt |
| Leistung | Probe; Messung im Browser | `civ.step` < 2 ms pro Tick; Kartenebene < 1 ms bei 60 Städten |
| Gesamt | `npm test` | grün |

---

## 7. Offene Entscheidungen

| Nr. | Frage | Empfehlung |
|---|---|---|
| **E1** | Mindestabstand und Icongröße | **5 Felder**; Dorf 1, Stadt 1,5, Großstadt 2 Kacheln. (Eine Kachel sind rund 156 km, eine Stadt steht also für eine Region.) |
| **E2** | Ab wann über Wasser? | **Bronzezeit** kurze Überfahrten (≤ 2), Eisenzeit Küstenschifffahrt (≤ 6), ab Industrie offenes Meer. Alternative: schon in der Steinzeit 1 Feld (Flöße, wie die Besiedlung Australiens). |
| **E3** | Abspaltung neuer Völker | **≥ 15 Felder oder übers Meer sofort**, sonst selten nach ≥ 300 Ticks; höchstens 8 Völker |
| **E4** | Speicherformat | **keine neue Nummer**: optionales Feld `civ`, alte Stände werden beim Laden ausgedünnt. Damit kollidiert nichts mit Format 8 des Geologie-Agenten. |
| **E5** | Seuche trifft Einzelstädte kaum (`pickCity` in `geo.ts`, 200 Zufallsversuche) | **Der Geologie-Agent ersetzt die Zufallsversuche durch einen Durchlauf** (≈ 5 Zeilen, `geo.ts` ist seine Datei). Alternativ ändern wir es nach seinem Merge. Bis dahin werden Seuchen seltener. |
| **E6** | Siedler nicht-menschlicher Arten | **eigenes Kartenicon + Bündel + Volkswimpel**; keine eigenen Zeitalter-Figuren |
| **E7** | Namen für Völker und Städte | **ja**, aus einem Silbengenerator; ohne Namen sind Konflikte schwer nachvollziehbar |
