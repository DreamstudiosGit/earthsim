/* =============================================================================
 * SimEarth 2.0 — species art format check
 * -----------------------------------------------------------------------------
 * The rules every icon in src/species/ and src/floraart/ keeps: palette
 * colours only, absolute path commands, end points inside the 32x32 box with
 * room for the outline. Shared by tests/species.test.js and the contact sheet
 * (tools/species-sheet.js), so artists see the same verdict the test gives.
 * ========================================================================== */
'use strict';

const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/** Problems with one path's data, or [] when it is fine. */
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
    // End points must stay inside the box with room for the outline; curve
    // handles may reach a little further.
    const ends = cmd === 'H' || cmd === 'V' ? [v[0]] : cmd === 'A' ? [v[5], v[6]] : v.slice(-2);
    const handles = cmd === 'C' || cmd === 'S' || cmd === 'Q' ? v.slice(0, -2) : [];
    if (ends.some((x) => x < 0.5 || x > 31.5)) out.push(`"${cmd}" ends outside 0.5..31.5`);
    if (handles.some((x) => x < -4 || x > 36)) out.push(`"${cmd}" handle far outside the box`);
  }
  return out;
}

/** Problems with one icon, each prefixed with `where`. */
function artProblems(SE, art, where) {
  if (!Array.isArray(art) || art.length === 0) return [`${where}: empty art`];
  const out = [];
  art.forEach((s, k) => {
    const at = `${where} shape ${k}`;
    const key = 'f' in s ? s.f : s.s;
    if (!(key in SE.ART_PALETTE)) out.push(`${at}: colour "${key}" is not in ART_PALETTE`);
    if ('s' in s && !(s.w > 0)) out.push(`${at}: stroke without width`);
    if (s.o !== undefined && !(s.o > 0 && s.o <= 1)) out.push(`${at}: opacity out of range`);
    if (typeof s.d !== 'string') out.push(`${at}: no path data`);
    else for (const p of pathProblems(s.d)) out.push(`${at}: ${p}`);
  });
  return out;
}

module.exports = { pathProblems, artProblems };
