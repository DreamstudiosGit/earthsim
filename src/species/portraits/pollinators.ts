/* =============================================================================
 * SimEarth 2.0 — species portraits: Bienen & Bestäuber (pollinators)
 * -----------------------------------------------------------------------------
 * Bees, butterflies, moths and hoverflies in the style of the reference set
 * (see docs/oekosystem-2026-10/portraitstil.md): side views facing right,
 * standing ones with the feet on their perch, fliers higher up; the hoverfly
 * seen from above. Each keeps the colours of its map icon. Glassy wings stay
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

  /** Local point (x, y) of a frame centred on (cx, cy) and turned `deg` clockwise, as "X Y". */
  function at(cx: number, cy: number, deg: number, x: number, y: number): string {
    const t = (deg * Math.PI) / 180;
    return `${r1(cx + x * Math.cos(t) - y * Math.sin(t))} ${r1(cy + x * Math.sin(t) + y * Math.cos(t))}`;
  }

  /** An ellipse turned `deg` clockwise. */
  function tilt(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    const a = at(cx, cy, deg, -rx, 0);
    return `M${a} A${rx} ${ry} ${deg} 1 0 ${at(cx, cy, deg, rx, 0)} A${rx} ${ry} ${deg} 1 0 ${a} Z`;
  }

  /** The slice of that ellipse between local x = a and x = b: a stripe across the body. */
  function slice(cx: number, cy: number, rx: number, ry: number, deg: number, a: number, b: number): string {
    const h = (x: number): number => ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
    return `M${at(cx, cy, deg, a, -h(a))} A${rx} ${ry} ${deg} 0 1 ${at(cx, cy, deg, b, -h(b))} `
      + `L${at(cx, cy, deg, b, h(b))} A${rx} ${ry} ${deg} 0 1 ${at(cx, cy, deg, a, h(a))} Z`;
  }

  /** An ellipse with a tufted rim of `n` bumps: a furry body. */
  function fuzz(cx: number, cy: number, rx: number, ry: number, n: number, amp: number): string {
    const p = (k: number, out: number): string => {
      const t = (2 * Math.PI * k) / n;
      return `${r1(cx + (rx + out) * Math.cos(t))} ${r1(cy + (ry + out) * Math.sin(t))}`;
    };
    let d = `M${p(0, 0)}`;
    for (let k = 0; k < n; k++) d += ` Q${p(k + 0.5, amp * 2)} ${p(k + 1, 0)}`;
    return `${d} Z`;
  }

  /** A wing from its root (bx, by) to a rounded tip (tx, ty), broadest (≈ w) two thirds out. */
  function blade(bx: number, by: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const h = w / 2;
    const p = (a: number, b: number): string => `${r1(bx + ux * a - uy * b)} ${r1(by + uy * a + ux * b)}`;
    return `M${p(0, 0.4 * h)} C${p(0.35 * len, 1.25 * h)} ${p(len, h)} ${p(len, 0)} `
      + `C${p(len, -h)} ${p(0.35 * len, -1.25 * h)} ${p(0, -0.4 * h)} Z`;
  }

  /** Two veins along a blade(): from the root towards the tip, a little off its axis. */
  function bladeVeins(bx: number, by: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const p = (a: number, b: number): string => `${r1(bx + ux * a - uy * b)} ${r1(by + uy * a + ux * b)}`;
    return `M${p(0.1 * len, 0.1 * w)} Q${p(0.5 * len, 0.36 * w)} ${p(0.86 * len, 0.18 * w)} `
      + `M${p(0.12 * len, -0.08 * w)} Q${p(0.5 * len, -0.2 * w)} ${p(0.8 * len, -0.26 * w)} `
      + `M${p(0.5 * len, 0.3 * w)} L${p(0.56 * len, -0.18 * w)}`;
  }

  /** A pointy-topped hexagon: one honeycomb cell. */
  function hex(cx: number, cy: number, s: number): string {
    return `M${[0, 1, 2, 3, 4, 5].map((k) => at(cx, cy, 60 * k - 90, s, 0)).join(' L')} Z`;
  }

  /** A stingless worker in flight, `s` times a 13-unit one, thorax at (x, y), facing right. */
  function meliponine(x: number, y: number, s: number): PortraitShape[] {
    const p = (a: number, b: number): string => `${r1(x + a * s)} ${r1(y + b * s)}`;
    const q = (a: number, b: number): [number, number] => [r1(x + a * s), r1(y + b * s)];
    const w = (v: number): number => Math.max(0.6, r1(v * s));
    return [
      fill('white', blade(...q(-0.6, -1.4), ...q(-4.6, -6.8), 2.6 * s), 0.55),
      line('furDark', w(0.6), `M${p(0.4, 1.8)} L${p(1.6, 4)} L${p(1.2, 5.2)} M${p(-1.2, 2)} L${p(-2.2, 4.4)} L${p(-3.6, 5.2)}`),
      fill('chitin', tilt(r1(x - 4.4 * s), r1(y + 0.8 * s), r1(3.8 * s), r1(2.5 * s), 16)),
      fill('chitinLight', `M${p(-7.6, 0.4)} C${p(-7, -1.2)} ${p(-5, -1.8)} ${p(-3, -1.4)} C${p(-4.6, -0.9)} ${p(-6.2, -0.4)} ${p(-7.6, 0.4)} Z`),
      line('chitinDark', w(0.7), `M${p(-3.6, -1.2)} L${p(-4.4, 2.8)} M${p(-5.8, -0.8)} L${p(-6.4, 2.4)}`, 0.7),
      fill('ink', `M${p(-7.8, 1.4)} C${p(-6.4, 3.2)} ${p(-3.6, 3.4)} ${p(-1.4, 2.4)} C${p(-3, 3.6)} ${p(-6.6, 3.8)} ${p(-7.8, 1.4)} Z`, 0.22),
      fill('chitinDark', artCircle(x, y, r1(2.3 * s))),
      fill('white', blade(...q(0, -1.6), ...q(-5.8, -5), 3 * s), 0.7),
      fill('chitinDark', artCircle(r1(x + 3.1 * s), r1(y + 0.4 * s), r1(1.8 * s))),
      dot('ink', r1(x + 3.6 * s), r1(y + 0.1 * s), Math.max(1.1, r1(0.9 * s))),
      dot('shine', r1(x + 3.9 * s), r1(y - 0.3 * s), 0.4, 0.9),
      line('furDark', w(0.6), `M${p(3.8, -1.2)} L${p(5, -3)} L${p(6.4, -2.6)}`),
    ];
  }

  SPECIES_PORTRAITS[Life.Pollinator] = [
    // 1 · Wildbienen — a stocky, furry mining bee at its burrow in the sand: pale hair bands, both wing pairs folded back, pollen packed into the brush on the hind legs.
    {
      name: 'Wildbienen', art: [
        ground('sandDark', 2, 62),
        fill('sand', 'M51.6 57.6 C53.2 54.8 57.2 54 60.6 55.4 C61.8 56 62.4 56.8 62.4 57.8 C59.4 57 55.6 57 51.6 57.6 Z', 0.45),
        fill('ink', artEllipse(57.4, 57.8, 3, 1.1), 0.45),
        line('furDeep', 1.8, 'M45.6 48.4 L48.2 52.4 L51 56.6 M40.8 49.2 L43 53 L44 56.8 M34.6 49 L31.6 52.8 L29 56.2'),
        fill('gold', tilt(31.2, 53.6, 3, 2, -40), 0.9),
        fill('furDark', fuzz(22.2, 46.2, 12, 7.4, 26, 0.4)),
        fill('fur', 'M11.4 43.4 C13.4 40.2 18 38.6 23 38.6 C27.6 38.6 31.6 39.8 33.6 42 C29 41 24 40.8 19.4 41.4 C16.2 41.8 13.6 42.4 11.4 43.4 Z'),
        line('cream', 1.1, [6.6, 2.2, -2.2, -6.6].map((a) => { const h = r1(7.4 * Math.sqrt(1 - (a / 12) ** 2) - 0.6); return `M${at(22.2, 46.2, 0, a, -h)} Q${at(22.2, 46.2, 0, a - 1.8, 0)} ${at(22.2, 46.2, 0, a, h)}`; }).join(' '), 0.8),
        line('fur', 0.7, 'M27.6 43.4 L26.4 42.4 M23 48.4 L21.8 47.4 M18.4 43.6 L17.2 42.6 M13.2 47.4 L12 46.4', 0.55),
        fill('ink', 'M10.6 48.6 C14 53 28 54.6 34.6 49.4 C33.4 52.4 29 53.8 23.4 53.8 C16.6 53.8 12 51.6 10.6 48.6 Z', 0.25),
        fill('furDark', fuzz(38.4, 41.8, 7.8, 7.4, 20, 0.55)),
        fill('fur', 'M31.6 40.4 C32.2 37 35 34.6 38.4 34.4 C41.6 34.4 44.2 35.8 45.4 38.2 C41.4 37 36.4 37.8 31.6 40.4 Z'),
        line('furPale', 0.8, 'M33 37.8 L32 36.2 M36.2 35.6 L35.8 33.8 M39.6 35.2 L40 33.4 M42.8 36 L43.8 34.4 M45.4 38.8 L46.8 37.8', 0.6),
        fill('ink', 'M32.4 45.4 C35 48.8 41.6 49.6 45.4 45.4 C44.4 48.2 41.6 49.4 38.6 49.4 C35.6 49.4 33.4 47.8 32.4 45.4 Z', 0.22),
        fill('cyan', blade(37, 37.6, 16.6, 38.2, 5.4), 0.55),
        fill('cyan', blade(38.6, 36, 12.6, 31.2, 7.6), 0.62),
        line('furDeep', 0.6, `${bladeVeins(38.6, 36, 12.6, 31.2, 7.6)} M33 37.2 L22 37.8`, 0.55),
        line('furDark', 2.6, 'M36 47.4 L31.8 50.6'),
        fill('yellow', tilt(28.6, 52.6, 4.4, 2.7, -32)),
        fill('yellowPale', 'M25 52.2 C25.8 50.6 28 49.6 30.2 49.4 C28.6 50.4 26.8 51.2 25 52.2 Z'),
        fill('gold', 'M25.8 55 C28.2 55.4 31 54.4 32.6 52.4 C32.4 54.6 30.2 56 27.8 56 C27 56 26.4 55.6 25.8 55 Z', 0.85),
        line('yellowPale', 0.7, 'M26.2 50.6 L25.2 49.2 M28.8 49.6 L28.2 48 M31.6 49.2 L31.6 47.6 M24.2 52.8 L22.8 52.6 M24.6 54.8 L23.2 55.6 M28 56.2 L27.8 57.4 M31.4 55.2 L32.2 56.4 M33.2 51.4 L34.6 51', 0.6),
        line('furDark', 1.6, 'M25 54.8 L22.6 56.8 L20.4 57'),
        line('furDark', 2.4, 'M40.4 48.4 L41.6 52.6 L40.2 56.8'),
        line('furDark', 2.2, 'M44.6 47.6 L47 51.8 L49.2 56.6'),
        line('fur', 1.2, 'M40.2 56.8 L37.8 57.2 M49.2 56.6 L51.4 57'),
        line('furPale', 0.7, 'M42 51.6 L43.2 51.2 M47.4 50.8 L48.6 50.2', 0.55),
        fill('furDark', tilt(49.4, 43.6, 4.6, 5.8, -14)),
        fill('fur', 'M45.4 40.6 C46.2 38.4 48.4 37.2 50.8 37.6 C48.8 38.4 47 39.4 45.4 40.6 Z'),
        fill('black', tilt(49.6, 42.6, 2.1, 3.6, -14)),
        fill('ink', 'M45.6 46.2 C47 48.6 50.4 49.6 53 48.2 C52 49.6 50.4 50 48.8 49.6 C47.4 49.2 46.2 48 45.6 46.2 Z', 0.22),
        line('furPale', 0.7, 'M52.6 44.6 L54.4 45 M52.4 46.2 L54 47 M50.6 38.2 L51 36.6', 0.6),
        fill('furDeep', 'M51.6 48.2 L54.4 49 L53.4 50.8 L51.2 49.8 Z'),
        dot('ink', 50, 41.4, 1.2),
        dot('shine', 50.4, 40.9, 0.45, 0.9),
        line('furDeep', 1, 'M49.4 38.2 L50.8 34.2 L55.4 33 C57.4 32.8 59 33.8 59.8 35.4'),
        line('furDark', 1.1, 'M50.8 38.2 L52.8 34.4 L57.4 34 C59.4 34.2 60.8 35.6 61.2 37.4'),
      ],
    },
    // 2 · Schmetterlinge — a butterfly at rest on a flower, wings closed: orange underside, black veins, white-dotted rim.
    {
      name: 'Schmetterlinge', art: [
        line('leaf', 1.8, 'M37 56 C36.4 59 35.6 61 34.6 62.6'),
        fill('leafLight', 'M35.8 60.6 C33 59.2 30.4 59.4 28.4 60.8 C30.6 61.8 33.4 61.8 35.8 60.6 Z'),
        line('greyDeep', 0.9, 'M48.6 42 L55.4 26.2'),
        fill('greyDeep', artCircle(55.6, 25.6, 1.1)),
        fill('orange', 'M34.6 44.6 C30 40 26 34 25 27.6 C21 26.6 14.6 28 11.6 32.6 C9.6 36 10.6 41 14 44 C18 47.6 26 47.6 34.6 44.6 Z'),
        fill('orange', 'M36 43.6 C37.6 32 40.6 18 45.4 6.8 C38 7.6 30 13 24.4 20.6 C22.8 23 22.6 26.6 23.8 29.6 C27 34.6 31 39.6 36 43.6 Z'),
        fill('orangeLight', 'M35 39.4 C35.8 30 38.4 20 42.6 10.4 C36.6 12 31.4 16 27.6 21 C30.6 19.4 33.6 18.6 36.4 18.4 C35.4 25 35 32 35 39.4 Z'),
        fill('ink', 'M14 44 C18 47.6 26 47.6 34.6 44.6 C28 44.8 20 44.4 13.4 43.2 Z', 0.22),
        line('black', 2.2, 'M45.4 6.8 C38 7.6 30 13 24.4 20.6 C22.8 23 22.6 26.6 23.8 29.6'),
        line('black', 2.2, 'M25 27.6 C21 26.6 14.6 28 11.6 32.6 C9.6 36 10.6 41 14 44 C17 46.6 22 47.4 27.6 46.6'),
        line('black', 1, 'M35.6 42 C35.4 32 37.4 20 43.4 9.4 M35 42 C32 34 30 24 32.6 13.4 M34.4 42.4 C30 36 27 30 26.4 21.4 M33.6 43.2 C30.4 40.4 27.6 36.4 25.2 30.6', 0.85),
        line('black', 1, 'M33.6 44.2 C27 40.4 20 36.4 14.6 33 M33 44.6 C26 44 19 42 13.4 39.4 M32.4 45.2 C26 46 20 45.6 16 44.4', 0.85),
        fill('white', [[41.2, 8.4], [36.4, 10.2], [31.8, 13], [27.8, 16.4], [24.8, 20], [22.9, 24.4], [21.6, 28], [16.6, 28.8], [13.2, 31.6], [11.2, 35.6], [11.8, 40], [14.8, 43.6], [19.4, 46]].map(([x, y]) => artCircle(x, y, 0.55)).join(' ')),
        fill('black', tilt(27.6, 47.2, 8.6, 1.9, -3)),
        fill('black', artEllipse(38.4, 45.6, 3.4, 2.6)),
        line('black', 0.9, 'M38.6 47.6 L40.8 51.4 L41.6 53.2 M36.4 47.8 L35.8 51.4 L35.2 53.4'),
        fill('black', artCircle(43, 44.8, 2.4)),
        fill('white', [[37, 44.2], [39.6, 44], [26, 46.4], [30, 46.2]].map(([x, y]) => artCircle(x, y, 0.45)).join(' '), 0.8),
        line('black', 0.9, 'M43.8 43 L53.6 26.8'),
        fill('black', artCircle(53.8, 26.4, 1.2)),
        line('black', 0.8, 'M44.8 46.4 C47 47 47.6 49 46.2 49.8 C45 50.4 44.2 49.2 45.2 48.6'),
        dot('ink', 43.8, 44.2, 1.1),
        dot('shine', 44.2, 43.8, 0.4, 0.9),
        fill('blossom', [tilt(30.6, 54.6, 4.6, 1.3, -12), tilt(44.2, 54.6, 4.6, 1.3, 12), tilt(33.4, 56.6, 4, 1.3, 28), tilt(41.4, 56.6, 4, 1.3, -28), tilt(37.4, 57.4, 1.3, 2.8, 0)].join(' ')),
        fill('pink', 'M32 56 C34 57.6 37 58.4 40.4 58 C42.4 57.6 43.8 56.6 44.4 55.8 C41 56.6 36 56.8 32 56 Z', 0.7),
        fill('gold', artEllipse(37.4, 53.6, 5.6, 2.2)),
        fill('yellow', 'M33 53 C34.6 52 37.4 51.6 40.2 52 C41.4 52.2 42.2 52.6 42.6 53 C39.4 52.6 35.6 52.6 33 53 Z'),
        fill('kelp', [[34.4, 54.2], [36.6, 54.6], [39, 54.4], [41, 54]].map(([x, y]) => artCircle(x, y, 0.45)).join(' '), 0.7),
      ],
    },
    // 3 · Stachellose Bienen — three tiny workers at the waxy resin tube that leads into their nest in a tree.
    {
      name: 'Stachellose Bienen', art: [
        fill('bark', 'M47.4 1.4 L62.6 1.4 L62.6 62.6 L46.2 62.6 C47.6 52 45.6 42 47 32 C48 22 46 12 47.4 1.4 Z'),
        fill('barkLight', 'M47.4 1.4 L50.6 1.4 C49.4 12 51 22 50 32 C49 42 51 52 49.8 62.6 L46.2 62.6 C47.6 52 45.6 42 47 32 C48 22 46 12 47.4 1.4 Z'),
        line('furDeep', 0.9, 'M54 3 C55 10 53.4 16 54.4 22 M57.6 40 C58.6 46 57 52 58 60 M52.6 44 C53.4 48 52.4 52 53 56 M58.6 8 C59.4 13 58.4 17 59 21', 0.6),
        fill('ink', 'M55.6 26 L62.6 26 L62.6 40 L54.6 40 C56 35 55 31 55.6 26 Z', 0.22),
        fill('kelpDark', 'M48 28.2 C43.4 28.6 40 27.2 37.2 24.4 C35.8 23 34 23.2 33.6 25.2 L33.4 38.8 C33.8 40.8 35.8 41 37.2 39.6 C40 36.8 43.4 35.4 48 35.8 Z'),
        fill('kelp', 'M47.4 29.4 C43 29.6 40 28.6 37.4 26.2 C40.4 27.6 43.6 28.2 47.4 28.2 Z'),
        fill('ink', 'M37 39 C39.8 36.4 43.4 35.2 47.8 35.4 L48 35.8 C43.4 35.4 40 36.8 37.2 39.6 Z', 0.25),
        fill('kelp', tilt(34.6, 32, 2.6, 7.6, 0)),
        fill('ink', tilt(34.4, 32, 1.4, 5.6, 0)),
        ...meliponine(25.6, 32.6, 1.6),
        ...meliponine(13.6, 16.4, 1.4),
        ...meliponine(16, 48.4, 1.3),
      ],
    },
    // 4 · Schwärmer — a hawkmoth seen from above, hovering at a trumpet flower: stout spindle body with pink and black bands, narrow pointed forewings swept back like an arrow, small pink hindwings, the long tongue deep in the bloom.
    {
      name: 'Schwärmer', art: [
        fill('grey', 'M28.5 29.3 C30 21.3 29.6 11.5 26.8 2.6 C23.2 5.4 19.6 8.1 16.1 10.3 C18.5 16.7 21 22.7 23.8 28.5 Z M28.5 34.7 C30 42.7 29.6 52.5 26.8 61.4 C23.2 58.6 19.6 55.9 16.1 53.7 C18.5 47.3 21 41.3 23.8 35.5 Z', 0.25),
        line('leaf', 1.6, 'M61.6 34 C62.4 41 61.8 51 59.6 62.4'),
        fill('leaf', 'M61.2 50.6 C57 48.6 53.4 49.6 51.8 52.8 C55.6 54 59.2 53.4 61.2 50.6 Z'),
        line('leafDark', 0.7, 'M60.4 50.8 C57.6 51 55 51.8 52.8 52.8', 0.6),
        fill('pink', 'M24.6 29.4 C20 28.8 14.8 27 11.8 23.6 C11 22.2 11.8 20.8 13.6 20.8 C18.4 21.4 22.8 24 25.8 28 Z M24.6 34.6 C20 35.2 14.8 37 11.8 40.4 C11 41.8 11.8 43.2 13.6 43.2 C18.4 42.6 22.8 40 25.8 36 Z'),
        fill('black', 'M12.4 23.8 C15.6 24.6 19 25.8 22.4 27.4 L23.4 28.4 C20 27.6 16.6 26.8 13.8 25.2 Z M12.4 40.2 C15.6 39.4 19 38.2 22.4 36.6 L23.4 35.6 C20 36.4 16.6 37.2 13.8 38.8 Z'),
        fill('furDeep', 'M24.6 29.4 C23 28.8 21.6 28 20.4 27 C22.2 26.8 24 27.2 25.6 28 Z M24.6 34.6 C23 35.2 21.6 36 20.4 37 C22.2 37.2 24 36.8 25.6 36 Z', 0.85),
        fill('grey', 'M28.4 28.4 C26.8 20.4 22.8 11.4 16.8 4.2 C14.6 8.2 12.2 12 9.8 15.4 C14.4 20.4 19 25 23.8 29.4 Z M28.4 35.6 C26.8 43.6 22.8 52.6 16.8 59.8 C14.6 55.8 12.2 52 9.8 48.6 C14.4 43.6 19 39 23.8 34.6 Z'),
        fill('greyLight', 'M28 28 C26.4 20.6 22.6 12 17.2 5.2 C19.4 11.4 22.6 18.6 26.2 28.6 Z'),
        fill('greyLight', 'M28 36 C26.4 43.4 22.6 52 17.2 58.8 C19.4 52.6 22.6 45.4 26.2 35.4 Z', 0.6),
        fill('olive', 'M23.6 28.8 C19.8 25 15.6 20.4 12.2 16.2 C14 14.6 15.8 12.4 17.4 9.8 C18.6 15 21.4 20.8 25.8 28.6 Z M23.6 35.2 C19.8 39 15.6 43.6 12.2 47.8 C14 49.4 15.8 51.6 17.4 54.2 C18.6 49 21.4 43.2 25.8 35.4 Z'),
        fill('oliveDark', 'M17.2 6.4 C15.8 9.8 13.8 12.6 11.4 15 C14 14.2 16 12.4 17.4 9.8 Z M17.2 57.6 C15.8 54.2 13.8 51.4 11.4 49 C14 49.8 16 51.6 17.4 54.2 Z'),
        line('greyDeep', 0.7, 'M24.6 27.4 C21.2 22.6 17.6 18 13.6 13.8 M22.8 27.8 C19.2 24.2 15.4 20.6 11.4 16.6 M25.8 26.6 C23.8 20.8 21.2 14.8 17.8 9.4 M24.6 36.6 C21.2 41.4 17.6 46 13.6 50.2 M22.8 36.2 C19.2 39.8 15.4 43.4 11.4 47.4 M25.8 37.4 C23.8 43.2 21.2 49.2 17.8 54.6', 0.5),
        fill('ink', 'M28.4 35.6 C26.8 43.6 22.8 52.6 16.8 59.8 C14.6 55.8 12.2 52 9.8 48.6 C14.4 43.6 19 39 23.8 34.6 Z', 0.18),
        fill('olive', tilt(14.4, 32, 9.6, 5.6, 0)),
        fill('oliveDark', 'M6.6 30.2 L3.4 32 L6.6 33.8 Z'),
        fill('pink', [[-6.6, -5], [-3.2, -1.6], [0.2, 1.8], [3.6, 5.2]].map(([a, b]) => slice(14.4, 32, 9.6, 5.6, 0, a, b)).join(' ')),
        fill('black', [[-5, -4.2], [-1.6, -0.8], [1.8, 2.6], [5.2, 6]].map(([a, b]) => slice(14.4, 32, 9.6, 5.6, 0, a, b)).join(' ')),
        fill('oliveDark', tilt(14.6, 32, 8.6, 1.5, 0)),
        fill('scaleLight', 'M6.4 30 C8.4 27.6 12 26.4 15.6 26.4 C18.6 26.4 21.2 27.2 22.8 28.6 C19.4 27.8 15.8 27.8 12.4 28.4 C10.2 28.8 8.2 29.4 6.4 30 Z', 0.8),
        fill('ink', 'M6.4 34 C9 37.2 18 38.4 23.4 34.6 C21.8 37 18.6 37.6 14.6 37.6 C10.8 37.6 7.8 36.2 6.4 34 Z', 0.25),
        fill('olive', tilt(26.2, 32, 4.8, 5.6, 0)),
        fill('scaleLight', 'M22 30.4 C22.8 28 24.8 26.6 27 26.6 C28.8 26.6 30.2 27.4 30.8 28.6 C28 28 25 28.6 22 30.4 Z', 0.85),
        line('greyLight', 0.8, 'M22.8 29 C24.6 28 26.8 27.8 29 28.4 M22.8 35 C24.6 36 26.8 36.2 29 35.6', 0.55),
        line('oliveDark', 0.8, 'M23.4 32 L29.6 32', 0.6),
        fill('ink', 'M21.8 33.8 C23.6 36.6 28.4 37.6 31 34.4 C30.2 36.6 28.4 37.6 26.2 37.6 C24 37.6 22.4 36 21.8 33.8 Z', 0.22),
        fill('olive', tilt(32.2, 32, 2.6, 3.4, 0)),
        line('greyLight', 0.9, 'M33.6 30 C35.6 28.4 37.6 26.6 40.2 24.8 L40.6 23.6 M33.6 34 C35.6 35.6 37.6 37.4 40.2 39.2 L40.6 40.4'),
        line('tan', 1.1, 'M34.4 32 C40 32.4 46 32.8 51.6 32.6'),
        dot('black', 32.4, 29.4, 1.5),
        dot('black', 32.4, 34.6, 1.5),
        dot('ink', 32.6, 29.3, 1.1),
        dot('ink', 32.6, 34.7, 1.1),
        dot('shine', 32.9, 28.9, 0.4, 0.9),
        dot('shine', 32.9, 34.3, 0.4, 0.9),
        fill('leaf', 'M59 30 L62.6 30.8 L62.6 34 L59 34.8 Z'),
        fill('white', 'M53.6 28.2 C56 29.6 58.4 30.4 61 30.8 L61 34 C58.4 34.4 56 35.2 53.6 36.6 Z'),
        fill('creamDark', 'M53.6 34.6 C56 34 58.4 33.6 61 33.6 L61 34 C58.4 34.4 56 35.2 53.6 36.6 Z'),
        fill('white', 'M53.4 21.4 C54.4 23.2 54.9 26.3 55 27.1 C55.4 27.2 56.8 27.4 57.8 29 C57.4 31.7 56.3 33.9 56 34.4 C56.1 35.2 56.4 38.5 56.1 41.3 C54.9 41.2 53.7 39.4 53.4 39 C53.1 39.4 51.9 41.2 50.7 41.3 C50.4 38.5 50.7 35.2 50.8 34.4 C50.5 33.9 49.4 31.7 49 29 C50 27.4 51.4 27.2 51.8 27.1 C51.9 26.3 52.4 23.2 53.4 21.4 Z'),
        fill('cream', 'M53.2 26.2 C53.7 27.2 54 29.1 54.1 29.5 C54.3 29.6 55.1 29.6 55.7 30.5 C55.4 32 54.8 33.2 54.6 33.5 C54.7 34 54.9 35.8 54.7 37.4 C54 37.3 53.4 36.2 53.2 36 C53 36.2 52.4 37.3 51.7 37.4 C51.5 35.8 51.7 34 51.8 33.5 C51.6 33.2 51 32 50.7 30.5 C51.3 29.6 52.1 29.6 52.3 29.5 C52.4 29.1 52.7 27.2 53.2 26.2 Z'),
        line('creamDark', 0.7, 'M53.2 26.6 L53.4 23 M55.4 30.2 L57.6 28.6 M54.8 35.2 L56.4 38.8 M51.8 35.2 L50.6 38.8 M51.2 30.2 L49.2 28.6', 0.7),
        fill('ink', artEllipse(52.8, 32.6, 1, 2), 0.45),
      ],
    },
    // 5 · Schwebfliegen — a hoverfly seen from above over a flower: one pair of clear wings, wasp-striped abdomen, huge eyes.
    {
      name: 'Schwebfliegen', art: [
        fill('white', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => tilt(r1(28 + 13 * Math.cos((k * Math.PI) / 6)), r1(36 + 13 * Math.sin((k * Math.PI) / 6)), 6.6, 2.4, k * 30)).join(' '), 0.3),
        fill('yellow', artCircle(28, 36, 6.4), 0.35),
        line('chitin', 1.1, 'M42 27.6 L45.6 22.6 L48.6 21.6 M37.6 26.6 L37.6 20.4 L36.6 18.6 M34 27 L29 21.6 L26.6 21'),
        line('chitin', 1.1, 'M42 36.4 L45.6 41.4 L48.6 42.4 M37.6 37.4 L37.6 43.6 L36.6 45.4 M34 37 L29 42.4 L26.6 43'),
        fill('cyan', blade(38.6, 28.2, 15.4, 7.4, 9.4), 0.55),
        fill('cyan', blade(38.6, 35.8, 15.4, 56.6, 9.4), 0.55),
        line('furDark', 0.6, `${bladeVeins(38.6, 28.2, 15.4, 7.4, 9.4)} ${bladeVeins(38.6, 35.8, 15.4, 56.6, 9.4)}`, 0.5),
        line('chitin', 0.8, 'M33.4 27.6 L32.6 25.6 M33.4 36.4 L32.6 38.4'),
        fill('yellow', artCircle(32.4, 25.2, 0.8)),
        fill('yellow', artCircle(32.4, 38.8, 0.8)),
        fill('black', 'M8 32 C8 27.2 13.6 25 21 25 C28 25 33.4 27.4 33.4 32 C33.4 36.6 28 39 21 39 C13.6 39 8 36.8 8 32 Z'),
        fill('greyDark', 'M10 29.4 C12 26.8 16.6 25.8 21 25.8 C25.4 25.8 29.4 26.8 31.4 28.6 C27 27.6 22 27.4 17 28 C14 28.4 11.8 28.8 10 29.4 Z'),
        ...[[27.2, 1.9], [21.2, 2.1], [15.2, 1.8]].map(([x, w]) => fill('yellow', `M${r1(x - w / 2)} ${r1(25.8 + Math.abs(x - 21) * 0.12)} C${r1(x - w)} 29 ${r1(x - w)} 35 ${r1(x - w / 2)} ${r1(38.2 - Math.abs(x - 21) * 0.12)} L${r1(x + w / 2)} ${r1(38.2 - Math.abs(x - 21) * 0.12)} C${r1(x)} 35 ${r1(x)} 29 ${r1(x + w / 2)} ${r1(25.8 + Math.abs(x - 21) * 0.12)} Z`)),
        fill('ink', 'M9 34.4 C12 38 26 39.6 32.6 34.4 C31 37.6 26.6 39 21 39 C14 39 9.6 37 9 34.4 Z', 0.25),
        fill('black', artEllipse(38.2, 32, 5.6, 5.2)),
        fill('greyDark', 'M33.6 30.4 C34.4 28.2 36.4 27.2 38.6 27.2 C40.6 27.2 42 28 42.8 29.2 C39.6 28.6 36.6 29 33.6 30.4 Z'),
        fill('yellow', 'M34.6 28.4 C36.6 27 40 26.8 42.2 28 L41.6 28.8 C39.6 28 36.8 28.2 35 29.2 Z M34.6 35.6 C36.6 37 40 37.2 42.2 36 L41.6 35.2 C39.6 36 36.8 35.8 35 34.8 Z'),
        fill('chitin', 'M33.4 32 C33.4 30 34.6 29.2 35.6 29.6 C36.2 30.4 36.2 33.6 35.6 34.4 C34.6 34.8 33.4 34 33.4 32 Z'),
        fill('ink', 'M33 33.6 C35 36.4 39.4 37.6 43.2 34.6 C42.2 36.4 40.4 37.2 38.2 37.2 C35.6 37.2 33.6 35.8 33 33.6 Z', 0.22),
        fill('rust', tilt(46.4, 28.4, 3.6, 4, -20)),
        fill('rust', tilt(46.4, 35.6, 3.6, 4, 20)),
        fill('coral', 'M43.6 27.6 C44 25.6 45.6 24.6 47.4 24.8 C46 25.6 44.8 26.4 43.6 27.6 Z'),
        fill('rustDark', 'M44 37.6 C45.4 39.2 47.8 39.6 49.4 38.2 C48.8 39.4 47.4 40 46 39.8 C45 39.6 44.4 38.8 44 37.6 Z', 0.6),
        fill('yellow', 'M49.4 30 C50.8 30.2 51.6 31 51.6 32 C51.6 33 50.8 33.8 49.4 34 C49.8 32.8 49.8 31.2 49.4 30 Z'),
        line('black', 0.9, 'M50.8 31.2 L53.2 30.4 M50.8 32.8 L53.2 33.6'),
        dot('ink', 48.2, 27.6, 1.1),
        dot('ink', 48.2, 36.4, 1.1),
        dot('shine', 48.5, 27.2, 0.4, 0.9),
        dot('shine', 48.5, 36, 0.4, 0.9),
      ],
    },
    // 6 · Hummeln — a fuzzy bumblebee on clover: banded black and yellow, white tail, a pollen load on the hind leg.
    {
      name: 'Hummeln', art: [
        line('leaf', 1.8, 'M33 57 C32.6 59.6 31.8 61.4 30.6 62.6'),
        fill('leaf', 'M31.6 60.6 C28 58.6 24.6 59.2 22.6 61.2 C25.4 62.4 29 62.2 31.6 60.6 Z'),
        line('greyDeep', 1.6, 'M43 38.6 L47.6 43.6 L48.6 48.4 M37.6 39.8 L41 45 L40.6 48.6 M30.6 41.4 L30.4 46 L32 48.6'),
        fill('violetDark', fuzz(33.4, 53.2, 9.4, 5.2, 18, 0.7)),
        fill('violet', 'M24.6 51.4 C26 48.6 30 47.4 33.6 47.4 C37.4 47.4 41.6 48.8 42.8 51.4 C38.6 50.2 34 50 29.6 50.4 C27.6 50.6 26 50.8 24.6 51.4 Z'),
        line('violetLight', 0.8, 'M27 50.4 L25.6 48.6 M30.4 49.4 L29.8 47.4 M34 49.2 L34 47.2 M37.6 49.4 L38.4 47.6 M41 50.4 L42.4 48.8 M28.6 53 L27 52.4 M33 52.4 L32.6 51 M37.6 52.6 L38.4 51.2', 0.7),
        fill('ink', 'M24.4 55 C28 58.4 38 58.8 42.6 55 C41.6 57.6 37.6 58.6 33.4 58.6 C29 58.6 25.6 57.4 24.4 55 Z', 0.25),
        fill('cyan', blade(31.6, 26.4, 14.6, 19.6, 6), 0.5),
        fill('black', fuzz(21.6, 37.6, 11, 9.2, 20, 0.8)),
        fill('yellow', slice(21.6, 37.6, 11, 9.2, 0, 1, 5.2)),
        fill('white', slice(21.6, 37.6, 11, 9.2, 0, -11, -6.8)),
        fill('greyDark', 'M12.6 32.6 C14.4 29.6 18 28 22 28 C25.6 28 28.6 29.2 30.4 31 C26.6 30 22 30 18 31 C16 31.4 14.2 32 12.6 32.6 Z', 0.85),
        fill('yellowPale', 'M23 29 C24.4 28.6 25.8 28.8 26.8 29.2 L26.8 30.6 C25.6 30.2 24.4 30 23 30.2 Z', 0.8),
        line('greyDark', 0.7, 'M14.6 36 L13.4 35.2 M15 40.6 L13.6 41 M18.6 44.4 L18 45.8 M30 35.4 L31.4 34.6 M29.6 41.6 L31 42.4', 0.55),
        fill('ink', 'M11.6 41.6 C15 46.6 26 48.4 32.2 41.4 C30.6 45.6 26.6 47 21.6 47 C16.4 46.8 13 44.6 11.6 41.6 Z', 0.25),
        fill('black', fuzz(34.6, 33.6, 7.2, 6.8, 16, 0.8)),
        fill('yellow', slice(34.6, 33.6, 7.2, 6.8, 0, 3.6, 7.2)),
        fill('greyDark', 'M29.4 31 C30.6 28.6 33 27.4 35.6 27.6 C33.4 28.4 31.4 29.6 29.4 31 Z', 0.85),
        fill('ink', 'M28.4 36.6 C30.6 39.6 36 40.6 40.4 37.6 C39 39.8 36.8 40.6 34.6 40.6 C31.8 40.6 29.6 39.2 28.4 36.6 Z', 0.25),
        fill('cyan', blade(32.6, 26.8, 13.6, 24.6, 7), 0.6),
        line('greyDeep', 0.6, bladeVeins(32.6, 26.8, 13.6, 24.6, 7), 0.55),
        line('black', 1.8, 'M41.6 39.6 L45.4 44.6 L46 49 M36.6 40.6 L38.6 45.6 L37.4 49.4'),
        line('black', 2, 'M29 42.4 L26 46.6 L27.6 49.8'),
        fill('orange', tilt(26.2, 46.4, 2.8, 2.2, 50)),
        fill('orangeLight', 'M24.8 45 C25.4 44.2 26.6 44 27.4 44.6 C26.6 45 25.6 45.2 24.8 45 Z'),
        fill('black', fuzz(43.4, 35.4, 4.4, 5, 12, 0.5)),
        fill('greyDeep', tilt(44, 34, 1.9, 3, 12)),
        fill('ink', 'M40.6 37.6 C42 39.6 45 40.2 47.4 38.4 C46.6 40 45 40.8 43.4 40.6 C42.2 40.4 41.2 39.2 40.6 37.6 Z', 0.25),
        line('black', 1.1, 'M46.4 39.4 L47.4 43.4'),
        dot('ink', 44.6, 33.6, 1.2),
        dot('shine', 45, 33.1, 0.45, 0.9),
        line('black', 1.1, 'M45.8 31.4 L47.6 26.6 C50 25.4 52.4 25.6 54.4 26.8'),
      ],
    },
    // 7 · Honigbienen — a golden honeybee walking on a piece of comb: capped cells, honey cells, wax walls.
    {
      name: 'Honigbienen', art: [
        fill('yellow', [5, 12.3, 19.6, 26.9, 34.2, 41.5, 48.8, 56.1].map((x) => hex(x, 50.6, 4.2)).concat([8.6, 15.9, 23.2, 30.5, 37.8, 45.1, 52.4].map((x) => hex(x, 56.9, 4.2))).join(' ')),
        fill('gold', [5, 19.6, 34.2, 48.8, 15.9, 30.5, 45.1].map((x, k) => hex(x, k < 4 ? 50.6 : 56.9, 3.1)).join(' ')),
        fill('amber', [5, 19.6, 34.2, 48.8, 15.9, 30.5, 45.1].map((x, k) => { const y = k < 4 ? 50.6 : 56.9; return `M${r1(x - 2)} ${r1(y + 0.6)} C${r1(x - 1.2)} ${r1(y + 2)} ${r1(x + 1.2)} ${r1(y + 2.2)} ${r1(x + 2.2)} ${r1(y + 1)} C${r1(x + 1)} ${r1(y + 2.6)} ${r1(x - 1)} ${r1(y + 2.6)} ${r1(x - 2)} ${r1(y + 0.6)} Z`; }).join(' ')),
        fill('yellowPale', [12.3, 26.9, 41.5, 56.1, 8.6, 23.2, 37.8, 52.4].map((x, k) => hex(x, k < 4 ? 50.6 : 56.9, 3.1)).join(' ')),
        fill('cream', [12.3, 26.9, 41.5, 56.1, 8.6, 23.2, 37.8, 52.4].map((x, k) => { const y = k < 4 ? 50.6 : 56.9; return `M${r1(x - 2)} ${r1(y - 1)} C${r1(x - 1)} ${r1(y - 2.4)} ${r1(x + 1)} ${r1(y - 2.4)} ${r1(x + 2)} ${r1(y - 1)} C${r1(x + 1)} ${r1(y - 1.6)} ${r1(x - 1)} ${r1(y - 1.6)} ${r1(x - 2)} ${r1(y - 1)} Z`; }).join(' ')),
        fill('shine', [5, 19.6, 34.2, 48.8, 15.9, 30.5, 45.1].map((x, k) => artCircle(r1(x - 1), (k < 4 ? 50.6 : 56.9) - 1.2, 0.5)).join(' '), 0.7),
        fill('ink', 'M2 58.6 C14 60.6 40 61 61 58.6 L59.4 61 L4 61 Z', 0.2),
        line('greyDeep', 1.2, 'M44.4 38.6 L48.6 42.4 L50 46.4 M39.6 40.2 L42.4 44 L42 46.4 M33.6 40.6 L32.6 44.2 L30.6 46.4'),
        fill('cyan', blade(36, 29.4, 16, 23.6, 6.4), 0.5),
        fill('chitin', tilt(22.4, 37.6, 11.8, 6.6, 9)),
        fill('chitinLight', 'M12 34.4 C14.4 31.6 19 30.4 24 30.8 C28 31.2 31.4 32.4 33.2 34 C29 33.2 24 33 19.6 33.4 C16.4 33.6 14 34 12 34.4 Z'),
        ...[[-8.4, -6.6], [-4.2, -2.6], [0, 1.6], [4.2, 5.6]].map(([a, b]) => fill('furDark', slice(22.4, 37.6, 11.8, 6.6, 9, a, b))),
        line('tan', 0.7, 'M13.6 35.6 L12.4 34.4 M33 34.2 L34 33 M14.6 41.6 L13.4 42.6', 0.5),
        fill('ink', 'M11.2 39.8 C15 44.4 28 46 33.8 40.4 C32.4 44 28.4 45.4 23.4 45.4 C17.4 45.2 12.8 43 11.2 39.8 Z', 0.25),
        fill('furDark', fuzz(37.2, 34.4, 6, 5.8, 16, 0.6)),
        fill('tan', 'M32 32.6 C33 30 35.6 28.6 38.2 28.8 C40.4 29 42 30 42.8 31.4 C39.6 30.6 35.6 31 32 32.6 Z'),
        fill('ink', 'M31.6 36.8 C33.8 39.8 39.4 40.8 43 37.6 C41.8 39.6 39.6 40.4 37.2 40.4 C34.4 40.4 32.4 39 31.6 36.8 Z', 0.22),
        fill('cyan', blade(37, 29.6, 13, 28.4, 7.6), 0.6),
        line('furDeep', 0.6, bladeVeins(37, 29.6, 13, 28.4, 7.6), 0.55),
        line('furDark', 1.4, 'M43.6 39.6 L47 43.6 L48 46.4 L50 46.6 M38.6 40.4 L39.6 44 L38.2 46.4'),
        line('furDark', 1.6, 'M33 40.6 L29.6 43.4 L27.6 46.4'),
        fill('orange', tilt(29.8, 43.4, 2.2, 1.6, 40)),
        fill('furDark', tilt(46.2, 35.6, 3.8, 4.8, 12)),
        fill('fur', 'M43 33.2 C43.8 31.6 45.4 31 47 31.4 C45.6 31.8 44.2 32.4 43 33.2 Z'),
        fill('black', tilt(46.4, 34.4, 1.8, 3, 10)),
        fill('ink', 'M43 38.4 C44.6 40.2 47.4 40.6 49.6 39 C49 40.6 47.4 41.4 45.8 41 C44.6 40.6 43.6 39.6 43 38.4 Z', 0.22),
        dot('ink', 46.8, 34, 1.2),
        dot('shine', 47.2, 33.5, 0.45, 0.9),
        line('furDark', 1.1, 'M48.4 31.6 L50.4 26.8 C52.6 25.6 55 25.8 57 27.2'),
      ],
    },
    // 8 · Prachtbienen — a compact, metallic green orchid bee hovering at an orchid: its very long tongue reaches deep into the lip, swollen hind shins dangle below.
    {
      name: 'Prachtbienen', art: [
        line('leaf', 1.6, 'M57.6 51.6 C58.6 55.4 59.6 59 60.6 62.4'),
        fill('leaf', 'M59.8 58.6 C55.6 56.2 51.4 57 49.6 60.4 C53.6 61.8 57.6 61.2 59.8 58.6 Z'),
        fill('violetLight', 'M55.2 46.4 C54 41.6 54.6 37.6 56.6 35.4 C58 38.6 57.8 42.6 55.8 46.6 Z M56 47 C59.4 43.6 62.6 42.6 62.8 44.6 C62.6 47 59.6 47.8 56.2 47.6 Z M55.4 47.6 C57.8 51.4 58.4 54.6 56.8 55.6 C55 55.8 54.4 52 55 47.8 Z'),
        fill('violet', 'M55.2 46.8 C57.8 41.8 61.4 38.4 63 39.6 C63.4 41.6 60 45 55.8 47.2 Z M55.4 47.4 C59.4 49 62.4 52 61.6 53.8 C60.2 54.8 57.2 51.8 55.2 48 Z', 0.9),
        fill('violetDark', 'M55.6 46 C53.2 45.4 50.6 46 49.6 47.8 C49 49.6 50.2 51.4 52.4 51.6 C54.4 51.8 55.8 50.4 56.2 48.8 C56.4 47.8 56.2 46.8 55.6 46 Z'),
        fill('yellow', 'M51 47.8 C52 47 53.6 46.8 54.6 47.4 C54 48.4 52.6 49 51 48.6 Z'),
        line('violetLight', 0.7, 'M50.2 49.6 C51.4 50.4 53 50.6 54.6 50', 0.6),
        fill('cyan', blade(30.4, 23, 16, 15.4, 5.2), 0.5),
        line('forest', 1.5, 'M36.8 32.4 L40.6 35.8 L42.6 36.6 M33.2 33.6 L34.2 38.6 L33 42.6 M28 33.2 L27.2 38.2'),
        fill('forest', 'M27.4 37.6 C26 39.6 24.4 42.2 23.4 44.6 C24.6 45.8 26.4 45.8 27.6 44.6 C28.2 42.4 28.6 40 28.6 38 Z'),
        fill('jungle', tilt(19.4, 30.6, 8.6, 6.6, -8)),
        fill('mint', 'M11.4 29 C12.6 26.2 15.8 24.4 19.4 24.2 C22.6 24.2 25.4 25 27 26.4 C23.6 25.8 20 26 16.6 27 C14.6 27.6 12.8 28.2 11.4 29 Z', 0.85),
        fill('shine', 'M15 26.8 C16.2 26 17.8 25.6 19.4 25.6 C18 26.2 16.6 26.8 15.2 27.6 Z', 0.7),
        line('forest', 0.8, [3.8, 0.2, -3.4].map((a) => { const h = r1(6.6 * Math.sqrt(1 - (a / 8.6) ** 2) - 0.6); return `M${at(19.4, 30.6, -8, a, -h)} Q${at(19.4, 30.6, -8, a - 1.6, 0)} ${at(19.4, 30.6, -8, a, h)}`; }).join(' '), 0.55),
        fill('ink', 'M11 34 C14 38.2 23.8 39.2 28 34 C26.8 37.4 23.4 38.6 19.6 38.4 C15.4 38.2 12.2 36.6 11 34 Z', 0.25),
        fill('jungle', artEllipse(31, 27.6, 6.6, 6.4)),
        fill('mint', 'M25 26.4 C25.6 23.4 28.4 21.2 31.4 21 C34.2 21 36.4 22.2 37.4 24 C33.8 22.8 29.4 23.6 25 26.4 Z', 0.85),
        fill('shine', 'M28 23.4 C29 22.6 30.6 22.2 32 22.2 C30.8 22.8 29.4 23.4 28.2 24.2 Z', 0.7),
        line('forest', 0.8, 'M27.4 28.4 L28.6 29.4 M30.8 26.6 L31.8 27.8 M34.4 27.2 L35.2 28.4 M29.4 31.4 L30.4 32.2', 0.55),
        fill('ink', 'M24.8 30.6 C27.2 34.4 34.4 35.6 37.8 31.2 C36.6 33.8 34 34.4 31 34.4 C28 34.4 25.8 33 24.8 30.6 Z', 0.25),
        fill('cyan', blade(32, 22, 12.4, 8.6, 8), 0.6),
        line('forest', 0.6, bladeVeins(32, 22, 12.4, 8.6, 8), 0.55),
        line('chitinLight', 1.3, 'M43.4 34.2 C45.6 37.4 48.2 40.4 51.6 47.6'),
        line('chitinDark', 0.7, 'M43.8 35.4 C45.6 37.8 47.4 40.2 49.2 43.4', 0.6),
        line('jungle', 1.8, 'M35.6 32.6 L39.4 35.4 L41.4 35.8'),
        line('jungle', 1.8, 'M32 33.8 L32.6 38.2 L31.2 42'),
        line('jungle', 2.6, 'M27.4 33.4 L26.6 38.4'),
        fill('jungle', 'M26.4 37.4 C24.6 39.8 22.4 43 21.2 45.8 C22.6 47.4 25 47.4 26.4 46 C27 43.4 27.8 40.6 28.2 38.2 Z'),
        fill('mint', 'M25.6 38.8 C24.2 40.8 22.8 43 22 45 C23.4 43.4 24.8 41.2 26.2 39.4 Z', 0.85),
        fill('ink', 'M27.6 40.6 C27.2 42.6 26.8 44.4 26.4 46 C25 47.4 23 47.4 21.8 46.4 C24.2 46.2 26 44 27.6 40.6 Z', 0.22),
        line('forest', 1.3, 'M41.4 35.8 L43 35.4 M31.2 42 L30 43.6 M22 46.8 L20.6 49.2 L19.2 49.8'),
        fill('jungle', tilt(40.8, 28.8, 4.2, 5.4, -14)),
        fill('mint', 'M36.8 26.2 C37.6 24.2 39.4 23.2 41.4 23.4 C39.8 24.2 38.2 25.2 36.8 26.2 Z', 0.85),
        fill('black', tilt(41.2, 28, 2.1, 3.6, -14)),
        fill('ink', 'M37.2 31.4 C38.6 33.8 41.6 34.8 44.2 33.4 C43.2 35 41.6 35.4 40 35 C38.6 34.6 37.6 33.2 37.2 31.4 Z', 0.22),
        fill('cream', 'M43.8 29.6 C45 30.2 45.4 31.8 44.6 33 L43.2 32.4 C43.4 31.4 43.6 30.4 43.8 29.6 Z'),
        dot('ink', 41.6, 27, 1.2),
        dot('shine', 42, 26.5, 0.45, 0.9),
        line('forest', 1, 'M40 23.8 L40.6 20.4 L44.4 19.2 C46 19 47.2 19.8 47.6 21'),
        line('forest', 1.1, 'M41.6 24 L43 20.8 L47.4 20.2 C49 20.2 50.2 21 50.6 22.4'),
      ],
    },
  ];
}
