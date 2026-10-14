/* =============================================================================
 * SimEarth 2.0 — plant art: Gefäßpflanzen (vascular)
 * -----------------------------------------------------------------------------
 * Early vascular plants (Cooksonia, Rhynia): bare olive stems that fork in two
 * again and again, each tip carrying an ochre spore knob. No leaves, no wood.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /** A stem piece ending at (x, y); further pieces fork from its end, and a piece without any ends in a spore knob. */
  type Stem = readonly [number, number, ...Stem[]];

  /**
   * A leafless plant rising from (x, y). Each piece leaves its fork heading
   * outward and bends upright toward its end, like a tuning fork.
   */
  function forking(x: number, y: number, w: number, ...stems: Stem[]): ArtShape[] {
    const main: string[] = [];
    const twigs: string[] = [];
    const knobs: ArtShape[] = [];
    const grow = (x0: number, y0: number, [x1, y1, ...up]: Stem, twig: boolean): void => {
      (twig ? twigs : main).push(`M${x0} ${y0} Q${r(x0 + (x1 - x0) * 0.9)} ${r(y0 + (y1 - y0) * 0.35)} ${x1} ${y1}`);
      if (up.length === 0) {
        const ky = y1 - 0.6;
        knobs.push({ f: 'chitin', d: artEllipse(x1, ky, 1.9, 1.5) });
        knobs.push({ f: 'rust', d: `M${x1} ${r(ky - 1.5)} A1.9 1.5 0 0 1 ${x1} ${r(ky + 1.5)} Z`, o: 0.45 });
      }
      for (const s of up) grow(x1, y1, s, true);
    };
    for (const s of stems) grow(x, y, s, false);
    const lines: ArtShape[] = [{ s: 'olive', w, d: main.join(' ') }];
    if (twigs.length > 0) lines.push({ s: 'olive', w: w - 0.4, d: twigs.join(' ') });
    return [...lines, ...knobs];
  }

  FLORA_ART[Flora.Vascular] = {
    // spärlich: Cooksonia: a few thin leafless forked stems with round spore knobs at the tips.
    sparse: [
      ...forking(16, 29.5, 2.2, [16, 18.5, [12.5, 12.5, [9.5, 8], [14, 3.8]], [20, 13.5, [18.8, 7], [24, 10.5]]]),
      ...forking(13.5, 29.5, 2.2, [9.5, 19.5, [7.5, 15]]),
    ],
    // dicht: A clump of many forked stems of different heights. Farben: olive-green stems, ochre
    //   spore knobs.
    dense: [
      ...forking(16, 30, 2.2, [15.5, 19, [12, 13, [9.5, 7.5], [13.5, 3.5]], [19.5, 13.5, [18.5, 7], [24, 10]]]),
      ...forking(9, 30, 2.2, [7.5, 21.5, [4, 16], [8.5, 15]]),
      ...forking(23, 30, 2.2, [24.5, 22, [22.5, 16.5], [28, 17.5]]),
    ],
    specialists: [],
  };
}
