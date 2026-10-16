/* =============================================================================
 * SimEarth 2.0 — settler figures
 * -----------------------------------------------------------------------------
 * Groups on their way to found a city, drawn like the animals (32 × 32 art,
 * facing right, ink outline and shadow from artdraw.ts). Every figure carries
 * a pennant in its tribe's colour, which is why each is a function of that
 * colour. Spec: docs/zivilisation-spec.md §3.6; style:
 * docs/oekosystem-2026-10/grafikstil.md.
 * Pure data, Node-safe.
 * ========================================================================== */

namespace SE {
  /** Stone Age: a walker in a hide tunic with a club in front and a bundle on the back, its pennant on the bundle. */
  export function stoneSettlerArt(flag: PaletteKey): Art {
    return [
      { s: 'bark', w: 1.8, d: 'M9.2 18 L6.8 3.2' },
      { f: flag, d: 'M7 3.2 L1.8 5.6 L7.6 8.6 Z' },
      { s: 'fur', w: 2.8, d: 'M15.2 20 L12.2 28.5' },
      { f: 'bone', d: artEllipse(10.4, 15.4, 4.4, 5.2) },
      { f: 'cream', d: 'M7 13.6 C7.6 11.2 9.4 10.2 11.4 10.4 C10 11.8 9.2 14.6 9.6 18.8 C8 18.4 6.8 16.4 7 13.6 Z' },
      { f: 'fur', d: 'M13.4 10.6 C14.6 9.4 17.4 9.4 18.4 10.6 L19 20.4 C17.4 21.4 14.6 21.4 13.4 20.4 Z' },
      { f: 'furDark', d: 'M16.4 9.8 C17.4 9.9 18.2 10.2 18.4 10.6 L19 20.4 C18.3 20.9 17.4 21.1 16.6 21.2 Z', o: 0.55 },
      { s: 'tan', w: 3, d: 'M17 20 L20 28.5' },
      { s: 'bark', w: 1.6, d: 'M13.8 11.4 L11.6 17.6' },
      { s: 'bark', w: 2.4, d: 'M21.6 18.8 L26 9.2' },
      { f: 'furDark', d: artEllipse(26.4, 8.2, 2.4, 3) },
      { s: 'tan', w: 2.4, d: 'M17.6 12 L21.8 17.2' },
      { f: 'tan', d: artCircle(16.8, 6.2, 3.1) },
      { f: 'furDark', d: 'M13.7 6 C13.8 3.4 15.8 2.4 17.8 2.7 C19.4 3 20.1 4.1 20 5 C17.8 4.4 15.7 4.8 13.7 6 Z' },
      { f: 'ink', d: artCircle(18.7, 6.1, 0.7) },
    ];
  }

  /** On the water: a raft of three logs, a figure punting it along, the pennant on a short mast at the stern. */
  export function raftArt(flag: PaletteKey): Art {
    return [
      { s: 'bark', w: 1.8, d: 'M6.4 23 L6.4 6' },
      { f: flag, d: 'M5.8 6 L1.8 8.4 L5.8 11.2 Z' },
      { s: 'bark', w: 1.8, d: 'M20.5 7.5 L26.5 29.5' },
      { s: 'fur', w: 2.8, d: 'M15 18.8 L13.6 23.4' },
      { s: 'tan', w: 3, d: 'M16.6 18.8 L18.4 23.4' },
      { f: 'fur', d: 'M13 9.8 C14.2 8.6 17 8.6 18 9.8 L18.6 19.2 C17 20.2 14.2 20.2 13 19.2 Z' },
      { s: 'tan', w: 2.4, d: 'M17.2 11.2 L21.4 12.6' },
      { f: 'tan', d: artCircle(16.2, 5.6, 3) },
      { f: 'furDark', d: 'M13.2 5.4 C13.3 2.9 15.2 1.9 17.2 2.2 C18.7 2.5 19.4 3.5 19.3 4.4 C17.2 3.8 15.1 4.2 13.2 5.4 Z' },
      { f: 'ink', d: artCircle(18, 5.5, 0.7) },
      { f: 'bark', d: 'M3.5 23 L28.5 23 C29.6 23 30.4 23.9 30.4 25 C30.4 26.1 29.6 27 28.5 27 L3.5 27 C2.4 27 1.6 26.1 1.6 25 C1.6 23.9 2.4 23 3.5 23 Z' },
      { f: 'fur', d: 'M4.5 22.2 L27.5 22.2 C28.4 22.2 29 22.8 29 23.6 C29 24.4 28.4 25 27.5 25 L4.5 25 C3.6 25 3 24.4 3 23.6 C3 22.8 3.6 22.2 4.5 22.2 Z' },
      { f: 'furLight', d: 'M5 26.4 L27 26.4 C27.9 26.4 28.5 27 28.5 27.8 C28.5 28.6 27.9 29.2 27 29.2 L5 29.2 C4.1 29.2 3.5 28.6 3.5 27.8 C3.5 27 4.1 26.4 5 26.4 Z' },
    ];
  }

  /** Placeholder for a non-human people until their own figures exist: a tied bundle carrying the pennant. */
  export function bundleSettlerArt(flag: PaletteKey): Art {
    return [
      { s: 'bark', w: 2, d: 'M16 15 L16 3.4' },
      { f: flag, d: 'M16.8 3.4 L27.4 6.6 L16.8 10.2 Z' },
      { f: 'cream', d: 'M9.2 28.4 C5.8 27.4 5.2 21.4 8.4 17.6 C10 15.8 12.4 15 16 15 C19.6 15 22 15.8 23.6 17.6 C26.8 21.4 26.2 27.4 22.8 28.4 Z' },
      { f: 'bone', d: 'M16 15 C19.6 15 22 15.8 23.6 17.6 C26.8 21.4 26.2 27.4 22.8 28.4 L16 28.4 Z', o: 0.8 },
      { f: 'bone', d: 'M12.6 15.4 C11.4 11.6 20.6 11.6 19.4 15.4 Z' },
      { s: 'bark', w: 2, d: 'M11.8 16.2 L20.2 16.2' },
    ];
  }
}
