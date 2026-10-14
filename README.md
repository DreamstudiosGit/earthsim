# earthsim – SimEarth 2.0

Eine Natur- und Evolutions-Sandbox im Browser, als moderner Nachfolger von *SimEarth: The Living Planet* (Maxis, 1990). Du begleitest einen Planeten von den ersten Zellen bis zur Gegenwart: Klima, Meere, Pflanzen, Tiere und schließlich Zivilisationen.

## Starten

- **Spielen:** `index.html` im Browser öffnen. Es braucht keinen Server und keine Installation. Läuft am Desktop und auf dem Handy, mit Maus oder Touch.
- **Entwickeln:** `npm run build` baut `simulation.js`, `npm test` führt alle Tests aus. Die Regeln für Mitarbeit stehen in [AGENTS.md](AGENTS.md).

## Neu in Version 0.7.0

### Arten-Lexikon
- Alle 136 Unterarten der 17 Tiergruppen lassen sich einzeln entdecken, von den Urzellen bis zu den Bisons.
- Jede Erstentdeckung meldet sich klein am Bildschirmrand, ohne das Spiel anzuhalten. Mehrere Entdeckungen kommen gesammelt.
- Während eines Films warten die Meldungen. Was beim Speichern noch nicht gezeigt war, erscheint nach dem Laden.
- Das **Lexikon** öffnest du mit der Taste **A** oder über das Menü „Fenster“:
  - Fortschritt „x / 136 entdeckt“, je Gruppe sortiert
  - Unentdeckte Arten erscheinen als Silhouette mit einem vagen Hinweis.
- Die **Infobox** einer Art zeigt:
  - ein großes Portrait, eine Beschreibung und wie sich die Art weiterentwickelt hat
  - den Stammbaum mit Vorgängern und Nachfolgern
  - warum sie auf deinem Planeten entstanden ist und unter welchen Umständen (Datum, Lebensraum, Temperatur, Sauerstoff)
  - die echten Spielwerte ihrer Gruppe
- „Zur Art springen“ fährt die Karte zur dichtesten Population.
- Ausgestorbene Arten werden markiert und bleiben im Lexikon.
- Die Option „Bei Entdeckung pausieren“ ist standardmäßig aus. Der Fortschritt wird mit dem Spielstand gespeichert.

### Pixel-Landschaft
- Die Karte ist als Pixel-Landschaft neu gezeichnet: ausgefranste Übergänge statt Kacheln, Flüsse als durchgehende Linien, Wälder mit überlappenden Kronen.
- Jedes Landfeld durchläuft eine **Sukzession** von kahlem Boden zum Klimax-Bewuchs, den Klima und Pflanzengruppen erlauben. Wurzeln bauen dabei Boden auf.
- Pixelgenauer Zoom ohne Flimmern.
- Das Untersuchen-Fenster zeigt einen vergrößerten Ausschnitt um das gewählte Feld.

### Erdkalender und Ozean
- Die Zeit folgt der Erdgeschichte: Der Planet entsteht vor 4,6 Mrd. Jahren, und jeder Evolutionsschritt landet nahe seinem echten Datum („vor … Jahren“).
- **Ozeanchemie:** Der erste Sauerstoff der Meeresproduzenten rostet zunächst das gelöste Eisen aus. Erst danach reichert er sich im Wasser und schließlich in der Luft an, wie bei der Großen Sauerstoffkatastrophe.
- Ein neuer Planet beginnt mit seinen ersten Zellen an einer einzigen Stelle im offenen Meer. Jede neue Gruppe entsteht neben ihren Vorfahren.

### Tiere und Pflanzen auf der Karte
- Neue Vektor-Symbole für alle Tier- und Pflanzengruppen, mit je 8 Unterarten.
- **Biom-Spezialisten:** Eisbären auf großen Eisflächen, Wüstenfüchse in weiten Wüsten, Kakteen in Wüsten.
- **Herden:** Tiere stehen dauerhaft auf der Karte und wandern Feld für Feld, wie im Original-SimEarth.
- Im Evolutionsbaum zeigt jede Tiergruppe ihre 8 Unterarten als Bildleiste.

### Neuer Planet
- Ein Regler bestimmt, wie viel des Planeten unter Wasser liegt („58 % Meer · 42 % Land“). Eine Markierung zeigt, wo eine erdähnliche Welt liegt.

## Bekannte Einschränkungen

- Geprüft wurde bisher nur in headless Chrome. Andere Browser und echte Touch-Geräte sind ungetestet.
- Die Pixel-Landschaft hat noch offene Punkte, etwa Helligkeitskanten an Kachelgrenzen und Sand direkt neben Eis. Details stehen in [docs/landschaft-2026-10/review.md](docs/landschaft-2026-10/review.md).

## Mehr dazu

- Arten-Lexikon: [docs/oekosystem-2026-10/lexikon.md](docs/oekosystem-2026-10/lexikon.md)
- Pixel-Landschaft: [docs/biomes-spec.md](docs/biomes-spec.md), [docs/landschaft-2026-10/](docs/landschaft-2026-10/)
- Grafik und Evolutionsfilme: [docs/grafik-2026-10/bericht.md](docs/grafik-2026-10/bericht.md)
- Evolutionsbaum und Quellen: [docs/ueberarbeitung-2026-10/](docs/ueberarbeitung-2026-10/)
- Liste aller ausgelieferten Versionen: [docs/done.md](docs/done.md)
