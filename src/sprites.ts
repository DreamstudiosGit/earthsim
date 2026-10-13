/* =============================================================================
 * SimEarth 2.0 — pixel sprites
 * -----------------------------------------------------------------------------
 * Every tile graphic is an 8x8 character grid drawn straight in the source and
 * blown up 2x at render time. No external art, and the chunky result is
 * exactly what makes the Edit window read as SimEarth rather than as a modern
 * data map. The letters started as the EGA set; the colours behind them are
 * now one curated natural palette, so the map sits with the rest of the UI.
 *
 * A tile is drawn in layers: the biome's ground, then a river, then the flora
 * overlay, then the animal, then cities and events. Land grounds are opaque;
 * the two sea grounds are ripples over the depth colour (see terrainart.ts);
 * every layer above them is mostly transparent and has to read on any ground.
 *
 *   '.' is transparent; every other character is a palette entry below.
 * ========================================================================== */

namespace SE {
  /** Character -> colour. `null` means "leave the pixel alone". */
  export const SPRITE_PALETTE: Readonly<Record<string, Rgb | null>> = {
    '.': null,
    // The old EGA letters, re-tuned: the same hues, but none of the pure,
    // fully saturated primaries that made the map shout over the UI.
    k: [16, 24, 22],    // outline ink
    b: [38, 104, 168],  // river margin
    g: [64, 136, 60],   // leaf green
    c: [44, 150, 150],  // teal
    r: [172, 64, 50],   // rust red
    m: [120, 222, 202], // mint — the first cells, in the UI's origin teal
    n: [164, 104, 54],  // brown
    w: [160, 155, 142], // stone
    d: [132, 127, 116], // dark stone
    B: [110, 184, 230], // river water
    G: [142, 204, 98],  // light leaf
    C: [146, 218, 228], // glacier cyan
    R: [236, 112, 92],  // coral
    M: [236, 152, 214], // pink
    y: [242, 204, 92],  // warm yellow
    W: [242, 246, 240], // snow white
    t: [36, 98, 78],    // taiga
    o: [104, 132, 62],  // olive / wetland
    j: [52, 150, 74],   // jungle green
    e: [30, 84, 42],    // deep forest
    a: [20, 58, 108],   // abyssal blue
    s: [44, 124, 176],  // shelf blue
    // Added with the flora layer. Biomes became bare ground and the plants
    // that used to be painted into them became overlays; both needed shades
    // the EGA set does not have, mostly greens it has only two of.
    u: [126, 134, 106], // tundra — grey-green ground
    h: [124, 104, 76],  // heath — brownish tundra soil
    U: [196, 198, 166], // lichen — pale crust on tundra stone
    T: [26, 70, 56],    // taiga shade — the dark floor under spruce
    i: [118, 82, 48],   // needle litter — rust-brown
    f: [40, 100, 50],   // forest floor
    F: [124, 104, 54],  // leaf litter
    q: [64, 86, 38],    // mire — dark olive mud
    Q: [56, 104, 116],  // pool — murky standing water
    x: [100, 66, 38],   // bark — trunks and stems
    l: [176, 206, 70],  // moss — yellow-green cushions
    v: [218, 206, 120], // straw — sun-bleached grass blades
    z: [28, 110, 80],   // spruce — conifer needles
    L: [86, 176, 150],  // clubmoss — the sea-green of the lycopods
    p: [246, 170, 200], // blossom — pink petals
    P: [210, 48, 76],   // sundew — glandular red
    Y: [250, 188, 48],  // gold — pollen, bees, sporangia
    O: [236, 128, 44],  // orange — butterfly wings
    H: [204, 156, 100], // hide — the tan coat of the grazers
    // Grounds of their own, so desert and open land no longer share their
    // colours with the insects, reptiles and leaves drawn on top of them.
    S: [224, 198, 142], // sand
    N: [200, 168, 110], // sand ripple
    A: [124, 168, 84],  // meadow
    V: [104, 148, 70],  // meadow shade
    // Digits are reserved for the event-dialog illustrations, which need a dark
    // ground no tile sprite wants. No 8x8 sprite uses a digit.
    '1': [8, 12, 40],   // primordial deep — the dialog backdrop
    '2': [20, 30, 70],  // a shaft of light through the water
    '3': [14, 20, 55],  // the same, fainter
  };

  export type SpriteRows = readonly string[];

  /* ------------------------------------------------------- biome grounds -- */
  /* 8x8 ground textures, indexed by biome. Ground only: the plants growing   */
  /* on it are the flora layer below, so these stay quiet enough for a tree   */
  /* or an animal to read on top while still telling biomes apart. Land       */
  /* grounds are opaque; the two sea grounds are light ripples drawn faintly  */
  /* over the depth colour.                                                   */

