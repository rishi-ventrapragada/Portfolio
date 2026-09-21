/**
 * Reveal schedule for the boot preloader (PRD §5.10). Split out of
 * boot-preloader.ts for the CLAUDE.md §5 line cap.
 *
 * When each of the 24 steps may go on screen, as cumulative ms from the start
 * of the sequence. Fixed, not random: the same rhythm on every load keeps the
 * never-ahead-of-truth harness reproducible. The shape is fast climbs
 * punctuated by three deliberate holds — at step 6 (25%), 14 (58%) and 20
 * (83%) — echoing the jump / stall pattern of the reference footage.
 *
 * Only the paced reveal reads this. On a slow load the slots are already
 * behind when a checkpoint lands, and it shows the frame it happens.
 */

/** Cumulative time at which step `to` unlocks; linear between rows. */
const SEGMENTS = [
  { to: 6, at: 1080 }, // 0→6 fast, 180ms apart
  { to: 7, at: 1780 }, // hold ~700ms at 25%
  { to: 14, at: 3040 }, // 7→14 fast, 180ms apart
  { to: 15, at: 3840 }, // hold ~800ms at 58%
  { to: 20, at: 4830 }, // 15→20 fast, 198ms apart
  { to: 21, at: 5430 }, // hold ~600ms at 83%
  { to: 24, at: 6000 }, // 21→24 fast, 190ms apart
] as const;

const LAST = SEGMENTS[SEGMENTS.length - 1];

/** When step k's slot opens, with the table scaled to span `dwellMs`. */
export function slotAt(step: number, dwellMs: number): number {
  let from = 0;
  let fromAt = 0;
  for (const seg of SEGMENTS) {
    if (step <= seg.to) {
      const t = fromAt + ((seg.at - fromAt) * (step - from)) / (seg.to - from);
      return (t * dwellMs) / LAST.at;
    }
    from = seg.to;
    fromAt = seg.at;
  }
  return dwellMs;
}

/** Highest step whose slot has opened by `elapsed`. */
export function slotOpen(elapsed: number, dwellMs: number): number {
  let k = 0;
  while (k < LAST.to && slotAt(k + 1, dwellMs) <= elapsed) k++;
  return k;
}
