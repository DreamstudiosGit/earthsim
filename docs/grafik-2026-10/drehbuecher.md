# Drehbücher der Evolutionsfilme

Jeder Schritt im Evolutionsbaum hat einen 12-Sekunden-Film. Er zeigt nicht nur das Lebewesen,
sondern **den Vorgang**: was sich verändert hat und was dadurch erreicht wurde. Nach dem Film soll
man in einem Satz sagen können, worin der Durchbruch bestand – auch ohne den Text gelesen zu haben.

Texte (Bildunterschriften, Durchbruch, Vorteil, Erklärung): `src/stories-plants.ts`,
`src/stories-animals.ts`. Werkzeug: `src/scenekit.ts`, Bewegungen: `css/films.css`.

## Regeln für alle Filme

**Aufbau: vier Takte zu je 3 Sekunden.** Die Bildunterschrift wechselt bei 0,3 / 3,3 / 6,3 / 9,3 s.

| Takt | Zeit | Inhalt |
|---|---|---|
| 1 | 0–3 s | Die Welt vorher |
| 2 | 3–6 s | Der Wandel ist im Gange |
| 3 | 6–9 s | **Der Durchbruch** – `sparkle()` zwischen 6,0 und 8,0 s genau auf der Neuerung; die Bildunterschrift trägt dann „✦ Durchbruch“ |
| 4 | 9–12 s | Was daraus folgt |

Danach bleibt der Film auf dem letzten Bild stehen. Kleine Schleifen wie Wellen, Atmen oder
Schweben laufen dabei weiter.

**Vorgang statt Pose.** Zeige die Neuerung als Handlung:

- etwas wird eingeschlossen, wächst, faltet sich, klappt um, öffnet sich, verschmilzt oder teilt sich;
- für Winziges die **Lupe** (`lens()`): Zellinneres, Augenlinsen, Zähne, Atemlöcher;
- für Verborgenes ein **Röntgenblick**, also ein halbtransparentes Skelett oder Organ über dem Tier.

**Evolution braucht Generationen.** Kein einzelnes Tier verwandelt sich im Lauf seines Lebens. Eine
Veränderung über Jahrmillionen zeigst du so:

- als **Verwandlung im Zeitraffer**: `morph()` mit Formen um denselben Ankerpunkt, die ganze Gruppe
  bewegt sich weiter;
- immer zusammen mit der **Zeitraffer-Plakette** `timelapse()`, z. B. „vor 50 Mio. J.“ → „vor 40 Mio. J.“
  oder mit Gattungsnamen.

Wachstum, Keimen und Schlüpfen sind dagegen Entwicklung eines Einzelnen. Sie brauchen keine Plakette.

**Beschriftungen** (`tag()`): höchstens drei je Film, kurz und auf Deutsch, mit denselben Begriffen
wie im Text, z. B. „Mitochondrium“, „Gehirn“, „Amnion“.

**Bildaufteilung** (viewBox 480 × 270):

| Bereich | Belegt durch |
|---|---|
| oben links (x 0–200, y 0–60) | Datumsstempel |
| oben rechts (x 430–480, y 0–40) | Wiederholen-Knopf |
| unten Mitte (y > 225) | Bildunterschrift |

Das Wichtige gehört daher in den Bereich x 30–450, y 50–220. Auf dem Telefon wird der Film
kleiner, und der Stempel deckt dann fast die halbe obere Hälfte ab.

**Stil**: wie bisher – flache, weiche Formen, Verläufe, die Spielpalette `PAL`. Kein Text außer
`tag()` und `timelapse()`. Ausgeschlossen sind Skripte, SMIL, Filter und externe Bilder. Jede `id`
beginnt mit der Film-ID.

## Ursprung

### cells – Die erste Zelle
1. Dunkles Urmeer an einer heißen Quelle: Ein Schlot pafft warme Wolken. Bunte Bausteine
   (Nukleotide, vier Farben) treiben heran und sammeln sich in einer Gesteinsmulde.
