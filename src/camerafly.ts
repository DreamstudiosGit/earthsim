/* =============================================================================
 * SimEarth 2.0 — camera flights
 * -----------------------------------------------------------------------------
 * Glides the planet map to a tile instead of cutting to it, so the player
 * keeps a sense of where on the planet the place lies. Takes the shorter way
 * round the cylinder; a cut when the player asked for reduced motion.
 * ========================================================================== */

namespace SE {
  const FLY_MS_MIN = 500;
  const FLY_MS_MAX = 900;
  const FLY_MS_PER_TILE = 4;
  /** Scroll drift (tiles) beyond rounding that means the player took over. */
  const FLY_TAKEOVER = 0.05;

  let flightFrame = 0;

  function stillCamera(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function easeInOut(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /** Signed shortest horizontal distance on the wrapping map, in tiles. */
  function wrapDelta(from: number, to: number): number {
    let d = to - from;
    if (d > GRID_W / 2) d -= GRID_W;
    if (d < -GRID_W / 2) d += GRID_W;
    return d;
  }

  /**
   * Fly the map to the centre of tile (x, y), then call `done`. A new flight
   * replaces a running one, and dragging or zooming during the flight hands
   * the camera back to the player; in both cases the old `done` never runs.
   * EditView redraws on any scroll change, so no markDirty is needed.
   */
  export function flyTo(view: EditView, x: number, y: number, done?: () => void): void {
    if (flightFrame) window.cancelAnimationFrame(flightFrame);
    flightFrame = 0;

    const fromX = view.scrollX;
    const fromY = view.scrollY;
    const tile = view.tilePx;
    view.centerOn(x, y);
    if (stillCamera()) {
      done?.();
      return;
    }
    const dx = wrapDelta(fromX, view.scrollX);
    const dy = view.scrollY - fromY;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) {
      done?.();
      return;
    }
    view.scrollX = fromX;
    view.scrollY = fromY;

    const ms = clamp(FLY_MS_MIN + dist * FLY_MS_PER_TILE, FLY_MS_MIN, FLY_MS_MAX);
    const start = performance.now();
    let lastX = fromX;
    let lastY = fromY;
    const step = (now: number): void => {
      flightFrame = 0;
      if (view.tilePx !== tile || Math.abs(wrapDelta(lastX, view.scrollX)) > FLY_TAKEOVER || Math.abs(view.scrollY - lastY) > FLY_TAKEOVER) return;
      const t = Math.min(1, (now - start) / ms);
      if (t >= 1) {
        view.centerOn(x, y);
        done?.();
        return;
      }
      const e = easeInOut(t);
      view.scrollX = fromX + dx * e;
      view.scrollY = fromY + dy * e;
      view.scrollBy(0, 0);
      lastX = view.scrollX;
      lastY = view.scrollY;
      flightFrame = window.requestAnimationFrame(step);
    };
    flightFrame = window.requestAnimationFrame(step);
  }
}
