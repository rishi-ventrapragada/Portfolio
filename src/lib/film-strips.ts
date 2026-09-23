/**
 * Build-time geometry for the SVG film strips drawn inside LoopDivider.astro
 * (PRD §5.12, increment 29). Each is one tile in px user units; the strip's
 * component repeats it with an SVG <pattern>, so `tile` must be the
 * pattern's exact period for the loop to snap to whole tiles. Seeded like
 * the rest of the site's generated art, so every build is identical.
 */

/** Same PRNG family as starfield-data.ts and skill-scatter.ts. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Film edge code, the About/Skills seam (EdgeCode.astro). Real stock carries
 * a machine-readable code and a printed key number once per foot, the number
 * counting up foot by foot, with small marks at the frame lines. Here: per
 * 240px foot, a block of 1–3px bars, then the key number, with frame ticks
 * every 60px along both edges. Four feet per tile, so the numbers visibly
 * count before the loop wraps (off screen, by construction). The owner's
 * pick of two screenshotted options (the other set the number above a
 * dotted code, over a row of perforations).
 */
export function edgeCode() {
  const H = 64;
  const FOOT = 240;
  const FEET = 4;
  const rnd = mulberry32(29);
  const ink: Rect[] = [];
  const keys: { x: number; y: number; text: string }[] = [];
  for (let f = 0; f < FEET; f++) {
    const x0 = f * FOOT;
    let x = x0 + 16;
    while (x < x0 + 76) {
      const w = 1 + Math.floor(rnd() * 3);
      ink.push({ x, y: 22, w, h: 20 });
      x += w + 1 + Math.floor(rnd() * 2);
    }
    keys.push({ x: x0 + 90, y: 36, text: `RV 26 0328 ${String(f + 1).padStart(4, "0")}+00` });
    for (let t = 0; t < 4; t++) {
      ink.push({ x: x0 + t * 60, y: 0, w: 1, h: 6 }, { x: x0 + t * 60, y: H - 6, w: 1, h: 6 });
    }
  }
  return { H, tile: FOOT * FEET, ink, keys };
}
