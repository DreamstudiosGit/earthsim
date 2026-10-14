'use strict';
/*
 * The sea share chosen for a new planet: the coastline lands where asked, the
 * mantle underneath stays the same, and the default still makes exactly the
 * planets it made before the share became a choice.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE, hash } = require('./helpers');

const SE = loadSE();

function waterShare(w) {
  let water = 0;
  for (let i = 0; i < SE.TILE_COUNT; i++) if (w.elevation[i] < 0) water++;
  return water / SE.TILE_COUNT;
}

test('O01: the generated sea covers the chosen share', () => {
  for (const share of [SE.OCEAN_SHARE_MIN, SE.OCEAN_FRACTION, SE.OCEAN_SHARE_MAX]) {
    for (const seed of [1234, 98765]) {
      const w = new SE.WorldState();
      w.reset(seed, share);
      const got = waterShare(w);
      assert.ok(Math.abs(got - share) <= 0.02, `seed ${seed}, share ${share}: water ${got.toFixed(3)}`);
      assert.ok(Math.abs(w.oceanFraction - got) < 1e-9, 'derived oceanFraction matches the terrain');
    }
  }
});

test('O02: the mantle field does not move with the sea share', () => {
  const magma = [0.3, 0.58, 0.85].map((share) => {
    const w = new SE.WorldState();
    w.reset(4242, share);
    return hash(w.magma);
  });
  assert.equal(magma[0], magma[1]);
  assert.equal(magma[1], magma[2]);
});

test('O03: the default share still makes the same planet as before', () => {
  // Fingerprints taken before the share became a parameter.
  const before = { 1234: [1514392851, 2939624411], 12345: [3682870883, 412929661] };
  for (const [seed, [elevation, magma]] of Object.entries(before)) {
    const w = new SE.WorldState();
    w.reset(Number(seed));
    assert.equal(hash(w.elevation), elevation, `elevation of seed ${seed}`);
    assert.equal(hash(w.magma), magma, `magma of seed ${seed}`);
    const explicit = new SE.WorldState();
    explicit.reset(Number(seed), SE.OCEAN_FRACTION);
    assert.equal(hash(explicit.elevation), elevation);
  }
});

test('O04: a share outside the allowed range is held to its bounds', () => {
  const low = new SE.WorldState();
  low.reset(77, 0.05);
  const min = new SE.WorldState();
  min.reset(77, SE.OCEAN_SHARE_MIN);
  assert.equal(hash(low.elevation), hash(min.elevation));
});
