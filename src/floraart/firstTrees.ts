/* =============================================================================
 * SimEarth 2.0 — plant art: Erste Bäume (firstTrees)
 * -----------------------------------------------------------------------------
 * Archaeopteris, the first true tree: a straight bark trunk carrying flat,
 * spaced shelves of fern-like sprays, sunlit `leaf` tops over a dark `forest`
 * fringe. The gaps between the shelves and the column-shaped crown keep it
 * apart from the solid triangles of the conifers. No biome specialists.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /**
   * One flat bough of fern-like leaf sprays on a trunk at x, its top at y,
   * `hw` units to either side and `th` thick: a gently domed, sunlit top
   * (shaded towards the right end), pointed spray tips and a darker underside
   * fringed by hanging leaflets.
   */
  function bough(x: number, y: number, hw: number, th: number): ArtShape[] {
    const ex = hw + 0.8;
    const ey = y + th * 0.55;
    const top = `M${r(x - ex)} ${r(ey)} Q${r(x - hw * 0.8)} ${r(y)} ${r(x - hw * 0.45)} ${r(y)} ` +
      `Q${r(x)} ${r(y - 0.6)} ${r(x + hw * 0.45)} ${r(y)} Q${r(x + hw * 0.8)} ${r(y)} ${r(x + ex)} ${r(ey)}`;
    const n = Math.max(3, Math.round(hw / 2));
    const under: string[] = [];
    for (let k = 1; k < 2 * n; k++) {
      const t = k / (2 * n);
      const by = ey + (y + th - ey) * Math.pow(Math.sin(Math.PI * t), 0.5) - (k % 2 ? 0 : 1.3);
      under.push(`L${r(x + hw - 2 * hw * t)} ${r(by)}`);
    }
    return [
      { f: 'forest', d: `${top} ${under.join(' ')} Z` },
      { f: 'leaf', d: `${top} L${r(x + hw * 0.6)} ${r(y + th * 0.5)} L${r(x - hw * 0.6)} ${r(y + th * 0.5)} Z` },
      { f: 'forest', d: `M${r(x + hw * 0.45)} ${r(y)} Q${r(x + hw * 0.8)} ${r(y)} ${r(x + ex)} ${r(ey)} L${r(x + hw * 0.6)} ${r(y + th * 0.5)} L${r(x + hw * 0.45)} ${r(y + th * 0.5)} Z`, o: 0.4 },
    ];
  }

  /**
   * An Archaeopteris standing on (x, y): a straight trunk up to `top`, boughs as
   * [top y, half-width, thickness, sideways offset] — offset because the
   * branches grow in a spiral, not in level rings.
   */
  function archaeopteris(x: number, y: number, top: number, boughs: [number, number, number, number][]): ArtShape[] {
    const out: ArtShape[] = [
      { f: 'bark', d: `M${r(x - 1.6)} ${r(y)} L${r(x - 0.7)} ${r(top)} L${r(x + 0.7)} ${r(top)} L${r(x + 1.6)} ${r(y)} Z` },
    ];
    for (const [by, hw, th, dx] of boughs) out.push(...bough(x + dx, by, hw, th));
    return out;
  }

  FLORA_ART[Flora.FirstTrees] = {
    // spärlich: Archaeopteris: a straight woody trunk with three flat, spaced tiers of fern-like
    //   leafy branches, like a pagoda.
    sparse: archaeopteris(16, 29.5, 1.8, [[2.8, 9, 4.4, 0.8], [11, 12.8, 4.8, -0.8], [19.6, 10.5, 4.6, 1]]),
    // dicht: A grove of three such trees, crowns overlapping, tiers at staggered heights. Farben:
    //   brown trunk, dark green leaf sprays.
    dense: [
      ...archaeopteris(16, 22, 1.5, [[2.2, 8, 4, 0.8], [9.6, 9.5, 4.4, -0.8]]),
      ...archaeopteris(8.5, 30, 12, [[13.6, 6.4, 4, 0.4], [21.2, 6.4, 4.4, 0.2]]),
      ...archaeopteris(23.5, 30.5, 9.5, [[11.2, 6.4, 4, -0.4], [18.8, 6.2, 4.4, 0]]),
    ],
    specialists: [],
  };
}
