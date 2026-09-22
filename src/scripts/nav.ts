/**
 * Nav behaviour (PRD §5.1). Imported by Nav.astro, which owns the markup and
 * styles. Split out in increment 13 for the CLAUDE.md §5 cap, like
 * hero-dissolve.ts.
 */

/**
 * Adds .is-scrolled once the hero's bottom edge reaches the bar's bottom edge
 * (PRD §4.4), and [data-past-hero] once it has passed the top of the viewport
 * (PRD §5.1 — the progress bar is hidden over the hero). Both come off the
 * hero's real box.
 *
 * The two used to share one trigger at y = 0, which left the bar transparent
 * — white links, no ground — over the top of the light About section for the
 * last 64px of the hero (increment 23). Solid from the bar's own bottom edge,
 * nothing light ever shows through it.
 */
function watchHero(nav: HTMLElement): void {
  // Module scope is fine here: there is no client router swapping the DOM
  // out from under it, so the observers are bound once and stay bound.
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;

  // A zero-height strip at the hero's bottom edge crossing the top of the
  // viewport.
  new IntersectionObserver(([entry]) => nav.toggleAttribute("data-past-hero", !entry.isIntersecting), {
    rootMargin: "0px 0px -100% 0px",
  }).observe(hero);

  // The same strip one bar-height lower. rootMargin takes no calc(), so the
  // pixel margins are rebuilt when the viewport height changes (mobile
  // browser chrome collapsing does this).
  let solid: IntersectionObserver | undefined;
  let boundHeight = -1;
  const bind = () => {
    if (innerHeight === boundHeight) return;
    boundHeight = innerHeight;
    solid?.disconnect();
    const bar = nav.offsetHeight;
    solid = new IntersectionObserver(([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting), {
      rootMargin: `-${bar}px 0px -${Math.max(innerHeight - bar, 0)}px 0px`,
    });
    solid.observe(hero);
  };
  bind();
  addEventListener("resize", () => requestAnimationFrame(bind), { passive: true });
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
