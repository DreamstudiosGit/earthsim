'use strict';
/*
 * Every step of the tree has its moment: a story with four captions, its
 * breakthrough and why it spread, and a fact; and a film that is well-formed
 * SVG with its key moment marked in the breakthrough beat.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSE } = require('./helpers');

const SE = loadSE();

test('every evolution step has a story', () => {
  for (const n of SE.EVO_NODES) {
    const s = SE.EVO_STORIES[n.id];
    assert.ok(s, `story for ${n.id}`);
    assert.equal(s.beats.length, 4, `${n.id}: four captions`);
    for (const b of s.beats) assert.ok(b.length > 4 && b.length <= 40, `${n.id}: caption "${b}" fits on one line`);
    assert.match(s.when, /\d/, `${n.id}: a date`);
    assert.ok(s.era.length > 2, `${n.id}: an era`);
    assert.ok(s.innovation.length > 4 && s.innovation.length <= 32, `${n.id}: breakthrough "${s.innovation}" is short`);
    assert.ok(s.advantage.length > 80 && s.advantage.length < 270, `${n.id}: advantage length ${s.advantage.length}`);
    assert.ok(s.story.length > 120 && s.story.length < 480, `${n.id}: story length ${s.story.length}`);
    assert.ok(s.fact.length > 20 && s.fact.length < 220, `${n.id}: fact length`);
  }
  assert.deepEqual(Object.keys(SE.EVO_STORIES).sort(), SE.EVO_NODES.map((n) => n.id).sort(), 'no stories for unknown steps');
});

test('every evolution step has a well-formed film with its moment', () => {
  for (const n of SE.EVO_NODES) {
    const f = SE.EVO_FILMS[n.id];
    assert.equal(typeof f, 'function', `film for ${n.id}`);
    const svg = f();
    assert.match(svg, /^<svg class="evo-film" data-film="/, `${n.id}: made with film()`);
    assert.ok(svg.endsWith('</svg>'), `${n.id}: closed`);
    const bursts = [...svg.matchAll(/class="o o-burst[^"]*" style="[^"]*--delay:(-?[\d.]+)s/g)].map((m) => Number(m[1]));
    const key = SE.FILM_KEY_BEAT * SE.FILM_SECONDS / 4;
    assert.ok(bursts.some((t) => t >= key - 0.5 && t <= key + 2), `${n.id}: marks its breakthrough with sparkle() at ${key}–${key + 2} s (found ${bursts.join(', ') || 'none'})`);
    assert.ok(!/<script|<animate|<filter|href="http/i.test(svg), `${n.id}: no scripts, SMIL, filters or remote resources`);
    for (const [, gid] of svg.matchAll(/ id="([^"]+)"/g)) {
      assert.ok(gid.startsWith(`${n.id}-`), `${n.id}: id "${gid}" carries the film's prefix`);
    }
    assert.equal(f(), svg, `${n.id}: the same film every time`);
  }
});
