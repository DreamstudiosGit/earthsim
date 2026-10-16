/* =============================================================================
 * SimEarth 2.0 — pixel rings
 * -----------------------------------------------------------------------------
 * Shock waves and ground waves are drawn as pixel-exact circles on the art
 * grid (midpoint circle algorithm), not as scaled sprites, so a ring of any
 * radius stays one art pixel wide and crisp (docs/ereignisse-spec.md §2.3).
 * Lit from the upper left: the upper-left arc in the light colour, the
 * lower-right arc in the dark one. `ringPixels` is pure, for tests.
 * ========================================================================== */

namespace SE {
  const RING_CACHE = new Map<number, Int16Array>();

  /** Offsets (dx, dy pairs) of a one-pixel circle of radius r, every pixel once. */
  export function ringPixels(r: number): Int16Array {
    const radius = Math.max(0, Math.round(r));
    const hit = RING_CACHE.get(radius);
    if (hit) return hit;
    const seen = new Set<number>();
    const out: number[] = [];
    const add = (dx: number, dy: number): void => {
      const key = (dx + 1024) * 2048 + dy + 1024;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(dx, dy);
    };
    let x = radius;
    let y = 0;
    let err = 1 - radius;
    while (x >= y) {
      add(x, y); add(y, x); add(-y, x); add(-x, y);
      add(-x, -y); add(-y, -x); add(y, -x); add(x, -y);
      y++;
      if (err < 0) err += 2 * y + 1;
      else {
        x--;
        err += 2 * (y - x) + 1;
      }
    }
    const ring = Int16Array.from(out);
    RING_CACHE.set(radius, ring);
    return ring;
  }

  /**
   * A ring around world art pixel (cx, cy); identity transform (device pixels).
   * `dash` > 0 breaks it into dashes and gaps of that many art pixels of arc.
   */
  export function drawRing(ctx: CanvasRenderingContext2D, cam: LandCamera, cx: number, cy: number, r: number, light: string, dark: string, dash = 0): void {
    const s = (cam.tilePx * cam.dpr) / 16;
    const px = ringPixels(r);
    const ox = Math.floor(cx) - cam.scrollX * 16;
    const oy = Math.floor(cy) - cam.scrollY * 16;
    for (let k = 0; k < px.length; k += 2) {
      const dx = px[k];
      const dy = px[k + 1];
      if (dash > 0 && Math.floor(((Math.atan2(dy, dx) + Math.PI) * r) / dash) % 2 === 1) continue;
      ctx.fillStyle = dx + dy < 0 ? light : dark;
      const x0 = Math.round((ox + dx) * s);
      const y0 = Math.round((oy + dy) * s);
      ctx.fillRect(x0, y0, Math.max(1, Math.round((ox + dx + 1) * s) - x0), Math.max(1, Math.round((oy + dy + 1) * s) - y0));
    }
  }
}
