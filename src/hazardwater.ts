/* =============================================================================
 * SimEarth 2.0 — tidal wave and hurricane: wave front, run-up, storm track
 * -----------------------------------------------------------------------------
 * docs/ereignisse-spec.md §3.4, §3.5.
 *
 * Tidal wave: at its start an arrival field spreads over the water from the
 * origin (Dijkstra, diagonals √2; fast in deep sea, slow in the shallows) for
 * at most WAVE_PATH_MAX tiles of path, the energy falling by WAVE_DECAY a
 * tile. Each tick the front is the water whose arrival falls into it; where
 * the front touches land, the wave runs up the coast (hazardflood.ts).
 *
 * Hurricane: the eye moves one tile a tick — west with the trade winds and a
 * poleward drift, east beyond HURRICANE_RECURVE_LAT — gaining strength over
 * warm sea and losing it over cool sea and land. It soaks a strip five tiles
 * wide, throws forests and, making landfall strong, pushes a storm surge up
 * the coast through the same run-up, spinning off tornadoes (hazardtornado.ts).
 * The hazard lasts until its strip dries.
 * ========================================================================== */

namespace SE {
  /** A tidal wave: the water tiles it has yet to pass, in order of arrival, and its floods. */
  export interface TidalWave {
    readonly tiles: number[];
    /** Ticks after the start. */
    readonly arrival: number[];
    /** Tiles of path from the origin; the energy left is WAVE_DECAY ** path. */
    readonly path: number[];
    /** Direction of travel, an index into HAZARD_NX / HAZARD_NY. */
    readonly heading: number[];
    readonly runs: FloodRun[];
  }

  export interface StormTrack {
    /** The eye's tile at every tick so far, the current one last. */
    readonly path: number[];
    strength: number;
    /** Poleward drift gathered towards the next row, in tiles. */
    drift: number;
    /** False once the storm has died out; its strip may still be drying. */
    moving: boolean;
    /** Tiles it soaked, drying out. */
    readonly wet: number[];
    /** Its storm surges. */
    readonly runs: FloodRun[];
    /** Funnels spun off at landfall (hazardtornado.ts). */
    readonly tornadoes: Tornado[];
  }

  export interface Hazard {
    wave?: TidalWave;
    storm?: StormTrack;
  }

  /** Ticks a tidal wave takes to cross one water tile of elevation `e`. */
  export function waveTicks(e: number): number {
    return e < COAST_DEPTH ? WAVE_TICKS_DEEP : e > WAVE_SHALLOW ? WAVE_TICKS_SHALLOW : WAVE_TICKS_SHELF;
  }

  function touchesLand(world: WorldState, i: number): boolean {
    for (let k = 0; k < 8; k++) {
      const j = hazardNeighbour(i, k);
      if (j >= 0 && world.elevation[j] >= 0) return true;
    }
    return false;
  }

  /* ------------------------------------------------------- arrival field -- */

  // Doubles: a float32 copy of an arrival rounds below its heap key and would read as stale.
  const best = new Float64Array(TILE_COUNT).fill(Infinity);
  const walked = new Float64Array(TILE_COUNT);
  const heading = new Uint8Array(TILE_COUNT);
  const settled = new Uint8Array(TILE_COUNT);

  function heapPush(keys: number[], vals: number[], key: number, val: number): void {
    let n = keys.length;
    keys.push(key);
    vals.push(val);
    while (n > 0) {
      const p = (n - 1) >> 1;
      if (keys[p] <= key) break;
      keys[n] = keys[p];
      vals[n] = vals[p];
      n = p;
    }
    keys[n] = key;
    vals[n] = val;
  }

  function heapPop(keys: number[], vals: number[]): void {
    const key = keys.pop() as number;
    const val = vals.pop() as number;
    const size = keys.length;
    if (size === 0) return;
    let n = 0;
    for (;;) {
      let c = 2 * n + 1;
      if (c >= size) break;
      if (c + 1 < size && keys[c + 1] < keys[c]) c++;
      if (keys[c] >= key) break;
      keys[n] = keys[c];
      vals[n] = vals[c];
      n = c;
    }
    keys[n] = key;
    vals[n] = val;
  }

