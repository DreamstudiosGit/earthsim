/* =============================================================================
 * SimEarth 2.0 — green probe: does young rock stay rock, does the planet green?
 * -----------------------------------------------------------------------------
 * A fast check (one seed, about a thousand ticks) for two things the map
 * must get right (docs/hoehe-spec.md §3.7):
 *
 *   young-rock   on a planet without land plants, bare land stays Fels until
 *                soil has really formed — no brown Rohboden on young Earth
 *   greening     once the first land plants are developed they spread along
 *                the shores, and tiles that carry plants draw as vegetation,
 *                not as bare ground
 *
 *   node tools/green-probe.js [seed]          (SE_BUNDLE selects the build)
 *
 * One line per check, OK or FEHLER, with the figure it is judged on.
 * ========================================================================== */
'use strict';

const path = require('path');
process.env.SE_BUNDLE = process.env.SE_BUNDLE || path.join(__dirname, '..', 'simulation.js');
const { makeSim } = require('../tests/helpers');

const seed = Number(process.argv[2] || 12345);
const s = makeSim(seed);
const SE = s.SE;
const w = s.world;
const L = SE.Landscape;
const BARE = new Set([L.Rock, L.Barren, L.Desert]);

function greedy() {
  s.tick();
  if (w.ticks % 5 === 0) {
    s.evo.refresh(w, s.params, true);
    const ids = s.evo.availableIds().sort((a, b) => SE.evoNode(a).cost - SE.evoNode(b).cost);
    if (ids.length) s.evo.develop(w, s.params, ids[0]);
  }
}

function landShares() {
  let land = 0, rock = 0, barren = 0, plants = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    if (w.elevation[i] < 0) continue;
    land++;
    if (w.landscape[i] === L.Rock) rock++;
    if (w.landscape[i] === L.Barren) barren++;
    if (w.flora[i] !== 0) plants++;
  }
  return { land, rock, barren, plants };
}

const line = (ok, name, text) => console.log(`${ok ? 'OK    ' : 'FEHLER'} ${name.padEnd(12)} ${text}`);

s.evo.develop(w, s.params, 'cells');
const t0 = Date.now();

// (a) Young Earth: no land plants yet, so no brown ground.
let worstBarren = 0, worstTick = 0;
while (!w.evo.isDeveloped('landPlants') && w.ticks < 4000) {
  greedy();
  if (w.ticks % 10 === 0 && !w.evo.isDeveloped('landPlants')) {
    const r = landShares();
    if (r.plants === 0 && r.barren / r.land > worstBarren) { worstBarren = r.barren / r.land; worstTick = w.ticks; }
  }
}
line(worstBarren <= 0.02, 'young-rock', `Rohboden vor den ersten Landpflanzen höchstens ${(100 * worstBarren).toFixed(1)} % des Landes (Tick ${worstTick}, Ziel <= 2 %)`);

// (b) Greening from the shore, as tests/sim.test.js checks it, plus drawing.
const devTick = w.ticks;
for (let t = 0; t < 250; t++) s.tick();
s.flora.prepare(w, s.params, true);
let shore = 0, inland = 0;
for (let i = 0; i < SE.TILE_COUNT; i++) {
  if (w.elevation[i] < 0 || !(w.flora[i] & (1 << SE.Flora.LandPlants))) continue;
  if (s.flora.waterAccess[i] > 0) shore++; else inland++;
}
line(shore > 20 && inland <= Math.max(2, shore * 0.02), 'greening',
  `Landpflanzen ab Tick ${devTick}: ${shore} Küstenkacheln, ${inland} im Inland (Ziel > 20 und <= 2 %)`);

/** Land tiles with plants that the map draws as bare ground without any plant object. */
function invisible() {
  const T = SE.LandTables.shared();
  let withPlants = 0, unseen = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    // Land plants only: algae show as a film on open water, not as plants.
    if (w.elevation[i] < 0 || (w.flora[i] & SE.LAND_FLORA_MASK) === 0 || w.vegetation[i] < 0.05) continue;
    withPlants++;
    const ls = w.landscape[i];
    if (BARE.has(ls) && (w.flora[i] & SE.LAND_FLORA_MASK & T.showable[ls]) === 0) unseen++;
  }
  return { withPlants, unseen };
}
const early = invisible();
line(early.withPlants > 0 && early.unseen <= early.withPlants * 0.05, 'drawn-early',
  `Tick ${w.ticks}: ${early.unseen} von ${early.withPlants} Kacheln mit Pflanzen ohne sichtbare Pflanze gezeichnet (Ziel <= 5 %)`);

// (c) Later, with mosses and vascular plants: plant cover must show as vegetation.
const LATE = Number(process.env.GREEN_LATE || 2500);
while (w.ticks < LATE) greedy();
let planted = 0, hidden = 0;
const byLs = {};
for (let i = 0; i < SE.TILE_COUNT; i++) {
  if (w.elevation[i] < 0 || w.vegetation[i] < 0.3 || w.flora[i] === 0) continue;
  planted++;
  if (BARE.has(w.landscape[i])) {
    hidden++;
    const k = `${SE.LANDSCAPE_IDS[w.landscape[i]]}/soil${w.soil[i] >= 90 ? '+' : '-'}/zone${(w.landscapeZone[i] & SE.ZONE_BARE) ? 'Bare' : ''}`;
    byLs[k] = (byLs[k] || 0) + 1;
  }
}
let land = 0, brownBare = 0;
for (let i = 0; i < SE.TILE_COUNT; i++) {
  if (w.elevation[i] < 0) continue;
  land++;
  if (w.landscape[i] === L.Barren && (w.flora[i] & SE.LAND_FLORA_MASK) === 0) brownBare++;
}
let desert = 0;
for (let i = 0; i < SE.TILE_COUNT; i++) if (w.elevation[i] >= 0 && w.landscape[i] === L.Desert) desert++;
line(desert >= land * 0.05, 'deserts', `Tick ${w.ticks}: Wüste auf ${(100 * desert / land).toFixed(1)} % des Landes (Ziel >= 5 %)`);
line(brownBare <= land * 0.1, 'brown-bare',
  `Tick ${w.ticks}: Rohboden ohne Pflanzen auf ${(100 * brownBare / land).toFixed(1)} % des Landes (Ziel <= 10 %)`);
line(planted > 0 && hidden / Math.max(1, planted) <= 0.05, 'drawn',
  `Tick ${w.ticks}: ${hidden} von ${planted} Kacheln mit Pflanzendecke >= 0,3 als kahler Boden (Ziel <= 5 %) ${JSON.stringify(byLs)}`);
console.log(`       Tick ${w.ticks}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
