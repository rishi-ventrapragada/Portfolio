/**
 * The video-editing constellation's fixed geometry (PRD §5.6), split out of
 * SkillConstellation.astro for the CLAUDE.md §5 line cap. Content is the
 * owner's, verbatim, with no sub-grouping.
 */

export interface Star {
  name: string;
  /** Percent of the box, also the SVG viewBox unit. */
  x: number;
  y: number;
  /** Dot diameter in px: a little size variety, never cramping the name. */
  d: 8 | 10 | 14;
}

/**
 * Nine distinct y bands about 11% apart: in the portrait phone box no two
 * names can share a row, and a name sits on the side of its star that has the
 * room (left of the star past the midline), so nothing ever overlaps or
 * leaves the box at 375px.
 */
export const stars: Star[] = [
  { name: "Videography", x: 14, y: 9, d: 10 },
  { name: "After Effects", x: 58, y: 17, d: 10 },
  { name: "Premiere", x: 32, y: 28, d: 14 },
  { name: "Motion Design", x: 82, y: 39, d: 10 },
  { name: "DaVinci Resolve", x: 24, y: 50, d: 14 },
  { name: "Canva", x: 90, y: 61, d: 8 },
  { name: "Color Grading", x: 46, y: 72, d: 10 },
  { name: "CapCut", x: 12, y: 83, d: 8 },
  { name: "Audio Mixing", x: 68, y: 91, d: 10 },
];

/**
 * A spanning path through all nine (eight lines) plus two that close the
 * figure, so it reads as one shape without becoming a mesh.
 */
const edges: [string, string][] = [
  ["Videography", "Premiere"],
  ["Premiere", "After Effects"],
  ["After Effects", "Motion Design"],
  ["Premiere", "DaVinci Resolve"],
  ["DaVinci Resolve", "Color Grading"],
  ["DaVinci Resolve", "CapCut"],
  ["Color Grading", "Audio Mixing"],
  ["Motion Design", "Canva"],
  ["Canva", "Audio Mixing"],
  ["Color Grading", "Motion Design"],
];

const byName = new Map(stars.map((s) => [s.name, s]));

/** Edge endpoints resolved to coordinates, for the SVG. */
export const lines = edges.map(([a, b]) => [byName.get(a)!, byName.get(b)!] as const);

/** Decorative background sky: dim specks, never near a name, aria-hidden. */
export const specks: [number, number, number][] = [
  [5, 30, 2], [20, 14, 3], [38, 8, 2], [50, 40, 3], [66, 6, 2], [74, 20, 3],
  [95, 12, 2], [60, 30, 2], [8, 62, 3], [30, 88, 2], [56, 56, 2], [78, 80, 3],
  [96, 88, 2], [40, 96, 3],
];