  /** When the wave reaches each water tile within WAVE_PATH_MAX of path, in order of arrival. */
  function arrivalField(world: WorldState, origin: number): TidalWave {
    const e = world.elevation;
    const wave: TidalWave = { tiles: [], arrival: [], path: [], heading: [], runs: [] };
    const touched = [origin];
    const keys: number[] = [];
    const vals: number[] = [];
    best[origin] = 0;
    walked[origin] = 0;
    heading[origin] = 0;
    heapPush(keys, vals, 0, origin);
    while (keys.length > 0) {
      const t = keys[0];
      const i = vals[0];
      heapPop(keys, vals);
      if (settled[i] || t > best[i]) continue;
      settled[i] = 1;
      wave.tiles.push(i);
      wave.arrival.push(Math.round(t * 100) / 100);
      wave.path.push(Math.round(walked[i] * 10) / 10);
      wave.heading.push(heading[i]);
      for (let k = 0; k < 8; k++) {
        const j = hazardNeighbour(i, k);
        if (j < 0 || e[j] >= 0 || settled[j]) continue;
        const step = HAZARD_NX[k] !== 0 && HAZARD_NY[k] !== 0 ? Math.SQRT2 : 1;
        const w = walked[i] + step;
        if (w > WAVE_PATH_MAX) continue;
        const at = t + waveTicks(e[j]) * step;
        if (at >= best[j]) continue;
        if (best[j] === Infinity) touched.push(j);
        best[j] = at;
        walked[j] = w;
        heading[j] = k;
        heapPush(keys, vals, at, j);
      }
    }
    for (const i of touched) {
      best[i] = Infinity;
      settled[i] = 0;
    }
    return wave;
  }

  /* ---------------------------------------------------------- tidal wave -- */

  HAZARD_RULES[EventKind.TidalWave] = {
    refuse: (world, x, y) => (world.elevation[idx(x, y)] < 0 ? '' : 'Eine Flutwelle beginnt im Meer.'),

    start(world: WorldState, h: Hazard): void {
      h.wave = arrivalField(world, idx(h.x, h.y));
    },

    step(world: WorldState, h: Hazard): boolean {
      const wave = h.wave;
      if (!wave) return false;
      const a = h.age;
      // The front of the last tick stays for the screen; what passed before it is dropped.
      let gone = 0;
      while (gone < wave.arrival.length && wave.arrival[gone] < a - 2) gone++;
      if (gone > 0) for (const list of [wave.tiles, wave.arrival, wave.path, wave.heading]) list.splice(0, gone);
      const coast: number[] = [];
      const height: number[] = [];
      for (let k = 0; k < wave.arrival.length && wave.arrival[k] < a; k++) {
        if (wave.arrival[k] < a - 1 || !touchesLand(world, wave.tiles[k])) continue;
        coast.push(wave.tiles[k]);
        height.push(WAVE_HEIGHT * (h.strength ?? 1) * Math.pow(WAVE_DECAY, wave.path[k]));
      }
      hazardRunUp(wave.runs, coast, height);
      hazardStepFloods(world, wave.runs);
      const last = wave.arrival.length > 0 ? wave.arrival[wave.arrival.length - 1] : -1;
      return last >= a || wave.runs.length > 0;
    },

    finish(world: WorldState, h: Hazard): void {
      const wave = h.wave;
      if (!wave) return;
      hazardDrainFloods(world, wave.runs);
      for (const list of [wave.tiles, wave.arrival, wave.path, wave.heading]) list.length = 0;
    },
  };

  /* ----------------------------------------------------------- hurricane -- */

  /** Strength from the sea surface under the eye; over land a storm is weak. */
  function stormStrength(world: WorldState, i: number): number {
    if (world.elevation[i] >= 0) return 1;
    const t = world.temperature[i];
    return t >= HURRICANE_WARM_SEA ? 3 : t >= HURRICANE_MILD_SEA ? 2 : 1;
  }

  /** Rain, wind and wet ground in the strip around the eye. */
  function lash(world: WorldState, h: Hazard, st: StormTrack): void {
    const hz = world.hazards;
    const eye = st.path[st.path.length - 1];
    const ex = eye % GRID_W;
    const ey = (eye / GRID_W) | 0;
    const s = st.strength;
    for (let dy = -2; dy <= 2; dy++) {
      const y = ey + dy;
      if (y < 0 || y >= GRID_H) continue;
      for (let dx = -2; dx <= 2; dx++) {
        const i = idx(wrapX(ex + dx), y);
        const inner = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
        world.moisture[i] = Math.min(1, world.moisture[i] + (inner ? HURRICANE_MOISTURE : HURRICANE_OUTER_MOISTURE));
        if (world.elevation[i] < 0) continue;
        if (inner) {
          hazardKillLife(world, i, HURRICANE_LIFE_LOSS * s);
          if (s >= HURRICANE_WINDTHROW_MIN && LANDSCAPE_LEVEL[world.landscape[i]] >= 4 && hz.scar[i] === ScarKind.None) {
            setScar(world, i, ScarKind.Windthrow);
            world.vegetation[i] *= HURRICANE_WINDTHROW_KEEP;
          }
          hazardHitCity(world, i, HURRICANE_CITY_LOSS * s);
        }
        if (hz.tile[i] === HazardTile.None) {
          hz.tile[i] = HazardTile.Wet;
          hz.level[i] = 0;
          st.wet.push(i);
          hz.revision++;
        }
        if (hz.tile[i] === HazardTile.Wet) {
          const ticks = HURRICANE_WET_TICKS + Math.floor(hazardRoll(world.seed ^ h.id, i, h.age) * (HURRICANE_WET_SPAN + 1));
          hz.level[i] = Math.max(hz.level[i], ticks);
        }
      }
    }
  }

