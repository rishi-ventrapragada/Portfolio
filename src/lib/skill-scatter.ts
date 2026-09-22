/**
 * Build-time leaf placement for the skill tree's desktop layout (PRD §5.6).
 * Each leaf gets its own position around its root; SkillGroup draws one
 * straight line from the root to each. Connector lines crossing each other is
 * the intended hand-drawn look — labels overlapping is not, and is what the
 * relaxation below prevents.
 *
 * Deterministic: mulberry32 over a per-category seed, so the layout is
 * identical on every build and inspectable in the output, the same
 * reproducibility rule boot-fill.ts follows. Nothing is randomised at runtime.
 */

/** Same PRNG family as boot-fill.ts's offline shuffle. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Leaf {
  item: string;
  /** Offset from the root's centre, in px. */
  x: number;
  y: number;
  /** Estimated label box, used for collision tests and by the caller. */
  w: number;
  h: number;
}

// Label metrics: mono 14px at 0.04em tracking, 0.625rem/0.5rem padding.
// Calibration: this predicts 128px for "Tailwind CSS", which is the width
// increment 18 measured for that label — the widest in the set.
const CHAR = 14 * 0.6 + 14 * 0.04;
const PAD_X = 10;
const LINE = 17;
const PAD_Y = 8;
const GAP = 12; // Minimum clear space between two label boxes.

// The root chip is a box, not a point: a wide one ("Currently learning") is
// ~190px across, so a radial distance check alone lets a label at a near
// horizontal angle sit right on top of it. Treated as a leaf-shaped obstacle
// at the origin instead, with the same GAP.
const ROOT_PAD_X = 28;
const ROOT_PAD_Y = 22;

const boxWidth = (s: string) => Math.ceil(s.length * CHAR + PAD_X * 2);
const BOX_H = LINE + PAD_Y * 2;

/** True when two boxes are closer than GAP on both axes. */
function overlap(a: Leaf, b: Leaf): number {
  const dx = Math.abs(a.x - b.x) - (a.w + b.w) / 2 - GAP;
  const dy = Math.abs(a.y - b.y) - (a.h + b.h) / 2 - GAP;
  return dx < 0 && dy < 0 ? Math.min(-dx, -dy) : 0;
}

/**
 * Seed the leaves on a jittered ring, then push overlapping pairs apart until
 * none collide. Converges in well under ten passes for every category in the
 * set (measured); the iteration cap is a guard, not the expected path.
 */
export function scatter(name: string, items: string[]): Leaf[] {
  const rnd = mulberry32(73 + name.length * 7 + items.length);
  const n = items.length;
  const rx = 150 + n * 22;
  const ry = 84 + n * 13;

  // The root's own obstacle box, as a Leaf so it can reuse overlap(). The
  // chip is `.label` — uppercase at 0.12em tracking — so it runs wider than
  // the leaf estimate for the same string; 1.35 covers the caps plus the
  // extra tracking, measured against "Currently learning", the longest.
  const rootBox: Leaf = {
    item: name,
    w: Math.ceil(boxWidth(name) * 1.35) + ROOT_PAD_X * 2,
    h: BOX_H + ROOT_PAD_Y * 2,
    x: 0,
    y: 0,
  };

  // A quarter-turn offset keeps a two-item group off the horizontal, where
  // both leaves would otherwise sit level with the root and read as a row
  // rather than a scatter.
  const phase = n <= 3 ? Math.PI / 3 : 0;

  const leaves: Leaf[] = items.map((item, i) => {
    const angle = phase + (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.55;
    const r = 0.62 + rnd() * 0.38;
    return { item, w: boxWidth(item), h: BOX_H, x: Math.cos(angle) * rx * r, y: Math.sin(angle) * ry * r };
  });

  for (let pass = 0; pass < 600; pass++) {
    let moved = 0;

    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const push = overlap(leaves[i], leaves[j]);
        if (push === 0) continue;
        let dx = leaves[j].x - leaves[i].x;
        let dy = leaves[j].y - leaves[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        dx /= d;
        dy /= d;
        const step = push / 2 + 0.5;
        leaves[i].x -= dx * step;
        leaves[i].y -= dy * step;
        leaves[j].x += dx * step;
        leaves[j].y += dy * step;
        moved++;
      }
    }

    // Nothing may sit on the root chip. Pushed straight out along the leaf's
    // own bearing, so its connector keeps pointing back at the root.
    for (const leaf of leaves) {
      const push = overlap(rootBox, leaf);
      if (push === 0) continue;
      const d = Math.hypot(leaf.x, leaf.y) || 0.01;
      leaf.x += (leaf.x / d) * (push + 1);
      leaf.y += (leaf.y / d) * (push + 1);
      moved++;
    }

    if (!moved) break;
  }

  // The legibility rule is non-negotiable (PRD §5.6), so it is asserted at
  // build time rather than trusted: a future edit to the data or the metrics
  // fails the build instead of shipping overlapping labels.
  for (let i = 0; i < leaves.length; i++) {
    if (overlap(rootBox, leaves[i]) > 0) {
      throw new Error(`skill-scatter: "${name}" label ${leaves[i].item} sits on the root`);
    }
    for (let j = i + 1; j < leaves.length; j++) {
      if (overlap(leaves[i], leaves[j]) > 0) {
        throw new Error(`skill-scatter: "${name}" labels ${leaves[i].item} / ${leaves[j].item} overlap`);
      }
    }
  }

  return leaves;
}

/**
 * Canvas size for a group. The root is centred, so the canvas has to be
 * symmetric about the origin — twice the furthest excursion on each axis,
 * not the raw min-to-max extent, or a lopsided scatter would clip on the
 * long side.
 */
export function extent(leaves: Leaf[]): { w: number; h: number } {
  const halfW = Math.max(...leaves.map((l) => Math.abs(l.x) + l.w / 2));
  const halfH = Math.max(...leaves.map((l) => Math.abs(l.y) + l.h / 2));
  return { w: Math.ceil(halfW * 2), h: Math.ceil(halfH * 2) };
}
