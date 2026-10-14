/* =============================================================================
 * SimEarth 2.0 — plant art: Erste Landpflanzen (landPlants)
 * -----------------------------------------------------------------------------
 * Flat, forked liverwort-like thalli lying on wet ground, seen at a low angle:
 * rosettes of strap-shaped lobes in leaf green, the half of each lobe turned
 * away from the light shaded darker, on a soft smudge of wet soil.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  type Pt = readonly [number, number];

  /**
   * Closed path through screen points, always wound the same way, so several
   * of them joined in one `d` fill as one union (nonzero rule).
   */
  function poly(pts: readonly Pt[]): string {
    let area = 0;
    pts.forEach((p, k) => {
      const q = pts[(k + 1) % pts.length];
      area += p[0] * q[1] - q[0] * p[1];
    });
    const ordered = area < 0 ? [...pts].reverse() : pts;
    return `M${ordered.map(([x, y]) => `${r(x)} ${r(y)}`).join(' L')} Z`;
  }

  const DEG = Math.PI / 180;
  /** Lobe length to the fork, length of each fork branch, and the fork's half angle. */
  const L1 = 4.4;
  const L2 = 3.6;
  const FORK = 32;

  /**
   * One strap of thallus lying flat, from plane point a to b around the
   * rosette centre (cx, cy), half-width wa at a and wb at b, round ends. The
   * ground plane is squashed by `tilt` on screen. Returns the outline and the
   * half facing away from the upper-left light.
   */
  function strap(cx: number, cy: number, tilt: number, a: Pt, b: Pt, wa: number, wb: number): { all: string; shade: string } {
    const al = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const P = (c: Pt, w: number, ang: number): Pt => [cx + c[0] + w * Math.cos(ang), cy + (c[1] + w * Math.sin(ang)) * tilt];
    const arc = (c: Pt, w: number, from: number, to: number): Pt[] => {
      const n = 6;
      return Array.from({ length: n + 1 }, (_, k) => P(c, w, from + ((to - from) * k) / n));
    };
    const all = poly([...arc(b, wb, al + 90 * DEG, al - 90 * DEG), ...arc(a, wa, al - 90 * DEG, al - 270 * DEG)]);
    // +normal on screen is (-sin al, cos al * tilt); shade the side that points to the lower right.
    const s = -Math.sin(al) + Math.cos(al) * tilt > 0 ? 1 : -1;
    const shade = poly([P(a, 0, 0), P(a, wa, al + s * 90 * DEG), ...arc(b, wb, al + s * 90 * DEG, al), P(b, 0, 0)]);
    return { all, shade };
  }

  /**
   * A rosette of forked lobes centred on (cx, cy): one lobe per [angle,
   * length factor], the angle in plane degrees (0 = right, 90 = towards the
   * viewer); each lobe forks in two notched tips.
   */
  function thallus(cx: number, cy: number, size: number, lobes: readonly (readonly [number, number])[], body: PaletteKey, tilt = 0.6): ArtShape[] {
    const all: string[] = [];
    const shade: string[] = [];
    const add = (p: { all: string; shade: string }): void => {
      all.push(p.all);
      shade.push(p.shade);
    };
    for (const [deg, len] of lobes) {
      const t = deg * DEG;
      const k = size * len;
      const fork: Pt = [L1 * k * Math.cos(t), L1 * k * Math.sin(t)];
      add(strap(cx, cy, tilt, [0, 0], fork, 1.4 * size, 2.2 * size));
      for (const side of [-1, 1]) {
        const u = t + side * FORK * DEG;
        add(strap(cx, cy, tilt, fork, [fork[0] + L2 * k * Math.cos(u), fork[1] + L2 * k * Math.sin(u)], 2.1 * size, 1.9 * size));
      }
    }
    return [
      { f: body, d: all.join(' ') },
      { f: 'forest', d: shade.join(' '), o: 0.5 },
    ];
  }

  /** Wet soil under the thalli, one ellipse [cx, cy, rx, ry] each; translucent, so it casts no outline. */
  const wet = (...spots: readonly (readonly [number, number, number, number])[]): ArtShape =>
    ({ f: 'bark', d: spots.map(([cx, cy, rx, ry]) => artEllipse(cx, cy, rx, ry)).join(' '), o: 0.4 });

  FLORA_ART[Flora.LandPlants] = {
    // spärlich: A tiny flat lobed green thallus (liverwort-like, no stem) on wet ground.
    sparse: [wet([16, 25.5, 9, 3]), ...thallus(16, 23.5, 1.05, [[-170, 1], [-100, 0.85], [-30, 1], [35, 0.95], [110, 0.9]], 'leaf')],
    // dicht: A patchy green crust of overlapping lobes along a shoreline. Farben: dark green,
    //   olive, brown wet soil.
    dense: [
      wet([10, 11, 7, 3], [21.5, 15, 7, 3], [10, 22, 7, 3], [21.5, 26, 7, 3]),
      ...thallus(10, 9, 0.75, [[-160, 1], [-85, 0.85], [-20, 1], [50, 0.9], [125, 0.95]], 'olive'),
      ...thallus(21.5, 13.5, 0.78, [[-175, 0.95], [-105, 0.85], [-40, 1], [25, 0.9], [100, 0.9]], 'olive'),
      ...thallus(10, 20, 0.8, [[-150, 1], [-80, 0.9], [-10, 1], [60, 0.9], [130, 0.95]], 'leaf'),
      ...thallus(21, 24.5, 0.85, [[-170, 1], [-100, 0.85], [-30, 1], [35, 0.95], [110, 0.9]], 'leaf'),
    ],
    specialists: [],
  };
}
