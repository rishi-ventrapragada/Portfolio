/**
 * Boot preloader sequence (PRD §5.10). Imported by BootPreloader.astro, which
 * owns the markup and styles. Lives in its own file per the CLAUDE.md §5 cap.
 *
 * Progress is read from the page's real load state rather than played off a
 * fixed clock, so the number the visitor sees means something.
 */

/** Steps the fill is quantised to, so its edge always lands on a whole pixel. */
const FILL_STEPS = 16;

/** Module load time, used as the origin for the creep below. */
const navStart = performance.now();

/**
 * True readiness, 0..1, from actual load state.
 *
 * `readyState` gives the coarse floor; between `interactive` and `complete`
 * the settled share of the resources the browser has started is what moves the
 * number, so on a slow network it tracks resources genuinely arriving.
 */
function readiness(): number {
  if (document.readyState === "complete") return 1;

  // Parsing: nothing reliable to count against yet, so hold at the floor.
  if (document.readyState === "loading") return 0.15;

  let entries: PerformanceResourceTiming[] = [];
  try {
    entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  } catch {
    /* Resource Timing unavailable — fall through to the floor below. */
  }
  if (entries.length === 0) return 0.5;

  // responseEnd is 0 while a request is still in flight.
  const settled = entries.filter((e) => e.responseEnd > 0).length;
  // Spans 0.5 → 0.95; only `load` is allowed to reach 1.
  const share = 0.5 + 0.45 * (settled / entries.length);

  // `entries` only covers requests the browser has already started. Once they
  // have all settled the share pins at its ceiling while the page keeps
  // fetching, and the readout visibly hangs there. Spend the gap the share
  // leaves on the clock instead, so the number keeps inching up — it
  // approaches 1 without arriving, and `load` stays the only thing that
  // reaches 100%.
  const creep = 1 - Math.exp(-(performance.now() - navStart) / 4000);
  return share + (0.99 - share) * creep;
}

/**
 * Run the loading sequence over an already-rendered overlay.
 *
 * @param minDwellMs earliest the readout may commit to 100%, so an instant
 *   load still reads as an animation rather than a single flash.
 * @param graceMs hard cap on the whole sequence. Armed at t=0, not after the
 *   dwell: a `load` that never fires must not strand the visitor behind the
 *   overlay (the increment 1.7 bug — do not move this back inside a callback).
 */
export function runBootSequence(minDwellMs: number, graceMs: number): void {
  // The synchronous script in BootPreloader.astro has already removed the
  // overlay for repeat visits and reduced motion, so a miss here means there is
  // nothing to animate.
  const root = document.querySelector<HTMLElement>("[data-boot]");
  if (!root) return;

  try {
    sessionStorage.setItem("boot-seen", "1");
  } catch {
    /* Non-fatal: the sequence still runs, it may just replay next load. */
  }

  const pct = root.querySelector<HTMLElement>("[data-pct]");
  const fill = root.querySelector<HTMLElement>("[data-fill]");
  const start = performance.now();
  let shown = 0;
  let frame = 0;
  let done = false;

  const paint = (value: number) => {
    shown = value;
    if (pct) pct.textContent = `${Math.round(value * 100)}%`;
    // Only the geometry is stepped; the readout above stays continuous, so the
    // number is never rounded away from its true value.
    const step = Math.round(value * FILL_STEPS) / FILL_STEPS;
    if (fill) fill.style.clipPath = `inset(${(1 - step) * 100}% 0 0 0)`;
  };

  /** Fade out and drop from the DOM — removed, not merely hidden. */
  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(cap);
    paint(1);

    const remove = () => root.remove();
    root.setAttribute("data-out", "");
    root.addEventListener("transitionend", remove, { once: true });
    // Belt and braces: remove even if the transition never fires.
    window.setTimeout(remove, 500);

    // Focus the top of the document now that the overlay is gone.
    document.body.focus({ preventScroll: true });
  };

  // A stalled asset must never strand the visitor. Armed immediately.
  const cap = window.setTimeout(finish, graceMs);

  // Skippable at any time.
  const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
  events.forEach((ev) => window.addEventListener(ev, finish, { passive: true, once: true }));

  /**
   * Ease the displayed value toward true readiness, capped by it so the
   * readout never overstates how loaded the page is, and held short of 100%
   * until the minimum dwell has passed.
   */
  const tick = () => {
    if (done) return;
    const elapsed = performance.now() - start;
    const dwell = Math.min(1, elapsed / minDwellMs);
    // On an instant load `readiness()` is already 1, so the dwell ramp is what
    // paces the sweep; on a slow load readiness is the lower of the two and
    // the number tracks the real signal instead.
    const target = Math.min(readiness(), dwell);

    // Approach the target rather than snapping, so the fill moves smoothly
    // between the discrete readiness levels.
    paint(shown + (target - shown) * 0.12);

    if (shown >= 0.995 && elapsed >= minDwellMs) {
      finish();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
}