  /** Every soaked tile dries a tick. */
  function dry(world: WorldState, st: StormTrack): void {
    const hz = world.hazards;
    let n = 0;
    for (const i of st.wet) {
      if (hz.tile[i] !== HazardTile.Wet) continue;
      if (hz.level[i] > 1) {
        hz.level[i]--;
        st.wet[n++] = i;
        continue;
      }
      hz.tile[i] = HazardTile.None;
      hz.level[i] = 0;
      hz.revision++;
    }
    st.wet.length = n;
  }

  /** One tile on: west in the tropics, east beyond, drifting poleward; strength follows the sea below. */
  function move(world: WorldState, h: Hazard, st: StormTrack): void {
    const from = st.path[st.path.length - 1];
    const y = (from / GRID_W) | 0;
    const lat = latitudeDeg(y);
    const dx = Math.abs(lat) < HURRICANE_RECURVE_LAT ? windDirection(y) : 1;
    st.drift += HURRICANE_DRIFT + (hazardRoll(world.seed ^ h.id, h.age, 0xd21f7) - 0.5) * HURRICANE_DRIFT_JITTER;
    let dy = 0;
    if (st.drift >= 1) {
      st.drift -= 1;
      dy = lat >= 0 ? -1 : 1;
    }
    const nx = wrapX((from % GRID_W) + dx);
    const ny = clamp(y + dy, 1, GRID_H - 2);
    const to = idx(nx, ny);
    st.path.push(to);
    const sea = world.elevation[to] < 0;
    if (world.elevation[from] < 0 && !sea && st.strength >= HURRICANE_SURGE_MIN) surge(world, st, to);
    if (world.elevation[from] < 0 && !sea && st.strength >= TORNADO_MIN_STRENGTH) hazardSpawnTornadoes(world, h, st.tornadoes, from, to);
    const warm = world.temperature[to] >= HURRICANE_WARM_SEA;
    st.strength = Math.min(HURRICANE_MAX, st.strength + (!sea ? -HURRICANE_LAND_LOSS : warm ? HURRICANE_GAIN : -HURRICANE_SEA_LOSS));
    if (st.strength <= 0) {
      st.strength = 0;
      st.moving = false;
      return;
    }
    lash(world, h, st);
    if (st.path.length > HURRICANE_TRACK_MAX) st.moving = false;
  }

  /** Landfall: the sea around the eye runs up the coast HURRICANE_SURGE × strength high. */
  function surge(world: WorldState, st: StormTrack, eye: number): void {
    const coast: number[] = [];
    const height: number[] = [];
    const ex = eye % GRID_W;
    const ey = (eye / GRID_W) | 0;
    for (let dy = -2; dy <= 2; dy++) {
      const y = ey + dy;
      if (y < 0 || y >= GRID_H) continue;
      for (let dx = -2; dx <= 2; dx++) {
        const i = idx(wrapX(ex + dx), y);
        if (world.elevation[i] >= 0 || !touchesLand(world, i)) continue;
        coast.push(i);
        height.push(HURRICANE_SURGE * st.strength);
      }
    }
    hazardRunUp(st.runs, coast, height);
  }

  HAZARD_RULES[EventKind.Hurricane] = {
    refuse: () => '',

    start(world: WorldState, h: Hazard): void {
      const i = idx(h.x, h.y);
      const st: StormTrack = {
        path: [i], strength: stormStrength(world, i), drift: hazardRoll(world.seed ^ h.id, i, 0xd21f), moving: true, wet: [], runs: [], tornadoes: [],
      };
      h.storm = st;
      lash(world, h, st);
    },

    step(world: WorldState, h: Hazard): boolean {
      const st = h.storm;
      if (!st) return false;
      dry(world, st);
      hazardStepTornadoes(world, st.tornadoes);
      if (st.moving) move(world, h, st);
      hazardStepFloods(world, st.runs);
      return st.moving || st.wet.length > 0 || st.runs.length > 0 || st.tornadoes.length > 0;
    },

    finish(world: WorldState, h: Hazard): void {
      const st = h.storm;
      if (!st) return;
      st.moving = false;
      const hz = world.hazards;
      for (const i of st.wet) {
        if (hz.tile[i] !== HazardTile.Wet) continue;
        hz.tile[i] = HazardTile.None;
        hz.level[i] = 0;
      }
      st.wet.length = 0;
      st.tornadoes.length = 0;
      hz.revision++;
      hazardDrainFloods(world, st.runs);
    },
  };
}
