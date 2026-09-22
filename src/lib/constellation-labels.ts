/**
 * Where each constellation name sits relative to its star (PRD §5.6,
 * increment 23), decided at build time.
 *
 * The label is no longer on an opaque box, only a soft halo, so a line under
 * the letters would show. Two layers keep that from happening:
 *
 * 1. Here, each name takes the position — natural side, opposite side,
 *    above, below or one of four diagonals — that crosses the fewest lines
 *    across every box size and every angle the figure turns through at
 *    runtime. Staying inside the box (plus the section gutter's grace) and
 *    clear of every other dot and name are hard rules: if no position meets
 *    them, the build fails.
 * 2. Wherever a crossing is unavoidable — nine stars, ten lines, a 272px
 *    phone box — scripts/constellation-motion.ts routes the line around the
 *    name: an SVG mask cuts every line under every label, following the
 *    labels as they move. The best position just keeps those cuts few.
 *
 * Solved twice, because the box changes shape: once for the portrait phone
 * box, once for the 16:10 box from 768px. A star may sit its name on a
 * different side at each.
 */
import { lineEnds, stars } from "./constellation-data";

export type Side = "right" | "left" | "above" | "below" | "ne" | "nw" | "se" | "sw";

/** The runtime turn, either way, in degrees, per layout. The phone box is
 * narrow and portrait, so the same angle swings its outer names much further
 * across their neighbours; it turns half as far. constellation-motion.ts
 * reads both. */
export const TURN_DEG = { phone: 3, wide: 6 } as const;

// Label metrics: mono 14px at 0.04em tracking, line-height 1.3, 0.375rem
// padding each side (the halo's room), offset 0.5rem from the dot's edge.
const CHAR = 14 * 0.6 + 14 * 0.04;
const PAD = 6;
const LABEL_H = Math.ceil(14 * 1.3) + 4;
const OFFSET = 8;
const CLEAR = 3; // Extra clearance around a label box, px.

// Every size the box renders at: phone portrait (375, 320) and the 16:10
// box at 768, ~1024 and its 960px cap.
const PHONE: [number, number][] = [
  [327, 490.5],
  [272, 408],
];
const WIDE: [number, number][] = [
  [672, 420],
  [800, 500],
  [960, 600],
];

// How far a name may reach past the box: into the section gutter sideways
// (24px on a phone, 48px+ from 768px, less the 12px runtime drift), and into
// the heading's margin or the section padding vertically.
const GRACE = { phone: [10, 20], wide: [30, 20] } as const;

/** A diagonal label tucks its near corner in to this share of the offset. */
export const DIAGONAL = 0.6;

type Rect = [number, number, number, number];
/** Star positions in px for one render, tagged with the box size. */
type Frame = [number, number][] & { size?: [number, number] };

function box(i: number, side: Side, x: number, y: number): Rect {
  const { name, d } = stars[i];
  const w = name.length * CHAR + PAD * 2;
  const r = d / 2 + OFFSET;
  if (side === "right") return [x + r, y - LABEL_H / 2, x + r + w, y + LABEL_H / 2];
  if (side === "left") return [x - r - w, y - LABEL_H / 2, x - r, y + LABEL_H / 2];
  if (side === "above") return [x - w / 2, y - r - LABEL_H, x + w / 2, y - r];
  if (side === "below") return [x - w / 2, y + r, x + w / 2, y + r + LABEL_H];
  const k = r * DIAGONAL;
  const east = side === "ne" || side === "se";
  const north = side === "ne" || side === "nw";
  const [x0, x1] = east ? [x + k, x + k + w] : [x - k - w, x - k];
  const [y0, y1] = north ? [y - k - LABEL_H, y - k] : [y + k, y + k + LABEL_H];
  return [x0, y0, x1, y1];
}

const grow = ([a, b, c, d]: Rect, m: number): Rect => [a - m, b - m, c + m, d + m];
const hit = (p: Rect, q: Rect) => p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3];

/** Segment against rectangle: Liang–Barsky clip, true if any part is inside. */
function crosses(x1: number, y1: number, x2: number, y2: number, [l, t, r, b]: Rect): boolean {
  let lo = 0;
  let hi = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  for (const [p, q] of [[-dx, x1 - l], [dx, r - x1], [-dy, y1 - t], [dy, b - y1]]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const u = q / p;
      if (p < 0) lo = Math.max(lo, u);
      else hi = Math.min(hi, u);
    }
  }
  return lo <= hi;
}

