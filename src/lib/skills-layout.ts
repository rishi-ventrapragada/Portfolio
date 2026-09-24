/**
 * Build-time rest layout for the skills graph (PRD §5.6, increment 31): a
 * small seeded force-directed pass — repulsion (stronger between clusters
 * than within one), a spring on every link, label-box collision, a push
 * that keeps every link clear of every label it does not end at, and box
 * containment — run once in the build, so every visitor gets the same,
 * verified layout and the page ships no layout code.
 *
 * The reference box is the graph at its narrowest (960px viewport: 864px
 * wide, 720 tall). The page places x and y as percentages of a box that is
 * never smaller, and all type in px, so a larger box only spreads nodes
 * apart: what passes here passes at every size. Three checks throw, which
 * fails the build (skills-checks.ts): label boxes closer than 12px within a
 * cluster or 24px across clusters; any two links crossing; any link within
 * 12px of a label or dot it does not end at.
 */
import { ownCrossings, verify } from "./skills-checks";
import { hubs, ring, type Tone } from "./skills-data";
import { overlap, segBox } from "./skills-geometry";
import { labelBox, type Box, type Kind, type Side } from "./skills-metrics";

export const W = 864;
export const H = 720;
const GAP_IN = 12;
const GAP_OUT = 24;
const CLEAR = 12;
const PAD = 8;

export interface GraphNode {
  id: number;
  name: string;
  kind: Kind;
  tone: Tone;
  /** Index into `hubs` (the owner's order); -1 for the centre. Node ids
   * follow the ring instead, so the two differ. */
  hub: number;
  learning: boolean;
  x: number;
  y: number;
  /** A leaf's label runs right of its dot ("start") or left of it
   * ("end"); a hub's may also sit under or over it, whichever side its own
   * links leave free; the centre's is under it. */
  side: Side;
}

export interface GraphLink {
  a: number;
  b: number;
  learning: boolean;
}

const nodes: GraphNode[] = [];
const links: GraphLink[] = [];
const cx = W / 2;
const cy = H / 2;
nodes.push({ id: 0, name: "Skills", kind: "centre", tone: "heading", hub: -1, learning: false, x: cx, y: cy, side: "below" });

// Hubs on an ellipse, clockwise from the top; each fan spread evenly by
// angle, outward from the centre, in the owner's item order.
const home: [number, number][] = [[cx, cy]];
const hubNode = new Map<number, GraphNode>();
ring.forEach((name, slot) => {
  const h = hubs.findIndex((x) => x.name === name);
  const hub = hubs[h];
  const t = -Math.PI / 2 + (slot * 2 * Math.PI) / ring.length;
  const hx = cx + Math.cos(t) * W * 0.3;
  const hy = cy + Math.sin(t) * H * 0.3;
  const hubId = nodes.length;
  nodes.push({ id: hubId, name: hub.name, kind: "hub", tone: hub.tone, hub: h, learning: !!hub.learning, x: hx, y: hy, side: "below" });
  hubNode.set(h, nodes[hubId]);
  home.push([hx, hy]);
  links.push({ a: 0, b: hubId, learning: !!hub.learning });
  const n = hub.items.length;
  const stepA = Math.min(0.55, 2.9 / Math.max(1, n - 1));
  hub.items.forEach((item, i) => {
    const a = t + (i - (n - 1) / 2) * stepA;
    const id = nodes.length;
    nodes.push({ id, name: item, kind: "leaf", tone: hub.tone, hub: h, learning: !!hub.learning, x: hx + Math.cos(a) * 95, y: hy + Math.sin(a) * 95, side: "start" });
    home.push([hx, hy]);
    links.push({ a: hubId, b: id, learning: !!hub.learning });
  });
});

const hubOf = (n: GraphNode) => hubNode.get(n.hub)!;
const box = (n: GraphNode): Box => labelBox(n);
const same = (p: GraphNode, q: GraphNode) => p.hub === q.hub || p.kind === "centre" || q.kind === "centre";
// Stiffness per kind: the centre never moves, hubs barely, leaves freely.
const give = (n: GraphNode) => (n.kind === "centre" ? 0 : n.kind === "hub" ? 0.15 : 1);
const move = (n: GraphNode, dx: number, dy: number, f: number) => ((n.x += dx * f * give(n)), (n.y += dy * f * give(n)));

