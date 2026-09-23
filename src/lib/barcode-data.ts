/**
 * Build-time bar sequence for the barcode seam (LoopDivider.astro, PRD §5.12).
 * One tile of alternating bars and gaps from a seeded PRNG, so every build
 * draws the same code. Emitted as hard-stop gradient stops; the divider
 * repeats the tile across its drift track, so `width` is the tile's exact
 * length and the loop snaps to whole multiples of it.
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

interface Spec {
  seed: number;
  bars: number;
  /** Inclusive px ranges. */
  bar: [number, number];
  gap: [number, number];
}

// A gap closes the tile, so its right edge meets the next tile's first bar
// with a gap between them, like every other bar.
export function makeBarcode({ seed, bars, bar, gap }: Spec) {
  const rand = mulberry32(seed);
  const pick = ([lo, hi]: [number, number]) => lo + Math.floor(rand() * (hi - lo + 1));
  const stops: string[] = [];
  let x = 0;
  for (let i = 0; i < bars; i++) {
    const b = pick(bar);
    const g = pick(gap);
    stops.push(`var(--bar) ${x}px ${x + b}px`, `transparent ${x + b}px ${x + b + g}px`);
    x += b + g;
  }
  return { width: x, gradient: `linear-gradient(to right, ${stops.join(", ")})` };
}

// Increment 26 (owner's pick of two screenshotted options): twice the
// increment 25 scale — bars 2–8px, gaps 2–6px, drawn 64px tall by the
// divider — so it reads as a solid object. 90 bars make an 852px tile, about
// 1.5 repeats at 1280. The denser alternative (200 bars of 1–3px, 1–2px gaps,
// 32px tall) was tried and read lighter; the old code was 90 × 1–4px / 1–3px.
export const barcode = makeBarcode({ seed: 26, bars: 90, bar: [2, 8], gap: [2, 6] });
