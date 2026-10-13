/* =============================================================================
 * SimEarth 2.0 — evolution film: whales (back to the sea)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. Pakicetus walks into the
 * shallows and, in time-lapse over ten million years, becomes Ambulocetus,
 * Rodhocetus and Dorudon; a lens shows the nostrils wandering up into a
 * blowhole; the young whale surfaces to breathe with its calf.
 * ========================================================================== */

namespace SE {
  const SURFACE = 150;
  const f = (v: number): string => v.toFixed(1);

  function at(x: number, y: number, inner: string, extra = ''): string {
    return `<g transform="translate(${f(x)} ${f(y)})${extra}">${inner}</g>`;
  }

  /** A paddling or walking leg hanging from (x, y). */
  function leg(x: number, y: number, len: number, color: string, delay: number, foot = 3): string {
    return at(x, y, `<g${mo('sway', { rot: 18, dur: 0.5, delay, origin: '50% 0%' })}>` +
      `<path d="M-2.4 0L-2.8 ${f(len * 0.5)}L-1.8 ${f(len)}L${f(1.8 + foot)} ${f(len)}L2.4 ${f(len * 0.5)}L2.6 0Z" fill="${color}"/></g>`);
  }

  /** Pakicetus: a wolf-sized, long-snouted, hoofed land mammal; nostrils at the snout tip. */
  function pakicetus(): string {
    return leg(13, -3, 22, '#a8774a', 0.2, 0) + leg(-15, -3, 22, '#a8774a', 0, 0) +
      `<g${mo('sway', { rot: 6, dur: 2, origin: '100% 0%' })}><path d="M-23 -8Q-38 -7 -47 7Q-38 -2 -23 -2Z" fill="#c4905c"/></g>` +
      `<path d="M-25 -8Q-20 -19 0 -18Q17 -18 23 -11Q26 -4 20 1Q0 4 -19 1Q-27 -2 -25 -8Z" fill="#c99560"/>` +
      `<path d="M-16 -1Q0 2.5 18 -0.5" stroke="#e6c391" stroke-width="2.4" fill="none" opacity="0.8"/>` +
      `<path d="M14 -14Q22 -23 32 -24Q41 -24 54 -18Q56 -16 54 -15Q42 -13 34 -12Q26 -8 20 -5Z" fill="#c99560"/>` +
      `<path d="M28 -23L29.5 -28L32.5 -23Z" fill="#b07e4c"/>` + eye(36, -21.5, 2) +
      `<circle cx="53.4" cy="-17.6" r="1.2" fill="${PAL.ink}"/>` +
      leg(17, -3, 22, '#c99560', 0.1, 0) + leg(-11, -3, 22, '#c99560', 0.3, 0);
  }

  /** Ambulocetus, "the walking whale": crocodile-like, big webbed hind feet. */
  function ambulocetus(): string {
    return leg(-20, 4, 14, '#7a5f42', 0, 7) + leg(24, 4, 10, '#7a5f42', 0.25, 3) +
      `<path d="M-58 2Q-42 -2 -26 -7Q-8 -15 14 -13Q30 -12 38 -9L58 -6Q61 -3 58 -1L38 2Q14 10 -20 8Q-40 6 -58 2Z" fill="#8f7352"/>` +
      `<path d="M-30 5Q0 9 30 3" stroke="#b49a72" stroke-width="2.4" fill="none"/>` + eye(36, -9, 1.9) +
      `<circle cx="56" cy="-5.5" r="1.1" fill="${PAL.ink}"/>`;
  }

  /** Rodhocetus: sleeker and seal-like, short legs, paddle feet, nostrils set back. */
  function rodhocetus(): string {
    return leg(-26, 5, 10, '#6a6b5e', 0, 9) + leg(22, 5, 8, '#6a6b5e', 0.25, 5) +
      `<path d="M-62 0Q-46 -4 -30 -10Q-6 -17 18 -14Q34 -12 42 -7L58 -4Q60 -1 57 0.5L40 3Q16 11 -18 9Q-42 6 -62 0Z" fill="#7c7a6a"/>` +
      `<path d="M-34 5Q0 10 36 3" stroke="#aaa792" stroke-width="2.4" fill="none"/>` + eye(36, -6, 1.9) +
      `<circle cx="44" cy="-8" r="1.1" fill="${PAL.ink}"/>`;
  }

