/**
 * Type and node sizes for the skills graph (PRD §5.6, increment 31), shared
 * by the build-time layout (skills-layout.ts), which needs every label's box
 * before a browser exists, and the renderer (SkillNode.astro), which
 * must draw exactly those boxes. Every label is JetBrains Mono, whose advance
 * is exactly 0.6em per character, so a label's width is arithmetic, not an
 * estimate: characters × (0.6em + letter-spacing).
 */

import { toneVar, type Tone } from "./skills-data";

export type Kind = "centre" | "hub" | "leaf";

export interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** px: font size, letter-spacing (em), line box height, dot radius (the
 * collision disc, not the glow), gap from dot to label. */
export const TYPE = {
  centre: { size: 16, track: 0.12, line: 20, r: 12, gap: 6 },
  hub: { size: 12, track: 0.12, line: 15, r: 9, gap: 6 },
  leaf: { size: 13, track: 0.02, line: 16, r: 5, gap: 7 },
} as const;

export const labelWidth = (kind: Kind, text: string): number => {
  const t = TYPE[kind];
  return text.length * t.size * (0.6 + t.track);
};

export type Side = "start" | "end" | "below" | "above";

/** The label's own box: beside the dot ("start" right of it, "end" left),
 * or centred under ("below") or over ("above") it. */
export function textBox(n: { kind: Kind; name: string; x: number; y: number; side: Side }): Box {
  const t = TYPE[n.kind];
  const w = labelWidth(n.kind, n.name);
  const off = t.r + t.gap;
  if (n.side === "start") return { l: n.x + off, t: n.y - t.line / 2, r: n.x + off + w, b: n.y + t.line / 2 };
  if (n.side === "end") return { l: n.x - off - w, t: n.y - t.line / 2, r: n.x - off, b: n.y + t.line / 2 };
  const top = n.side === "below" ? n.y + off : n.y - off - t.line;
  return { l: n.x - w / 2, t: top, r: n.x + w / 2, b: top + t.line };
}

/** The union of a node's dot and its label: what may not overlap. */
export function labelBox(n: { kind: Kind; name: string; x: number; y: number; side: Side }): Box {
  const t = TYPE[n.kind];
  const b = textBox(n);
  return { l: Math.min(b.l, n.x - t.r), t: Math.min(b.t, n.y - t.r), r: Math.max(b.r, n.x + t.r), b: Math.max(b.b, n.y + t.r) };
}

/** A node's inline style (SkillNode.astro): its place, its colour, these
 * sizes as custom properties, and an index-derived twinkle so neighbours
 * never pulse together. */
export function nodeStyle(n: { id: number; kind: Kind; tone: Tone }, left: string, top: string): string {
  const t = TYPE[n.kind];
  return [
    `left: ${left}`,
    `top: ${top}`,
    `--tone: ${toneVar(n.tone)}`,
    `--r: ${t.r}px`,
    `--gap: ${t.gap}px`,
    `--size: ${t.size}px`,
    `--track: ${t.track}em`,
    `--line: ${t.line}px`,
    `--dur: ${(2.8 + ((n.id * 37) % 23) / 6).toFixed(2)}s`,
    `--delay: ${(-((n.id * 53) % 41) / 7).toFixed(2)}s`,
  ].join("; ");
}
