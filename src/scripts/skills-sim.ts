/**
 * The skills graph's motion (PRD §5.6, increment 31): every node is a mass on
 * a spring to its build-time rest point (or, once drifting, to a slow
 * wandering target around it), links couple neighbours so a dragged node
 * pulls its cluster along, and the cursor pushes nearby nodes gently aside.
 * No layout happens here — the layout is the build's; this only perturbs it
 * and lets it settle. Split from skills-graph.ts (wiring) for the CLAUDE.md
 * §5 cap. One transform per node and four attributes per link per frame,
 * written only when a value moved.
 */

export interface Sim {
  nodes: HTMLElement[];
  lines: { el: SVGLineElement; a: number; b: number }[];
  /** Rest point, px in the graph box. */
  rx: Float64Array;
  ry: Float64Array;
  /** Offset from rest, px, and velocity, px per frame. */
  ox: Float64Array;
  oy: Float64Array;
  vx: Float64Array;
  vy: Float64Array;
  /** Last written offsets, to skip unchanged writes. */
  wx: Float64Array;
  wy: Float64Array;
  /** Drift: per-axis angular speed (rad/s) and phase. */
  sx: Float64Array;
  sy: Float64Array;
  ph: Float64Array;
}

export interface Input {
  /** Seconds since the drift began, or null when not drifting. */
  t: number | null;
  pointer: { x: number; y: number } | null;
  /** The node under the pointer: never pushed, so it stays hoverable. */
  hover: number;
  drag: { i: number; x: number; y: number } | null;
}

const SPRING = 0.05;
const LINK = 0.025;
const DAMP = 0.84;
const PUSH_R = 90;
const PUSH = 2.2;
const DRIFT = 4;

export function createSim(box: HTMLElement): Sim {
  const nodes = [...box.querySelectorAll<HTMLElement>(".node")];
  const lines = [...box.querySelectorAll<SVGLineElement>(".links line")].map((el) => ({ el, a: +el.dataset.a!, b: +el.dataset.b! }));
  const n = nodes.length;
  const f = () => new Float64Array(n);
  const sim: Sim = { nodes, lines, rx: f(), ry: f(), ox: f(), oy: f(), vx: f(), vy: f(), wx: f(), wy: f(), sx: f(), sy: f(), ph: f() };
  nodes.forEach((_, i) => {
    // Periods of 16–26s per axis, never in step with a neighbour.
    sim.sx[i] = (2 * Math.PI) / (16 + ((i * 7) % 11));
    sim.sy[i] = (2 * Math.PI) / (17 + ((i * 5) % 9));
    sim.ph[i] = (i * 2.399) % (2 * Math.PI);
  });
  setRest(sim, box.clientWidth, box.clientHeight);
  return sim;
}

/** Rest points for the box's current size: both axes were placed in percent. */
export function setRest(sim: Sim, width: number, height: number): void {
  sim.nodes.forEach((el, i) => {
    sim.rx[i] = (+el.dataset.x! / 100) * width;
    sim.ry[i] = (+el.dataset.y! / 100) * height;
  });
}

/** Where node i's drift wants it at time t (s); 0 when not drifting. */
const driftX = (sim: Sim, i: number, t: number | null) => (t === null ? 0 : DRIFT * Math.sin(t * sim.sx[i] + sim.ph[i]));
const driftY = (sim: Sim, i: number, t: number | null) => (t === null ? 0 : DRIFT * Math.cos(t * sim.sy[i] + sim.ph[i]));

/** How far the graph is from pure drift: the largest offset error plus
 * speed, px. Under ~0.3 the springs have nothing left to do. */
export function residual(sim: Sim, t: number | null): number {
  let r = 0;
  for (let i = 0; i < sim.ox.length; i++) {
    const e = Math.abs(sim.ox[i] - driftX(sim, i, t)) + Math.abs(sim.oy[i] - driftY(sim, i, t));
    r = Math.max(r, e + Math.abs(sim.vx[i]) + Math.abs(sim.vy[i]));
  }
  return r;
}

/** Pure drift: every node exactly on its drift target, no springs — so a
 * slow timer can draw it without the integrator ever seeing a large dt. */