2. Die Bausteine reihen sich zu einem Strang. Passende Gegenstücke lagern sich an, und der
   Doppelstrang verdreht sich zur Helix. Dann trennt er sich, und jede Hälfte wird ergänzt: Aus eins
   wird zwei.
3. **Durchbruch:** Fettmoleküle schwärmen herbei und schließen sich um einen Strang zu einer Blase.
   Beschriftungen „Hülle“ und „Erbmolekül“.
4. Die Zelle wächst und schnürt sich ab: 2, dann 4 Zellen. Eine Tochter hat eine leicht andere Farbe
   (Kopierfehler), und diese Variante vermehrt sich schneller. Das ist Variation und Auslese.
- Fachlich: RNA-Welt als Hypothese, daher Text mit „vermutlich“. Die Helix ist stilisiert.

### eukaryotes – Mitochondrien
1. Eine Archaee (violett, mit langen fingerartigen Fortsätzen) neben stäbchenförmigen Bakterien.
   Die Fortsätze umfassen eines davon.
2. Die Hülle schließt sich um das Bakterium. Drinnen teilt es sich, während die Wirtszelle wächst.
3. **Durchbruch:** Die eingeschlossenen Bakterien leuchten und sprühen Energiefunken.
   Beschriftung „Mitochondrium“.
4. Die Zelle wird groß, eine innere Membran umschließt das Erbgut und wird zum Zellkern
   (Beschriftung). Daneben zeigt ein winziges Bakterium den Größenunterschied von etwa 10 : 1.

## Meer (Agent A)

### marineAlgae – Chloroplasten & Vielzelligkeit
1. Sonnenlicht im Meer: Eine Zelle mit Kern umfließt ein blaugrünes Cyanobakterium.
2. Drinnen wird es zum grünen Chloroplasten (Beschriftung). Lichtstrahlen treffen ihn, kleine
   Zucker-Sechsecke entstehen.
3. **Durchbruch:** Die Zelle teilt sich, die Töchter bleiben verbunden, und Zelle für Zelle wächst ein
   rötlicher Faden (Bangiomorpha). Die unterste Zelle wird zur Haftzelle am Fels (Beschriftung).
4. Totale: Eine Wiese aus Rot- und Grünalgen wogt, Sauerstoffbläschen steigen auf (Beschriftung „O₂“).

### earlyAnimals – Nerven und Muskeln
1. Kragengeißelzellen (ovaler Körper, Kragen, schlagende Geißel) schwimmen umher und lagern sich zu
   einer Rosetten-Kolonie zusammen.
2. Daraus wird ein Schwamm (Vase mit Poren): Wasserteilchen strömen durch die Poren hinein und
   oben hinaus.
3. **Durchbruch:** Eine Qualle. Ein Nervennetz leuchtet auf und läuft als Lichtwelle über den Schirm
   (Beschriftung „Nervennetz“). Dann zieht sich der Schirm zusammen und stößt sie nach oben.
4. Eine kleine Larve berührt einen Tentakel (Krebse gab es erst rund 90 Mio. Jahre später). In der Lupe schießen Nesselzellen ihre Harpunen ab, die Beute
   ist gefangen (Beschriftung „Nesselzelle“).

### bilaterians – Ein Kopf mit Gehirn
1. Mikrobenmatten am Meeresgrund, flache, gesteppte Ediacara-Wesen (Dickinsonia-artig) liegen still.
2. Ein kleiner Wurm erscheint. Eine gestrichelte Spiegelachse zeigt links und rechts, Pfeile zeigen
   vorne und hinten. Er kriecht los (Wellenbewegung).
3. **Durchbruch:** Röntgenblick. Ein Nervenstrang leuchtet entlang des Körpers, vorne ein heller
   Knoten mit zwei Augenflecken, die Licht empfangen. Beschriftungen „Gehirn“ und „Augenflecken“.
