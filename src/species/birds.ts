/* =============================================================================
 * SimEarth 2.0 — species art: Vögel (birds)
 * -----------------------------------------------------------------------------
 * Side views facing right in the style of the reference set (mammals.ts): from
 * the clawed Archaeopteryx through fliers, swimmers and perchers to the
 * songbird; perching birds sit on a bark branch, standing ones on y ≈ 28.
 * ========================================================================== */

namespace SE {
  /** A leg, neck, branch or tail streamer as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  SPECIES[Life.Avian] = {
    stages: [
      // 1 · Archaeopteryx — vor 150 Mio. J. (Archaeopteryx (~150 Ma, Solnhofen, Germany)). A
      //   feathered bird with clawed fingers on the wings, a toothed snout and a long bony tail
      //   lined with feathers. Farben: black-brown wings, lighter tail.
      {
        name: 'Archaeopteryx', ma: 150, art: [
          { f: 'tan', d: 'M11.5 16.4 L9.5 16.8 L9 15.8 L7 17.2 L6.4 16.3 L4.4 17.8 L3.8 17.1 L1.8 19.6 L3.8 21.9 L4.6 21.1 L6.6 22.4 L7.4 21.5 L9.4 22.6 L10 21.6 L12 21 Z' },
          line('furDark', 1.6, 'M12 18.8 C8.5 18.9 5 19.2 2.6 19.6'),
          line('furDark', 2, 'M14.5 22 L13.4 25.4 L14.4 28.2 L17 28.4'),
          { f: 'fur', d: 'M10.5 18.6 C10.5 15.8 13.5 14.4 17 14.6 C20 14.8 22 16.4 21.8 18.8 C21.5 21.2 19 22.6 16 22.6 C12.8 22.6 10.5 21 10.5 18.6 Z' },
          line('tan', 2, 'M18 22 L19.6 25.2 L18.6 28.2 L21.6 28.4'),
          { f: 'fur', d: 'M18.5 16 C20.5 15 22.5 13.8 24.2 13 L26.6 15.8 C24.8 16.8 23.2 18 21.6 19.4 Z' },
          { f: 'fur', d: artCircle(25.6, 14, 2.6) },
          { f: 'fur', d: 'M27 12.6 L30.5 14.4 L30.3 15.2 L26.8 16.4 Z' },
          { f: 'black', d: 'M19.6 16.2 L19 5.6 L14.5 2.2 L14.2 4.8 L10.6 3.2 L10.6 6.2 L7 5.6 L8 8.6 L4.4 9 L6.8 11.6 L12.6 17.4 Z' },
          { f: 'furDark', d: 'M19.6 16.2 L19 5.6 L15.6 7.6 L14.6 15.8 Z' },
          line('tan', 1.6, 'M19.2 5.8 L22.4 3.6 L22.8 5'),
          line('tan', 1.6, 'M19.4 7.8 L22.6 6.8 L22.8 8.2'),
          { f: 'ink', d: artCircle(26.2, 13.2, 0.85) },
        ],
      },
      // 2 · Konfuziusvögel — vor 125 Mio. J. (Confuciusornis (~125 Ma, China), first toothless
      //   beak). A crow-sized bird with a toothless beak, claws on the wing and two very long ribbon
      //   tail feathers. Farben: dark grey, white-tipped streamers.
      {
        name: 'Konfuziusvögel', ma: 125, art: [
          line('bark', 2.4, 'M17.5 17.4 L29.5 15.8'),
          line('greyDark', 2, 'M12.2 13.8 C9 14.2 6 15.6 2.8 19.2'),
          line('greyDark', 2, 'M13 14.8 C10.5 17.5 10.2 21.5 7.2 24.6 C5.8 26 4.8 27.2 4.6 28.6'),
          line('white', 2.8, 'M4.6 17.4 L2.8 19.2'),
          line('white', 2.8, 'M5.6 26.4 L4.6 28.6'),
          { f: 'greyDark', d: 'M12 13.5 C11.5 9.5 14 6.5 17.5 6.2 C20.5 6 22.5 7.8 22.3 10.6 C22 13.6 20 15.6 17 15.8 C14.4 16 12.3 15.2 12 13.5 Z' },
          { f: 'black', d: 'M12.4 12.6 C13 9.2 16 7.4 19.6 8 C20 11 18.2 14.2 14.4 14.9 C13.4 14.6 12.7 13.8 12.4 12.6 Z' },
          line('bone', 1.6, 'M19.4 8.6 L21.6 9.4 L21.4 10.8'),
          { f: 'greyDark', d: artCircle(22, 5.4, 3.3) },
          { f: 'bone', d: 'M24.8 4 L29.4 6 L24.8 7.4 Z' },
          { f: 'white', d: artCircle(22.6, 4.8, 1.3) },
          { f: 'ink', d: artCircle(22.8, 4.8, 0.7) },
        ],
      },
      // 3 · Zahnvögel — vor 95 Mio. J. (Ichthyornis (~95-83 Ma) and Hesperornis (~83 Ma), toothed
      //   seabirds). A tern-like seabird with long pointed wings and a long toothed beak, flying
      //   low. Farben: white body, grey wings, dark beak.
      {
        name: 'Zahnvögel', ma: 95, art: [
          { f: 'greyDark', d: 'M17.5 18.5 L21.5 18.2 C20 13.5 17.5 8.5 13.5 4.5 C14.5 9 15.5 13.5 17.5 18.5 Z' },
          { f: 'white', d: 'M7 20.5 L2.2 17.2 L3.6 20.8 L2.2 24.4 L7.5 22.4 Z' },
          { f: 'white', d: 'M5.5 20.8 C8 18.3 13 17.5 18 17.7 C21.5 17.8 24 18.3 25.5 19.6 C25 22 21.5 23.4 17 23.6 C12 23.8 8 23 5.5 20.8 Z' },
          { f: 'white', d: artCircle(24, 18.4, 3) },
          { f: 'greyDark', d: 'M26.2 17.2 L30.5 19.4 L26.2 20.4 Z' },
          { f: 'grey', d: 'M10.5 19.5 L19 18.5 C16.5 13 11.5 8 3.6 4.8 C6 9 8 14 10.5 19.5 Z' },
          { f: 'greyDark', d: 'M3.6 4.8 C6 5.8 8 6.9 9.8 8.2 L7 10 C6 8.2 4.8 6.5 3.6 4.8 Z' },
          { f: 'ink', d: artCircle(24.8, 17.8, 0.8) },
        ],
      },
      // 4 · Entenvögel — vor 68 Mio. J. (Vegavis iaai (~68-66 Ma, Antarctica), early anseriform
      //   crown bird). A duck: rounded body, flat bill, short neck, floating. Farben: brown with
      //   green head sheen.
      {
        name: 'Entenvögel', ma: 68, art: [
          { f: 'fur', d: 'M3.2 14.6 C5 16.4 7 16.9 9 16.6 C12.5 15.5 17 15.3 21 16 C24.5 16.8 26.6 18.6 26.5 21 C26.2 24 22.5 25.6 17 25.6 L10 25.6 C6 25.6 3.6 23.5 3.6 20.2 C3.6 18.2 3.4 16.4 3.2 14.6 Z' },
          { f: 'furDark', d: 'M5 22.5 C10 24.2 20 24.4 26 21.5 C25 24.2 21.5 25.6 17 25.6 L10 25.6 C7.5 25.6 5.8 24.4 5 22.5 Z', o: 0.55 },
          { f: 'furDark', d: 'M7.5 19 C11.5 17.5 17 17.2 21 18.6 C18.5 21.4 12.5 22 7.5 20.8 Z' },
          { f: 'jungle', d: 'M20 17.4 C20.6 14.6 21 12.6 22 11.4 L26.2 11.8 C25.6 13.6 25.6 15.8 26.2 18 Z' },
          { f: 'jungle', d: artCircle(23.6, 10.2, 3.8) },
          { f: 'gold', d: 'M26.6 9.6 C28 9.8 29.6 10.4 30.4 11.3 C30.6 12.4 29.8 13 28.6 12.9 L26.4 12.7 Z' },
          { f: 'ink', d: artCircle(24.4, 9.2, 0.9) },
        ],
      },
      // 5 · Eulen — vor 60 Mio. J. (Strigiformes, Paleocene ~60 Ma (Ogygoptynx, Berruornis)). An
      //   upright round bird on a perch with a flat facial disc, big forward-facing eyes and ear
      //   tufts. Farben: brown-grey mottled, yellow eyes.
      {
        name: 'Eulen', ma: 60, art: [
          line('bark', 2.4, 'M2.5 27 L29.5 26'),
          { f: 'fur', d: 'M12 22 L12.8 29.5 L17.6 29.5 L18.6 22 Z' },
          { f: 'fur', d: artEllipse(15.5, 18, 7.5, 8.5) },
          { f: 'furLight', d: 'M9.5 17.5 C11.5 16.6 15 16.6 17 17.5 C17.2 21 16.6 24 15 26.2 C12 25.8 9.6 23.6 8.4 20.8 C8.6 19.6 9 18.4 9.5 17.5 Z' },
          line('fur', 1.6, 'M10.4 20 L14.2 20'),
          line('fur', 1.6, 'M11.6 23 L15.2 23'),
          { f: 'furDark', d: 'M17.5 16.5 C21.5 16 23.5 19.5 22.8 23.5 C21.8 25.8 19 26.6 17.2 25.4 C16.5 22.5 16.5 19.5 17.5 16.5 Z' },
          { f: 'fur', d: 'M11.8 7 L8.6 2.2 L14 5.4 Z' },
          { f: 'fur', d: 'M21 5.4 L26.4 2.2 L23.2 7 Z' },
          { f: 'fur', d: artCircle(17.5, 10.5, 6.5) },
          { f: 'furLight', d: artCircle(15.3, 10.8, 3.3) },
          { f: 'furLight', d: artCircle(20.3, 10.8, 3.3) },
          { f: 'yellow', d: artCircle(15.3, 10.6, 2.1) },
          { f: 'yellow', d: artCircle(20.3, 10.6, 2.1) },
          { f: 'ink', d: artCircle(15.6, 10.6, 1.1) },
          { f: 'ink', d: artCircle(20.6, 10.6, 1.1) },
          { f: 'furDark', d: 'M17 13 L18.6 13 L17.8 15.6 Z' },
        ],
      },
      // 6 · Papageien — vor 54 Mio. J. (Parrot-like birds in the Eocene of Europe (London Clay ~54
      //   Ma, Messel ~47 Ma); crown parrots younger). A perched bird with a strong hooked beak,
      //   two-forward two-back toes gripping a branch and a long tail. Farben: green with red and
      //   blue.
      {
        name: 'Papageien', ma: 54, art: [
          { f: 'red', d: 'M11.5 16.5 L15 18 L10.6 29.8 L8 29 Z' },
          line('bark', 2.4, 'M2.5 20.5 L29.5 19'),
          { f: 'jungle', d: 'M11.2 14.5 C10.8 10.8 13 7.8 16.5 7.4 C19.5 7 21.2 9.2 21 12.2 C20.8 15.5 19.3 18.2 16.3 18.7 C13.6 19.1 11.5 17.4 11.2 14.5 Z' },
          { f: 'blue', d: 'M11.4 15.5 C11.8 12.5 14 11 16.8 11.4 C17.6 14.5 16.5 17.8 13.6 19 C12.4 18.2 11.6 17 11.4 15.5 Z' },
          { f: 'jungle', d: artCircle(18.6, 6.6, 4) },
          { f: 'red', d: 'M17 3.2 C19.5 2.4 22 3.4 22.6 6 L19.5 6.6 C18.8 5.3 18 4.2 17 3.2 Z' },
          { f: 'bone', d: 'M21.6 4.2 C24.6 3.8 27.2 5.4 27.4 8.4 C27.5 10 26.8 11.4 25.6 11.8 C25.7 10.4 25.2 9.2 23.8 9 L21.6 9 Z' },
          { f: 'bone', d: 'M21.8 9.4 L24.2 9.4 C24.8 10.4 24.2 11.6 22.6 11.8 Z' },
          { f: 'bone', d: artCircle(19.6, 5.8, 1.4) },
          { f: 'ink', d: artCircle(19.8, 5.8, 0.8) },
        ],
      },
      // 7 · Laufvögel — vor 47 Mio. J. (Flightless palaeognaths, Palaeotis (Messel ~47 Ma,
      //   Germany); ratites such as ostrich and emu). A tall flightless bird with a long neck, long
      //   bare legs and a fluffy body, running. Farben: dark brown plumage, pinkish legs and neck.
      {
        name: 'Laufvögel', ma: 47, art: [
          line('pink', 2.4, 'M12.5 17 L9.8 22 L5.2 26.6'),
          line('pink', 2, 'M5.2 26.6 L3.4 27.4'),
          { f: 'white', d: 'M7 10.5 L2.5 7.2 L3.6 10.8 L2 13.6 L6.5 14.5 Z' },
          { f: 'furDark', d: 'M5 12.8 C5.8 9 10 7 15 7.4 C19 7.8 21.6 9.8 21.6 12.8 C21.6 15.6 19.6 17.6 17.2 18 L15.8 19.2 L14.4 18.2 L12.8 19.4 L11.4 18.2 L9.6 19 L8.6 17.6 C6.4 16.8 5.2 15 5 12.8 Z' },
          { f: 'white', d: 'M8.5 12.6 C10.5 11 14.5 10.8 17 12.2 C15 14.6 11 15.2 8.5 13.8 Z' },
          line('blossom', 2.6, 'M16.5 17.5 L18.5 22.5 L23.2 27.8'),
          line('blossom', 2, 'M23.2 27.8 L26 28'),
          line('blossom', 2.8, 'M19.5 10.5 C22 9 23 6.5 23.4 4.2'),
          { f: 'blossom', d: artCircle(24.2, 3.8, 2.1) },
          { f: 'blossom', d: 'M25.6 2.8 L29.6 3.9 L25.8 5.4 Z' },
          { f: 'ink', d: artCircle(24.6, 3.2, 0.8) },
        ],
      },
      // 8 · Singvögel — vor 30 Mio. J. (Passeriformes; Europe from ~30 Ma (Frauenweiler, Germany),
      //   Australia possibly ~55 Ma; songbirds (oscines) since the Oligocene). A small bird perched
      //   on a twig, beak open singing, tail cocked. Farben: brown back, orange breast.
      {
        name: 'Singvögel', ma: 30, art: [
          line('bark', 2.2, 'M2.5 25 L29.5 22.5'),
          { f: 'fur', d: 'M10.5 16.5 L4.2 9.2 L2.8 11.6 L8.6 19.8 Z' },
          line('greyDark', 1.8, 'M14.5 21 L14.2 24.2'),
          line('greyDark', 1.8, 'M17.5 21 L17.8 23.8'),
          { f: 'fur', d: artEllipse(15.3, 17, 6.8, 5) },
          { f: 'furDark', d: 'M9 17.5 C12 16 16 16 19 17.5 C17 20.5 12.5 21.5 9.5 19.5 Z', o: 0.55 },
          { f: 'fur', d: artCircle(20.5, 11.5, 4) },
          { f: 'orange', d: 'M24.3 12.6 C24.6 16.5 22.5 20.4 18.5 21.7 C16.5 22.2 14.5 22 13 21.4 C16.8 21 19.6 19.2 20.6 16.2 C21.2 14.4 21.6 13.2 21.6 12.2 Z' },
          { f: 'greyDark', d: 'M23.8 10.2 L28.8 8.2 L24.4 12 Z' },
          { f: 'greyDark', d: 'M24.4 12.8 L28.6 14.6 L23.8 14 Z' },
          { f: 'ink', d: artCircle(21.6, 10.6, 0.9) },
        ],
      },
    ],
    specialists: [
      // Papageitaucher — Eis, ab Unterart 8 (Fratercula (Alcidae), Arctic and subarctic coasts). A
      //   small upright black-and-white seabird with a big triangular, striped colourful beak.
      //   Farben: black back, white face and belly, orange-red-yellow beak.
      {
        name: 'Papageitaucher', biome: Biome.Arctic, minStage: 7, art: [
          { f: 'orange', d: 'M10.5 25.5 L9.6 28.8 L14.6 28.8 L14 25.5 Z' },
          { f: 'black', d: 'M9.5 18 C9.5 12.5 12 9.5 16 9.5 C20 9.5 22.5 12.5 22.5 18 C22.5 23.5 20 26.5 16 26.5 C12 26.5 9.5 23.5 9.5 18 Z' },
          { f: 'white', d: 'M17.5 14 C20.8 14.4 22.6 17.4 22.4 21 C22.2 24.4 20 26.5 17 26.5 C15.4 25 14.8 21 15.3 17.5 C15.6 16 16.4 14.6 17.5 14 Z' },
          { f: 'orange', d: 'M16.5 25.8 L16 28.8 L21.4 28.8 L19.8 25.8 Z' },
          { f: 'black', d: artCircle(17.8, 8.2, 5) },
          { f: 'white', d: artEllipse(19.4, 8.8, 3.2, 3.4) },
          { f: 'orange', d: 'M21.8 4.6 C25.2 5 28.6 7.2 29.8 10.2 L21.8 12.6 Z' },
          { f: 'red', d: 'M25.6 6.2 C27.6 7.2 29.2 8.6 29.8 10.2 L25.6 11.4 Z' },
          line('yellow', 1.6, 'M23.4 5.6 L23.4 11.8'),
          { f: 'ink', d: artCircle(19.8, 8, 0.9) },
        ],
      },
      // Rennkuckucke — Wüste, ab Unterart 8 (Geococcyx (roadrunner, Cuculidae)). A ground bird
      //   running fast with a long horizontal tail, a crest and long legs. Farben: brown-white
      //   streaks, blue-red eye patch.
      {
        name: 'Rennkuckucke', biome: Biome.Desert, minStage: 7, art: [
          line('greyDark', 2, 'M13.5 19 L10.5 23.2 L6.5 24.6'),
          { f: 'furDark', d: 'M11.8 13.6 L2.2 9.6 L2 12.8 L11.2 17.4 Z' },
          { f: 'fur', d: 'M9.6 15.6 C11 12.6 15 11.6 19 12.4 C21.6 12.9 22.8 14.6 22.2 16.6 C21.2 19 17.6 20.4 14 20 C11.6 19.7 10.1 18 9.6 15.6 Z' },
          { f: 'cream', d: 'M13 19.6 C16.5 20.4 20 19.4 22 17.2 C21.2 19.2 17.6 20.6 14.2 20.2 Z' },
          line('cream', 1.6, 'M12.4 15.4 L15.6 14.2'),
          line('cream', 1.6, 'M15.4 17.6 L19.2 16'),
          line('greyDark', 2, 'M17.2 19.6 L19.8 24.2 L18.4 28.4'),
          line('greyDark', 2, 'M18.4 28.4 L21.6 28.4'),
          { f: 'fur', d: 'M19 13.6 C20.4 11.6 21.6 10.4 23 9.6 L25.6 11.4 C24.4 12.6 23.4 14.4 22.4 16.4 Z' },
          { f: 'furDark', d: 'M21.2 8.8 L17.6 6.2 L20.6 6.4 L19 3.4 L22.6 5.4 L22.8 2.6 L25.2 7.2 Z' },
          { f: 'fur', d: artCircle(24, 9.6, 2.8) },
          { f: 'greyDark', d: 'M26.2 8.4 L30.5 10 L26.4 11.2 Z' },
          { f: 'ink', d: artCircle(24.6, 9, 0.8) },
        ],
      },
      // Flamingos — Sumpf, ab Unterart 8 (Phoenicopteridae (~30 Ma; stem form Juncitarsus ~50
      //   Ma)). A tall pink bird standing on one long leg with an S-shaped neck and bent beak.
      //   Farben: pink, black wing tips.
      {
        name: 'Flamingos', biome: Biome.Swamp, minStage: 7, art: [
          line('coral', 2, 'M13.5 17 L13.8 23 L13.6 28.4'),
          line('coral', 2, 'M13.6 28.4 L16.6 28.4'),
          line('coral', 2, 'M14.5 17 L18.4 21.2 L14.2 22.4'),
          { f: 'blossom', d: 'M3 13.2 C5.5 10.4 10 9 14.5 9.2 C18 9.4 20.4 10.8 20.4 13 C20.2 15.6 17.4 17.6 13.6 17.6 C9.8 17.6 6.4 16.2 4.8 14.6 Z' },
          { f: 'coral', d: 'M6.5 13.4 C9.5 12 14.5 11.8 18.5 13.6 C16.8 16.2 12.5 17 8.5 16 Z' },
          { f: 'black', d: 'M2.8 13.2 L7.6 12.2 L8.8 15.6 L4.6 14.8 Z' },
          line('blossom', 2.6, 'M18.5 11.5 C16.5 9 16 6.5 17.8 4.6 C18.6 3.8 19.6 3.4 20.8 3.4'),
          { f: 'blossom', d: artCircle(21.6, 3.8, 2) },
          line('bone', 2, 'M23 3.2 C25.6 3.2 26.8 4.6 26.6 6.8'),
          line('black', 2, 'M26.7 6 L26.4 7.8'),
          { f: 'ink', d: artCircle(22, 3.4, 0.7) },
        ],
      },
      // Tukane — Regenwald, ab Unterart 8 (Ramphastidae (Neotropical rainforest)). A black bird
      //   perched with an enormous colourful banana-shaped beak. Farben: black body, orange-yellow
      //   beak, white throat.
      {
        name: 'Tukane', biome: Biome.Jungle, minStage: 7, art: [
          { f: 'black', d: 'M9 19 L12.6 20 L10.4 29.6 L7.4 29 Z' },
          line('bark', 2.4, 'M2.5 23.5 L29.5 22'),
          { f: 'black', d: 'M8.5 15.5 C8 11.5 10.5 8 14.5 7.5 C17.5 7.2 19.5 9 19.5 12 C19.5 16 18 19.8 14.6 21.2 C11.6 22.2 9 19.4 8.5 15.5 Z' },
          { f: 'black', d: artCircle(16, 7.6, 4.4) },
          { f: 'white', d: 'M16.8 9.6 C19 9.4 20.4 10.6 20.2 13 C19.8 15.4 18 16.6 16 16.2 C15.4 14.2 15.6 11.4 16.8 9.6 Z' },
          { f: 'gold', d: 'M19 4.6 C23.4 3.4 28.4 5.4 30.4 10.4 C30.6 11.4 30 12.2 29 11.8 C26.2 10.6 22.6 10.4 19.6 11 Z' },
          { f: 'orange', d: 'M19.4 8.4 C23.2 7.8 27.4 8.8 30.3 10.8 C30.4 11.6 29.9 12.1 29 11.8 C26.2 10.6 22.6 10.4 19.6 11 Z' },
          { f: 'black', d: 'M28.2 7.6 C29.2 8.4 30 9.4 30.4 10.4 C30.6 11.4 30 12.2 29 11.8 L28 11.4 Z' },
          { f: 'white', d: artCircle(17, 6.6, 1.5) },
          { f: 'ink', d: artCircle(17.2, 6.6, 0.8) },
        ],
      },
    ],
  };
}
