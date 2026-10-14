/* =============================================================================
 * SimEarth 2.0 — species portrait format check
 * -----------------------------------------------------------------------------
 * The rules every portrait in src/species/portraits/ keeps: portrait palette
 * colours only, absolute path commands, end points inside the 64x64 box with
 * room for the outline, and enough shapes to read as a detailed study rather
 * than a map icon. Shared by tests/portraits.test.js and the contact sheet
 * (tools/portrait-sheet.js), so artists see the same verdict the test gives.
 * ========================================================================== */
'use strict';

const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
/** A portrait has at least this many shapes; the map icons have 7 to 12. */
const MIN_SHAPES = 25;
/** Thinner strokes vanish at the lexicon's thumbnail size. */
const MIN_STROKE = 0.6;

function pathProblems(d) {
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  const out = [];
  let k = 0;
  let cmd = null;
  while (k < tokens.length) {
    if (/[A-Za-z]/.test(tokens[k])) {
      cmd = tokens[k++];
      if (!(cmd in ARGS)) return [`"${cmd}" is not an absolute path command`];
      if (cmd === 'Z') continue;
    } else if (cmd === null || cmd === 'Z') {
      return ['number without a command'];
    }
    const n = ARGS[cmd];
    const v = tokens.slice(k, k + n).map(Number);
    if (v.length < n || v.some((x) => Number.isNaN(x))) return [`"${cmd}" is missing numbers`];
    k += n;
    const ends = cmd === 'H' || cmd === 'V' ? [v[0]] : cmd === 'A' ? [v[5], v[6]] : v.slice(-2);
    const handles = cmd === 'C' || cmd === 'S' || cmd === 'Q' ? v.slice(0, -2) : [];
    if (ends.some((x) => x < 1 || x > 63)) out.push(`"${cmd}" ends outside 1..63`);
    if (handles.some((x) => x < -8 || x > 72)) out.push(`"${cmd}" handle far outside the box`);
  }
  return out;
}

/** Problems with one portrait, each prefixed with `where`. */
function portraitProblems(SE, portrait, where) {
  if (!portrait || !Array.isArray(portrait.art) || portrait.art.length === 0) return [`${where}: empty portrait`];
  const out = [];
  if (portrait.art.length < MIN_SHAPES) out.push(`${where}: only ${portrait.art.length} shapes, a portrait needs at least ${MIN_SHAPES}`);
  portrait.art.forEach((s, k) => {
    const at = `${where} shape ${k}`;
    const key = 'f' in s ? s.f : s.s;
    if (!(key in SE.PORTRAIT_PALETTE)) out.push(`${at}: colour "${key}" is not in PORTRAIT_PALETTE`);
    if ('s' in s && !(s.w >= MIN_STROKE)) out.push(`${at}: stroke thinner than ${MIN_STROKE}`);
    if (s.o !== undefined && !(s.o > 0 && s.o <= 1)) out.push(`${at}: opacity out of range`);
    if (typeof s.d !== 'string') out.push(`${at}: no path data`);
    else for (const p of pathProblems(s.d)) out.push(`${at}: ${p}`);
  });
  return out;
}

module.exports = { pathProblems, portraitProblems, MIN_SHAPES };
