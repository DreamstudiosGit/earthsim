/* =============================================================================
 * SimEarth 2.0 — plant art: Farne (ferns)
 * -----------------------------------------------------------------------------
 * Fresh `jungle` green ferns: pinnate fronds arching out of one rosette, lit on
 * their upper-left half and shaded on the right, with a brown fiddlehead.
 * Specialists: a palm-like tree fern in the rainforest, jointed horsetails with
 * whorled needles and pale cone-tipped shoots in the swamp.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  type Pt = readonly [number, number];

  /** Point and unit normal on the quadratic curve a→c→b at t. */
  function onCurve(a: Pt, c: Pt, b: Pt, t: number): { x: number; y: number; nx: number; ny: number } {
    const u = 1 - t;
    const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
    const y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
    const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
    const dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
    const len = Math.hypot(dx, dy) || 1;
    return { x, y, nx: -dy / len, ny: dx / len };
  }

  /**
   * A pinnate frond along the curve a→c→b, `w` units wide: a bare stipe, then a
   * blade with forward-swept pinnae. The half facing the upper left is lit with
   * opacity `litO`; `shadeO` darkens the other half (fronds on the right).
   */
  function frond(a: Pt, c: Pt, b: Pt, w: number, litO: number, shadeO = 0): ArtShape[] {
    const n = 14;
    const mid = onCurve(a, c, b, 0.5);
    const side = mid.nx * -0.6 + mid.ny * -0.8 >= 0 ? 1 : -1;
    const up: string[] = [];
    const down: string[] = [];
    const spine: string[] = [];
    for (let k = 2; k < n; k++) {
      const t = k / n;
      const tooth = k % 2 === 1;
      const p = onCurve(a, c, b, tooth ? Math.min(t + 0.03, 0.97) : t);
      const q = onCurve(a, c, b, t);
      const hw = (w / 2) * Math.sin(Math.PI * Math.pow((t - 0.1) / 0.9, 0.85)) * (tooth ? 1 : 0.4);
      up.push(`L${r(p.x + side * p.nx * hw)} ${r(p.y + side * p.ny * hw)}`);
      down.unshift(`L${r(p.x - side * p.nx * hw)} ${r(p.y - side * p.ny * hw)}`);
      spine.unshift(`L${r(q.x)} ${r(q.y)}`);
    }
    const s0 = onCurve(a, c, b, 1 / n);
    const start = `M${r(a[0])} ${r(a[1])} L${r(s0.x)} ${r(s0.y)}`;
    const tip = `L${r(b[0])} ${r(b[1])}`;
    const out: ArtShape[] = [
      { f: 'jungle', d: `${start} ${up.join(' ')} ${tip} ${down.join(' ')} Z` },
      { s: 'jungle', w: 1.6, d: `M${r(a[0])} ${r(a[1])} L${r(s0.x)} ${r(s0.y)}` },
      { f: 'leafLight', d: `${start} ${up.join(' ')} ${tip} ${spine.join(' ')} Z`, o: litO },
    ];
    if (shadeO > 0) out.push({ f: 'forest', d: `${start} ${spine.slice().reverse().join(' ')} ${tip} ${down.join(' ')} Z`, o: shadeO });
    return out;
  }

  /** A fern rosette standing on (x, y), `sx` wide and `sy` tall (1: the full tile): five arching fronds. */
  function rosette(x: number, y: number, sx: number, sy: number = sx): ArtShape[] {
    const P = (dx: number, dy: number): Pt => [x + dx * sx, y + dy * sy];
    const w = 4.8 * Math.max(sx, sy);
    return [
      ...frond(P(-0.6, 0), P(-11, -20), P(-14, -6), w, 0.35),
      ...frond(P(0.6, 0), P(11, -20), P(14, -6), w, 0.2, 0.35),
      ...frond(P(-0.3, 0), P(-7, -28), P(-10.5, -17), w, 0.35),
      ...frond(P(0.3, 0), P(7, -28), P(10.5, -17), w, 0.2, 0.35),
      ...frond(P(0, 0), P(-2, -23), P(3, -26), w, 0.35),
    ];
  }

  /** A fiddlehead: a stalk ending in a tight coil. */
  function fiddlehead(x: number, y: number, h: number): ArtShape {
    const cy = y - h;
    return {
      s: 'kelp', w: 2,
      d: `M${r(x)} ${r(y)} Q${r(x - 1)} ${r(cy + h * 0.5)} ${r(x)} ${r(cy)} A1.8 1.8 0 1 1 ${r(x + 3.6)} ${r(cy)} A1 1 0 0 1 ${r(x + 1.6)} ${r(cy)}`,
    };
  }

  /** A tree fern on (x, y): a slim trunk under a crown of arching, drooping fronds. */
  function treeFern(x: number, y: number): ArtShape[] {
    const C: Pt = [x - 0.5, 11];
    const at = (dx: number, dy: number): Pt => [C[0] + dx, C[1] + dy];
    return [
      { s: 'bark', w: 2.8, d: `M${r(x)} ${r(y)} Q${r(x + 1.2)} 20 ${r(C[0])} ${r(C[1] + 1)}` },
      ...frond(C, at(-7, -4), at(-11, 11), 4.6, 0.35),
      ...frond(C, at(7, -4), at(11, 11), 4.6, 0.2, 0.35),
      ...frond(C, at(-9, -9), at(-14, 3.5), 5, 0.35),
      ...frond(C, at(9, -9), at(14, 3.5), 5, 0.2, 0.35),
      ...frond(C, at(-3, -9), at(-7, -7.5), 4.4, 0.35),
      ...frond(C, at(3, -9), at(7, -7.5), 4.4, 0.2, 0.35),
    ];
  }

  /**
   * A horsetail stem on (x, y) up to `top`: jointed, with dark node rings, and
   * ascending whorls of needles from `whorlFrom` upwards, `reach` long at the
   * lowest node and shorter towards the tip.
   */
  function horsetail(x: number, y: number, top: number, whorlFrom: number, reach: number): ArtShape[] {
    const out: ArtShape[] = [];
    const rings: number[] = [];
    for (let ny = y - 4.2; ny > top + 2; ny -= 4.2) rings.push(ny);
    for (const ny of rings) {
      if (ny > whorlFrom) continue;
      const len = reach * (0.45 + 0.55 * (ny - top) / (whorlFrom - top));
      out.push({ s: 'jungle', w: 1.6, d: `M${r(x - len)} ${r(ny - len * 0.75)} L${r(x)} ${r(ny + 0.3)} L${r(x + len)} ${r(ny - len * 0.75)}` });
    }
    out.push({ s: 'jungle', w: 2.2, d: `M${r(x)} ${r(y)} L${r(x)} ${r(top)}` });
    for (const ny of rings) out.push({ s: 'forest', w: 1.6, d: `M${r(x - 1)} ${r(ny)} L${r(x + 1)} ${r(ny)}` });
    return out;
  }

  /** A fertile horsetail shoot on (x, y): a pale bare stem with dark rings and a cone on top. */
  function fertileShoot(x: number, y: number, top: number): ArtShape[] {
    const out: ArtShape[] = [{ s: 'tan', w: 2.2, d: `M${r(x)} ${r(y)} L${r(x)} ${r(top + 2)}` }];
    for (let ny = y - 3.6; ny > top + 3; ny -= 3.6) out.push({ s: 'forest', w: 1.6, d: `M${r(x - 1)} ${r(ny)} L${r(x + 1)} ${r(ny)}` });
    out.push({ f: 'kelp', d: artEllipse(x, top + 1, 1.6, 2.8) });
    return out;
  }

  FLORA_ART[Flora.Ferns] = {
    // spärlich: One fern: five arching fronds from one rosette and a curled brown fiddlehead.
    sparse: [...rosette(16, 29.5, 1), fiddlehead(18, 29.5, 8)],
    // dicht: Three overlapping rosettes forming a bushy patch. Farben: fresh green.
    dense: [...rosette(16, 21.5, 0.7, 0.65), ...rosette(9, 29.5, 0.5, 0.8), ...rosette(23, 30, 0.5, 0.8)],
    specialists: [
      // Baumfarne — Regenwald (Cyatheales (tree ferns)). A slim trunk topped by a crown of long
      //   arching fronds, like a palm made of fern leaves. Farben: dark brown trunk, green fronds.
      { name: 'Baumfarne', biome: Biome.Jungle, art: treeFern(16.5, 30) },
      // Schachtelhalme — Sumpf (Equisetum (horsetails, monilophytes)). Two straight jointed stems
      //   with whorls of needles at the nodes, two pale fertile shoots with cones. Farben: green
      //   with dark node rings, tan shoots, brown cones.
      {
        name: 'Schachtelhalme', biome: Biome.Swamp, art: [
          ...horsetail(10, 30, 3.5, 18, 5), ...horsetail(21.5, 30, 7, 20, 4.6),
          ...fertileShoot(4, 30, 18.5), ...fertileShoot(28, 30, 21.5),
        ],
      },
    ],
  };
}
