/* =============================================================================
 * SimEarth 2.0 — the young Earth
 * -----------------------------------------------------------------------------
 * The Hadean crust, generated from the seed because no real shapes survive
 * from it: a wide ocean with many small proto-continents, low volcanic
 * highlands instead of fold mountains (a hotter, weaker crust could not carry
 * them), and curved chains of volcanic islands over a mantle that is hot
 * almost everywhere.
 * ========================================================================== */

namespace SE {
  /** Sea share of the young Earth: emerged land was scarce before the continents grew. */
  const YOUNG_EARTH_OCEAN = 0.85;

  /** A finer first octave than a random planet's: many small landmasses instead of a few large ones. */
  const YOUNG_OCTAVES: readonly { cx: number; cy: number; amp: number }[] = [
    { cx: 16, cy: 8, amp: 1.0 },
    { cx: 32, cy: 16, amp: 0.5 },
    { cx: 64, cy: 32, amp: 0.26 },
    { cx: 128, cy: 64, amp: 0.13 },
  ];

  /** Belt height on the elevation scale: about 1.3 km at a full crest, a random planet's reach 3.4 km. */
  const YOUNG_OROGENY_AMP = 0.3;

  /**
   * Island arcs follow the zero line of a coarse noise field, which bends like
   * a real arc; a second field keeps only some stretches of it.
   */
  const ARC_OCTAVES: readonly { cx: number; cy: number; amp: number }[] = [
    { cx: 6, cy: 3, amp: 1.0 },
    { cx: 12, cy: 6, amp: 0.45 },
    { cx: 24, cy: 12, amp: 0.2 },
  ];
  /** Half width of an arc, in tiles. */
  const ARC_WIDTH = 0.6;
  /** Share of the zero line that carries an arc. */
  const ARC_STRETCHES = 0.3;
  /** Tiles of open sea between an arc and the nearest coast. */
  const ARC_OFFSHORE = 3;
  /** Share of arc tiles that rise above the sea as a volcano. */
  const ARC_ISLANDS = 0.45;
  /** The arc between its islands: a shallow ridge, drawn as shelf water. */
  const ARC_RIDGE = COAST_DEPTH * 0.6;

  /** Mantle heat added everywhere: the young planet lost two to three times today's heat. */
  const YOUNG_MANTLE_BOOST = 0.2;

  export function shapeYoungEarth(seed: number, elevation: Float32Array, uplift: Float32Array, magma: Float32Array): void {
    TerrainGenerator.generate(seed, elevation, YOUNG_EARTH_OCEAN, YOUNG_OCTAVES);
    TerrainGenerator.orogeny(seed, elevation, uplift, YOUNG_OROGENY_AMP);
    TerrainGenerator.mantle(seed, magma);
    for (let i = 0; i < TILE_COUNT; i++) magma[i] = Math.min(1, magma[i] + YOUNG_MANTLE_BOOST);
    raiseIslandArcs(seed, elevation, magma);
  }

  function raiseIslandArcs(seed: number, elevation: Float32Array, magma: Float32Array): void {
    const line = new Float32Array(TILE_COUNT);
    TerrainGenerator.generate(seed ^ 0x2c1b3c6d, line, 0.5, ARC_OCTAVES);
    const stretch = new Float32Array(TILE_COUNT);
    TerrainGenerator.generate(seed ^ 0x6a09e667, stretch, 1 - ARC_STRETCHES, ARC_OCTAVES);
    // Distance from land, measured as distance to "water" on the flipped relief.
    const flipped = new Float32Array(TILE_COUNT);
    for (let i = 0; i < TILE_COUNT; i++) flipped[i] = -elevation[i];
    const offshore = TerrainGenerator.distanceToWater(flipped);

    const rng = new Rng(seed ^ 0x3c6ef372);
    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const i = idx(x, y);
        if (elevation[i] >= 0 || stretch[i] < 0 || offshore[i] < ARC_OFFSHORE) continue;
        // Distance to the zero line in tiles, so an arc is equally thin where
        // the field is flat and where it is steep.
        const gx = (line[idx(wrapX(x + 1), y)] - line[idx(wrapX(x - 1), y)]) / 2;
        const gy = (line[idx(x, y + 1)] - line[idx(x, y - 1)]) / 2;
        const near = 1 - Math.abs(line[i]) / (Math.hypot(gx, gy) + 1e-6) / ARC_WIDTH;
        if (near <= 0) continue;
        magma[i] = Math.max(magma[i], 0.75 + 0.25 * near);
        elevation[i] = rng.chance(ARC_ISLANDS) ? rng.range(0.03, 0.25) : Math.max(elevation[i], ARC_RIDGE);
      }
    }
  }
}
