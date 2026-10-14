/* =============================================================================
 * SimEarth 2.0 — minimal PNG encoder for the terrain atlas
 * -----------------------------------------------------------------------------
 * Indexed (colour type 3) for the atlas, so the palette travels with the image
 * and the file stays small; RGBA (colour type 6) for contact sheets. No
 * dependencies: node:zlib does the compression. Filter 0 on every row keeps
 * the output a pure function of the pixels, which the determinism check needs.
 * ========================================================================== */
'use strict';

const zlib = require('zlib');

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function header(w, h, colorType) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = colorType;
  return ihdr; // compression, filter and interlace stay 0
}

function idat(w, h, bytesPerPixel, data) {
  const stride = w * bytesPerPixel;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(data.buffer, data.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  return zlib.deflateSync(raw, { level: 9 });
}

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** `px` holds one palette index per pixel; `palette` is [[r, g, b, a], …], at most 256. */
function encodeIndexed(w, h, px, palette) {
  if (palette.length > 256) throw new Error('png: palette over 256 entries');
  const plte = Buffer.alloc(palette.length * 3);
  palette.forEach(([r, g, b], i) => { plte[i * 3] = r; plte[i * 3 + 1] = g; plte[i * 3 + 2] = b; });
  let last = palette.length;
  while (last > 0 && palette[last - 1][3] === 255) last--;
  const trns = Buffer.from(palette.slice(0, last).map((c) => c[3]));
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header(w, h, 3)),
    chunk('PLTE', plte),
    ...(last > 0 ? [chunk('tRNS', trns)] : []),
    chunk('IDAT', idat(w, h, 1, px)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** `rgba` is a Uint8Array of w * h * 4 bytes. */
function encodeRGBA(w, h, rgba) {
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header(w, h, 6)),
    chunk('IDAT', idat(w, h, 4, rgba)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { encodeIndexed, encodeRGBA };
