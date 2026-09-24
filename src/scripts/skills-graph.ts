/**
 * The skills graph's wiring (PRD §5.6, increment 31): which gates are open,
 * and one requestAnimationFrame loop that runs only while something moves.
 *
 * - From 960px the graph is on and the keyboard routes through the list
 *   (skills-keys.ts). Below that the list is the layout and nothing runs.
 * - A fine pointer adds the physics (skills-sim.ts): the cursor pushes
 *   nearby nodes aside, a node can be dragged and its cluster follows, all
 *   springing back to the build's rest layout.
 * - Hover or focus on a cluster lights it (data-hl / data-lit); pure
 *   colour, so it stays under reduced motion.
 * - Drift starts only on a first real interaction (engage.ts, the
 *   increment-29 rule) and the loop stops whenever the graph is off-screen
 *   (offscreen-pause.ts's "offscreenchange") or everything has settled — so
 *   before any interaction, and off-screen, it costs nothing.
 * - Reduced motion: no drift, push or spring. Drag stays — the node goes
 *   exactly where the hand puts it, direct manipulation rather than motion
 *   the page starts — and on release it is back at rest at once.
 */
import { onEngage } from "./engage";
import { initKeys } from "./skills-keys";
import { createSim, driftTo, nearest, reset, residual, setRest, step, write, type Input } from "./skills-sim";

export function initSkillsGraph(root: HTMLElement): void {
  const graph = root.querySelector<HTMLElement>("[data-skills-graph]");
  const list = root.querySelector<HTMLElement>("[data-skills-list]");
  if (!graph || !list) return;

  const wide = matchMedia("(min-width: 960px)");
  const fine = matchMedia("(pointer: fine)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const sim = createSim(graph);
  const nodeHub = sim.nodes.map((el) => +el.dataset.hub!);
  const input: Input = { t: null, pointer: null, hover: -1, drag: null };
  let engaged = false;
  let driftStart = 0;
  let running = false;
  let last = 0;
  /** Drawing pure drift on the slow timer (see frame). */
  let placing = false;

  // --- Highlight: a hub's cluster (hub, its skills, its links) ----------
  let lit = -2;
  const light = (hub: number | null) => {
    const h = hub ?? -2;
    if (h === lit) return;
    lit = h;
    graph.toggleAttribute("data-hl", h >= 0);
    sim.nodes.forEach((el, i) => el.toggleAttribute("data-lit", h >= 0 && nodeHub[i] === h));
    for (const { el } of sim.lines) el.toggleAttribute("data-lit", h >= 0 && +el.dataset.hub! === h);
  };

  // --- The loop ------------------------------------------------------------
  const physics = () => wide.matches && fine.matches && !reduce.matches;
  const frame = (now: number) => {
    if (graph.hasAttribute("data-offscreen") || !physics()) {
      running = false;
      return;
    }
    input.t = engaged ? (now - driftStart) / 1000 : null;
    // Drift alone moves ~1.3px/s, so 8fps steps are ~0.16px — invisible. It
    // is placed, not simulated, and waits on a timer rather than on rAF:
    // every requested frame is a full main-thread frame that re-ticks the
    // section's CSS animations (idling through rAF measured ~200 ms/s).
    // Once in, it stays in until a pointer or a drag stirs the springs.
    if (input.pointer || input.drag) placing = false;
    else if (input.t !== null && (placing || residual(sim, input.t) < 0.3)) placing = true;
    if (placing && input.t !== null) {
      driftTo(sim, input.t);
      write(sim);
      last = 0;
      setTimeout(() => requestAnimationFrame(frame), 125);
      return;
    }
    const dt = Math.min(3, (now - (last || now - 16.7)) / 16.7);
    last = now;
    const moving = step(sim, input, dt);
    write(sim);
    if (moving || input.t !== null) requestAnimationFrame(frame);
    else running = false;
  };
  const kick = () => {
    if (running || !physics() || graph.hasAttribute("data-offscreen")) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  };

  graph.addEventListener("offscreenchange", kick);
  onEngage(root, () => {
    engaged = true;
    driftStart = performance.now();
    kick();
  });

  // --- Pointer ---------------------------------------------------------------
  const local = (e: PointerEvent) => {
    const r = graph.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  // The node a pointer means: the one whose label it is on, else the dot
  // within 26px — a leaf's dot alone is a 5px target.
  const hit = (e: PointerEvent, p: { x: number; y: number }) => {
    const n = e.target instanceof Element ? e.target.closest<HTMLElement>(".node") : null;
    return n ? +n.dataset.node! : nearest(sim, p);
  };
  let grab = { x: 0, y: 0 };

  graph.addEventListener("pointermove", (e) => {
    if (!wide.matches || e.pointerType !== "mouse") return;
    const p = local(e);
    if (input.drag) {
      input.drag.x = p.x - grab.x;
      input.drag.y = p.y - grab.y;
      if (reduce.matches) {
        sim.ox[input.drag.i] = input.drag.x - sim.rx[input.drag.i];
        sim.oy[input.drag.i] = input.drag.y - sim.ry[input.drag.i];
        write(sim);
      }
    } else {
      input.hover = hit(e, p);
      light(input.hover < 0 ? null : nodeHub[input.hover]);
    }
    input.pointer = p;
    kick();
  });

  graph.addEventListener("pointerleave", () => {
    input.pointer = null;
    input.hover = -1;
    if (!input.drag) light(null);
    kick();
  });

  graph.addEventListener("pointerdown", (e) => {
    if (!wide.matches || !fine.matches || e.button !== 0) return;
    const p = local(e);
    const i = hit(e, p);
    if (i < 0) return;
    e.preventDefault();
    grab = { x: p.x - (sim.rx[i] + sim.ox[i]), y: p.y - (sim.ry[i] + sim.oy[i]) };
    input.drag = { i, x: p.x - grab.x, y: p.y - grab.y };
    graph.setPointerCapture(e.pointerId);
    graph.toggleAttribute("data-dragging", true);
    kick();
  });

  const release = () => {
    if (!input.drag) return;
    input.drag = null;
    graph.removeAttribute("data-dragging");
    if (reduce.matches) {
      reset(sim);
      write(sim, true);
    }
    kick();
  };
  graph.addEventListener("pointerup", release);
  graph.addEventListener("pointercancel", release);

  // --- Keyboard, resize, gates ---------------------------------------------
  // "nearest" scrolls only when the node would be off-screen; its
  // scroll-margin (SkillNode.astro) keeps it clear of the nav and the fold.
  const keys = initKeys(list, (id) => {
    sim.nodes.forEach((el, i) => el.toggleAttribute("data-focus", i === id));
    light(id === null || id === 0 ? null : nodeHub[id]);
    if (id !== null) sim.nodes[id].scrollIntoView({ block: "nearest", behavior: reduce.matches ? "instant" : "smooth" });
  });

  new ResizeObserver(() => {
    if (!wide.matches) return;
    setRest(sim, graph.clientWidth, graph.clientHeight);
    write(sim, true);
  }).observe(graph);

  const gate = () => {
    if (wide.matches) keys.enable();
    else keys.disable();
    if (reduce.matches) {
      reset(sim);
      write(sim, true);
    }
    kick();
  };
  for (const mq of [wide, fine, reduce]) mq.addEventListener("change", gate);
  gate();
}
