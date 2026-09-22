/**
 * Build-time star generation for Starfield.astro (PRD §5.14), ported from the
 * Recurzn / Life OS sky. Three parallax layers: the nearer a layer, the fewer
 * stars, the faster its drift and the brighter it sits, which is what reads as
 * depth. Positions come from a seeded PRNG so every build produces the same
 * sky and a diff of the markup is stable; nothing is randomised at runtime and
 * there is no client script.
 */

/** Same PRNG family as boot-fill.ts and skill-scatter.ts. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Star {
  /** Percent across the 200%-wide drift track. */
  x: number;
  /** Percent down the layer. */
  y: number;
  /** 1–3px. Only 2 and 3 get the bloom. */
  size: number;
  /** Negative, so every star is already mid-twinkle on the first frame. */
  delay: number;
  /** Per-star twinkle period, so they never pulse in lockstep. */
  duration: number;
}

export interface Layer {
  name: "near" | "mid" | "far";
  stars: Star[];
  /** One full 50% translation, i.e. a seamless loop. */
  drift: number;
  opacity: number;
  /** Only near and mid twinkle; far is a still backdrop. */
  twinkles: boolean;
}

const SPEC = [
  { name: "near", count: 46, drift: 32, opacity: 1, twinkles: true, seed: 101 },
  { name: "mid", count: 52, drift: 59, opacity: 0.72, twinkles: true, seed: 211 },
  { name: "far", count: 62, drift: 98, opacity: 0.5, twinkles: false, seed: 307 },
] as const;

function build(count: number, seed: number): Star[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const r = rnd();
    // Mostly 1px dust with a few brighter stars — the 2s and 3s are the ones
    // that get the bloom, so keeping them rare stops the sky reading as fog.
    const size = r > 0.93 ? 3 : r > 0.74 ? 2 : 1;
    return {
      // Only the left half is authored; the track repeats it, so a star may
      // sit anywhere in 0–50 and its copy lands exactly 50 later.
      x: Number((rnd() * 50).toFixed(3)),
      y: Number((rnd() * 100).toFixed(3)),
      size,
      duration: Number((2.4 + rnd() * 4.2).toFixed(2)),
      delay: Number((-rnd() * 6.6).toFixed(2)),
    };
  });
}

export const layers: Layer[] = SPEC.map((s) => ({
  name: s.name,
  stars: build(s.count, s.seed),
  drift: s.drift,
  opacity: s.opacity,
  twinkles: s.twinkles,
}));

/**
 * Three streaks on pairwise-coprime periods, so their starts only coincide
 * once every lcm(23, 31, 37) = 26 381s — a meteor never arrives on a
 * predictable beat. Each is visible for a small fraction of its own period
 * (~18% overall), which is what keeps them an event rather than a texture.
 */
export const meteors = [
  { top: 12, left: 8, duration: 23, delay: -4, length: 140, angle: 28 },
  { top: 34, left: 54, duration: 31, delay: -17, length: 180, angle: 24 },
  { top: 6, left: 78, duration: 37, delay: -29, length: 120, angle: 32 },
] as const;

/** Reported in the PRD: four instances of this many nodes each. */
export const starCount = layers.reduce((n, l) => n + l.stars.length, 0);
