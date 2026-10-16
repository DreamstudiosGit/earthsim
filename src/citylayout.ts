/* =============================================================================
 * SimEarth 2.0 — how a city is built up from blocks
 * -----------------------------------------------------------------------------
 * A city is a handful of the civ atlas's blocks on its own tile
 * (docs/zivilisation-spec.md §3.2): a village has 2–3 small houses, a town
 * 4–5 with medium ones and a hall, a metropolis 6–8 with a landmark. Each
 * plan item has a target spot; it takes the nearest foot where its block
 *   - stays inside the tile (feet x 2..13, y 5..13, at most 4 px above it),
 *   - keeps its foot 2 px and its ground footprint 1 px clear of the river,
 *     and its footprint off the others,
 *   - leaves every block drawn so far mostly visible.
 * Choice, spot and variant come from hashes of the tile, never per frame.
 * Pure: no DOM, so tests run it in Node.
 * ========================================================================== */

namespace SE {
  /** What the layout needs to know about a city tile. */
  export interface CityLayoutInput {
    readonly x: number;
    readonly y: number;
    readonly era: Tech;
    readonly size: CitySize;
    /** Tribe colour index, or −1: no pennant. */
    readonly tribe: number;
    /** Whether world pixel (x, y) lies within `pad` px of river water (`TerrainField.paths.near`). */
    readonly near: (x: number, y: number, pad: number) => boolean;
    /** `RiverSystem.connectionMask` of the tile (W=1 E=2 N=4 S=8): which way a bridge crosses by preference. */
    readonly rivers: number;
    /** The tile's cityWetMask, when the caller has it already. */
    readonly wet?: Uint8Array;
  }

  /** One block of a city: atlas block id, variant, and its foot in tile pixels. */
  export interface CityBlock { readonly id: string; readonly v: number; readonly fx: number; readonly fy: number }

  export const CITY_FOOT_X0 = 2;
  export const CITY_FOOT_X1 = 13;
  export const CITY_FOOT_Y0 = 5;
  export const CITY_FOOT_Y1 = 13;
  /**
   * On a tile a river runs through, feet may stand from this row on, as long
   * as the block still reaches at most 4 px above the tile: a river across
   * the middle leaves only rows 1–4 for the far bank.
   */
  export const CITY_FOOT_Y0_RIVER = 1;
  /**
   * Pixels between river water and a block's foot, as for a plant's foot
   * (landcompose.ts), and between the water and the rest of its footprint:
   * a 2 px clearance over a whole footprint would leave a 16 px tile with a
   * 4–6 px river through its middle no room for a house on either bank.
   */
  export const CITY_RIVER_CLEARANCE = 2;
  export const CITY_RIVER_CLEARANCE_EDGE = 1;
  /** Share of a block's pixels that blocks in front of it must leave visible; houses by size stage (a metropolis is a dense pile). */
  const MIN_VISIBLE: Readonly<Record<string, number>> = { banner: 0.75, yard: 0.6, landmark: 0.6, ring: 0, bridge: 0.75 };
  const MIN_VISIBLE_HOUSES = [0.85, 0.5, 0.42];
  /** Rows weigh more than columns in the distance to a target: a block rather slides sideways than out of its row. */
  const ROW_WEIGHT = 1.5;
  /** Share of a city's houses in its main material (straw or hide). */
  const MAIN_MATERIAL = 0.7;

  interface PlanItem { readonly role: string; readonly size?: string; readonly x: number; readonly y: number; readonly chance?: number }

  /** Buildings (houses, hall, landmark) per size stage at most; spare plan items only fill up to this. */
  const BUILDINGS_MAX = [3, 5, 8];
  const BUILDING_ROLES = ['dwelling', 'hall', 'landmark'];

