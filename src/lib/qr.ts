// Tiny QR helper. Encodes text into a single SVG path so a QR code can be drawn
// as inline SVG: crisp at any size, no image file to store, no network request.

import { encode } from 'uqr';

/** Quiet zone, in modules. The QR spec asks for 4 so phone cameras lock on reliably. */
const QUIET_ZONE = 4;

export interface QrPath {
  /** Width and height of the square viewBox, quiet zone included. */
  size: number;
  /** SVG path data. Each dark run of modules is one rectangle. */
  d: string;
}

export function qrPath(text: string): QrPath {
  const { data, size } = encode(text, { ecc: 'M', border: 0 });
  let d = '';
  for (let y = 0; y < size; y++) {
    const row = data[y] ?? [];
    let x = 0;
    while (x < size) {
      if (!row[x]) {
        x++;
        continue;
      }
      let end = x;
      while (end < size && row[end]) end++;
      d += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h${end - x}v1h-${end - x}z`;
      x = end;
    }
  }
  return { size: size + QUIET_ZONE * 2, d };
}
