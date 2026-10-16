/* =============================================================================
 * SimEarth 2.0 — render every effect through its family recipe
 * -----------------------------------------------------------------------------
 * Returns the frames in memory plus a PROBLEM list for anything that breaks
 * the style rules: a colour outside the palette (or the reserved mask white),
 * a translucent colour, too many colours, a wrong box, an empty frame, a
 * foot-anchored sprite whose bottom row is empty (it must stand on it), a
 * texture that does not wrap.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./catalog');
const P = require('../terrain/palette');

/** The family recipe files drawn so far. */
function loadFamilies(only) {
  const out = {};
  for (const fam of C.FAMILIES) {
    if (only && !only.includes(fam)) continue;
    if (fs.existsSync(path.join(__dirname, `${fam}.js`))) out[fam] = require(`./${fam}`);
  }
  return out;
}

function frameProblems(id, t, w, h) {
  const out = [];
  const seen = new Set();
  const mask = P.c('mask0');
  for (const v of t.px) {
    if (v === 0) continue;
    if (v >= P.PALETTE.length) out.push(`${id}: index ${v} is not in the palette`);
    else if (v === mask) out.push(`${id}: uses the reserved mask white`);
    else if (P.PALETTE[v][3] !== 255) out.push(`${id}: translucent colour ${v}`);
    seen.add(v);
  }
  if (seen.size === 0) out.push(`${id}: empty frame`);
  if (seen.size > C.MAX_COLORS) out.push(`${id}: ${seen.size} colours, at most ${C.MAX_COLORS}`);
  if (t.w !== w || t.h !== h) out.push(`${id}: ${t.w}×${t.h}, the catalog says ${w}×${h}`);
  return out;
}

/** `only`: the family ids to build; the others count as not drawn yet. */
function build(only = null) {
  const fams = loadFamilies(only);
  const problems = [];
  const sprites = {};
  const textures = {};
  for (const s of C.SPRITES) {
    const recipe = fams[s.family]?.sprites?.[s.id];
    if (!recipe) {
      if (fams[s.family]) problems.push(`${s.id}: no recipe in ${s.family}.js`);
      continue;
    }
    if (s.tile ? s.w !== 16 || (s.h !== 20 && s.h !== 24) : s.w % 8 !== 0 || s.h % 8 !== 0) {
      problems.push(`${s.id}: ${s.w}×${s.h} is neither in 8-px steps nor a 16×20 / 16×24 tile object`);
    }
    sprites[s.id] = Array.from({ length: s.frames }, (_, f) => {
      const t = recipe(f);
      const id = `${s.id}[${f}]`;
      problems.push(...frameProblems(id, t, s.w, s.h));
      if (s.anchor === 'foot') {
        let foot = false;
        for (let x = 0; x < t.w; x++) if (t.get(x, t.h - 1) !== 0) foot = true;
        if (!foot) problems.push(`${id}: the bottom row is empty — foot sprites stand on their last row`);
      }
      return t;
    });
  }
  for (const tx of C.TEXTURES) {
    const recipe = fams[tx.family]?.textures?.[tx.id];
    if (!recipe) {
      if (fams[tx.family]) problems.push(`${tx.id}: no recipe in ${tx.family}.js`);
      continue;
    }
    textures[tx.id] = Array.from({ length: tx.frames }, (_, f) => {
      const t = recipe(f);
      const id = `${tx.id}[${f}]`;
      problems.push(...frameProblems(id, t, tx.size, tx.size));
      if (!t.wrap) problems.push(`${id}: a ground texture must wrap (new Tex(size, size, true))`);
      return t;
    });
  }
  return { sprites, textures, problems };
}

module.exports = { build };
