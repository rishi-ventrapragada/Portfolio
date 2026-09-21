/**
 * Boot preloader copy (PRD §5.10).
 *
 * Deliberately its own module: an .astro frontmatter export is not importable,
 * so keeping the strings here is what makes a copy change a single-place edit.
 */

/**
 * One line per stage of the 24-step sequence, keyed by the first step it
 * covers: 0–7, 8–17, 18–24. Final copy, not a placeholder.
 */
export const STATUS_STAGES = [
  { from: 0, text: "Rendering first impressions" },
  { from: 8, text: "Cutting the unnecessary parts" },
  { from: 18, text: "Final cut. No re-shoots." },
] as const;

/** The line for a step. Stages are in ascending order, so the last match wins. */
export function statusFor(step: number): string {
  let text: string = STATUS_STAGES[0].text;
  for (const stage of STATUS_STAGES) if (step >= stage.from) text = stage.text;
  return text;
}
