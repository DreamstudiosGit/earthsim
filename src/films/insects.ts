/* =============================================================================
 * SimEarth 2.0 — evolution film: insects
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A wingless insect climbs a giant horsetail; over generations small flaps on
 * its thorax grow and carry it gliding from stem to stem; then full wings
 * unfold, it takes off and loops; a giant dragonfly patrols the coal swamp.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A giant horsetail (Calamites): a jointed stem with whorls of narrow leaves at every node. */
  function calamites(x: number, y: number, h: number): string {
    let rings = '', leaves = '';
    for (let k = 1; k < 8; k++) {
      const ny = f(-h * (k / 8));
      rings += `M-4 ${ny}h8`;
      leaves += `M-3 ${ny}l-12 -7M-3 ${ny}l-9 -12M3 ${ny}l12 -7M3 ${ny}l9 -12`;
    }
    return `<g transform="translate(${x} ${y})"><path d="M-4.6 0L-3.4 ${-h}L3.4 ${-h}L4.6 0Z" fill="#4c8442"/><path d="M-1 0L-0.6 ${-h}" stroke="#76b060" stroke-width="1.4"/>` +
      `<path d="${rings}" stroke="#2f5a2e" stroke-width="2"/><path d="${leaves}M0 ${-h}l-8 -10M0 ${-h}l0 -13M0 ${-h}l8 -10" stroke="#5f9e50" stroke-width="1.6" stroke-linecap="round"/></g>`;
  }

  /**
   * An early insect seen from above, head up, thorax at the origin: six legs,
   * long feelers, three tail threads. `stage` 0 has no flaps, 1 and 2 growing
   * flaps on the thorax, 3 full wings that grow out at 6 s and beat from 6.8 s.
   * `walk` makes the legs step (tripod gait) during the first three seconds.
   */
  function insect(stage: number, walk: boolean): string {
    let legs = '';
    const pairs = [[-3.6, -5, -9, -9, -11, -15, '100% 100%'], [-4.2, -1.5, -11, -2, -14, 2, '100% 15%'], [-3.8, 2.5, -10, 7, -13, 14, '100% 0%']] as const;
    pairs.forEach(([ax, ay, kx, ky, fx, fy, org], k) => {
      for (const side of [1, -1]) {
        const m = walk ? mo('sway', { rot: 16, dur: 0.25, delay: (k + (side > 0 ? 1 : 0)) % 2 ? 0.25 : 0, n: 12, origin: org }) : '';
        legs += `<g transform="scale(${-side} 1)"><g${m}><path d="M${ax} ${ay}L${kx} ${ky}L${fx} ${fy}" stroke="#5a3416" stroke-width="1.3" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g></g>`;
      }
    });
    let flaps = '';
    if (stage === 1 || stage === 2) {
      const [rx, ry, cx] = stage === 1 ? [3, 1.8, 6] : [7.5, 2.8, 10.5];
      for (const side of [1, -1]) {
        flaps += `<g transform="scale(${side} 1)"><ellipse cx="${cx}" cy="-2.6" rx="${rx}" ry="${ry}" fill="rgba(226,196,150,0.9)" stroke="#8a5a2a" stroke-width="0.6" transform="rotate(8 ${cx} -2.6)"/>` +
          `<ellipse cx="${cx - 0.5}" cy="2" rx="${rx * 0.9}" ry="${ry}" fill="rgba(226,196,150,0.9)" stroke="#8a5a2a" stroke-width="0.6" transform="rotate(16 ${cx - 0.5} 2)"/></g>`;
      }
    }
    let wings = '';
    if (stage === 3) {
      const wing = `<path d="M3.4 -4.6C12 -9 22 -9.4 27 -6.6C26.4 -3.4 16 -1.6 3.4 -1.4Z" fill="rgba(240,250,248,0.88)" stroke="rgba(80,115,105,0.95)" stroke-width="0.6"/>` +
        `<path d="M3.4 0.4C12 -0.6 22 0.4 25 3.6C22 6.6 12 5.6 3.4 3.4Z" fill="rgba(240,250,248,0.82)" stroke="rgba(80,115,105,0.95)" stroke-width="0.6"/>` +
        `<path d="M4 -3.4L26 -6.4M4 -2.4L20 -3M4 1.6L24 3.4" stroke="rgba(100,135,125,0.7)" stroke-width="0.5"/><ellipse cx="23" cy="-6.6" rx="1.8" ry="0.9" fill="#6a4a2a"/>`;
      for (const side of [1, -1]) wings += `<g transform="scale(${side} 1)"><g${once('grow', { delay: 6, dur: 0.9, origin: '0% 50%' })}>${wing}</g></g>`;
      wings = `<g${mo('insects-beat', { dur: 0.07, delay: 6.8 })}>${wings}</g>`;
    }
    return legs + flaps + wings +
      `<path d="M-1.5 -13Q-6 -22 -9 -30M1.5 -13Q6 -22 9 -30" stroke="#4a2a12" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
      `<path d="M-1.2 22Q-6 30 -9 40M0 22L0 41M1.2 22Q6 30 9 40" stroke="#7a4f2a" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
      `<path d="M-4 3Q-5.6 12 -1.6 22L1.6 22Q5.6 12 4 3Z" fill="#c58a4a"/><path d="M-4.4 7.4h8.8M-4.2 11.6h8.4M-3.2 15.6h6.4M-2.2 19h4.4" stroke="#8a5a2a" stroke-width="0.7"/>` +
      `<ellipse cx="0" cy="-2.4" rx="4.4" ry="5.6" fill="#b5773e"/><path d="M-4 -4.6h8M-4.2 -0.4h8.4" stroke="#7a4a20" stroke-width="0.7"/>` +
      `<ellipse cx="0" cy="-11" rx="3.6" ry="3.4" fill="#9a6232"/><circle cx="-2.6" cy="-12" r="1.3" fill="${PAL.ink}"/><circle cx="2.6" cy="-12" r="1.3" fill="${PAL.ink}"/>`;
  }

  /** Meganeura seen from above, flying left: four long veined wings, big eyes, a long tail. */
  function meganeura(): string {
    const pair = (bx: number, len: number, w: number, delay: number): string => {
      const half = (sg: number): string =>
        `<path d="M${bx} 0C${bx - 3} ${sg * len * 0.4} ${bx - 1} ${sg * len * 0.9} ${bx + 5} ${sg * len}C${bx + w} ${sg * len * 0.95} ${bx + w + 2} ${sg * len * 0.4} ${bx + w} 0Z" fill="rgba(232,244,248,0.62)" stroke="rgba(100,135,150,0.8)" stroke-width="0.8"/>` +
        `<path d="M${bx + 2} ${sg * 2}L${bx + 3.5} ${f(sg * len * 0.92)}M${bx + 5} ${sg * 2}Q${bx + w} ${sg * len * 0.5} ${bx + 6} ${f(sg * len * 0.9)}" stroke="rgba(100,135,150,0.6)" stroke-width="0.6" fill="none"/>` +
        `<ellipse cx="${bx + 4.5}" cy="${f(sg * len * 0.84)}" rx="1.6" ry="3.2" fill="#6a4a2a" opacity="0.75"/>`;
      return `<g${mo('flap', { dur: 0.16, s: 0.35, delay, origin: '50% 50%' })}>${half(-1)}${half(1)}</g>`;
    };
    let segs = '';
    for (let k = 1; k < 9; k++) segs += `M${-2 + k * 7.5} -2.2v4.4`;
    return pair(-14, 56, 12, 0) + pair(-5, 52, 14, -0.08) +
      `<rect x="-4" y="-2.3" width="68" height="4.6" rx="2.3" fill="#b8793a"/><path d="${segs}M64 0l7 -3M64 0l7 3" stroke="#7a4a20" stroke-width="1.1" stroke-linecap="round"/>` +
      `<ellipse cx="-10" cy="0" rx="8" ry="5.2" fill="#7a5530"/><ellipse cx="-19" cy="0" rx="3.4" ry="4.4" fill="#5e4026"/>` +
      `<circle cx="-22" cy="-3.6" r="4.2" fill="#3f8073"/><circle cx="-22" cy="3.6" r="4.2" fill="#3f8073"/><circle cx="-23.4" cy="-5" r="1.3" fill="#d8fff4"/><circle cx="-23.4" cy="2.2" r="1.3" fill="#d8fff4"/>`;
  }

  /** A small flying insect buzzing about its spot from `start` s. */
  function gnat(x: number, y: number, start: number, k: number): string {
    return `<g transform="translate(${x} ${y}) scale(1.5)"><g${once('fade', { delay: start, dur: 0.6 })}><g${mo('float', { amp: 3, dur: f(0.5 + (k % 3) * 0.12) })}>` +
      `<g${mo('sway', { rot: 28, dur: f(1.1 + (k % 4) * 0.2), delay: f(-k * 0.3), origin: '50% -300%' })}><ellipse rx="2.8" ry="1.3" fill="#7a4f28"/>` +
      `<g${mo('flap', { dur: 0.05, s: 0.2, origin: '50% 100%' })}><ellipse cx="-0.6" cy="-2.6" rx="3" ry="1.5" fill="rgba(235,245,255,0.85)"/></g></g></g></g></g>`;
  }

  EVO_FILMS.insects = (): string => {
    const id = 'insects';
    const s = sky(id, '#2f6d72', '#d6e6bc');
    const glow = sun(id, 236, 84, 10, '#fff4cc');
    let body = s.body + glow.body + hills(176, 10, '#9bbba0', 2, 0.6);
    // The coal swamp forest, hazy: scale trees in two layers.
    body += `<g opacity="0.45">${[[30, 120], [96, 140], [214, 112], [262, 134], [400, 118], [462, 140]].map(([x, h]) => landScaleTree(x, 192, h, '#7ea592')).join('')}</g>`;
    body += `<g opacity="0.7">${[[62, 150], [244, 160], [430, 150]].map(([x, h]) => landScaleTree(x, 196, h, '#4f7f66')).join('')}</g>`;
    body += `<rect y="188" width="480" height="82" fill="url(#${id}-swamp)"/>` +
      `<g${mo('wave', { dx: -40, dur: 4 })}><path d="${wavePath(-40, 520, 191, 1.5)}" fill="none" stroke="rgba(230,250,230,0.45)" stroke-width="1.2"/></g>`;
    for (const [x, y, rx] of [[70, 206, 9], [222, 214, 7], [410, 204, 10], [270, 200, 5]] as const) body += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * 0.3)}" fill="#5f9a4a" opacity="0.8"/>`;
    body += calamites(150, 226, 166) + calamites(330, 226, 156) + calamites(42, 230, 120) + calamites(446, 230, 132);
    // Beat 1: the wingless insect climbs the stem. Beat 2: over generations flaps
    // grow on its thorax, and it glides to the next stem. Beat 3: full wings; it
    // takes off and loops.
    const forms = [insect(0, true), insect(1, false), insect(2, false), insect(3, false)];
    body += `<g transform="translate(150 118) scale(1.4)">` +
      `<g${once('enter', { dx: 0, dy: 36, delay: 0, dur: 3, ease: 'linear' })}>` +
      `<g${once('insects-glide', { dur: 1.2, delay: 4.6, ease: 'linear' })}>` +
      `<g${once('insects-flight', { dur: 2.8, delay: 6.8, ease: 'linear' })}>${morph(forms, [3.4, 4.1, 6.0], 0.6)}</g></g></g></g>`;
    body += during(3.6, 4.6, tag(176, 112, 'Flügelansätze', 3.6, 'start'), 0.4);
    body += during(6.2, 6.9, tag(366, 132, 'Flügel', 6.2, 'start'), 0.3);
    body += sparkle(352, 146, '#fff6c8', 6.4);
    // The loop, traced in the air as it flies it.
    body += during(0, 9.0, `<path d="M330 123A28 28 0 1 1 386 123A28 28 0 1 1 330 123" fill="none" stroke="rgba(255,255,240,0.6)" stroke-width="1.6" stroke-linecap="round"${once('draw', { len: 176, delay: 7.2, dur: 1.8, ease: 'linear' })}/>`, 0.5);
    body += timelapse(330, 62, ['vor 390 Mio. J.', 'vor 360 Mio. J.', 'vor 340 Mio. J.', 'vor 325 Mio. J.'], [3.0, 3.4, 4.1, 6.0], 6.6);
    // Beat 4: Meganeura glides in over the water; small insects buzz.
    body += `<g transform="translate(560 128)"><g${once('move', { dx: -330, dy: 6, delay: 8.9, dur: 2.4, ease: 'cubic-bezier(.25,.7,.35,1)' })}>` +
      `<g${mo('float', { amp: 4, dur: 2 })}><g transform="scale(1.15)">${meganeura()}</g></g></g></g>`;
    for (const [x, y, k] of [[96, 168, 0], [262, 176, 1], [392, 170, 2], [196, 150, 3], [430, 120, 4]] as const) body += gnat(x, y, 9.4 + k * 0.2, k);
    body += motes(id, 8, 'rgba(240,240,170,0.7)', 40, 440, 70, 190, 6, 1.1);
    const defs = s.defs + glow.defs + vgrad(`${id}-swamp`, [[0, '#5b8a72'], [1, '#2a4c40']]);
    return film(id, defs, body);
  };
}
