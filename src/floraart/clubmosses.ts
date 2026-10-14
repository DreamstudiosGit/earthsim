/* =============================================================================
 * SimEarth 2.0 — plant art: Bärlappe (clubmosses)
 * -----------------------------------------------------------------------------
 * Lycophytes in sea green, every leafy part a bristly shoot of scale leaves:
 * a low clubmoss tuft with yellow cones, and coal-forest scale trees
 * (Lepidodendron) with diamond-scarred trunks and forked bottlebrush crowns.
 * Specialist: the half-opened resurrection plant in the desert.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  /**
   * A scaly shoot from (bx, by) to its tip (tx, ty), `hw` half wide at the
   * foot and narrowing by `taper`, its edges toothed with leaf scales that
   * point to the tip. The half right of the axis is shaded.
   */
  function scaly(bx: number, by: number, tx: number, ty: number, hw: number, tooth = 0.9, taper = 0.45): ArtShape[] {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const steps = Math.max(2, Math.round(len / 2.6));
    const step = len / steps;
    const at = (t: number, side: number, out: number, ahead = 0): string => {
      const w = (hw * (1 - taper * t) + out * (1 - taper * t * 0.5)) * side;
      const along = len * t + ahead;
      return `${r(bx + ux * along - uy * w)} ${r(by + uy * along + ux * w)}`;
    };
    const right: string[] = [];
    const left: string[] = [];
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      right.push(`L${at(t, 1, 0)}`, `L${at(t, 1, tooth, step * 0.7)}`);
      left.unshift(`L${at(t, -1, tooth, step * 0.7)}`, `L${at(t, -1, 0)}`);
    }
    const tip = `L${r(tx + ux * hw * 0.5)} ${r(ty + uy * hw * 0.5)}`;
    return [
      { f: 'clubmoss', d: `M${at(0, -1, 0)} ${right.join(' ')} ${tip} ${left.join(' ')} Z` },
      { f: 'spruce', d: `M${r(bx)} ${r(by)} ${right.join(' ')} ${tip} Z`, o: 0.55 },
    ];
  }

  /** A yellow cone (strobilus) sitting on a shoot tip at (x, y). */
  function cone(x: number, y: number): ArtShape[] {
    return [
      { f: 'yellow', d: artEllipse(x, y - 2.4, 1.5, 2.6) },
      { f: 'olive', d: `M${x} ${r(y - 5)} A1.5 2.6 0 0 1 ${x} ${y} Z`, o: 0.45 },
    ];
  }

  /**
   * A scale tree (Lepidodendron) on (x, y): a dark trunk with diamond leaf
   * scars up to `fork`, two branches, each forking into two bottlebrush
   * shoots. `s` scales the crown.
   */
  function scaleTree(x: number, y: number, fork: number, s: number): ArtShape[] {
    const half = 2.4;
    const scars: ArtShape[] = [];
    for (let k = 0, yy = y - 2.5; yy > fork + 1.5; k++, yy -= 2.6) {
      const cx = x + (k % 2 === 0 ? -0.9 : 0.9);
      scars.push({ f: 'clubmoss', d: `M${r(cx)} ${r(yy - 1.2)} L${r(cx + 0.8)} ${r(yy)} L${r(cx)} ${r(yy + 1.2)} L${r(cx - 0.8)} ${r(yy)} Z`, o: 0.8 });
    }
    const lx = r(x - 4.6 * s);
    const ly = r(fork - 4 * s);
    const rx = r(x + 4.6 * s);
    const ry = r(fork - 4.4 * s);
    return [
      { f: 'spruce', d: `M${r(x - half - 1.4)} ${y} Q${r(x - half)} ${r(y - 1)} ${r(x - half)} ${r(y - 4)} L${r(x - 1.6)} ${fork} L${r(x + 1.6)} ${fork} L${r(x + half)} ${r(y - 4)} Q${r(x + half)} ${r(y - 1)} ${r(x + half + 1.4)} ${y} Z` },
      ...scars,
      { s: 'spruce', w: 2.4, d: `M${x} ${fork + 1} Q${r(x - 1)} ${r(fork - 2)} ${lx} ${ly} M${x} ${fork + 1} Q${r(x + 1)} ${r(fork - 2)} ${rx} ${ry}` },
      ...scaly(lx, ly, r(lx - 3.8 * s), r(ly - 5.4 * s), 1.5),
      ...scaly(lx, ly, r(lx + 1.8 * s), r(ly - 6.6 * s), 1.5),
      ...scaly(rx, ry, r(rx - 1.8 * s), r(ry - 6.6 * s), 1.5),
      ...scaly(rx, ry, r(rx + 3.8 * s), r(ry - 5.4 * s), 1.5),
    ];
  }

  FLORA_ART[Flora.Clubmosses] = {
    // spärlich: A creeping clubmoss with upright scaly shoots topped by small yellow cones.
    sparse: [
      { s: 'spruce', w: 2.2, d: 'M5.5 29 Q16 30.4 26.5 28.6' },
      ...scaly(10.5, 29.2, 5.8, 18.5, 1.3, 0.8, 0.5),
      ...scaly(22, 29.2, 26.4, 19.5, 1.3, 0.8, 0.5),
      ...scaly(14, 29.4, 12.6, 13.5, 1.5, 0.8, 0.5),
      ...cone(12.5, 13),
      ...scaly(18, 29.4, 19.6, 15.5, 1.5, 0.8, 0.5),
      ...cone(19.7, 15),
    ],
    // dicht: Scale trees (Lepidodendron): diamond-patterned trunks, forked crowns of scaly
    //   shoots. Farben: dark green trunks, sea-green crowns.
    dense: [...scaleTree(23.5, 30.5, 18.5, 0.75), ...scaleTree(11, 30, 14.5, 1)],
    specialists: [
      // Auferstehungspflanzen — Wüste (Selaginella lepidophylla (resurrection plant, a
      //   lycophyte)). Half opened: green scaly fronds spread from a low brown mound of fronds
      //   still curled. Farben: dry brown outside, green centre.
      {
        name: 'Auferstehungspflanzen', biome: Biome.Desert, art: [
          ...scaly(14.5, 19.5, 4.6, 16.8, 1.7),
          ...scaly(17.5, 19.5, 27.4, 16.8, 1.7),
          ...scaly(15, 18.5, 9.4, 10.2, 1.7),
          ...scaly(17, 18.5, 22.6, 10.2, 1.7),
          ...scaly(16, 18.5, 16, 7, 1.8),
          { f: 'kelp', d: 'M5.6 24.6 C5.6 21.4 8.6 19.6 11.6 20.4 Q13.8 18.8 16 19.6 Q18.2 18.8 20.4 20.4 C23.4 19.6 26.4 21.4 26.4 24.6 C26.4 28 21.6 29.6 16 29.6 C10.4 29.6 5.6 28 5.6 24.6 Z' },
          { f: 'furDark', d: 'M16 19.6 Q18.2 18.8 20.4 20.4 C23.4 19.6 26.4 21.4 26.4 24.6 C26.4 28 21.6 29.6 16 29.6 Z', o: 0.55 },
          { s: 'furDark', w: 1.6, d: 'M9.6 21.8 C7.4 22.4 7.2 25.6 9.4 26 C10.8 26.2 11 24.4 9.8 24.2 M22.4 21.8 C24.6 22.4 24.8 25.6 22.6 26 C21.2 26.2 21 24.4 22.2 24.2 M13.6 22.2 Q12.8 25.4 14 28.6 M18.4 22.2 Q19.2 25.4 18 28.6' },
        ],
      },
    ],
  };
}
