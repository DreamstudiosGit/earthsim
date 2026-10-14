/* =============================================================================
 * SimEarth 2.0 — species art: Huftiere & Weidetiere (grazers)
 * -----------------------------------------------------------------------------
 * Hoofed plant-eaters from the fox-sized dawn horse to the bison, in side view
 * facing right, feet on y ≈ 28, far legs a shade darker. Each icon carries one
 * oversized signature (forked horn, neck, antlers, mane, hump) so the
 * four-legged shapes stay apart at 16 px.
 * ========================================================================== */

namespace SE {
  /** A leg, tail or antler as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  SPECIES[Life.Grazer] = {
    stages: [
      // 1 · Urpferde — vor 55 Mio. J. (Eohippus/Sifrhippus (~56-55 Ma), fox-sized forest browser).
      //   A small fox-sized animal with an arched back, short neck and thin legs, nibbling leaves.
      //   Farben: brown with light dapples.
      {
        name: 'Urpferde', ma: 55, art: [
          line('furDark', 1.8, 'M7.5 18.5 C6 19.5 5 21 4.8 23'),
          line('furDark', 2, 'M11 21 L10 28'),
          line('furDark', 2, 'M19 21 L20.5 28'),
          { f: 'fur', d: 'M6.8 20 C6.6 16.4 9 14 12.2 14 C15.4 14 18 15.2 20.2 16.8 C21.6 18 21.6 20.8 19.6 22.2 C17.6 23 14 23 11 22.8 C8.4 22.6 6.9 21.6 6.8 20 Z' },
          { f: 'fur', d: 'M18.5 17 C20.5 16 22.5 16.5 24 18 L26.5 20.2 C26.6 21.3 25.8 22 24.8 21.8 L22.5 21.2 C21 20.5 19.5 20 18.5 19.5 Z' },
          { f: 'fur', d: 'M21.6 16.6 L21.8 14.4 L23.4 16.8 Z' },
          line('fur', 2.2, 'M9 21 L8.5 28'),
          line('fur', 2.2, 'M17.5 21.5 L17.5 28'),
          { f: 'furLight', d: artCircle(11, 17.2, 0.9) },
          { f: 'furLight', d: artCircle(14.2, 16.6, 0.9) },
          { f: 'furLight', d: artCircle(12.6, 19.6, 0.9) },
          { f: 'furLight', d: artCircle(16.2, 19, 0.9) },
          line('leaf', 1.8, 'M28.6 28.5 L28.2 20.5'),
          { f: 'leaf', d: 'M28.2 22.5 C26.6 21.8 26.2 20 27.4 18.6 C28.6 19.6 29 21 28.2 22.5 Z' },
          { f: 'leafLight', d: 'M28.6 25 C30.2 24.6 30.6 23 29.8 21.6 C28.6 22.4 28.2 23.6 28.6 25 Z' },
          { f: 'ink', d: artCircle(23.4, 18.6, 0.8) },
        ],
      },
      // 2 · Brontotherien — vor 40 Mio. J. (Brontotheriidae; family from ~50 Ma, large horned
      //   forms like Megacerops ~38-34 Ma). A heavy rhino-like body with a large forked, Y-shaped
      //   nose horn. Farben: grey-brown, darker horn.
      {
        name: 'Brontotherien', ma: 40, art: [
          line('black', 1.8, 'M4 16 C2.8 17 2.4 18.8 2.6 20.4'),
          line('black', 3.6, 'M8.6 21 L8.6 28'),
          line('black', 3.6, 'M20 21 L20.5 28'),
          { f: 'greyDark', d: 'M3.5 17.5 C3.5 13.5 7 11.6 11 11.4 C13.5 11.2 15 10 17.5 9.6 C20 9.4 22 10.6 22.8 12.8 C23.8 15.5 23.6 19 22 21.4 C19.5 23.4 15 23.8 10 23.6 C6 23.3 3.5 21 3.5 17.5 Z' },
          { f: 'greyDark', d: 'M20.5 12.6 C23 12.4 25.5 13.2 27.6 14.4 C29.2 15.3 30.2 16.6 30 18 C29.4 19.6 27.8 20.6 25.6 20.8 L21 20.8 Z' },
          { f: 'greyDark', d: 'M21 12.8 L20.8 10.2 L22.8 12.4 Z' },
          { f: 'grey', d: 'M5 15.5 C6 13 8.5 12 11.5 11.9 C14 11.8 15.5 10.6 17.6 10.3 C19.5 10.1 21 10.8 21.8 12.2 C19 11.6 16.5 12.6 14 13.4 C11 14.3 7.5 14.3 5 15.5 Z', o: 0.8 },
          line('greyDark', 3.8, 'M5.6 21 L5.6 28'),
          line('greyDark', 3.8, 'M17 21.5 L17 28'),
          line('bark', 2.8, 'M27.6 15 L27.6 11.6 L24.6 6.6'),
          line('bark', 2.8, 'M27.6 11.6 L29 7.2'),
          { f: 'ink', d: artCircle(23.8, 15.8, 0.9) },
        ],
      },
      // 3 · Riesennashörner — vor 34 Mio. J. (Paraceratherium (~34-23 Ma), largest known land
      //   mammal). A very tall hornless giant with long legs and a long neck reaching into trees,
      //   small head. Farben: dusty grey.
      {
        name: 'Riesennashörner', ma: 34, art: [
          line('bark', 2.6, 'M28.4 7 L28.4 28.5'),
          { f: 'leaf', d: 'M24 5 C23.8 2.8 25.4 1.6 27.3 1.6 C29.2 1.6 30.5 2.8 30.5 5 C30.5 7.2 29.2 8.6 27.3 8.6 C25.4 8.6 24.2 7.2 24 5 Z' },
          { f: 'forest', d: 'M27.3 1.6 C29.2 1.6 30.5 2.8 30.5 5 C30.5 7.2 29.2 8.6 27.3 8.6 Z', o: 0.55 },
          line('greyDark', 1.8, 'M3.4 12.5 C2.4 14 2.2 15.9 2.4 17.9'),
          line('greyDark', 3.8, 'M9 17.5 L9.5 28.5'),
          line('greyDark', 3.8, 'M19 17.5 L19.5 28.5'),
          { f: 'grey', d: 'M3 14 C3 10.7 6 9.1 10.5 8.9 C14.5 8.7 18 8.9 20.5 10.1 C22.3 11.7 22.3 15.5 20.7 18.1 C18.3 20.3 13 20.7 9 20.3 C5.2 19.9 3 17.5 3 14 Z' },
          { f: 'grey', d: 'M15.5 11 C17.5 9.4 19 8 20 6.6 L23.6 8.6 C22.6 10.6 21.8 12.8 21.2 15.6 Z' },
          { f: 'grey', d: 'M18.4 7.2 C18.8 5.4 20.8 4.4 22.8 4.8 C24.6 5.1 26 6 27 7.4 C27.6 8.4 27.2 9.6 26 9.8 C25 10 24.2 9.6 23.6 9.4 C21.2 10.1 18.8 9.3 18.4 7.2 Z' },
          { f: 'grey', d: 'M19.4 5.6 L18.8 3.8 L20.8 4.8 Z' },
          line('grey', 3.8, 'M6 17.5 L5.5 28.5'),
          line('grey', 3.8, 'M16 18.5 L16 28.5'),
          { f: 'greyDark', d: 'M4 17.5 C8 20.1 17 20.5 21.8 16.4 C21.3 18.3 19.6 19.7 16.5 20.3 C12.5 20.8 7.5 20.5 4 17.5 Z', o: 0.6 },
          { f: 'ink', d: artCircle(21.4, 6.6, 0.8) },
        ],
      },
      // 4 · Hirsche — vor 20 Mio. J. (Cervidae, first antlered deer Procervulus (~20-19 Ma)). A
      //   slender deer with a branching antler pair and short tail, alert pose. Farben: warm
      //   brown, white rump.
      {
        name: 'Hirsche', ma: 20, art: [
          line('bark', 2.2, 'M10.5 19.5 L9.2 23.8 L10 28.5'),
          line('bark', 2.2, 'M19.5 20 L20.5 28.5'),
          { f: 'chitin', d: 'M6 17 C6 14.5 8.5 13.3 12 13.3 L17 13.3 C19.5 13.2 21.5 14 22 16 C22.3 18.5 20.5 20.5 17.5 20.8 L10.5 20.8 C7.5 20.6 6 19 6 17 Z' },
          { f: 'white', d: 'M6.2 15.8 C6.6 14.4 7.6 13.8 8.8 13.6 C8.8 15.6 8.2 17.6 7 19 C6.4 18 6.2 16.8 6.2 15.8 Z' },
          { f: 'chitin', d: 'M18 15 C19 12.5 20.5 10.5 22 9 L25 10.5 C23.5 12.5 22.5 15 22 17 Z' },
          { f: 'chitin', d: 'M21.5 9.5 C22.5 8 24.5 7.6 26 8.3 L28.8 10.5 C29 11.4 28.4 12.1 27.4 12.1 L25.5 11.8 C24 12 22.3 11.2 21.5 9.5 Z' },
          { f: 'chitin', d: 'M22.4 9.2 L19.6 8 L21.6 10.8 Z' },
          line('chitin', 2.2, 'M9 19.5 L7.2 23.8 L8 28.5'),
          line('chitin', 2.2, 'M17.5 20 L17.5 28.5'),
          line('bone', 1.8, 'M23.6 8.4 C22.8 6 21.4 4 19.4 2.6'),
          line('bone', 1.8, 'M22.8 6.2 L25.6 4.2'),
          line('bone', 1.8, 'M21.4 4.4 L22.8 2.6'),
          { f: 'ink', d: artCircle(24.6, 9.6, 0.8) },
        ],
      },
      // 5 · Antilopen — vor 18 Mio. J. (Bovidae, Eotragus (~18 Ma)). A slim long-legged antelope
      //   with ringed lyre-shaped horns, mid-leap. Farben: tawny gold, white belly, black side
      //   stripe.
      {
        name: 'Antilopen', ma: 18, art: [
          line('fur', 2, 'M12.5 19.5 L10 23.5 L7.8 28'),
          line('fur', 2, 'M20.5 16.5 L23.8 19.2 L22 22.8'),
          line('black', 1.8, 'M7.8 17 L5.5 15.8'),
          { f: 'tan', d: 'M7.5 19 C7 16.5 9 14.5 12 14 L19 11.5 C21.5 10.8 23.5 11.8 23.8 14 C24 16 22.5 17.5 20 18.3 L13 20.8 C10.5 21.6 8 21 7.5 19 Z' },
          { f: 'white', d: 'M10 20.8 C13 20.6 18 18.8 22.5 17 C21.5 17.8 20.5 18.2 20 18.3 L13 20.8 C12 21.2 11 21.2 10 20.8 Z' },
          line('black', 1.8, 'M10.5 18.4 L21.5 14.8'),
          { f: 'tan', d: 'M19.5 13.5 C20.5 11 22 8.5 23.5 7 L26.5 8.5 C25 10.5 24 12.5 23.5 15 Z' },
          { f: 'tan', d: 'M23 7.5 C24 6 26 5.7 27.3 6.5 L29.8 8.8 C30 9.7 29.3 10.3 28.4 10.2 L26.6 9.8 C25 10 23.6 9.2 23 7.5 Z' },
          { f: 'tan', d: 'M24 7 L21.5 6 L23.2 8.6 Z' },
          line('black', 1.8, 'M24.2 6.6 C22.6 5.2 22.6 3.8 23.8 2.6'),
          line('black', 1.8, 'M25.4 6.2 C25 4.7 25.8 3.4 27.2 2.6'),
          line('tan', 2.2, 'M10.5 19.5 L7 23 L3.5 27.8'),
          line('tan', 2.2, 'M19 17.5 L22.5 20.5 L20.5 24.2'),
          { f: 'ink', d: artCircle(26.2, 7.7, 0.8) },
        ],
      },
      // 6 · Pferde — vor 16 Mio. J. (Merychippus (~17-16 Ma), first high-crowned grazing horse;
      //   one-toed Pliohippus ~12 Ma, Equus ~4 Ma). A horse with long head, mane, long legs and
      //   tail, head raised and one foreleg lifted (head down read as an elephant at 16 px).
      //   Farben: chestnut brown, dark mane.
      {
        name: 'Pferde', ma: 16, art: [
          { f: 'black', d: 'M5.2 13 C3 13.6 1.9 15.6 1.8 18.6 C1.7 21.2 2.1 23.2 2.9 24.8 C3.7 22.2 4.7 19.6 5.9 17.6 Z' },
          line('furDark', 2.4, 'M9 19 L7.4 23.6 L8.4 28.5'),
          line('furDark', 2.4, 'M18.8 19 L19.6 28.5'),
          { f: 'fur', d: 'M4 15.5 C4 13 6.5 11.6 10 11.6 L16 11.6 C18.5 11.6 20.5 12.6 21 14.6 C21.2 17.2 19.5 19.4 16.5 19.7 L9 19.7 C6 19.6 4 18 4 15.5 Z' },
          { f: 'fur', d: 'M15.5 13 C17 9.4 19.4 6.4 22 4.8 L25.4 7 C23.6 9.2 22.4 12 21.4 15.6 Z' },
          { f: 'fur', d: 'M21.4 5.4 C22.4 3.8 24.4 3.6 25.6 4.6 L29.6 9.4 C30.2 10.4 29.8 11.6 28.6 11.8 C27.6 12 26.8 11.4 26.2 10.8 L22.6 8.4 C21.4 7.6 21 6.6 21.4 5.4 Z' },
          { f: 'fur', d: 'M22.6 4.4 L22.8 1.8 L24.4 4 Z' },
          { f: 'black', d: 'M22.4 4 C19.4 5.2 16.6 8.2 14.8 12.4 L17 13 C18.4 9.8 20.4 7.4 23 6.2 Z' },
          line('fur', 2.6, 'M6.8 19 L5.2 23.6 L6.2 28.5'),
          line('fur', 2.6, 'M16.4 19.2 L19 23 L17.4 26'),
          { f: 'ink', d: artCircle(24.6, 6.6, 0.8) },
        ],
      },
      // 7 · Giraffen — vor 8 Mio. J. (Giraffa (~8-7 Ma; long-necked Bohlinia ~9 Ma)). Very long
      //   neck and front legs, sloping back, two ossicones. Farben: cream with brown patch pattern.
      {
        name: 'Giraffen', ma: 8, art: [
          line('tan', 1.6, 'M7 16 C6 18 5.6 20 5.6 22'),
          { f: 'furDark', d: artCircle(5.6, 22.6, 1.1) },
          line('tan', 2.2, 'M10 19 L9 23.5 L10 28.5'),
          line('tan', 2.2, 'M18.5 18.5 L19.5 28.5'),
          { f: 'sand', d: 'M6.5 17 C6.5 15 8 14 10.5 13.6 L17 11.5 C19.5 10.8 21 12 21.2 14.5 C21.3 17 20 19 17 19.6 L10.5 19.8 C8 19.8 6.5 18.8 6.5 17 Z' },
          { f: 'sand', d: 'M16.2 12.6 C17.6 10 19.4 7.6 21 5.6 L24 6.8 C22.6 9.4 21.6 12 20.8 15.4 Z' },
          { f: 'sand', d: 'M20.6 6 C21.2 4.6 23 4.1 24.5 4.6 L29.5 6.8 C30 7.8 29.4 8.8 28.3 8.8 L25 8.6 C23 8.8 21.1 7.9 20.6 6 Z' },
          { f: 'sand', d: 'M22 6.2 L19.4 5.6 L21 7.6 Z' },
          line('bark', 1.8, 'M22.2 4.6 L21.9 2.6'),
          line('bark', 1.8, 'M24 4.4 L24.2 2.6'),
          line('sand', 2.4, 'M8 19 L7 23.5 L8 28.5'),
          line('sand', 2.4, 'M16.5 18.5 L16.5 28.5'),
          { f: 'fur', d: artEllipse(10.4, 16.2, 1.6, 1.3) },
          { f: 'fur', d: artEllipse(14.2, 14.6, 1.6, 1.4) },
          { f: 'fur', d: artEllipse(13.4, 17.8, 1.5, 1.1) },
          { f: 'fur', d: artEllipse(17.6, 13.8, 1.3, 1.2) },
          { f: 'fur', d: artEllipse(17.4, 17.2, 1.4, 1.2) },
          { f: 'fur', d: artEllipse(19.6, 10.2, 1, 1.2) },
          { f: 'fur', d: artEllipse(21.4, 7.6, 0.9, 1) },
          { f: 'fur', d: artEllipse(19.4, 14.2, 0.9, 1.2) },
          { f: 'ink', d: artCircle(24.6, 6, 0.8) },
        ],
      },
      // 8 · Bisons — vor 2 Mio. J. (Bison (~2.5-2 Ma, Asia)). A massive shaggy bovine with a high
      //   shoulder hump, low head with short curved horns and slim hindquarters. Farben: dark brown,
      //   lighter shaggy front.
      {
        name: 'Bisons', ma: 2, art: [
          line('furDark', 1.6, 'M5 15 C3.8 16.5 3.5 18.5 3.8 21'),
          line('black', 3, 'M9.5 20.5 L10 28.5'),
          line('black', 3, 'M21 22 L21.5 28.5'),
          { f: 'furDark', d: 'M4.5 17.5 C4.5 14.5 7 13.2 11 13 L16 13 L16 22.5 L9 22 C6 21.6 4.5 20 4.5 17.5 Z' },
          { f: 'fur', d: 'M13 13.5 C14 9.5 17.5 6.5 21.5 7 C25 7.4 27 10 27.5 13.5 L27.5 19 C27 22 25 23.5 22 23.6 L17 23.8 C14.5 23.5 13 21.5 13 19 Z' },
          { f: 'bark', d: 'M23.6 15 C25.6 14 28.4 14.5 29.8 16.5 C30.3 18.5 30 21 29 22.5 L27.5 25.5 L26 22.8 C24.5 22.2 23.4 20 23.4 18 Z' },
          line('bone', 2, 'M25.2 15.2 C24.6 13.5 25.4 12.2 27 11.8'),
          line('furDark', 2.8, 'M7 20 L6.5 28.5'),
          line('fur', 3.2, 'M17 22 L17 28.5'),
          { f: 'ink', d: artCircle(27.2, 17.6, 0.9) },
        ],
      },
    ],
    specialists: [
      // Kamele — Wüste, ab Unterart 7 (Camelini (Paracamelus ~8-7 Ma, Camelus); camelids from ~45
      //   Ma, but early forms small, humpless forest animals). A dromedary with a single hump, long
      //   curved neck and long legs, walking. Farben: sandy tan.
      {
        name: 'Kamele', biome: Biome.Desert, minStage: 6, art: [
          line('fur', 1.8, 'M5.2 14 C4 15.5 3.6 17.5 3.8 19.5'),
          line('fur', 2.2, 'M10.5 18.5 L11.5 23 L11 28.5'),
          line('fur', 2.2, 'M18 19 L16.5 28.5'),
          { f: 'tan', d: 'M5 15.5 C5 13.5 6.5 12.5 8 12 C9 8.5 11 6 13 6 C15 6 16.5 8.5 17.5 11.5 C20 11.5 22 13 22 15.5 C22 18 20 19.5 17 19.6 L10 19.6 C7 19.5 5 18 5 15.5 Z' },
          { f: 'tan', d: 'M19.5 13 C22 13.5 23.5 15.5 24.5 15 C25.5 14.5 25.5 12 25.8 10 L28.5 10.5 C28.6 13.5 28 16.5 26 18 C24 19.2 21.5 18.5 20 17.5 Z' },
          { f: 'tan', d: 'M25 9.5 C25.5 8 27.5 7.5 28.8 8.2 C29.8 8.8 30.3 10 30 11 C29.5 11.8 28.5 12 27.5 11.8 L25.8 11.3 Z' },
          { f: 'sand', d: 'M8.6 11.6 C9.6 8.6 11.2 6.8 13 6.8 C14.4 6.8 15.6 8.4 16.4 10.6 C14 9.4 11 9.8 8.6 11.6 Z' },
          line('tan', 2.2, 'M7.5 18.5 L6.5 23.5 L5.5 28.5'),
          line('tan', 2.2, 'M19.5 19 L21 28.5'),
          { f: 'ink', d: artCircle(27.6, 9.4, 0.8) },
        ],
      },
      // Rentiere — Tundra, ab Unterart 8 (Rangifer tarandus (~2 Ma)). A sturdy deer with huge
      //   sweeping antlers and a white neck mane. Farben: grey-brown, white mane.
      {
        name: 'Rentiere', biome: Biome.Tundra, minStage: 7, art: [
          line('greyDark', 2.6, 'M10 20 L10.5 28.5'),
          line('greyDark', 2.6, 'M20 20.5 L20.5 28.5'),
          { f: 'grey', d: 'M4.5 17.5 C4.5 15 7 13.6 10.5 13.6 L17 13.6 C19.5 13.6 21.5 14.8 22 17 C22.2 19.5 20.5 21.6 17.5 21.8 L9.5 21.8 C6.5 21.6 4.5 20 4.5 17.5 Z' },
          { f: 'grey', d: 'M18 15.5 C19.5 13.5 21 12 22.5 11 L24.8 12.8 C23.8 14.8 22.8 17 22 19 Z' },
          { f: 'white', d: 'M18.5 17 C20 16 21.5 15 22.5 13.5 L24 14.5 C23.5 17 22 19.5 19.5 20.5 Z' },
          { f: 'grey', d: 'M21 11.5 C22 10 24 9.6 25.5 10.3 L28.8 12.4 C29.2 13.3 28.6 14.2 27.6 14.1 L25.5 13.8 C23.5 14.2 21.6 13.2 21 11.5 Z' },
          line('bone', 2, 'M22.6 10.4 C19.5 8.5 17.5 5.2 18.5 2.8 L21.5 2.6'),
          line('bone', 2, 'M23.4 10 C22.5 7.5 23 5 25 3.5'),
          line('bone', 2, 'M23.2 9.8 L26.6 8'),
          line('bone', 2, 'M19 6.2 L16 6'),
          line('grey', 2.8, 'M7.5 20 L7 28.5'),
          line('grey', 2.8, 'M17.5 20.5 L17.5 28.5'),
          { f: 'ink', d: artCircle(25, 11.6, 0.8) },
        ],
      },
      // Elche — Nadelwald, ab Unterart 8 (Alces (~2-1 Ma; Cervalces ~2.5 Ma)). A tall long-legged
      //   deer with a heavy drooping snout, shoulder hump and wide shovel antlers. Farben: dark
      //   brown-black, pale legs.
      {
        name: 'Elche', biome: Biome.Boreal, minStage: 7, art: [
          line('greyDark', 2.4, 'M10 18 L9 23 L10 28.5'),
          line('greyDark', 2.4, 'M19.5 18 L20.5 28.5'),
          { f: 'furDark', d: 'M4 14.5 C4 12 6.5 11 10 11 L15 10.5 C16 8.5 18 8 19.5 9 C21.5 10 22.5 12 22.5 14.5 C22.5 17.5 20.5 19.5 17.5 19.6 L9.5 19.6 C6 19.5 4 17.5 4 14.5 Z' },
          { f: 'furDark', d: 'M20 11 C22 11 23.5 12 24.5 13 L29.5 16.5 C30.2 17.8 29.8 19.4 28.4 19.8 L25.5 19.4 L24 22.6 L22.6 19 C21 17.5 20 15 20 11 Z' },
          { f: 'bone', d: 'M23.2 12.2 C19.8 12 16.6 10.4 15.6 7.4 L17.4 7.8 L17.4 5.2 L19.4 7 L20.6 4.2 L22.2 6.6 L23.8 4 L25 6.6 L26.8 4.6 L27.2 7.2 L29.4 6.4 C28.8 9.4 26.4 11.6 23.2 12.2 Z' },
          line('grey', 2.6, 'M7.5 18 L6.5 23 L7.5 28.5'),
          line('grey', 2.6, 'M17 18.5 L17 28.5'),
          { f: 'ink', d: artCircle(25.6, 14.6, 0.8) },
        ],
      },
      // Flusspferde — Sumpf, ab Unterart 7 (Hippopotamidae (from ~20 Ma; modern hippos since the
      //   Late Miocene, Hippopotamus ~2.5 Ma)). A barrel-shaped animal half-submerged, only eyes,
      //   ears, nostrils and back showing. Farben: grey-purple, pink edges.
      {
        name: 'Flusspferde', biome: Biome.Swamp, minStage: 6, art: [
          { f: 'grey', d: 'M2.5 22.5 C2.6 17.4 6.6 14.2 12 14 C15.2 13.9 17.4 14.5 18.8 15.2 C19.6 13.2 21.2 12.2 23.2 12.4 C25 12.6 26 13.4 27.6 13.6 C29.4 13.9 30.4 15.4 30.4 17.4 L30.4 22.5 Z' },
          { f: 'grey', d: artEllipse(19.2, 12.4, 1.3, 1.8) },
          { f: 'grey', d: artCircle(22.9, 12.6, 2.1) },
          { f: 'grey', d: artCircle(28.4, 13.6, 1.7) },
          { f: 'greyDark', d: 'M2.5 22.5 C4 19 11 18.4 18.5 19.4 C20.6 19.8 21.6 21.2 21.6 22.5 Z', o: 0.55 },
          { f: 'pink', d: 'M21 22.5 C23 20.4 27.4 19.8 30.4 20.2 L30.4 22.5 Z' },
          { f: 'sky', d: 'M1.5 22 L30.5 22 L30.5 27 C28 28.2 26 26.6 23.5 27.4 C21 28.2 18 26.8 15.5 27.6 C13 28.4 10 26.8 7.5 27.6 C5 28.4 3 27.4 1.5 27.8 Z' },
          line('white', 1.6, 'M4 24.6 L9 24.6'),
          line('white', 1.6, 'M19 25 L25 25'),
          { f: 'ink', d: artCircle(23.2, 12.4, 0.8) },
        ],
      },
    ],
  };
}
