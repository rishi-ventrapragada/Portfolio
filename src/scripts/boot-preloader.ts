/**
 * Boot preloader sequence (PRD §5.10). Imported by BootPreloader.astro, which
 * owns the markup and styles. Lives in its own file per the CLAUDE.md §5 cap.
 *
 * Progress is read from the page's real load state rather than played off a
 * fixed clock, so the number the visitor sees means something.
 */

/**
 * Discrete levels the readout and the square move through. 24 puts 25 / 50 /
 * 75 % exactly on steps 6 / 12 / 18.
 */
const STEPS = 24;

/**
 * How far ahead of the core each outer layer is revealed, in percent of the
 * box per side. The ring leads the core by one width; the band leads the ring.
 */
const RING_LEAD = 4;
const BAND_LEAD = 8;

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
 * Quantise readiness to a step. Floor, not round: 0.99 must stay at 23, so
 * `load` (readiness 1) is the only thing that reaches the last step.
 */
const toStep = (r: number) => Math.floor(r * STEPS);

/**
 * Run the loading sequence over an already-rendered overlay.
 *
 * @param minDwellMs the window the steps are paced across. An instant load
 *   still walks every step rather than flashing to 100%.
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
  const core = root.querySelector<HTMLElement>("[data-core]");
  const ring = root.querySelector<HTMLElement>("[data-ring]");
  const band = root.querySelector<HTMLElement>("[data-band]");
  const start = performance.now();
  const slotMs = minDwellMs / STEPS;
  /** Highest step the page has genuinely reached. */
  let recorded = 0;
  /** Step currently on screen. Never exceeds `recorded`. */
  let displayed = 0;
  /** When the current step went on screen; 0% is on screen from the markup. */
  let lastPaint = start;
  let frame = 0;
  let done = false;

  /** Write one step to the readout and every layer together. */
  const paint = (step: number) => {
    displayed = step;
    lastPaint = performance.now();
    if (pct) pct.textContent = `${Math.round((step / STEPS) * 100)}%`;
    // One inset value clips all four sides equally, so growth is centre-out.
    const inset = (1 - step / STEPS) * 50;
    const clip = (n: number) => `inset(${Math.max(0, n)}%)`;
    if (core) core.style.clipPath = clip(inset);
    if (ring) ring.style.clipPath = clip(inset - RING_LEAD);
    if (band) band.style.clipPath = clip(inset - BAND_LEAD);
  };

  /**
   * Fade out and drop from the DOM — removed, not merely hidden.
   *
   * @param snap complete the square first. True on a skip (the visitor asked
   *   to move on) and on natural completion. False when the grace cap fires:
   *   the page is not fully loaded, so the readout must not say it is — it
   *   fades from wherever it genuinely stands.
   */
  const finish = (snap = true) => {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(cap);
    if (snap) paint(STEPS);

    const remove = () => root.remove();
    root.setAttribute("data-out", "");
    // The layers' clip-path transitions bubble up here too and would end the
    // fade after 180ms; only the overlay's own transition removes it.
    root.addEventListener("transitionend", (e) => {
      if (e.target === root) remove();
    });
    // Belt and braces: remove even if the transition never fires.
    window.setTimeout(remove, 500);

    // Focus the top of the document now that the overlay is gone.
    document.body.focus({ preventScroll: true });
  };

  // A stalled asset must never strand the visitor. Armed immediately.
  const cap = window.setTimeout(() => finish(false), graceMs);

  // Skippable at any time.
  const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
  events.forEach((ev) => window.addEventListener(ev, () => finish(), { passive: true, once: true }));

  /**
   * Paced reveal. Every frame records the highest step the page has genuinely
   * reached. Step k may go on screen once it has been reached AND its time
   * slot (k × dwell / STEPS) has opened. On an instant load that walks the
   * steps across the dwell; on a slow load the slots are already behind, so a
   * checkpoint shows the frame it lands — and a real jump shows as a jump.
   * Nothing is ever shown ahead of true readiness: the pacing only decides
   * when an already-true step is displayed.
   */
  const tick = () => {
    if (done) return;
    const elapsed = performance.now() - start;
    recorded = Math.max(recorded, toStep(readiness()));

    const slotOpen = Math.floor(elapsed / slotMs);
    const next = Math.min(recorded, slotOpen);
    // While the slots are what paces the climb, keep each step on screen for
    // most of a slot even if a long frame delayed the one before it — a hitch
    // must not collapse two steps into one flicker. Once the slots are all
    // behind, real checkpoints show the frame they land.
    const paced = slotOpen < recorded;
    if (next > displayed && (!paced || performance.now() - lastPaint >= slotMs * 0.75)) paint(next);

    if (displayed >= STEPS && elapsed >= minDwellMs) {
      finish();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
}
