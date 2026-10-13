/* =============================================================================
 * SimEarth 2.0 — evolution film: dinosaurs
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A sprawling reptile crawls toward us, wriggling; an x-ray from the front
 * shows its line's hind legs turning under the body over generations; then
 * Eoraptor sprints upright; in the Jurassic a sauropod lifts its long neck,
 * air sacs glowing in neck and body.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A sprawling reptile seen from the front, ground at the origin: legs out to the sides, belly low, body wriggling. */
  function crawler(): string {
    const [skin, dark, light] = ['#9a8a4e', '#6a5e30', '#c4b47a'];
    const arm = (sg: number, delay: number): string =>
      `<g${mo('float', { amp: 2.4, dur: 0.45, delay })}><path d="M${sg * 20} -18L${sg * 48} -21L${sg * 50} -2" stroke="${skin}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M${sg * 50} -1l${sg * -6} 2M${sg * 50} -1l${sg * -1} 3M${sg * 50} -1l${sg * 4} 2.6M${sg * 50} -1l${sg * 7} 0" stroke="${dark}" stroke-width="2" stroke-linecap="round"/></g>`;
    return `<ellipse cy="1" rx="62" ry="5" fill="rgba(80,50,20,0.25)"/>` +
      `<g${mo('sway', { rot: 14, dur: 0.45, delay: -0.45, origin: '0% 100%' })}><path d="M10 -30Q40 -40 58 -52Q66 -58 70 -54Q56 -40 14 -22Z" fill="${dark}"/></g>` +
      `<path d="M-24 -24L-42 -22L-44 -4M24 -24L42 -22L44 -4" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<ellipse cy="-25" rx="34" ry="14" fill="${dark}"/><path d="M-20 -34q4 -3 8 0M-4 -36q4 -3 8 0M12 -34q4 -3 8 0" stroke="#4a4020" stroke-width="2" fill="none"/>` +
      arm(-1, 0) + arm(1, -0.45) +
      `<ellipse cy="-19" rx="18" ry="12" fill="${skin}"/><ellipse cy="-12" rx="14" ry="7" fill="${light}"/>` +
      `<circle cx="-9" cy="-27" r="4.6" fill="${skin}"/><circle cx="9" cy="-27" r="4.6" fill="${skin}"/>` + eye(-9, -27.5, 2.4, 0) + eye(9, -27.5, 2.4, 0.2) +
      `<path d="M-3.4 -15.6h0.1M3.4 -15.6h0.1" stroke="${PAL.ink}" stroke-width="1.6" stroke-linecap="round"/><path d="M-11 -9Q0 -5 11 -9" stroke="${PAL.ink}" stroke-width="1" fill="none" opacity="0.7"/>`;
  }

  /**
   * The x-ray of hips and hind legs from the front, ground at the origin.
   * `h` is the height of the hip sockets, `knee` where the thigh bone ends.
   */
  function hips(h: number, kx: number, ky: number): string {
    const bone = '#d4f2ff';
    let legs = '';
    for (const sg of [-1, 1]) {
      const [sx, ax] = [sg * 16, sg * (kx + 2)];
      legs += `<path d="M${sx} ${-h}L${sg * kx} ${ky}" stroke="${bone}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M${sg * kx} ${ky}L${ax} -5" stroke="${bone}" stroke-width="4" stroke-linecap="round"/><path d="M${ax} -4l${sg * 7} 4M${ax} -4l${sg * 2} 4M${ax} -4l${sg * -3} 4" stroke="${bone}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="${sg * kx}" cy="${ky}" r="3.6" fill="${bone}"/>` +
        `<path d="M${sx} ${-h}L${sg * kx} ${ky}L${ax} -5" stroke="rgba(150,220,255,0.22)" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return `<ellipse cy="${-h - 6}" rx="32" ry="17" fill="rgba(150,220,255,0.1)" stroke="rgba(150,220,255,0.45)" stroke-width="1.2"/>` + legs +
      `<path d="M-6 ${-h - 12}L-22 ${-h - 8}L-21 ${-h + 2}L-12 ${-h + 4}L-6 ${-h - 4}ZM6 ${-h - 12}L22 ${-h - 8}L21 ${-h + 2}L12 ${-h + 4}L6 ${-h - 4}Z" fill="${bone}"/>` +
      `<circle cy="${-h - 10}" r="6" fill="${bone}"/><path d="M0 ${-h - 16}V${-h - 26}" stroke="${bone}" stroke-width="4" stroke-linecap="round"/><circle cy="${-h - 10}" r="2.4" fill="#0b2236"/>` +
      `<circle cx="-16" cy="${-h}" r="4.4" fill="#0b2236" stroke="${bone}" stroke-width="1.6"/><circle cx="16" cy="${-h}" r="4.4" fill="#0b2236" stroke="${bone}" stroke-width="1.6"/>`;
  }

  /** Eoraptor sprinting, side view facing right, feet on y = 0: two upright legs, long tail, grasping hands, small toothy head. */
  function eoraptor(): string {
    return `<g transform="translate(0 -22)">${landStride(22, 3.2, '#c97c3c', '#9a5a2a', 0.14, 32)}</g>` +
      `<path d="M-2 -30Q-24 -30 -52 -25Q-24 -20 -2 -21Z" fill="#d58a48"/><path d="M-8 -30Q4 -34 13 -28Q17 -22 10 -19Q0 -17 -7 -21Z" fill="#d58a48"/>` +
      `<path d="M9 -27Q14 -37 21 -39Q29 -40 32 -36Q31 -33 25 -33Q19 -31 15 -21Z" fill="#d58a48"/><path d="M-4 -29l3 -1M-14 -28l3 -1M-26 -26l3 -1M-38 -25l3 -0.6M2 -30l3 -0.6" stroke="#9a5a2a" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M12 -22l4 5l3 -1M14 -17l1.6 1.6" stroke="#b06a32" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M26 -33.4l1 1.4l1 -1.2l1 1.4" stroke="#ffffff" stroke-width="0.7" fill="none"/>` + eye(23.4, -36.4, 1.3);
  }

  /** The sauropod: body and pillar legs at the origin (shoulder), the neck as its own group; air sacs glow in both from 10 s. */
  function sauropod(): string {
    const sacs = (body: string): string => `<g${once('fade', { delay: 10, dur: 0.8 })}><g${mo('pulse', { s: 1.06, dur: 1.6, origin: '50% 50%' })}>${body}</g></g>`;
    const neckSacs = [[-10, -6], [-32, -17], [-52, -28], [-72, -39], [-90, -49]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.4" fill="#9fe6ff" opacity="0.8" transform="rotate(-30 ${x} ${y})"/>`).join('');
    const neck = `<path d="M12 8Q-40 -10 -100 -50L-106 -64Q-46 -34 20 -22Z" fill="#a8885e"/>` +
      `<path d="M10 -10Q-40 -26 -100 -58" stroke="#c8aa7c" stroke-width="4" fill="none" opacity="0.7"/>${sacs(neckSacs)}` +
      `<g transform="translate(-104 -58)"><g${mo('sway', { rot: 6, dur: 1.1, delay: 11, origin: '100% 60%' })}>` +
      `<path d="M8 -2Q6 -12 -4 -13Q-10 -13 -12 -8Q-20 -7 -22 -2Q-22 4 -14 5Q-2 7 8 4Z" fill="#a8885e"/><path d="M-21 0Q-12 1 -4 -1" stroke="${PAL.ink}" stroke-width="0.9" fill="none" opacity="0.6"/>${eye(-6, -6, 1.8)}</g></g>`;
    return `<path d="M-6 30v52M14 34v48M70 34v48M88 30v52" stroke="#8a6c46" stroke-width="15" stroke-linecap="round"/>` +
      `<g${once('dinosaurs-neck', { delay: 9.7, dur: 1.6, origin: '95% 93%' })}>${neck}</g>` +
      `<path d="M100 0Q140 10 170 40L160 46Q130 24 100 30Z" fill="#a8885e"/><ellipse cx="44" cy="20" rx="78" ry="42" fill="#a8885e"/><path d="M-20 36Q40 56 110 36" stroke="#8a6c46" stroke-width="3" fill="none"/>` +
      sacs(`<ellipse cx="20" cy="10" rx="18" ry="14" fill="#9fe6ff" opacity="0.75"/><ellipse cx="56" cy="20" rx="22" ry="16" fill="#9fe6ff" opacity="0.75"/><ellipse cx="38" cy="0" rx="14" ry="8" fill="#f2a8a0" opacity="0.8"/>`) +
      `<path d="M-6 36v46M70 36v46" stroke="#a8885e" stroke-width="15" stroke-linecap="round"/>`;
  }

  EVO_FILMS.dinosaurs = (): string => {
    const id = 'dinosaurs';
    const s = sky(id, '#4c95c4', '#f4e3bd');
    const glow = sun(id, 410, 76, 12);
    let body = s.body + glow.body + hills(184, 16, '#c9a888', 21, 0.65);
    // Jurassic forest grows up behind the plain in beat 4.
    body += during(8.8, Infinity, landAraucaria(70, 200, 120, '#5f8a68') + landAraucaria(150, 202, 96, '#6f9a76') + landAraucaria(226, 204, 146, '#4f7a58'), 1);
    body += `<path d="M0 200Q120 194 240 198Q360 202 480 194L480 270L0 270Z" fill="url(#${id}-ground)"/>`;
    for (const [x, y, r] of [[60, 214, 4], [130, 222, 3], [330, 212, 5], [420, 220, 3.4], [200, 230, 4]] as const) body += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f(r * 0.55)}" fill="#a8845a"/>`;
    body += landFern(26, 206, 34, 32, '#6f8a4a', 4) + landFern(456, 204, -30, 30, '#6f8a4a', 3.6);
    // Beat 1: the crawler comes toward us, wriggling its trunk from side to side.
    body += `<g transform="translate(240 208) scale(1.6)"><g${once('fadeout', { delay: 3.0, dur: 0.6 })}><g${once('scale', { s: 1.12, dur: 3, ease: 'linear', origin: '50% 100%' })}>` +
      `<g${mo('sway', { rot: 5, dur: 0.45, origin: '50% 100%' })}>${crawler()}</g></g></g></g>`;
    // Beat 2: the x-ray from the front: over generations the legs turn under the body.
    const xray = `<rect x="-84" y="-96" width="168" height="106" rx="14" fill="#0b2236" opacity="0.92"/><path d="M-78 0H78" stroke="rgba(150,220,255,0.35)" stroke-width="1.4"/>` +
      morph([hips(22, 42, -22), hips(38, 33, -18), hips(56, 17, -27)], [4.0, 5.0], 0.5) +
      `<g${once('fade', { delay: 3.5, dur: 0.6 })}><path d="M54 -30Q54 -4 30 4M-54 -30Q-54 -4 -30 4" stroke="${PAL.gold}" stroke-width="2" fill="none" stroke-dasharray="4 3"/>` +
      `<path d="M30 4l7 -6M30 4l9 1M-30 4l-7 -6M-30 4l-9 1" stroke="${PAL.gold}" stroke-width="2" stroke-linecap="round"/></g>`;
    body += during(3.0, 6.0, `<g transform="translate(240 206) scale(1.45)">${xray}</g>`, 0.5);
    body += timelapse(388, 112, ['vor 250 Mio. J.', 'vor 240 Mio. J.', 'vor 231 Mio. J.'], [3.0, 4.0, 5.0], 6.0);
    // Beat 3: Eoraptor sprints upright over the plain; the ground rushes past.
    let rush = '';
    for (let k = 0; k < 9; k++) rush += `<ellipse cx="${-60 + k * 70}" cy="${206 + (k % 3) * 5}" rx="${3 + (k % 2) * 2}" ry="1.8" fill="#8a6a44"/><path d="M${-34 + k * 70} 213l8 -3l5 1M${-28 + k * 70} 212l-1 -4" stroke="#8a6a44" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
    body += during(6.0, 9.0, `<g${mo('wave', { dx: -70, dur: 0.35 })}>${rush}</g>`, 0.3);
    body += `<g transform="translate(206 208) scale(2.3)"><g${once('enter', { dx: -150, dy: 0, delay: 5.9, dur: 0.6, ease: 'linear' })}>` +
      `<g${once('move', { dx: 160, dy: 0, delay: 8.5, dur: 0.5, ease: 'ease-in' })}><g${mo('float', { amp: 1, dur: 0.14 })}>${eoraptor()}</g>` +
      `<g transform="translate(-4 0)">${during(6.4, 9.2, landDust(6.4, 0.6, '#e6d4a8', 2.6) + landDust(6.7, 0.6, '#e6d4a8', 2.2) + landDust(6.55, 0.6, '#d8c294', 1.8), 0.3)}</g></g></g></g>`;
    body += during(6.3, 8.5, tag(236, 200, 'Beine unter dem Körper', 6.3, 'start'), 0.4) + sparkle(212, 192, '#fff3c4', 6.6);
    // Beat 4: a sauropod walks in and lifts its long neck to the treetops.
    body += `<g transform="translate(360 120)"><g${once('enter', { dx: 150, dy: 0, delay: 9.1, dur: 1, ease: 'cubic-bezier(.2,.8,.3,1)' })}>${sauropod()}</g></g>`;
    body += during(10.1, Infinity, tag(300, 128, 'Luftsäcke', 10.1), 0.4);
    body += motes(id, 10, 'rgba(255,240,200,0.7)', 40, 460, 80, 200, 31, 1.1);
    const defs = s.defs + glow.defs + vgrad(`${id}-ground`, [[0, '#d0a874'], [1, '#8a6440']]);
    return film(id, defs, body);
  };
}
