/* =============================================================================
 * SimEarth 2.0 — hazard probe
 * -----------------------------------------------------------------------------
 * Numbers the unit tests cannot show (docs/ereignisse-spec.md §7): for each
 * seed, a disaster on typical tiles — an inland slope, a coast, the shelf,
 * deep ocean — and what it did: reach, tiles hit, new land, how long the
 * spread ran, and how long its scars took to heal, in ticks and in the
 * planet's time. Uses SE_BUNDLE like the tests, never touches simulation.js.
 *
 *   node tools/hazard-probe.js [--kind volcano] [--epoch random] [--heal 300] [--green] [seed …]
 *
 *     --green   keep plants growing around the site from the start (land
 *               plants, mosses, vascular plants, grasses), so a fire finds
 *               fuel and healing can be timed on a planet without land life
 * ========================================================================== */
'use strict';

const path = require('path');
const { makeSim } = require(path.join(__dirname, '..', 'tests', 'helpers.js'));

function parseArgs(argv) {
  const a = { kind: 'volcano', epoch: 'random', heal: 300, green: false, seeds: [] };
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === '--kind') a.kind = argv[++k];
    else if (argv[k] === '--epoch') a.epoch = argv[++k];
    else if (argv[k] === '--heal') a.heal = Number(argv[++k]);
    else if (argv[k] === '--green') a.green = true;
    else a.seeds.push(Number(argv[k]));
  }
  if (a.seeds.length === 0) a.seeds = [777, 4242, 12345];
  return a;
}

/** Typical start tiles: an inland slope, a coast, the shelf, deep ocean. */
function sites(SE, w) {
  const out = {};
  const land = (x, y, r) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) if (w.elevation[SE.idx(SE.wrapX(x + dx), y + dy)] < 0) return false;
    }
    return true;
  };
  for (let y = 30; y < SE.GRID_H - 30; y++) {
    for (let x = 0; x < SE.GRID_W; x++) {
      const i = SE.idx(x, y);
      const e = w.elevation[i];
      if (!out.inland && e > 0.15 && e < 0.45 && land(x, y, 6)) out.inland = [x, y];
      if (!out.coast && e > 0.02 && e < 0.12 && !land(x, y, 1)) out.coast = [x, y];
      if (!out.shelf && e > -0.12 && e < -0.06) out.shelf = [x, y];
      if (!out.deep && e < -0.5) out.deep = [x, y];
    }
  }
  return out;
}

function main() {
  const a = parseArgs(process.argv.slice(2));
  for (const seed of a.seeds) {
    const probe = makeSim(seed, a.epoch);
    const { SE } = probe;
    const kind = SE.EventKind[Object.keys(SE.EventKind).find((n) => n.toLowerCase() === a.kind)];
    if (kind === undefined) throw new Error(`unknown kind ${a.kind}`);
    const places = sites(SE, probe.world);
    for (const [site, tile] of Object.entries(places)) {
      const s = makeSim(seed, a.epoch);
      const w = s.world;
      const hz = new SE.HazardSystem();
      const before = Float32Array.from(w.elevation);
      const years0 = w.absoluteYears;
      const plants = (1 << SE.Flora.LandPlants) | (1 << SE.Flora.Mosses) | (1 << SE.Flora.Vascular) | (1 << SE.Flora.Grasses);
      const green = () => {
        for (let dy = -9; dy <= 9; dy++) {
          const y = tile[1] + dy;
          if (y < 0 || y >= SE.GRID_H) continue;
          for (let dx = -9; dx <= 9; dx++) {
            const j = SE.idx(SE.wrapX(tile[0] + dx), y);
            if (w.elevation[j] < 0 || w.hazards.scar[j] !== 0) continue;
            w.flora[j] |= plants;
            w.vegetation[j] = Math.max(w.vegetation[j], 0.5);
          }
        }
      };
      if (a.green) green();
      const h = hz.start(w, kind, tile[0], tile[1], 'player');
      if (!h) { console.log(`seed ${seed} ${site}: refused — ${hz.refusal(w, kind, tile[0], tile[1])}`); continue; }
      let spread = 0;
      while (w.hazards.list.length > 0 && spread < 200) { s.tick(); hz.step(w); spread++; }
      const scars = [];
      let reach = 0;
      let land = 0;
      for (let i = 0; i < SE.TILE_COUNT; i++) {
        if (w.hazards.scar[i] === 0) continue;
        scars.push(i);
        reach = Math.max(reach, SE.hazardDistance(tile[0], tile[1], i % SE.GRID_W, Math.floor(i / SE.GRID_W)));
        if (before[i] < 0 && w.elevation[i] >= 0) land++;
      }
      const marks = { half: -1, gone: -1 };
      const healable = scars.filter((i) => w.hazards.scar[i] !== SE.ScarKind.Vent);
      for (let t = 1; t <= a.heal && healable.length > 0; t++) {
        if (a.green) green();
        s.tick();
        hz.step(w);
        const left = healable.filter((i) => w.hazards.scar[i] !== 0).length;
        if (marks.half < 0 && left <= healable.length / 2) marks.half = t;
        if (left === 0) { marks.gone = t; break; }
      }
      const yrs = (w.absoluteYears - years0) / Math.max(1, spread + Math.max(marks.gone, a.heal));
      console.log(`seed ${seed} ${site.padEnd(6)} ${tile.join(',').padEnd(8)} spread ${String(spread).padStart(3)} ticks · ` +
        `${scars.length} scars, reach ${reach}, new land ${land}, steam ${h.lava?.steam.length ?? 0} · ` +
        `healed half ${marks.half < 0 ? '—' : marks.half}, all ${marks.gone < 0 ? `> ${a.heal}` : marks.gone} ticks ` +
        `(≈ ${Math.round(yrs).toLocaleString('de-DE')} years per tick)`);
    }
  }
}

main();
