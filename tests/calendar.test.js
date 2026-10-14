'use strict';
/*
 * The Earth calendar: a contiguous era table from formation to the present,
 * a game-length number of ticks to get there, closed-form ages that match
 * tick-by-tick stepping, German dates, and the world clock following the
 * calendar until a civilization takes over.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE } = require('./helpers');

const SE = loadSE();
const ageOfMa = (ma) => SE.PLANET_AGE - Math.round(ma * 1e6);

test('the era table runs without gaps from 4600 Ma to the present', () => {
  const eras = SE.GEO_ERAS;
  assert.equal(SE.PLANET_AGE, 4.6e9);
  assert.equal(eras[0].fromMa, 4600);
  assert.equal(eras[eras.length - 1].toMa, 0);
  eras.forEach((e, k) => {
    assert.ok(e.fromMa > e.toMa, `${e.name} runs forward`);
    assert.ok(e.yearsPerTick > 0 && Number.isInteger(e.yearsPerTick), `${e.name} steps whole years`);
    assert.ok(e.name && e.short && e.short.length <= e.name.length, `${e.name} has a short form`);
    if (k > 0) assert.equal(e.fromMa, eras[k - 1].toMa, `${e.name} starts where ${eras[k - 1].name} ends`);
  });
});

test('reaching the present takes about 4 880 ticks', () => {
  let age = 0;
  let ticks = 0;
  while (age < SE.PLANET_AGE) { age += SE.yearsPerTickAt(age); ticks++; }
  assert.ok(Math.abs(ticks - 4880) <= 60, `${ticks} ticks to the present`);
});

test('each era steps at its own pace, and the present keeps the last one', () => {
  for (const e of SE.GEO_ERAS) {
    const mid = ageOfMa((e.fromMa + e.toMa) / 2);
    assert.equal(SE.eraAt(mid), e, `middle of ${e.name}`);
    assert.equal(SE.yearsPerTickAt(mid), e.yearsPerTick, `step in ${e.name}`);
    if (e.fromMa < 4600) assert.equal(SE.eraAt(ageOfMa(e.fromMa)), e, `${e.name} starts at ${e.fromMa} Ma`);
  }
  assert.equal(SE.yearsPerTickAt(0), 25e6);
  assert.equal(SE.eraAt(ageOfMa(3800)).name, 'Archaikum');
  assert.equal(SE.yearsPerTickAt(ageOfMa(530)), 125e3);
  assert.equal(SE.yearsPerTickAt(ageOfMa(100)), 150e3);
  assert.equal(SE.yearsPerTickAt(ageOfMa(1)), 10e3);
  assert.equal(SE.eraAt(SE.PLANET_AGE + 5e6).name, 'Quartär');
  assert.equal(SE.yearsPerTickAt(SE.PLANET_AGE + 5e6), 10e3);
});

test('ageAtTick gives exactly the age that stepping reaches', () => {
  let age = 0;
  for (let t = 0; t <= 6000; t++) {
    assert.equal(SE.ageAtTick(t), age, `tick ${t}`);
    age += SE.yearsPerTickAt(age);
  }
  assert.equal(SE.ageAtTick(-5), 0);
  assert.equal(SE.ageAtTick(1), 25e6);
});

test('dates read as German "vor …" text, and past the present as "Gegenwart + …"', () => {
  assert.equal(SE.formatEarthDate(ageOfMa(3800)), 'vor 3,8 Mrd. Jahren');
  assert.equal(SE.formatEarthDate(ageOfMa(2400)), 'vor 2,4 Mrd. Jahren');
  assert.equal(SE.formatEarthDate(ageOfMa(530)), 'vor 530 Mio. Jahren');
  assert.equal(SE.formatEarthDate(ageOfMa(2.6)), 'vor 2,6 Mio. Jahren');
  assert.equal(SE.formatEarthDate(SE.PLANET_AGE - 12000), 'vor 12.000 Jahren');
  assert.equal(SE.formatEarthDate(SE.PLANET_AGE - 1), 'vor einem Jahr');
  assert.equal(SE.formatEarthDate(SE.PLANET_AGE), 'Gegenwart');
  assert.equal(SE.formatEarthDate(SE.PLANET_AGE + 1200), 'Gegenwart + 1.200 Jahre');
  assert.equal(SE.formatEarthDate(SE.PLANET_AGE + 1), 'Gegenwart + 1 Jahr');
  assert.equal(SE.formatEarthDate(0, true), 'vor 4,6 Mrd. J.');
  assert.equal(SE.formatEarthDate(SE.PLANET_AGE + 1200, true), 'Gegenwart + 1.200 J.');
  // Rounding never shows "1.000 Mio.".
  assert.equal(SE.formatEarthDate(ageOfMa(999.8)), 'vor 1 Mrd. Jahren');
  assert.equal(SE.yearsAgo(SE.PLANET_AGE + 50), -50);
});

test('every tree step has an Earth date, never older than its parent', () => {
  for (const n of SE.EVO_NODES) {
    const ma = SE.EARTH_DATES_MA[n.id];
    assert.ok(ma > 0 && ma < 4600, `${n.id} has a date`);
    if (n.parent) assert.ok(ma <= SE.EARTH_DATES_MA[n.parent], `${n.id} not before ${n.parent}`);
  }
  assert.equal(Object.keys(SE.EARTH_DATES_MA).length, SE.EVO_NODES.length);
});

test('the world clock follows the calendar until a civilization runs it', () => {
  const w = new SE.WorldState();
  w.absoluteYears = ageOfMa(3000);
  for (const scale of [SE.TimeScale.Geologic, SE.TimeScale.Evolution]) {
    w.timeScale = scale;
    assert.equal(w.yearsPerTick, 20e6);
  }
  w.absoluteYears = ageOfMa(400);
  assert.equal(w.yearsPerTick, 125e3);
  w.timeScale = SE.TimeScale.Civilized;
  assert.equal(w.yearsPerTick, SE.YEARS_PER_TICK[SE.TimeScale.Civilized]);
  assert.equal(w.yearsPerTick, 100);
  w.timeScale = SE.TimeScale.Technology;
  assert.equal(w.yearsPerTick, 10);
});
