/* =============================================================================
 * SimEarth 2.0 — plant art: Samenpflanzen (seedPlants)
 * -----------------------------------------------------------------------------
 * Early seed plants in olive green: a stocky seed fern whose drooping,
 * scalloped fronds carry golden seeds at their tips. Specialists: a cycad with
 * a vase of stiff spiky leaves around an orange cone in open land, and a low
 * Welwitschia with torn strap leaves in the desert.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  const pt = (x: number, y: number): string => `${r(x)} ${r(y)}`;

  /**
   * A frond whose midrib bends from (x0, y0) over (cx, cy) to its tip (tx, ty):
   * a blade `w` units wide at most, its edges cut into `lobes` leaflets —
   * rounded, or saw-toothed when `spiky`. The half below the midrib is shaded;
   * `dark` shades the whole blade as well (the side away from the light).
   */
  function frond(
    x0: number, y0: number, cx: number, cy: number, tx: number, ty: number,
    w: number, lobes: number, fill: PaletteKey, shade: PaletteKey, spiky = false, dark = 0,
  ): ArtShape[] {
    const at = (t: number): [number, number, number, number] => {
      const u = 1 - t;
      const x = u * u * x0 + 2 * t * u * cx + t * t * tx;
      const y = u * u * y0 + 2 * t * u * cy + t * t * ty;
      const dx = 2 * u * (cx - x0) + 2 * t * (tx - cx);
      const dy = 2 * u * (cy - y0) + 2 * t * (ty - cy);
      const l = Math.hypot(dx, dy) || 1;
      let nx = -dy / l;
      let ny = dx / l;
      if (ny < 0) { nx = -nx; ny = -ny; }
      return [x, y, nx, ny];
    };
    const half = (t: number): number => w * 0.5 * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.5);
    const edge = (t: number, f: number, side: number): string => {
      const [x, y, nx, ny] = at(t);
      const h = t >= 1 ? 0 : half(t) * f * side;
      return pt(x + nx * h, y + ny * h);
    };
    let upper = '';
    let lower = '';
    let rib = '';
    for (let k = 0; k < lobes; k++) {
      const t0 = k / lobes;
      const tm = (k + 0.5) / lobes;
      const t1 = (k + 1) / lobes;
      if (spiky) {
        const tt = (k + 0.85) / lobes;
        upper += ` L${edge(tt, 1, -1)} L${edge(t1, 0.45, -1)}`;
        lower = ` L${edge(tt, 1, 1)} L${edge(t0, 0.45, 1)}` + lower;
      } else {
        upper += ` Q${edge(tm, 1.6, -1)} ${edge(t1, 0.4, -1)}`;
        lower = ` Q${edge(tm, 1.6, 1)} ${edge(t0, 0.4, 1)}` + lower;
      }
      rib += ` L${edge(t1, 0, 1)}`;
    }
    const blade = `M${pt(x0, y0)}${upper}${lower} Z`;
    const out: ArtShape[] = [
      { f: fill, d: blade },
      { f: shade, d: `M${pt(x0, y0)}${rib}${lower} Z`, o: 0.45 },
    ];
    if (dark > 0) out.push({ f: shade, d: blade, o: dark });
    return out;
  }

  /** A seed fern standing on (x, y), scaled by `s`: stout trunk, drooping fronds, up to three seeds. */
  function seedFern(x: number, y: number, s: number, seeds = 3): ArtShape[] {
    const cy = y - 12 * s;
    const at = (dx: number, dy: number): [number, number] => [x + dx * s, cy + dy * s];
    const fr = (bx: number, by: number, tx: number, ty: number, w: number, lobes: number): ArtShape[] => {
      const [c1, c2] = at(bx, by);
      const [t1, t2] = at(tx, ty);
      return frond(x, cy, c1, c2, t1, t2, w * s, lobes, 'olive', 'forest', false, tx > 0 ? 0.25 : 0);
    };
    const seed: ArtShape[] = [
      { f: 'gold', d: artCircle(...at(-12, 3.3), 1.6 * s) },
      { f: 'gold', d: artCircle(...at(12.2, 3.8), 1.6 * s) },
      { f: 'gold', d: artCircle(...at(-7.6, -6.4), 1.5 * s) },
    ];
    return [
      { f: 'bark', d: `M${pt(x - 2.4 * s, y)} L${pt(x + 2.4 * s, y)} L${pt(x + 1.3 * s, cy + 1)} L${pt(x - 1.3 * s, cy + 1)} Z` },
      ...fr(-1, -13, -8, -8, 5, 3),
      ...fr(1, -13, 8, -8.5, 5, 3),
      ...fr(-8, -8, -13, 2, 6, 4),
      ...fr(8, -8, 13, 2.5, 6, 4),
      ...seed.slice(0, seeds),
    ];
  }

  /** A cycad: a scaly trunk, a vase of stiff spiky leaves and a seed cone in the middle. */
  function cycad(): ArtShape[] {
    const x = 16;
    const y = 20.5;
    const leaf = (deg: number, len: number, arch: number): ArtShape[] => {
      const a = (deg * Math.PI) / 180;
      const tx = x + Math.sin(a) * len;
      const ty = y - Math.cos(a) * len;
      return frond(x, y, (x + tx) / 2, (y + ty) / 2 - arch, tx, ty, 3.8, 6, 'leaf', 'forest', true, deg > 0 ? 0.2 : 0);
    };
    return [
      { f: 'bark', d: 'M12.8 29.5 L19.2 29.5 L18.6 20.5 L13.4 20.5 Z' },
      { s: 'ink', w: 1.6, d: 'M13.2 23.6 L14.6 25 L16 23.6 L17.4 25 L18.8 23.6', o: 0.35 },
      { s: 'ink', w: 1.6, d: 'M13.1 27 L14.6 28.4 L16 27 L17.4 28.4 L18.9 27', o: 0.35 },
      ...leaf(-15, 14, 0.6),
      ...leaf(17, 14, 0.6),
      ...leaf(-42, 15, 1.6),
      ...leaf(44, 15, 1.6),
      ...leaf(-70, 14.4, 2.8),
      ...leaf(72, 14.4, 2.8),
      { f: 'orange', d: artEllipse(16, 14.8, 3.2, 5) },
      { f: 'bark', d: 'M16 9.8 A3.2 5 0 0 1 16 19.8 Z', o: 0.4 },
      { s: 'bark', w: 1.6, d: 'M13.8 13.2 L16 14.4 L18.2 13.2', o: 0.45 },
      { s: 'bark', w: 1.6, d: 'M13.6 16.8 L16 18 L18.4 16.8', o: 0.45 },
    ];
  }

  /** Welwitschia: torn strap leaves lying over the sand to both sides of a low woody stump with cones. */
  function welwitschia(): ArtShape[] {
    const lowL = 'M13.6 26.6 C10.8 25.8 8.4 26.6 6.6 27 L3.8 26.8 L6 28.4 L4.2 29.6 L13.8 29.6 Z';
    const lowR = 'M18.4 26.6 C21.2 25.6 23.6 26.4 25.6 26.8 L28.4 26.4 L26.4 28.2 L28.2 29.6 L18.2 29.6 Z';
    const upR = 'M18 25.4 C20.2 21 23.8 19.6 26.8 21 L29.4 20.6 L26.6 23 L29.6 25 L26 25.2 C23.4 24.8 20.8 25.8 18.4 28 Z';
    return [
      { f: 'olive', d: lowL },
      { f: 'olive', d: lowR },
      { f: 'forest', d: lowL, o: 0.3 },
      { f: 'forest', d: lowR, o: 0.4 },
      { f: 'bark', d: 'M12.6 29.6 L13.2 25.8 Q16 27.4 18.8 25.8 L19.4 29.6 Z' },
      { f: 'olive', d: 'M14 25.4 C11.8 21.4 8.2 20.4 5 22.2 L2.6 21.8 L5.6 24.2 L2.6 26.2 L6.2 26 C9 25.4 11.2 26.2 13.6 28 Z' },
      { f: 'olive', d: upR },
      { f: 'forest', d: upR, o: 0.2 },
      // brown, withered ends of the torn leaf strips
      { f: 'kelp', d: 'M2.6 21.8 L4.4 21.9 L4.1 23 Z' },
      { f: 'kelp', d: 'M2.6 26.2 L4.1 25.2 L4.4 26.1 Z' },
      { f: 'kelp', d: 'M3.8 26.8 L5.2 26.9 L4.9 27.6 Z' },
      { f: 'kelp', d: 'M29.4 20.6 L27.8 20.8 L28 21.8 Z' },
      { f: 'kelp', d: 'M29.6 25 L28.1 24 L27.8 25.1 Z' },
      { f: 'kelp', d: 'M28.4 26.4 L27 26.7 L27.4 27.3 Z' },
      { f: 'orange', d: artEllipse(14.9, 24.2, 1.2, 1.7) },
      { f: 'orange', d: artEllipse(17.2, 23.8, 1.2, 1.7) },
    ];
  }

  FLORA_ART[Flora.SeedPlants] = {
    // spärlich: A seed fern: a small tree with a crown of big fern-like fronds and a few hanging
    //   seeds.
    sparse: seedFern(16, 29.5, 1.04),
    // dicht: A group of 2-3 seed ferns with overlapping fronds. Farben: olive green fronds, amber
    //   seeds, brown trunk.
    dense: [...seedFern(12.6, 23.5, 0.78, 1), ...seedFern(19.4, 30, 0.78, 2)],
    specialists: [
      // Palmfarne — Offenland (Cycadales (e.g. Encephalartos in savanna and grassland)). A short
      //   thick trunk with a rosette of stiff feather-like leaves and a large cone in the centre.
      //   Farben: dark glossy green, orange-brown cone.
      { name: 'Palmfarne', biome: Biome.Grass, art: cycad() },
      // Welwitschia — Wüste (Welwitschia mirabilis (Gnetales), Namib desert). Two long, torn,
      //   strap-like leaves sprawling over the sand from a low woody stump. Farben: grey-green
      //   leaves with brown tips, sand.
      { name: 'Welwitschia', biome: Biome.Desert, art: welwitschia() },
    ],
  };
}
