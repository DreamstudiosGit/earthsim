/* =============================================================================
 * SimEarth 2.0 — species portraits: Landgliederfüßer (landArthropods)
 * -----------------------------------------------------------------------------
 * Myriapods, arachnids and woodlice in the style of the reference set (see
 * docs/oekosystem-2026-10/portraitstil.md). Side views facing right with feet
 * on y ≈ 57; the centipede, the mesothele spider and the orb weaver are top
 * views centred on y ≈ 32, like their map icons. Legs are round-capped lines,
 * far legs a shade darker than the near ones. The two myriapods are built
 * along a curved spine, so plates, rings and legs follow the bend of the body.
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

  /** Polyline through x,y pairs. */
  function poly(...p: number[]): string {
    let d = `M${r1(p[0])} ${r1(p[1])}`;
    for (let k = 2; k < p.length; k += 2) d += ` L${r1(p[k])} ${r1(p[k + 1])}`;
    return d;
  }

  /** The same points mirrored across y = 32: the far side of an animal seen from above. */
  const flip = (...p: number[]): number[] => p.map((v, k) => (k % 2 ? r1(64 - v) : v));

  /** An ellipse turned `deg` clockwise. */
  function tilt(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    const t = (deg * Math.PI) / 180;
    const a = `${r1(cx - rx * Math.cos(t))} ${r1(cy - rx * Math.sin(t))}`;
    const b = `${r1(cx + rx * Math.cos(t))} ${r1(cy + rx * Math.sin(t))}`;
    return `M${a} A${rx} ${ry} ${deg} 1 0 ${b} A${rx} ${ry} ${deg} 1 0 ${a} Z`;
  }

  /** A body segment from joint (x0, y0) to joint (x1, y1), `w` thick, overlapping its neighbours. */
  function seg(x0: number, y0: number, x1: number, y1: number, w: number): string {
    const len = Math.hypot(x1 - x0, y1 - y0);
    return tilt(r1((x0 + x1) / 2), r1((y0 + y1) / 2), r1(len / 2 + 0.7), w / 2, r1((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI));
  }

  /** The stretch of a straight line between fractions t0 and t1: a band on a leg. */
  function part(x0: number, y0: number, x1: number, y1: number, t0: number, t1: number): string {
    return poly(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0, x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1);
  }

  type Pt = readonly [number, number];
  /** A point on a spine with its unit tangent (towards the head) and up-normal. */
  interface Frame { readonly p: Pt; readonly t: Pt; readonly u: Pt }

  function frameOf(p: Pt, a: Pt, b: Pt): Frame {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t: Pt = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    return { p, t, u: [t[1], -t[0]] };
  }

  /** The frame at every point of a spine listed tail to head. */
  const frames = (sp: readonly Pt[]): Frame[] => sp.map((p, k) => frameOf(p, sp[Math.max(0, k - 1)], sp[Math.min(sp.length - 1, k + 1)]));

  /** Frames between the spine points, at fractions `hs` of each stretch: where the legs sit. */
  const between = (sp: readonly Pt[], hs: readonly number[]): Frame[] => sp.slice(0, -1).flatMap((a, k) => hs.map((h) =>
    frameOf([a[0] + (sp[k + 1][0] - a[0]) * h, a[1] + (sp[k + 1][1] - a[1]) * h], a, sp[k + 1])));

  /** `f` moved `a` along the tangent and `b` along the up-normal. */
  const off = (f: Frame, a: number, b: number): Pt => [r1(f.p[0] + f.t[0] * a + f.u[0] * b), r1(f.p[1] + f.t[1] * a + f.u[1] * b)];
  const pt = (p: Pt): string => `${p[0]} ${p[1]}`;
  const deg = (f: Frame): number => r1((Math.atan2(f.t[1], f.t[0]) * 180) / Math.PI);

  /** Smooth open path through points: quadratic curves through the midpoints. */
  function through(pts: readonly Pt[], move = true): string {
    const mid = (a: Pt, b: Pt): string => `${r1((a[0] + b[0]) / 2)} ${r1((a[1] + b[1]) / 2)}`;
    let d = `${move ? 'M' : 'L'}${pt(pts[0])}`;
    for (let k = 1; k < pts.length - 1; k++) d += ` Q${pt(pts[k])} ${mid(pts[k], pts[k + 1])}`;
    return `${d} L${pt(pts[pts.length - 1])}`;
  }

  /** A tube of radius `rad` round a spine, with round ends. */
  function tube(fr: readonly Frame[], rad: number): string {
    const top = fr.map((f) => off(f, 0, rad));
    const bot = fr.map((f) => off(f, 0, -rad)).reverse();
    return `${through(top)} A${rad} ${rad} 0 0 1 ${pt(bot[0])} ${through(bot, false)} A${rad} ${rad} 0 0 1 ${pt(top[0])} Z`;
  }

  /** A trunk plate on frame `f`: a rectangle 2a long and 2h wide, its corners rounded by c, shifted `s` forward. */
  function plate(f: Frame, a: number, h: number, c: number, s = 0): string {
    const q = (x: number, y: number): string => pt(off(f, s + x, y));
    return `M${q(-a + c, h)} L${q(a - c, h)} Q${q(a, h)} ${q(a, h - c)} L${q(a, -h + c)} Q${q(a, -h)} ${q(a - c, -h)} `
      + `L${q(-a + c, -h)} Q${q(-a, -h)} ${q(-a, -h + c)} L${q(-a, h - c)} Q${q(-a, h)} ${q(-a + c, h)} Z`;
  }

  /** The band between offsets b0 and b1 off a spine. */
  const strip = (fr: readonly Frame[], b0: number, b1: number): string =>
    `${through(fr.map((f) => off(f, 0, b1)))} ${through(fr.map((f) => off(f, 0, b0)).reverse(), false)} Z`;

  // Millipede: a ringed tube lying on the ground, its fore-body raised; two leg pairs per ring.
  const MILLI_SPINE: Pt[] = [[6, 49.4], [9.6, 48.9], [13.2, 48.6], [16.8, 48.4], [20.4, 48.3], [24, 48.2], [27.6, 48], [31.2, 47.6],
    [34.6, 46.7], [37.8, 45.2], [40.6, 43.2], [43, 40.8], [45, 38.2], [46.6, 35.4]];
  const MILLI = frames(MILLI_SPINE);
  const MILLI_LEGS = between(MILLI_SPINE, [0.25, 0.75]).slice(1);
  /** One millipede leg: down to the ground under the lying trunk, dangling forward under the raised part. */
  function milliLeg(f: Frame, k: number, far: boolean): string {
    const sw = 0.9 * Math.sin(k * 0.75);
    const a = far ? 1 : 0;
    const h = far ? -3.2 : -3.8;
    const b = off(f, a, h);
    if (b[1] > 49.5) {
      const g = far ? 56.4 : 57;
      return poly(b[0], b[1], b[0] + 0.6 + sw / 2, (b[1] + g) / 2 + 0.3, b[0] - 0.2 + sw, g);
    }
    const kn = off(f, a + 1.2 + sw * 0.3, h - 2.6);
    const ft = off(f, a + 2.8 + sw * 0.5, h - 4);
    return poly(b[0], b[1], kn[0], kn[1], ft[0], ft[1]);
  }

  // Centipede seen from above: eleven plates along a flat S, a long leg pair on each but the last.
  const CENT_SPINE: Pt[] = Array.from({ length: 11 }, (_, k): Pt => [9 + 4 * k, r1(32 + 3 * Math.cos((Math.PI * k) / 10))]);
  const CENT = frames(CENT_SPINE);
  const centHw = (k: number): number => r1(2.5 + 0.8 * Math.sin((Math.PI * (k + 1)) / 12));
  /** Base, knee and foot of the leg on plate k, on the upper (1) or lower (-1) side, in a walking rhythm. */
  function centLeg(k: number, side: number): number[] {
    const f = CENT[k];
    const a = -0.6 + k / 10 + side * 0.22 * Math.sin(k * 1.7);
    const dir = (g: number): Pt => [side * f.u[0] * Math.cos(g) + f.t[0] * Math.sin(g), side * f.u[1] * Math.cos(g) + f.t[1] * Math.sin(g)];
    const b = off(f, 0, side * (centHw(k) - 0.8));
    const d1 = dir(a);
    const d2 = dir(a - 0.6);
    const kx = b[0] + d1[0] * 4.4;
    const ky = b[1] + d1[1] * 4.4;
    return [b[0], b[1], r1(kx), r1(ky), r1(kx + d2[0] * 5.6), r1(ky + d2[1] * 5.6)];
  }
  const CENT_LEGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Orb web: twelve radials, a spiral of seven turns and a frame, centred on (32, 32).
  const webAt = (d: number, rad: number): number[] => [32 + rad * Math.cos((d * Math.PI) / 180), 32 + rad * Math.sin((d * Math.PI) / 180)];
  const WEB_RADIALS = Array.from({ length: 12 }, (_, k) => poly(...webAt(30 * k + 15, 3), ...webAt(30 * k + 15, 30.5))).join(' ');
  const WEB_SPIRAL = poly(...Array.from({ length: 85 }, (_, k) => webAt(30 * k + 15, 6 + k * 0.29)).flat());
  const WEB_FRAME = poly(...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].flatMap((k) => webAt(30 * k + 15, 30.6)));

  SPECIES_PORTRAITS[Life.LandArthropod] = [
    // 1 · Tausendfüßer — Kampecaris: a glossy ringed trunk on a carpet of short legs, fore-body raised to feel ahead.
    {
      name: 'Tausendfüßer', art: [
        ground('furDeep', 3, 62),
        line('sandDark', 1, MILLI_LEGS.map((f, k) => milliLeg(f, k, true)).join(' ')),
        line('furDeep', 1.1, 'M51 31.6 C52.6 28.2 55.2 26.6 57.8 27 L61.2 29.8'),
        fill('furDark', tube(MILLI, 4.3)),
        fill('fur', strip(MILLI.slice(0, -1), 1.7, 3.9)),
        fill('ink', strip(MILLI, -1.9, -4.3), 0.22),
        ...MILLI.slice(1).map((f) => line('furDeep', 0.8, `M${pt(off(f, 0, 3.3))} C${pt(off(f, 1.3, 1.2))} ${pt(off(f, 1.3, -1.2))} ${pt(off(f, 0, -3.5))}`, 0.6)),
        line('furPale', 0.9, MILLI.slice(1, -1).map((f) => `M${pt(off(f, 0.7, 3))} L${pt(off(f, 2.1, 3.1))}`).join(' '), 0.7),
        fill('furDeep', MILLI.slice(1, -1).map((f) => { const c = off(f, 1.9, -0.6); return artCircle(c[0], c[1], 0.45); }).join(' '), 0.6),
        line('sand', 1.1, MILLI_LEGS.map((f, k) => milliLeg(f, k, false)).join(' ')),
        fill('bark', tilt(49.2, 34.2, 3.7, 3.2, 50)),
        fill('fur', 'M46.8 32.6 C47.2 30.8 48.8 30 50.4 30.4 C49 31 47.8 31.6 46.8 32.6 Z'),
        fill('ink', 'M48.4 37.2 C50 37.8 51.8 37 52.4 35.4 C52.4 37.4 51 38.6 49.4 38.4 Z', 0.22),
        fill('furDeep', 'M50.6 37.4 L52.8 36.4 L53 38 L51.4 38.6 Z'),
        dot('ink', 49.8, 32.6, 1.2),
        dot('shine', 50.2, 32.2, 0.45, 0.9),
        line('bark', 1.2, 'M51.6 33 C54 30.8 57 30.4 59 31.8 L62 36.4'),
        dot('bark', 62, 36.6, 0.6),
      ],
    },
    // 2 · Hundertfüßer — seen from above: flat plates, one long leg pair each, poison claws, long antennae.
    {
      name: 'Hundertfüßer', art: [
        line('chitin', 1.1, CENT_LEGS.map((k) => poly(...centLeg(k, 1))).join(' ')),
        line('chitinDark', 1.1, CENT_LEGS.map((k) => poly(...centLeg(k, -1))).join(' ')),
        line('yellow', 1, CENT_LEGS.map((k) => { const p = centLeg(k, 1); return part(p[2], p[3], p[4], p[5], 0.7, 1); }).join(' ')),
        line('yellow', 1, CENT_LEGS.map((k) => { const p = centLeg(k, -1); return part(p[2], p[3], p[4], p[5], 0.7, 1); }).join(' ')),
        line('chitin', 1.6, poly(...off(CENT[0], -0.4, 1.8), ...off(CENT[0], -3.6, 4), ...off(CENT[0], -6.2, 4.6))),
        line('chitinDark', 1.6, poly(...off(CENT[0], -0.4, -1.8), ...off(CENT[0], -3.6, -4), ...off(CENT[0], -6.2, -4.6))),
        fill('rust', CENT.map((f, k) => plate(f, 2.4, centHw(k), 1.5)).join(' ')),
        fill('orange', CENT.map((f, k) => plate(f, 1.8, r1(centHw(k) - 0.5), 1.1, 0.4)).join(' ')),
        fill('orangeLight', CENT.map((f, k) => { const c = off(f, 0.2, centHw(k) * 0.42); return tilt(c[0], c[1], 1.6, r1(centHw(k) * 0.3), deg(f)); }).join(' ')),
        fill('ink', CENT.map((f, k) => { const c = off(f, 0.3, -centHw(k) * 0.5); return tilt(c[0], c[1], 1.9, r1(centHw(k) * 0.36), deg(f)); }).join(' '), 0.22),
        line('rustDark', 0.8, CENT.map((f, k) => `M${pt(off(f, -1.3, centHw(k) * 0.7))} Q${pt(off(f, -1.9, 0))} ${pt(off(f, -1.3, -centHw(k) * 0.7))}`).join(' '), 0.6),
        line('rustDark', 0.7, through(CENT.map((f) => off(f, 0, 0))), 0.5),
        fill('chitinLight', CENT_LEGS.flatMap((k) => [centLeg(k, 1), centLeg(k, -1)]).map((p) => artCircle(p[2], p[3], 0.6)).join(' ')),
        fill('rust', artEllipse(53.4, 29, 3.8, 3.6)),
        fill('coral', 'M50.4 27.4 C50.8 25.6 52.4 25 54.4 25.2 C52.6 25.8 51.4 26.6 50.4 27.4 Z'),
        fill('ink', 'M51 31.4 C52.6 32.4 55 32.4 56.6 30.8 C56 32.4 54.4 32.8 53 32.6 C52 32.4 51.4 32 51 31.4 Z', 0.22),
        line('rustDark', 1.6, 'M54.8 25.8 C57.8 24.8 60 26 60.2 28.2'),
        line('rustDark', 1.6, 'M54.8 32.2 C57.8 33.2 60 32 60.2 29.8'),
        dot('black', 60.1, 28.3, 0.7),
        dot('black', 60.1, 29.7, 0.7),
        line('rust', 1.1, 'M56 27.4 C58.4 24.8 59.6 20 60.4 11.6'),
        line('rust', 1.1, 'M56 30.6 C58.6 33.4 60 39 61 47.6'),
        line('rustDark', 0.7, 'M58.4 23.4 L59.4 23.2 M59.6 18.4 L60.4 18.4 M59 36.6 L60 36.4 M59.8 41.6 L60.6 41.6', 0.6),
        dot('ink', 54.6, 26.8, 1.1),
        dot('ink', 54.6, 31.2, 1.1),
        dot('shine', 54.9, 26.4, 0.4, 0.9),
        dot('shine', 54.9, 30.8, 0.4, 0.9),
      ],
    },
    // 3 · Weberknechte — a small round body slung between eight very long, high-kneed legs.
    {
      name: 'Weberknechte', art: [
        ground('furDeep', 2, 62),
        line('leafDark', 0.9, 'M27 57.4 L26 53.6', 0.45),
        line('leafDark', 0.9, 'M28.6 57.6 L29.6 54', 0.45),
        line('furDeep', 1.1, 'M37.6 35 C40.6 28 44.6 21.6 48.6 18.6 C52 24 56.6 42 59.6 56.4'),
        line('furDeep', 1.1, 'M34.4 34.8 C35.6 25 36.4 14 38.4 7.6 C44.4 10 48.6 30 50.2 56.4'),
        line('furDeep', 1.1, 'M31 34.8 C31 26 30.6 18 29.6 11.6 C25.6 14 21.6 36 20.6 56.4'),
        line('furDeep', 1.1, 'M29 34.6 C26.6 25 22.4 13.6 12.6 9 C9 15 7.8 40 8 56.4'),
        fill('tan', 'M24.5 34.5 C24.5 29.5 28.5 27.6 33 27.6 C37.6 27.6 40.8 29.6 40.6 33.4 C40.4 36.6 37.6 38.4 32.8 38.4 C28 38.4 24.5 37.6 24.5 34.5 Z'),
        fill('furLight', 'M25.6 32.6 C26.4 29.8 29.4 28.4 33 28.4 C30 29.4 27.6 30.8 25.6 32.6 Z'),
        fill('fur', 'M27.6 30.6 C30 29 34 28.6 37.4 29.6 C36.4 31.6 33.4 32.8 30.4 32.6 C29 32.4 28 31.6 27.6 30.6 Z'),
        fill('creamDark', 'M27 37.2 C30 38.2 35.4 38.2 39 36.6 C37 38.2 34.6 38.6 32.6 38.6 C30 38.6 28.2 38.2 27 37.2 Z'),
        fill('ink', 'M25 35.4 C28 37.4 35 37.8 40.2 35 C39 37.6 36 38.6 32.8 38.6 C28.6 38.6 25.8 37.6 25 35.4 Z', 0.22),
        line('furDark', 0.8, 'M28 32.6 C28.4 34 28.4 35.4 28 36.8', 0.55),
        line('furDark', 0.8, 'M31 33.2 C31.4 34.6 31.4 36 31 37.4', 0.55),
        line('furDark', 0.8, 'M34 33.2 C34.4 34.6 34.4 36 34 37.4', 0.55),
        fill('tan', 'M33.8 28.4 C33.8 26 35 25 36.2 25.2 C37.4 25.4 37.8 26.6 37.4 28.6 Z'),
        dot('ink', 36, 26.8, 1.1),
        dot('shine', 36.4, 26.4, 0.4, 0.9),
        dot('furDark', 40.6, 35.6, 0.9),
        line('tan', 1.1, 'M40.2 36.2 C41.6 36.6 42.4 37.8 42.6 39.4'),
        line('furDark', 1.3, 'M37 37 C39.5 30 42 23.5 44.5 19.5 C47.5 24 51.6 40 54.6 57'),
        line('furDark', 1.3, 'M35.4 37.6 C38 28 41.6 15 46.4 9.6 C53 14 59 33 62.4 51.6'),
        line('furDark', 1.3, 'M30.6 37.8 C28.6 30 26 22 23 17.6 C19.6 22 15.6 40 13.4 57'),
        line('furDark', 1.3, 'M28.6 37.4 C26 28 22.6 17 18.6 12 C12.6 18 6 38 3.4 57'),
        dot('furDeep', 44.5, 19.6, 1),
        dot('furDeep', 46.4, 9.7, 1),
        dot('furDeep', 23, 17.7, 1),
        dot('furDeep', 18.6, 12.1, 1),
      ],
    },
    // 4 · Skorpione — low armoured body, big pincers forward, the segmented tail arched over the back.
    {
      name: 'Skorpione', art: [
        ground('sandDark', 6, 62),
        line('chitinDark', 1.6, 'M42 48 L47.6 45 L51.6 56.4 M38 48.4 L42.6 45.6 L45.4 56.4 M33.6 48.6 L35 45.6 L35.6 56.4 M29 48.6 L28.4 45.6 L27 56.4'),
        line('chitinDark', 2.4, 'M43.6 44.6 L48.4 38.8 L52.4 40.4'),
        fill('chitinDark', 'M51.6 40.6 C51.4 37.6 54.4 36 57.4 36.6 L62.6 37.4 C61 38 59.6 38.4 58.6 39 L62 40.2 C60 41.6 56.4 42.6 53.6 42.2 C52.4 42 51.8 41.4 51.6 40.6 Z'),
        fill('chitin', seg(18.6, 46, 14.6, 43.4, 5.6)),
        fill('chitin', seg(14.6, 43.4, 11.4, 38.2, 5.2)),
        fill('chitin', seg(11.4, 38.2, 10.6, 32, 5)),
        fill('chitin', seg(10.6, 32, 12.2, 26, 4.8)),
        fill('chitin', seg(12.2, 26, 16.4, 21.4, 4.6)),
        fill('chitinLight', [seg(16.2, 44.6, 14, 43.2, 1.6), seg(12.4, 41.6, 11, 38.8, 1.5), seg(9.8, 35.6, 9.6, 32.6, 1.4), seg(10.4, 29.4, 11.6, 26.6, 1.4), seg(13.2, 23.2, 15.6, 20.8, 1.3)].join(' ')),
        line('chitinDark', 0.8, 'M16.6 47.2 L18.4 44.6 M13 42.6 L15.4 40.8 M12.4 35.8 L14.6 35.6 M13.6 29.8 L15.6 30.8 M16.6 24.6 L18.2 26.2', 0.6),
        fill('rustDark', 'M22.4 18 C25.6 18.2 27.4 20.4 27 24 C26 22.2 24.4 21.4 22.6 21.4 Z'),
        fill('rust', tilt(20.4, 19.6, 3.8, 2.8, 4)),
        fill('coral', 'M17.6 18.8 C18.6 17.6 20.6 17.2 22.4 17.6 C20.6 18 19 18.4 17.6 18.8 Z'),
        fill('ink', 'M17.8 21 C19.6 22.4 22.4 22.4 24 21 C23.2 22.6 21 23.2 19.4 22.8 C18.6 22.6 18.1 21.9 17.8 21 Z', 0.22),
        fill('chitin', 'M18 47.6 C18 44.2 21 42.6 26 42.4 L38 42.2 C42.6 42.2 45.6 43.6 46.2 46.4 C46.6 48.8 45 50.4 41.6 50.8 L24 51 C20.4 51 18 49.8 18 47.6 Z'),
        fill('chitinLight', 'M19.6 45.6 C21 43.8 24 43.2 28 43.1 L38 43 C41.6 43 44 43.8 45 45 C40 44.6 32 44.6 26 45 C23.4 45.2 21.4 45.4 19.6 45.6 Z'),
        fill('ink', 'M18.8 48.8 C22 50 32 50.2 45.6 48.4 C44.8 49.8 43.4 50.6 41.6 50.8 L24 51 C21.4 51 19.6 50.2 18.8 48.8 Z', 0.22),
        ...[22.4, 25.6, 28.8, 32, 35.2].map((x) => line('chitinDark', 0.8, `M${x} 43.6 C${r1(x + 0.9)} 45.6 ${r1(x + 0.9)} 47.6 ${x} 49.8`, 0.6)),
        line('chitinDark', 0.8, 'M38.6 43.4 C40.6 44 41.6 45.4 41.4 47.4', 0.6),
        line('chitin', 1.8, 'M40.6 49 L44.6 46.6 L47.6 57 M37 49.6 L39.6 47 L41.4 57 M33 50 L32 47.6 L30.6 57 M29.4 50 L26.6 47.8 L23.6 57'),
        line('chitin', 2.8, 'M44.8 47.2 L49.6 43.6 L52.8 46'),
        fill('chitin', 'M52 46.6 C51.6 43.6 54.4 42 57.6 42.4 C59.6 42.6 61 43.4 62.8 44.6 C61.2 45 60 45.4 59.2 46 L62.4 48.6 C60.4 49.8 56.6 50.8 54 50 C52.8 49.4 52.2 48 52 46.6 Z'),
        fill('chitinLight', 'M53.2 45 C54 43.6 56 43 58 43.3 C56.2 43.8 54.6 44.4 53.2 45 Z'),
        line('chitinDark', 0.8, 'M58.6 45.6 L62 44.8 M58.6 46.6 L61.6 48.2', 0.7),
        dot('ink', 41.6, 43.6, 1.1),
        dot('shine', 41.9, 43.2, 0.4, 0.9),
        dot('ink', 44.6, 44.4, 0.6),
      ],
    },
    // 5 · Spinnen — a mesothele from above: armoured abdominal plates, eight legs, a silk thread behind.
    {
      name: 'Spinnen', art: [
        line('white', 0.8, 'M12.6 32.6 C9.6 34 8.6 37.6 6 40.6 C4.6 42.4 3 43.4 1.6 44', 0.45),
        ...[
          [44, 27.6, 49.4, 19, 61, 12.6],
          [41.8, 26.6, 44.6, 15.4, 52.4, 4.6],
          [39, 26.6, 34.4, 16, 27.4, 4.4],
          [36.8, 27.6, 27.8, 19.4, 8.4, 13.4],
        ].flatMap((p) => [
          line('furDark', 2.2, poly(...p.slice(0, 4))),
          line('furDark', 1.6, poly(...p.slice(2))),
          line('furDark', 2.2, poly(...flip(...p.slice(0, 4)))),
          line('furDark', 1.6, poly(...flip(...p.slice(2)))),
        ]),
        line('fur', 1.6, [
          [49.4, 19], [44.6, 15.4], [34.4, 16], [27.8, 19.4],
        ].flatMap(([x, y]) => [poly(x - 0.4, y + 0.4, x + 0.4, y - 0.4), poly(...flip(x - 0.4, y + 0.4, x + 0.4, y - 0.4))]).join(' '), 0.8),
        line('furDark', 1.5, 'M46.6 28.6 L50.6 25.8 L54.2 26.6 M46.6 35.4 L50.6 38.2 L54.2 37.4'),
        fill('furDark', 'M12.4 32 C12.4 26.6 17 23.4 23 23.4 C29 23.4 34.2 26.6 34.2 32 C34.2 37.4 29 40.6 23 40.6 C17 40.6 12.4 37.4 12.4 32 Z'),
        fill('fur', 'M14 30 C15.4 26.6 19 24.6 23.4 24.6 C27.6 24.6 31 26.2 32.6 28.6 C28 27 22.4 26.8 18 28 C16.4 28.6 15 29.2 14 30 Z'),
        ...[16, 19.2, 22.4, 25.6, 28.8].map((x) => line('furDeep', 0.9, `M${x} ${x < 20 ? 26.4 : 25.2} C${r1(x - 1.2)} 29.4 ${r1(x - 1.2)} 34.6 ${x} ${x < 20 ? 37.6 : 38.8}`, 0.65)),
        fill('ink', 'M13 34 C15 37.6 19 39.4 23 39.4 C28 39.4 32.4 37.4 33.8 33.8 C33.6 37.8 28.8 40.6 23 40.6 C17.6 40.6 13.4 37.8 13 34 Z', 0.22),
        fill('furDeep', 'M33 30.4 L36 30.6 L36 33.4 L33 33.6 Z'),
        fill('furDark', 'M34 32 C34 27.6 37 25.4 41 25.4 C45 25.4 47.6 27.8 47.6 32 C47.6 36.2 45 38.6 41 38.6 C37 38.6 34 36.4 34 32 Z'),
        fill('fur', 'M35.2 30.4 C35.8 27.6 38.2 26.4 41 26.4 C43.8 26.4 45.6 27.6 46.4 29.4 C43 28 38.6 28.4 35.2 30.4 Z'),
        line('furDeep', 0.8, 'M39.4 32 L36 29.4 M39.4 32 L36 34.6 M39.4 32 L42.6 28.6 M39.4 32 L42.6 35.4', 0.55),
        fill('ink', 'M34.6 33.6 C36 36.8 39 37.6 41.4 37.6 C44 37.6 46 36.4 47.2 34.4 C46.6 37 44.2 38.6 41 38.6 C37.6 38.6 35 36.6 34.6 33.6 Z', 0.22),
        fill('furDeep', 'M47 30.2 C48.6 29.4 50.6 29.8 50.8 31.2 L50.6 32.8 C50.2 34.2 48.4 34.6 47 33.8 Z'),
        line('fur', 0.7, 'M48.4 30.6 L50.2 31.2 M48.4 33.4 L50.2 32.8', 0.55),
        dot('ink', 45.6, 30.6, 1.1),
        dot('ink', 45.6, 33.4, 1.1),
        dot('shine', 45.9, 30.2, 0.4, 0.9),
        dot('shine', 45.9, 33, 0.4, 0.9),
        dot('ink', 44.2, 29.4, 0.5),
        dot('ink', 44.2, 34.6, 0.5),
      ],
    },
    // 6 · Radnetzspinnen — a wasp-striped Argiope in the hub of its orb, legs held in an X.
    {
      name: 'Radnetzspinnen', art: [
        line('greyLight', 0.8, WEB_FRAME, 0.45),
        line('greyLight', 0.6, WEB_RADIALS, 0.45),
        line('greyLight', 0.6, WEB_SPIRAL, 0.4),
        line('white', 1, 'M44 26 L45.6 25.8 L45.4 23.8 L47.4 23.6 L47.2 21.6 L49.2 21.4 L49 19.4 L51 19.2 L50.8 17.2 L52.8 17 M44 38 L45.6 38.2 L45.4 40.2 L47.4 40.4 L47.2 42.4 L49.2 42.6 L49 44.6 L51 44.8 L50.8 46.8 L52.8 47 M20 26 L18.4 25.8 L18.6 23.8 L16.6 23.6 L16.8 21.6 L14.8 21.4 L15 19.4 L13 19.2 L13.2 17.2 L11.2 17 M20 38 L18.4 38.2 L18.6 40.2 L16.6 40.4 L16.8 42.4 L14.8 42.6 L15 44.6 L13 44.8 L13.2 46.8 L11.2 47', 0.45),
        ...[
          [42.6, 29, 48.6, 21.6, 59.4, 9.6],
          [41, 28.4, 46.4, 20.6, 56.4, 8],
          [38.6, 28.8, 34.6, 22.4, 15, 10.4],
          [37.4, 29.6, 32, 23.8, 10.6, 11.6],
        ].flatMap((p) => [
          line('black', 1.7, poly(...p)),
          line('black', 1.7, poly(...flip(...p))),
        ]),
        line('chitinLight', 1.7, [
          [42.6, 29, 48.6, 21.6, 59.4, 9.6],
          [41, 28.4, 46.4, 20.6, 56.4, 8],
          [38.6, 28.8, 34.6, 22.4, 15, 10.4],
          [37.4, 29.6, 32, 23.8, 10.6, 11.6],
        ].flatMap((p) => [p, flip(...p)]).flatMap((p) => [
          part(p[0], p[1], p[2], p[3], 0.35, 0.65),
          part(p[2], p[3], p[4], p[5], 0.2, 0.42),
          part(p[2], p[3], p[4], p[5], 0.62, 0.84),
        ]).join(' ')),
        fill('yellow', 'M35 32 C35 27.4 31 24.6 25 24.6 C18 24.6 12 27.6 10.6 32 C12 36.4 18 39.4 25 39.4 C31 39.4 35 36.6 35 32 Z'),
        fill('yellowPale', 'M13 30 C15 27 19.6 25.6 25 25.6 C29.6 25.6 32.8 27 34 29.2 C30 27.6 25.4 27.2 21 27.8 C17.6 28.2 15 29 13 30 Z'),
        fill('black', 'M28.4 25.2 C29.6 27.6 29.6 36.4 28.4 38.8 L26.2 39.2 C27.4 36.4 27.4 27.6 26.2 24.8 Z'),
        fill('black', 'M22.4 24.8 C23.6 27.6 23.8 36.4 22.4 39.2 L20 39 C21.2 36.2 21.2 27.8 20 25 Z'),
        fill('black', 'M16.6 26 C17.6 28.6 17.8 35.4 16.6 38 L14.6 37.2 C15.4 34.8 15.4 29.2 14.6 26.8 Z'),
        fill('white', 'M31.8 25.8 C33.6 27 34.6 29.4 34.6 32 C34.6 34.6 33.6 37 31.8 38.2 C32.4 36 32.4 28 31.8 25.8 Z'),
        fill('ink', 'M11.6 33.6 C14 37 19 38.6 25 38.6 C30 38.6 33.4 37 34.6 34.2 C34 37.6 30.4 39.4 25 39.4 C18 39.4 12.6 36.6 11.6 33.6 Z', 0.22),
        fill('greyLight', artEllipse(40, 32, 4.6, 4.2)),
        fill('white', 'M36.2 31 C36.6 29 38.4 28 40.4 28 C42.2 28 43.6 28.8 44.2 30.2 C41.6 29.4 38.6 29.6 36.2 31 Z'),
        line('grey', 0.7, 'M38.4 32 L36.6 30.4 M38.4 32 L36.6 33.6 M38.4 32 L40.6 29.6 M38.4 32 L40.6 34.4', 0.55),
        fill('ink', 'M36 33.6 C37.4 35.8 41.4 36.6 44.4 33.4 C44 35.4 42.2 36.2 40 36.2 C38 36.2 36.4 35.2 36 33.6 Z', 0.22),
        line('black', 1.3, 'M43.6 30.4 L46.4 29 L48 29.8 M43.6 33.6 L46.4 35 L48 34.2'),
        dot('ink', 43.4, 31, 1.1),
        dot('ink', 43.4, 33, 1.1),
        dot('shine', 43.7, 30.6, 0.4, 0.9),
        dot('shine', 43.7, 32.6, 0.4, 0.9),
      ],
    },
    // 7 · Landasseln — a domed woodlouse of overlapping plates on a fallen leaf.
    {
      name: 'Landasseln', art: [
        ground('furDeep', 3, 62),
        fill('kelp', 'M4 57 C10 53.6 22 53 34 53.6 C44 54.2 52 55.2 58 57.6 C50 59.6 38 60.4 26 60 C16 59.6 8 58.8 4 57 Z', 0.35),
        line('kelpDark', 0.8, 'M6 57 C20 56 40 56.2 56 57.6', 0.4),
        line('greyDeep', 1.3, [17, 22, 27, 32, 37, 42, 47].map((x) => poly(x + 1, 50.6, x + 2.2, 53.8, x + 1.4, 56.4)).join(' ')),
        line('grey', 1.4, 'M8.6 50.6 L4.6 51.8 M8.4 49.4 L4.4 48.2'),
        fill('grey', 'M7.6 52.2 C7.6 45.6 12.6 40.2 21 38.4 C29 36.8 39 37.4 45.6 41 C49.4 43.2 51.6 46.4 51.8 49.8 C51.8 51.6 51 52.6 49.4 52.6 L46 52.6 L44.6 51.6 L41.6 52.8 L39.6 51.6 L36.6 52.8 L34.6 51.6 L31.6 52.8 L29.6 51.6 L26.6 52.8 L24.6 51.6 L21.6 52.8 L19.6 51.8 L16.8 52.8 L14.6 52 L12 52.8 L9.4 52.8 C8.4 52.8 7.6 52.6 7.6 52.2 Z'),
        fill('greyLight', 'M9.6 46.2 C11.6 42.2 16 39.6 22 38.8 C29 37.8 37.4 38.2 43.6 40.8 C36 40.2 28 40.4 21.6 41.6 C16 42.6 12.4 44.4 9.6 46.2 Z'),
        ...[14.4, 19.4, 24.4, 29.4, 34.4, 39.4, 44.4].map((x, k) => line('greyLight', 1.2, `M${r1(x - 0.6)} ${k === 0 ? 41.8 : k > 5 ? 41.4 : 39.4} C${r1(x - 2)} 44 ${r1(x - 2)} 48.4 ${r1(x - 1.4)} 51.6`, 0.7)),
        ...[14.4, 19.4, 24.4, 29.4, 34.4, 39.4, 44.4].map((x, k) => line('greyDark', 0.8, `M${x} ${k === 0 ? 41.4 : k > 5 ? 41 : 39} C${r1(x - 1.4)} 44 ${r1(x - 1.4)} 48.4 ${r1(x - 0.8)} 51.6`, 0.6)),
        line('greyDark', 0.7, 'M11.4 44.6 C10.6 46.6 10.6 49 11 51.4 M9.4 47 C9 48.6 9 50 9.4 51.6', 0.55),
        fill('greyLight', [17, 22, 27, 32, 37, 42].map((x) => artCircle(x, 44.6, 0.6)).join(' '), 0.6),
        fill('ink', 'M8.4 50.6 C14 50 24 49.4 34 49.4 C42 49.4 48 49.8 51.6 50.6 C51.4 51.8 50.6 52.6 49.4 52.6 L9.4 52.8 C8.6 52.6 8.4 51.6 8.4 50.6 Z', 0.22),
        line('greyDark', 1.3, [15, 20, 25, 30, 35, 40, 45].map((x) => poly(x, 51.8, x + 1.2, 54.4, x + 0.6, 57)).join(' ')),
        line('greyDeep', 1.1, 'M50 45.6 C52.6 41.6 56 40.6 58.6 41.6 L61.6 46.8'),
        fill('grey', 'M45.4 42.2 C48.6 42 51.6 43.6 53.2 46.4 C54 48.2 53.6 50.4 52 51.4 C50.4 52.4 48 52.2 46.8 51.2 Z'),
        fill('greyLight', 'M46.4 43 C48.6 43 50.8 44 52 45.6 C50 45 48.2 44.6 46.4 44.6 Z'),
        fill('ink', 'M47 50 C48.6 51 51 51 52.6 49.8 C52.4 51.4 50.6 52.4 48.6 52.2 C47.8 51.8 47.2 51 47 50 Z', 0.22),
        line('greyDark', 1.3, 'M51.6 45.4 C54.4 42.4 57.6 42 59.6 43.6 L62.4 49.4'),
        line('greyDark', 0.9, 'M53 48 L55.4 47.4 L56.6 48.8'),
        dot('ink', 49.6, 45.6, 1.2),
        dot('shine', 50, 45.2, 0.45, 0.9),
      ],
    },
    // 8 · Springspinnen — a hairy jumping spider crouched to leap, front legs raised, huge forward eyes.
    {
      name: 'Springspinnen', art: [
        ground('furDeep', 4, 62),
        line('greyDeep', 2, 'M41.6 45 L48.6 47.4 L52.6 56.4 M36.6 45.4 L37.6 49.6 L35.6 56.4 M31 45 L26 48 L21.6 56.4'),
        line('greyDeep', 2.2, 'M46 42.4 C49.6 37.6 53.4 34.6 57.4 35 L61.6 39.6'),
        fill('black', 'M9 42 C8.8 36.6 13.6 33.4 19.4 33.6 C25.4 33.8 30 37 30.2 42 C30.4 47 25.6 50.6 19.4 50.4 C13.4 50.2 9.2 47.2 9 42 Z'),
        fill('greyDark', 'M10.4 39.6 C11.8 36.2 15.2 34.6 19.6 34.6 C23.6 34.8 26.8 36.2 28.4 38.4 C25 36.8 20.6 36.4 16.6 37.2 C14 37.8 12 38.6 10.4 39.6 Z'),
        line('greyDark', 0.8, 'M9.2 40.6 L7.8 40 M9.6 44.6 L8 45.2 M12 48.4 L10.8 49.6 M16.6 50.2 L16.2 51.6 M14 34.8 L13.2 33.4 M19.6 33.6 L19.6 32.2 M25 34.6 L25.8 33.2', 0.5),
        fill('white', 'M17.4 40.4 C18.6 39.2 21 39.2 22 40.6 C21.2 41.8 18.6 41.8 17.4 40.4 Z'),
        fill('white', artEllipse(13.6, 42.2, 1.3, 1.1)),
        fill('white', artEllipse(25.2, 42.4, 1.2, 1)),
        fill('white', artEllipse(15.6, 45.8, 1, 0.9)),
        fill('white', artEllipse(23.2, 46, 1, 0.9)),
        fill('ink', 'M10.4 45.4 C13.6 49 24.4 50 29.4 44.6 C28.4 48.6 24.2 50.6 19.4 50.4 C14.8 50.2 11.6 48.4 10.4 45.4 Z', 0.22),
        fill('black', 'M27.6 38.6 C27.6 33 31.6 29.4 38 29 L46 28.8 C49.6 28.8 51.6 31 51.8 34.6 L51.8 41.4 C51.6 45 49.4 46.8 45.6 46.8 L33.4 46.8 C29.6 46.6 27.6 44 27.6 38.6 Z'),
        fill('greyDark', 'M29.4 35 C30.6 31.6 33.8 30 38.4 29.8 L46 29.8 C47.8 29.8 49 30.4 49.8 31.4 C44 31 36.4 31.4 33 32.6 C31.4 33.2 30.2 34 29.4 35 Z'),
        fill('teal', 'M30.6 32.6 C33 31.4 37 31 41 31.2 C38 32 34 32.8 30.6 34 Z', 0.85),
        line('white', 0.7, 'M31.6 37.6 L33.4 37 M33 40.6 L35 40.4 M35.6 35.8 L37.4 35.4 M31.4 43.4 L33.4 43.6', 0.55),
        fill('ink', 'M28.4 42.6 C31 46 38 46.6 44 45.6 C42 46.6 38 46.8 33.4 46.8 C30.6 46.6 29 45 28.4 42.6 Z', 0.22),
        line('black', 2.2, 'M43.4 45.6 L48 48.6 L50.4 57 M38.6 46 L36.6 50 L32.6 57 M33.6 45.6 L27.6 48.6 L17.6 57'),
        line('white', 1.2, 'M47.4 48.2 L48.4 48.9 M36.9 49.4 L36.4 50.4 M28.6 48.2 L27.6 48.7', 0.85),
        fill('teal', tilt(44.6, 43.6, 2, 3.2, -8)),
        fill('teal', tilt(49.6, 43.4, 1.8, 3, 8)),
        fill('tealLight', 'M43.4 41.2 C44 40.4 45.2 40.4 45.6 41.4 C45 41.6 44.2 41.6 43.4 41.2 Z'),
        fill('tealLight', 'M48.6 41 C49.2 40.2 50.4 40.2 50.6 41.2 C50 41.4 49.2 41.4 48.6 41 Z'),
        line('black', 2.6, 'M44.6 42.6 C48.6 37.2 52.6 34.4 56.6 34.6 L61.2 39.6'),
        line('white', 1.3, 'M49.6 37 L50.8 36.2 M56.6 34.6 L57.6 35.4', 0.85),
        line('black', 1.6, 'M51.4 44.4 L53.8 45.2 L54.4 47.4'),
        line('white', 0.8, 'M53.4 47 L52.8 48.4 M54.4 47.6 L54.4 49 M55.2 47.2 L56 48.4', 0.8),
        dot('greyDeep', 49.6, 35.6, 3),
        dot('greyDeep', 44.4, 35.4, 3.4),
        dot('ink', 49.8, 35.6, 2.4),
        dot('ink', 44.6, 35.4, 2.8),
        dot('shine', 45.4, 34.4, 0.6, 0.9),
        dot('shine', 50.4, 34.7, 0.6, 0.9),
        dot('ink', 39.4, 32.8, 1.1),
        dot('shine', 39.7, 32.5, 0.4, 0.9),
      ],
    },
  ];
}
