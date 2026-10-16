'use strict';
/*
 * The earthquake (docs/ereignisse-spec.md §3.6): a fissure 2·M + 1 tiles long,
 * horizontal along a nearby plate boundary and along the mountain belt
 * elsewhere; one side of it rises; cities lose people by distance, the
 * ruined ones leave ruins and the standing ones lie in rubble for a few
 * ticks; steep slopes within radius 3 slide and leave scree. Nothing changes
 * beyond QUAKE_REACH, under the sea only the coast's cities are hit, and
 * every run is deterministic.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { makeSim } = require('./helpers');

/** Fissure steps and the rising side's normal, by QuakeState.dir (−, |, /, \). */
const DIR = [[1, 0], [0, 1], [1, -1], [1, 1]];
const RISE = [[0, -1], [-1, 0], [-1, -1], [1, -1]];

/** Rows clear of every plate boundary, where a quake has M 2. */
function inlandRow(SE, y) {
  return !SE.quakeNearPlate(y);
}

/** A land tile in rows that pass `rowOk`, with land and no city within r: the best by `score`, or the first. */
function site(SE, w, rowOk, r, score = null) {
  let best = null;
  let bestScore = 0;
  for (let y = r + 1; y < SE.GRID_H - r - 1; y++) {
    if (!rowOk(y)) continue;
    for (let x = 0; x < SE.GRID_W; x++) {
      if (w.elevation[SE.idx(x, y)] < 0.02) continue;
      let ok = true;
      for (let dy = -r; dy <= r && ok; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const j = SE.idx(SE.wrapX(x + dx), y + dy);
          if (w.elevation[j] < 0 || w.tech[j] !== 0) { ok = false; break; }
        }
      }
      if (!ok) continue;
      if (!score) return [x, y];
      const s = score(x, y);
      if (s > bestScore) { bestScore = s; best = [x, y]; }
    }
  }
  if (!best) throw new Error('no site');
  return best;
}

/** Drop from tile i to its lowest land neighbour, on the heights `e`. */
function lowestLandDrop(SE, e, i) {
  const x = i % SE.GRID_W;
  const y = Math.floor(i / SE.GRID_W);
  let lo = Infinity;
  for (let k = 0; k < 8; k++) {
    const j = SE.idx(SE.wrapX(x + SE.HAZARD_NX[k]), y + SE.HAZARD_NY[k]);
    if (e[j] >= 0) lo = Math.min(lo, e[j]);
  }
  return e[i] - lo;
}

/** Tiles within radius 3 of (x, y) whose drop to a land neighbour exceeds the slide threshold. */
function steepCount(SE, w, x, y) {
  let n = 0;
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (lowestLandDrop(SE, w.elevation, SE.idx(SE.wrapX(x + dx), y + dy)) > SE.QUAKE_SLIDE_DROP) n++;
    }
  }
  return n;
}

function snapshot(SE, w) {
  return {
    elevation: Float32Array.from(w.elevation), scar: Uint8Array.from(w.hazards.scar), tile: Uint8Array.from(w.hazards.tile),
    tech: Uint8Array.from(w.tech), cityPop: Float32Array.from(w.cityPop), vegetation: Float32Array.from(w.vegetation),
    flora: Uint32Array.from(w.flora), landscape: Uint8Array.from(w.landscape), soil: Uint8Array.from(w.soil),
  };
}

function runOut(SE, hz, w, max = 20) {
  let t = 0;
  while (w.hazards.list.length > 0 && t < max) { hz.step(w); t++; }
  return t;
}

/** Offset of tile i from (x, y) on the wrapping map. */
function rel(SE, x, y, i) {
  let dx = (i % SE.GRID_W) - x;
  if (dx > SE.GRID_W / 2) dx -= SE.GRID_W;
  if (dx < -SE.GRID_W / 2) dx += SE.GRID_W;
  return [dx, Math.floor(i / SE.GRID_W) - y];
}

