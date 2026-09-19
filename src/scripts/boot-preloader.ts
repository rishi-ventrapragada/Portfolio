/**
 * Boot preloader sequence (PRD §5.10). Imported by BootPreloader.astro, which
 * owns the markup and styles. Lives in its own file per the CLAUDE.md §5 cap.
 */

/** Show a word by toggling the attributes the stylesheet keys off. */
function show(word: HTMLElement): void {
  word.removeAttribute("data-out");
  word.setAttribute("data-on", "");
}

/**
 * Run the greeting sequence over an already-rendered overlay.
 *
 * @param cycleMs how long the greeting line takes to cycle its whole word array.
 */
export function runBootSequence(cycleMs: number): void {
  // The synchronous script in BootPreloader.astro has already removed the
  // overlay for repeat visits and reduced motion, so a miss here means there is
  // nothing to animate.
  const root = document.querySelector<HTMLElement>("[data-boot]");
  if (!root) return;

  const remove = () => root.remove();

  try {
    sessionStorage.setItem("boot-seen", "1");
  } catch {
    /* Non-fatal: the sequence still runs, it may just replay next load. */
  }

  const timers: number[] = [];
  const wait = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const line = (n: number) => root.querySelector<HTMLElement>(`[data-line="${n}"]`);
  let done = false;

  /** Must match the line transition in BootPreloader.astro. */
  const lineMs = 450;

  const enter = (el: HTMLElement | null) => {
    el?.removeAttribute("data-out");
    el?.setAttribute("data-on", "");
  };

  const exit = (el: HTMLElement | null) => {
    el?.removeAttribute("data-on");
    el?.setAttribute("data-out", "");
  };

  /** Cycle one line's words at an even pace, then call `next`. */
  const cycle = (el: HTMLElement, next: () => void) => {
    const words = [...el.querySelectorAll<HTMLElement>(".cycler-word")];
    const each = cycleMs / words.length;
    let i = 0;

    const advance = () => {
      if (i + 1 >= words.length) {
        // Last word has had its full turn; hold the line as-is.
        next();
        return;
      }
      words[i].removeAttribute("data-on");
      words[i].setAttribute("data-out", "");
      i += 1;
      show(words[i]);
      wait(advance, each);
    };

    wait(advance, each);
  };

  /** Snap every line to its final state, fade out, and drop from the DOM. */
  const finish = () => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);

    root.querySelectorAll<HTMLElement>(".cycler").forEach((el) => {
      const words = [...el.querySelectorAll<HTMLElement>(".cycler-word")];
      words.forEach((w) => {
        w.removeAttribute("data-on");
        w.removeAttribute("data-out");
      });
      const last = words[words.length - 1];
      if (last) show(last);
    });
    // Skipping jumps to the final state: only the status line is on screen.
    root.querySelectorAll<HTMLElement>("[data-line]").forEach(exit);
    enter(line(2));

    root.setAttribute("data-out", "");
    root.addEventListener("transitionend", remove, { once: true });
    // Belt and braces: remove even if the transition never fires.
    window.setTimeout(remove, 500);

    // Focus the top of the document now that the overlay is gone.
    document.body.focus({ preventScroll: true });
  };

  // Skippable at any time.
  const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
  events.forEach((ev) => window.addEventListener(ev, finish, { passive: true, once: true }));

  // The reveal waits on both a minimum dwell on line 3 and the page being ready.
  let dwellDone = false;
  let pageReady = document.readyState === "complete";
  const maybeReveal = () => {
    if (dwellDone && pageReady) finish();
  };
  if (!pageReady) {
    window.addEventListener(
      "load",
      () => {
        pageReady = true;
        maybeReveal();
      },
      { once: true }
    );
  }

  /** Longest we will wait on `load` after the dwell before revealing anyway. */
  const readyGraceMs = 3000;

  const showStatus = () => {
    enter(line(2));
    const dots = root.querySelector<HTMLElement>("[data-dots]");
    let n = 0;
    const tick = () => {
      n = (n % 3) + 1;
      if (dots) dots.textContent = ".".repeat(n);
      timers.push(window.setTimeout(tick, 400));
    };
    tick();
    wait(() => {
      dwellDone = true;
      maybeReveal();
      // A stalled asset must never strand the visitor behind the overlay.
      wait(finish, readyGraceMs);
    }, 1200);
  };

  const greeting = root.querySelector<HTMLElement>('[data-cycle="greeting"]');
  if (!greeting) {
    finish();
    return;
  }

  // Two beats: the greeting line cycles and exits, then the loading line
  // enters. Line 1 is already on from the markup, so the overlay is never
  // blank before JS runs.
  cycle(greeting, () => {
    exit(line(1));
    wait(showStatus, lineMs);
  });
}
