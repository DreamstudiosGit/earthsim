/* =============================================================================
 * SimEarth 2.0 — the tribe pennant, shared by every era
 * -----------------------------------------------------------------------------
 * A 3 × 4 px flag on a pole, one variant per tribe colour (catalog
 * TRIBE_COLORS). The fly end is one ramp step darker where the colour's ramp
 * has one, so the flag reads lit from the upper left.
 * ========================================================================== */
'use strict';

const k = require('../terrain/kit');
const { TRIBE_COLORS } = require('./catalog');

const PENNANT = [
  'pFFf',
  'pFFf',
  'pFFf',
  'pF.f',
  'p...',
  'p...',
  'p...',
  'P...',
];

function banner(index) {
  const main = k.c(TRIBE_COLORS[index].pixel);
  const t = k.grid(PENNANT.map((r) => r.replace(/[Ff]/g, '.')), { p: 'bark1', P: 'bark0' });
  PENNANT.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 'F') t.set(x, y, main);
      else if (row[x] === 'f') t.set(x, y, k.shift(main, -1));
    }
  });
  return t;
}

module.exports = { banner };
