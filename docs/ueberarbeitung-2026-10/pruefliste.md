# Arbeits- und Prüfliste – Überarbeitung Oktober 2026

Ausgangspunkt: SimEarth 2.0 (TypeScript, eine `simulation.js`, Start direkt über `index.html`).
Vorgänger: *SimEarth: The Living Planet* (Maxis, 1990). Das Original liegt nicht als Datei vor;
Referenz sind die bestehende Version (Retro-Nachbau mit Menüleiste, Edit-/Kartenfenster, Gaia,
15 Lebensklassen, Pixel-Kacheln) und der Prüfbericht vom 8. 9. 2026 (`docs/review-2026-09-08`).

Status: ☐ offen · ☑ erledigt und geprüft · ⚠ mit Einschränkung (siehe Abschlussbericht)

## A. Menüs (Bestand)
- ☑ Datei: Neuer Planet · Planet laden · Planet speichern · Schnappschuss
- ☑ Fenster: Edit · Karte · Gaia · Verlauf · Bericht · Glossar
- ☑ Modelle (je 100 Ω): Geosphäre · Atmosphäre · Biosphäre · Zivilisation
- ☑ Diagramme: Luftprobe · Biomanteile · Lebensformen · Technologie
- ☑ Optionen: Zu Ereignissen springen · Hintergrund aktualisieren (Ereignisebene)
- ☑ Tempo: Pause · Sehr langsam · Langsam · Mittel · Schnell · Relatives/Absolutes Datum
- ⚠ DataSound: weiterhin nicht implementiert, als „Klang – noch nicht verfügbar“ in Optionen gekennzeichnet

## B. Fenster, Dialoge, Zustände (Bestand)
- ☑ Edit-Fenster: 6 Werkzeuge, Energieanzeige, Werkzeugoptionen (Paletten, Tabs Leben/Städte/Terra),
  5 Datenebenen, 6 Klima-Overlays, CO₂/O₂-Anzeige, Kachelkarte mit Cursor
- ☑ Kartenfenster: 12 Kartenmodi in 5 Gruppen, Legende/Info, Edit/Globus/Info-Schalter, Klick-Navigation
- ☑ Gaia (Gesicht, Stimmung), Verlauf (8 Kurven, Schalter), Bericht (Text, aktuelle Aufgabe), Glossar
- ☑ Untersuchen-Fenster (Biom, Art, Status, Artenleiste, Fußzeile)
- ☑ 4 Modellfenster mit 27 Reglern, 4 Diagrammfenster
- ☑ Meilenstein-Dialog „Leben entsteht“ · Meldungsleiste (Info/Warnung)
- ☑ Leere/gesperrte Zustände, Fehlermeldungen (Laden, Speichern, Kosten, ungültige Ziele)

## C. Evolution (Bestand → Neu)
- Bestand: 15 Tierklassen (Meer 7, Land 8) mit zufälliger Artbildung, Unterarten (3 Stufen),
  Vegetation als ein einziges Feld, keine Pflanzenlinien, fiktive Linien (Trichordaten, Carniferns),
  biologische Widersprüche (Fische aus Gliederfüßern/Weichtieren, Carnifern aus Insekten,
  Wale aus Fischen, Säugetiere aus Trichordaten).
- ☑ Neue zentrale Daten: Pflanzen- und Tierlinien getrennt, Abstammung ≠ Lebensraum ≠ Ökologie
- ☑ Pflanzenpfad Meer → Ufer → Sümpfe → Flüsse → Landesinneres, Süßwasser-Grünalgen als Übergang
- ☑ Tierpfade mit Lebensraum- und Nahrungsbedingungen; Bestäuber nach Blütenpflanzen ohne Blockade
- ☑ Evolutionsbaum (Zustände, Legende, Detailansicht, Zoom/Verschieben, Tastatur, mobil)
- ☑ Ereignisse je Entwicklung, Warteschlange, einmalige Anzeige, Chronik

## D. Simulation/Logik (Bestand inkl. Befunde F01–F11, M01–M02)
- ☑ F01 Modellregler wirkungslos · ☑ F02 fehlerhaftes Laden überschreibt Welt
- ☑ F03 Kosten ohne Wirkung · ☑ F04 Habitatprüfung zu optimistisch · ☑ F05 veraltete Anzeigen
- ☑ F06 Feuer ohne Vegetationsverlust · ☑ F07 Driftphase nicht gespeichert/zurückgesetzt
- ☑ F08 Fenster außer Reichweite · ☑ F09 Rechtsklick löst Werkzeug aus · ☑ F10 Dialogpause
- ☑ F11 Fensterstapel · ☑ M01 „Kunst/Medien“ ohne Wirkung · ☑ M02 unerreichbarer „Exodus“

## E. Speicherung
- ☑ Speichern/Laden, Validierung vor Übernahme, Migration Version 4 → 5, alter Slot bleibt erhalten
- ☑ Gemeldete Ereignisse/Chronik/Entwicklungen gespeichert, keine Wiederholung nach dem Laden

## F. Prüfung
- ☑ Automatisierte Tests (Evolutionsdaten, Erreichbarkeit, Zyklen, Kosten, Mehrfachklick, Speichern/Migration)
- ☑ Vollständiger Fortschrittspfad + Abzweigungen (eigene Testspielstände)
- ☑ Oberfläche im Browser: groß/klein/mobil, Menüs, Dialoge, SVGs, Kontraste, Überläufe, Laufzeitfehler, Leistung
  (⚠ nur Chrome; Regressionslauf der Prüf-Agenten durch Nutzungslimit unvollständig – siehe bericht.md)

Ergebnisse und Einschränkungen: siehe [bericht.md](bericht.md).
