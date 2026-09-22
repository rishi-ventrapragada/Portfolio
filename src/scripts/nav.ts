/**
 * Nav behaviour (PRD §5.1). Imported by Nav.astro, which owns the markup and
 * styles. Split out in increment 13 for the CLAUDE.md §5 cap, like
 * hero-dissolve.ts.
 */

/**
 * Adds .is-scrolled once the hero is behind the bar (PRD §4.4), and
 * [data-past-hero] once its bottom edge has passed (PRD §5.1 — the progress
 * bar is hidden over the hero). Both come off the hero's real box: the
 * sentinel this used to prepend sat at a hardcoded 100dvh, which only
 * happened to match because the hero is one viewport tall.
 */
function watchHero(nav: HTMLElement): void {
  // Module scope is fine here: there is no client router swapping the DOM
  // out from under it, so the observer is bound once and stays bound.
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;

  new IntersectionObserver(
    ([entry]) => {
      const past = !entry.isIntersecting;
      nav.classList.toggle("is-scrolled", past);
      nav.toggleAttribute("data-past-hero", past);
    },
    // A zero-height strip at the hero's bottom edge: it stops intersecting
    // the moment that edge leaves the top of the viewport.
    { rootMargin: "0px 0px -100% 0px" },
  ).observe(hero);
}

/**
 * Progress fill, script branch: only where scroll-driven CSS is unavailable
 * (Firefox as of 152). Same shape as the hero fallback — rAF-throttled, reads
 * only, one style write per frame. Everywhere else the @supports block in
 * Nav.astro drives the fill with no script at all.
 */
function runProgressFallback(fill: HTMLElement): void {
  let ticking = false;
  const hero = document.querySelector<HTMLElement>("[data-hero]");

  const update = () => {
    ticking = false;
    // Same range as the CSS branch: from the hero's bottom edge, not 0.
    // Re-read each frame, not cached: 100dvh changes as mobile browser
    // chrome collapses, and offsetHeight is a cheap read.
    const start = hero?.offsetHeight ?? 0;
    const max = document.documentElement.scrollHeight - window.innerHeight - start;
    const progress = max > 0 ? Math.min(Math.max((window.scrollY - start) / max, 0), 1) : 0;
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
