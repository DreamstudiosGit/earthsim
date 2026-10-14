/* =============================================================================
 * SimEarth 2.0 — species portraits: Insekten (insects)
 * -----------------------------------------------------------------------------
 * One insect per portrait in the style of the reference set (see
 * docs/oekosystem-2026-10/portraitstil.md): side views facing right with the
 * feet on y ≈ 57, the dragonfly and the roach seen from above like their map
 * icons. Wings are blades with veins as structure lines; glassy wings stay
 * above the outline threshold, so the ink beneath darkens them like glass.
 * ========================================================================== */

namespace SE {
  const fill = (f: PortraitKey, d: string, o?: number): PortraitFill => (o === undefined ? { f, d } : { f, d, o });
  const line = (s: PortraitKey, w: number, d: string, o?: number): PortraitStroke => (o === undefined ? { s, w, d } : { s, w, d, o });
  const dot = (f: PortraitKey, cx: number, cy: number, r: number, o?: number): PortraitFill => fill(f, artCircle(cx, cy, r), o);
  const oval = (f: PortraitKey, cx: number, cy: number, rx: number, ry: number, o?: number): PortraitFill => fill(f, artEllipse(cx, cy, rx, ry), o);
  /** A patch of ground under a standing animal; translucent, so it casts no outline. */
  const ground = (f: PortraitKey, x0: number, x1: number): PortraitFill =>
    fill(f, `M${x0} 57.5 C${x0 + 10} 55.6 ${x1 - 10} 55.6 ${x1} 57.5 C${x1 - 10} 59.6 ${x0 + 10} 59.6 ${x0} 57.5 Z`, 0.3);

  const r1 = (v: number): number => Math.round(v * 10) / 10;