4. Der Darm wird sichtbar: Ein Futterteilchen wandert vom Mund durch den Körper und hinten hinaus.
   Dann gräbt sich der Wurm in den Schlamm und hinterlässt einen gewundenen Gang.

### arthropods – Augen, Panzer, Gelenkbeine
1. Kambrischer Meeresgrund, weiche Würmer im Schlamm, gedämpftes Licht.
2. Ein Trilobit häutet sich: Er kriecht aus der alten Hülle, die leer liegen bleibt. Die gegliederten
   Beine laufen (Beschriftung „Außenskelett“).
3. **Durchbruch:** Die Lupe zeigt das Facettenauge. Viele sechseckige Linsen leuchten auf,
   Lichtstrahlen bündeln sich darin (Beschriftung „Linsenauge“).
4. Anomalocaris gleitet heran (Greifarme, große Stielaugen). Der Trilobit sieht ihn (Augenblitz) und
   rollt sich ein, der Räuber dreht ab.

### molluscs – Schale, Raspelzunge, Auftrieb
1. Eine Schnecke weidet einen Algenbelag ab. Die Lupe zeigt die Radula, ein Band winziger Zähne,
   und hinter ihr bleibt eine blanke Spur.
2. Im Schnitt eines Kopffüßergehäuses wächst Kammer für Kammer: Trennwände erscheinen nacheinander,
   ein Strang verbindet sie (Beschriftung „Schale wächst am Rand“ oder „Kammern“).
3. **Durchbruch:** Wasser wird aus den Kammern gepumpt, helles Gas füllt sie, und das Tier steigt auf
   wie ein U-Boot (Beschriftung „Gaskammern“).
4. Ein Kopffüßer zieht sich zusammen, ein Wasserstrahl schießt hinaus, und er schnellt davon. Eine
   Tintenwolke bleibt zurück.

### fish – Rückgrat und Kiefer
1. Ein kieferloser Fisch saugt am Grund, das runde Maul hat keinen Kiefer. Im Röntgenblick ist die
   Rückensaite zu sehen (Beschriftung „Rückgrat“).
2. Zeitraffer „vor 518 Mio. J.“ → „vor 480 Mio. J.“ → „vor 440 Mio. J.“: Im Kopf liegt eine Reihe
   Kiemenbögen. Der vorderste wandert nach vorn, knickt ein und wird zum Ober- und Unterkiefer.
3. **Durchbruch:** Der Kiefer klappt weit auf und schnappt zu (Beschriftung „Kiefer“).
4. Ein Kieferfisch mit paarigen Flossen jagt, ein Schwarm stiebt auseinander.

## Grün (Agent B)

### freshwaterAlgae – Überdauern im Trockenen
1. Ein Tümpel im Anschnitt, darin grüne Algenfäden mit spiraligen Chloroplastenbändern.
2. Zwei Fäden legen sich nebeneinander. Brücken wachsen zwischen den Zellen (das „Joch“), der Inhalt
   einer Zelle wandert hinüber.
3. **Durchbruch:** Der Tümpel trocknet: Der Wasserspiegel sinkt, der Schlamm reißt, die Fäden
   verblassen. Übrig bleiben dunkle, dickwandige Dauersporen, die glänzen (Beschriftung „Dauerspore“).
4. Regen, der Tümpel füllt sich, die Sporen keimen zu neuen Fäden. Grün kriecht auf das feuchte Ufer.

### landPlants – Wachshaut & Pilzpartner
1. Kahle Felsküste, nur Meer und Stein. Violette UV-Zickzackstrahlen treffen den Boden.
2. Hoch am Himmel bildet sich ein bläulicher Schleier, an dem die UV-Strahlen abprallen
   (Beschriftung „Ozonschicht“).
