/**
 * Cell fill for the boot preloader square (PRD §5.10). Split out of
 * boot-preloader.ts for the CLAUDE.md §5 line cap.
 *
 * The square is an 8×8 grid; each step fills the first `cellsFor(step)` cells
 * of FILL_ORDER, so cells accumulate and never unfill. The order is fixed —
 * the same on every load — for the same reason the pause points and the
 * readiness table are: reproducible for the harness, inspectable in source.
 */

export const CELLS = 64;

/**
 * A permutation of 0..63 (row-major: index = row × 8 + column), generated
 * once offline by a Fisher–Yates shuffle over mulberry32 with seed 73 and
 * pasted in as a literal; nothing is shuffled at runtime. Seed 73 was chosen
 * because its first eight cells land in five rows, six columns and no more
 * than three per quadrant, so the fill reads scattered from the first step.
 */
export const FILL_ORDER = [
  5, 15, 8, 25, 46, 57, 43, 9, 37, 35, 14, 0, 22, 62, 41, 39,
  20, 1, 58, 24, 28, 49, 44, 10, 59, 60, 4, 42, 31, 50, 36, 29,
  32, 16, 26, 18, 38, 45, 33, 51, 34, 12, 48, 40, 7, 63, 54, 2,
  19, 30, 21, 23, 27, 56, 17, 53, 6, 13, 3, 52, 11, 61, 55, 47,
];

/** The readout's number for a step; the cell count is derived from it. */
export const percentFor = (step: number, steps: number) => Math.round((step / steps) * 100);

/** Cells filled at a step: 0, 3, 5, 8 … 61, 64 over 24 steps. */
export const cellsFor = (step: number, steps: number) =>
  Math.round((percentFor(step, steps) / 100) * CELLS);
