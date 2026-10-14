'use strict';
/*
 * Species art: every class has its eight sub-species in time order, every
 * plant group its two covers, and every icon keeps to the shared format —
 * palette colours only, absolute path commands inside the 32x32 box — that
 * lets the renderer give art from many hands one consistent look.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE } = require('./helpers');

const SE = loadSE();
const { artProblems } = require('../tools/artcheck');

const NAME_MAX = 26;

function checkArt(art, where) {
  assert.deepEqual(artProblems(SE, art, where), []);
}

test('every animal class has eight named sub-species, oldest first', () => {
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    const id = SE.LIFE[c].id;
    const sp = SE.SPECIES[c];
    assert.ok(sp, `${id}: no species art`);
    assert.equal(sp.stages.length, SE.SUBSPECIES_PER_CLASS, `${id}: stage count`);
    const names = sp.stages.map((s) => s.name);
    assert.equal(new Set(names).size, names.length, `${id}: duplicate sub-species name`);
    sp.stages.forEach((st, s) => {
      assert.ok(st.name.length > 0 && st.name.length <= NAME_MAX, `${id}[${s}]: name length`);
      if (s > 0) assert.ok(st.ma < sp.stages[s - 1].ma, `${id}[${s}]: must be younger than the stage before`);
      assert.ok(st.ma >= 0 && st.ma <= 4600, `${id}[${s}]: date out of range`);
      checkArt(st.art, `${id}[${s}]`);
    });
  }
});

test('animal biome specialists live where their class can live', () => {
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    const def = SE.LIFE[c];
    for (const sp of SE.SPECIES[c].specialists) {
      const where = `${def.id} specialist ${sp.name}`;
      assert.ok(sp.biome >= 0 && sp.biome < SE.BIOME_COUNT, `${where}: biome`);
      const water = sp.biome < SE.WATER_BIOME_COUNT;
      if (def.realm === 'land') assert.ok(!water, `${where}: land class in a water biome`);
      else assert.ok(water || sp.biome === SE.Biome.Arctic, `${where}: sea class on land`);
      assert.ok(def.suit[sp.biome] > 0, `${where}: the class cannot live in ${SE.BIOME_NAMES[sp.biome]}`);
      assert.ok(Number.isInteger(sp.minStage) && sp.minStage >= 0 && sp.minStage < SE.SUBSPECIES_PER_CLASS, `${where}: minStage`);
      checkArt(sp.art, where);
    }
  }
});

test('every plant group has a sparse and a dense cover', () => {
  for (let g = 1; g < SE.FLORA_COUNT; g++) {
    const def = SE.FLORA[g];
    const fa = SE.FLORA_ART[g];
    assert.ok(fa, `${def.id}: no plant art`);
    checkArt(fa.sparse, `${def.id} sparse`);
    checkArt(fa.dense, `${def.id} dense`);
    for (const sp of fa.specialists) {
      const where = `${def.id} specialist ${sp.name}`;
      const water = sp.biome < SE.WATER_BIOME_COUNT;
      // Ice covers polar sea as well as polar land, so it suits either realm.
      if (sp.biome !== SE.Biome.Arctic) assert.equal(water, def.realm === 'sea', `${where}: biome realm`);
      checkArt(sp.art, where);
    }
  }
});

test('names come from the registry', () => {
  assert.equal(SE.subspeciesName(SE.Life.Mammal, SE.SUBSPECIES_PER_CLASS - 1), SE.SPECIES[SE.Life.Mammal].stages[7].name);
  assert.equal(SE.subspeciesName(SE.Life.None, 0), '—');
});