3. **Durchbruch:** Flache, lebermoosartige Pflänzchen kriechen vom Wasser auf den Fels. Ein
   Glanzlicht läuft über ihre Wachshaut (Beschriftung). Darunter verzweigen sich weiße Pilzfäden,
   die Punkte in beide Richtungen tauschen: Nährstoffe gegen Zucker (Beschriftung „Pilzpartner“).
4. Der grüne Saum breitet sich am Ufer aus, Sporen treiben im Wind.

### mosses – Austrocknen und wieder aufleben
1. Prall-grüne Moospolster auf nacktem Fels, kühles Licht.
2. Gleißende Sonne: Die Polster schrumpfen und werden braungrau, die Blättchen kräuseln sich.
3. **Durchbruch:** Regentropfen fallen, die Polster quellen auf und werden in Sekunden wieder grün.
4. Sporenkapseln auf dünnen Stielen heben sich, die Deckel springen ab, und Sporen stäuben hinaus.

### vascular – Leitbündel
1. Flache grüne Matten an einem Fluss, alles bleibt niedrig.
2. Die Lupe zeigt den Schnitt durch einen Stängel: Röhren mit Ringversteifungen (Beschriftung
   „Leitbündel“), in denen blaue Wassertröpfchen vom Boden aufsteigen.
3. **Durchbruch:** Das Wasser steigt, und Cooksonia wächst empor: gegabelte Stängel mit
   Sporenkapseln an den Spitzen, gleich mehrere. Kleine Dampfwölkchen zeigen die Verdunstung.
4. Die Kapseln platzen, und der Wind trägt die Sporen weit über die niedrigen Matten hinweg.

### clubmosses – Baumriesen im Sumpf
1. Sumpfrand mit kleinen Bärlappen voller schuppiger Blättchen.
2. Zeitraffer: Schuppenbaum-Stämme schießen empor, mit Rautenmuster der Blattnarben und gegabelter
   Krone mit grasartigen Blättern.
3. **Durchbruch:** Ein dichter Sumpfwald aus Schuppenbäumen (Beschriftung „30 m“).
4. Bäume stürzen ins Wasser und versinken. Im Bodenschnitt stapeln sich die Schichten und werden
   gepresst, aus Torf wird ein schwarz glänzendes Kohleflöz. Dazu die Plakette „Millionen Jahre“ und die
   Beschriftung „Kohle“.

### ferns – Große Blätter (Wedel)
1. Blattunterseite eines Wedels mit braunen Sporenhäufchen. Sporen rieseln auf feuchten Boden.
2. Aus einer Spore wird ein winziges grünes Herz (Vorkeim). Ein Tropfen landet, und in der Lupe
   schwimmen Spermien durch den Wasserfilm zur Eizelle.
3. **Durchbruch:** Aus dem Herz wächst ein Farn: Ein eingerollter Trieb hebt sich und entrollt sich zum
   großen Wedel (Beschriftung „Wedel“).
4. Totale: Farne und Schachtelhalme (gegliederte Stängel mit Quirlen) füllen eine feuchte Ebene.

### firstTrees – Holz und tiefe Wurzeln
1. Devonische Landschaft: niedriges Grün, offenes Land, nackter Boden.
2. Die Lupe zeigt eine Stammscheibe, in der Ring um Ring entsteht (Beschriftung „Holz“). Daneben
   wird ein Stamm dicker.
3. **Durchbruch:** Archaeopteris wächst hoch hinauf, mit farnartig belaubten Zweigen. Die Wurzeln
   zeichnen sich tief in den Boden, und eine braune Bodenschicht wird dicker (Beschriftung
   „tiefe Wurzeln“).
4. Wald. Graue CO₂-Moleküle aus drei Kugeln ziehen aus dem Himmel in die Bäume (Beschriftung
   „CO₂“), der Himmel wird kühler und blauer.

## Samen & Blüten (Agent C)

