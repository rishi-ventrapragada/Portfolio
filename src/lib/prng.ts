/**
 * mulberry32, the one seeded PRNG behind the site's generated art
 * (increment 32: it was copied into starfield-data.ts and film-strips.ts).
 * Build-time only: a seed gives the same sequence on every build, so the
 * output is reproducible and a diff of it stable. boot-fill.ts's cell order
 * was drawn from it once, offline, and pasted in as a literal.
 */
export function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