test('the fissure is 5 tiles long inland (M 2) and 7 along a plate boundary (M 3), horizontal there', () => {
  const s = makeSim(777, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  const [x, y] = site(SE, w, (yy) => inlandRow(SE, yy), 4);
  const h = hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
  assert.equal(h.quake.magnitude, 2);
  assert.equal(h.quake.line.length, 5, 'inland: 2 · 2 + 1 tiles');
  const [ddx, ddy] = DIR[h.quake.dir];
  for (const i of h.quake.line) {
    const [dx, dy] = rel(SE, x, y, i);
    assert.ok(dx * ddy === dy * ddx, `fissure tile ${dx},${dy} lies on the line`);
    assert.equal(w.hazards.scar[i], SE.ScarKind.FissureH + h.quake.dir, 'the scar matches the direction');
  }

  const [px, py] = site(SE, w, (yy) => SE.quakeNearPlate(yy), 4);
  const p = hz.start(w, SE.EventKind.Earthquake, px, py, 'player');
  assert.equal(p.quake.magnitude, 3);
  assert.equal(p.quake.dir, 0, 'along the plate boundary');
  assert.equal(p.quake.line.length, 7, 'on a plate boundary: 2 · 3 + 1 tiles');
  for (const i of p.quake.line) {
    assert.equal(Math.floor(i / SE.GRID_W), py, 'horizontal');
    assert.equal(w.hazards.scar[i], SE.ScarKind.FissureH);
  }
});

test('off the plate boundaries the fissure follows the mountain belt', () => {
  const s = makeSim(4242, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  const [x, y] = site(SE, w, (yy) => inlandRow(SE, yy), 4);
  for (let dir = 0; dir < 4; dir++) {
    // A ridge of uplift running in `dir` through the epicentre.
    const [nx, ny] = RISE[dir];
    const norm = Math.hypot(nx, ny);
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) w.uplift[SE.idx(SE.wrapX(x + dx), y + dy)] = Math.max(0, 0.6 - 0.12 * Math.abs((dx * nx + dy * ny) / norm));
    }
    const h = hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
    assert.equal(h.quake.dir, dir, `belt direction ${dir}`);
    SE.HAZARD_RULES[h.kind].finish(w, h);
    w.hazards.list.length = 0;
  }
});