/** A hub's label goes where its own links are not: under it unless that
 * side is crossed, then over, then beside. */
const own = (n: GraphNode, side: Side) => ownCrossings(nodes, links, n, side);
const freeSide = (n: GraphNode): Side =>
  (["below", "above", "start", "end"] as Side[]).reduce((best, s) => (own(n, s) < own(n, best) ? s : best), "below");

const STEPS = 1400;
for (let step = 0; step < STEPS; step++) {
  const cool = 1 - step / STEPS;
  if (step < 500) for (const n of nodes) if (n.kind === "leaf") n.side = n.x >= hubOf(n).x ? "start" : "end";
  if (step % 100 === 50 && step < 900) for (const n of nodes) if (n.kind === "hub") n.side = freeSide(n);
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = n.x - nodes[j].x, dy = n.y - nodes[j].y;
      const d2 = Math.max(dx * dx + dy * dy, 100), d = Math.sqrt(d2);
      move(n, dx / d, dy / d, ((same(n, nodes[j]) ? 900 : 5000) / d2) * cool);
    }
    if (n.kind === "hub") {
      n.x += (home[i][0] - n.x) * 0.05;
      n.y += (home[i][1] - n.y) * 0.05;
      continue;
    }
    const hub = hubOf(n);
    const dx = n.x - hub.x, dy = n.y - hub.y, d = Math.hypot(dx, dy) || 1;
    const pull = ((d - 92) / d) * (0.03 * cool + 0.004);
    n.x -= dx * pull;
    n.y -= dy * pull;
    // Outward: a leaf stays on the far side of its hub from the centre.
    const ux = hub.x - cx, uy = hub.y - cy, ul = Math.hypot(ux, uy) || 1;
    const out = (dx * ux + dy * uy) / ul;
    if (out < 30) move(n, ux / ul, uy / ul, (30 - out) * 0.2);
  }
  // Label boxes apart: more room between clusters than within one.
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const [p, q] = [nodes[i], nodes[j]];
      const o = overlap(box(p), box(q), (same(p, q) ? GAP_IN : GAP_OUT) + 3);
      if (!o) continue;
      const sum = give(p) + give(q) || 1;
      const [ax, s] = o[0] < o[1] ? (["x", Math.sign(p.x - q.x || 1) * o[0]] as const) : (["y", Math.sign(p.y - q.y || 1) * o[1]] as const);
      p[ax] += (s * give(p)) / sum;
      q[ax] -= (s * give(q)) / sum;
    }
  }
  // Links clear of every label and dot they do not end at: the node steps
  // off the link and the link's leaf end swings the other way.
  for (const l of links) {
    const [a, b] = [nodes[l.a], nodes[l.b]];
    for (const n of nodes) {
      if (n === a || n === b) continue;
      const r = segBox(a, b, box(n));
      if (r.d >= CLEAR + 3) continue;
      let dx = r.at.x - r.on.x, dy = r.at.y - r.on.y;
      if (r.d === 0) [dx, dy] = [-(b.y - a.y), b.x - a.x];
      const len = Math.hypot(dx, dy) || 1, push = (CLEAR + 3 - r.d) * 0.3;
      move(n, dx / len, dy / len, push);
      move(b, -dx / len, -dy / len, push);
    }
  }
  for (const n of nodes) {
    const b = box(n);
    if (b.l < PAD) n.x += PAD - b.l;
    if (b.r > W - PAD) n.x -= b.r - (W - PAD);
    if (b.t < PAD) n.y += PAD - b.t;
    if (b.b > H - PAD) n.y -= b.b - (H - PAD);
  }
}

// The guarantees, asserted and counted (skills-checks.ts).
export const checks = verify(nodes, links, { W, H, gapIn: GAP_IN, gapOut: GAP_OUT, clear: CLEAR, same });
export { nodes, links };