  export const BIOME_SPRITES: readonly SpriteRows[] = [
    // 0 Coast — sunlit shallows, busy with small glints
    [
      '........',
      '.WW.....',
      '......W.',
      '........',
      '...WW...',
      'W.......',
      '.....WW.',
      '........',
    ],
    // 1 Ocean — long, sparse crests of a slow swell
    [
      '........',
      '..WWW...',
      '........',
      '........',
      '......WW',
      'W.......',
      '........',
      '........',
    ],
    // 2 Rock — grey scree
    [
      'wwwwdwww',
      'wdwwwwww',
      'wwwwwwdw',
      'wwdwwwww',
      'dwwwwwwd',
      'wwwwdwww',
      'wwdwwwww',
      'wwwwwwdw',
    ],
    // 3 Arctic — packed ice with blue fractures
    [
      'WWWWWWWW',
      'WWCWWWWW',
      'WWWWWCWW',
      'CWWWWWWW',
      'WWWWWWWC',
      'WWWCWWWW',
      'WWWWWWWW',
      'WCWWWCWW',
    ],
    // 4 Boreal — dark taiga floor under a litter of rust-brown needles
    [
      'TTTiTTTT',
      'TtTTTTiT',
      'TTTTtTTT',
      'TiTTTTTT',
      'TTTTTiTt',
      'TTtTTTTT',
      'iTTTTTiT',
      'TTTtTTTT',
    ],
    // 5 Desert — sand with dune ripples
    [
      'SSSSSSSS',
      'SSNNSSSS',
      'SSSSSSSS',
      'SSSSSNNS',
      'SSSSSSSS',
      'NNSSSSSS',
      'SSSSSSSS',
      'SSSSNNSS',
    ],
    // 6 Grass — open country, a low bright sward
    [
      'AAAAAAAA',
      'AVAAAAAA',
      'AAAAAVAA',
      'AAAAAAAA',
      'AAAVAAAA',
      'AAAAAAAV',
      'VAAAAAAA',
      'AAAAVAAA',
    ],
    // 7 Forest — shaded floor flecked with fallen leaves
    [
      'fffffFff',
      'fgffffff',
      'ffffgfff',
      'fFffffFf',
      'ffffffff',
      'ffgfFfff',
      'Ffffffgf',
      'ffffffff',
    ],
    // 8 Jungle — saturated, dripping green
    [
      'jjjjjjjj',
      'jgjjjGjj',
      'jjjjjjje',
      'jjGjjjjj',
      'ejjjjgjj',
      'jjjjjjjj',
      'jjjejjGj',
      'jGjjjjjj',
    ],
    // 9 Swamp — olive mire with standing pools
    [
      'oooooqoo',
      'oQQQoooo',
      'QQBQQoqo',
      'oQQQoooo',
      'ooooooQo',
      'oqooQQQQ',
      'oooooQQo',
      'ooqooooo',
    ],
    // 10 Tundra — grey-green and brown, spotted with lichen and moss
    [
      'uuuuhuuu',
      'uUuuuuuu',
      'uuuuuuUu',
      'huuuuuuu',
      'uuuoUuhu',
      'uuuuuuuu',
      'Uuuhuuuu',
      'uuuuuoUu',
    ],
  ];

  /**
   * Perpetual snow, drawn instead of Rock above SNOW_LINE.
   *
   * Bare highland and a summit are the same grey scree otherwise, so nothing on
   * the map distinguishes a plateau from a mountain — the single biggest reason
   * the old planets read as having no mountains at all despite a fifth of their
   * land standing above the tree line.
   */
  export const SNOW_SPRITE: SpriteRows = [
    'WWWdWWWW',
    'WWWWWWdW',
    'WdWWWWWW',
    'WWWWWdWW',
    'dWWWWWWW',
    'WWWdWWWd',
    'WWWWWWWW',
    'WdWWWdWW',
  ];

  /* --------------------------------------------------------------- rivers -- */

