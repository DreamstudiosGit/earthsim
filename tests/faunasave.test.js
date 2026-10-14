'use strict';
/*
 * The species lexicon in save files: discovery progress survives a save and
 * reload through SaveSystem, saves written before the lexicon adopt what
 * lives on the planet without a flood of notices, and a damaged lexicon
 * field never blocks loading the planet. The field is optional, so the
 * save format number stays the same.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE, makeSim } = require('./helpers');

const SE = loadSE();

/** A planet some way into a game, with its lexicon stepped every tick. */
function playedSim(seed = 2024, ticks = 700) {
  const s = makeSim(seed);
  s.fauna = new SE.FaunaDex();
  s.evo.develop(s.world, s.params, 'cells');
  for (let t = 0; t < ticks; t++) {
    s.tick();
    s.fauna.step(s.world);
    if (t % 5 !== 0) continue;
    s.evo.refresh(s.world, s.params, true);
    const ids = s.evo.availableIds().sort((a, b) => SE.evoNode(a).cost - SE.evoNode(b).cost);
    if (ids.length > 0) s.evo.develop(s.world, s.params, ids[0]);
  }
  return s;
}

const ctx = (s) => ({ world: s.world, params: s.params, geo: s.geo, history: s.history, fauna: s.fauna });

function snapshot(dex) {
  const out = [];
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    for (let st = 0; st < SE.SUBSPECIES_PER_CLASS; st++) {
      const d = dex.discovery(c, st);
      out.push([c, st, dex.status(c, st), dex.returns(c, st), d && d.tick, d && d.tile, d && d.biome]);
    }
  }
  return out;
}

test('discovery progress survives a save and reload', async () => {
  const a = playedSim();
  assert.ok(a.fauna.discoveredCount() > 5, `only ${a.fauna.discoveredCount()} discoveries to save`);
  const doc = SE.SaveSystem.serialize(ctx(a));
  assert.equal(doc.version, SE.SAVE_FORMAT, 'the lexicon does not change the save format number');
  assert.ok(doc.fauna, 'the save carries the lexicon');

  const b = makeSim(1);
  b.fauna = new SE.FaunaDex();
  b.fauna.pending.push({ c: SE.Life.Mammal, stage: 0, tick: 0 });
  SE.SaveSystem.load(await SE.SaveSystem.decode(await SE.SaveSystem.encode(doc)), ctx(b), b.life, b.flora);
  assert.deepEqual(snapshot(b.fauna), snapshot(a.fauna));
  assert.equal(b.fauna.discoveredCount(), a.fauna.discoveredCount());
  assert.equal(b.fauna.pending.length, 0, 'loading announces nothing');
  assert.deepEqual(b.fauna.unannounced(), a.fauna.unannounced(), 'notices still waiting are kept for the game to show');

  // Play on: what was already found is never announced again.
  for (let t = 0; t < 60; t++) { b.tick(); b.fauna.step(b.world); }
  for (const e of b.fauna.pending) {
    assert.ok(!a.fauna.isDiscovered(e.c, e.stage), `rediscovered ${SE.LIFE[e.c].id}[${e.stage}] after loading`);
  }
});

test('a save from before the lexicon adopts what lives, silently', () => {
  const a = playedSim();
  const doc = SE.SaveSystem.serialize(ctx(a));
  delete doc.fauna;

  const b = makeSim(1);
  b.fauna = new SE.FaunaDex();
  SE.SaveSystem.load(doc, ctx(b), b.life, b.flora);
  assert.equal(b.fauna.pending.length, 0, 'no flood of notices');
  b.world.refreshDerived();
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    for (let st = 0; st < SE.SUBSPECIES_PER_CLASS; st++) {
      if (b.world.lifeStageCounts[c * SE.SUBSPECIES_PER_CLASS + st] > 0) {
        assert.ok(b.fauna.isDiscovered(c, st), `${SE.LIFE[c].id}[${st}] lives but was not adopted`);
        assert.ok(b.fauna.discovery(c, st).adopted, `${SE.LIFE[c].id}[${st}] should be marked as adopted`);
      }
    }
  }
});

test('a damaged lexicon field never blocks loading the planet', () => {
  const a = playedSim(7, 300);
  for (const broken of [42, 'x', { v: 99 }, { v: 1, entries: { mammals: 'nope' } }]) {
    const doc = SE.SaveSystem.serialize(ctx(a));
    doc.fauna = broken;
    const b = makeSim(1);
    b.fauna = new SE.FaunaDex();
    SE.SaveSystem.load(doc, ctx(b), b.life, b.flora);
    assert.equal(b.world.ticks, a.world.ticks, `planet not loaded with fauna = ${JSON.stringify(broken)}`);
    assert.equal(b.fauna.pending.length, 0);
  }
});
