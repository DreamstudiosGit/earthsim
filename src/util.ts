/* =============================================================================
 * SimEarth 2.0 — grid helpers, maths and the deterministic RNG
 * ========================================================================== */

namespace SE {
  /* ---------------------------------------------------------------- maths -- */

  export function clamp(v: number, lo: number, hi: number): number {
    return v < lo ? lo : v > hi ? hi : v;
  }

  export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /** Classic Hermite smoothstep, used for noise interpolation. */
  export function smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  /* ----------------------------------------------------------------- grid -- */

  /** Flat array index. Callers must pass in-range coordinates. */
  export function idx(x: number, y: number): number {
    return y * GRID_W + x;
  }

  /**
   * Index into the per-tile, per-class life matrices. The classes of one tile
   * are contiguous, which is the order every hot loop in LifeSystem walks them.
   */
  export function lifeIdx(i: number, c: Life): number {
    return i * LIFE_COUNT + c;
  }

  /** X wraps around the cylinder. */
  export function wrapX(x: number): number {
    return ((x % GRID_W) + GRID_W) % GRID_W;
  }

  /** Y is clamped — you cannot walk off the top of the world, only around it. */
  export function clampY(y: number): number {
    return y < 0 ? 0 : y >= GRID_H ? GRID_H - 1 : y;
  }

  /** Tile centre latitude in degrees: +90 at row 0, -90 at the last row. */
  export function latitudeDeg(y: number): number {
    return 90 - ((y + 0.5) / GRID_H) * 180;
  }

  /** Mean of the four von Neumann neighbours, wrapping in X, clamping in Y. */
  export function neighborMean(src: Float32Array, x: number, y: number): number {
    return (
      src[idx(wrapX(x - 1), y)] +
      src[idx(wrapX(x + 1), y)] +
      src[idx(x, clampY(y - 1))] +
      src[idx(x, clampY(y + 1))]
    ) * 0.25;
  }

  /**
   * Prevailing zonal wind direction for a row: trade easterlies in the tropics
   * and at the poles, westerlies in the mid latitudes. Returns -1 or +1.
   */
  export function windDirection(y: number): number {
    const absLat = Math.abs(latitudeDeg(y));
    return absLat < 30 ? -1 : absLat < 60 ? 1 : -1;
  }

  /* --------------------------------------------------------------- colour -- */

  /** Sample an RGB ramp defined as sorted [stopValue, colour] pairs. */
  export function sampleRamp(
    ramp: readonly (readonly [number, Rgb])[],
    v: number,
  ): Rgb {
    if (v <= ramp[0][0]) return ramp[0][1];
    const last = ramp[ramp.length - 1];
    if (v >= last[0]) return last[1];
    for (let i = 1; i < ramp.length; i++) {
      const hi = ramp[i];
      if (v <= hi[0]) {
        const lo = ramp[i - 1];
        const t = (v - lo[0]) / (hi[0] - lo[0]);
        return [
          lerp(lo[1][0], hi[1][0], t),
          lerp(lo[1][1], hi[1][1], t),
          lerp(lo[1][2], hi[1][2], t),
        ];
      }
    }
    return last[1];
  }

  export function rgbCss(c: Rgb): string {
    return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  }

  /** Multiply a colour by a scalar, clamped to the byte range. */
  export function shade(c: Rgb, k: number): Rgb {
    return [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)];
  }

  /* ------------------------------------------------------------------ dom -- */

  /** Fetch a required element, failing loudly if the markup drifted. */
  export function el<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) throw new Error(`SimEarth: missing DOM element #${id}`);
    return node as T;
  }

  /** Create an element with an optional class and text in one call. */
  export function make<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string,
  ): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ------------------------------------------------------------------ rng -- */

  /**
   * mulberry32 — small, fast, well distributed. A single uint32 of state means
   * the whole generator round-trips through a save file.
   */
  export class Rng {
    private state: number;

    constructor(seed: number) {
      this.state = seed >>> 0;
    }

    /** Uniform float in [0, 1). */
    next(): number {
      this.state = (this.state + 0x6d2b79f5) >>> 0;
      let t = this.state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** Uniform float in [min, max). */
    range(min: number, max: number): number {
      return min + (max - min) * this.next();
    }

    /** Uniform integer in [0, maxExclusive). */
    int(maxExclusive: number): number {
      return Math.floor(this.next() * maxExclusive);
    }

    /** True with the given probability. */
    chance(p: number): boolean {
      return this.next() < p;
    }

    /** Pick a uniformly random element. */
    pick<T>(items: readonly T[]): T {
      return items[this.int(items.length)];
    }

    getState(): number {
      return this.state;
    }

    setState(state: number): void {
      this.state = state >>> 0;
    }
  }

  /* -------------------------------------------------------------- display -- */

  /** A planet age or duration in German, e.g. "4,52 Mrd. Jahre". */
  export function formatYears(years: number): string {
    const de = (v: number, d: number): string =>
      v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
    if (years >= 1e9) return `${de(years / 1e9, 2)} Mrd. Jahre`;
    if (years >= 1e6) return `${de(years / 1e6, 2)} Mio. Jahre`;
    if (years >= 1e3) return `${de(Math.round(years), 0)} Jahre`;
    return Math.round(years) === 1 ? '1 Jahr' : `${de(years, 0)} Jahre`;
  }

  /** "vor 30.000 Jahren" — the dative plural German needs after "vor". */
  export function formatYearsAgo(years: number): string {
    return `vor ${formatYears(years).replace(/Jahre$/, 'Jahren').replace(/^1 Jahr$/, 'einem Jahr')}`;
  }
}
