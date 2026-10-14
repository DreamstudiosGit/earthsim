'use strict';
/*
 * Species lore: every sub-species of every class has its lexicon texts, in
 * the same order as its map icon, within the lengths the info box and the
 * lexicon are laid out for.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE } = require('./helpers');

const SE = loadSE();

/** Abbreviations with a full stop would break the sentence count. */
const ABBREVIATIONS = /\b(z\. ?B\.|ca\.|Mio\.|Mrd\.|u\. ?a\.|bzw\.|d\. ?h\.|evtl\.|ggf\.|usw\.|vgl\.|etc\.)/;

function sentences(text) {
  return text.split(/[.!?](?=\s|$)/).map((s) => s.trim()).filter((s) => s.length > 0).length;
}

function eachLore(fn) {
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    const list = SE.SPECIES_LORE[c] || [];
    list.forEach((l, s) => fn(l, `${SE.LIFE[c].id}[${s}] ${l.name}`, c, s));
  }
}

test('every sub-species has its texts, in stage order', () => {
  for (let c = 1; c < SE.LIFE_COUNT; c++) {
    const id = SE.LIFE[c].id;
    const list = SE.SPECIES_LORE[c];
    assert.ok(list, `${id}: no lore`);
    assert.equal(list.length, SE.SUBSPECIES_PER_CLASS, `${id}: lore count`);
    list.forEach((l, s) => assert.equal(l.name, SE.SPECIES[c].stages[s].name, `${id}[${s}]: name`));
  }
});

test('descriptions run two to four sentences', () => {
  eachLore((l, where) => {
    const n = sentences(l.about);
    assert.ok(n >= 2 && n <= 4, `${where}: about has ${n} sentences`);
    assert.ok(l.about.length >= 120 && l.about.length <= 480, `${where}: about is ${l.about.length} characters`);
    const e = sentences(l.evolution);
    assert.ok(e >= 1 && e <= 3, `${where}: evolution has ${e} sentences`);
    assert.ok(l.evolution.length >= 60 && l.evolution.length <= 360, `${where}: evolution is ${l.evolution.length} characters`);
  });
});

test('hints stay vague', () => {
  eachLore((l, where) => {
    assert.ok(l.hint.length >= 8 && l.hint.length <= 70, `${where}: hint is ${l.hint.length} characters`);
    const hint = l.hint.toLowerCase();
    for (const word of l.name.toLowerCase().split(/[\s-]+/)) {
      if (word.length >= 5) assert.ok(!hint.includes(word), `${where}: hint gives away "${word}"`);
    }
  });
});

test('texts are clean prose', () => {
  eachLore((l, where) => {
    for (const [key, text] of [['about', l.about], ['evolution', l.evolution], ['hint', l.hint]]) {
      assert.ok(!ABBREVIATIONS.test(text), `${where}: ${key} uses an abbreviation`);
      assert.ok(!/["\n]/.test(text), `${where}: ${key} has a straight quote or a line break`);
      assert.ok(!/\s{2,}/.test(text), `${where}: ${key} has a double space`);
    }
  });
});
