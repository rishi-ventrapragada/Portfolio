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
  centre: { size: 19, track: 0.12, line: 23, r: 15, gap: 7 },
  hub: { size: 14, track: 0.12, line: 18, r: 12, gap: 7 },
  leaf: { size: 15, track: 0.02, line: 19, r: 6.5, gap: 8 },
} as const;

/** What a node's label says: a hub's or the centre's name in capitals,
 * and past 14 characters on two lines, split at its first space
 * (increment 33 — at the larger type "CURRENTLY LEARNING" was 212px wide
 * and no side of its dot was clear of a link). */
export const labelLines = (kind: Kind, name: string): string[] => {
  if (kind === "leaf") return [name];
  const text = name.toUpperCase();
  return text.length > 14 && text.includes(" ") ? [text.slice(0, text.indexOf(" ")), text.slice(text.indexOf(" ") + 1)] : [text];
};

/** The widest line's width. */
export const labelWidth = (kind: Kind, text: string): number => {
  const t = TYPE[kind];
  return Math.max(...labelLines(kind, text).map((line) => line.length)) * t.size * (0.6 + t.track);
};

export type Side = "start" | "end" | "below" | "above";

/** The label's own box: beside the dot ("start" right of it, "end" left),
 * or centred under ("below") or over ("above") it. */
export function textBox(n: { kind: Kind; name: string; x: number; y: number; side: Side }): Box {
  const t = TYPE[n.kind];
  const w = labelWidth(n.kind, n.name);
  const h = labelLines(n.kind, n.name).length * t.line;
  const off = t.r + t.gap;
  if (n.side === "start") return { l: n.x + off, t: n.y - h / 2, r: n.x + off + w, b: n.y + h / 2 };
  if (n.side === "end") return { l: n.x - off - w, t: n.y - h / 2, r: n.x - off, b: n.y + h / 2 };
  const top = n.side === "below" ? n.y + off : n.y - off - h;
  return { l: n.x - w / 2, t: top, r: n.x + w / 2, b: top + h };
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
export function nodeStyle(n: { id: number; kind: Kind; tone: Tone; name: string }, left: string, top: string): string {
  const t = TYPE[n.kind];
  return [
    `left: ${left}`,
    `top: ${top}`,
    `--tone: ${toneVar(n.tone)}`,
    `--r: ${t.r}px`,
    `--gap: ${t.gap}px`,
    `--size: ${t.size}px`,
    `--track: ${t.track}em`,
    `--line-h: ${t.line}px`,
    `--lines: ${labelLines(n.kind, n.name).length}`,
    `--dur: ${(2.8 + ((n.id * 37) % 23) / 6).toFixed(2)}s`,
    `--delay: ${(-((n.id * 53) % 41) / 7).toFixed(2)}s`,
  ].join("; ");
}
