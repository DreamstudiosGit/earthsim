/* =============================================================================
 * SimEarth 2.0 — species art: Reptilien (reptiles)
 * -----------------------------------------------------------------------------
 * Non-dinosaur reptiles as side views facing right, feet on y ≈ 28 (only the
 * glider is seen from above), far limbs a shade darker. Every stage has its own
 * body plan: lizard on a stump, knobby barrel, fan wings, shell, membrane wings,
 * ridged croc, legless snake, high-necked monitor.
 * ========================================================================== */

namespace SE {
  /** A limb, tail or body as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  SPECIES[Life.Reptile] = {
    stages: [
      // 1 · Ursaurier — vor 312 Mio. J. (Hylonomus lyelli (~312 Ma), one of the oldest reptiles).
      //   A small slim lizard-like animal with sprawling legs and a long tail, on a tree stump.
      //   Farben: brown with light stripes.
      {
        name: 'Ursaurier', ma: 312, art: [
          { f: 'bark', d: 'M10 29.5 C11.4 28.6 12 27.4 12 25.8 L12 24.4 L23.6 24.4 L23.6 25.8 C23.6 27.4 24.2 28.6 25.6 29.5 Z' },
          { f: 'fur', d: artEllipse(17.8, 24.4, 5.8, 1.4) },
          line('fur', 2, 'M15.6 18.6 L14.8 24.2'),
          line('fur', 2, 'M23.6 17.6 L24.6 24'),
          { f: 'tan', d: 'M11 15.6 C7 16 4.4 18.6 3.2 22.4 L2.2 26.4 L4.8 23.2 C6.2 20.4 8.2 18.8 11.2 18.4 Z' },
          { f: 'tan', d: 'M9.5 17 C9.5 15.2 12.5 14.4 16 14.4 C19 14.4 21 14.6 22.5 14.8 C24 13.2 26.5 12.8 28.5 13.8 C29.7 14.4 30.3 15.2 30 15.8 C28.8 16.6 27 16.8 25.5 16.8 C24.5 17.8 23 18.6 21 18.8 C18 19.2 14 19.2 11.5 18.8 C10.2 18.5 9.5 17.9 9.5 17 Z' },
          { f: 'cream', d: 'M10.4 16.2 C12.5 15.2 16.5 15 20 15.3 C22.5 15.5 24.5 15 26.5 14.4 C25 15.6 23 16.4 20 16.4 C16.5 16.4 13 16.2 10.4 16.2 Z' },
          { f: 'fur', d: 'M10.8 18.4 C14 19.2 19 19.2 23.4 17.8 C22.6 18.4 21.8 18.7 21 18.8 C18 19.2 14 19.2 11.5 18.8 C11.2 18.7 11 18.6 10.8 18.4 Z', o: 0.6 },
          line('tan', 2.2, 'M13.5 18.5 L12.4 24.2'),
          line('tan', 2.2, 'M21.5 18.2 L22.4 24.2'),
          { f: 'ink', d: artCircle(26.4, 14.9, 0.8) },
        ],
      },
      // 2 · Pareiasaurier — vor 265 Mio. J. (Pareiasauria (Bradysaurus, Middle Permian ~265 Ma)).
      //   A bulky barrel-bodied quadruped with a knobby armoured head, cheek bosses and short tail.
      //   Farben: grey-brown with lighter knobs.
      {
        name: 'Pareiasaurier', ma: 265, art: [
          line('greyDark', 3.4, 'M8.5 20 L6.8 27.8'),
          line('greyDark', 3.4, 'M20 20 L21.6 27.8'),
          { f: 'grey', d: 'M6.5 17.4 C4.5 18.6 3 19.8 1.6 21.4 C3.5 21.6 5.5 21.4 7.2 20.8 Z' },
          { f: 'grey', d: 'M5 17 C5 12.5 9.5 10 15 10 C19.5 10 23 12 24 15.5 C24.5 18 23.5 20 21 21.5 C17 23 10 23 7.5 21.5 C5.8 20.5 5 19 5 17 Z' },
          { f: 'greyDark', d: 'M5.5 19 C8 21 15 22 23.5 19 C22.5 20.4 21.8 21 21 21.5 C17 23 10 23 7.5 21.5 C6.5 20.9 5.8 20.1 5.5 19 Z', o: 0.6 },
          { f: 'bone', d: artCircle(8.6, 12.2, 1.5) },
          { f: 'bone', d: artCircle(12.6, 10.4, 1.5) },
          { f: 'bone', d: artCircle(16.8, 10.1, 1.5) },
          { f: 'bone', d: artCircle(20.8, 11.4, 1.5) },
          line('grey', 3.6, 'M11.5 21 L9.8 28'),
          line('grey', 3.6, 'M17.5 21 L19 28'),
          { f: 'grey', d: 'M20.8 15 C22.4 13.2 26 12.8 28.3 14 C29.8 14.8 30.4 16.8 30 18.4 C29.6 19.6 28.6 20.2 27.4 20.2 L25.4 20.4 C25.6 21.8 25 23 23.8 23.4 C22.8 22.6 22.2 21.4 21.8 20.2 C21 19.4 20.8 18.2 20.8 17 Z' },
          { f: 'greyDark', d: 'M21.8 19.4 C23 20 24.4 20.3 25.4 20.4 C25.6 21.8 25 23 23.8 23.4 C22.8 22.6 22.2 21.4 21.8 20.2 Z', o: 0.6 },
          { f: 'bone', d: artCircle(23.4, 13.4, 1.3) },
          { f: 'bone', d: artCircle(27.2, 13.4, 1.2) },
          { f: 'bone', d: artCircle(29.4, 15.8, 1) },
          { f: 'ink', d: artCircle(26.4, 16.4, 0.9) },
        ],
      },
      // 3 · Gleitechsen — vor 255 Mio. J. (Weigeltisauridae (Weigeltisaurus, Kupferschiefer ~256
      //   Ma, Germany; Coelurosauravus)). A lizard gliding with a wide fan-like membrane spread on
      //   each side, supported by rods, frilled head. Farben: brown body, orange-red striped
      //   membranes.
      {
        name: 'Gleitechsen', ma: 255, art: [
          line('furDark', 2, 'M10 16 C6.5 16.2 4.4 17.4 2.6 18.8'),
          { f: 'orange', d: 'M9 14.8 L7.7 9.4 L9.7 7.9 L10.6 4.9 L12.8 5.2 L14.6 3.2 L16.4 5.2 L18.6 4.9 L19.5 7.9 L21.5 9.4 L20.4 14.8 Z' },
          { f: 'orange', d: 'M9 17.2 L7.7 22.6 L9.7 24.1 L10.6 27.1 L12.8 26.8 L14.6 28.8 L16.4 26.8 L18.6 27.1 L19.5 24.1 L21.5 22.6 L20.4 17.2 Z' },
          { f: 'rust', d: 'M12.2 11.4 L10.2 7.6 L11.7 6 L13.4 10.3 Z' },
          { f: 'rust', d: 'M13.9 10 L13.7 5.2 L15.5 5.2 L15.3 10 Z' },
          { f: 'rust', d: 'M15.8 10.3 L17.5 6 L19 7.6 L17 11.4 Z' },
          { f: 'rust', d: 'M12.2 20.6 L10.2 24.4 L11.7 26 L13.4 21.7 Z' },
          { f: 'rust', d: 'M13.9 22 L13.7 26.8 L15.5 26.8 L15.3 22 Z' },
          { f: 'rust', d: 'M15.8 21.7 L17.5 26 L19 24.4 L17 20.6 Z' },
          { f: 'rust', d: 'M9 17.2 L7.7 22.6 L9.7 24.1 L10.6 27.1 L12.8 26.8 L14.6 28.8 L16.4 26.8 L18.6 27.1 L19.5 24.1 L21.5 22.6 L20.4 17.2 Z', o: 0.3 },
          { f: 'furDark', d: 'M8.5 16 C8.5 14.6 12 13.8 16 13.8 C19.5 13.8 22.5 14.4 23.6 14.8 L23.6 17.2 C22.5 17.6 19.5 18.2 16 18.2 C12 18.2 8.5 17.4 8.5 16 Z' },
          { f: 'rust', d: 'M22.8 16 L22.8 12.8 L24.2 13.8 L25.4 12.6 L26 14.4 L26 17.6 L25.4 19.4 L24.2 18.2 L22.8 19.2 Z' },
          { f: 'fur', d: 'M23.4 14.2 C25.6 13.6 28.4 14.6 30.2 16 C28.4 17.4 25.6 18.4 23.4 17.8 Z' },
          { f: 'ink', d: artCircle(27, 15, 0.7) },
          { f: 'ink', d: artCircle(27, 17, 0.7) },
        ],
      },
      // 4 · Schildkröten — vor 220 Mio. J. (Odontochelys (~220 Ma, belly shell); Proganochelys
      //   (~210 Ma, full shell, Germany)). A domed shell with plate pattern, head and stubby legs
      //   out to the right. Farben: olive-brown shell, yellow plate lines.
      {
        name: 'Schildkröten', ma: 220, art: [
          { f: 'kelp', d: 'M5.5 21.5 L2 23.6 L6 24 Z' },
          { f: 'kelp', d: 'M7 22 L11 22 L11 28.5 L6.2 28.5 Z' },
          { f: 'kelp', d: 'M19.5 22 L23.5 22 L24.5 28.5 L19.8 28.5 Z' },
          { f: 'kelp', d: 'M23 19 C24.5 16.8 27.5 16.2 29.3 17.4 C30.4 18.3 30.3 20 29.2 20.8 C27.8 21.6 25.5 21.6 23.8 21.8 Z' },
          { f: 'olive', d: 'M4 22 C4 14 9 8.5 15 8.5 C21 8.5 26 13.5 26 21 L26 22.5 L4 22.5 Z' },
          { f: 'scaleDark', d: 'M15 8.5 C21 8.5 26 13.5 26 21 L26 22.5 L15 22.5 Z', o: 0.5 },
          line('yellow', 1.6, 'M11 16 L12.8 12.4 L17.4 12.4 L19.2 16 L17.4 19.4 L12.8 19.4 Z'),
          line('yellow', 1.6, 'M11 16 L5.6 16.4'),
          line('yellow', 1.6, 'M19.2 16 L24.6 16.4'),
          line('yellow', 1.6, 'M12.8 12.4 L10.5 9.8'),
          line('yellow', 1.6, 'M17.4 12.4 L19.6 9.8'),
          { f: 'kelp', d: 'M3.6 20.5 L26.4 20.5 L26.4 23.5 L3.6 23.5 Z' },
          { f: 'ink', d: artCircle(27.2, 18.4, 0.9) },
        ],
      },
      // 5 · Flugsaurier — vor 215 Mio. J. (Pterosauria, Late Triassic ~219-210 Ma
      //   (Eudimorphodon)). A flying reptile with long membrane wings, a long toothed beak and a
      //   long tail ending in a diamond vane. Farben: rust-red wings, cream body.
      {
        name: 'Flugsaurier', ma: 215, art: [
          { f: 'furDark', d: 'M17 17.5 L21 9.5 L25.5 3 C24.5 9 21.5 14.5 18.5 19 Z' },
          line('cream', 1.8, 'M11.5 19.5 C8.5 20.5 6.5 21.5 4.5 22.5'),
          { f: 'rust', d: 'M4.5 22.6 L2.8 20.6 L1.6 23.2 L3.4 25.2 Z' },
          { f: 'rust', d: 'M19.5 18 L14.5 9 L2.5 3.5 C5.5 8.5 8.5 14 10.5 19.5 Z' },
          { f: 'cream', d: 'M10 19.5 C11.5 17.5 15.5 16.8 19 17 C21 17.2 22.3 17.8 23 18.6 L21.5 20.6 C18.5 21.6 13.5 21.6 10 19.5 Z' },
          { f: 'cream', d: 'M21 17.5 C22 15.5 24 14.6 25.5 15.2 L30.5 16.8 L25.5 17.8 C24.5 18.7 23 19.2 21.5 19.2 Z' },
          { f: 'ink', d: artCircle(23.9, 16.4, 0.8) },
        ],
      },
      // 6 · Krokodile — vor 200 Mio. J. (Crocodyliformes, Protosuchus (Early Jurassic ~200 Ma);
      //   crown crocodylians ~95 Ma). A low long body with a long toothy snout, short legs and a
      //   heavy ridged tail. Farben: olive green, darker ridges.
      {
        name: 'Krokodile', ma: 200, art: [
          line('scaleDark', 2.4, 'M13 22.5 L12.8 27.8'),
          line('scaleDark', 2.4, 'M20 22.5 L20.6 27.8'),
          { f: 'scaleDark', d: 'M3 20.4 L4.6 18.4 L6.2 19.4 L7.8 17.2 L9.4 18.6 L11 16.2 L12.6 17.8 L14.2 15.6 L15.8 17.4 L17.4 15.4 L19 17.4 L20.4 16 L21.4 18 Z' },
          { f: 'olive', d: 'M1.5 21.4 C5 20 9 18.4 13 17.6 C16 17.1 19 17 21 17.3 C22.4 16.6 24.2 16.8 25.2 17.8 L30.5 19.6 C30.6 20.6 30 21.2 29 21.3 L24 21.6 C22 23.4 18 24 13 23.6 C9 23.2 5 22.4 1.5 21.4 Z' },
          { f: 'cream', d: 'M8 22.4 C12 23.4 18 23.6 22.8 22.4 C21 23.4 18 24 13 23.6 C11 23.4 9.4 23 8 22.4 Z' },
          { f: 'cream', d: 'M25 21.4 L26 20.2 L27 21.3 L28 20.2 L29 21.2 Z' },
          line('olive', 2.6, 'M11.5 22.5 L10 25 L11 27.8'),
          line('olive', 2.6, 'M21.5 22 L23 25 L22.5 27.8'),
          line('olive', 2, 'M11 27.8 L13.4 27.8'),
          line('olive', 2, 'M22.5 27.8 L24.9 27.8'),
          { f: 'olive', d: artCircle(23.2, 17, 1.6) },
          { f: 'ink', d: artCircle(23.5, 17, 0.8) },
        ],
      },
      // 7 · Schlangen — vor 167 Mio. J. (Serpentes: Eophis jaws (~167 Ma; Caldwell et al. 2015);
      //   legged body fossils Najash ~95 Ma). A legless body in an S-curve, head raised to the right
      //   with a forked tongue. Farben: green with dark diamond pattern.
      {
        name: 'Schlangen', ma: 167, art: [
          line('red', 1.6, 'M27.5 11.6 L29 11.6 L29.8 10.8 M29 11.6 L29.8 12.4'),
          line('scale', 2.4, 'M2.5 26.5 C4.5 26.8 6 25.8 7.5 24.5'),
          line('scale', 3.8, 'M7 25 C9 22.5 11 21.5 13 22 C15.5 22.6 16.5 26.5 20 26.5 C23.5 26.5 25 23 23.5 19.5 C22.5 17 21.5 15 22.5 12.5'),
          { f: 'scale', d: 'M21.2 12 C21.5 10.2 23.5 9.4 25.5 9.6 C27 9.8 28.2 10.6 28.3 11.6 C28.2 12.6 27 13.3 25.5 13.4 C23.6 13.6 21.6 13.4 21.2 12 Z' },
          { f: 'scaleDark', d: 'M10.4 22.8 L11.6 21.6 L12.8 22.8 L11.6 24 Z' },
          { f: 'scaleDark', d: 'M15.4 24.2 L16.6 23 L17.8 24.2 L16.6 25.4 Z' },
          { f: 'scaleDark', d: 'M20.4 25.8 L21.6 24.6 L22.8 25.8 L21.6 27 Z' },
          { f: 'scaleDark', d: 'M23.2 20.2 L24.4 19 L25.4 20.2 L24.4 21.4 Z' },
          { f: 'scaleDark', d: 'M21.8 15.4 L23 14.2 L24 15.4 L23 16.6 Z' },
          { f: 'ink', d: artCircle(25.6, 11, 0.8) },
        ],
      },
      // 8 · Warane — vor 80 Mio. J. (Varanidae, from Late Cretaceous ~80 Ma (Mongolia)). A large
      //   lizard with the long neck held up, heavy body, strong claws and a flicking forked tongue.
      //   Farben: dark grey-brown with yellow speckles.
      {
        name: 'Warane', ma: 80, art: [
          line('red', 1.6, 'M28.2 14.2 L29 14.2 L29.8 13.4 M29 14.2 L29.8 15'),
          { f: 'greyDark', d: 'M11.5 17.6 C7 18 4 20.5 2.6 24.6 L1.6 27 C4.4 24.6 8 23 12 22.2 Z' },
          { f: 'greyDark', d: 'M10 20 C10 17.6 13.5 16.6 17.5 16.6 C19.6 16.6 21.2 16.2 22.4 15.2 L25 16.4 C24.4 18.2 23.4 19.8 22 20.8 C19.6 22.4 14.4 22.9 12 22.6 C10.7 22.4 10 21.4 10 20 Z' },
          { f: 'greyDark', d: 'M21.8 14.6 C22.8 12.8 25 12.2 26.8 12.6 L28.8 13.6 C28.8 14.4 28.2 14.9 27.4 15 L25.6 15.3 C24.6 16.3 23.2 16.8 22.2 16.5 Z' },
          { f: 'black', d: 'M10.4 21.2 C13.5 22.3 19 22 23.2 20 C22.8 20.3 22.4 20.6 22 20.8 C19.6 22.4 14.4 22.9 12 22.6 C11.2 22.5 10.7 22 10.4 21.2 Z', o: 0.6 },
          line('greyDark', 2.8, 'M13.8 21.8 L9.6 23.6 L10.4 27.8'),
          line('greyDark', 2.8, 'M21.6 20.4 L25.6 22.2 L24.6 27.8'),
          line('greyDark', 2, 'M10 27.8 L12.8 27.8'),
          line('greyDark', 2, 'M24.2 27.8 L27 27.8'),
          { f: 'yellow', d: artCircle(13.6, 18.6, 0.9) },
          { f: 'yellow', d: artCircle(16.8, 18.2, 0.9) },
          { f: 'yellow', d: artCircle(20, 18, 0.9) },
          { f: 'yellow', d: artCircle(15.2, 20.8, 0.8) },
          { f: 'yellow', d: artCircle(18.4, 20.6, 0.8) },
          { f: 'yellow', d: artCircle(8.8, 20.8, 0.8) },
          { f: 'yellow', d: artCircle(5.8, 23, 0.7) },
          { f: 'ink', d: artCircle(25.2, 13.8, 0.8) },
        ],
      },
    ],
    specialists: [
      // Klapperschlangen — Wüste, ab Unterart 8 (Crotalus (rattlesnakes, Crotalinae), Neogene). A
      //   coiled snake with raised head and an upright rattle at the tail tip. Farben: sandy tan
      //   with brown diamonds, cream rattle.
      {
        name: 'Klapperschlangen', biome: Biome.Desert, minStage: 7, art: [
          line('tan', 2.4, 'M8 21.5 C6.2 20.4 5.6 18.6 5.6 16.4'),
          { f: 'cream', d: 'M3.2 16.6 C3 12.4 3.6 8.8 5.6 5.8 C7.6 8.8 8.2 12.4 8 16.6 Z' },
          line('furDark', 1.6, 'M3.6 13.6 L7.6 13.6'),
          line('furDark', 1.6, 'M4.1 10.2 L7.1 10.2'),
          { f: 'tan', d: artEllipse(15, 25.8, 10.6, 3.4) },
          line('furDark', 1.8, 'M6.4 23.4 C10.5 25.2 18 25.2 22.6 23.4'),
          { f: 'tan', d: artEllipse(14.6, 21.4, 7.8, 2.9) },
          line('furDark', 1.8, 'M9 19.4 C11.5 20.6 16.5 20.6 19.6 19.4'),
          { f: 'tan', d: artEllipse(14.4, 17.8, 4.8, 2.2) },
          line('tan', 3.6, 'M17 17.6 C20.6 16.6 22.6 14.6 21.4 12 C20.6 10.2 20.8 8.8 22.2 8'),
          { f: 'tan', d: 'M20.2 7.8 C21.2 6 23.4 5.2 25.2 5.6 L28.6 7.2 C29.3 7.7 29.3 8.9 28.6 9.4 L25 10.8 C23.4 12 21.2 11.8 20.4 10.6 Z' },
          { f: 'furDark', d: 'M21.2 7.4 C22.4 6.4 24 6 25.4 6.4 L24.6 7.8 C23.4 7.6 22.2 7.8 21.2 8.4 Z', o: 0.6 },
          { f: 'furDark', d: 'M11.6 21.6 L14 20.4 L16.4 21.6 L14 22.8 Z' },
          { f: 'furDark', d: 'M7.2 26.2 L9.6 24.8 L12 26.2 L9.6 27.6 Z' },
          { f: 'furDark', d: 'M14 27 L16.4 25.6 L18.8 27 L16.4 28.4 Z' },
          { f: 'furDark', d: 'M20.2 26 L22.6 24.6 L25 26 L22.6 27.4 Z' },
          { f: 'furDark', d: 'M20.6 13.4 L22 12.2 L23.2 13.6 L21.8 14.8 Z' },
          { f: 'ink', d: artCircle(24.4, 8, 0.8) },
        ],
      },
      // Chamäleons — Regenwald, ab Unterart 8 (Chamaeleonidae; fossils from Early Miocene ~26-20
      //   Ma (Europe), molecular ~60-90 Ma). A lizard gripping a branch with a casque head, turret
      //   eye and a curled spiral tail. Farben: bright green with turquoise stripes.
      {
        name: 'Chamäleons', biome: Biome.Jungle, minStage: 7, art: [
          line('bark', 2.6, 'M2.5 24.4 L29.5 22.6'),
          line('jungle', 2.2, 'M15 19.5 L15.5 23.5'),
          line('frog', 2.2, 'M10 15.5 C7.8 11.6 3.6 11.6 3.2 15.5 C2.8 18.4 4.6 20.3 7 19.9 C8.8 19.5 9.3 17.1 7.6 16.3'),
          { f: 'frog', d: 'M9 16 C9 11.5 12.5 9 16.5 9 C19.5 9 21.5 10.5 22.5 12.5 L23 18 C21.5 19.5 18.5 20.5 15 20.5 C12 20.5 9.5 18.7 9 16 Z' },
          { f: 'mint', d: 'M12.8 9.8 L14.8 9.2 L15.2 20.5 L13.2 20.3 Z' },
          { f: 'mint', d: 'M17.6 9.2 L19.6 9.8 L19.8 20 L17.8 20.4 Z' },
          line('frog', 2.2, 'M12 19.5 L11 24.6'),
          line('frog', 2.2, 'M20 18.5 L21.5 23.2'),
          { f: 'frog', d: 'M20.6 13.5 L21.4 6.6 L25.6 10 C27.6 10.9 29 12.4 29.4 14.2 C29.6 15.6 28.8 16.6 27.2 16.8 L22.5 17.4 Z' },
          { f: 'mint', d: 'M21.4 6.6 L25.6 10 L22.6 11.2 Z' },
          { f: 'mint', d: artCircle(25, 13.4, 2.2) },
          { f: 'ink', d: artCircle(25.6, 13.4, 1) },
        ],
      },
    ],
  };
}
