'use strict';
/*
 * Every evolution step starts at one spawn point: the first cells in one
 * place in the open ocean, every later group in one small cluster next to
 * its ancestors — never all over the planet at once — and each spawn lives
 * long enough to spread.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE, makeSim } = require('./helpers');

const SE = loadSE();
const W = SE.GRID_W;
const H = SE.GRID_H;
const L = SE.LIFE_COUNT;
const SPAWN_MAX = 5;

/** Tiles on which the group of node `id` lives. */
function tilesOf(s, id) {
  const n = SE.evoNode(id);
  const out = [];
  for (let i = 0; i < SE.TILE_COUNT; i++) {
    const here = n.life !== undefined
      ? s.world.lifeDensity[i * L + n.life] > 0
      : (s.world.flora[i] & (1 << n.flora)) !== 0;
    if (here) out.push(i);
  }
  return out;
}

/** Chebyshev distance between two tiles, wrapping in X. */
function dist(a, b) {
  let dx = Math.abs((a % W) - (b % W));
  dx = Math.min(dx, W - dx);
  return Math.max(dx, Math.abs(Math.floor(a / W) - Math.floor(b / W)));
}

/** Direct (4-) neighbours, wrapping in X. */
function adjacent(a, b) {
  let dx = Math.abs((a % W) - (b % W));
  dx = Math.min(dx, W - dx);
  return dx + Math.abs(Math.floor(a / W) - Math.floor(b / W)) === 1;
}

/** The tile the chronicle names for a step ("Auf der Karte zeigen"). */
function centreOf(s, id) {
  const e = s.world.evo.chronicle.find((c) => c.key === `evo:${id}`);
  assert.ok(e, `chronicle entry for ${id}`);
  return e.at;
}

/** One place: the centre and some of its direct neighbours, nothing else. */
function assertOneSpawn(tiles, centre, id) {
  assert.ok(tiles.length >= 1 && tiles.length <= SPAWN_MAX, `${id}: ${tiles.length} founder tiles`);
  assert.ok(tiles.includes(centre), `${id}: the chronicle points at the spawn`);
  for (const i of tiles) {
    assert.ok(i === centre || adjacent(i, centre), `${id}: tile ${i} is not part of the spawn at ${centre}`);
  }
}

/** How far from its parent's range a step may start (the founding-site rule). */
function reach(n) {
  const p = SE.evoNode(n.parent);
  if (n.flora !== undefined) return p.life !== undefined ? 1 : 2;
  const sea = SE.LIFE[n.life].realm === 'sea';
  const parentSea = p.life !== undefined ? SE.LIFE[p.life].realm === 'sea' : sea;
  return parentSea !== sea ? 2 : 1;
}

/** Size of the connected sea around tile `start`, and of the largest one. */
function seaSizes(world, start) {
  const body = new Int32Array(SE.TILE_COUNT).fill(-1);
  const sizes = [];
  for (let s = 0; s < SE.TILE_COUNT; s++) {
    if (body[s] >= 0 || !world.isWater(s)) continue;
    const label = sizes.length;
    const stack = [s];
    body[s] = label;
    let size = 0;
    while (stack.length) {
      const i = stack.pop();
      size++;
      const x = i % W;
      const y = Math.floor(i / W);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (y + dy < 0 || y + dy >= H) continue;
        const j = SE.idx(SE.wrapX(x + dx), y + dy);
        if (body[j] >= 0 || !world.isWater(j)) continue;
        body[j] = label;
        stack.push(j);
      }
    }
    sizes.push(size);
  }
  return { here: sizes[body[start]], largest: Math.max(...sizes) };
}

const cheapest = (ids) => ids.sort((a, b) => SE.evoNode(a).cost - SE.evoNode(b).cost)[0];

test('the first cells start at one spawn point in the open ocean, and nowhere else', () => {
  for (const seed of [12345, 1, 2]) {
    const s = makeSim(seed);
    assert.ok(s.world.lifeDensity.every((d) => d === 0), 'a fresh planet is lifeless');
    const r = s.evo.develop(s.world, s.params, 'cells');
    assert.ok(r.ok, r.reason);

    for (let i = 0; i < SE.TILE_COUNT; i++) {
      for (let c = 1; c < L; c++) {
        if (c === SE.Life.Prokaryote) continue;
        assert.equal(s.world.lifeDensity[i * L + c], 0, `seed ${seed}: class ${c} on tile ${i}`);
      }
    }
    assert.ok(s.world.flora.every((m) => m === 0), 'no plants yet');
    const centre = centreOf(s, 'cells');
    assertOneSpawn(tilesOf(s, 'cells'), centre, `cells (seed ${seed})`);
    const sea = seaSizes(s.world, centre);
    assert.equal(sea.here, sea.largest, `seed ${seed}: cells start in an inland sea of ${sea.here} tiles`);
  }
});