export function driftTo(sim: Sim, t: number): void {
  for (let i = 0; i < sim.ox.length; i++) {
    sim.ox[i] = driftX(sim, i, t);
    sim.oy[i] = driftY(sim, i, t);
    sim.vx[i] = sim.vy[i] = 0;
  }
}

/** One frame (dt in 60fps frames). Returns whether anything is still moving. */
export function step(sim: Sim, input: Input, dt: number): boolean {
  const { ox, oy, vx, vy } = sim;
  const n = ox.length;
  const ax = new Float64Array(n);
  const ay = new Float64Array(n);
  let moving = !!input.pointer || !!input.drag;
  for (let i = 0; i < n; i++) {
    ax[i] += (driftX(sim, i, input.t) - ox[i]) * SPRING;
    ay[i] += (driftY(sim, i, input.t) - oy[i]) * SPRING;
    if (input.pointer && !input.drag && i !== input.hover) {
      const dx = sim.rx[i] + ox[i] - input.pointer.x;
      const dy = sim.ry[i] + oy[i] - input.pointer.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5 && d < PUSH_R) {
        const f = PUSH * (1 - d / PUSH_R) ** 2;
        ax[i] += (dx / d) * f * SPRING * 4;
        ay[i] += (dy / d) * f * SPRING * 4;
      }
    }
  }
  // Links keep neighbours' deviations from their drift together, so a
  // dragged node pulls its cluster, while pure drift stays an equilibrium.
  for (const { a, b } of sim.lines) {
    const dx = (ox[a] - driftX(sim, a, input.t) - ox[b] + driftX(sim, b, input.t)) * LINK;
    const dy = (oy[a] - driftY(sim, a, input.t) - oy[b] + driftY(sim, b, input.t)) * LINK;
    ax[a] -= dx;
    ay[a] -= dy;
    ax[b] += dx;
    ay[b] += dy;
  }
  const damp = DAMP ** dt;
  for (let i = 0; i < n; i++) {
    if (input.drag?.i === i) {
      ox[i] = input.drag.x - sim.rx[i];
      oy[i] = input.drag.y - sim.ry[i];
      vx[i] = vy[i] = 0;
      continue;
    }
    vx[i] = (vx[i] + ax[i] * dt) * damp;
    vy[i] = (vy[i] + ay[i] * dt) * damp;
    ox[i] += vx[i] * dt;
    oy[i] += vy[i] * dt;
  }
  return moving || residual(sim, input.t) > 0.1;
}

/** The node whose dot is nearest `p`, within `r` px, or -1. */
export function nearest(sim: Sim, p: { x: number; y: number }, r = 26): number {
  let best = -1;
  let bd = r;
  for (let i = 0; i < sim.ox.length; i++) {
    const d = Math.hypot(sim.rx[i] + sim.ox[i] - p.x, sim.ry[i] + sim.oy[i] - p.y);
    if (d < bd) [best, bd] = [i, d];
  }
  return best;
}

/** Drop every offset: back to rest at once (reduced motion, resize). */
export function reset(sim: Sim): void {
  sim.ox.fill(0);
  sim.oy.fill(0);
  sim.vx.fill(0);
  sim.vy.fill(0);
}

/** Write what moved: one transform per node, link ends in px. */
export function write(sim: Sim, force = false): void {
  let any = force;
  sim.nodes.forEach((el, i) => {
    if (!force && Math.abs(sim.ox[i] - sim.wx[i]) < 0.05 && Math.abs(sim.oy[i] - sim.wy[i]) < 0.05) return;
    sim.wx[i] = sim.ox[i];
    sim.wy[i] = sim.oy[i];
    el.style.transform = sim.ox[i] || sim.oy[i] ? `translate(${sim.ox[i].toFixed(2)}px, ${sim.oy[i].toFixed(2)}px)` : "";
    any = true;
  });
  if (!any) return;
  for (const { el, a, b } of sim.lines) {
    el.setAttribute("x1", (sim.rx[a] + sim.wx[a]).toFixed(1));
    el.setAttribute("y1", (sim.ry[a] + sim.wy[a]).toFixed(1));
    el.setAttribute("x2", (sim.rx[b] + sim.wx[b]).toFixed(1));
    el.setAttribute("y2", (sim.ry[b] + sim.wy[b]).toFixed(1));
  }
}
