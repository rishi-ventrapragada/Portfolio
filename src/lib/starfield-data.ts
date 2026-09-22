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
 * Three streaks, geometry taken from Recurzn-Web's own sky (lib/starfield.ts
 * there, increment 23): each streak is a track 130–150vw long at a static
 * angle, starting off the left edge, so it crosses the whole section rather
 * than flicking a few px. Periods 9 / 11 / 13s are pairwise coprime, so the
 * starts coincide only every lcm = 1287s and never settle into a beat. Each
 * is visible for ~18% of its own period and parked off-screen for the rest.
 */
export const meteors = [
  { top: 5, left: -10, length: 130, angle: 12, duration: 9, delay: -2.5 },
  { top: 32, left: -18, length: 150, angle: 27, duration: 13, delay: -10 },
  { top: 62, left: -14, length: 140, angle: 19, duration: 11, delay: -6 },
] as const;

/** Reported in the PRD: four instances of this many nodes each. */
export const starCount = layers.reduce((n, l) => n + l.stars.length, 0);
