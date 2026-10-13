/* =============================================================================
 * SimEarth 2.0 — evolution film: amphibians (the first steps on land)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A lobe-finned fish gulps
 * air in a Devonian swamp; over twenty million years its lineage becomes
 * Tiktaalik and Ichthyostega while a lens shows the fin bones becoming a hand
 * ("one bone, two, many"); it hauls out on the mud, hunts, and still lays its
 * eggs in the water.
 * ========================================================================== */

namespace SE {
  const SURFACE = 150;
  const f = (v: number): string => v.toFixed(1);

  function at(x: number, y: number, inner: string, extra = ''): string {
    return `<g transform="translate(${f(x)} ${f(y)})${extra}">${inner}</g>`;
  }

  /** A lobe fin or leg hanging from (x, y), rowing or stepping. */
  function limb(x: number, y: number, shape: string, delay: number, rot = 18): string {
    return at(x, y, `<g${mo('sway', { rot, dur: 0.6, delay, origin: '50% 0%' })}>${shape}</g>`);
  }

  /** Eusthenopteron: a lobe-finned fish with a lung, facing right. */
  function lobeFin(): string {
    const lobe = `<path d="M-3 0Q4 9 -2 15Q-8 12 -6 3Z" fill="#6b8a5a"/><path d="M-2 15Q-6 18 -9 15" stroke="#9cbf86" stroke-width="2" fill="none"/>`;
    return limb(16, 6, lobe, 0) + limb(-16, 6, lobe, 0.3) +
      at(-44, 0, `<g${mo('sway', { rot: 10, dur: 0.9, origin: '100% 50%' })}><path d="M2 0L-18 -12L-13 0L-18 12Z" fill="#9cbf86"/></g>`) +
      `<path d="M-10 -13l-6 -7l-6 6Z M-26 -9l-5 -6l-5 5Z" fill="#9cbf86"/>` +
      `<path d="M-46 0Q-30 -13 0 -14Q24 -14 38 -7Q47 -3 47 1Q45 6 34 8Q6 12 -24 8Q-40 5 -46 0Z" fill="#7d9a6c"/>` +
      `<path d="M-38 3Q0 11 40 5" stroke="#cfd9a8" stroke-width="3" fill="none" opacity="0.8"/>` +
      during(1.3, 2.9, `<ellipse cx="4" cy="-3" rx="15" ry="5" fill="#bfe8ff" opacity="0.75"/>`, 0.4) + eye(32, -5, 2.6);
  }

  /** Tiktaalik: flat head with eyes on top, a neck, sturdy fins with a wrist. */
  function tiktaalik(): string {
    const fin = `<path d="M-3 0Q5 8 2 13L11 15Q4 18 -4 15Q-7 8 -5 2Z" fill="#6f7f4c"/>`;
    return limb(16, 6, fin, 0) + limb(-18, 6, `<path d="M-3 0Q3 8 -1 12Q-7 10 -5 2Z" fill="#6f7f4c"/>`, 0.3) +
      at(-48, 0, `<g${mo('sway', { rot: 10, dur: 0.9, origin: '100% 50%' })}><path d="M2 0L-16 -8L-12 0L-16 8Z" fill="#9aae74"/></g>`) +
      `<path d="M-50 0Q-34 -12 -4 -12Q14 -12 22 -9Q30 -12 42 -10Q54 -7 55 -2Q53 4 40 5Q26 6 18 7Q0 11 -26 8Q-42 5 -50 0Z" fill="#80915c"/>` +
      `<path d="M-40 3Q0 10 44 3" stroke="#d6d7a2" stroke-width="3" fill="none" opacity="0.8"/>` +
      `<path d="M-30 -8q4 -3 8 0M-16 -10q4 -3 8 0M-2 -11q4 -3 8 0" stroke="#5f7244" stroke-width="1.6" fill="none"/>` + eye(38, -10, 2.4);
  }