  /** Dorudon: a true whale — flukes, flippers, tiny hind legs, a blowhole. */
  function dorudon(): string {
    return at(-44, 1, `<g${mo('sway', { rot: 12, dur: 0.9, origin: '100% 50%' })}><path d="M2 -2.5Q-10 -4 -22 -9Q-19 -1 -22 6Q-10 2 2 2.5Z" fill="#5f7f92"/></g>`) +
      `<path d="M-46 0Q-30 -12 0 -13Q26 -13 40 -6Q48 -2 48 1Q44 6 30 7Q0 10 -30 6Q-40 4 -46 0Z" fill="#6f8fa2"/>` +
      `<path d="M-30 5Q0 9 30 6.5Q42 5.4 47 2Q42 7 30 8Q0 11 -30 5Z" fill="#c9d8dc"/>` +
      at(12, 6, `<g${mo('sway', { rot: 10, dur: 1.2, origin: '0% 0%' })}><path d="M2 -1Q10 9 -1 11Q0 4 -4 0Z" fill="#5f7f92"/></g>`) +
      `<path d="M-25 6l-2 4M-21 6.6l-1 3.6" stroke="#5f7f92" stroke-width="1.6" stroke-linecap="round"/>` +
      `<ellipse cx="22" cy="-12.2" rx="2.2" ry="1.2" fill="${PAL.ink}"/>` +
      `<path d="M38 1.6Q44 2 47 0.6" stroke="${PAL.ink}" stroke-width="1" fill="none" opacity="0.6"/>` + eye(32, -3, 1.8);
  }

  function palm(h: number): string {
    let fronds = '';
    for (const a of [-160, -125, -85, -45, -10, 20]) fronds += `<path d="M0 0Q12 -8 26 0Q13 -3 0 2Z" fill="#4f8a4a" transform="rotate(${a})"/>`;
    return `<path d="M0 0Q-4 ${f(-h / 2)} 3 ${-h}" stroke="#8a6a44" stroke-width="3" fill="none"/>` +
      at(3, -h, `<g${mo('sway', { rot: 4, dur: 3.6, origin: '50% 50%' })}>${fronds}</g>`);
  }

  /** In the lens: a whale's head; the nostrils wander from the snout tip to the crown. */
  function headInLens(): string {
    const trail = [[16, -15, 6.6], [-2, -22, 6.95], [-14, -26, 7.3]]
      .map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#ffffff" opacity="0.45"${once('fade', { delay: t, dur: 0.3, o: 0.45 })}/>`).join('');
    return `<rect x="-60" y="-60" width="120" height="120" fill="#2f7f9a"/>` +
      `<path d="M-62 -4Q-44 -30 -10 -30Q16 -28 28 -16L40 -8Q43 -3 38 1L24 8Q-4 20 -62 18Z" fill="#6f8fa2"/>` +
      `<path d="M-62 14Q-10 18 22 8Q32 4 38 1" stroke="#c9d8dc" stroke-width="5" fill="none"/>` +
      `<path d="M6 3Q24 4 38 -2" stroke="${PAL.ink}" stroke-width="1.4" fill="none" opacity="0.6"/>` + eye(-6, -8, 3) + trail +
      at(34, -9, `<g${once('move', { dx: -56, dy: -19, delay: 6.2, dur: 1.4, ease: 'cubic-bezier(0.4, 0, 0.3, 1)' })}><ellipse rx="3.4" ry="2" fill="${PAL.ink}"/>` +
        `<g${once('pop', { delay: 7.8, dur: 0.6 })}><path d="M-6 -4Q-8 -14 -2 -20Q2 -24 6 -20Q10 -14 6 -4Z" fill="#f4fbff" opacity="0.9"/></g></g>`);
  }

