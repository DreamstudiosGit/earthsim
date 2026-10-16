/* =============================================================================
 * SimEarth 2.0 — where the disasters are on a zoomed-out map
 * -----------------------------------------------------------------------------
 * Below 16 px a tile, a disaster's own effects are a few pixels wide, as its
 * local extent asks. So every running hazard also gets two pulsing pixel
 * rings, a beacon the player finds from far out. A hurricane's beacon
 * follows its eye.
 * ========================================================================== */

namespace SE {
  const PULSE_MS = 1400;
  /** Art pixels the rings grow through: out to about two tiles at 10 px. */
  const R_MIN = 8;
  const R_MAX = 40;
  const LIGHT = fxColor('yellow', 0);
  const DARK = fxColor('red', 1);

  /** Beacons over every running hazard in view; only while the map is zoomed out past the art. */
  export function fxMarkers(s: FxScene, world: WorldState): void {
    if (!s.zoomedOut) return;
    for (const h of world.hazards.list) {
      const eye = h.storm?.path[h.storm.path.length - 1];
      const x = eye === undefined ? h.x : eye % GRID_W;
      const y = eye === undefined ? h.y : Math.floor(eye / GRID_W);
      if (!s.sees(x, y)) continue;
      for (let k = 0; k < 2; k++) {
        const p = (s.now / PULSE_MS + k / 2 + hazardRoll(h.id, 0, 0x6d)) % 1;
        s.ring(x * 16 + 8, y * 16 + 8, R_MIN + (R_MAX - R_MIN) * p, LIGHT, DARK);
      }
    }
  }
}
