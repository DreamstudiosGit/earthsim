'use strict';
/*
 * Species portraits: every sub-species of every class has one, in the same
 * order as its map icon, and every portrait keeps the format rules of
 * tools/portraitcheck.js (palette, absolute paths, box, level of detail).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE } = require('./helpers');
const { portraitProblems } = require('../tools/portraitcheck');

const SE = loadSE();

test('every sub-species has a portrait, in stage order', () => {
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    const id = SE.LIFE[c].id;
    const list = SE.SPECIES_PORTRAITS[c];
    assert.ok(list, `${id}: no portraits`);
    assert.equal(list.length, SE.SUBSPECIES_PER_CLASS, `${id}: portrait count`);
    list.forEach((p, s) => assert.equal(p.name, SE.SPECIES[c].stages[s].name, `${id}[${s}]: name`));
  }
});

test('every portrait keeps the format', () => {
  const problems = [];
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    const list = SE.SPECIES_PORTRAITS[c] || [];
    list.forEach((p, s) => problems.push(...portraitProblems(SE, p, `${SE.LIFE[c].id}[${s}] ${p.name}`)));
  }
  assert.deepEqual(problems, []);
});

test('pictures render as full art and as a silhouette', () => {
  const full = SE.speciesPicture(SE.Life.Mammal, 0, 'full');
  const sil = SE.speciesPicture(SE.Life.Mammal, 0, 'silhouette');
  assert.match(full, /^<svg /);
  assert.match(sil, /currentColor/);
  // The silhouette gives nothing away but the outline.
  for (const hex of Object.values(SE.PORTRAIT_PALETTE)) {
    if (hex !== SE.ART_PALETTE.ink) assert.ok(!sil.includes(hex), `silhouette leaks colour ${hex}`);
  }
});