  /**
   * Build the tile graphic for a river from the directions it connects to,
   * as a bitmask W=1 E=2 N=4 S=8.
   *
   * Generated rather than drawn by hand because there are sixteen of them and
   * two widths, and because the whole point is that they line up: each arm runs
   * from the tile centre to the middle of an edge, so a neighbour's arm meets it
   * exactly and a river reads as one unbroken line across the map. Hand-drawn
   * tiles drift apart by a pixel and the water looks like a string of puddles.
   *
   * Kept deliberately thin. An earlier version gave the channel a full bank of
   * dark water on either side, which put half a tile under water for an
   * ordinary stream and three quarters for a trunk river — on screen the map
   * read as blue slabs laid over the ground rather than as rivers crossing it.
   */
  function buildRiverSprite(mask: number, wide: boolean): SpriteRows {
    /** Paint one arm of a channel `lo..hi` tiles across into `cells`. */
    const arms = (lo: number, hi: number): boolean[] => {
      const cells: boolean[] = new Array(64).fill(false);
      const span = (x0: number, x1: number, y0: number, y1: number): void => {
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) cells[y * 8 + x] = true;
        }
      };
      // The centre is always wet, so a headwater with no connections at all
      // still shows a spring rather than an empty tile.
      span(lo, hi, lo, hi);
      if (mask & 1) span(0, hi, lo, hi);   // west
      if (mask & 2) span(lo, 7, lo, hi);   // east
      if (mask & 4) span(lo, hi, 0, hi);   // north
      if (mask & 8) span(lo, hi, lo, 7);   // south
      return cells;
    };

    // Both sizes share the same two-pixel centre line and differ only in the
    // darker margin outside it. That is what keeps the network continuous: a
    // trunk river meeting a tributary still lines up exactly, where channels of
    // different widths would step at every tile boundary.
    const core = arms(3, 4);
    const margin = wide ? arms(2, 5) : null;

    const rows: string[] = [];
    for (let y = 0; y < 8; y++) {
      let row = '';
      for (let x = 0; x < 8; x++) {
        const at = y * 8 + x;
        if (core[at]) row += 'B';
        else if (margin && margin[at]) row += 'b';
        else row += '.';
      }
      rows.push(row);
    }
    return rows;
  }

  /**
   * All thirty-two river tiles, indexed `[wide ? 1 : 0][mask]`. Built once at
   * load; the render loop runs sixty times a second and must not be allocating
   * sprite rows per tile per frame.
   */
  export const RIVER_SPRITES: readonly (readonly SpriteRows[])[] = [
    Array.from({ length: 16 }, (_, mask) => buildRiverSprite(mask, false)),
    Array.from({ length: 16 }, (_, mask) => buildRiverSprite(mask, true)),
  ];

  const EMPTY_SPRITE: SpriteRows = [
    '........', '........', '........', '........',
    '........', '........', '........', '........',
  ];

  /* ---------------------------------------------------------------- flora -- */
  /* Transparent overlays drawn over the ground, indexed by [plant group]     */
  /* [loose, dense]: the loose variant for a thin cover, the dense one where  */
  /* the group dominates. Index 0 is "no plants". Each group has its own      */
  /* silhouette and its own green, so the march from algae to flowers reads   */
  /* on the map. Sprites keep a pixel or two clear at the edges, or are drawn */
  /* to tile, so neighbouring tiles join up without a visible grid.           */

  export const FLORA_SPRITES: readonly (readonly SpriteRows[])[] = [
    // 0 None
    [EMPTY_SPRITE, EMPTY_SPRITE],

    // 1 Sea Algae — kelp: brown stipes rising from the shelf floor, olive
    //   blades streaming off them on alternate sides
    [
      [
        '..o.....',
        '..no....',
        '.on..o..',
        '..no.no.',
        '.on.on..',
        '..no.no.',
        '..n.on..',
        '..n..n..',
      ],
      [
        '.o...o..',
        '.no..no.',
        'on..on.o',
        '.no..non',
        'on..on..',
        '.no..no.',
        '.n..on..',
        '.n...n..',
      ],
    ],

    // 2 Freshwater Algae — green flecks clustered on the channel (rows and
    //   columns 3-4), sparse enough that the water still shows through
    [
      [
        '........',
        '....G...',
        '........',
        '.G.j..G.',
        '...G.j..',
        '........',
        '...j....',
        '........',
      ],
      [
        '....j...',
        '...G....',
        '.j..jG..',
        'G.GjG.jG',
        '.jG.GjG.',
        '..G.G..j',
        '....j...',
        '...G....',
      ],
    ],

    // 3 First Land Plants — flat, lobed thalli hugging the ground
    [
      [
        '........',
        '........',
        '........',
        '........',
        '....jG..',
        '.jG.jjj.',
        'jjjjjj..',
        '.jj.jj..',
      ],
      [
        '........',
        '.jG...jG',
        'jjjj.jjj',
        '.jj...j.',
        '...jG...',
        '.jGjjjG.',
        'jjjj.jjj',
        '.jj...j.',
      ],
    ],

    // 4 Mosses — yellow-green cushions
    [
      [
        '........',
        '........',
        '........',
        '....lll.',
        '...lllll',
        '.ll.ooo.',
        'lllo....',
        'ooo.....',
      ],
      [
        '.ll.....',
        'llll.ll.',
        'oooollll',
        '....oooo',
        '..lll...',
        '.lllll.l',
        '.ooooo.l',
        '.......o',
      ],
    ],

    // 5 Early Vascular Plants — bare forking stems tipped with sporangia
    [
      [
        '........',
        '.Y.Y....',
        '.e.e....',
        '..e.Y.Y.',
        '..e.e.e.',
        '..e..e..',
        '..e..e..',
        '..e..e..',
      ],
      [
        '.Y.Y..Y.',
        '.e.e.Ye.',
        '..e.Y.e.',
        'Y.e.e.e.',
        '.ee..e..',
        '..e..e.Y',
        '..e..e.e',
        '..e..e.e',
      ],
    ],

    // 6 Lycopods — clubmoss tufts; dense, a scale tree on its patterned trunk
    [
      [
        '........',
        '........',
        '..v.....',
        '..v...v.',
        '.LLL..v.',
        '..L..LLL',
        '.LLL..L.',
        '..L..LLL',
      ],
      [
        '.LL..LL.',
        'LLx..xLL',
        '..x..x..',
        '...xx...',
        '...xL...',
        '...Lx...',
        '...xL...',
        '..xxxx..',
      ],
    ],

    // 7 Ferns & Horsetails — arching fronds; dense, a tree fern
    [
      [
        '........',
        '..G..G..',
        '.GgGGgG.',
        'Gg.gg.gG',
        'G.GggG.G',
        '..Gggg..',
        '...gg...',
        '...g....',
      ],
      [
        '..G.GG..',
        '.GGgGgG.',
        'GG.gx.GG',
        'G..x...G',
        '...x....',
        '...x....',
        '...x....',
        '..xxx...',
      ],
    ],

    // 8 Archaeopteris — the first true tree: flat shelves of fern-like
    //   boughs, drooping at the tips, with the trunk showing between them
    [
      [
        '...j....',
        '..jjj...',
        '.e.x.e..',
        '.jjjjj..',
        'e..x..e.',
        'jjjjjjj.',
        'e..x..e.',
        '...x....',
      ],
      [
        '...jj...',
        '.jjjjjj.',
        'e..xx..e',
        '.jjjjjj.',
        'e..xx..e',
        '.jjjjjj.',
        '.e.xx.e.',
        '...xx...',
      ],
    ],

    // 9 Seed Plants — low seed-fern shrubs hung with seeds
    [
      [
        '........',
        '........',
        '........',
        '..ooo...',
        '.oqoqo..',
        'oonqnoo.',
        'o..x..o.',
        '...x....',
      ],
      [
        '..ooo...',
        '.oqoqo..',
        'oonqnoo.',
        'o..x.ooo',
        '...xoqoq',
        '...oonqn',
        '...o..x.',
        '......x.',
      ],
    ],

    // 10 Conifers — tiered spruce, lit on the left
    [
      [
        '...z....',
        '..gzz...',
        '.ggzzz..',
        '..gzz...',
        '.ggzzz..',
        'gggzzzz.',
        '...x....',
        '...x....',
      ],
      [
        '..z.....',
        '.gzz.z..',
        'ggzzgzz.',
        '.gzzgzz.',
        'ggzggzzz',
        'ggzzgzz.',
        '..xggzzz',
        '.....x..',
      ],
    ],

    // 11 Flowering Plants — low shrubs dotted with bright blooms
    [
      [
        '........',
        '........',
        '........',
        '....p...',
        '.y.gpg..',
        '.gyggpg.',
        '.ggegg..',
        '..e.e...',
      ],
      [
        '........',
        '.p..y.R.',
        'pgp.ygRg',
        'gggggggg',
        '.geg.ge.',
        '..W..p..',
        '.WgW.pgp',
        '.ggegge.',
      ],
    ],

    // 12 Broadleaf Trees — round crowns; dense, a grove in blossom
    [
      [
        '........',
        '..ggg...',
        '.gGggg..',
        '.gggge..',
        '..gee...',
        '...x....',
        '...x....',
        '........',
      ],
      [
        '.ggg.gg.',
        'gGgggGgg',
        'ggWgegWg',
        'gggegggg',
        '.gee.ge.',
        '..x..x..',
        '..x..x..',
        '........',
      ],
    ],

    // 13 Grasses — tufts of straw-tipped blades; dense, a meadow that tiles
    [
      [
        '........',
        '........',
        '.v...v..',
        '.vv.v...',
        '..vlv.v.',
        '..lll.v.',
        '...o.lv.',
        '.....o..',
      ],
      [
        'v...v...',
        'vv.v..v.',
        '.vlv.v.v',
        '.lll.vlv',
        'v.o..lll',
        'vv.v..o.',
        '.vlv.v..',
        '.lol.lv.',
      ],
    ],

    // 14 Carnivorous Plants — red sundew rosettes beaded with dew
    [
      [
        '........',
        '........',
        '........',
        '..W.W...',
        '.WP.PW..',
        '..PPP...',
        '.PP.PP..',
        '...P....',
      ],
      [
        '.W.W....',
        'WP.PW...',
        '.PPP..W.',
        'PP.PP.PW',
        '..P..PP.',
        '.W..PP.P',
        'WP.P..P.',
        '.PPP....',
      ],
    ],
  ];

  /* --------------------------------------------------------- life classes -- */
  /* Transparent overlays, indexed by [life class][sub-species stage]. Index  */
  /* 0 is unused. Each class runs small-and-primitive -> familiar -> large-   */
  /* and-elaborate, so a lineage advancing up its ladder reads at a glance.   */
  /* The art below is drawn bare; LIFE_SPRITES is the same art outlined.      */

  /**
   * Ring a creature in black so it stays legible over any ground and under
   * any plant cover — a tan grazer on desert sand or a brown dinosaur in front
   * of a broadleaf grove disappears without it.
   *
   * Generated rather than drawn so every class gets exactly the same edge and
   * the hand-drawn art stays readable in the source. Isolated single pixels,
   * the specks that stand for bacteria, are left bare: outlined, each would
   * become a black cross. Pixels already drawn in black are not outlined.
   */
  function outlined(rows: SpriteRows): SpriteRows {
    const solid = (x: number, y: number): boolean =>
      x >= 0 && y >= 0 && x < 8 && y < 8 && rows[y][x] !== '.' && rows[y][x] !== 'k';
    const edge = (x: number, y: number): boolean => {
      if (!solid(x, y)) return false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if ((dx !== 0 || dy !== 0) && solid(x + dx, y + dy)) return true;
        }
      }
      return false;
    };
    return rows.map((row, y) => {
      let out = '';
      for (let x = 0; x < 8; x++) {
        const ring = edge(x - 1, y) || edge(x + 1, y) || edge(x, y - 1) || edge(x, y + 1);
        out += row[x] === '.' && ring ? 'k' : row[x];
      }
      return out;
    });
  }

  const LIFE_ART: readonly (readonly SpriteRows[])[] = [
    // 0 None
    [EMPTY_SPRITE, EMPTY_SPRITE, EMPTY_SPRITE],

    // 1 First Cells
    [
      // Archaebacterium — a few isolated specks
      [
        '........',
        '........',
        '...m....',
        '........',
        '.m......',
        '........',
        '......m.',
        '........',
      ],
      // Cyanobacterium — scattered specks
      [
        '........',
        '..m.....',
        '.....m..',
        '........',
        '.m...m..',
        '........',
        '....m...',
        '........',
      ],
      // Stromatolite — layered microbial mounds
      [
        '........',
        '...mm...',
        '..mmmm..',
        '.mmmmmm.',
        '........',
        '.mm..mm.',
        'mmmmmmmm',
        '........',
      ],
    ],

    // 2 Complex Cells
    [
      // Amoeba — a shapeless cell feeling out with pseudopods
      [
        '........',
        '.M...M..',
        '.MM.MM..',
        '..MMMM..',
        '.MMmMMM.',
        'MMMMMM..',
        '..MM.M..',
        '........',
      ],
      // Flagellate — a teardrop cell trailing its whip
      [
        '.....M..',
        '....M...',
        '.....M..',
        '....M...',
        '..MMM...',
        '.MMmMM..',
        '..MMM...',
        '...M....',
      ],
      // Ciliate — a slipper-shaped cell fringed with cilia
      [
        '........',
        '..M.M.M.',
        '.MMMMMM.',
        'MMmmMMMM',
        'MMMmMMMM',
        '.MMMMMM.',
        '.M.M.M..',
        '........',
      ],
    ],

    // 3 Sponges & Cnidarians
    [
      // Sponge — a perforated vase
      [
        '........',
        '..M.M...',
        '..MMM...',
        '.MM.MM..',
        '.M.M.M..',
        '.MMMMM..',
        '..MMM...',
        '........',
      ],
      // Jellyfish — bell and tentacles
      [
        '........',
        '...M....',
        '..MMM...',
        '.M.M.M..',
        '...M....',
        '..M.M...',
        '........',
        '........',
      ],
      // Coral Polyp — a branching colony
      [
        '.M...M..',
        '.M.M.M..',
        '.MMMMM..',
        '...M....',
        '..MMM...',
        '.M.M.M..',
        '.MMMMM..',
        '........',
      ],
    ],

    // 4 Marine Arthropods
    [
      // Trilobite — a segmented oval
      [
        '........',
        '........',
        '..RRRR..',
        '.RRRRRR.',
        '.R.RR.R.',
        '.RRRRRR.',
        '..RRRR..',
        '........',
      ],
      // Sea Scorpion — pincers and a long tail
      [
        '........',
        '.R....R.',
        '.RR..RR.',
        '..RRRR..',
        '..RRRR..',
        '...RR...',
        '...RR...',
        '...R....',
      ],
      // Crustacean — crab
      [
        '........',
        '.R....R.',
        '..RRRR..',
        '.RRRRRR.',
        '.R.RR.R.',
        '..R..R..',
        '........',
        '........',
      ],
    ],

    // 5 Molluscs
    [
      // Sea Snail — shell and foot
      [
        '........',
        '........',
        '..MMM...',
        '.M...M..',
        '.M..MM..',
        '..MMM...',
        '.MMMMM..',
        '........',
      ],
      // Ammonite — spiral shell
      [
        '........',
        '..MMM...',
        '.M...M..',
        '.M.MM...',
        '.M.M....',
        '..MMM...',
        '........',
        '........',
      ],
      // Cephalopod — mantle and tentacles
      [
        '........',
        '..MMM...',
        '.MMMMM..',
        '.M.M.M..',
        '.MMMMM..',
        '..MMM...',
        '.M.M.M..',
        'M.M.M.M.',
      ],
    ],

    // 6 Fish
    [
      // Jawless Fish — a bare eel-like body
      [
        '........',
        '........',
        '...CCC..',
        '.CCCCCCC',
        '...CCC.C',
        '........',
        '........',
        '........',
      ],
      // Placoderm — armoured head
      [
        '........',
        '........',
        '..CCC.C.',
        '.CCCCCC.',
        '..CCC.C.',
        '........',
        '........',
        '........',
      ],
      // Bony Fish — full fin set
      [
        '........',
        '...C....',
        '..CCC.C.',
        '.CCCCCCC',
        '.CCCCC.C',
        '..CCC...',
        '...C....',
        '........',
      ],
    ],

    // 7 Whales
    [
      // Archaeocete — long and slender
      [
        '........',
        '........',
        '..wwww..',
        '.wwwwwww',
        '..wwww.w',
        '...w....',
        '........',
        '........',
      ],
      // Dolphin
      [
        '........',
        '........',
        '.wwwww..',
        'wwwwwww.',
        '.wwwww.w',
        '...w...w',
        '........',
        '........',
      ],
      // Great Whale — bulk and flukes
      [
        '........',
        '..wwww..',
        '.wwwwww.',
        'wwwwwwww',
        'wwwwwww.',
        '.wwwww.w',
        '..ww...w',
        '........',
      ],
    ],

    // 8 Land Arthropods
    [
      // Millipede — a long segmented body on rows of legs
      [
        '........',
        '........',
        '.......r',
        '.rRrRrRR',
        '.rrrrrrr',
        '.r.r.r.r',
        '........',
        '........',
      ],
      // Scorpion — pincers forward, sting curled over the back
      [
        '...rrr..',
        '..r...r.',
        '..R...r.',
        '......r.',
        'rr.rrrr.',
        'r.rrrrr.',
        '..r.r.r.',
        '........',
      ],
      // Spider — a red-marked body on eight black legs
      [
        '.k....k.',
        '..k..k..',
        'k..rr..k',
        '.kkrrkk.',
        'k.rRRr.k',
        '..rrrr..',
        '.k.rr.k.',
        'k......k',
      ],
    ],

    // 9 Insects
    [
      // Springtail — tiny and wingless
      [
        '........',
        '........',
        '........',
        '...yy...',
        '..yyyy..',
        '..y..y..',
        '........',
        '........',
      ],
      // Dragonfly — four wings
      [
        '........',
        '.yy..yy.',
        '.yyyyyy.',
        '...yy...',
        '...yy...',
        '.yyyyyy.',
        '.yy..yy.',
        '........',
      ],
      // Beetle — antennae, pronotum and split wing cases
      [
        '.y...y..',
        '..yyy...',
        'y.yyy.y.',
        '.yyyyy..',
        'yyynyyy.',
        '.yynyy..',
        'y.yny.y.',
        '...y....',
      ],
    ],

    // 10 Amphibians
    [
      // Ichthyostege — a fish that has grown limbs
      [
        '........',
        '........',
        '..CCCC..',
        '.CCCCCCC',
        '.CCCCCC.',
        '.C.CC.C.',
        '........',
        '........',
      ],
      // Salamander — long body, sprawling legs
      [
        '........',
        '........',
        '.CC.....',
        'CCCCCCC.',
        '.C.CC.CC',
        '.C....C.',
        '........',
        '........',
      ],
      // Frog — squat and long-legged
      [
        '........',
        '..C..C..',
        '.CCCCCC.',
        'CCCCCCCC',
        '.CCCCCC.',
        '.C....C.',
        '........',
        '........',
      ],
    ],

    // 11 Reptiles
    [
      // Anapsid — squat and shelled
      [
        '........',
        '........',
        '..yyyy..',
        '.yyyyyy.',
        '.yyyyyy.',
        '.y.yy.y.',
        '........',
        '........',
      ],
      // Lizard
      [
        '........',
        '........',
        '.yy.....',
        'yyyyyy..',
        '.y.y.yy.',
        '......y.',
        '........',
        '........',
      ],
      // Archosaur — raised on its legs
      [
        '........',
        '.....yyy',
        '....yyyy',
        '.yy.yyy.',
        'yyyyyy..',
        '.y.yy...',
        '.y..yy..',
        '........',
      ],
    ],

    // 12 Dinosaurs
    [
      // Coelophysid — a light biped
      [
        '........',
        '......nn',
        '.....nnn',
        '...nnn..',
        '..nnnn..',
        '...nn...',
        '..n.n...',
        '........',
      ],
      // Stegosaur — plated back
      [
        '.n.n.n..',
        'nnnnnnn.',
        '.nnnnnn.',
        'nnnnnnnn',
        '.nnnnnn.',
        '..n..n..',
        '..n..n..',
        '........',
      ],
      // Tyrannosaur — heavy head and tail
      [
        '........',
        '.....nnn',
        '....nnnn',
        'nn.nnn..',
        '.nnnnn..',
        '..nnn...',
        '..n.n...',
        '........',
      ],
    ],

    // 13 Birds
    [
      // Archaeopteryx — short wings, long tail
      [
        '........',
        '..W.....',
        '.WWW....',
        '..WWWW..',
        '...WWWWW',
        '....W...',
        '........',
        '........',
      ],
      // Seabird — in flight
      [
        '........',
        '..W...W.',
        '.WWW.WW.',
        '..WWWWW.',
        '...WWW..',
        '....W...',
        '........',
        '........',
      ],
      // Songbird — compact and perched
      [
        '........',
        '...WW...',
        '..WWWW..',
        '.WWWWWW.',
        '..WWWW..',
        '...WW...',
        '..W..W..',
        '........',
      ],
    ],

    // 14 Mammals
    [
      // Shrew — a small quadruped
      [
        '........',
        '........',
        '........',
        '..nnnn..',
        '.nnnnnn.',
        '..n.n.n.',
        '........',
        '........',
      ],
      // Primate — quadruped
      [
        '........',
        '........',
        '.nnnnn..',
        'nnnnnnn.',
        '.n.n.n..',
        '.n.n.n..',
        '........',
        '........',
      ],
      // Hominid — upright
      [
        '........',
        '...nn...',
        '...nn...',
        '.nnnnnn.',
        '...nn...',
        '...nn...',
        '..n..n..',
        '..n..n..',
      ],
    ],

    // 15 Early Bilaterians — the first animals with a front and a back
    [
      // Flatworm — an arrow-headed ribbon with two eyespots
      [
        '..p..p..',
        '..pppp..',
        '..kppk..',
        '..pppp..',
        '...pp...',
        '...pp...',
        '...pp...',
        '........',
      ],
      // Ringed Worm — a segmented body with bristled sides
      [
        '....RR..',
        '...pRRp.',
        '...pp...',
        '..pRRp..',
        '..pp....',
        '.pRRp...',
        '..pp....',
        '..R.....',
      ],
      // Tube Worm — white tubes crowned with red plumes
      [
        '..R.....',
        '.RRR.R..',
        'RRRRRRR.',
        '.WW.RRR.',
        '.WW..WW.',
        '.WW..WW.',
        '.WW..WW.',
        'WWWW.WW.',
      ],
    ],

    // 16 Bees & Pollinators
    [
      // Wild Bee — a small striped body under clear wings
      [
        '........',
        '........',
        '....CC..',
        '...CC...',
        '.kYkYk..',
        '.kYkYk..',
        '..k.k...',
        '........',
      ],
      // Butterfly — bright forewings over pink hindwings
      [
        '..k.k...',
        'OO.k.OO.',
        'OyOkOyO.',
        'OOOkOOO.',
        '.pOkOp..',
        '.pp.pp..',
        '........',
        '........',
      ],
      // Honey Bee — gold and black, wings raised
      [
        '..CC.CC.',
        '..CCCC..',
        '.k.CC...',
        'kkYkYkY.',
        'kkYkYkYk',
        '.k.YkY..',
        '..k.k...',
        '........',
      ],
    ],

    // 17 Hoofed Grazers
    [
      // Eohippus — a small forest horse
      [
        '........',
        '........',
        '........',
        '.....HH.',
        '.HHHHH..',
        'HHHHHH..',
        '.H..H...',
        '.H..H...',
      ],
      // Antelope — long legs and swept-back horns
      [
        '.....k.k',
        '......k.',
        '.....HH.',
        '....HHH.',
        'HHHHHH..',
        '.HWHHH..',
        '.H...H..',
        '.H...H..',
      ],
      // Bison — a shaggy hump and a lowered head
      [
        '........',
        '..nnn...',
        '.nnnnxx.',
        'nnnnxxxx',
        'nnnxxxxx',
        'knnxxxx.',
        '.x..x.x.',
        '.x..x.x.',
      ],
    ],
  ];

  export const LIFE_SPRITES: readonly (readonly SpriteRows[])[] =
    LIFE_ART.map((stages) => stages.map(outlined));

  /* --------------------------------------------------------------- cities -- */
  /* Indexed by Tech (0 unused).                                              */

  export const CITY_SPRITES: readonly SpriteRows[] = [
    // None
    ['........', '........', '........', '........', '........', '........', '........', '........'],
    // Stone Age — huts
    [
      '........',
      '........',
      '...n....',
      '..nnn...',
      '.nnnnn..',
      '.n.n.n..',
      '........',
      '........',
    ],
    // Bronze Age — walled village
    [
      '........',
      '..n.n.n.',
      '..nnnnn.',
      '.nnnnnn.',
      '.n.nn.n.',
      '.nnnnnn.',
      '........',
      '........',
    ],
    // Iron Age — stone town
    [
      '........',
      '..w.w.w.',
      '..wwwww.',
      '.wwwwww.',
      '.w.ww.w.',
      '.wwwwww.',
      '........',
      '........',
    ],
    // Industrial Age — factory and smokestack
    [
      '..d.....',
      '..d.....',
      '..d.ww..',
      '.wwwwww.',
      '.wwwwww.',
      '.w.ww.w.',
      '.wwwwww.',
      '........',
    ],
    // Atomic Age — reactor
    [
      '..y.....',
      '.wwww...',
      '.w..w.w.',
      '.wwww.w.',
      '.w.wwww.',
      '.wwwwww.',
      '.w.ww.w.',
      '.wwwwww.',
    ],
    // Information Age — towers
    [
      '.w....w.',
      '.w.ww.w.',
      '.w.ww.w.',
      '.wwwwww.',
      '.w.ww.w.',
      '.wwwwww.',
      '.w.ww.w.',
      '.wwwwww.',
    ],
    // Nanotech Age — luminous arcology
    [
      '.C....C.',
      '.C.CC.C.',
      '.CCCCCC.',
      '.C.CC.C.',
      '.CCCCCC.',
      '.C.CC.C.',
      '.CCCCCC.',
      '.CCCCCC.',
    ],
  ];

  /* --------------------------------------------------------------- events -- */
  /* Indexed by EventKind.                                                    */

  export const EVENT_SPRITES: readonly SpriteRows[] = [
    // Hurricane
    [
      '..CCC...',
      '.C...C..',
      'C..CC.C.',
      'C.CCC.C.',
      'C..C..C.',
      '.C...C..',
      '..CCC...',
      '........',
    ],
    // Tidal Wave
    [
      '........',
      '...CC...',
      '..CCCC..',
      '.CC..CC.',
      'CC....CC',
      '........',
      '........',
      '........',
    ],
    // Meteor
    [
      '.....RRy',
      '....RyR.',
      '...RRy..',
      '..RRy...',
      '.RRy....',
      'RRy.....',
      'Ry......',
      '........',
    ],
    // Volcano
    [
      '........',
      '...r....',
      '..rRr...',
      '..drd...',
      '.dddddd.',
      'dddddddd',
      '........',
      '........',
    ],
    // Atomic Bomb
    [
      '..RRR...',
      '.RRRRR..',
      '..RRR...',
      '...R....',
      '...R....',
      '..RRR...',
      '.RRRRR..',
      '........',
    ],
    // Fire
    [
      '........',
      '...R....',
      '..RyR...',
      '.RyyyR..',
      '.RyyyR..',
      '.RRyRR..',
      '..RRR...',
      '........',
    ],
    // Earthquake
    [
      '........',
      '..k.....',
      '..kk....',
      '...k....',
      '...kk...',
      '....k...',
      '....kk..',
      '........',
    ],
    // Plague
    [
      '........',
      '..kkkk..',
      '.kkkkkk.',
      '.k.kk.k.',
      '.kkkkkk.',
      '..k.k...',
      '..kkkk..',
      '........',
    ],
  ];

  /* ------------------------------------------------------ habitat verdicts -- */

  /**
   * The Examine window's habitat strip: how a class fares in one biome.
   *
   * Index 0 is the "cannot live here" cross; 1..4 run from barely surviving to
   * thriving. Use `habitatIcon()` rather than indexing this directly.
   */
  export const HABITAT_ICONS: readonly SpriteRows[] = [
    // Lethal — a green cross, as in the original
    [
      'G......G',
      'GG....GG',
      '.GG..GG.',
      '..GGGG..',
      '..GGGG..',
      '.GG..GG.',
      'GG....GG',
      'G......G',
    ],
    // Barely surviving — drawn, downturned mouth
    [
      '.nnnnnn.',
      'nnnnnnnn',
      'nkknkkn.',
      'nnnnnnnn',
      'nnnnnnnn',
      'nnkkkknn',
      'nknnnnkn',
      '.nnnnnn.',
    ],
    // Coping — flat mouth
    [
      '.nnnnnn.',
      'nnnnnnnn',
      'nkknkkn.',
      'nnnnnnnn',
      'nnnnnnnn',
      'nkkkkkkn',
      'nnnnnnnn',
      '.nnnnnn.',
    ],
    // Doing well — slight smile
    [
      '.nnnnnn.',
      'nnnnnnnn',
      'nkknkkn.',
      'nnnnnnnn',
      'nknnnnkn',
      'nnkkkknn',
      'nnnnnnnn',
      '.nnnnnn.',
    ],
    // Ideal — broad grin
    [
      '.nnnnnn.',
      'nnnnnnnn',
      'nkknkkn.',
      'nnnnnnnn',
      'nkknnkkn',
      'nkkkkkkn',
      'nnkkkknn',
      '.nnnnnn.',
    ],
  ];

  /** Which habitat verdict a suitability score earns. */
  export function habitatIcon(suit: number): number {
    if (suit <= 0) return 0;
    if (suit <= 0.30) return 1;
    if (suit <= 0.55) return 2;
    if (suit <= 0.80) return 3;
    return 4;
  }

  /* ---------------------------------------------------------------- atlas -- */

  /**
   * Rasterises sprites once into small canvases so the Edit window can blit
   * them instead of setting pixels every frame.
   */
  export class SpriteAtlas {
    private readonly cache = new Map<string, HTMLCanvasElement>();

    constructor(private readonly scale: number) {}

    /** Get (and cache) a rasterised sprite. `key` must be unique per sprite. */
    get(key: string, rows: SpriteRows): HTMLCanvasElement {
      const hit = this.cache.get(key);
      if (hit) return hit;

      const size = 8 * this.scale;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('SimEarth: cannot rasterise sprite');

      for (let y = 0; y < 8; y++) {
        const row = rows[y];
        for (let x = 0; x < 8; x++) {
          const color = SPRITE_PALETTE[row[x]];
          if (!color) continue;
          ctx.fillStyle = rgbCss(color);
          ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
        }
      }

      this.cache.set(key, canvas);
      return canvas;
    }

    /** Drop every raster, e.g. after a zoom change. */
    clear(): void {
      this.cache.clear();
    }
  }

  /* ----------------------------------------------------------- pixel art -- */

  /**
   * Rasterise a character grid of any size, taking its dimensions from the rows
   * themselves rather than assuming 8x8 the way SpriteAtlas does. The event
   * dialogs need illustrations far larger than a tile, but drawn from the same
   * palette so they sit in the same world as the map.
   *
   * Not cached: these are drawn once when a dialog opens, not every frame.
   */
  export function drawPixelArt(rows: SpriteRows, scale: number): HTMLCanvasElement {
    const gridH = rows.length;
    const gridW = gridH > 0 ? rows[0].length : 0;

    const canvas = document.createElement('canvas');
    canvas.width = gridW * scale;
    canvas.height = gridH * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('SimEarth: cannot rasterise pixel art');

    for (let y = 0; y < gridH; y++) {
      const row = rows[y];
      for (let x = 0; x < gridW; x++) {
        const color = SPRITE_PALETTE[row[x]];
        if (!color) continue;
        ctx.fillStyle = rgbCss(color);
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    return canvas;
  }

  /**
   * "Life is formed" — a 32x32 view down a microscope at the first ocean.
   * A rod-shaped bacterium trailing two flagella, a dividing coccus below it,
   * and a scatter of smaller cells, all over the primordial deep.
   */
  export const LIFE_FORMED_ART: SpriteRows = [
    '11111121111111111111211111111111',
    '11111111111113111111111111112111',
    '11111111111111111111111121111111',
    '1111111112111111111111111GG11111',
    '111111111111111111111111GjyG1111',
    '111112111111111111111111GyjG1111',
    '1111111111111111111GgG111GG11111',
    '1111111111111111CGjgeGC111111111',
    '111GG11111111111GjggeG1111111111',
    '111yG1111111111GjggeGC1111111111',
    '1111111111111CGjggeG111111111111',
    '1111111111111GjggeG1111111111111',
    '1111111111111GjgyeGC1111111Gj111',
    '11111111111CGjgyeG111111111jG111',
    '11111111111GjggeGC11111111111111',
    '1111111111GjggeG1111111113111111',
    '11111111CGjggeG11111111111111111',
    '111111111GjggeGC111111jG11111111',
    '11111111GjggeG11111111Gj11111111',
    '111111CGjggeGC111111111111111111',
    '1111111GjgeG11111121111111111111',
    '11111CGjgeGC11111111111111111111',
    '1111111GgG1jj1111111111111111111',
    '111GGGG111j11jj11111111111111111',
    '11GggggG11jj111jjj1111111G111111',
    '1GCgggggG11j111111jj1111GyG11111',
    '1GCgeeegG111j1111111jj111G111111',
    '1GggeeegG1111j11111111j111111111',
    '1GgggeegG1111jj11111111111111111',
    '11GggggG1111111jj111111111111111',
    '111GGGG1111111111jj1111111111111',
    '1111111111111111111jj11111121111',
  ];
}
