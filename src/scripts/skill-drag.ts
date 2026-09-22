/**
 * Skill tree drag (PRD §5.6, increment 23), the pointer half of
 * skill-drift.ts. Fine pointers only (CLAUDE.md §4): a held leaf follows the
 * pointer inside its own canvas, its group's clock runs faster while it is
 * held (skill-drift.ts's BOOST), and sweeping it round the root spins the
 * group, which springs back once let go.
 *
 * Kept under reduced motion: dragging is direct manipulation — the leaf moves
 * only when, and only as far as, the visitor's own pointer does. What goes is
 * everything autonomous: no spin, no stir, and a released leaf is back home
 * in the same frame rather than gliding there.
 */
import type { SkillGroup } from "./skill-physics";

/** The loop hooks skill-drift.ts passes in, so the two never import each other. */
interface Loop {
  reduced: MediaQueryList;
  wake: () => void;
  settle: (g: SkillGroup) => void;
}

/** Angular velocity added per radian swept round the root. */
const SPIN = 5;

export function bindDrag(g: SkillGroup, signal: AbortSignal, { reduced, wake, settle }: Loop): void {
  if (!matchMedia("(pointer: fine)").matches) return;

  let angle = 0;
  const local = (e: PointerEvent) => {
    const r = g.el.getBoundingClientRect();
    return { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2) };
  };

  for (const node of g.nodes) {
    node.el.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        node.el.setPointerCapture(e.pointerId);
        const p = local(e);
        g.drag = { node, x: node.x, y: node.y };
        angle = Math.atan2(p.y, p.x);
        g.el.toggleAttribute("data-dragging", true);
        wake();
      },
      { signal },
    );

    node.el.addEventListener(
      "pointermove",
      (e) => {
        if (g.drag?.node !== node) return;
        const p = local(e);
        g.drag.x = p.x;
        g.drag.y = p.y;
        const next = Math.atan2(p.y, p.x);
        // Shortest signed sweep, so crossing ±π is not read as a full turn.
        const sweep = Math.atan2(Math.sin(next - angle), Math.cos(next - angle));
        angle = next;
        if (!reduced.matches) g.omega += sweep * SPIN;
      },
      { signal },
    );

    const release = () => {
      if (g.drag?.node !== node) return;
      g.drag = undefined;
      g.el.toggleAttribute("data-dragging", false);
      if (reduced.matches) settle(g);
    };
    node.el.addEventListener("pointerup", release, { signal });
    node.el.addEventListener("pointercancel", release, { signal });
  }
}
