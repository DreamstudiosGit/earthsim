/* =============================================================================
 * SimEarth 2.0 — Stone Age city blocks
 * -----------------------------------------------------------------------------
 * Round huts of straw and of hides in three sizes, a longhouse, a megalith
 * (trilithon or great menhir), a fire pit, a standing stone and pieces of a
 * palisade. 3/4 view, light from the upper left: the upper-left rim one step
 * lighter than the outline, the lower-right rim the darkest tone of the
 * block's own ramp.
 * Style: docs/landschaft-2026-10/stil.md · contract: tools/civ/catalog.js.
 * ========================================================================== */
'use strict';

const k = require('../terrain/kit');
const { yard } = require('./yard');

/**
 * Thatch on straw, wattle-and-daub walls on soil, doorways and poles. The
 * walls take the darker soil steps: a dark base under a light roof still
 * reads on straw-coloured steppe and savanna.
 */
const STRAW = {
  O: 'straw0', D: 'straw1', M: 'straw2', L: 'straw3',
  u: 'soil0', v: 'soil1', w: 'soil2', d: 'soil0', B: 'bark0', b: 'bark1',
};
/** Hides stretched over a frame. */
const HIDE = {
  A: 'sand0', S: 'sand1', T: 'sand2', H: 'sand3', h: 'sand4', d: 'soil0', B: 'bark0', b: 'bark1',
};
const STONE = { Q: 'rock0', q: 'rock1', r: 'rock2', R: 'rock3', W: 'rock4' };
const FIRE = { ...STONE, y: 'yellow0', o: 'orange0', e: 'red1', E: 'red0', B: 'bark0', b: 'bark1' };
const WOOD = { B: 'bark0', b: 'bark1', c: 'bark2', t: 'soil3', u: 'soil1' };

const HUT_STRAW = {
  s: [
    '..D..',
    '.DLM.',
    'DLMDO',
    'ODDDO',
    '.wdv.',
    '.wdv.',
  ],
  m: [
    '...B...',
    '...D...',
    '..DLM..',
    '.DLLMO.',
    'DLMMMDO',
    'ODDDDDO',
    '.wvdvu.',
    '.wvdvu.',
  ],
  l: [
    '....B....',
    '....D....',
    '...DLM...',
    '..DLLMO..',
    '.DLDDDDO.',
    '.DLLMMMO.',
    'DLLMMMMDO',
    'ODDDDDDDO',
    '.wvvddvu.',
    '.wvvddvu.',
  ],
};

const HUT_HIDE = {
  s: [
    '.SSA.',
    'ShHTA',
    'SHTSA',
    'SHdSA',
    'ATdAA',
  ],
  m: [
    '..SSS..',
    '.ShHTA.',
    'ShHTTSA',
    'SHTSTSA',
    'SHTddSA',
    'ATTddSA',
  ],
  l: [
    '...bSb...',
    '..SShTA..',
    '.ShhHTTA.',
    'SHhHSTTSA',
    'SHHTSTTSA',
    'SHTTSddSA',
    'SHTTSddSA',
    'AATTSddAA',
  ],
};

const LONGHOUSE = [
  [
    '..DLLLLLM..',
    '.DLLMMMMMO.',
    'DLDDDDDDDDO',
    'DLMMMMMMMDO',
    'OODDDDDDDOO',
    '.wbuuuuubu.',
    '.wbwwddwbv.',
    '.wbwwddwbv.',
  ],
  [
    '...DLLLLLLM..',
    '..DLLMMMMMMO.',
    '.DLDDDDDDDDDO',
    'DLLMMMMMMMMDO',
    'DLMMMMMMMMMDO',
    'OODDDDDDDDDOO',
    '.wbuuuuuubvu.',
    '.wbwwddwwbvu.',
    '.wbwwddwwbvu.',
  ],
];

const MEGALITH = [
  [
    'qWWWWRQ',
    'qRRRRrQ',
    'qWQ.qRQ',
    'qWQ.qRQ',
    'qWQ.qRQ',
    'qRQ.qrQ',
    'qRQ.qrQ',
    'QQQ.QQQ',
  ],
  [
    '.qq.',
    'qWRQ',
    'qWrQ',
    'qRqQ',
    'qWrQ',
    'qRrQ',
    'qRqQ',
    'qRrQ',
    'qRrQ',
    'QQQQ',
  ],
];

const FIREPIT = [
  [
    '..y..',
    '.yoy.',
    '.oeo.',
    'qReEq',
    '.qQQ.',
  ],
  [
    '..b..',
    '.byb.',
    '.bob.',
    'boeob',
    'qREEQ',
    '.qQQ.',
  ],
];

const MENHIR = [
  [
    '.q.',
    'qWQ',
    'qRQ',
    'qRQ',
    'qrQ',
    'QQQ',
  ],
  [
    '.q...',
    'qWQ..',
    'qRQ.q',
    'qRQqW',
    'qRrQR',
    'QQQQQ',
  ],
];

/** A straight piece, a piece running into the picture (its stake tips step down), a long piece. */
const PALISADE = [
  [
    't.t.',
    'cbcb',
    'uuuu',
    'cbcb',
    'cBcB',
  ],
  [
    't.',
    'cb',
    'tb',
    'cu',
    'tb',
    'cb',
    'cB',
  ],
  [
    't.t.t.t.',
    'cbcbcbcb',
    'uuuuuuuu',
    'cbcbcbcb',
    'cBcBcBcB',
  ],
];

/** Recipes by block id; `v` is { size } for dwellings, { index } otherwise. */
const blocks = {
  hut_straw: (v) => k.grid(HUT_STRAW[v.size], STRAW),
  hut_hide: (v) => k.grid(HUT_HIDE[v.size], HIDE),
  longhouse: (v) => k.grid(LONGHOUSE[v.index], STRAW),
  megalith: (v) => k.grid(MEGALITH[v.index], STONE),
  firepit: (v) => k.grid(FIREPIT[v.index], FIRE),
  menhir: (v) => k.grid(MENHIR[v.index], STONE),
  palisade: (v) => k.grid(PALISADE[v.index], WOOD),
  yard_stone: (v) => yard(v.index, 'earth', ['soil2', 'soil3', 'sand1'], 11),
};

module.exports = { blocks };
