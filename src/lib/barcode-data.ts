/**
 * Build-time bar sequence for the barcode seam (LoopDivider.astro, PRD §5.12).
 * One tile of alternating bars and gaps, each 1–4px, from a seeded PRNG so
 * every build draws the same code. Emitted as hard-stop gradient stops; the
 * divider repeats the tile across its drift track, so `width` is the tile's
 * exact length and the loop snaps to whole multiples of it.
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

const rand = mulberry32(25);
const BARS = 90;

// Bars lean thicker than gaps, which is what makes it read as a barcode
// rather than a comb. A gap closes the tile, so its right edge meets the
// next tile's first bar with a gap between them, like every other bar.
const stops: string[] = [];
let x = 0;
for (let i = 0; i < BARS; i++) {
  const bar = 1 + Math.floor(rand() * 4);
  const gap = 1 + Math.floor(rand() * 3);
  stops.push(`var(--bar) ${x}px ${x + bar}px`, `transparent ${x + bar}px ${x + bar + gap}px`);
  x += bar + gap;
}

export const barcode = {
  /** The tile's exact length in px. */
  width: x,
  gradient: `linear-gradient(to right, ${stops.join(", ")})`,
};
