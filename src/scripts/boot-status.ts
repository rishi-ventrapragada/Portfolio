/**
 * Status-line writer for the boot preloader (PRD §5.10). Split out of
 * boot-preloader.ts for the CLAUDE.md §5 line cap.
 *
 * The text is a pure function of the step that already drives the readout and
 * the square, so it can never name a stage the square has not reached. The
 * only timing here is the cross-fade, and only so two fades never overlap: a
 * stage crossed while a line is still fading waits for that fade to finish,
 * then gets a complete fade of its own to the latest stage wanted.
 */
import { statusFor } from "./boot-copy";

/** Half of the cross-fade: out, swap, in. Matches the CSS in BootPreloader.astro. */
export const STATUS_FADE_MS = 160;

export function createStatusWriter(el: HTMLElement | null): (step: number) => void {
  if (!el) return () => {};
  let shown = el.textContent?.trim() ?? "";
  let wanted = shown;
  let fading = false;

  const run = () => {
    if (fading || wanted === shown) return;
    fading = true;
    const target = wanted;
    el.setAttribute("data-fading", "");
    window.setTimeout(() => {
      shown = target;
      el.textContent = target;
      el.removeAttribute("data-fading");
      window.setTimeout(() => {
        fading = false;
        run(); // picks up any stage crossed while this fade ran
      }, STATUS_FADE_MS);
    }, STATUS_FADE_MS);
  };

  return (step) => {
    wanted = statusFor(step);
    run();
  };
}