### seedPlants – Der Samen
1. Windige devonische Landschaft. Ein Samenfarn entlässt Pollen, der durch die Luft zu einer
   Samenanlage einer anderen Pflanze fliegt – ohne Wasser.
2. Die Lupe zeigt einen Samen im Schnitt: Embryo, Vorrat und Hülle (drei Beschriftungen).
3. **Durchbruch:** Dürre: Sonne und rissiger Boden, der Samen liegt ruhig im Boden und wartet.
4. Regen, der Samen keimt: Eine Wurzel wächst hinab, ein Spross hinauf, Blätter öffnen sich.

### conifers – Nadeln und Zapfen
1. Das Klima kühlt ab und wird trockener, Frost glitzert. Breitblättrige Pflanzen welken, Tröpfchen
   verdunsten von ihren Blättern.
2. Ein Nadelbaum. Die Lupe auf eine Nadel zeigt den Wachsüberzug, das Wasser bleibt drin
   (Beschriftung „Wachs“).
3. **Durchbruch:** Nahaufnahme eines Zapfens: Die Schuppen schließen sich in der Kälte und öffnen
   sich in trockener Sonne, dazwischen liegen Samen (Beschriftung „Zapfen“).
4. Geflügelte Samen trudeln wie Propeller den Hang hinab, Keimlinge sprießen, Nadelwald wächst.

### flowering – Blüte und Frucht
1. Grüne Welt aus Nadelbäumen und Farnen, keine bunten Farben.
2. An einem kleinen Strauch schwillt eine Knospe an, die Kelchblätter weichen auseinander.
3. **Durchbruch:** Die Blüte öffnet sich Blatt für Blatt, ein Farbschlag, Staubblätter voller
   Pollen. Ein Käfer landet.
4. Der Käfer trägt gelbe Pollenpunkte zur nächsten Blüte. Dort fallen die Blütenblätter, und der
   Fruchtknoten schwillt zur Frucht (Beschriftung „Frucht“).

### broadleaf – Breites Laub mit Winterpause
1. Frühling: An kahlen Zweigen brechen Knospen auf, breite Blätter entfalten sich.
2. Sommer: volle Krone, Sonnenstrahlen treffen die Blätter. Die Lupe zeigt das Adernetz eines Blattes
   (Beschriftung „Blattadern“).
3. **Durchbruch:** Herbst: Das Laub färbt sich gelb, orange und rot und fällt. Die Zweige sind kahl,
   ein Wassertropfen bleibt im Stamm (Beschriftung „Laubwurf“).
4. Winter: Schnee auf kahlen Zweigen, dann wieder Frühlingsgrün. Die Plakette zählt die Jahreszeiten.

### grasses – Wachsen von unten
1. Das Klima wird trockener, der Wald lichtet sich und verblasst, eine offene Ebene entsteht.
2. Gras breitet sich als grüne Welle von links nach rechts über die Ebene.
3. **Durchbruch:** Ein Pferdemaul beißt die Halme ab, die Spitzen sind weg. Dann wachsen die Halme
   vom Grund wieder hoch, der Grund leuchtet (Beschriftung „wächst von unten“).
4. Wind: Grasblüten stäuben Pollenwolken über die wogende Ebene.

### carnivorous – Fallen für Insekten
1. Moor mit Torfmoos, saurem Wasser und kargem Boden. Eine Sonnentau-Rosette, deren Tentakel
   Tropfen tragen, die glitzern.
2. Eine Fliege landet und klebt fest, sie zappelt.
3. **Durchbruch:** Die Tentakel neigen sich zur Fliege, das Blatt rollt sich um sie
   (Beschriftung „Klebfalle“).
4. Verdauung: Grüne „N“-Punkte (Stickstoff) fließen von der Beute in die Pflanze, die einen
   Blütenstiel treibt (Beschriftung „Stickstoff“).

