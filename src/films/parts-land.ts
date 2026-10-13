/* =============================================================================
 * SimEarth 2.0 — shared drawings for the land films
 * -----------------------------------------------------------------------------
 * Creatures and backdrops used by more than one film of this group.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A fern frond arching from (x, y) to (x + w, y - h): a curved stalk with leaflets on both sides. */
  export function landFern(x: number, y: number, w: number, h: number, col: string, d: number): string {
    let leaves = '';
    for (let t = 0.12; t < 0.98; t += 0.08) {
      const px = 2 * (1 - t) * t * w * 0.1 + t * t * w;
      const py = -(2 * (1 - t) * t * h * 0.9 + t * t * h);
      const len = 9 * (1 - t * 0.7);
      leaves += `M${f(px)} ${f(py)}l${f(-len * 0.5)} ${f(-len)}M${f(px)} ${f(py)}l${f(len)} ${f(len * 0.3)}`;
    }
    return `<g transform="translate(${x} ${y})"><g${mo('sway', { rot: 3, dur: d, origin: '0% 100%' })}>` +
      `<path d="M0 0Q${f(w * 0.1)} ${f(-h * 0.9)} ${w} ${-h}" stroke="${col}" stroke-width="2" fill="none"/>` +
      `<path d="${leaves}" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/></g></g>`;
  }

  /** A scale tree (Lepidodendron): straight trunk, a forked crown ending in grassy leaf tufts. */
  export function landScaleTree(x: number, y: number, h: number, col: string): string {
    let tufts = '';
    for (const [tx, ty] of [[-24, -26], [-9, -31], [9, -31], [24, -26]] as const) {
      tufts += [[-9, 2], [-7, -7], [0, -11], [7, -7], [9, 2]].map(([dx, dy]) => `M${tx} ${ty - h}l${dx} ${dy}`).join('');
    }
    return `<g transform="translate(${x} ${y})"><path d="M-5 0L-3.4 ${-h}L3.4 ${-h}L5 0Z" fill="${col}"/>` +
      `<path d="M0 ${-h}Q-2 ${-h - 10} -15 ${-h - 18}L-24 ${-h - 26}M-15 ${-h - 18}L-9 ${-h - 31}M0 ${-h}Q2 ${-h - 10} 15 ${-h - 18}L24 ${-h - 26}M15 ${-h - 18}L9 ${-h - 31}" stroke="${col}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      `<path d="${tufts}" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/></g>`;
  }

  /** An araucarian conifer: a tall bare trunk with an umbrella of branch tufts. */
  export function landAraucaria(x: number, y: number, h: number, col: string, trunk = '#5e4a32'): string {
    return `<g transform="translate(${x} ${y})"><path d="M-3.5 0L-2 ${-h}L2 ${-h}L3.5 0Z" fill="${trunk}"/>` +
      `<ellipse cx="0" cy="${-h + 22}" rx="30" ry="8" fill="${col}"/><ellipse cx="-4" cy="${-h + 12}" rx="26" ry="8" fill="${col}"/><ellipse cx="2" cy="${-h + 2}" rx="18" ry="7" fill="${col}"/>` +
      `<ellipse cx="-20" cy="${-h + 30}" rx="12" ry="5" fill="${col}"/><ellipse cx="18" cy="${-h + 32}" rx="12" ry="5" fill="${col}"/></g>`;
  }

  /**
   * A small early reptile (Hylonomus-like), side view facing right, feet on
   * y = 0: slim body, long tail, legs sprawled out. With `run` the legs scurry
   * from run[0] to run[1] s.
   */
  export function landLizard(skin: string, dark: string, run: readonly [number, number] | null = null, belly = '#f1dcae'): string {
    const leg = (x: number, near: boolean, phase: number): string => {
      const m = run ? mo('sway', { rot: 34, dur: 0.11, delay: f(run[0] + phase), n: Math.round((run[1] - run[0]) / 0.22) * 2, origin: '50% 0%' }) : '';
      return `<g transform="translate(${x} -6)"><g${m}><path d="M0 0L3 3.4L1.4 6M1.4 6l3 0M1.4 6l2.4 1.6M1.4 6l-1.6 1" stroke="${near ? skin : dark}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    };
    return leg(10, false, 0.11) + leg(-16, false, 0) +
      `<path d="M26 -7Q24 -11.5 18 -12Q13 -12 10 -11Q0 -14 -12 -13Q-20 -12 -26 -9Q-44 -5 -66 -3Q-44 -3 -26 -5.5Q-16 -4 -8 -4.5Q2 -4 10 -5.5Q16 -5 22 -5.4Q25.5 -5.6 26 -7Z" fill="${skin}"/>` +
      `<path d="M-14 -12.4h3M-5 -13h3M3 -12.4h3M-24 -9.6h3M-36 -6.4h3" stroke="${dark}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M-24 -6Q-8 -4.4 9 -5.8Q-6 -7 -24 -6Z" fill="${belly}" opacity="0.7"/><path d="M26 -7Q21 -6.2 15 -7" stroke="${PAL.ink}" stroke-width="0.7" fill="none" opacity="0.6"/>` +
      eye(19, -9.4, 1.4) + leg(8, true, 0) + leg(-18, true, 0.11);
  }

  /** Two legs straight under the hip at the origin, striding in turn (feet reach y = len). */
  export function landStride(len: number, w: number, near: string, far: string, dur: number, rot: number): string {
    const leg = (col: string, delay: number): string =>
      `<g${mo('sway', { rot, dur, delay, origin: '50% 0%' })}><path d="M0 0L${f(len * 0.2)} ${f(len * 0.48)}L${f(-len * 0.05)} ${f(len * 0.88)}L${f(len * 0.28)} ${len}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return leg(far, -dur) + leg(near, 0);
  }

  /** A puff of dust kicked up at the origin, rising and drifting back (left) on a loop. */
  export function landDust(delay: number, dur = 0.8, color = '#e6d4a8', r = 5): string {
    return `<g${mo('drift', { dx: -26, dy: -8, dur, delay: f(delay), ease: 'ease-out' })}><circle r="${r}" fill="${color}"${mo('land-puff', { dur, delay: f(delay) })}/></g>`;
  }
}