  /** The same path data mirrored across y = 32: the far side of an insect seen from above. */
  const flip = (d: string): string => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_m, x: string, y: string) => `${x} ${r1(64 - Number(y))}`);

  /** An ellipse turned `deg` clockwise. */
  function tilt(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    const t = (deg * Math.PI) / 180;
    const a = `${r1(cx - rx * Math.cos(t))} ${r1(cy - rx * Math.sin(t))}`;
    const b = `${r1(cx + rx * Math.cos(t))} ${r1(cy + rx * Math.sin(t))}`;
    return `M${a} A${rx} ${ry} ${deg} 1 0 ${b} A${rx} ${ry} ${deg} 1 0 ${a} Z`;
  }

  /** Upper edge of a blade() in its own frame: (along, across) for t in 0..1. */
  function bladeEdge(t: number, len: number, half: number): [number, number] {
    const u = 1 - t;
    const along = 3 * u * u * t * 0.35 * len + 3 * u * t * t * len + t * t * t * len;
    const across = u * u * u * 0.4 * half + 3 * u * u * t * 1.25 * half + 3 * u * t * t * half;
    return [along, across];
  }

  /** Half-width of a blade at fraction `a` of its length. */
  function bladeHalf(a: number, len: number, half: number): number {
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (bladeEdge(mid, len, half)[0] < a * len) lo = mid; else hi = mid;
    }
    return bladeEdge(lo, len, half)[1];
  }

  /** A wing or femur from its root (bx, by) to a rounded tip (tx, ty), broadest (≈ w) two thirds out. */
  function blade(bx: number, by: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const h = w / 2;
    const p = (a: number, b: number): string => `${r1(bx + ux * a - uy * b)} ${r1(by + uy * a + ux * b)}`;
    return `M${p(0, 0.4 * h)} C${p(0.35 * len, 1.25 * h)} ${p(len, h)} ${p(len, 0)} `
      + `C${p(len, -h)} ${p(0.35 * len, -1.25 * h)} ${p(0, -0.4 * h)} Z`;
  }

  /** A stripe across the same blade(), from fraction a0 to a1 of its length, kept inside its edge. */
  function band(bx: number, by: number, tx: number, ty: number, w: number, a0: number, a1: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const h = w / 2;
    const p = (a: number, s: number): string => {
      const b = s * 0.92 * bladeHalf(a, len, h);
      return `${r1(bx + ux * a * len - uy * b)} ${r1(by + uy * a * len + ux * b)}`;
    };
    const am = (a0 + a1) / 2;
    return `M${p(a0, 1)} L${p(am, 1)} L${p(a1, 1)} L${p(a1, -1)} L${p(am, -1)} L${p(a0, -1)} Z`;
  }

  /** Veins of the same blade(): lines from near the root fanning out to fractions `ss` (−1..1) of the half-width near the tip. */
  function veins(bx: number, by: number, tx: number, ty: number, w: number, ss: readonly number[]): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const p = (a: number, s: number): string => {
      const b = s * 0.85 * bladeHalf(a, len, w / 2);
      return `${r1(bx + ux * a * len - uy * b)} ${r1(by + uy * a * len + ux * b)}`;
    };
    return ss.map((s) => `M${p(0.08, s * 0.4)} Q${p(0.5, s * 0.9)} ${p(0.92, s * 0.8)}`).join(' ');
  }

  SPECIES_PORTRAITS[Life.Insect] = [
    // 1 · Urinsekten — a springtail: hairy, segmented, wingless, its jumping fork folded under the belly.
    {
      name: 'Urinsekten', art: [
        ground('furDeep', 6, 60),
        line('moss', 0.9, 'M10 57.4 L9 53.2', 0.45),
        line('moss', 0.9, 'M11.8 57.6 L13 53.8', 0.45),
        line('greyDeep', 1.3, 'M45.6 47.6 L49.4 51.6 L50.6 56.4 M41.6 48.4 L43.6 52.6 L43.4 56.4 M37 49 L36.6 53 L35 56.4'),
        line('greyDeep', 1.2, 'M51.6 37.4 L53.4 32.6 L54.6 29 L56.4 25.8'),
        fill('greyDark', 'M10 47 C10 42.6 13.6 40.2 19 39.6 C26 38.8 34 37.6 40 37.8 C43.6 38 46 39.6 46.6 42.4 C47 45.6 45 48.4 41 48.8 C34 49.6 24 50.6 17 50.8 C12.6 50.8 10 49.6 10 47 Z'),
        fill('violet', 'M10 47 C10 42.6 13.6 40.2 19 39.6 C26 38.8 34 37.6 40 37.8 C43.6 38 46 39.6 46.6 42.4 C46.8 44 46.4 45.4 45.4 46.4 C38 47 24 48 11.2 48.8 C10.4 48.4 10 47.8 10 47 Z', 0.4),
        fill('violetLight', 'M11.6 44 C13 41.4 16 40.2 20 39.8 C27 39 34 38.2 39.6 38.4 C42 38.6 43.8 39.2 44.8 40.4 C38 40.2 30 40.6 22 41.6 C17.6 42.2 14.2 43 11.6 44 Z', 0.7),
        fill('ink', 'M10.6 48.4 C16 49 30 48.6 45.6 46.6 C44.4 48 42.8 48.6 41 48.8 C34 49.6 24 50.6 17 50.8 C13.6 50.8 11.4 49.9 10.6 48.4 Z', 0.25),
        ...[41.6, 37, 32.4, 27.8, 23.2, 18.8, 14.6].map((x) => line('greyDeep', 0.8, `M${x} ${x > 40 ? 38.8 : x > 20 ? 39.4 : 40.8} C${r1(x + 1)} 42.6 ${r1(x + 1)} 45.6 ${r1(x + 0.2)} ${x > 40 ? 48.2 : 49.4}`, 0.6)),
        line('greyLight', 0.6, 'M15 40.6 L14 38.6 M20.4 39.4 L19.8 37.2 M26 38.8 L25.6 36.6 M31.6 38.2 L31.4 36 M37.4 37.8 L37.6 35.6 M11 44.2 L9 43.4', 0.45),
        line('creamDark', 1.2, 'M12.6 49.4 C14.6 51.6 16.4 53.8 18.6 56.4'),
        line('cream', 1.5, 'M11.6 49.6 C13.4 52 15 54.4 16.8 56.8'),
        line('cream', 0.9, 'M16.8 56.8 L18.2 57.2', 0.9),
        fill('greyDark', 'M33.4 48.6 C33.6 50.6 35 51.6 36.4 51.2 L36.6 48.6 Z'),
        line('greyDark', 1.4, 'M46.2 46.4 L50.6 51 L52 57 M42.4 47.6 L45 52.4 L45 57 M38 48.6 L37.6 53 L35.6 57'),
        fill('greyDark', tilt(51, 42.4, 5.2, 4.6, 24)),
        fill('violet', tilt(51, 42.4, 5.2, 4.6, 24), 0.4),
        fill('violetLight', 'M47.4 39.4 C48.8 37.8 51 37.4 53 38 C51 38.4 49 38.8 47.4 39.4 Z', 0.7),
        fill('ink', 'M47.6 45.6 C50 47.6 53.6 47.8 55.6 45.4 C55 47.6 52.6 48.6 50.4 48.2 C49.2 47.8 48.2 46.8 47.6 45.6 Z', 0.25),
        fill('greyDeep', 'M53.4 46.4 L56.4 46.2 L55.6 48.2 L53.8 48 Z'),
        dot('ink', 52, 40.6, 1.3),
        dot('shine', 52.4, 40.2, 0.45, 0.9),
        line('greyDark', 1.3, 'M53.4 38.4 L56.2 34.4 L58.6 31.6 L61.8 29.4'),
        fill('greyDeep', [[56.2, 34.4], [58.6, 31.6]].map(([x, y]) => artCircle(x, y, 0.75)).join(' ')),
      ],
    },
    // 2 · Urflügler — a palaeodictyopteran: four broad banded wings raised, small winglets, a sucking beak, long tail filaments.
    {
      name: 'Urflügler', art: [
        ground('furDeep', 4, 60),
        fill('kelpDark', blade(40, 38.4, 54, 9, 9)),
        line('furDeep', 0.7, veins(40, 38.4, 54, 9, 9, [-0.5, 0, 0.5]), 0.55),
        line('furDeep', 1.2, 'M42.6 45.4 L47.4 49.4 L49 56.4 M37.4 46.2 L40.6 50.6 L41.4 56.4 M32.6 46.4 L32.4 51 L30 56.4'),
        line('furDark', 1, 'M10.6 44.4 C7.6 42.6 4.6 39.6 2 35.4'),
        line('furDark', 1, 'M10.8 45.6 C7.6 46.8 4.6 49 1.8 52.6'),
        fill('tan', blade(37, 39, 12, 9, 12)),
        fill('furDark', band(37, 39, 12, 9, 12, 0.45, 0.6)),
        fill('furDark', band(37, 39, 12, 9, 12, 0.82, 1)),
        line('furDeep', 0.7, veins(37, 39, 12, 9, 12, [-0.6, -0.2, 0.2, 0.6]), 0.5),
        fill('bone', blade(40, 38.4, 33, 4, 10)),
        fill('furDark', band(40, 38.4, 33, 4, 10, 0.45, 0.6)),
        fill('furDark', band(40, 38.4, 33, 4, 10, 0.82, 1)),
        line('fur', 0.7, veins(40, 38.4, 33, 4, 10, [-0.55, -0.15, 0.25, 0.6]), 0.55),
        fill('fur', 'M10 45 C10 43.4 12.6 42.6 16 42.4 L33 40.6 C38 40 42.6 39.6 45 40.6 C46.6 41.6 46.6 45 45 46.4 C42 47.6 36 47.6 32 47.4 L16 46.8 C12.6 46.8 10 46.4 10 45 Z'),
        fill('furLight', 'M12 43.6 C15 42.8 22 42.2 30 41.4 C36 40.8 41 40.4 44 41 C38 41.6 30 42.6 22 43.4 C18 43.8 14.6 44 12 43.6 Z'),
        fill('ink', 'M11 45.8 C16 46.4 28 46.8 45.8 45.6 C44.6 47 42 47.6 36 47.6 L16 46.8 C13 46.8 11.4 46.4 11 45.8 Z', 0.22),
        line('furDark', 0.8, 'M16.6 42.6 L16.8 46.6 M20.6 42.2 L20.8 46.8 M24.6 41.8 L24.8 47 M28.6 41.4 L28.8 47.2 M32.4 41 L32.6 47.4', 0.55),
        fill('fur', 'M42 39.6 C42.4 37 44.4 36 45.6 36.6 C45.8 38 45 39.4 43.6 40.4 Z'),
        fill('furLight', 'M42.6 38.8 C43 37.6 44 37 44.8 37.2 C44.2 37.8 43.4 38.4 42.6 38.8 Z'),
        line('furDark', 1.3, 'M43.6 45.6 L47.6 50 L48.6 57 M38.4 46.4 L39.6 51 L37.6 57 M34 46.6 L31 51 L27 57'),
        fill('fur', 'M44.6 38.8 C45.8 36.4 48.6 35.6 50.8 36.6 C52.6 37.6 53 40.2 52 42.6 C51 44.6 48.6 45.4 46.6 44.6 C45 43.8 44.2 41 44.6 38.8 Z'),
        fill('furLight', 'M45.6 38.2 C46.6 36.8 48.6 36.4 50.2 37 C48.6 37.2 47 37.6 45.6 38.2 Z'),
        fill('furDark', 'M48.8 43.6 C50.8 45.6 52.2 48.6 52.6 52.4 L51.4 52.6 C50.6 49.4 49 46.6 47.4 44.8 Z'),
        fill('black', artEllipse(49.4, 39.2, 1.9, 2)),
        dot('ink', 49.8, 39.2, 1.1),
        dot('shine', 50.2, 38.7, 0.45, 0.9),
        line('furDark', 0.9, 'M51.4 37 C53.4 34.4 56 33 59.6 32.6'),
      ],
    },
    // 3 · Riesenlibellen — a griffinfly from above: four long glassy wings, a slender ringed abdomen, huge eyes.
    {
      name: 'Riesenlibellen', art: [
        fill('cyan', blade(39.6, 29.4, 31, 3, 9), 0.55),
        fill('cyan', flip(blade(39.6, 29.4, 31, 3, 9)), 0.55),
        fill('cyan', blade(43.6, 29, 50.6, 3.2, 7.6), 0.55),
        fill('cyan', flip(blade(43.6, 29, 50.6, 3.2, 7.6)), 0.55),
        line('white', 0.6, [veins(39.6, 29.4, 31, 3, 9, [-0.5, 0, 0.5]), veins(43.6, 29, 50.6, 3.2, 7.6, [-0.4, 0.2])].join(' '), 0.45),
        line('white', 0.6, flip([veins(39.6, 29.4, 31, 3, 9, [-0.5, 0, 0.5]), veins(43.6, 29, 50.6, 3.2, 7.6, [-0.4, 0.2])].join(' ')), 0.45),
        line('tealDark', 0.7, 'M42 28.6 C40 20 36 10 31.4 3.4 M45 28.4 C47 20 49.4 10 50.6 3.6', 0.6),
        line('tealDark', 0.7, flip('M42 28.6 C40 20 36 10 31.4 3.4 M45 28.4 C47 20 49.4 10 50.6 3.6'), 0.6),
        fill('navy', 'M32.4 6.6 L34.4 6 L33.2 3.6 L31.4 4 Z M49.2 6.4 L51.2 6.6 L51 4 L49.6 3.8 Z'),
        fill('navy', flip('M32.4 6.6 L34.4 6 L33.2 3.6 L31.4 4 Z M49.2 6.4 L51.2 6.6 L51 4 L49.6 3.8 Z')),
        line('tealDark', 0.9, 'M3.6 31.4 L2 29.6 M3.6 32.6 L2 34.4'),
        fill('teal', 'M3.4 32 C3.4 30.8 4.4 30.4 5.8 30.4 L35.6 29.8 C37.4 29.8 38.4 30.8 38.4 32 C38.4 33.2 37.4 34.2 35.6 34.2 L5.8 33.6 C4.4 33.6 3.4 33.2 3.4 32 Z'),
        fill('tealLight', 'M5 31 L35.6 30.4 C36.6 30.4 37.4 30.8 37.6 31.4 L5 31.6 Z'),
        fill('ink', 'M4 32.8 L37.8 32.6 C37.4 33.6 36.6 34.2 35.6 34.2 L5.8 33.6 C4.8 33.6 4.2 33.3 4 32.8 Z', 0.22),
        ...[8.4, 12.4, 16.4, 20.4, 24.4, 28.4, 32.4].map((x) => line('tealDark', 0.8, `M${x} 30.6 L${x} 33.4`, 0.65)),
        fill('blue', [9.4, 13.4, 17.4, 21.4, 25.4, 29.4, 33.4].map((x) => artEllipse(x, 31.2, 0.7, 0.45)).join(' ')),
        fill('teal', artEllipse(42.6, 32, 5.8, 4.6)),
        fill('tealLight', 'M37.8 30.6 C38.6 28.6 40.6 27.6 43 27.6 C45 27.6 46.6 28.4 47.6 29.6 C44.4 28.8 41 29.2 37.8 30.6 Z'),
        line('navy', 1, 'M39 29.4 C41.4 31 44 31 46.6 29.6 M39 34.6 C41.4 33 44 33 46.6 34.4', 0.7),
        fill('ink', 'M37.4 33.6 C39.6 36.2 45 36.6 48 33.8 C47 36 45 36.6 42.6 36.6 C40 36.6 38.2 35.4 37.4 33.6 Z', 0.22),
        fill('blue', tilt(51.4, 29.2, 4, 3.4, -12)),
        fill('blue', tilt(51.4, 34.8, 4, 3.4, 12)),
        fill('blueLight', 'M48.4 28 C48.8 26.6 50.6 25.6 52.4 25.8 C51 26.6 49.6 27.2 48.4 28 Z'),
        fill('blueLight', 'M48.4 34.4 C48.8 33.2 50 32.6 51.4 32.6 C50.4 33.2 49.4 33.8 48.4 34.4 Z'),
        fill('tealLight', 'M54.6 30.6 C55.8 30.6 56.8 31.2 56.8 32 C56.8 32.8 55.8 33.4 54.6 33.4 Z'),
        dot('ink', 53.4, 28, 1.1),
        dot('ink', 53.4, 36, 1.1),
        dot('shine', 53.7, 27.6, 0.4, 0.9),
        dot('shine', 53.7, 35.6, 0.4, 0.9),
      ],
    },
    // 4 · Schaben — a roachoid from above: overlapping leathery wings, a broad head shield, spiny legs, whip antennae.
    {
      name: 'Schaben', art: [
        line('chitinDark', 1.8, 'M45 27.4 L50 22 L55.6 18.4 M37.6 25.4 L40 17.4 L35.6 10.6 M29.6 25.6 L28 16.6 L18.4 8.6'),
        line('chitinDark', 1.8, flip('M45 27.4 L50 22 L55.6 18.4 M37.6 25.4 L40 17.4 L35.6 10.6 M29.6 25.6 L28 16.6 L18.4 8.6')),
        line('chitin', 1.1, 'M55.6 18.4 L58.6 16.8 M35.6 10.6 L34.2 7.8 M18.4 8.6 L15.2 6.6'),
        line('chitin', 1.1, flip('M55.6 18.4 L58.6 16.8 M35.6 10.6 L34.2 7.8 M18.4 8.6 L15.2 6.6')),
        line('furDeep', 0.6, 'M51.2 20.6 L52.2 21.8 M53.2 19.4 L54.2 20.6 M38.6 15.6 L37.2 15.2 M37.6 13.6 L36.2 13.6 M26.2 14.8 L25.2 15.8 M23.6 12.8 L22.6 13.8 M21 10.8 L20 11.8', 0.7),
        line('furDeep', 0.6, flip('M51.2 20.6 L52.2 21.8 M53.2 19.4 L54.2 20.6 M38.6 15.6 L37.2 15.2 M37.6 13.6 L36.2 13.6 M26.2 14.8 L25.2 15.8 M23.6 12.8 L22.6 13.8 M21 10.8 L20 11.8'), 0.7),
        line('furDark', 1.2, 'M5.8 30.2 L2.4 28.2 M5.8 33.8 L2.4 35.8'),
        fill('fur', 'M4.6 32 C4.6 26.4 12 23 25 22.6 C35 22.4 42 25 44.6 32 C42 39 35 41.6 25 41.4 C12 41 4.6 37.6 4.6 32 Z'),
        fill('furDark', 'M5.6 34.4 C14 34.4 30 33.6 44.2 31.6 L44.2 33 C41.4 39.2 34.6 41.6 25 41.4 C13 41 6.4 38.4 5.6 34.4 Z', 0.55),
        fill('furLight', 'M7 29.4 C9.4 25.6 15.6 23.6 24.6 23.4 C32.6 23.2 38.6 24.8 41.6 27.8 C34.6 26.2 26.6 26 19.6 26.8 C14 27.4 9.8 28.4 7 29.4 Z'),
        fill('ink', 'M6.6 36.6 C12 40 28 41.6 41.6 37.6 C38 40.6 32.6 41.6 25 41.4 C14.6 41 8.4 39.4 6.6 36.6 Z', 0.22),
        line('furDeep', 1, 'M43.6 30.4 C34 33.2 20 34.4 5.6 34', 0.8),
        line('furDark', 0.7, 'M41.4 29.6 C32 28 20 27.8 9.6 29.6 M41 30.6 C30 30.4 18 31.4 7.4 32.4 M38.6 28.4 C34 26.4 28 25.4 21 25.6 M30 29.4 C27 28.4 22 28.2 17 28.6', 0.55),
        line('furDeep', 0.7, 'M41.6 34.4 C34 36.4 24 37.6 12 37.4 M38.4 37.4 C32 39 24 39.6 15.6 39.4', 0.5),
        fill('furDark', artEllipse(58, 32, 2.6, 3.4)),
        fill('fur', 'M56.4 30.2 C57 29 58.2 28.6 59.4 28.8 C58.2 29.2 57.2 29.6 56.4 30.2 Z'),
        line('chitinDark', 0.8, 'M60.2 31.2 L62 30.6 M60.2 32.8 L62 33.4'),
        dot('ink', 59.2, 30.2, 1.1),
        dot('ink', 59.2, 33.8, 1.1),
        dot('shine', 59.5, 29.8, 0.4, 0.9),
        dot('shine', 59.5, 33.4, 0.4, 0.9),
        fill('chitin', 'M41.2 23.8 C45.2 22.6 51.4 23 54.6 25.8 C56.8 27.8 57.4 30 57.4 32 C57.4 34 56.8 36.2 54.6 38.2 C51.4 41 45.2 41.4 41.2 40.2 C39.8 37.4 39.6 26.6 41.2 23.8 Z'),
        fill('chitinLight', 'M42.4 25.6 C46 24.4 51 24.6 54 26.8 C55.2 27.8 55.8 29 56.2 30.2 C52.6 27.6 47.6 26.4 42.4 25.6 Z'),
        fill('furDark', 'M41.4 26 C44.4 25.6 48 26.4 50.4 28.2 C51.6 29.4 52 30.6 52 32 C52 33.4 51.6 34.6 50.4 35.8 C48 37.6 44.4 38.4 41.4 38 C40.6 35 40.6 29 41.4 26 Z'),
        fill('fur', 'M42.4 27.6 C44.8 27.2 47.4 27.8 49.2 29 C46.8 28.6 44.6 28.4 42.4 28.8 Z'),
        fill('ink', 'M41.6 36.4 C45.6 37.6 51 37 55.4 34.6 C54.8 37 52.6 39.4 49 40.4 C46.4 41 43.4 40.8 41.2 40.2 Z', 0.22),
        line('furDark', 1, 'M60.2 30.6 C62 26.6 62.4 21 61.2 14.8 C60.4 10.4 58.6 6.4 55.6 3'),
        line('furDark', 1, 'M60.2 33.4 C62 37.4 62.4 43 61.2 49.2 C60.4 53.6 58.6 57.6 55.6 61'),
      ],
    },
    // 5 · Heuschrecken — a long-horned grasshopper: wings folded along the back, a huge striped jumping leg.
    {
      name: 'Heuschrecken', art: [
        ground('furDeep', 4, 62),
        line('leafDark', 0.9, 'M8 57.4 L7 53.4', 0.45),
        line('leafDark', 0.9, 'M58 57.6 L59.4 54', 0.45),
        line('furDark', 0.9, 'M51.4 31.4 C52.6 22 54.4 13 57.6 5.4'),
        line('furDark', 1.4, 'M49 45 L53.6 49.6 L54.2 56.4 M44 46 L46.6 51 L45.6 56.4'),
        fill('furDark', blade(15.6, 31, 31.6, 45.4, 6.6)),
        line('furDark', 1.4, 'M15.6 31 L21.4 55.6 L24.6 56.4'),
        fill('leafLight', 'M9 45 C9 41.6 12 40 16 39.8 L36 38.6 C40 38.4 43.6 38.4 46 39 L46.6 49 C40 50.4 30 50.6 20 50.4 C13 50.2 9 48.4 9 45 Z'),
        fill('scaleLight', 'M12.6 49 C20 49.8 34 49.8 46.2 48.2 L46.4 49 C40 50.4 30 50.6 20 50.4 C16.4 50.3 14 49.8 12.6 49 Z'),
        fill('ink', 'M10 47.6 C16 49 30 49.2 46.4 47.2 L46.6 49 C40 50.4 30 50.6 20 50.4 C14 50.2 11 49.2 10 47.6 Z', 0.22),
        line('leaf', 0.8, 'M14 44 L14.4 49.6 M18.4 44 L18.8 50 M22.8 44 L23.2 50.2 M27.2 43.8 L27.6 50.2 M31.6 43.6 L32 50', 0.6),
        fill('leaf', 'M42 38.4 C30 37 16 37.6 7 40.6 C5 41.4 4.6 43 6.4 43.6 C16 44.2 30 43.4 42 42.6 Z'),
        fill('frog', 'M40 39 C30 38.2 18 38.6 9 40.8 C18 40.2 30 40 40 40.4 Z'),
        line('leafDark', 0.7, 'M40 41.4 C30 41.6 18 42 8 42.6 M38 39.8 C28 39.6 18 40 10 41.4', 0.6),
        fill('leafLight', 'M35.6 37.6 C37 35 40.6 34.2 44.6 34.6 C46 34.8 47 35.6 47.2 37 L47.4 44.6 C45 46 40 46.4 36.4 45.4 C35.4 43 35.2 39.6 35.6 37.6 Z'),
        fill('moss', 'M36.8 37.2 C38.2 35.6 41 35.2 44.4 35.4 C45.4 35.6 46 36 46.2 36.6 C42.6 36.2 39.6 36.4 36.8 37.2 Z'),
        line('leaf', 0.8, 'M37 41.6 C40 42.6 43.6 42.6 47 41.6', 0.65),
        fill('leafLight', 'M44.6 36 C45.4 32 48.6 30 51.6 30.4 C54.6 30.8 56.4 33.6 56.4 37.6 C56.4 41.6 55 45.4 52.6 46.6 C50 47.6 46.6 46.6 45.4 44 Z'),
        fill('moss', 'M45.8 34.6 C47 32 49.4 31 51.6 31.2 C49.6 32 47.6 33.2 45.8 34.6 Z'),
        fill('ink', 'M46 43.6 C48.6 45.4 52.6 45.8 55.6 43.6 C55 45.2 54 46.2 52.6 46.6 C50 47.6 47 46.8 46 43.6 Z', 0.22),
        fill('furDark', 'M51.6 45.6 L55 45.4 L54.4 48 L52.2 48 Z'),
        line('fur', 1.6, 'M47.6 45.6 L50.6 50.6 L50.2 57 M42.4 46.4 L43.4 51.6 L40.6 57'),
        line('furDark', 1, 'M50.2 57 L52.6 57.2 M40.6 57 L38.4 57.2', 0.9),
        fill('fur', blade(13.6, 32.4, 33.6, 46.6, 7.6)),
        fill('furLight', 'M15.2 31.6 C20 34.4 26 38 31.4 42.4 C25.6 39.6 20 36.6 14.6 33.4 Z'),
        line('furDark', 0.7, 'M18.4 34.6 L19.4 37.6 M21.4 36.4 L22.4 39.6 M24.4 38.4 L25.4 41.6 M27.4 40.4 L28.2 43.6 M30.4 42.6 L30.8 45', 0.6),
        line('fur', 1.6, 'M13.6 32.4 L19.6 55.6 L23.4 57'),
        line('furDark', 0.6, 'M15.4 38.4 L14.2 39 M16.6 43.4 L15.4 44 M17.8 48.4 L16.6 49', 0.8),
        fill('furDark', artEllipse(51.6, 35.4, 2.4, 3)),
        dot('ink', 52, 35.2, 1.3),
        dot('shine', 52.4, 34.7, 0.45, 0.9),
        line('fur', 0.9, 'M52.4 31.6 C55 23 58 15 62.4 8.4'),
      ],
    },
    // 6 · Käfer — an early beetle: glossy metallic wing covers with rows of pits meeting in a seam, beaded antennae.
    {
      name: 'Käfer', art: [
        ground('furDeep', 6, 62),
        line('greyDeep', 1.6, 'M47.6 46 L53.6 49.4 L56.4 56.4 M39.6 47.2 L42.6 51.8 L42 56.4 M31.6 47.8 L30.2 52.2 L28 56.4'),
        line('greyDeep', 1, 'M53.4 40.6 C54.4 37 56.2 34 58.4 32'),
        fill('black', 'M9.6 48 C19.6 50.2 33.6 50.2 41.6 48.2 L41.2 49.8 C33.6 51.4 19.6 51.6 10.4 49.8 Z'),
        fill('navy', 'M8.6 48.4 C8 41.6 14 34.6 24 33.4 C31.6 32.6 37.6 34.8 40 39 L40.4 48 C31.6 49.8 17.6 50.2 8.6 48.4 Z'),
        fill('blue', 'M9.4 46.6 C9.6 41 15 35.6 24 34.6 C31 33.8 36.6 36 39 40 L39.4 46.6 C31 48.4 17.6 48.6 9.4 46.6 Z'),
        fill('sky', 'M12.4 41.4 C14 38 18 35.8 23.6 35.2 C20 36.8 17 38.6 15.2 41.8 Z'),
        fill('white', 'M17.4 37.6 C18.6 36.6 20 36 21.6 35.6 C20.6 36.4 19.6 37.2 18.6 38.2 Z', 0.85),
        line('navy', 0.8, 'M13 46.4 C13.4 41.4 17.6 37.2 24.6 36.4 M18 47.4 C18.4 42.8 21.6 39.4 27.4 38.6 M23.2 47.8 C23.6 44 26.4 41.2 30.8 40.4 M28.6 47.8 C29 45 30.8 43 34 42.2', 0.6),
        fill('navy', [[15.6, 42.6], [19.2, 39.4], [22.4, 37.8], [20.4, 44.4], [23.6, 41.6], [26.8, 40.2], [25.6, 45.2], [28.6, 42.8], [31, 44.4], [33.6, 43.8]].map(([x, y]) => artCircle(x, y, 0.45)).join(' '), 0.7),
        line('black', 0.9, 'M10.4 44.4 C11.6 39 16.6 35 24 34.4 C30 34 35.4 35.8 38 39.2', 0.7),
        fill('ink', 'M9.4 46.6 C17 48.4 31 48.4 40.2 46.4 L40.4 48 C31.6 49.8 17.6 50.2 8.6 48.4 C8.8 47.6 9 47.1 9.4 46.6 Z', 0.25),
        fill('navy', 'M39 39.2 C40.4 36.6 43.6 35.8 46.4 36.6 C48.6 37.4 49.6 39.6 49.4 42.4 L49 46.8 L40 47.4 Z'),
        fill('blue', 'M40 39.8 C41.2 37.6 43.8 37 46 37.6 C47.6 38.2 48.4 40 48.2 42.4 L48 45.8 L40.6 46.4 Z'),
        fill('sky', 'M41 39.6 C42 38.2 44 37.8 45.8 38.2 C44 38.6 42.4 39 41 39.6 Z'),
        fill('ink', 'M40.4 44.6 C43.2 45.2 46.4 44.8 49.2 43.6 L49 46.8 L40 47.4 Z', 0.22),
        line('black', 1.8, 'M46.4 46.4 L50.4 50.6 L52.4 56.8 M37.6 47.6 L38.2 52 L36 57 M29.6 48.4 L26 52 L21.6 56.8'),
        fill('greyDark', [[51.8, 55], [36.6, 55.6], [23, 55.6]].map(([x, y]) => artCircle(x, y, 0.6)).join(' ')),
        fill('black', 'M48.2 40.6 C50.2 39 53.2 39.6 54.6 41.8 C55.6 43.8 55.2 46.6 53.2 47.8 C51.2 48.8 48.6 48 48 45.8 Z'),
        fill('greyDark', 'M49 41.2 C50.2 40.2 52 40.2 53.2 41.2 C51.8 41.2 50.4 41.4 49 41.2 Z'),
        fill('ink', 'M48.6 46 C50.2 47.4 52.8 47.6 54.8 46.2 C54.2 47.6 52.6 48.4 50.8 48.2 C49.8 48 49 47.2 48.6 46 Z', 0.22),
        fill('black', 'M54.2 45.8 C56.2 45.6 57.6 46.6 58 48.2 C56.6 48 55.4 47.8 54.2 47.6 Z'),
        line('greyDeep', 0.8, 'M55 47.6 L56.2 49.2'),
        line('greyDark', 0.8, 'M47.4 47.6 L49.6 49.8 M38.2 49 L38.4 51 M28.6 49.8 L27 51.4', 0.6),
        dot('ink', 52, 42.6, 1.2),
        dot('shine', 52.4, 42.2, 0.45, 0.9),
        line('black', 1.1, 'M54 41 C56 37.8 58 35.8 60.8 34.8'),
        fill('black', [[55.8, 38.4], [57.4, 36.6], [59.2, 35.4], [60.8, 34.8]].map(([x, y]) => artCircle(x, y, 0.85)).join(' ')),
      ],
    },
    // 7 · Gottesanbeterinnen — a mantis on a twig: long neck, triangular head, spiny raptorial forelegs folded up.
    {
      name: 'Gottesanbeterinnen', art: [
        line('bark', 3.2, 'M2 58 C20 57.2 40 57.8 62 56.8'),
        line('barkLight', 0.9, 'M3 57 C20 56.2 40 56.8 61.6 55.8', 0.8),
        line('leaf', 1.2, 'M31.4 42.6 L37.4 47.4 L41 55.8 M28 43.2 L24 48 L23.4 55.8'),
        line('leaf', 1.4, 'M43 26.2 L46.4 33.6 M46.4 33.6 L49.8 25.4 L47.6 31.6'),
        line('leaf', 0.8, 'M44.8 15.6 C44.4 10.4 46 6.4 49.6 3.6'),
        fill('frog', 'M5 44.6 C5 42.4 8 41 13 40.6 L28 39.4 C30.6 39.4 32 40.6 32 42.2 C32 44 30 45.2 27 45.4 L13 46.6 C8.6 47 5 46.6 5 44.6 Z'),
        fill('scaleLight', 'M8 46.4 C14 46.4 22 45.8 30.6 44.6 C29.6 45.2 28.4 45.4 27 45.4 L13 46.6 C11 46.8 9.4 46.7 8 46.4 Z'),
        line('leaf', 0.8, 'M12 43.4 L12.4 46.4 M16 43.2 L16.4 46.2 M20 43 L20.4 45.8 M24 42.8 L24.4 45.6', 0.6),
        fill('ink', 'M5.6 45.6 C12 46.6 22 46 31.6 43.2 C31 44.6 29.4 45.3 27 45.4 L13 46.6 C9 47 6.2 46.6 5.6 45.6 Z', 0.22),
        fill('leaf', 'M31 39 C24 37.4 14 38 6.4 41.4 C5 42.2 5.4 43.4 6.8 43.4 C14 43 24 42.4 31 42.2 Z'),
        fill('leafLight', 'M29.6 39.2 C22 38.6 14 39.2 8.4 41.4 C14 40.4 22 40.2 29.6 40.4 Z'),
        line('leafDark', 0.7, 'M29 41.2 C22 41.2 14 41.6 8 42.4', 0.6),
        fill('frog', 'M26.6 40.6 C27.6 38.6 30 37.6 32.6 37.8 L34.4 42 C32 43.6 28.6 43.8 26.6 42.6 Z'),
        fill('frog', 'M30.6 41.8 C33 36 36.6 29.4 40.4 23.6 L42.8 24.8 C40 31 37 37.4 34.4 42.4 Z'),
        fill('leafLight', 'M31.8 40 C34 35 37 29.6 40.2 24.6 L41.2 25.1 C38.4 30 35.4 35.4 33 40.6 Z'),
        fill('ink', 'M42.8 24.8 C40 31 37 37.4 34.4 42.4 L33.2 42.2 C36 37 39 31 41.8 24.4 Z', 0.22),
        line('frog', 1.3, 'M32.6 42.6 L35.6 48.6 L37 56 M29 43.4 L22.4 48.4 L18.6 56'),
        line('leafDark', 0.9, 'M37 56 L39.4 56.2 M18.6 56 L16.4 56.2', 0.8),
        line('frog', 2.6, 'M39.2 26.6 L43.2 33.8'),
        fill('frog', blade(43.2, 33.8, 48.6, 24.6, 3.8)),
        line('yellowPale', 0.6, 'M44.6 33.6 L45.6 34.6 M45.8 31.6 L46.8 32.4 M47 29.6 L48 30.2', 0.8),
        line('leafLight', 1.4, 'M48.6 24.6 L45.4 31.6 L44.2 32.8'),
        fill('frog', 'M39 19.4 C39.6 16.4 42 15 44.6 15.4 C47.6 15.8 50 17.4 51 19.6 C51.4 21 50.6 22 49.4 22.4 L45 25.6 C43.6 26.4 41.6 25.6 40.6 24 C39.6 22.6 39 21 39 19.4 Z'),
        fill('leafLight', 'M40 18.6 C40.8 16.6 42.6 16 44.6 16.2 C43 16.8 41.4 17.6 40 18.6 Z'),
        fill('ink', 'M41 23.6 C43 24.6 45.4 24.2 48.6 22.4 L45 25.6 C43.6 26.4 41.8 25.4 41 23.6 Z', 0.22),
        fill('leafDark', 'M44 24.6 L46.2 24.2 L46 26.2 L44.6 26.4 Z'),
        fill('leafLight', tilt(47.6, 18.6, 2.6, 2.3, -10)),
        dot('ink', 48, 18.8, 1.1),
        dot('shine', 48.4, 18.4, 0.4, 0.9),
        line('leaf', 0.8, 'M46 15.6 C47 11 50 7.6 55.6 5.6'),
      ],
    },
    // 8 · Ameisen — a worker on the move: big jawed head, elbowed antennae, a knot-like waist, a striped gaster.
    {
      name: 'Ameisen', art: [
        ground('furDeep', 4, 62),
        line('furDeep', 1.2, 'M44 43.6 L49 46.4 L57.6 56.4 M36.4 45 L41.6 49.4 L42.6 56.4 M31 45 L30.6 50 L27.6 56.4'),
        line('rustDark', 1, 'M53.6 28.6 L50.6 20.4 C52.6 17 55.6 15.4 59 16.2'),
        fill('rust', tilt(14.8, 44, 10, 7, 12)),
        fill('coral', 'M6.6 41.4 C8 37.6 12 36 16.4 36.6 C19.6 37 22.2 38.4 23.4 40.4 C19 38.8 14 38.6 9.6 40 C8.4 40.4 7.4 40.8 6.6 41.4 Z'),
        line('rustDark', 0.9, 'M10.4 37.8 C9 41 9 45.4 10.6 49.4 M15.2 37 C13.6 40.6 13.6 46 15.2 50.6 M20 37.8 C18.6 41 18.6 46 20 50', 0.6),
        line('cream', 0.6, 'M8.4 38 L7.6 36.4 M13 36.4 L12.6 34.6 M18 36.6 L18.2 34.8 M5 44 L3.4 43.8 M6 48.6 L4.6 49.6', 0.45),
        fill('ink', 'M5.6 46 C9 51 18 52.6 24.6 46.6 C23.6 50.4 19.6 52 15 52 C10 51.6 6.6 49.4 5.6 46 Z', 0.22),
        fill('rust', 'M24 44.6 C24.4 41 25.6 38.6 27.6 38.4 C29.4 38.4 30.2 40.6 30.2 44.6 C28.4 45.4 25.8 45.4 24 44.6 Z'),
        fill('coral', 'M25.2 41 C25.6 39.6 26.6 38.9 27.6 39 C26.8 39.6 26 40.2 25.2 41 Z'),
        fill('rust', 'M29.6 44.6 C29.2 40.6 31 37.6 34.4 37 L37.6 37.2 C39.6 35.4 42.4 34.4 44.6 35 C46.4 35.6 46.8 37.6 46 39.4 L44.6 44.8 C40 46.4 34 46.6 29.6 44.6 Z'),
        fill('coral', 'M31 40 C31.8 38.4 33.2 37.8 35 37.8 L38 37.8 C39.8 36.4 42 35.6 44 35.8 C41.4 36.8 39.6 38.2 37.8 39 C35.4 38.8 33 39 31 40 Z'),
        line('rustDark', 0.8, 'M37.6 37.6 C37.2 40 37.4 42.6 38.2 45.4 M34.2 37.4 C33.8 39.6 34 42 34.6 45.2', 0.6),
        fill('ink', 'M30 43.4 C34 45 40 45.2 45.2 43 L44.6 44.8 C40 46.4 34 46.6 29.6 44.6 Z', 0.22),
        fill('rustDark', 'M56.6 37.4 C58.6 36.8 60.4 37.6 61.2 39.2 C59.6 39.4 58 39.2 56.8 38.8 Z'),
        line('furDark', 1.3, 'M45.6 44 L49.6 47.6 L53.6 56.6 L56.6 57 M37.6 45.6 L39.6 50 L36.6 56.8 L33.8 57 M32 45.6 L27.6 49.6 L21.6 56.8 L18.8 57'),
        fill('rust', [tilt(45.2, 44.2, 1.8, 1.2, 40), tilt(37.6, 45.6, 1.6, 1.1, 70), tilt(32.4, 45.6, 1.6, 1.1, 120)].join(' ')),
        fill('rust', 'M45.4 33 C45.6 29 48.6 27 52 27.2 C55.6 27.4 58 30 58.2 33.6 C58.4 37 56.6 39.6 53.6 40.4 C50 41.2 46.4 39.6 45.6 36.4 Z'),
        fill('coral', 'M46.6 31.4 C47.6 29 49.8 28 52.2 28.2 C50.2 28.8 48.2 30 46.6 31.4 Z'),
        fill('ink', 'M46.4 37.6 C49 39.6 53.6 39.8 57.4 37 C56.6 39 55.4 40 53.6 40.4 C50.6 41.2 47.6 40.2 46.4 37.6 Z', 0.22),
        fill('rustDark', 'M56 38 C58.6 37.8 60.6 39.2 61.4 41.4 C59.6 41.4 57.8 40.8 56.4 40.2 Z'),
        line('rustDark', 0.7, 'M58 39.8 L58.4 40.8 M59.6 40.4 L59.8 41.2', 0.6),
        oval('ink', 52.6, 32.2, 1.5, 1.9),
        dot('shine', 53, 31.5, 0.5, 0.9),
        line('cream', 0.6, 'M48.4 28.4 L47.6 26.8 M51.6 27.2 L51.4 25.6 M45.6 36.6 L44 37.2', 0.45),
        line('furDark', 1.1, 'M55.4 29.4 L54 20.6 C57.4 18.6 60 19.6 62 23.6'),
        line('furDark', 1.6, 'M59.8 20.6 L62 23.6'),
      ],
    },
  ];
}
