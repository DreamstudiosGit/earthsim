/* =============================================================================
 * SimEarth 2.0 — evolution film: ferns (big leaves: the frond)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A frond seen from below,
 * its leaflets dotted with brown spore clusters, sheds spores onto damp
 * ground; one becomes a tiny green heart; a drop lands on it, and in the lens
 * sperm swim through the water film to the egg; from the heart a fiddlehead
 * rises and unrolls into a big frond; then ferns and horsetails everywhere.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** Where the spore lands and the heart-shaped prothallus grows. */
  const PX = 300;
  const PY = 196;
  const L = 156;

  /** A horsetail, base at the origin: a jointed stem with whorls of thin leaves and a cone at the tip. */
  function horsetail(h: number, color = '#6aa857'): string {
    let whorls = '';
    let joints = '';
    for (let k = 1; k < 7; k++) {
      const y = -h * (k / 7.4);
      const l = 10 - k * 0.9;
      whorls += `M0 ${f(y)}q${f(-l * 0.6)} ${f(-l * 0.1)} ${f(-l)} ${f(l * 0.4)}M0 ${f(y)}q${f(l * 0.6)} ${f(-l * 0.1)} ${f(l)} ${f(l * 0.4)}M0 ${f(y)}l${f(-l * 0.55)} ${f(-l * 0.25)}M0 ${f(y)}l${f(l * 0.55)} ${f(-l * 0.25)}`;
      joints += `M-2 ${f(y)}h4`;
    }
    return `<path d="M0 0V${-h}" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/><path d="${joints}" stroke="#3f6f34" stroke-width="1.4"/>` +
      `<path d="${whorls}" stroke="${color}" stroke-width="1.3" fill="none" stroke-linecap="round"/><ellipse cy="${f(-h - 5)}" rx="3" ry="6" fill="#b7a25a"/>`;
  }

  /** The prothallus: a small green heart lying on the ground, with root hairs. */
  const heart = (): string =>
    `<path d="M-12 2l-3 7M-5 4l-1 8M3 4l1 8M10 2l3 7" stroke="#e8dcc0" stroke-width="1" stroke-linecap="round"/>` +
    `<path d="M0 6C-6 4 -19 0 -17 -6C-15 -11 -5 -10 0 -6C5 -10 15 -11 17 -6C19 0 6 4 0 6Z" fill="#7fcf5a" stroke="#3f8a32" stroke-width="1.2"/>` +
    `<path d="M-10 -4Q-4 -1 0 -6Q4 -1 10 -4" stroke="#b6ec8e" stroke-width="1.4" fill="none" opacity="0.8"/>`;

  /** A fern sperm cell heading right: a coiled body with a tuft of flagella. */
  const sperm = (): string =>
    `<path d="M-6 0c1 -4 3 -4 4 0s3 4 4 0s3 -4 4 0" stroke="#f6f1df" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<path d="M6 0c3 -2 5 -6 9 -5M6 0c4 -1 6 -2 10 0M6 0c3 1 5 5 9 5" stroke="#f6f1df" stroke-width="0.8" fill="none" opacity="0.8"/>`;

  /** The lens: in the film of water, sperm swim to the flask holding the egg. */
  function fertilization(): string {
    let out = `<rect x="-60" y="-60" width="120" height="120" fill="#8fcbe2"/>` +
      `<path d="M-60 34Q0 28 60 34V60H-60Z" fill="#6fbf4e"/><path d="M-60 44H60M-40 34V60M-12 31V60M16 31V60M44 34V60" stroke="#4f9a3a" stroke-width="1.2"/>` +
      // The archegonium: a flask in the tissue, its neck open to the water, the egg at the bottom.
      `<path d="M14 44C2 44 2 22 12 16L6 -18L14 -20L20 14C32 18 32 44 20 44Z" fill="#9fdc7c" stroke="#3f8a32" stroke-width="1.4"/>` +
      `<path d="M10 -16L15 14" stroke="#e9f7ff" stroke-width="2.4" stroke-linecap="round"/>` +
      `<circle cx="17" cy="30" r="9" fill="#ffd9a8" stroke="#c98b4a" stroke-width="1.2"/><circle cx="17" cy="30" r="3" fill="#c98b4a"/>` +
      `<circle cx="17" cy="30" r="12" fill="none" stroke="#fff4c4" stroke-width="2.5"${once('pop', { delay: 5.6, dur: 0.5 })}/>`;
    // Sperm swim in from the left; the first one slips down the neck to the egg.
    for (const [y, dx, dy, d] of [[8, 44, -20, 4.4], [-10, 40, -6, 4.6], [24, 34, -26, 4.8]] as const) {
      out += `<g transform="translate(-58 ${y})"><g${once('move', { dx, dy, delay: d, dur: 1.2, ease: 'ease-out' })}><g${mo('float', { amp: 1.5, dur: 0.4 })}>${sperm()}</g></g></g>`;
    }
    out += `<g transform="translate(-58 -30)"><g${once('fadeout', { delay: 5.5, dur: 0.3 })}><g${once('move', { dx: 50, dy: 14, delay: 4.2, dur: 1.2, ease: 'ease-out' })}>` +
      `<g${once('move', { dx: 17, dy: 40, delay: 5.0, dur: 0.6 })}><g transform="rotate(70 0 0)"><g${mo('float', { amp: 1.2, dur: 0.3 })}>${sperm()}</g></g></g></g></g></g>`;
    return out;
  }

  EVO_FILMS.ferns = (): string => {
    const id = 'ferns';
    const s = sky(id, '#3d6352', '#9dbea4');
    const zoom = lens(`${id}-lens`, 160, 118, 56, fertilization(), 4.1, 6.1);
    const defs = s.defs + zoom.defs + vgrad(`${id}-floor`, [[0, '#4d3e2c'], [1, '#2c2319']]) + glowGrad(`${id}-mist`, '#ffffff', 0.4) +
      `<linearGradient id="${id}-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.26"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></linearGradient>`;
    let body = s.body;
    for (const [x, w, d] of [[90, 40, 7], [190, 26, 8.5], [290, 34, 6.5]] as const) {
      body += `<g${mo('sway', { rot: 2, dur: d, origin: '50% 0%' })}><path d="M${x} -10L${x + w} -10L${x + w + 120} 270L${x + 60} 270Z" fill="url(#${id}-ray)"/></g>`;
    }
    body += hills(170, 20, '#5d8268', 4, 0.7);
    // Beat 4: horsetails and ferns fill the damp plain, from the back to the front.
    let plain = '';
    for (const [x, y, h, d] of [[30, 186, 70, 9.2], [70, 182, 54, 9.6], [196, 180, 60, 9.9], [236, 184, 44, 10.4], [404, 182, 64, 9.4], [446, 186, 78, 9.8], [470, 180, 50, 10.2]] as const) {
      plain += `<g transform="translate(${x} ${y})"><g${once('grow', { delay: d, dur: 1.3 })}><g${mo('sway', { rot: 2.5, dur: 3.5 + (x % 3) })}>${horsetail(h, '#5f9a4c')}</g></g></g>`;
    }
    for (const [x, y, sc, d] of [[110, 186, 0.9, 9.5], [160, 184, 0.7, 10.1], [362, 184, 0.8, 9.7], [266, 186, 0.6, 10.6], [20, 196, 0.9, 10.3]] as const) {
      plain += `<g transform="translate(${x} ${y})"><g${once('grow', { delay: d, dur: 1.2 })}><g${mo('sway', { rot: 2, dur: 3.2 })}>${greenFernClump(sc)}</g></g></g>`;
    }
    body += plain + hills(196, 8, '#4b6f57', 7, 0.9);
    body += `<path d="M0 270L0 200Q120 194 240 199T480 198L480 270Z" fill="url(#${id}-floor)"/>` +
      `<ellipse cx="380" cy="214" rx="46" ry="5" fill="#86aea4" opacity="0.5"/><path d="M360 213h22" stroke="#e2f2ec" stroke-width="1.5" opacity="0.6"${mo('twinkle', { dur: 2.5, o: 0.2 })}/>` +
      `<ellipse cx="96" cy="216" rx="34" ry="4" fill="#86aea4" opacity="0.45"/>`;
    // Beat 1: a frond seen from below, dotted with spore clusters; spores trickle down.
    body += during(0, 3.8, `<g transform="translate(504 64) scale(-1.3 1.3) rotate(60)">${greenFrond(190, 0, true, '#5f9f45', '#3f7a34')}</g>`, 0.8);
    const rnd = seeded(9);
    let spores = '';
    for (let k = 0; k < 18; k++) {
      spores += `<circle cx="${f(280 + rnd() * 150)}" cy="${f(70 + rnd() * 60)}" r="2.1" fill="#b5743a"${mo('rise', { dy: f(90 + rnd() * 40), dur: f(1.6 + rnd()), delay: f(rnd() * 2), o: 0.95, ease: 'ease-in' })}/>`;
    }
    body += during(0, 3.4, spores, 0.4);
    // One spore lands and grows into the heart; a drop falls on it and leaves a film of water.
    body += `<g transform="translate(${PX} ${PY})">` + during(1.1, 3.4, `<g${once('move', { dy: 92, delay: 1.2, dur: 1.4, ease: 'ease-in' })}>` +
      `<circle cy="-92" r="2.4" fill="#a8692c"/></g>`, 0.2) + `<g${once('grow', { delay: 3.2, dur: 1, origin: '50% 70%' })}>${heart()}</g>` +
      during(4.45, 9, `<ellipse cy="-2" rx="22" ry="8" fill="#bfe8ff" opacity="0.5"/><path d="M-12 -6q6 -3 12 -1" stroke="#ffffff" stroke-width="1.4" fill="none"/>`, 0.4) + '</g>';
    body += during(3.8, 4.5, `<g${once('move', { dy: 130, delay: 3.85, dur: 0.6, ease: 'ease-in' })}><path d="M${PX} 58c-4 6 -5 9 -5 11a5 5 0 0 0 10 0c0 -2 -1 -5 -5 -11Z" fill="#cfefff" stroke="#6fa8c8" stroke-width="1"/></g>`, 0.1) +
      `<g transform="translate(${PX} ${PY - 2})"><ellipse rx="16" ry="4" fill="none" stroke="#e6f6ff" stroke-width="1.8"${once('burst', { delay: 4.45, s: 2.2, dur: 0.7 })}/></g>`;
    body += during(3.5, 6.1, tag(PX, PY + 22, 'Vorkeim', 3.5), 0.4);
    // Beat 2: the lens shows fertilisation in the drop's water film.
    body += during(4.1, 6.1, `<path d="M${PX} ${PY - 6}L184.8 71.2L135.2 164.8Z" fill="#ffffff" opacity="0.28"/><circle cx="${PX}" cy="${PY - 2}" r="9" fill="none" stroke="${PAL.cream}" stroke-width="1.5"/>`, 0.5);
    body += zoom.body;
    // Beat 3: a fiddlehead rises out of the heart and unrolls into a big frond.
    const curls = [1, 0.72, 0.46, 0.22, 0];
    const stages = curls.map((c) => greenFrond(L, c));
    let frond = `<g${once('grow', { delay: 6.0, dur: 0.7, ease: 'ease-out' })}>${morph(stages, [6.75, 7.1, 7.45, 7.8], 0.45)}</g>`;
    frond = `<g transform="translate(${PX} ${PY - 2})"><g${mo('sway', { rot: 1.5, dur: 4, delay: 8.5, origin: '0% 100%' })}>${frond}</g></g>`;
    body += frond + tag(PX + 96, PY - 120, 'Wedel', 7.7);
    body += sparkle(PX + 40, PY - 90, '#f2ffcc', 7.4);
    body += greenMist(`${id}-mist`, 240, 206, 300, 16, 11) + motes(`${id}-air`, 10, 'rgba(255,250,220,0.6)', 0, 480, 40, 190, 3, 1);
    return film(id, defs, body);
  };
}