  /** Ichthyostega: four legs with toes, a broad head, a finned tail. */
  function ichthyostega(): string {
    const leg = `<path d="M-3 0Q-6 9 -2 15L7 15Q4 12 4 8L4 0Z" fill="#5f7f4e"/>` +
      `<path d="M-2 15L-4 18M0 15L-1 19M2 15L2 19.5M4 15L5 19M6 15L8 18" stroke="${PAL.ink}" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>`;
    return limb(22, 5, leg, 0, 24) + limb(-20, 5, leg, 0.3, 24) +
      `<path d="M-52 -2Q-44 -12 -26 -14" stroke="#9aae74" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<path d="M-52 -2Q-36 -14 -4 -15Q22 -16 36 -10Q50 -5 52 1Q48 8 32 8Q4 11 -24 8Q-42 5 -52 -2Z" fill="#6f8f5c"/>` +
      `<path d="M-30 4Q0 11 34 6" stroke="#d9cfa0" stroke-width="3" fill="none" opacity="0.85"/>` +
      `<path d="M-14 -12q4 -3 8 0M0 -14q4 -3 8 0M14 -13q4 -3 8 0" stroke="#4d7a4c" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      `<path d="M38 3Q44 4 50 2" stroke="${PAL.ink}" stroke-width="1.3" fill="none" opacity="0.6"/>` + eye(33, -8, 3);
  }

  /** In the lens: the front fin's bones becoming a hand — one bone, two, many. */
  function bonesInLens(): string {
    const bone = (d: string, w: number): string => `<path d="${d}" stroke="#f3ead2" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    const arm = bone('M-26 -26L-8 -8', 7) + bone('M-8 -8L6 8', 4) + bone('M-4 -11L11 2', 4);
    const fin = `<path d="M-34 -30Q10 -18 34 26Q-6 20 -30 -6Z" fill="#6b8a5a"/>` + arm +
      [[6, 8, 14, 22], [11, 2, 22, 12], [9, 5, 20, 18]].map(([a, b, c, d]) => bone(`M${a} ${b}L${c} ${d}`, 2.4)).join('') +
      [0, 1, 2, 3, 4, 5].map((k) => bone(`M${16 + k * 2} ${14 - k * 2}L${24 + k * 3} ${30 - k * 4}`, 1)).join('');
    const wrist = `<path d="M-34 -30Q12 -16 28 22Q-6 18 -30 -6Z" fill="#6f7f4c"/>` + arm +
      [[9, 10], [14, 6], [13, 13], [18, 10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#f3ead2"/>`).join('') +
      [0, 1, 2].map((k) => bone(`M${18 + k * 2} ${14 - k * 2}L${24 + k * 3} ${22 - k * 3}`, 1.2)).join('');
    const hand = `<path d="M-34 -30Q14 -16 30 10Q36 26 22 30Q-4 18 -30 -6Z" fill="#5f7f4e"/>` + arm +
      [[9, 10], [14, 6], [13, 13], [18, 10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#f3ead2"/>`).join('') +
      [0, 1, 2, 3, 4, 5, 6].map((k) => bone(`M${15 + k * 1.5} ${14 - k * 1.2}L${20 + k * 4} ${30 - k * 3.4}`, 2)).join('') +
      `<g font-size="9" fill="${PAL.cream}"><text x="-30" y="-12">1</text><text x="-12" y="8">2</text><text x="24" y="-2">viele</text></g>`;
    return `<rect x="-60" y="-60" width="120" height="120" fill="#24453c"/>` + morph([fin, wrist, hand], [4.0, 5.0], 0.8);
  }

  function horsetail(x: number, y: number, h: number, d: number): string {
    let whorls = '';
    for (let k = 1; k < 6; k++) whorls += `<path d="M-7 ${f(-h * (k / 6) + 4)}L0 ${f(-h * (k / 6))}L7 ${f(-h * (k / 6) + 4)}" stroke="#5c9a4e" stroke-width="1.6" fill="none"/>`;
    return at(x, y, `<g${mo('sway', { rot: 3, dur: d })}><path d="M0 0L0 ${-h}" stroke="#6aa857" stroke-width="2.6" stroke-linecap="round"/>${whorls}` +
      `<ellipse cy="${-h - 4}" rx="2.6" ry="5" fill="#b7a25a"/></g>`);
  }

  function millipede(): string {
    let segs = '';
    for (let k = 0; k < 8; k++) {
      segs += `<circle cx="${-k * 5}" cy="0" r="3.4" fill="#7a4a30"/>` +
        `<g${mo('sway', { rot: 30, dur: 0.3, delay: -k * 0.08, origin: '50% 0%' })}><path d="M${-k * 5 - 1} 2l-1 4M${-k * 5 + 1} 2l1 4" stroke="#3a2418" stroke-width="0.9"/></g>`;
    }
    return segs + `<circle cx="3" cy="-0.5" r="2.6" fill="#8a5a3a"/>`;
  }

  EVO_FILMS.amphibians = (): string => {
    const id = 'amphibians';
    const s = sky(id, '#12303f', '#a9d8c8');
    const glow = sun(id, 404, 64, 15, '#ffe7a8');
    const water = sea(id, SURFACE, 0, 330);
    const bones = lens(`${id}-bones`, 132, 108, 44, bonesInLens(), 3.2, 8.6);
    let body = s.body + glow.body + hills(140, 16, '#4c7f74', 3, 0.55);
    // Archaeopteris, the first trees, on the far shore.
    for (let k = 0; k < 6; k++) {
      const x = 270 + k * 36;
      const h = 30 + (k % 3) * 8;
      let tiers = '';
      for (let t = 0; t < 3; t++) tiers += `<ellipse cx="${x}" cy="${142 - h + t * 8}" rx="${5 + t * 3}" ry="3" fill="#3e6a5f"/>`;
      body += `<g opacity="0.6"><path d="M${x} 144L${x} ${142 - h}" stroke="#3e6a5f" stroke-width="2.4"/>${tiers}</g>`;
    }
    body += water.body;
    // The mud bank rising out of the swamp on the right.
    body += `<path d="M210 270Q256 196 306 152Q380 140 480 138L480 270Z" fill="${PAL.mud}"/>` +
      `<path d="M260 212Q284 176 306 154Q380 142 480 140" stroke="#8d6d48" stroke-width="3" fill="none"/>`;
    for (const [x, y, h, d] of [[440, 140, 50, 3.4], [464, 139, 62, 4.1]] as const) body += horsetail(x, y, h, d);
    // Footprints: the first steps on land.
    for (const [x, y, t] of [[318, 150, 7.0], [334, 148, 7.5], [350, 147, 8.0]] as const) {
      body += at(x, y, `<g${once('pop', { delay: t, dur: 0.4 })}><ellipse rx="3.4" ry="1.6" fill="#4a3424"/>` +
        `<circle cx="-3" cy="-2.6" r="0.9" fill="#4a3424"/><circle cx="0" cy="-3.2" r="0.9" fill="#4a3424"/><circle cx="3" cy="-2.6" r="0.9" fill="#4a3424"/></g>`);
    }
    // Prey on the bank, snapped up at the end.
    body += at(428, 136, `<g${once('fadeout', { delay: 9.8, dur: 0.3 })}><g${mo('drift', { dx: -14, dur: 4 })}>${millipede()}</g></g>`);
    // One lineage over twenty million years: gulping air, heading for the bank, walking out.
    body += at(110, 182, `<g${once('move', { dx: 40, dy: -26, delay: 0.4, dur: 1.1 })}><g${once('move', { dx: 20, dy: 22, delay: 2.2, dur: 0.8 })}>` +
      `<g${once('move', { dx: 100, dy: -12, delay: 3.0, dur: 3.0, ease: 'linear' })}>` +
      `<g${once('move', { dx: 82, dy: -36, delay: 6.0, dur: 2.6, ease: 'cubic-bezier(0.45, 0, 0.3, 1)' })}>` +
      `<g${once('move', { dx: 12, delay: 9.5, dur: 0.3 })}><g${mo('float', { amp: 1.2, dur: 1.4 })}>` +
      morph([lobeFin(), tiktaalik(), ichthyostega()], [4.0, 5.0], 0.8) + '</g></g></g></g></g></g>');
    // A breath at the surface.
    body += at(196, 146, `<g${once('pop', { delay: 1.5, dur: 0.4 })}><g${once('fadeout', { delay: 2.4 })}><circle r="4" fill="none" stroke="#ffffff" stroke-width="1.6"/></g></g>`);
    // Eggs still go into the water: jelly-coated, in a clump.
    let eggs = '';
    for (let k = 0; k < 9; k++) {
      const [x, y] = [(k % 3) * 8 - 8 + (Math.floor(k / 3) % 2) * 4, Math.floor(k / 3) * 7 - 7];
      eggs += `<g transform="translate(${x} ${y})"><g${once('pop', { delay: (9.5 + k * 0.08).toFixed(2), dur: 0.5 })}><circle r="4.4" fill="#e8f4ec" opacity="0.55"/><circle r="1.6" fill="${PAL.ink}"/></g></g>`;
    }
    body += at(196, 178, eggs);
    // The water in front of everything still submerged.
    body += `<path d="M0 ${SURFACE}L308 ${SURFACE}Q256 196 210 270L0 270Z" fill="#1f6f8c" opacity="0.38"/>`;
    body += timelapse(300, 40, ['Eusthenopteron · 385 Mio. J.', 'Tiktaalik · 375 Mio. J.', 'Ichthyostega · 365 Mio. J.'], [3.0, 4.0, 5.0], 6.8);
    body += bones.body + during(1.5, 3.0, tag(154, 132, 'Lunge', 1.5), 0.4) +
      during(6.4, 8.6, tag(132, 170, 'Finger und Zehen', 6.4), 0.4) + tag(196, 202, 'Eier im Wasser', 10.0) +
      sparkle(318, 148, '#fff3c4', 7.0, 1.1);
    body += motes(id, 14, 'rgba(255,245,210,0.7)', 220, 480, 60, 140, 9, 1.2);
    return film(id, s.defs + glow.defs + water.defs + bones.defs, body);
  };
}
