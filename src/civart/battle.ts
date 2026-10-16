/* =============================================================================
 * SimEarth 2.0 — the battle symbol
 * -----------------------------------------------------------------------------
 * Drawn between two cities at war (spec §3.7), like the animals (32 × 32
 * art, ink outline and shadow from artdraw.ts): up to the Iron Age two
 * crossed swords over a cloud of dust, from the Industrial age on a cloud of
 * smoke with fire beneath. Style: docs/oekosystem-2026-10/grafikstil.md.
 * Pure data, Node-safe.
 * ========================================================================== */

namespace SE {
  function bladesArt(): Art {
    return [
      { f: 'sand', d: artEllipse(16, 26.8, 12.6, 3.2) },
      { f: 'sand', d: artCircle(6, 25.4, 3.6) },
      { f: 'sand', d: artCircle(11, 24.2, 3.8) },
      { f: 'sand', d: artCircle(16, 22.2, 4.6) },
      { f: 'sand', d: artCircle(21.4, 24, 4) },
      { f: 'sand', d: artCircle(26.2, 25.6, 3.4) },
      { f: 'bone', d: artCircle(14.6, 21.4, 2.4) },
      { f: 'tan', d: artEllipse(21.4, 27.6, 7, 2.2), o: 0.6 },
      { s: 'white', w: 3, d: 'M19.2 17.2 L6 4' },
      { s: 'gold', w: 2.4, d: 'M17.6 20.4 L22.4 15.6' },
      { s: 'bark', w: 2.6, d: 'M20.8 18.8 L23.8 21.8' },
      { f: 'gold', d: artCircle(24.8, 22.8, 1.7) },
      { s: 'white', w: 3, d: 'M12.8 17.2 L26 4' },
      { s: 'gold', w: 2.4, d: 'M14.4 20.4 L9.6 15.6' },
      { s: 'bark', w: 2.6, d: 'M11.2 18.8 L8.2 21.8' },
      { f: 'gold', d: artCircle(7.2, 22.8, 1.7) },
    ];
  }

  function smokeArt(): Art {
    return [
      { f: 'greyDark', d: artEllipse(16.6, 25, 11.4, 4.4) },
      { f: 'greyDark', d: artCircle(9.8, 21.2, 5.6) },
      { f: 'greyDark', d: artCircle(17, 14.8, 7) },
      { f: 'greyDark', d: artCircle(24, 20.6, 5.4) },
      { f: 'greyDark', d: artCircle(12.6, 8.6, 4.2) },
      { f: 'grey', d: artCircle(14.6, 12.4, 3.6) },
      { f: 'grey', d: artCircle(8.4, 19.4, 2.8) },
      { f: 'grey', d: artCircle(11.4, 7.4, 2.2) },
      { f: 'black', d: artEllipse(21.6, 25.4, 6.8, 3.2), o: 0.55 },
      { f: 'orange', d: 'M8.6 29.4 C7.6 27 8.8 25.2 10.4 23.8 C10.8 25.8 12.6 26.8 12.2 29.4 Z' },
      { f: 'orange', d: 'M19.4 29.4 C18.8 27.4 19.8 26 21 24.8 C21.4 26.4 23 27.4 22.6 29.4 Z' },
    ];
  }

  /** The battle symbol of a conflict fought at tech level `tech`. */
  export function battleArt(tech: Tech): Art {
    return tech >= Tech.Industrial ? smokeArt() : bladesArt();
  }
}
