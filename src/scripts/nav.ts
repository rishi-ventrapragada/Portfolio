/**
 * Nav behaviour (PRD §5.1). Imported by Nav.astro, which owns the markup and
 * styles. Split out in increment 13 for the CLAUDE.md §5 cap, like
 * hero-dissolve.ts.
 */

/** Adds .is-scrolled once the hero is behind the bar (PRD §4.4). */
function watchHero(nav: HTMLElement): void {
  // Module scope is fine here: there is no client router swapping the DOM
  // out from under it, so the observer is bound once and stays bound.
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:100dvh;height:1px;width:1px;";
  document.body.prepend(sentinel);

  new IntersectionObserver(
    ([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting),
    { rootMargin: "0px" },
  ).observe(sentinel);
}

/**
 * Progress fill, script branch: only where scroll-driven CSS is unavailable
 * (Firefox as of 152). Same shape as the hero fallback — rAF-throttled, reads
 * only, one style write per frame. Everywhere else the @supports block in
 * Nav.astro drives the fill with no script at all.
 */
function runProgressFallback(fill: HTMLElement): void {
  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    fill.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
}

export function initNav(): void {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (nav) watchHero(nav);

  if (!CSS.supports("animation-timeline: scroll()")) {
    const fill = document.querySelector<HTMLElement>("[data-progress-fill]");
    if (fill) runProgressFallback(fill);
  }
}