  /**
   * Targets per size stage, in plan order: the pennant first, at the back,
   * so whatever follows must leave it in sight; then big things, then spare
   * houses (they take the room a river or a big block left). A house too
   * large for its spot shrinks (SMALLER), so the smallest size is what
   * stands between river and edge.
   */
  const PLANS: readonly (readonly PlanItem[])[] = [
    [
      { role: 'banner', x: 8, y: 6 },
      { role: 'dwelling', size: 'm', x: 5, y: 9 },
      { role: 'dwelling', size: 'm', x: 11, y: 12 },
      { role: 'dwelling', size: 's', x: 11, y: 7, chance: 0.5 },
      { role: 'yard', x: 8, y: 11 },
    ],
    [
      { role: 'banner', x: 3, y: 7 },
      { role: 'hall', x: 8, y: 6 },
      { role: 'dwelling', size: 'l', x: 4, y: 12 },
      { role: 'dwelling', size: 'm', x: 12, y: 12 },
      { role: 'dwelling', size: 'm', x: 13, y: 8 },
      { role: 'dwelling', size: 's', x: 8, y: 13, chance: 0.5 },
      { role: 'dwelling', size: 's', x: 2, y: 7 },
      { role: 'wall', x: 11, y: 13 },
      { role: 'yard', x: 8, y: 9 },
      { role: 'yard', x: 13, y: 6, chance: 0.6 },
    ],
    [
      { role: 'banner', x: 4, y: 6 },
      { role: 'landmark', x: 9, y: 5 },
      { role: 'dwelling', size: 'l', x: 3, y: 8 },
      { role: 'hall', x: 8, y: 11 },
      { role: 'dwelling', size: 'm', x: 12, y: 13 },
      { role: 'dwelling', size: 'm', x: 4, y: 13 },
      { role: 'dwelling', size: 's', x: 8, y: 6 },
      { role: 'dwelling', size: 's', x: 12, y: 10 },
      { role: 'dwelling', size: 's', x: 3, y: 10 },
      { role: 'dwelling', size: 's', x: 8, y: 13 },
      { role: 'dwelling', size: 's', x: 13, y: 6 },
      { role: 'dwelling', size: 's', x: 6, y: 12 },
      { role: 'dwelling', size: 's', x: 10, y: 8 },
      { role: 'wall', x: 3, y: 13 },
      { role: 'yard', x: 8, y: 13 },
      { role: 'yard', x: 3, y: 6, chance: 0.6 },
    ],
  ];

  /** Foot row of the yard per size stage: it covers the lower middle of the tile, never its two bottom rows. */
  const YARD_FOOT = [13, 13, 13];
  /** The ring of a walled metropolis: the back wall's foot row, the rows between the feet of the side pieces. */
  const RING_BACK = 4;
  const RING_STEP = 3;
  /** Pixels of bank a bridge reaches past the water at each end. */
  const BRIDGE_BANK = 2;
  /** Columns of the gate in the front wall. */
  const GATE: readonly [number, number] = [6, 9];

  /** Smaller sizes a dwelling falls back to when it does not fit. */
  const SMALLER: Readonly<Record<string, readonly string[]>> = { l: ['l', 'm', 's'], m: ['m', 's'], s: ['s'] };
  /**
   * From the Industrial Age on a house's size is its height: the largest size
   * a village and a town may build, so blocks rise with the stage and towers
   * stand only in a metropolis.
   */
  const MODERN_FROM = 'industrial';
  const MODERN_CAP = ['s', 'm', 'l'];

  /** Tribe colour index of the city on tile `i`, or −1 while it has no tribe record. */
  export function cityTribeColor(world: WorldState, i: number): number {
    const c = world.civ.cityAt(i);
    const t = c ? world.civ.tribe(c.tribe) : undefined;
    return t ? t.color : -1;
  }

  /** ART_PALETTE key of a tribe colour (the SVG twin of the pixel pennant); a neutral cream without a tribe. */
  export function tribeArtColor(color: number, m: CivManifest = CIV_MANIFEST): PaletteKey {
    const c = m.tribeColors[color];
    return c && c.art in ART_PALETTE ? c.art as PaletteKey : 'cream';
  }

  /** The era whose blocks a city of tech `t` shows: its own, else the latest drawn before it. */
  export function cityArtEra(t: Tech, m: CivManifest = CIV_MANIFEST): string | null {
    for (let e = Math.min(t, m.eras.length); e >= 1; e--) {
      const id = m.eras[e - 1];
      for (const b of Object.keys(m.blocks)) if (m.blocks[b].era === id) return id;
    }
    return null;
  }

  interface Placed { readonly id: string; readonly v: number; readonly fx: number; readonly fy: number; readonly s: CivSprite; readonly role: string; readonly seq: number }

  const drawOrder = (a: Placed, b: Placed): number => a.fy - b.fy || a.fx - b.fx || a.seq - b.seq;

