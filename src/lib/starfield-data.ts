/**
 * Build-time star generation for Starfield.astro (PRD §5.14), ported from the
 * Recurzn / Life OS sky. Three parallax layers: the nearer a layer, the fewer
 * stars, the faster its drift and the brighter it sits, which is what reads as
 * depth. Positions come from a seeded PRNG so every build produces the same
 * sky and a diff of the output is stable; nothing is randomised at runtime.
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
}

/**
 * The stars of one layer that twinkle together. Each group is ONE element
 * that paints all its stars as a box-shadow list (see skyCss below), so the
 * twinkle is per group, not per star: eight groups per twinkling layer, each
 * on its own period and phase, reads as the same scattered shimmer.
 */
export interface StarGroup {
  /** Custom property holding this group's shadow list, defined in skyCss. */
  prop: string;
  /** Per-group twinkle period, so the groups never pulse in lockstep. */
  duration: number;
  /** Negative, so every group is already mid-twinkle on the first frame. */
  delay: number;
}

export interface Layer {
  name: "near" | "mid" | "far";
  groups: StarGroup[];
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

const GROUPS = 8;

function build(count: number, seed: number): Star[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const r = rnd();
    // Mostly 1px dust with a few brighter stars — the 2s and 3s are the ones
    // that get the bloom, so keeping them rare stops the sky reading as fog.
    const size = r > 0.93 ? 3 : r > 0.74 ? 2 : 1;
    // Only the left half is authored; the seam copy lands exactly 50 later.
    const star = { x: Number((rnd() * 50).toFixed(3)), y: Number((rnd() * 100).toFixed(3)), size };
    // Two draws the per-star twinkle used to take, kept so every position
    // above stays identical to the increment-22 sky.
    rnd();
    rnd();
    return star;
  });
}

const n = (v: number) => Number(v.toFixed(3));

/**
 * One star as box-shadows on a 1px round dot at the track's top-left. Offsets
 * are in the layer's own units (the layer is a size container): the track is
 * 200% of the layer, so x% of the track is 2x cqw, and y% of the layer is
 * y cqh. A spread of (size − 1) / 2 grows the dot to the star's diameter.
 * Each star is drawn twice — here and one layer width (100cqw) to the right —
 * which is the seamless loop: at the drift's −50% end the copy sits exactly
 * where the original began. Bloom (2px and 3px stars) is a second, blurred
 * shadow under the disc, the old per-star glow.
 */
function shadows(star: Star, snap: boolean): { discs: string[]; blooms: string[] } {
  const spread = (star.size - 1) / 2;
  // Snapped to whole px where round() exists: a shadow offset is not
  // pixel-snapped the way an element's box is, so a 1px star at a fractional
  // offset smears across two pixels at half brightness.
  const len = (v: number, unit: string) => (snap ? `round(${n(v)}${unit}, 1px)` : `${n(v)}${unit}`);
  const at = (x: number, y: number) =>
    spread
      ? `calc(${len(x, "cqw")} + ${spread}px) calc(${len(y, "cqh")} + ${spread}px)`
      : `${len(x, "cqw")} ${len(y, "cqh")}`;
  const discs: string[] = [];
  const blooms: string[] = [];
  for (const copy of [0, 100]) {
    const pos = at(star.x * 2 + copy, star.y);
    discs.push(spread ? `${pos} 0 ${spread}px` : pos);
    if (star.size > 1) blooms.push(`${pos} ${star.size * 3}px ${n(spread + star.size / 3)}px color-mix(in srgb, currentColor 45%, transparent)`);
  }
  return { discs, blooms };
}

const defs: string[] = [];
const snapped: string[] = [];

export const layers: Layer[] = SPEC.map((s) => {
  const stars = build(s.count, s.seed);
  const count = s.twinkles ? GROUPS : 1;
  const timing = mulberry32(s.seed + 1);
  const groups = Array.from({ length: count }, (_, g) => {
    const prop = `--sky-${s.name}-${g}`;
    const mine = stars.filter((_, i) => i % count === g);
    for (const [out, snap] of [[defs, false], [snapped, true]] as const) {
      const drawn = mine.map((st) => shadows(st, snap));
      // Discs first, blooms after: the first shadow in a list paints on top.
      out.push(`${prop}:${[...drawn.flatMap((m) => m.discs), ...drawn.flatMap((m) => m.blooms)].join(",")}`);
    }
    return { prop, duration: n(2.4 + timing() * 4.2), delay: n(-timing() * 6.6) };
  });
  return { name: s.name, groups, drift: s.drift, opacity: s.opacity, twinkles: s.twinkles };
});

/**
 * Every star of every layer, defined ONCE for the page (StarfieldDefs.astro
 * puts it in the <head>); each of the five Starfield mounts only references
 * it. Before increment 28 each mount shipped all 160 stars as its own spans.
 * The unsnapped lists are the fallback for browsers without round().
 */
export const skyCss =
  `[data-sky]{${defs.join(";")}}` + `@supports (width: round(1px, 1px)){[data-sky]{${snapped.join(";")}}}`;

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