### pollinators – Koevolution: Blüte und Biene
1. Eine schlanke Wespe fängt ein kleines Insekt und trägt es davon, Futter für ihre Larven.
2. Eine pelzige Biene besucht eine Blüte. Gelbe Pollenkörner bleiben in ihrem Pelz hängen und werden
   immer mehr (Beschriftung „Pollen“).
3. **Durchbruch:** Bienenblick nur in einer runden Lupe, nicht über dem ganzen Himmel. Darin zeigen die
   Blüten im UV-Licht ein Zielfeld, die Landebahn, und die Biene landet genau in der Mitte
   (Beschriftung „UV-Muster“).
4. Die Biene fliegt von Blüte zu Blüte und überträgt Pollenpunkte. Früchte setzen an, mehr Blüten,
   mehr Bienen.

## Landtiere (Agent D)

### landArthropods – Atmen an der Luft
1. Silurisches Ufer mit ersten flachen Pflanzenpolstern, an Land noch kein Tier. Im Flachwasser ein
   Tausendfüßer-artiges Tier.
2. Es krabbelt mit wellenden Beinen aus dem Wasser zwischen die Pflanzen.
3. **Durchbruch:** Die Lupe auf ein Körpersegment: Kleine Atemlöcher öffnen sich, Luft strömt
   hinein, der Panzer glänzt (Beschriftung „Atemloch“).
4. Es frisst abgestorbenes Grün. Ein Trigonotarbide (Spinnentier-Verwandter ohne Netz) lauert und
   packt eine Beute.

### insects – Flügel
1. Ein flügelloses Urinsekt (sechs Beine, drei Schwanzfäden) läuft einen Schachtelhalm hinauf.
2. Zeitraffer „Generationen“: Kleine Flügellappen am Brustteil werden über mehrere Stufen größer.
   Das Tier springt und gleitet von Stängel zu Stängel.
3. **Durchbruch:** Volle Flügel: Es hebt ab, schlägt mit den Flügeln und zieht eine Schleife
   (Beschriftung „Flügel“).
4. Karbonsumpf: Eine Riesenlibelle (Meganeura) gleitet über das Wasser, kleinere Insekten schwirren.

### reptiles – Das Ei mit Schale
1. Ein Amphib legt Laich im Teich ab: Die Eier sind gallertig und liegen im Wasser (Beschriftung
   „Eier im Wasser“).
2. Ein kleines eidechsenartiges Tier (Hylonomus) legt auf trockenem Boden an einem Baumstumpf ein Ei
   mit fester Schale.
3. **Durchbruch:** Die Lupe zeigt das Ei im Schnitt. Der Embryo schwimmt in Flüssigkeit im Amnion
   (blau, Beschriftung), daneben der Dotter (gelb, Beschriftung), der schrumpft, während der Embryo
   wächst. Durch die Poren der Schale wandern Gaspünktchen.
4. Die Schale bricht, ein Junges schlüpft und läuft in eine trockene, sonnige Landschaft – weit weg
   vom Wasser.

### mammals – Warmes Blut, Fell und Milch
1. Morgendämmerung: Dimetrodon (Synapside mit Rückensegel) wärmt sich in der Sonne, sein Körper wird
   von kühlblau zu warm. Beschriftung „Synapside“.
2. Zeitraffer „vor 290 Mio. J.“ → „vor 250 Mio. J.“ → „vor 200 Mio. J.“: Dimetrodon verwandelt sich
   über einen Cynodonten (hundeartig, mit Schnurrhaaren) in Morganucodon (spitzmausgroß, mit Fell).
3. **Durchbruch:** Nacht. Eine Wärmebild-Lupe zeigt das kleine Säugetier warm leuchtend
   (orange-gelb), ein schlafendes Reptil daneben kalt blau. Das Säugetier huscht umher und schnappt ein
   Insekt (Beschriftung „warmes Blut“).
4. Im Bau säugt eine Mutter ihre Jungen, Milchtröpfchen (Beschriftung „Milch“).