  /** The blocks of a city, sorted for drawing (back to front). */
  export function layoutCity(input: CityLayoutInput, m: CivManifest = CIV_MANIFEST): CityBlock[] {
    const era = cityArtEra(input.era, m);
    if (!era) return [];
    const { x, y } = input;
    const roll = (salt: number): number => landHash(x, y, salt);
    const ofEra = (role: string, e: string | null): string[] =>
      Object.keys(m.blocks).filter((id) => m.blocks[id].role === role && (m.blocks[id].era === e || m.blocks[id].era === null));
    /** The era's blocks of a role; a bridge also the latest one built before it. */
    const byRole = (role: string): string[] => {
      let ids = ofEra(role, era);
      for (let e = m.eras.indexOf(era) - 1; ids.length === 0 && role === 'bridge' && e >= 0; e--) ids = ofEra(role, m.eras[e]);
      return ids;
    };
    const T = 16;
    const top = T - m.box.h;

    const wet = input.wet ?? cityWetMask(x, y, input.near);
    const riverside = wet.some((v) => v !== 0);
    const ground = new Uint8Array(T * T);
    const placed: Placed[] = [];
    const cover = new Int16Array(T * m.box.h);

    const footprint = (s: CivSprite, depth: number, fx: number, fy: number, fn: (i: number) => boolean): boolean => {
      const left = fx - s.ax;
      for (let py = fy - depth + 1; py <= fy; py++) {
        if (py < 0 || py >= T) continue;
        for (let px = left + s.bx0; px <= left + s.bx1; px++) if (fn(py * T + px)) return true;
      }
      return false;
    };

    /** Every block (with `next`) keeps its share of visible pixels, front ones drawn over back ones. */
    const visible = (next: Placed): boolean => {
      const all = [...placed, next].sort(drawOrder);
      cover.fill(-1);
      all.forEach((p, n) => {
        const left = p.fx - p.s.ax;
        const topY = p.fy - p.s.ay - top;
        for (let r = 0; r < p.s.rect.h; r++) {
          const row = (topY + r) * T;
          for (let c = p.s.spans[r * 2]; c <= p.s.spans[r * 2 + 1]; c++) cover[row + left + c] = n;
        }
      });
      return all.every((p, n) => {
        let total = 0;
        let seen = 0;
        const left = p.fx - p.s.ax;
        const topY = p.fy - p.s.ay - top;
        for (let r = 0; r < p.s.rect.h; r++) {
          const row = (topY + r) * T;
          for (let c = p.s.spans[r * 2]; c <= p.s.spans[r * 2 + 1]; c++) {
            total++;
            if (cover[row + left + c] === n) seen++;
          }
        }
        return total === 0 || seen / total >= (MIN_VISIBLE[p.role] ?? MIN_VISIBLE_HOUSES[input.size]);
      });
    };

    /** Inside a ring wall, buildings keep within its sides. */
    let inner = 0;
    /**
     * The foot stays 2 px and the footprint 1 px from the water, the footprint
     * off the others'. `loose`: the last resort on a cramped river tile, the
     * foot 1 px from the water and the footprint just out of it.
     */
    const clear = (id: string, v: number, fx: number, fy: number, loose = false): boolean => {
      const b = m.blocks[id];
      if (wet[fy * T + fx] > (loose ? 1 : 0)) return false;
      return !footprint(b.variants[v], b.depth, fx, fy, (i) => wet[i] >= (loose ? 3 : 2) || ground[i] === 1);
    };

    const fits = (id: string, v: number, fx: number, fy: number, role: string, loose = false): boolean => {
      const s = m.blocks[id].variants[v];
      const left = fx - s.ax;
      if (left < 0 || left + s.rect.w > T || fy - s.ay < top || fy > CITY_FOOT_Y1) return false;
      if (role !== 'banner' && (left < inner || left + s.rect.w > T - inner)) return false;
      return clear(id, v, fx, fy, loose) && visible({ id, v, fx, fy, s, role, seq: placed.length });
    };

    const place = (id: string, v: number, fx: number, fy: number, role: string): void => {
      const b = m.blocks[id];
      const s = b.variants[v];
      footprint(s, b.depth, fx, fy, (i) => { ground[i] = 1; return false; });
      placed.push({ id, v, fx, fy, s, role, seq: placed.length });
    };

    // The worn yard under it all: ground, so it takes no part in the checks; the map leaves out its wet pixels.
    const out: CityBlock[] = [];
    const yardId = byRole('ground')[0];
    if (yardId) {
      const vars = m.blocks[yardId].variants;
      const v = Math.min(input.size, vars.length - 1);
      const s = vars[v];
      const fx = clamp(T / 2 + Math.round((roll(3) - 0.5) * 2), s.ax, T - s.rect.w + s.ax);
      out.push({ id: yardId, v, fx, fy: YARD_FOOT[input.size] });
    }

    const bridge = riverside ? byRole('bridge')[0] : undefined;
    if (bridge) {
      // Where the water crosses the middle row (a horizontal deck) or column (a vertical one) in one
      // run with bank to spare at both ends, so it meets both banks; the river's own direction first.
      const order = (input.rivers & 3) === 3 ? [1, 0] : [0, 1];
      for (const across of order) {
        const s = m.blocks[bridge].variants[across];
        if (!s) continue;
        const at = (k: number): number => wet[across === 0 ? (T / 2) * T + k : k * T + T / 2];
        let a = T;
        let b = -1;
        for (let k = 0; k < T; k++) if (at(k) === 3) { a = Math.min(a, k); b = k; }
        if (b < 0 || b - a + 1 + 2 * BRIDGE_BANK > (across === 0 ? s.rect.w : s.rect.h)) continue;
        let gap = false;
        for (let k = a; k <= b; k++) if (at(k) === 0) gap = true;
        if (gap) continue;
        const mid = Math.round((a + b) / 2);
        const fx = across === 0 ? clamp(mid, s.ax, T - s.rect.w + s.ax) : T / 2;
        const fy = across === 1 ? clamp(mid + s.ay - Math.floor(s.rect.h / 2), s.ay + top, CITY_FOOT_Y1) : T / 2 + s.ay - Math.floor(s.rect.h / 2);
        place(bridge, across, fx, fy, 'bridge');
        break;
      }
    }

    // A walled era rings its metropolis: back wall, sides running forward, a front wall with a gate.
    // A river through the tile would break the ring: there the town's single piece stands instead.
    const wall = byRole('wall')[0];
    const ringed = !!wall && input.size === CitySize.Metropolis && m.blocks[wall].variants.length >= 2 && !riverside;
    if (ringed && wall) {
      const [hs, vs] = m.blocks[wall].variants;
      const ring = (v: number, fx: number, fy: number): void => {
        if (clear(wall, v, fx, fy)) place(wall, v, fx, fy, 'ring');
      };
      for (let left = 0; left + hs.rect.w <= T; left += hs.rect.w) ring(0, left + hs.ax, RING_BACK);
      for (const left of [0, T - vs.rect.w]) {
        for (let fy = RING_BACK + RING_STEP; fy <= CITY_FOOT_Y1; fy += RING_STEP) ring(1, left + vs.ax, fy);
      }
      for (let left = vs.rect.w; left + hs.rect.w <= T - vs.rect.w; left += hs.rect.w) {
        if (left <= GATE[1] && left + hs.rect.w - 1 >= GATE[0]) continue;
        ring(0, left + hs.ax, CITY_FOOT_Y1);
      }
      inner = vs.rect.w;
    }

    const modern = m.eras.indexOf(era) >= m.eras.indexOf(MODERN_FROM);
    const mirror = roll(1) < 0.5;
    const dwellings = byRole('dwelling');
    const mainHouse = Math.floor(roll(2) * dwellings.length);
    let yards = 0;
    let buildings = 0;
    const footRows = riverside ? CITY_FOOT_Y0_RIVER : CITY_FOOT_Y0;

    // A river tile leaves little room: before anything else one house takes the roomiest dry spot.
    if (riverside) {
      const roomy: [number, number, number][] = [];
      for (let fy = footRows; fy <= CITY_FOOT_Y1; fy++) {
        for (let fx = CITY_FOOT_X0; fx <= CITY_FOOT_X1; fx++) {
          let dry = 0;
          for (let py = Math.max(0, fy - 3); py <= fy; py++) {
            for (let px = Math.max(0, fx - 3); px <= Math.min(T - 1, fx + 3); px++) if (wet[py * T + px] === 0) dry++;
          }
          roomy.push([fx, fy, dry - Math.abs(fx - T / 2) * 0.1 - Math.abs(fy - 9) * 0.1]);
        }
      }
      roomy.sort((p, q) => q[2] - p[2]);
      const houses = [dwellings[mainHouse], dwellings[(mainHouse + 1) % dwellings.length]].filter(Boolean);
      // A medium house, if need be by the last resort; where even that finds no room, a small one.
      search: for (const [size, loose] of [['m', false], ['m', true], ['s', false], ['s', true]] as const) {
        for (const id of houses) {
          const v = m.blocks[id].variants.findIndex((sp) => sp.size === size);
          if (v < 0) continue;
          for (const [fx, fy] of roomy) {
            if (!fits(id, v, fx, fy, 'dwelling', loose)) continue;
            place(id, v, fx, fy, 'dwelling');
            buildings++;
            break search;
          }
        }
      }
    }

    PLANS[input.size].forEach((item, k) => {
      if (item.chance !== undefined && roll(10 + k) >= item.chance) return;
      const building = BUILDING_ROLES.includes(item.role);
      if (building && buildings >= BUILDINGS_MAX[input.size]) return;
      const options: [string, number][] = [];
      if (item.role === 'banner') {
        const id = byRole('banner')[0];
        if (id && input.tribe >= 0 && input.tribe < m.blocks[id].variants.length) options.push([id, input.tribe]);
      } else if (item.role === 'dwelling') {
        const id = dwellings.length < 2 || roll(20 + k) < MAIN_MATERIAL ? dwellings[mainHouse] : dwellings[(mainHouse + 1) % dwellings.length];
        if (id) {
          const wanted = item.size ?? 's';
          const cap = modern ? MODERN_CAP[input.size] : 'l';
          for (const size of SMALLER[SMALLER[cap].includes(wanted) ? wanted : cap]) {
            const v = m.blocks[id].variants.findIndex((s) => s.size === size);
            if (v >= 0) options.push([id, v]);
          }
        }
      } else if (item.role === 'wall') {
        // A town's one piece of wall (and a metropolis's, where a river keeps it from a ring): the long piece.
        const n = wall ? m.blocks[wall].variants.length : 0;
        if (wall && !ringed) options.push([wall, n > 2 ? 2 : 0]);
      } else {
        // The role's blocks from a chosen one on (yards take turns), each with its variants from
        // a hashed start: a narrower one may fit where the first did not.
        const ids = byRole(item.role);
        const start = item.role === 'yard' ? yards++ : Math.floor(roll(30 + k) * ids.length);
        for (let b = 0; b < ids.length; b++) {
          const id = ids[(start + b) % ids.length];
          const n = m.blocks[id].variants.length;
          const first = Math.floor(roll(40 + k) * n);
          for (let j = 0; j < n; j++) options.push([id, (first + j) % n]);
        }
      }
      const tx = (mirror ? T - 1 - item.x : item.x) + Math.round((roll(50 + k) - 0.5) * 2);
      const ty = item.y + Math.round((roll(60 + k) - 0.5) * 2);
      const spots: [number, number, number][] = [];
      for (let fy = footRows; fy <= CITY_FOOT_Y1; fy++) {
        for (let fx = CITY_FOOT_X0; fx <= CITY_FOOT_X1; fx++) {
          spots.push([fx, fy, (fx - tx) ** 2 + ((fy - ty) * ROW_WEIGHT) ** 2 + landHash(fx + x * T, fy + y * T, 70 + k) * 0.5]);
        }
      }
      spots.sort((a, b) => a[2] - b[2]);
      // The pennant may take the last resort too: every city shows its people.
      for (const loose of item.role === 'banner' ? [false, true] : [false]) {
        for (const [id, v] of options) {
          const spot = spots.find(([fx, fy]) => fits(id, v, fx, fy, item.role, loose));
          if (spot) {
            place(id, v, spot[0], spot[1], item.role);
            if (building) buildings++;
            return;
          }
        }
      }
    });
    return out.concat(placed.sort(drawOrder).map(({ id, v, fx, fy }) => ({ id, v, fx, fy })));
  }

  /**
   * Per pixel of tile (x, y), by where its centre lies: 3 in river water,
   * 2 within CITY_RIVER_CLEARANCE_EDGE of it, 1 within CITY_RIVER_CLEARANCE,
   * else 0. The layout keeps feet and footprints off it, the map the yard.
   */
  export function cityWetMask(x: number, y: number, near: (x: number, y: number, pad: number) => boolean): Uint8Array {
    const T = 16;
    const wet = new Uint8Array(T * T);
    for (let py = 0; py < T; py++) {
      for (let px = 0; px < T; px++) {
        const wx = x * T + px + 0.5;
        const wy = y * T + py + 0.5;
        if (!near(wx, wy, CITY_RIVER_CLEARANCE)) continue;
        wet[py * T + px] = near(wx, wy, 0) ? 3 : near(wx, wy, CITY_RIVER_CLEARANCE_EDGE) ? 2 : 1;
      }
    }
    return wet;
  }
}
