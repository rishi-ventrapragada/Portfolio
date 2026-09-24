/**
 * The skills graph's guarantees (PRD §5.6, increment 31), asserted once the
 * build-time layout has settled. Split from skills-layout.ts for the
 * CLAUDE.md §5 cap (increment 32). Throws — failing the build — on any
 * label box outside the reference box, label boxes closer than the gap (a
 * wider one across clusters), any two links crossing, or any link within
 * `clear` of a label or dot it does not end at; returns what it verified.
 */
import { crosses, overlap, segBox } from "./skills-geometry";
import type { GraphLink, GraphNode } from "./skills-layout";
import { labelBox, textBox, type Side } from "./skills-metrics";

export interface Rules {
  W: number;
  H: number;
  gapIn: number;
  gapOut: number;
  clear: number;
  /** Same cluster (or either is the centre): the smaller gap applies. */
  same: (p: GraphNode, q: GraphNode) => boolean;
}

/** Links that run through a node's own label (they all end at its dot). */
export const ownCrossings = (nodes: GraphNode[], links: GraphLink[], n: GraphNode, side: Side): number => {
  const tb = textBox({ ...n, side });
  return links.filter((l) => (l.a === n.id || l.b === n.id) && segBox(nodes[l.a], nodes[l.b], tb).d < 3).length;
};

export function verify(nodes: GraphNode[], links: GraphLink[], r: Rules) {
  const problems: string[] = [];
  let crossings = 0;
  let nearLabels = 0;
  for (let i = 0; i < nodes.length; i++) {
    const b = labelBox(nodes[i]);
    if (b.l < 0 || b.t < 0 || b.r > r.W || b.b > r.H) problems.push(`${nodes[i].name} leaves the box`);
    for (let j = i + 1; j < nodes.length; j++) {
      const gap = r.same(nodes[i], nodes[j]) ? r.gapIn : r.gapOut;
      if (overlap(b, labelBox(nodes[j]), gap)) problems.push(`${nodes[i].name} / ${nodes[j].name} closer than ${gap}px`);
    }
  }
  links.forEach((l, i) => {
    const [a, b] = [nodes[l.a], nodes[l.b]];
    for (const m of links.slice(i + 1)) {
      if ([m.a, m.b].some((e) => e === l.a || e === l.b)) continue;
      if (crosses(a, b, nodes[m.a], nodes[m.b])) (crossings++, problems.push(`${b.name} link crosses ${nodes[m.b].name} link`));
    }
    for (const n of nodes) {
      if (n === a || n === b || segBox(a, b, labelBox(n)).d >= r.clear) continue;
      nearLabels++;
      problems.push(`${b.name} link within ${r.clear}px of ${n.name}`);
    }
  });
  if (problems.length) throw new Error(`skills-layout: ${problems.length} problems — ${problems.join("; ")}`);

  // All zero, or it would not have built; plus how many links run through
  // their own hub's label (reported, not asserted: the centre's eight
  // spokes cannot all miss its label).
  return {
    overlaps: 0,
    crossings,
    nearLabels,
    ownLabelCrossings: nodes.filter((n) => n.kind !== "leaf").map((n) => [n.name, ownCrossings(nodes, links, n, n.side)] as const),
  };
}
