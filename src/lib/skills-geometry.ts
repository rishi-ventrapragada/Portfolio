/**
 * Plane geometry for the skills graph's build-time layout and its checks
 * (PRD §5.6, increments 31): box overlap, segment-to-box distance and
 * segment crossing. Split from skills-layout.ts for the CLAUDE.md §5 cap.
 */
import type { Box } from "./skills-metrics";

export interface Pt {
  x: number;
  y: number;
}

/** Penetration of two boxes grown by `gap`, per axis, or null if clear. */
export function overlap(p: Box, q: Box, gap: number): [number, number] | null {
  const ox = Math.min(p.r, q.r) - Math.max(p.l, q.l) + gap;
  const oy = Math.min(p.b, q.b) - Math.max(p.t, q.t) + gap;
  return ox > 0 && oy > 0 ? [ox, oy] : null;
}

/** Closest point to `p` on segment ab. */
export function closest(a: Pt, b: Pt, p: Pt): Pt {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

/** Whether segments ab and cd properly cross (touching ends do not count). */
export function crosses(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o = (p: Pt, q: Pt, r: Pt) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

const clampTo = (box: Box, p: Pt): Pt => ({ x: Math.max(box.l, Math.min(box.r, p.x)), y: Math.max(box.t, Math.min(box.b, p.y)) });

/** Distance from segment ab to a box, exact: 0 if the segment enters it,
 * else the least of the box corners to the segment and the segment's ends
 * to the box. `on` is the segment's nearest point, `at` the box's. */
export function segBox(a: Pt, b: Pt, box: Box): { d: number; at: Pt; on: Pt } {
  const corners = [
    { x: box.l, y: box.t },
    { x: box.r, y: box.t },
    { x: box.r, y: box.b },
    { x: box.l, y: box.b },
  ];
  const inside = (p: Pt) => p.x >= box.l && p.x <= box.r && p.y >= box.t && p.y <= box.b;
  const centre = { x: (box.l + box.r) / 2, y: (box.t + box.b) / 2 };
  if (inside(a) || inside(b) || corners.some((c, i) => crosses(a, b, c, corners[(i + 1) % 4]))) {
    return { d: 0, at: centre, on: closest(a, b, centre) };
  }
  let best = { d: Infinity, at: a, on: a };
  for (const c of corners) {
    const on = closest(a, b, c);
    const d = Math.hypot(on.x - c.x, on.y - c.y);
    if (d < best.d) best = { d, at: c, on };
  }
  for (const e of [a, b]) {
    const at = clampTo(box, e);
    const d = Math.hypot(e.x - at.x, e.y - at.y);
    if (d < best.d) best = { d, at, on: e };
  }
  return best;
}