/** Star positions in px for one box size and one turn about the centroid. */
function place(w: number, h: number, deg: number): Frame {
  const pts = stars.map((s) => [(s.x / 100) * w, (s.y / 100) * h]);
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const a = (deg * Math.PI) / 180;
  const out = pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]) as Frame;
  out.size = [w, h];
  return out;
}

type Grace = readonly [number, number];

/** Hard rules: inside the box plus grace, off every other dot and name. */
function allowed(frames: Frame[], grace: Grace, i: number, side: Side, chosen: Side[]): boolean {
  return frames.every((pts) => {
    const mine = grow(box(i, side, ...pts[i]), CLEAR);
    const [w, h] = pts.size!;
    const [gx, gy] = grace;
    if (mine[0] < -gx || mine[2] > w + gx || mine[1] < -gy || mine[3] > h + gy) return false;
    return pts.every(([x, y], j) => {
      if (j === i) return true;
      const r = stars[j].d / 2 + 2;
      if (hit(mine, [x - r, y - r, x + r, y + r])) return false;
      return j >= chosen.length || !hit(mine, box(j, chosen[j], x, y));
    });
  });
}

/** Soft cost: line crossings summed over every frame. The mask handles
 * what is left; fewer means fewer, shorter cuts in the figure. */
function crossings(frames: Frame[], i: number, side: Side): number {
  let n = 0;
  for (const pts of frames) {
    const mine = grow(box(i, side, ...pts[i]), CLEAR);
    for (const [a, b] of lineEnds) if (crosses(...pts[a], ...pts[b], mine)) n++;
  }
  return n;
}

/**
 * Branch-and-bound over every legal combination, cheapest first: a greedy
 * pass boxes itself in (one name taking the only spot a later one needs).
 */
function solve(sizes: [number, number][], grace: Grace, label: keyof typeof TURN_DEG): Side[] {
  const frames = sizes.flatMap(([w, h]) => [-1, -0.5, 0, 0.5, 1].map((k) => place(w, h, k * TURN_DEG[label])));
  const options = stars.map((s, i) => {
    const natural: Side = s.x > 50 ? "left" : "right";
    const order: Side[] = [natural, natural === "left" ? "right" : "left", "above", "below", "ne", "nw", "se", "sw"];
    return order.map((side) => ({ side, cost: crossings(frames, i, side) })).sort((a, b) => a.cost - b.cost);
  });
  let best: Side[] | undefined;
  let bestCost = Infinity;
  const walk = (chosen: Side[], cost: number) => {
    if (cost >= bestCost) return;
    const i = chosen.length;
    if (i === stars.length) {
      best = chosen;
      bestCost = cost;
      return;
    }
    for (const { side, cost: c } of options[i]) {
      if (allowed(frames, grace, i, side, chosen)) walk([...chosen, side], cost + c);
    }
  };
  walk([], 0);
  if (!best) throw new Error(`constellation-labels: no legal placement of every name (${label})`);
  return best;
}

/** Per star: its name's position in the phone box and in the wide box. */
export const labelSides = {
  phone: solve(PHONE, GRACE.phone, "phone"),
  wide: solve(WIDE, GRACE.wide, "wide"),
};

/**
 * A position as CSS inputs for the name (SkillConstellation.astro): which
 * point of the label box sits on the anchor (0 / 0.5 / 1 of its own width
 * and height) and the anchor's offset from the star, in px — the same
 * geometry box() tests above.
 */
export function anchor(side: Side, d: number): { ax: number; ay: number; ox: number; oy: number } {
  const r = d / 2 + OFFSET;
  const k = r * DIAGONAL;
  const east = side === "right" || side === "ne" || side === "se";
  const west = side === "left" || side === "nw" || side === "sw";
  const north = side === "above" || side === "ne" || side === "nw";
  const south = side === "below" || side === "se" || side === "sw";
  const diag = side.length === 2;
  const off = diag ? k : r;
  return {
    ax: east ? 0 : west ? 1 : 0.5,
    ay: north ? 1 : south ? 0 : 0.5,
    ox: east ? off : west ? -off : 0,
    oy: north ? -off : south ? off : 0,
  };
}
