/* =============================================================================
 * SimEarth 2.0 — species art: Säugetiere (mammals)
 * -----------------------------------------------------------------------------
 * Reference set for the animal icons (see docs/oekosystem-2026-10/grafikstil.md):
 * side views facing right, feet on y ≈ 28, far limbs a shade darker than the
 * near ones, one flat colour per body part, the outline left to the renderer.
 * ========================================================================== */

namespace SE {
  /** A limb or tail as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  SPECIES[Life.Mammal] = {
    stages: [
      // 1 · Ursäuger — vor 200 Mio. J. (Morganucodon (~205-195 Ma), early mammaliaform). A tiny
      //   shrew-like animal with pointed snout, whiskers and a long thin tail, low crawling pose.
      //   Farben: grey-brown fur, pink snout.
      {
        name: 'Ursäuger', ma: 200, art: [
          line('greyDark', 1.8, 'M11 22.5 C7.5 23.5 5 24.5 2.5 23.5'),
          line('greyDark', 2, 'M15 23 L16 26.8'),
          line('greyDark', 2, 'M22.5 22.5 L23.5 26.8'),
          { f: 'grey', d: 'M10.5 21.5 C10.5 18 14 16.5 18 16.8 C21 17 23 18 25 19.5 C26.5 20.3 28 20.8 29 21.4 C28.4 22.3 26.5 22.8 24.5 23 C21.5 25 14.5 25.3 12 24.3 C10.9 23.8 10.5 22.8 10.5 21.5 Z' },
          line('grey', 2.2, 'M12.8 23.5 L12.2 27'),
          line('grey', 2.2, 'M20.5 23.5 L20 27'),
          { f: 'grey', d: artCircle(21.3, 17.4, 1.7) },
          { f: 'pink', d: artCircle(28.6, 21.4, 1) },
          { f: 'ink', d: artCircle(24.3, 19.6, 0.9) },
        ],
      },
      // 2 · Gleitsäuger — vor 160 Mio. J. (Volaticotherium, Maiopatagium (~165-160 Ma, China)). A
      //   small mammal gliding with a skin membrane stretched between front and hind legs, tail
      //   behind. Farben: brown fur, lighter membrane.
      {
        name: 'Gleitsäuger', ma: 160, art: [
          line('furDark', 2, 'M9 16 C6 16.5 4 17.8 2.5 20'),
          { f: 'furLight', d: 'M7.5 15.5 L11.5 7 C15 9.8 19.5 9.8 23 7 L26 15 L23 24 C19.5 21.2 15 21.2 11.5 24 Z' },
          { f: 'fur', d: artEllipse(16.5, 15.5, 7.5, 3.4) },
          { f: 'furDark', d: artCircle(11.5, 7.6, 1.2) },
          { f: 'furDark', d: artCircle(23, 7.6, 1.2) },
          { f: 'furDark', d: artCircle(11.5, 23.4, 1.2) },
          { f: 'furDark', d: artCircle(23, 23.4, 1.2) },
          { f: 'fur', d: 'M22.5 13 C25 12.4 28 13.6 29.5 15.5 C28 17.2 25 18.3 22.5 17.8 Z' },
          { f: 'fur', d: artCircle(24.2, 12.8, 1.4) },
          { f: 'ink', d: artCircle(26.6, 14.7, 0.8) },
        ],
      },
      // 3 · Kloakentiere — vor 123 Mio. J. (Monotremata, Teinolophos (~123 Ma), Steropodon (~110
      //   Ma), Australia). A platypus: flat duck-like bill, flat body, webbed feet and flat paddle
      //   tail. Farben: dark brown, grey bill.
      {
        name: 'Kloakentiere', ma: 123, art: [
          { f: 'furDark', d: 'M2.5 21 C2.5 19 6 18.3 10.5 19.2 L10.5 23.2 C6 24.2 2.5 23.2 2.5 21 Z' },
          { f: 'greyDark', d: 'M13.5 23.5 L16.5 23.5 L17.5 27.5 L12.5 27.5 Z' },
          { f: 'furDark', d: 'M8 21 C8 17.5 13 16 18 16.2 C21.5 16.4 24 17.5 25 19.5 C25.4 21.5 24.5 23.5 22 24.2 C17 25.3 12 25 9.5 23.8 C8.5 23.2 8 22.2 8 21 Z' },
          { f: 'fur', d: 'M10 18.6 C13 17 18 16.6 22 17.4 C18 17.8 13.5 18.4 10 20 Z', o: 0.8 },
          { f: 'grey', d: 'M23.8 18.4 C26 18 28.6 18.4 30 19.6 C30.2 20.6 29.4 21.5 28 21.6 C26.5 21.7 25 21.5 23.8 21.2 Z' },
          { f: 'greyDark', d: 'M20 23.3 L23 23.3 L24.5 27.5 L19 27.5 Z' },
          { f: 'ink', d: artCircle(23, 18.8, 0.8) },
        ],
      },
      // 4 · Beuteltiere — vor 110 Mio. J. (Metatheria, earliest secure ~110-100 Ma (Holoclemensia,
      //   Kokopellia); Sinodelphys now regarded as eutherian). An opossum-like animal hanging by its
      //   prehensile tail from a branch, pointed face. Farben: grey-white fur, pink tail and nose.
      {
        name: 'Beuteltiere', ma: 110, art: [
          line('bark', 2.6, 'M2.5 6.5 L29.5 6.5'),
          line('bark', 2, 'M24 6.5 L26.8 3.5'),
          line('pink', 1.8, 'M14.5 11.5 C13.2 9 13.8 5 16.2 4.8 C18.6 4.6 18.8 7.8 17.2 8.6'),
          line('greyDark', 2, 'M11.5 15.5 L8.5 19.5'),
          line('greyDark', 2, 'M18 15.5 L21.5 18.5'),
          { f: 'grey', d: artEllipse(14.8, 17.3, 4.6, 7) },
          { f: 'white', d: 'M11.2 21.5 C12.5 24.5 15 27.5 19.5 29.5 C19.2 26.8 18 23.5 16.5 21.5 C15 20.6 12.6 20.6 11.2 21.5 Z' },
          { f: 'pink', d: artCircle(19.2, 29, 0.9) },
          { f: 'ink', d: artCircle(13.2, 22.6, 1.3) },
          { f: 'ink', d: artCircle(16.3, 24.3, 0.7) },
        ],
      },
      // 5 · Nagetiere — vor 57 Mio. J. (Rodentia, late Paleocene ~57 Ma (Acritoparamys, Paramys)).
      //   A squirrel-like rodent sitting upright with a bushy tail curved up its back and prominent
      //   front teeth, holding a nut. Farben: russet brown, cream belly.
      {
        name: 'Nagetiere', ma: 57, art: [
          { f: 'orange', d: 'M13.5 27 C7.5 27.5 4.5 23 5 17.5 C5.5 12.5 3.5 9.5 6 6.2 C8.5 3.5 13 4.5 13.8 8 C11.2 8 9.8 10.2 10.6 13.6 C11.6 17.4 13 21 14.8 24 Z' },
          { f: 'rust', d: 'M12.5 27.8 C11 23 12 17 15.5 14.5 C18 13 21 14.5 21.5 18 C22 22 21.5 26 20.5 27.8 Z' },
          { f: 'cream', d: 'M16.5 26.8 C15.5 23 16 19.5 18.5 17.8 C20 18.8 20.5 22.5 19.6 26.8 Z' },
          { f: 'rust', d: 'M14 26.2 L21 26.2 L22.5 28.8 L13.5 28.8 Z' },
          { f: 'rust', d: 'M18.2 9.6 L18.8 5.6 L21.2 9 Z' },
          { f: 'rust', d: 'M16.8 12 C16.8 9.5 19 8.4 21 8.6 C23 8.8 24.5 10 26 11.6 C26 12.8 24.8 14 23 14.4 C21 15 18 14.6 16.8 12 Z' },
          { f: 'bark', d: artCircle(23.2, 17.6, 1.7) },
          line('rust', 1.8, 'M19.2 16.4 L22 17.2'),
          { f: 'ink', d: artCircle(21.8, 11.1, 0.9) },
        ],
      },
      // 6 · Primaten — vor 56 Mio. J. (Euprimates, Teilhardina (~56 Ma, Paleocene-Eocene
      //   boundary)). A small primate with huge eyes, grasping hands on a branch and a long ringed
      //   tail. Farben: grey-brown, ringed tail, orange eyes.
      {
        name: 'Primaten', ma: 56, art: [
          line('bark', 2.4, 'M2.5 20 L29.5 18'),
          line('white', 2.4, 'M10.5 20.5 L10 22.6'),
          line('black', 2.4, 'M10 22.6 L9.5 24.7'),
          line('white', 2.4, 'M9.5 24.7 L9 26.8'),
          line('black', 2.4, 'M9 26.8 L8.5 29'),
          { f: 'grey', d: 'M8.8 19.6 C8.3 15.5 10.5 11.6 14.5 11.1 C18 10.7 20 13 20 16 C20 18 19 19.6 17.5 19.6 Z' },
          line('greyDark', 2.2, 'M11.5 18 L13.5 19.6'),
          line('grey', 2.2, 'M17.6 14.8 L19.6 18.6'),
          { f: 'grey', d: 'M18.5 8.4 L18.8 5.5 L20.9 7.6 Z' },
          { f: 'grey', d: artCircle(21.4, 10.6, 3.6) },
          { f: 'greyDark', d: 'M23.6 10.2 L27.6 11.8 L23.6 13.6 Z' },
          { f: 'orange', d: artCircle(22.6, 9.6, 1.5) },
          { f: 'ink', d: artCircle(23, 9.6, 0.7) },
        ],
      },
      // 7 · Menschenaffen — vor 25 Mio. J. (Hominoidea, Rukwapithecus (~25 Ma, Tanzania);
      //   Proconsul ~20 Ma). A tailless ape walking on its knuckles with long arms, short legs and a
      //   hunched back. Farben: dark brown-black fur, grey face.
      {
        name: 'Menschenaffen', ma: 25, art: [
          line('black', 3, 'M23 17 L25 27.5'),
          line('black', 3, 'M11 20.5 L12 27.5'),
          { f: 'furDark', d: 'M5.5 20.5 C4.5 15 8.5 9.5 14.5 9 C19 8.6 22.5 10.5 24 13.5 C24.8 15.5 24 18 22 19 C18 21 11 22.5 8 22.5 C6.8 22.4 6 21.6 5.5 20.5 Z' },
          line('furDark', 3.2, 'M20.5 15.5 L21.5 27.5'),
          line('furDark', 3.2, 'M8.5 20 L7.5 27.5'),
          { f: 'furDark', d: artEllipse(25, 15.2, 3.4, 3.6) },
          { f: 'grey', d: 'M25.4 13.4 C27.4 13.6 28.8 15.1 28.8 16.8 C28.4 18.5 26.8 19.2 25.4 18.9 C24.6 17.3 24.6 15.2 25.4 13.4 Z' },
          { f: 'ink', d: artCircle(26.4, 15.2, 0.8) },
        ],
      },
      // 8 · Hominiden — vor 6 Mio. J. (Human lineage (Hominini): Sahelanthropus ~7 Ma, Orrorin ~6
      //   Ma; upright walking certain by ~4.2 Ma (Australopithecus); Homo sapiens ~0.3 Ma). An
      //   upright two-legged figure walking right, arms at the sides, holding a stick or stone.
      //   Farben: warm brown skin, darker hair.
      {
        name: 'Hominiden', ma: 6, art: [
          line('bark', 1.8, 'M23 13 L26 29'),
          line('fur', 2.8, 'M15.2 19.5 L12.2 28.5'),
          line('fur', 2.4, 'M14.8 11.8 L12.2 18.5'),
          { f: 'tan', d: 'M13.4 10.6 C14.4 9.4 17.2 9.4 18.2 10.6 L18.6 19.6 C17 20.6 14.5 20.6 13.4 19.6 Z' },
          line('tan', 3, 'M16.6 19.5 L19.8 28.5'),
          line('tan', 2.4, 'M17.2 11.8 L23.2 15'),
          { f: 'tan', d: artCircle(16.6, 6.4, 3.1) },
          { f: 'furDark', d: 'M13.5 6.2 C13.6 3.6 15.6 2.6 17.6 2.9 C19.2 3.2 19.9 4.3 19.8 5.2 C17.6 4.6 15.5 5 13.5 6.2 Z' },
          { f: 'ink', d: artCircle(18.5, 6.3, 0.7) },
        ],
      },
    ],
    specialists: [
      // Eisbären — Eis, ab Unterart 8 (Ursus maritimus (~0.5 Ma); bears (Ursidae) from ~20 Ma). A
      //   large white bear walking on all fours with a long neck and small head. Farben: creamy
      //   white, black nose.
      {
        name: 'Eisbären', biome: Biome.Arctic, minStage: 7, art: [
          line('grey', 3.6, 'M11 21 L11 27.5'),
          line('grey', 3.6, 'M21.5 21 L21.5 27.5'),
          { f: 'white', d: 'M4.5 18.5 C4.5 13.5 9.5 11 15 11.2 C19 11.4 22 12.5 24 14.5 C25 15.6 25.5 17.5 25 19.5 C24 22 20 23.5 15 23.5 C10 23.5 6.5 22.8 5.3 21.3 C4.8 20.6 4.5 19.6 4.5 18.5 Z' },
          { f: 'cream', d: 'M6.5 21.5 C10 23 19 23.6 24.2 20.8 C23 22.5 19.5 23.5 15 23.5 C10.5 23.5 7.5 22.8 6.5 21.5 Z' },
          { f: 'white', d: 'M22 14 C24.5 14.2 27 15.5 28.5 17.3 C29.5 18.3 30 19.2 29.6 19.9 C28.6 20.5 26.5 20.3 25 20 C23.5 19.6 22.5 18.5 22 17 Z' },
          { f: 'white', d: artCircle(24.6, 14.3, 1.3) },
          line('white', 3.8, 'M8 21 L7.5 27.5'),
          line('white', 3.8, 'M18.5 21.5 L18.5 27.5'),
          { f: 'ink', d: artCircle(29.3, 19.3, 0.9) },
          { f: 'ink', d: artCircle(26.2, 16.6, 0.7) },
        ],
      },
      // Robben — Eis, ab Unterart 7 (Pinnipedia (Carnivora); Enaliarctos ~25 Ma, Puijila ~24-21 Ma
      //   (Arctic Canada)). A seal hauled out on an ice floe: spindle body, flippers, head raised.
      //   Farben: grey with dark spots, white ice.
      {
        name: 'Robben', biome: Biome.Arctic, minStage: 6, art: [
          { f: 'white', d: 'M2 24 L6 21.5 L26 21 L30 23.5 L28 27.5 L4.5 28 Z' },
          { f: 'cyan', d: 'M2 24 L4.5 28 L28 27.5 L30 23.5 L28.5 25.6 L5 25.8 Z' },
          { f: 'greyDark', d: 'M6 20.5 L2.8 18.2 L3.2 21.8 Z' },
          { f: 'grey', d: 'M5 20.5 C7 18.5 11 17.5 16 17.5 C19.5 17.5 22 17 23.5 14.5 C24.5 12.8 26.5 12 28 13 C29 13.8 28.8 15.2 27.5 15.8 L25.8 16.6 C25 19.5 22 21.5 17 22 L7 22 C5.5 22 4.5 21.3 5 20.5 Z' },
          { f: 'greyDark', d: 'M17 21 L20.5 21.3 L18.6 23.4 Z' },
          { f: 'greyDark', d: artCircle(11, 19.6, 0.9), o: 0.7 },
          { f: 'greyDark', d: artCircle(14.6, 18.8, 0.7), o: 0.7 },
          { f: 'greyDark', d: artCircle(18.6, 19.4, 0.8), o: 0.7 },
          { f: 'ink', d: artCircle(26.4, 14.3, 0.8) },
        ],
      },
      // Fenneks — Wüste, ab Unterart 8 (Vulpes zerda (Canidae)). A tiny sitting fox with enormous
      //   ears and a bushy tail. Farben: pale cream-sand fur, dark tail tip.
      {
        name: 'Fenneks', biome: Biome.Desert, minStage: 7, art: [
          { f: 'sand', d: 'M12.5 26.8 C8 27.6 4.5 25.8 3.5 22.4 C5.5 23.6 8.5 23.6 11.5 22.4 Z' },
          { f: 'furDark', d: 'M3.5 22.4 C3.9 24.2 5.2 25.4 6.8 26 C5.2 26.4 3.8 24.8 3.5 22.4 Z' },
          { f: 'sand', d: 'M11 27.8 C10 23 11.5 18 15.5 16.5 C18 16 19.5 17.5 19.5 20 C19.5 23.5 19 26 18 27.8 Z' },
          { f: 'cream', d: 'M15.6 26.8 C15 23 16 19.6 18 18.6 C19 19.6 19 23.6 18.3 26.8 Z' },
          line('sand', 2, 'M17.6 21 L17.8 27.6'),
          { f: 'sand', d: 'M16.6 13 L13.6 3.6 L19.6 11.4 Z' },
          { f: 'sand', d: 'M19.2 12 L21.2 2.8 L22.6 12.4 Z' },
          { f: 'pink', d: 'M16.9 11.6 L15.2 6.2 L18.6 10.8 Z' },
          { f: 'sand', d: 'M16 13.5 C17 11.5 20 11 21.5 12.5 L26 15 C25.5 16 24 16.5 22.5 16.5 C20 17.5 17 16.5 16 13.5 Z' },
          { f: 'ink', d: artCircle(21.2, 13.7, 0.7) },
          { f: 'ink', d: artCircle(25.6, 15.1, 0.7) },
        ],
      },
      // Kängurus — Offenland, ab Unterart 8 (Macropodidae (~20-15 Ma; kangaroo-like Balbaridae ~25
      //   Ma)). An upright hopping kangaroo with big hind legs and a thick tail. Farben: red-brown
      //   fur, lighter belly.
      {
        name: 'Kängurus', biome: Biome.Grass, minStage: 7, art: [
          { f: 'rust', d: 'M11 22 C8 24 5 26.5 2.5 28.4 L4.5 29.4 C7.5 28 11 26 13.5 24.5 Z' },
          { f: 'rust', d: 'M11 19 C10.5 14 13 9.5 17 8.5 C19.5 8 21 9.5 20.8 11.5 C20.5 14.5 18.5 18 16.5 21 Z' },
          { f: 'tan', d: 'M16.5 20 C17.5 17 19 14 20.2 11.6 C20.6 14.2 19.5 17.2 17.6 20.4 Z' },
          { f: 'rust', d: 'M10.5 20 C10.5 16.5 14 15.5 16 17.5 C17.5 19 17 22.5 15.5 24.5 L20.5 27 L20.5 28.8 L12.5 28.8 C11 27 10.5 23.5 10.5 20 Z' },
          line('rust', 1.6, 'M19 12.2 L21.6 14.2'),
          { f: 'rust', d: 'M19.6 6.6 L19.2 2.4 L21.6 5.6 Z' },
          { f: 'rust', d: 'M18.5 8.5 C19 6 21.5 5 23.5 6 L27.5 7.8 C27.3 8.8 26 9.5 24.5 9.6 C22.5 10.5 20 10.3 18.5 8.5 Z' },
          { f: 'ink', d: artCircle(22.8, 7.3, 0.7) },
        ],
      },
    ],
  };
}
