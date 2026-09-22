/**
 * The skill tree's per-frame geometry (PRD §5.6), split out of
 * skill-drift.ts for the CLAUDE.md §5 line cap: the shared state types, the
 * separation pass that keeps labels apart while the group is moving, and the
 * one write per leaf per frame (a transform and its line's endpoint).
 */

export interface SkillNode {
  el: HTMLElement;
  line: SVGLineElement;
  hx: number;
  hy: number;
  w: number;
  h: number;
  x: number;
  y: number;
  /** Drift: per-axis period (s) and phase, so no two leaves move in step. */
  fx: number;
  fy: number;
  px: number;
  py: number;
}

export interface SkillGroup {
  el: HTMLElement;
  nodes: SkillNode[];
  rootW: number;
  rootH: number;
  halfW: number;
  halfH: number;
  /** Local clock, s. Runs faster while stirred. */
  t: number;
  boost: number;
  theta: number;
  omega: number;
  visible: boolean;
  drag?: { node: SkillNode; x: number; y: number };
}

/** Runtime clearance between label boxes, px. */
const GAP = 4;

/**
 * Push overlapping labels apart; a held leaf never yields. Several passes,
 * each ending with the root and canvas constraints, because a push can land
 * a label on a third one or against the canvas edge, and clamping after the
 * last pass would undo the separation it just made.
 */
export function separate(g: SkillGroup): void {
  const ns = g.nodes;
  const held = g.drag?.node;
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i];
        const b = ns[j];
        const ox = (a.w + b.w) / 2 + GAP - Math.abs(a.x - b.x);
        const oy = (a.h + b.h) / 2 + GAP - Math.abs(a.y - b.y);
        if (ox <= 0 || oy <= 0) continue;
        // Out along the cheaper axis, split unless one side is held.
        const axis = ox < oy ? "x" : "y";
        const push = (axis === "x" ? ox : oy) * Math.sign(b[axis] - a[axis] || 1);
        const share = a === held || b === held ? 1 : 0.5;
        if (a !== held) a[axis] -= push * share;
        if (b !== held) b[axis] += push * share;
        moved = true;
      }
    }
    for (const n of ns) {
      // Off the root chip, then inside the canvas.
      const ox = (n.w + g.rootW) / 2 + GAP - Math.abs(n.x);
      const oy = (n.h + g.rootH) / 2 + GAP - Math.abs(n.y);
      if (ox > 0 && oy > 0 && n !== held) {
        if (ox < oy) n.x += ox * Math.sign(n.x || 1);
        else n.y += oy * Math.sign(n.y || 1);
      }
      n.x = Math.max(-g.halfW + n.w / 2, Math.min(g.halfW - n.w / 2, n.x));
      n.y = Math.max(-g.halfH + n.h / 2, Math.min(g.halfH - n.h / 2, n.y));
    }
    if (!moved) break;
  }

  // Last resort: a neighbour pinned against the canvas edge cannot yield, so
  // the held leaf does — it stops a few px short of the pointer rather than
  // sitting on top of another label.
  if (!held) return;
  for (const n of ns) {
    if (n === held) continue;
    const ox = (n.w + held.w) / 2 + GAP - Math.abs(n.x - held.x);
    const oy = (n.h + held.h) / 2 + GAP - Math.abs(n.y - held.y);
    if (ox <= 0 || oy <= 0) continue;
    if (ox < oy) held.x -= ox * Math.sign(n.x - held.x || 1);
    else held.y -= oy * Math.sign(n.y - held.y || 1);
  }
}

export function write(g: SkillGroup): void {
  for (const n of g.nodes) {
    n.el.style.transform = `translate(-50%, -50%) translate(${n.x.toFixed(2)}px, ${n.y.toFixed(2)}px)`;
    n.line.x2.baseVal.value = n.x;
    n.line.y2.baseVal.value = n.y;
  }
}
