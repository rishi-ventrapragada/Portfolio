/**
 * Hero wordmark dissolve, script branch (PRD §5.2). Imported by Wordmark.astro,
 * which owns the markup and styles. Lives in its own file per the CLAUDE.md §5
 * cap, like boot-preloader.ts.
 *
 * Runs only where scroll-driven CSS is unavailable (Firefox as of 152).
 * Everywhere else the @supports block in Wordmark.astro drives the dissolve
 * with no script at all. rAF-throttled, reads only, one style write per frame
 * (CLAUDE.md §4).
 */
export function runHeroDissolveFallback(): void {
  if (CSS.supports("animation-timeline: scroll()")) return;

  const wrap = document.querySelector<HTMLElement>("[data-wordmark]");
  if (!wrap) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  const update = () => {
    ticking = false;
    // The wrapper is 100dvh tall, so 40% of it is the CSS branch's 40dvh.
    const range = wrap.offsetHeight * 0.4;
    const progress = range > 0 ? Math.min(Math.max(window.scrollY / range, 0), 1) : 0;
    wrap.style.setProperty("--hero-progress", progress.toFixed(3));
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const start = () => {
    wrap.dataset.fallback = "on";
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
  };

  const stop = () => {
    delete wrap.dataset.fallback;
    wrap.style.removeProperty("--hero-progress");
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onScroll);
  };

  if (!reduced.matches) start();
  reduced.addEventListener("change", (e) => (e.matches ? stop() : start()));
}
