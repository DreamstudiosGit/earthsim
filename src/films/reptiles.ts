/* =============================================================================
 * SimEarth 2.0 — evolution film: reptiles
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * An amphibian lays jelly eggs in a pond; Hylonomus lays a shelled egg on dry
 * ground; the lens cuts it open: the embryo floats in its own little pond
 * (the amnion) and feeds on a shrinking yolk while gas passes the shell; then
 * the young hatches and runs off into the dry, sunny land.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** An early four-legged amphibian (temnospondyl-like), side view facing right, belly on y = 0. */
  function amphibian(): string {
    return `<path d="M-24 -3L-28 3L-32 4M10 -3L13 3L17 4" stroke="#4e5a2a" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M36 -8Q34 -14 24 -15Q16 -15 12 -13Q0 -17 -14 -15Q-24 -13 -30 -10Q-48 -6 -66 -6Q-48 -2 -30 -3Q-18 -1 -6 -2Q6 -1 12 -3Q22 -2 30 -3Q36 -4 36 -8Z" fill="#6f7f3c"/>` +
      `<path d="M-30 -10Q-48 -13 -66 -6" stroke="#9aa86a" stroke-width="3" fill="none" opacity="0.7"/><path d="M-20 -4Q0 -1 30 -4" stroke="#d8d49a" stroke-width="2.4" fill="none" opacity="0.7"/>` +
      `<ellipse cx="-8" cy="-11" rx="2.4" ry="1.4" fill="#4a5626"/><ellipse cx="2" cy="-12.6" rx="2" ry="1.2" fill="#4a5626"/><ellipse cx="-18" cy="-10" rx="2" ry="1.2" fill="#4a5626"/>` +
      `<path d="M36 -7Q28 -6 18 -6.4" stroke="${PAL.ink}" stroke-width="0.8" fill="none" opacity="0.6"/>` + eye(25, -12.6, 2) +
      `<path d="M-20 -3L-24 3L-21 5M14 -3L18 2L22 3" stroke="#6f7f3c" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  /** A clutch of jelly eggs in the water, each with a dark embryo; they appear one by one from `t0` s. */
  function spawn(x: number, y: number, t0: number): string {
    const rnd = seeded(31);
    let out = '';
    for (let k = 0; k < 11; k++) {
      const [ex, ey] = [x + (rnd() - 0.5) * 34, y + (rnd() - 0.5) * 16];
      out += `<g transform="translate(${f(ex)} ${f(ey)})"><g${once('pop', { delay: f(t0 + k * 0.12), dur: 0.5 })}>` +
        `<circle r="5.2" fill="rgba(230,245,240,0.55)" stroke="rgba(255,255,255,0.8)" stroke-width="0.8"/><circle r="2" fill="#2a2a20"/></g></g>`;
    }
    return `<g${mo('float', { amp: 1.4, dur: 2.6 })}>${out}</g>`;
  }

  /**
   * The lens: the egg cut open. Inside the porous shell the embryo floats in
   * the fluid of the amnion; its yolk shrinks as it grows; oxygen comes in
   * through the shell, carbon dioxide goes out.
   */
  function eggSection(): string {
    let out = `<rect x="-70" y="-70" width="140" height="140" fill="#e9dcb8"/>` +
      `<ellipse rx="54" ry="42" fill="#f6efd8" stroke="#cdbb92" stroke-width="5"/><ellipse rx="49" ry="37" fill="#fbf7ea"/>`;
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      out += `<circle cx="${f(Math.cos(a) * 54)}" cy="${f(Math.sin(a) * 42)}" r="0.9" fill="#a8946a"/>`;
    }
    // The yolk: big at first, used up as the embryo grows.
    out += `<path d="M6 8Q14 12 20 14" stroke="#e8a090" stroke-width="2.4" fill="none"/>` +
      `<g transform="translate(26 14)"><g${once('scale', { s: 0.4, delay: 6.3, dur: 2.6, origin: '50% 50%' })}><circle r="17" fill="#f3b33d"/><circle cx="-5" cy="-5" r="5" fill="#ffe08a"/></g></g>`;
    // The amnion: a little pond of its own, with the embryo floating in it.
    out += `<g transform="translate(-12 -4)"><g${once('scale', { s: 1.18, delay: 6.3, dur: 2.6, origin: '50% 50%' })}>` +
      `<ellipse rx="27" ry="22" fill="rgba(120,195,235,0.55)" stroke="#5aa6d6" stroke-width="1.4"/>` +
      `<g${mo('float', { amp: 1.2, dur: 1.6 })}><g transform="scale(1.1)"><path d="M8 -6Q12 4 4 9Q-6 13 -11 4Q-14 -5 -6 -11" stroke="#f0b49c" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<path d="M-6 -11Q-12 -8 -14 -2" stroke="#f0b49c" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<circle cx="6" cy="-9" r="7" fill="#f0b49c"/><circle cx="8.4" cy="-10" r="2.4" fill="${PAL.ink}"/><path d="M-2 8l-2 5M4 8l1 5" stroke="#d9906e" stroke-width="1.6" stroke-linecap="round"/></g></g></g></g>`;
    // Gas through the pores: oxygen in (blue), carbon dioxide out (grey).
    [-150, -110, -60, -20, 30, 70, 120, 160].forEach((deg, k) => {
      const a = (deg * Math.PI) / 180;
      const [px, py] = [Math.cos(a) * 54, Math.sin(a) * 42];
      const inward = k % 2 === 0;
      out += `<g transform="translate(${f(px)} ${f(py)}) rotate(${deg - 90})"><circle cy="${inward ? 9 : -6}" r="2" fill="${inward ? '#8fd4ff' : '#9a9a9a'}"` +
        `${mo('rise', { dy: inward ? -16 : 16, dur: 1.4, delay: f(6.6 + k * 0.17), o: 0.95 })}/></g>`;
    });
    return out;
  }

  /** An early conifer (Walchia-like) of the drier uplands: tiers of drooping branches on a slim trunk. */
  function walchia(x: number, y: number, h: number, col: string): string {
    let tiers = '';
    for (let k = 0; k < 5; k++) {
      const ty = -h + k * h * 0.16;
      const w = 5 + k * 4;
      tiers += `M0 ${f(ty)}L${-w} ${f(ty + h * 0.2)}L${w} ${f(ty + h * 0.2)}Z`;
    }
    return `<g transform="translate(${x} ${y})"><path d="M0 0V${-h}" stroke="#6b5a40" stroke-width="2.4"/><path d="${tiers}" fill="${col}"/></g>`;
  }

  /** The egg on the ground, base at the origin, lying on its side: rocks, cracks and opens from `t` s. */
  function egg(t: number): string {
    const zig = 'M-9.6 -7.4L-6 -5L-2.5 -8.6L1 -5L4.5 -8.6L7.5 -5.6L9.6 -7.4';
    return `<ellipse cx="1" cy="0.6" rx="11" ry="2.4" fill="#9c8058" opacity="0.45"/>` +
      `<g${mo('reptiles-wobble', { rot: 9, dur: 0.3, delay: t, n: 3, origin: '50% 100%' })}>` +
      `<path d="${zig}A9.6 7.4 0 0 1 -9.6 -7.4Z" fill="#f3ead2" stroke="#cdbf9c" stroke-width="0.6"/>` +
      `<g${once('move', { dx: 18, dy: 12, delay: t + 1.05, dur: 0.5, ease: 'ease-in' })}><g${once('move', { dx: 3, dy: -12, delay: t + 0.85, dur: 0.2, ease: 'ease-out' })}>` +
      `<path d="${zig}A9.6 7.4 0 0 0 -9.6 -7.4Z" fill="#f3ead2" stroke="#cdbf9c" stroke-width="0.6"/><ellipse cx="-3" cy="-11.4" rx="3" ry="1.3" fill="#ffffff" opacity="0.8"/></g></g>` +
      `<g${once('fadeout', { delay: t + 0.85, dur: 0.05 })}><ellipse cy="-7.4" rx="9.6" ry="7.4" fill="#f3ead2" stroke="#cdbf9c" stroke-width="0.6"/><ellipse cx="-3" cy="-11.4" rx="3" ry="1.3" fill="#ffffff" opacity="0.8"/>` +
      `<path d="${zig}" stroke="#8a7650" stroke-width="0.9" fill="none"${once('draw', { len: 28, delay: t + 0.4, dur: 0.4 })}/></g></g>`;
  }

  EVO_FILMS.reptiles = (): string => {
    const id = 'reptiles';
    const s = sky(id, '#5a9cc0', '#f4e4bc');
    const glow = sun(id, 404, 74, 13, '#ffe39a');
    const ex = 330, ey = 200;
    const [lx, ly] = [ex - 71, ey - 71];
    const lensView = lens(`${id}-lens`, lx, ly, 62, eggSection(), 6.0, 9.0);
    let body = s.body + glow.body + hills(186, 14, '#c4b48e', 4, 0.6);
    // Wet forest of scale trees behind the pond, early conifers on the drier ground.
    body += `<g opacity="0.5">${[[24, 118], [84, 146], [150, 104]].map(([x, h]) => landScaleTree(x, 204, h, '#6f8a72')).join('')}</g>`;
    body += `<g opacity="0.55">${[[300, 74], [350, 96], [470, 84]].map(([x, h]) => walchia(x, 200, h, '#7f9466')).join('')}</g>`;
    body += `<path d="M0 204Q120 200 220 202Q340 198 480 196L480 270L0 270Z" fill="url(#${id}-sand)"/>`;
    // The pond: the amphibian lays its jelly eggs into the water.
    const pond = 'M20 203Q110 199 200 203Q190 232 110 234Q34 232 20 203Z';
    body += `<path d="${pond}" fill="#5a6a4a"/>` + spawn(150, 215, 1.0);
    body += `<g transform="translate(120 203) scale(-1.3 1.3)"><g${once('move', { dx: 40, dy: 12, delay: 3, dur: 1.4, ease: 'ease-in' })}><g${once('fadeout', { delay: 3.3, dur: 0.9 })}>` +
      `<g${mo('float', { amp: 0.8, dur: 1.8 })}>${amphibian()}</g></g></g></g>`;
    body += `<path d="${pond}" fill="url(#${id}-pond)"/>` +
      `<g${mo('wave', { dx: -40, dur: 3.4 })}><path d="${wavePath(-20, 220, 203, 1.2)}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.3"/></g>` +
      `<rect x="-40" y="196" width="60" height="12" fill="url(#${id}-sand)"/><rect x="200" y="194" width="60" height="14" fill="url(#${id}-sand)"/>`;
    body += during(0, 3.4, tag(88, 220, 'Eier im Wasser', 1.4), 0.5);
    for (const [x, h] of [[28, 30], [196, 36], [186, 24]] as const) {
      body += `<path d="M${x} 206V${206 - h}" stroke="#5f9e50" stroke-width="2.4" stroke-linecap="round"/><path d="M${x - 5} ${206 - h * 0.4}l5 -4l5 4M${x - 5} ${206 - h * 0.7}l5 -4l5 4" stroke="#5f9e50" stroke-width="1.4" fill="none"/>`;
    }
    // Hylonomus comes out from behind the hollow stump, lays its egg and walks off.
    body += `<g transform="translate(304 200) scale(-1.6 1.6)"><g${once('enter', { dx: -110, dy: 0, delay: 3.0, dur: 0.9, ease: 'linear' })}>` +
      `<g${once('move', { dx: 70, dy: 0, delay: 5.0, dur: 0.8, ease: 'ease-in' })}><g${once('fadeout', { delay: 5.3, dur: 0.4 })}>` +
      `${landLizard('#8a7a44', '#5e5226', [3.0, 5.8])}</g></g></g></g>`;
    body += `<g transform="translate(448 202) scale(1.25)"><path d="M-26 0Q-36 2 -46 7M26 0Q38 1 48 6" stroke="#6a4c30" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M-24 0L-20 -44Q0 -50 20 -44L24 0Z" fill="#7a5a3a"/><path d="M-12 -2L-10 -42M2 -1L3 -45M14 -2L12 -42" stroke="#5e4228" stroke-width="2.4" opacity="0.6"/>` +
      `<ellipse cx="0" cy="-45" rx="20" ry="5" fill="#9a7650"/><ellipse cx="0" cy="-45" rx="15" ry="3.4" fill="#3a2a1a"/></g>`;
    body += `<ellipse cx="408" cy="205" rx="26" ry="8" fill="#b39a74"/><ellipse cx="402" cy="200" rx="18" ry="4.4" fill="#dcc49a"/>`;
    body += landFern(212, 206, -28, 42, '#5f8f45', 3.8) + landFern(218, 206, 32, 38, '#557f3e', 4.3) + landFern(208, 208, 6, 48, '#5f8f45', 4);
    // The shelled egg: laid on dry ground; its hard shell gleams.
    body += `<g transform="translate(${ex} ${ey}) scale(1.7)"><g${once('pop', { delay: 4.2, dur: 0.6 })}>${egg(9.0)}` +
      `<g${once('fade', { delay: 4.9, dur: 0.4 })}><path d="M-5 -12.6Q0 -14.4 5 -12.6" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round"${mo('twinkle', { dur: 0.8, o: 0.3, n: 4 })}/></g></g></g>`;
    // The young hatches and runs off into the sunny dry land.
    body += `<g transform="translate(${ex + 6} ${ey}) scale(0.9)"><g${once('pop', { delay: 9.85, dur: 0.4 })}>` +
      `<g${once('move', { dx: 78, dy: -5, delay: 10.3, dur: 1.2, ease: 'cubic-bezier(.3,0,.5,1)' })}>${landLizard('#a09050', '#6a5a2a', [10.3, 11.5])}</g></g></g>`;
    body += lensView.body + during(0, 9.0, tag(lx - 12, ly - 34, 'Amnion', 6.4) + tag(lx + 30, ly + 44, 'Dotter', 6.8), 0.5);
    body += sparkle(lx - 12, ly - 4, '#fff3c4', 6.6, 0.9);
    body += motes(id, 10, 'rgba(255,240,200,0.7)', 250, 470, 110, 190, 8, 1.1);
    const defs = s.defs + glow.defs + lensView.defs + vgrad(`${id}-sand`, [[0, '#e6cc94'], [1, '#b8955f']]) +
      vgrad(`${id}-pond`, [[0, 'rgba(120,190,200,0.45)'], [1, 'rgba(40,90,100,0.7)']]);
    return film(id, defs, body);
  };
}
