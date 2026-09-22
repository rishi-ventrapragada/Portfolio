/**
 * Skill tree motion (PRD §5.6, increment 23): the desktop scatter drifts on
 * its own, Obsidian-graph style, and a dragged leaf stirs its group. This is
 * the first continuous client animation on the site and it is deliberate —
 * CSS cannot move an SVG line's endpoint to follow a label, and the drag
 * needs real state. Vanilla requestAnimationFrame, no library.
 *
 * Every leaf eases toward a target that is its build-time home, turned about
 * the root by the group's angle, plus a slow per-leaf drift of at most DRIFT
 * px. A separation pass then keeps labels apart even mid-drag, when the rest
 * guarantee (DRIFT < GAP / 2, lib/skill-scatter.ts) no longer applies. The
 * pointer side lives in skill-drag.ts.
 *
 * Only groups on screen are stepped, and the loop stops entirely when none
 * are. Reduced motion: no drift, no sway, no spin — the loop runs only while
 * a drag is in progress, and everything lands in place without easing.
 */
import { DRIFT, ROTATE_MAX } from "../lib/skill-scatter";
import { bindDrag } from "./skill-drag";
import { separate, write, type SkillGroup } from "./skill-physics";

const SWAY = (3 * Math.PI) / 180; // Autonomous rotation amplitude.
const SWAY_PERIOD = 60;
const BOOST = 4; // Clock multiplier while a leaf is held.

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const groups: SkillGroup[] = [];
let frame = 0;
let last = 0;

function step(g: SkillGroup, dt: number): void {
  const still = reduced.matches;
  if (!still) {
    // The stir decays back to the resting pace over about a second.
    const target = g.drag ? BOOST : 1;
    g.boost += (target - g.boost) * (1 - Math.exp(-dt / 1.2));
    g.t += dt * g.boost;
    // A damped spring toward a slow sway; a drag adds angular velocity.
    const sway = SWAY * Math.sin((g.t / SWAY_PERIOD) * Math.PI * 2);
    g.omega += (-2.2 * (g.theta - sway) - 1.6 * g.omega) * dt;
    g.theta += g.omega * dt;
    if (Math.abs(g.theta) > ROTATE_MAX) {
      g.theta = Math.sign(g.theta) * ROTATE_MAX;
      g.omega = 0;
    }
  }

  const cos = Math.cos(g.theta);
  const sin = Math.sin(g.theta);
  const ease = still ? 1 : 1 - Math.exp(-dt * 5);
  for (const n of g.nodes) {
    if (g.drag?.node === n) {
      n.x = g.drag.x;
      n.y = g.drag.y;
      continue;
    }
    let tx = n.hx * cos - n.hy * sin;
    let ty = n.hx * sin + n.hy * cos;
    if (!still) {
      tx += DRIFT * Math.sin((g.t / n.fx) * Math.PI * 2 + n.px);
      ty += DRIFT * Math.sin((g.t / n.fy) * Math.PI * 2 + n.py);
    }
    n.x += (tx - n.x) * ease;
    n.y += (ty - n.y) * ease;
  }
  separate(g);
  write(g);
}

function tick(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  let live = false;
  for (const g of groups) {
    if (!g.visible && !g.drag) continue;
    if (reduced.matches && !g.drag) continue;
    step(g, dt);
    live = true;
  }
  frame = live ? requestAnimationFrame(tick) : 0;
}

/** Start the loop if it is idle. skill-drag.ts calls this on grab. */
function wake(): void {
  if (frame) return;
  last = performance.now();
  frame = requestAnimationFrame(tick);
}

/** A released leaf under reduced motion lands home in one frame. */
function settle(g: SkillGroup): void {
  step(g, 0);
}

function measure(el: HTMLElement, i: number): SkillGroup {
  const root = el.querySelector<HTMLElement>(".root")!;
  const lines = [...el.querySelectorAll<SVGLineElement>(".rays line")];
  const nodes = [...el.querySelectorAll<HTMLElement>(".leaf")].map((leaf, j) => {
    const hx = Number(leaf.dataset.x);
    const hy = Number(leaf.dataset.y);
    // Deterministic per leaf: periods 25–45s, phases spread round the circle.
    const seed = (i * 7 + j * 13) % 20;
    return {
      el: leaf, line: lines[j], hx, hy, x: hx, y: hy, w: leaf.offsetWidth, h: leaf.offsetHeight,
      fx: 25 + seed, fy: 45 - seed * 0.8, px: j * 2.1, py: j * 1.3 + i,
    };
  });
  return {
    el, nodes, rootW: root.offsetWidth, rootH: root.offsetHeight,
    halfW: el.offsetWidth / 2, halfH: el.offsetHeight / 2,
    t: 0, boost: 1, theta: 0, omega: 0, visible: false,
  };
}

export function initSkillDrift(tree: HTMLElement): void {
  const desktop = matchMedia("(min-width: 960px)");
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const g = groups.find((x) => x.el === e.target);
      if (g) g.visible = e.isIntersecting;
    }
    wake();
  });

  let bound: AbortController | undefined;
  const start = () => {
    if (!desktop.matches || groups.length) return;
    bound = new AbortController();
    tree.querySelectorAll<HTMLElement>("[data-skill-group]").forEach((el, i) => {
      const g = measure(el, i);
      groups.push(g);
      seen.observe(el);
      bindDrag(g, bound!.signal, { reduced, wake, settle });
    });
  };
  // Below 960px the scatter is display: none, so the inline positions are
  // cleared and the listeners dropped; crossing back re-measures from home.
  const stop = () => {
    seen.disconnect();
    bound?.abort();
    for (const g of groups.splice(0)) {
      for (const n of g.nodes) {
        n.el.style.transform = "";
        n.line.x2.baseVal.value = n.hx;
        n.line.y2.baseVal.value = n.hy;
      }
    }
  };

  start();
  desktop.addEventListener("change", () => (desktop.matches ? start() : stop()));
}