test('one side of the fissure rises by 0.01 · M, the other side stays', () => {
  const s = makeSim(777, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  for (const rowOk of [(yy) => inlandRow(SE, yy), (yy) => SE.quakeNearPlate(yy)]) {
    const [x, y] = site(SE, w, rowOk, 6);
    const before = Float32Array.from(w.elevation);
    const h = hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
    const q = h.quake;
    const [dx, dy] = DIR[q.dir];
    const [nx, ny] = RISE[q.dir];
    let raised = 0;
    for (let oy = -7; oy <= 7; oy++) {
      for (let ox = -7; ox <= 7; ox++) {
        const i = SE.idx(SE.wrapX(x + ox), y + oy);
        const lift = w.elevation[i] - before[i];
        const across = ox * nx + oy * ny;
        const along = Math.abs(ox * dx + oy * dy);
        if (across >= 1 && across <= SE.QUAKE_OFFSET_DEPTH && along <= q.magnitude * (dx * dx + dy * dy)) {
          assert.ok(Math.abs(lift - SE.QUAKE_OFFSET_PER_M * q.magnitude) < 1e-6, `rising side ${ox},${oy} lifted ${lift}`);
          raised++;
        } else {
          assert.equal(lift, 0, `tile ${ox},${oy} off the rising side stays`);
        }
      }
    }
    assert.ok(raised >= 4 * q.magnitude, `${raised} tiles raised`);
    SE.HAZARD_RULES[h.kind].finish(w, h);
    w.hazards.list.length = 0;
  }
});

test('cities lose people by distance; ruined ones leave ruins, standing ones lie in rubble until it settles', () => {
  const s = makeSim(4242, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  const [x, y] = site(SE, w, (yy) => inlandRow(SE, yy), 6);
  const at = (dx, dy) => SE.idx(SE.wrapX(x + dx), y + dy);
  const cities = [[0, 0, 1], [1, 1, 1], [-1, 0, 0.05], [2, -2, 1], [-3, 1, 1], [4, 0, 1], [0, 5, 1]];
  for (const [dx, dy, pop] of cities) {
    w.tech[at(dx, dy)] = SE.Tech.Iron;
    w.cityPop[at(dx, dy)] = pop;
  }
  hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
  const near = 1 - SE.QUAKE_CITY_NEAR_LOSS;
  const far = 1 - SE.QUAKE_CITY_FAR_LOSS;
  assert.ok(Math.abs(w.cityPop[at(0, 0)] - near) < 1e-6, 'epicentre −40 %');
  assert.ok(Math.abs(w.cityPop[at(1, 1)] - near) < 1e-6, 'distance 1 −40 %');
  assert.ok(Math.abs(w.cityPop[at(2, -2)] - far) < 1e-6, 'distance 2 −15 %');
  assert.ok(Math.abs(w.cityPop[at(-3, 1)] - far) < 1e-6, 'distance 3 −15 %');
  assert.equal(w.cityPop[at(4, 0)], 1, 'distance 4 untouched');
  assert.equal(w.cityPop[at(0, 5)], 1, 'distance 5 untouched');
  assert.equal(w.tech[at(-1, 0)], SE.Tech.None, 'the small city is gone');
  assert.equal(w.hazards.scar[at(-1, 0)], SE.ScarKind.Ruins, 'and left ruins');
  const rubble = [at(0, 0), at(1, 1), at(2, -2), at(-3, 1)];
  for (const i of rubble) {
    assert.equal(w.hazards.tile[i], SE.HazardTile.Rubble, 'a damaged city lies in rubble');
    assert.ok(w.hazards.level[i] >= SE.QUAKE_RUBBLE_MIN && w.hazards.level[i] <= SE.QUAKE_RUBBLE_MIN + SE.QUAKE_RUBBLE_SPAN);
    const scar = w.hazards.scar[i];
    assert.ok(scar < SE.ScarKind.FissureH || scar > SE.ScarKind.FissureD2, 'no fissure through a standing city');
  }
  assert.equal(w.hazards.tile[at(4, 0)], SE.HazardTile.None);
  for (let t = 0; t < SE.QUAKE_RUBBLE_MIN - 1; t++) hz.step(w);
  assert.equal(w.hazards.list.length, 1, 'the quake runs while rubble settles');
  const ticks = SE.QUAKE_RUBBLE_MIN - 1 + runOut(SE, hz, w);
  assert.equal(w.hazards.list.length, 0, 'then it is over');
  assert.ok(ticks <= SE.QUAKE_RUBBLE_MIN + SE.QUAKE_RUBBLE_SPAN, `${ticks} ticks`);
  for (const i of rubble) assert.equal(w.hazards.tile[i], SE.HazardTile.None, 'the rubble has settled');
});

test('landslides come down only on slopes steeper than 0.12 within radius 3 and leave scree', () => {
  const s = makeSim(777, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  const [x, y] = site(SE, w, () => true, 5, (sx, sy) => steepCount(SE, w, sx, sy));
  const scarBefore = Uint8Array.from(w.hazards.scar);
  const h = hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
  const shocked = Float32Array.from(w.elevation);
  const ticks = runOut(SE, hz, w);
  const q = h.quake;
  assert.ok(ticks >= 1 && ticks <= SE.QUAKE_SLIDE_TICKS, `slides over ${ticks} ticks`);
  assert.ok(q.slid.length > 0, 'something slid');
  const touched = new Set();
  for (const { from, to } of q.slid) {
    const [fx, fy] = rel(SE, x, y, from);
    assert.ok(Math.max(Math.abs(fx), Math.abs(fy)) <= SE.QUAKE_SLIDE_RADIUS, `slide ${fx},${fy} within radius 3`);
    const drop = lowestLandDrop(SE, shocked, from);
    assert.ok(drop > SE.QUAKE_SLIDE_DROP, `the slope dropped ${drop.toFixed(3)}`);
    const [tx, ty] = rel(SE, x, y, to);
    assert.equal(Math.max(Math.abs(tx - fx), Math.abs(ty - fy)), 1, 'onto a neighbour');
    assert.ok(!q.line.includes(from) && !q.line.includes(to), 'slides never bury the fissure');
    touched.add(from);
    touched.add(to);
  }
  for (const i of touched) {
    assert.equal(w.hazards.scar[i], SE.ScarKind.Scree, 'scree');
    assert.equal(w.vegetation[i], 0, 'no plants');
    assert.equal(w.landscape[i], SE.Landscape.Rock, 'bare rock');
  }
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    if (w.hazards.scar[i] === SE.ScarKind.Scree && scarBefore[i] !== SE.ScarKind.Scree) assert.ok(touched.has(i), 'scree only from slides');
  }
});

test('nothing changes beyond radius 4, and a quake under the sea only hits the cities on the coast', () => {
  const s = makeSim(777, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  const steepSite = site(SE, w, () => true, 5, (sx, sy) => steepCount(SE, w, sx, sy));
  const plateSite = site(SE, w, (yy) => SE.quakeNearPlate(yy), 6);
  for (const [x, y] of [steepSite, plateSite]) {
    for (let dy = -6; dy <= 6; dy += 3) {
      for (let dx = -6; dx <= 6; dx += 3) {
        w.tech[SE.idx(SE.wrapX(x + dx), y + dy)] = SE.Tech.Bronze;
        w.cityPop[SE.idx(SE.wrapX(x + dx), y + dy)] = 0.5;
      }
    }
    // The other site's scars may end meanwhile; only this quake's changes count.
    w.hazards.clear();
    const before = snapshot(SE, w);
    hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
    runOut(SE, hz, w);
    const after = snapshot(SE, w);
    for (const key of Object.keys(before)) {
      for (let i = 0; i < SE.TILE_COUNT; i++) {
        if (before[key][i] === after[key][i]) continue;
        const [dx, dy] = rel(SE, x, y, i);
        assert.ok(Math.max(Math.abs(dx), Math.abs(dy)) <= SE.QUAKE_REACH, `${key} changed ${dx},${dy} from the epicentre`);
      }
    }
  }

  // A sea tile with a city on the coast 2 tiles away.
  let sea = null;
  for (let i = 0; i < SE.TILE_COUNT && !sea; i++) {
    const x = i % SE.GRID_W;
    const y = Math.floor(i / SE.GRID_W);
    if (y < 8 || y > SE.GRID_H - 8 || w.elevation[i] > -0.05) continue;
    const coast = SE.idx(SE.wrapX(x + 2), y);
    if (w.elevation[coast] > 0.02 && w.tech[coast] === 0) sea = [x, y, coast];
  }
  const [x, y, coast] = sea;
  w.tech[coast] = SE.Tech.Stone;
  w.cityPop[coast] = 1;
  w.hazards.clear();
  const before = snapshot(SE, w);
  const h = hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
  assert.ok(Math.abs(w.cityPop[coast] - (1 - SE.QUAKE_CITY_FAR_LOSS)) < 1e-6, 'the coastal city is hit');
  assert.equal(h.quake.line.length, 0, 'no fissure under the sea');
  // The quake raises a tidal wave (a chain, spec §3.9); it is ended at once, so only the quake's own effects count.
  const wave = w.hazards.list.find((o) => o.kind === SE.EventKind.TidalWave && o.cause === 'chain');
  assert.ok(wave, 'a sea quake raises one chained tidal wave');
  assert.equal(w.hazards.list.filter((o) => o.kind === SE.EventKind.TidalWave).length, 1);
  SE.HAZARD_RULES[wave.kind].finish(w, wave);
  w.hazards.list.splice(w.hazards.list.indexOf(wave), 1);
  runOut(SE, hz, w);
  assert.deepEqual(w.elevation, before.elevation, 'no offset, no slides');
  for (let i = 0; i < SE.TILE_COUNT; i++) if (i !== coast) assert.equal(w.hazards.scar[i], before.scar[i]);
});

test('quakes are deterministic', () => {
  const once = () => {
    const s = makeSim(31337, 'today');
    const { SE, world: w } = s;
    const hz = new SE.HazardSystem();
    const [x, y] = site(SE, w, () => true, 5, (sx, sy) => steepCount(SE, w, sx, sy));
    const h = hz.start(w, SE.EventKind.Earthquake, x, y, 'player');
    runOut(SE, hz, w);
    return { scar: Array.from(w.hazards.scar), elevation: Array.from(w.elevation), slid: h.quake.slid, dir: h.quake.dir };
  };
  const a = once();
  const b = once();
  assert.ok(a.slid.length > 0);
  assert.deepEqual(a, b);
});

test('the show trembles, sends ground waves out to 4 tiles, opens the fissure in dust and leaves rubble; reduced effects never shake', () => {
  const s = makeSim(4242, 'today');
  const { SE, world: w } = s;
  const hz = new SE.HazardSystem();
  const [x, y] = site(SE, w, (yy) => inlandRow(SE, yy), 6);
  const cam = { scrollX: x - 10, scrollY: y - 6, tilePx: 32, dpr: 1 };
  const omenMs = SE.HAZARD_OMEN_MS[SE.EventKind.Earthquake];
  const play = (reduce) => {
    const city = SE.idx(SE.wrapX(x + 2), y + 2);
    w.tech[city] = SE.Tech.Iron;
    w.cityPop[city] = 1;
    const show = new SE.FxShow();
    show.reduce = reduce;
    const particles = new SE.FxParticles();
    show.build(w, cam, 20, 12, 0, 0, particles);
    let started = null;
    show.stage(w, SE.EventKind.Earthquake, x, y, () => (started = hz.start(w, SE.EventKind.Earthquake, x, y, 'player')));
    const t0 = performance.now();
    const omen = show.build(w, cam, 20, 12, t0 + 100, 0.1, particles);
    assert.equal(started, null, 'nothing has happened yet during the omen');
    const main = show.build(w, cam, 20, 12, t0 + omenMs + 1, 0.1, particles);
    assert.ok(started, 'the quake started once the omen was over');
    const mid = show.build(w, cam, 20, 12, t0 + omenMs + 700, 0.1, particles);
    const waves = mid.rings.filter((r) => r.ground);
    assert.ok(waves.length >= 1 && waves.every((r) => r.r <= 64), 'ground waves within 4 tiles');
    assert.ok(mid.tops.some((d) => d.id === 'dust_puff'), 'dust runs along the opening fissure');
    assert.ok(mid.objects.some((d) => d.id === 'rubble'), 'the damaged city lies in rubble');
    const shakes = omen.shakes.length + main.shakes.length + mid.shakes.length;
    SE.HAZARD_RULES[started.kind].finish(w, started);
    w.hazards.list.length = 0;
    return shakes;
  };
  assert.ok(play(false) > 0, 'the ground trembles');
  assert.equal(play(true), 0, 'no shaking with reduced effects');
});

test('the fissure decal: end pieces at the line ends, laid towards the line, middles between, about a third of them branched', () => {
  const s = makeSim(777, 'today');
  const { SE, world: w } = s;
  const FISSURE = [SE.ScarKind.FissureH, SE.ScarKind.FissureV, SE.ScarKind.FissureD1, SE.ScarKind.FissureD2];
  const [x, y] = site(SE, w, () => true, 6);
  let middles = 0;
  let branched = 0;
  for (let dir = 0; dir < 4; dir++) {
    w.hazards.clear();
    const [ddx, ddy] = DIR[dir];
    const n = 4;
    for (let k = -n; k <= n; k++) w.hazards.scar[SE.idx(SE.wrapX(x + k * ddx), y + k * ddy)] = FISSURE[dir];
    // A lone fissure tile of the same kind off the line.
    const [lx, ly] = [x + 3 * RISE[dir][0] + (dir === 0 ? 3 : 0), y + 3 * RISE[dir][1]];
    w.hazards.scar[SE.idx(SE.wrapX(lx), ly)] = FISSURE[dir];
    for (let k = -n; k <= n; k++) {
      const p = SE.fxFissurePiece(w, x + k * ddx, y + k * ddy);
      if (k === -n || k === n) {
        assert.equal(p.piece, 1, `dir ${dir}: end piece at ${k}`);
        const towards = k === -n ? 1 : -1;
        assert.deepEqual([p.dx, p.dy], [8 * towards * ddx, 8 * towards * ddy], `dir ${dir}: the end lens lies on the edge towards the line`);
      } else {
        assert.ok(p.piece === 0 || p.piece === 2, `dir ${dir}: middle piece at ${k}`);
        assert.deepEqual([p.dx, p.dy], [0, 0]);
      }
    }
    assert.deepEqual(SE.fxFissurePiece(w, lx, ly), { piece: 1, dx: 0, dy: 0 }, `dir ${dir}: a lone tile gets the end lens on its centre`);
    assert.equal(SE.fxFissurePiece(w, x + RISE[dir][0], y + RISE[dir][1]), null, 'no fissure, no piece');
    // An opening fissure: tiles still hidden count as no fissure, so the visible part ends in a tip.
    const hidden = new Set([SE.idx(SE.wrapX(x + 2 * ddx), y + 2 * ddy)]);
    assert.equal(SE.fxFissurePiece(w, x + ddx, y + ddy, hidden).piece, 1, 'the opening front is an end');

    // The scene draws them centred on the tile (or its edge), the frame by direction and piece, the foot on the top row.
    const show = new SE.FxShow();
    const cam = { scrollX: x - 8, scrollY: y - 6, tilePx: 32, dpr: 1 };
    const scene = show.build(w, cam, 16, 12, 1000, 0, new SE.FxParticles());
    for (let k = -n; k <= n; k++) {
      const tx = x + k * ddx;
      const ty = y + k * ddy;
      const p = SE.fxFissurePiece(w, tx, ty);
      const d = scene.decals.find((o) => o.id === 'fissure' && o.x === tx * 16 + 8 + p.dx && o.y === ty * 16 + 8 + p.dy);
      assert.ok(d, `dir ${dir}: decal of tile ${k} drawn`);
      assert.equal(d.frame, dir * 3 + p.piece);
      assert.equal(d.foot, d.y - 8, 'the decal sorts behind what stands on its tiles');
    }
  }
  // Middles of many lines: about one in three branches.
  for (let yy = 4; yy < SE.GRID_H - 4; yy++) {
    for (let xx = 0; xx < SE.GRID_W; xx++) {
      w.hazards.clear();
      for (let k = -1; k <= 1; k++) w.hazards.scar[SE.idx(SE.wrapX(xx + k), yy)] = SE.ScarKind.FissureH;
      if ((xx + yy) % 7 !== 0) continue;
      middles++;
      if (SE.fxFissurePiece(w, xx, yy).piece === 2) branched++;
    }
  }
  assert.ok(branched / middles > 0.25 && branched / middles < 0.42, `${branched} of ${middles} middles branched`);
});