  function spout(): string {
    return `<path d="M-2 0Q-4 -18 -10 -32Q0 -42 10 -32Q4 -18 2 0Z" fill="#f4fbff" opacity="0.85"/><g fill="#f4fbff" opacity="0.7">` +
      [[-10, -34, 7], [0, -41, 8], [10, -34, 7], [-6, -26, 5], [6, -25, 5], [-15, -27, 3], [15, -26, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + '</g>';
  }

  EVO_FILMS.whales = (): string => {
    const id = 'whales';
    const s = sky(id, '#5aa6cf', '#f4e4c4');
    const glow = sun(id, 300, 56, 13, '#ffe7a8');
    const water = sea(id, SURFACE, 150);
    const lens1 = lens(`${id}-nose`, 388, 90, 46, headInLens(), 6.0, 9.0);
    let body = s.body + glow.body + `<path d="M0 150L0 128Q40 118 90 124Q140 116 180 132L200 150Z" fill="#9fb48e" opacity="0.6"/>` + water.body;
    // The Eocene shore: bare soil, shrubs and palms, no grass yet; it slopes under water.
    body += `<path d="M0 148Q90 144 160 150Q205 166 240 206Q268 236 284 270L0 270Z" fill="#b79f6e"/>` +
      `<path d="M150 150Q196 160 226 190" fill="none" stroke="${PAL.sand}" stroke-width="6" opacity="0.8"/>`;
    for (const [x, y, h] of [[34, 148, 52], [70, 147, 40]] as const) body += at(x, y, palm(h));
    for (const [x, y, r] of [[12, 150, 10], [104, 149, 8], [138, 150, 6]] as const) body += `<ellipse cx="${x}" cy="${y - r * 0.4}" rx="${r * 1.4}" ry="${r}" fill="#5f8a4c"/>`;
    // Prey: a small school the swimmers follow.
    let school = '';
    for (let k = 0; k < 7; k++) school += at(k * 13 % 40, (k * 17) % 24, `<path d="M0 0Q6 -3 12 0Q6 3 0 0ZM0 0L-4 -3L-4 3Z" fill="#cfe6ea"/>`);
    body += at(400, 196, `<g${mo('swim', { dx: 60, amp: 4, dur: 6 })}>${school}</g>`);
    // One lineage, many generations: walking in, swimming out, ever more whale-like.
    const forms = [pakicetus(), ambulocetus(), rodhocetus(), at(0, 0, dorudon(), ' scale(1.2)')];
    body += at(96, 124, `<g${once('move', { dx: 104, dy: 22, delay: 0.6, dur: 2.4, ease: 'linear' })}>` +
      `<g${once('move', { dx: 128, dy: 26, delay: 3.0, dur: 3.0, ease: 'cubic-bezier(0.3, 0, 0.6, 1)' })}>` +
      `<g${once('move', { dy: -14, delay: 6.6, dur: 1.4 })}><g${mo('float', { amp: 1.5, dur: 2.2 })}>` +
      morph(forms, [3.8, 4.7, 5.6], 0.8) +
      at(26, -20, `<g${once('fade', { delay: 9.2, dur: 0.3 })}><g${mo('pulse', { dur: 3.2, delay: 9.2, origin: '50% 100%', s: 1.15 })}>${spout()}</g></g>`) +
      '</g></g></g></g>');
    body += at(200, SURFACE, `<ellipse rx="16" ry="3.5" fill="none" stroke="#ffffff" stroke-width="2"${once('burst', { delay: 3.0, s: 2.4 })}/>`);
    // The calf swims up to its mother to drink.
    body += at(314, 176, `<g${once('enter', { dx: -70, dy: 12, delay: 9.4, dur: 1.8 })}><g${mo('float', { amp: 1.5, dur: 1.8, delay: 0.4 })}>${at(0, 0, dorudon(), ' scale(0.55)')}</g></g>`);
    // The water in front of everything submerged.
    body += `<path d="M196 ${SURFACE}L480 ${SURFACE}L480 270L284 270Q268 236 240 206Q218 176 196 ${SURFACE}Z" fill="#1f6f8c" opacity="0.34"/>`;
    body += timelapse(300, 40, ['Pakicetus · 50 Mio. J.', 'Ambulocetus · 49 Mio. J.', 'Rodhocetus · 47 Mio. J.', 'Dorudon · 40 Mio. J.'], [3.0, 3.8, 4.7, 5.6], 6.8);
    body += lens1.body + during(6.9, 9.0, tag(388, 152, 'Blasloch', 6.9), 0.4) + sparkle(366, 62, '#e8fbff', 6.6, 1.1);
    body += motes(id, 10, 'rgba(255,245,210,0.7)', 20, 200, 60, 140, 5, 1.2);
    return film(id, s.defs + glow.defs + water.defs + lens1.defs, body);
  };
}
