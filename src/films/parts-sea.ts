/* =============================================================================
 * SimEarth 2.0 — shared drawings for the sea films
 * -----------------------------------------------------------------------------
 * Helpers and drawings used by more than one film of this group.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** Place `inner` at (x, y); `extra` is appended to the transform (rotate, scale). */
  export function seaAt(x: number, y: number, inner: string, extra = ''): string {
    return `<g transform="translate(${f(x)} ${f(y)})${extra}">${inner}</g>`;
  }

  /**
   * A motion that turns or scales `inner` about its local (0, 0). Motions take
   * the element's own box as reference, so an invisible square of half-size
   * `r` around the origin pins that box; keep `inner` inside it.
   */
  export function seaPivot(motion: string, inner: string, r = 160): string {
    return `<g${motion}><rect x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" fill="none"/>${inner}</g>`;
  }

  /** Path data of a regular hexagon around (x, y), corners left and right. */
  export function seaHex(x: number, y: number, r: number): string {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      d += `${k ? 'L' : 'M'}${f(x + Math.cos(a) * r)} ${f(y + Math.sin(a) * r)}`;
    }
    return `${d}Z`;
  }
}