### dinosaurs – Beine unter dem Körper
1. Ein kriechendes Reptil mit seitlich abgespreizten Beinen schlängelt den Rumpf hin und her.
2. Röntgenblick von vorn auf Becken und Beine: Die Beine drehen sich aus der Seitlage unter den
   Körper. Dazu die Zeitraffer-Plakette.
3. **Durchbruch:** Seitenansicht: Ein kleiner zweibeiniger Dinosaurier (Eoraptor) sprintet mit
   senkrechten Beinen über die Ebene, Staubwölkchen (Beschriftung „Beine unter dem Körper“).
4. Jura: Der Hals eines Sauropoden wächst bis in die Baumkronen. Hellblaue Luftsäcke leuchten in Hals
   und Rumpf (Beschriftung „Luftsäcke“).

### birds – Federn werden zu Flügeln
1. Ein kleiner flaumiger Raubdinosaurier brütet mit ausgebreiteten Armen auf dem Nest
   (Beschriftung „Daunen“).
2. Balz: Ein Männchen mit Fahnenfedern an Armen und Schwanz (Anchiornis-artig, bunt) spreizt Arme
   und Schwanz und tanzt.
3. **Durchbruch:** Archaeopteryx läuft an, schlägt mit den Flügeln und hebt ab (Beschriftung „Flügel“).
4. Ein Vogelschwarm zieht über die Landschaft. Die Silhouette eines großen Dinosauriers im
   Hintergrund verblasst, die Vögel bleiben.

### grazers – Mahlzähne und Hufe
1. Eozäner Wald: Ein kleines Urpferd (Eohippus) frisst Blätter.
2. Zeitraffer „vor 55“ → „35“ → „15“ → „5 Mio. J.“: Der Wald verblasst zu Grasland, das Pferd
   verwandelt sich (Eohippus → Mesohippus → Merychippus → Equus) und wird größer und langbeiniger.
3. **Durchbruch:** Zwei kleine Lupen: Fußknochen von vier Zehen über drei zu einem Huf (Beschriftung
   „Huf“) und Backenzähne von niedrig zu hoch (Beschriftung „hohe Zähne“).
4. Eine Herde aus Pferden und Antilopen galoppiert über die Steppe, Staub wirbelt.

## Wale und Amphibien (eigene Vorbildfilme)

### whales – Flossen, Fluke und Blasloch
1. Eozäne Küste: Pakicetus (wolfsartig, lange Schnauze) läuft zum Wasser und watet hinein.
2. Zeitraffer mit Gattungsnamen (Pakicetus → Ambulocetus → Rodhocetus → Dorudon, vor 50 → 40 Mio. J.):
   Das Tier schwimmt hinaus und verwandelt sich dabei. Die Beine werden kürzer, die Vorderbeine zu
   Flossen, der Schwanz bekommt eine Fluke.
3. **Durchbruch:** Die Lupe auf den Kopf zeigt, wie die Nasenlöcher von der Schnauzenspitze nach oben
   wandern (Beschriftung „Blasloch“).
4. Der Wal taucht auf und bläst, ein Kalb schwimmt dicht bei der Mutter.

### amphibians – Beine mit Fingern und Zehen
1. Devonischer Sumpf: Ein Fleischflosser schnappt an der Oberfläche Luft (Beschriftung „Lunge“).
2. Zeitraffer (Eusthenopteron → Tiktaalik → Acanthostega, vor 385 → 365 Mio. J.): Im Röntgenblick
   wird aus den Flossenknochen „ein Knochen, zwei, viele“ ein Bein mit Fingern.
3. **Durchbruch:** Es stemmt sich auf die Uferbank, die ersten Schritte, Fußspuren im Schlamm
   (Beschriftung „Finger und Zehen“).
4. An Land schnappt es einen Tausendfüßer. Am Wasserrand liegt ein Gelege im Wasser (Beschriftung
   „Eier im Wasser“).
