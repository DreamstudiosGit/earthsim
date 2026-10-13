/* =============================================================================
 * SimEarth 2.0 — evolution film: molluscs
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A snail rasps algae off a rock with its radula, leaving a bare track. A
 * shelled cephalopod in section: its shell grows at the rim and walls off
 * chamber after chamber; water is pumped out, gas fills them and it rises
 * like a submarine. A squid squeezes its mantle, jets away, leaves ink.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The cone's sections from the apex: septa grow at these x, the shell's rim moves along them. */
  const A = [150, 168, 188, 210, 234, 260, 288, 318, 350];
  const half = (x: number): number => 3 + (x - 150) * 0.17;
  const WATER = '#4f9cc0';

  /** `inner` appears at (x, y) at `t` s, travels by (dx, dy) over `dur` s and fades away. */
  function flit(x: number, y: number, dx: number, dy: number, t: number, dur: number, inner: string): string {
    return seaAt(x, y, `<g${once('fade', { delay: f(t), dur: 0.1 })}><g${once('move', { dx: f(dx), dy: f(dy), delay: f(t), dur, ease: 'linear' })}>` +
      `<g${once('fadeout', { delay: f(t + dur * 0.7), dur: f(dur * 0.3) })}>${inner}</g></g></g>`);
  }

  /** A sea snail gliding to the right on its foot. */
  function snail(): string {
    return `<path d="M-26 0Q-28 -6 -16 -6.5L16 -7Q26 -8 31 -3Q33 0 29 0Z" fill="#efd8bb"/>` +
      `<g${mo('sway', { rot: 8, dur: 1.8, origin: '0% 100%' })}><path d="M24 -6Q28 -14 34 -16M21 -6.5Q23 -14 27 -18" stroke="#e2c39c" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>` +
      `<circle cx="25.5" cy="-7.6" r="1.3" fill="${PAL.ink}"/>` +
      `<ellipse cx="-2" cy="-16" rx="15" ry="11.5" fill="#d48f52" transform="rotate(-12 -2 -16)"/>` +
      `<circle cx="-13" cy="-25" r="7" fill="#e2a467"/><circle cx="-19" cy="-30.5" r="3.8" fill="#eeba80"/><circle cx="-22" cy="-33.5" r="1.6" fill="#f6d2a2"/>` +
      `<path d="M-15 -9Q-4 -4 10 -9M-16 -16Q-6 -12 8 -18M-18 -24Q-12 -20 -8 -28" fill="none" stroke="#9c5a2a" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>`;
  }

  /** Inside the lens: the radula, a ribbon of hooked teeth, rasping algae off the rock. */
  function radula(): string {
    let out = `<rect x="-60" y="-60" width="120" height="120" fill="#2c5f6e"/><path d="M-60 26Q0 18 60 24L60 60L-60 60Z" fill="#8a8172"/>`;
    for (let k = 0; k < 9; k++) {
      out += `<circle cx="${-44 + k * 11}" cy="${f(20 - Math.sin(k) * 1.5)}" r="4.6" fill="#5aa34a" stroke="#2f6b36" stroke-width="1"${once('fadeout', { delay: f(0.9 + k * 0.2), dur: 0.3 })}/>`;
    }
    let teeth = '';
    for (let r = 0; r < 6; r++) {
      const a = (-60 + r * 22) * Math.PI / 180, cx = -26 + Math.cos(a) * 30, cy = -18 + Math.sin(a) * 30 + 14;
      for (let k = -1; k <= 1; k++) teeth += `<path d="M${f(cx + k * 6 - 2.5)} ${f(cy)}l2.5 6l2.5 -6Z" transform="rotate(${f(a * 180 / Math.PI - 90)} ${f(cx)} ${f(cy)})"/>`;
    }
    out += `<g${mo('pulse', { dur: 0.6, delay: 0.8 }, 'molluscs-rasp')}><path d="M-70 -40Q-20 -50 4 -4Q12 14 -8 22Q-30 20 -70 0Z" fill="#e79a8c"/>` +
      `<g fill="#fff6e4" stroke="#b07a62" stroke-width="0.6">${teeth}</g></g>`;
    for (let k = 0; k < 5; k++) out += seaAt(-4 + k * 8, 16, `<circle r="2" fill="#7ed957"${mo('rise', { dy: -40, dur: 0.9, delay: f(1 + k * 0.35), o: 1 })}/>`, ' rotate(-40)');
    return out;
  }

  /** The shell in section: wall pieces k from A[k] to A[k+1], chambers filled with water. */
  function shellPiece(k: number): string {
    const x0 = A[k], x1 = A[k + 1], h0 = half(x0), h1 = half(x1);
    return `<path d="M${x0} ${f(-h0)}L${x1} ${f(-h1)}L${x1} ${f(h1)}L${x0} ${f(h0)}Z" fill="#f3e3c4" fill-opacity="0.35"/>` +
      `<path d="M${x0} ${f(-h0 - 1.6)}L${x1} ${f(-h1 - 1.6)}M${x0} ${f(h0 + 1.6)}L${x1} ${f(h1 + 1.6)}" stroke="#f0d4a4" stroke-width="3.6"/>` +
      `<path d="M${x0 + 3} ${f(-h0 - 3.6)}L${x1} ${f(-h1 - 3.6)}" stroke="#b97a4a" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  }

  /** Chamber k (between septa k and k+1): water at first, gas after `gas` s. */
  function chamber(k: number, gas: number): string {
    const x0 = A[k], x1 = A[k + 1], h0 = half(x0), h1 = half(x1);
    const d = `M${x0} ${f(-h0)}L${x1} ${f(-h1)}Q${x1 - 9} 0 ${x1} ${f(h1)}L${x0} ${f(h0)}Q${x0 - 9} 0 ${x0} ${f(-h0)}Z`;
    return `<path d="${d}" fill="${WATER}" opacity="0.75"${once('fadeout', { delay: gas, dur: 0.7 })}/>` +
      `<path d="${d}" fill="#fff6d6"${once('fade', { delay: gas + 0.2, dur: 0.7, o: 0.85 })}/>`;
  }

  /** A septum at A[k], dished toward the apex, drawn when the body has moved past it. */
  function septum(k: number, at: number): string {
    const x = A[k], h = half(x);
    return `<path d="M${x} ${f(-h)}Q${x - 12} 0 ${x} ${f(h)}" fill="none" stroke="#f0d4a4" stroke-width="2.6"${at > 0 ? once('draw', { len: f(h * 2.4), delay: at, dur: 0.4 }) : ''}/>` +
      `<circle cx="${x - 6}" r="2.6" fill="#c98a5a"/>`;
  }

  /** The animal in its body chamber, rear at (0, 0), head and arms out to the right. */
  function nautiloid(): string {
    let arms = '';
    for (let k = 0; k < 7; k++) arms += `<path d="M56 ${f(-6 + k * 2)}Q70 ${f(-12 + k * 4)} 82 ${f(-14 + k * 4.6)}"/>`;
    return `<g${mo('sway', { rot: 5, dur: 1.4, origin: '0% 50%' })}><g fill="none" stroke="#efb79a" stroke-width="2.2" stroke-linecap="round">${arms}</g></g>` +
      `<path d="M0 -10Q20 -16 50 -15L58 -9Q62 0 58 9L50 15Q20 16 0 10Q-4 0 0 -10Z" fill="#f2b896"/>` +
      `<path d="M44 -15Q56 -18 60 -10L50 -8Z" fill="#c9805a"/><path d="M48 10L58 15L54 9Z" fill="#d98c6a"/>` + eye(50, -3, 3.2);
  }

  /** A squid facing left: mantle first, arms and two long tentacles trailing. */
  function squid(): string {
    let arms = '';
    for (let k = 0; k < 6; k++) arms += `<path d="M10 ${f(-3 + k * 1.2)}Q22 ${f(-5 + k * 2)} 32 ${f(-6 + k * 2.4)}"/>`;
    return `<g${mo('sway', { rot: 5, dur: 0.7, origin: '0% 50%' })}><g fill="none" stroke="#eba68c" stroke-width="2" stroke-linecap="round">${arms}<path d="M10 0Q28 -3 44 -5M10 1Q28 5 44 7"/></g></g>` +
      `<g${once('scale', { delay: 9.9, dur: 0.5 }, 'molluscs-squeeze')}><path d="M-36 0L-24 -12L-19 -4ZM-36 0L-24 12L-19 4Z" fill="#e89f84"/>` +
      `<path d="M-36 0Q-24 -9 2 -8.5Q8 -8 8 0Q8 8 2 8.5Q-24 9 -36 0Z" fill="#f5c3a8"/>` +
      `<circle cx="-18" cy="-2" r="1.3" fill="#c66a5a" opacity="0.6"/><circle cx="-8" cy="2" r="1.6" fill="#c66a5a" opacity="0.6"/></g>` +
      `<path d="M4 6L14 9L12 4Z" fill="#e89f84"/><ellipse cx="10" cy="0" rx="5.5" ry="6" fill="#f5c3a8"/>` + eye(10, -1, 2.6);
  }

  EVO_FILMS.molluscs = (): string => {
    const id = 'molluscs';
    const water = underwater(id, 0.1);
    let body = water.body + hills(212, 16, '#3f8f96', 4, 0.4) + `<path d="M0 270L0 222Q120 214 240 220T480 218L480 270Z" fill="#d2bb86"/>`;

    // Beat 1: a snail grazes the algal film; the lens shows its radula at work.
    // Behind the snail the rock is already rasped bare; ahead lies the green film.
    const rnd = seeded(17), x0 = 100, speed = 40;
    let rock = `<path d="M-10 270L-10 214Q4 202 40 201L272 200Q300 202 310 220Q316 244 320 270Z" fill="url(#${id}-rock)"/>` +
      `<path d="M14 199.5${'l2 -1.6l2 1.6'.repeat(71)}" fill="none" stroke="#e8decb" stroke-width="0.9" opacity="0.8"/>`;
    for (let x = x0 + 52; x < 300; x += 6) {
      rock += `<circle cx="${f(x + rnd() * 2)}" cy="${f(199.5 - rnd() * 1.5)}" r="${f(3.4 + rnd() * 1.2)}" fill="${x % 12 ? '#5aa34a' : '#3f8a3a'}"${once('fadeout', { delay: f((x - x0 - 52) / speed), dur: 0.4 })}/>`;
    }
    rock += seaAt(x0, 201, `<g${once('move', { dx: speed * 4, dur: 4, ease: 'linear' })}>${seaAt(0, 0, snail(), ' scale(1.6)')}</g>`);
    body += during(0, 3.3, rock, 0.5);
    const glass = lens(`${id}-lens`, 340, 108, 54, radula(), 0.5, 3.1);
    body += glass.body + during(0, 3.1, tag(340, 186, 'Radula', 1.1), 0.4);

    // Beats 2–3: the chambered shell grows, then fills with gas and rises.
    let shell = '';
    for (let k = 0; k < 8; k++) {
      const piece = shellPiece(k);
      shell += k < 5 ? piece : `<g${once('grow', { delay: f(3.6 + (k - 5) * 0.73), dur: 0.7, ease: 'linear', origin: '0% 50%' }, 'molluscs-rim')}>${piece}</g>`;
    }
    let chambers = '', septa = '';
    for (let k = 0; k < 6; k++) chambers += during(k < 3 ? 0 : [4.28, 5.01, 5.8][k - 3], Infinity, chamber(k, 6.2 + k * 0.22), 0.4);
    for (let k = 1; k < 7; k++) septa += septum(k, k < 4 ? 0 : [4.28, 5.01, 5.8][k - 4] - 0.1);
    let siphuncle = `<path d="M152 0L210 0" stroke="#c98a5a" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M210 0L288 0" stroke="#c98a5a" stroke-width="3" stroke-linecap="round"${once('draw', { len: 78, dur: 2.2, delay: 3.6, ease: 'linear' })}/>`;
    // Water leaves the chambers through the siphuncle, drop by drop.
    for (let k = 0; k < 4; k++) siphuncle += flit(160, 0, 128, 0, 6.2 + k * 0.3, 1.2, `<circle r="2.6" fill="${WATER}" stroke="#d8f4ff" stroke-width="0.8"/>`);
    const animal = seaAt(210, 0, `<g${once('move', { dx: 78, delay: 3.6, dur: 2.2, ease: 'linear' })}>` +
      seaPivot(once('scale', { s: 1.4, delay: 3.6, dur: 2.2, ease: 'linear' }), nautiloid(), 90) + '</g>');
    const cone = during(2.9, 9, chambers + shell + septa + siphuncle + animal +
      tag(214, -42, 'Gaskammern', 6.8) + during(0, 6.1, tag(330, -46, 'Schale wächst am Rand', 4), 0.4), 0.6);
    body += seaAt(-10, 172, `<g${once('move', { dy: -58, delay: 6.9, dur: 1.9, ease: 'ease-in-out' })}><g${mo('float', { amp: 2, dur: 2.4, delay: 9 })}>${cone}</g></g>`);
    body += sparkle(214, 172, '#fff6d0', 6.6);

    // Beat 4: a squid squeezes its mantle, jets off and leaves a cloud of ink.
    let jet = '';
    const sx = 330, sy = 156;
    for (let k = 0; k < 7; k++) jet += flit(sx + 24 + k * 3, sy + 10 + (k % 3) * 2 - 2, 80, 6 - k * 2, 10.1 + k * 0.05, 0.7, `<circle r="${2.4 + (k % 2)}" fill="#eafcff"/>`);
    body += seaAt(sx + 8, sy, during(10.1, Infinity, `<g${once('move', { dx: 14, dy: -6, dur: 6, delay: 10.2 })}>` +
      `<g${once('pop', { delay: 10.1, dur: 1.2 })}><circle r="22" fill="#1c2230" opacity="0.8"/><circle cx="20" cy="-10" r="17" fill="#1c2230" opacity="0.7"/>` +
      `<circle cx="12" cy="14" r="15" fill="#262e3e" opacity="0.7"/><circle cx="36" cy="5" r="11" fill="#262e3e" opacity="0.6"/><circle cx="-14" cy="-12" r="9" fill="#262e3e" opacity="0.5"/></g></g>`, 0.2));
    body += jet + seaAt(sx, sy, `<g${once('enter', { dx: 170, dy: 10, delay: 9.1, dur: 0.9 })}><g${once('move', { dx: -250, dy: 6, delay: 10.15, dur: 0.9, ease: 'cubic-bezier(.2,.9,.3,1)' })}>` +
      `<g${mo('float', { amp: 2, dur: 1.4 })}>${seaAt(0, 0, squid(), ' scale(1.7)')}</g></g></g>`);

    const defs = water.defs + glass.defs + vgrad(`${id}-rock`, [[0, '#9a8f7c'], [1, '#5f574b']]);
    return film(id, defs, body);
  };
}