test('every later step starts in one cluster next to its ancestors', { timeout: 300000 }, () => {
  const s = makeSim(31337);
  s.evo.develop(s.world, s.params, 'cells');
  const kinds = new Set();
  for (let t = 0; t < 1600; t++) {
    s.tick();
    if (t % 5 !== 0) continue;
    s.evo.refresh(s.world, s.params, true);
    const ids = s.evo.availableIds();
    if (ids.length === 0) continue;
    const id = cheapest(ids);
    const n = SE.evoNode(id);
    const parentTiles = tilesOf(s, n.parent);
    assert.equal(tilesOf(s, id).length, 0, `${id} does not exist before it is developed`);

    const r = s.evo.develop(s.world, s.params, id);
    assert.ok(r.ok, r.reason);
    const centre = centreOf(s, id);
    assertOneSpawn(tilesOf(s, id), centre, id);
    const r0 = reach(n);
    assert.ok(parentTiles.some((p) => dist(p, centre) <= r0), `${id} starts within ${r0} of ${n.parent}`);
    kinds.add(n.kingdom);
  }
  assert.ok(kinds.has('animal') && kinds.has('plant'), `checked: ${[...kinds].join(', ')}`);
});

/**
 * Play greedily and require every founded group — chosen or spontaneous — to
 * be alive 60 ticks after its founding. A single spawn has no second
 * population to fall back on, so this is its main risk.
 */
function playAndCheckSurvival(seed, pick, maxTicks) {
  const s = makeSim(seed);
  const w = s.world;
  s.evo.develop(w, s.params, 'cells');
  const due = new Map();
  const dead = [];
  let checked = 0;
  const track = () => {
    for (const [id, d] of w.evo.developed) if (!due.has(id)) due.set(id, d.tick + 60);
  };
  track();
  for (let t = 0; t < maxTicks; t++) {
    s.tick();
    track();
    for (const [id, tick] of due) {
      if (tick !== w.ticks) continue;
      checked++;
      if (s.evo.presence(w, SE.evoNode(id)) === 0) dead.push(id);
    }
    if (t % 5 === 0) {
      s.evo.refresh(w, s.params, true);
      const ids = s.evo.availableIds();
      if (ids.length > 0) {
        const id = pick(ids);
        const r = s.evo.develop(w, s.params, id);
        if (!r.ok) throw new Error(`develop(${id}) failed although available: ${r.reason}`);
        track();
      }
    }
    if (checked === SE.EVO_NODES.length) break;
  }
  assert.deepEqual(dead, [], `seed ${seed}: died within 60 ticks of founding`);
  assert.ok(checked >= 20, `seed ${seed}: only ${checked} steps founded and checked`);
}

const byKingdom = (want) => (ids) => {
  const own = ids.filter((id) => (SE.evoNode(id).kingdom === 'plant') === (want === 'plant'));
  return cheapest(own.length ? own : ids);
};

for (const [seed, pick, label] of [
  [12345, cheapest, 'cheapest first'],
  [2, cheapest, 'cheapest first'],
  [3, cheapest, 'cheapest first'],
  [777, byKingdom('animal'), 'animals first'],
  [31337, byKingdom('plant'), 'plants first'],
]) {
  test(`every spawn survives its first 60 ticks: seed ${seed}, ${label}`, { timeout: 600000 }, () => {
    playAndCheckSurvival(seed, pick, 6000);
  });
}

test('the spawn points are the same for the same seed', { timeout: 300000 }, () => {
  const run = () => {
    const s = makeSim(4242);
    s.evo.develop(s.world, s.params, 'cells');
    const cells = tilesOf(s, 'cells');
    for (let t = 0; t < 600; t++) {
      s.tick();
      if (t % 5 !== 0) continue;
      s.evo.refresh(s.world, s.params, true);
      const ids = s.evo.availableIds();
      if (ids.length) s.evo.develop(s.world, s.params, cheapest(ids));
    }
    const spawns = s.world.evo.chronicle.filter((e) => e.kind === 'evolution').map((e) => `${e.nodeId}@${e.at}`);
    return { cells, spawns };
  };
  const a = run();
  const b = run();
  assert.deepEqual(a.cells, b.cells);
  assert.ok(a.spawns.length >= 3, `only ${a.spawns.length} steps in 600 ticks`);
  assert.deepEqual(a.spawns, b.spawns);
});
