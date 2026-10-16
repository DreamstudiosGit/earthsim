/* =============================================================================
 * SimEarth 2.0 — settler figures on land, Bronze Age to Nanotech
 * -----------------------------------------------------------------------------
 * How a people moves its settlers after the Stone Age (spec §3.6): a walker
 * with a spear leading a pack donkey, an ox cart, a covered wagon, a truck
 * and a hover glider. 32 × 32 art, facing right; each carries the tribe's
 * pennant, so each is a function of its colour. Style:
 * docs/oekosystem-2026-10/grafikstil.md. Pure data, Node-safe.
 * ========================================================================== */

namespace SE {
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });
  const box = (x0: number, y0: number, x1: number, y1: number): string => `M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1} Z`;

  /** Bronze Age: a pack donkey with sacks and the pennant, led by a walker with a spear. */
  export function bronzeSettlerArt(flag: PaletteKey): Art {
    return [
      line('greyDark', 2.2, 'M6 20 L5.5 28.5'),
      line('greyDark', 2.2, 'M8.8 20.5 L9.4 28.5'),
      line('greyDark', 2.2, 'M13.4 20.5 L13 28.5'),
      line('greyDark', 2.2, 'M16 20 L16.6 28.5'),
      line('grey', 1.6, 'M4.4 16.6 L2.6 21.6'),
      { f: 'grey', d: artEllipse(11, 17.6, 7, 3.8) },
      { f: 'grey', d: 'M15.4 15.4 L18.6 10.6 C19.4 9.6 21.4 9.8 22 11 L22.4 12.6 C22.4 13.6 21.4 14 20.6 13.6 L18.8 18.4 Z' },
      line('greyDark', 1.6, 'M19 10.4 L18 6.8'),
      { f: 'greyDark', d: artEllipse(11, 19.6, 6.4, 1.8), o: 0.55 },
      { s: 'bark', w: 1.6, d: 'M9.8 13.4 L8.4 3.6' },
      { f: flag, d: 'M8.6 3.6 L2.6 5.8 L8.9 8.4 Z' },
      { f: 'cream', d: artEllipse(8.6, 14.4, 3.4, 2.6) },
      { f: 'bone', d: artEllipse(13.4, 14.6, 2.8, 2.4) },
      line('fur', 2.6, 'M24.4 20 L22.8 28.5'),
      line('tan', 2.8, 'M25.8 20 L28 28.5'),
      { f: 'fur', d: 'M22.6 11.4 C23.6 10.4 26.2 10.4 27.2 11.4 L27.6 20.6 C26.2 21.6 23.8 21.6 22.6 20.6 Z' },
      line('bark', 1.6, 'M29.2 28.8 L29.2 4.6'),
      { f: 'grey', d: 'M29.2 1.8 L30.4 5 L28 5 Z' },
      line('tan', 2.2, 'M26 12.4 L28.6 15.4'),
      { f: 'tan', d: artCircle(25.2, 7.2, 2.7) },
      { f: 'furDark', d: 'M22.6 7 C22.6 4.8 24.2 4 25.8 4.2 C27.2 4.4 27.8 5.2 27.8 6 C26 5.6 24.3 6 22.6 7 Z' },
      { f: 'ink', d: artCircle(26.8, 7.2, 0.6) },
    ];
  }

  /** Iron Age: an ox drawing a two-wheeled cart loaded with sacks. */
  export function ironSettlerArt(flag: PaletteKey): Art {
    return [
      line('furDark', 2.4, 'M19.6 19.6 L19.4 28.5'),
      line('furDark', 2.4, 'M22.2 20 L22.6 28.5'),
      line('furDark', 2.4, 'M25.6 20 L25.4 28.5'),
      line('furDark', 2.4, 'M27.6 19.6 L28.2 28.5'),
      { f: 'fur', d: artEllipse(23.4, 16.8, 5.8, 4.2) },
      { f: 'furDark', d: artEllipse(23.6, 19, 5.2, 2), o: 0.55 },
      { f: 'fur', d: artCircle(27.8, 14.2, 2.4) },
      line('bone', 1.4, 'M26.6 12.2 L29.6 10.8'),
      { f: 'ink', d: artCircle(28.6, 13.8, 0.6) },
      line('bark', 2, 'M15.6 19.2 L19.6 18.6'),
      { s: 'bark', w: 1.6, d: 'M6.8 15 L6 3.8' },
      { f: flag, d: 'M6.2 3.8 L1.8 5.8 L6.4 8.4 Z' },
      { f: 'cream', d: artEllipse(5.8, 13.8, 3.2, 2.4) },
      { f: 'bone', d: artEllipse(11, 13.4, 3.6, 2.8) },
      { f: 'bark', d: box(2.6, 15, 16.4, 20.6) },
      { f: 'furDark', d: box(9.4, 15, 16.4, 20.6), o: 0.55 },
      { f: 'furDark', d: artCircle(9.6, 23.4, 4.6) },
      { f: 'bark', d: artCircle(9.6, 23.4, 2.6) },
      { f: 'furDark', d: artCircle(9.6, 23.4, 1.1) },
    ];
  }

  /** Industrial Age: a horse drawing a covered wagon. */
  export function industrialSettlerArt(flag: PaletteKey): Art {
    return [
      line('furDark', 2, 'M21.4 19 L21 28.5'),
      line('furDark', 2, 'M23.4 19.4 L23.8 28.5'),
      line('furDark', 2, 'M26.4 19.4 L26.2 28.5'),
      line('furDark', 2, 'M28 19 L28.6 28.5'),
      line('furDark', 1.4, 'M20 15.2 L19.2 21.2'),
      { f: 'fur', d: artEllipse(24.4, 16.6, 4.8, 3.4) },
      { f: 'fur', d: 'M26.6 15.4 L28 9.8 C28.4 8.4 30.2 8.4 30.4 9.8 L30.4 13 C30.4 14 29.4 14.4 28.8 13.6 L28.8 16.8 Z' },
      { f: 'ink', d: artCircle(29.4, 10.6, 0.55) },
      line('bark', 2, 'M18 19.6 L21.4 18.8'),
      { s: 'bark', w: 1.6, d: 'M10.6 10.2 L10.6 2.8' },
      { f: flag, d: 'M10.2 2.8 L4.6 4.8 L10.2 7 Z' },
      { f: 'cream', d: 'M3 17 C3 8.8 18.4 8.8 18.4 17 Z' },
      { f: 'bone', d: 'M10.7 9.6 C15 9.8 18.4 12.4 18.4 17 L10.7 17 Z', o: 0.6 },
      line('bone', 1.2, 'M7 10.8 L7 17'),
      line('bone', 1.2, 'M14.4 10.8 L14.4 17'),
      { f: 'bark', d: box(2.6, 17, 18.6, 21) },
      { f: 'furDark', d: artCircle(6.6, 23.8, 3.6) },
      { f: 'bark', d: artCircle(6.6, 23.8, 1.2) },
      { f: 'furDark', d: artCircle(15, 23.8, 3.6) },
      { f: 'bark', d: artCircle(15, 23.8, 1.2) },
    ];
  }

  /** Atomic and Information Age: a box truck, the pennant on the cab. */
  export function truckSettlerArt(flag: PaletteKey): Art {
    return [
      { s: 'greyDark', w: 1.4, d: 'M23.4 13.2 L23.4 4.8' },
      { f: flag, d: 'M23 4.8 L17.6 6.8 L23 8.8 Z' },
      { f: 'cream', d: box(2.6, 10, 21, 22.4) },
      { f: 'bone', d: box(12, 10, 21, 22.4), o: 0.6 },
      { f: 'grey', d: 'M21.4 13 L26.6 13 L30.2 17.6 L30.2 23 L21.4 23 Z' },
      { f: 'cyan', d: 'M23 14.4 L26 14.4 L28.4 17.6 L23 17.6 Z' },
      line('black', 2, 'M2.8 23.4 L30 23.4'),
      { f: 'black', d: artCircle(7, 25.6, 2.9) },
      { f: 'grey', d: artCircle(7, 25.6, 1) },
      { f: 'black', d: artCircle(13.4, 25.6, 2.9) },
      { f: 'grey', d: artCircle(13.4, 25.6, 1) },
      { f: 'black', d: artCircle(25.8, 25.6, 2.9) },
      { f: 'grey', d: artCircle(25.8, 25.6, 1) },
    ];
  }

  /** Nanotech: a hover glider over a faint glow, the pennant on its tail fin. */
  export function gliderSettlerArt(flag: PaletteKey): Art {
    return [
      { f: 'mint', d: artEllipse(16.6, 26, 10.6, 1.6), o: 0.45 },
      { s: 'grey', w: 1.4, d: 'M6.4 12.6 L6 4.6' },
      { f: flag, d: 'M6 4.4 L1.8 6.6 L6.2 8.8 Z' },
      { f: 'white', d: 'M3 17 C3 12.4 9 10.2 17 10.2 C24 10.2 29 13.4 30.2 17 C29.6 20.2 25 21.6 17 21.6 C9 21.6 3 20.4 3 17 Z' },
      { f: 'grey', d: 'M3.2 18 C5 20.6 10 21.6 17 21.6 C25 21.6 29.6 20.2 30.2 17 C26 18.6 20 19.2 15 19 C9.6 18.8 5.4 18.4 3.2 18 Z', o: 0.6 },
      { f: 'cyan', d: 'M15 11 C18 8.4 24 9.2 26.6 13 L15 13 Z' },
    ];
  }
}
