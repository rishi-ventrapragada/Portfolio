/**
 * Credits roll (PRD §5.8). Imported by Footer.astro, which owns the markup
 * and styles. Two jobs, in its own file for the CLAUDE.md §5 cap:
 *
 * 1. Keyboard reveal, always on while the roll is pinned. A focused link
 *    inside a stuck sticky pin never scrolls into view on its own — the
 *    browser scrolls the window, the pin absorbs it and the link stays
 *    clipped below the fold. So keyboard focus (":focus-visible", never a
 *    mouse click) jumps the window to the track's end, where the sequence
 *    has settled and the links sit centred. Instant on purpose: the
 *    browser's own focus scroll is instant, and it runs after this handler,
 *    where it clamps to the same document end and changes nothing.
 * 2. Scroll fallback, only where scroll-driven CSS is unavailable (Firefox
 *    as of 152). Everywhere else the @supports block in Footer.astro drives
 *    the roll with no script. Same shape as experience-scrub.ts: absolute
 *    scrollY each frame (direction-free, reversible), one rAF per event,
 *    reads only, one style write (hero-dissolve.ts shape).
 */
export function initCreditsRoll(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>("[data-credits-track]");
  const roll = root.querySelector<HTMLElement>("[data-credits-roll]");
  if (!track || !roll) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  // Under reduced motion the CSS un-pins the section (static flow), so the
  // browser's own focus scroll is right and the jump must stay out of it.
  roll.addEventListener("focusin", (event) => {
    if (reduced.matches) return;
    const target = event.target as HTMLElement;
    if (!target.matches(":focus-visible")) return;
    const end = track.getBoundingClientRect().top + scrollY + track.offsetHeight - innerHeight;
    if (scrollY < end) scrollTo({ top: end, behavior: "instant" });
  });

  if (CSS.supports("animation-timeline: scroll()")) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    // Pinned distance = track height − the 100dvh pin.
    const distance = track.offsetHeight - innerHeight;
    if (distance <= 0) return;
    const top = track.getBoundingClientRect().top + scrollY;
    const progress = Math.min(Math.max((scrollY - top) / distance, 0), 1);
    roll.style.setProperty("--credits-progress", progress.toFixed(4));
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  const start = () => {
    roll.dataset.fallback = "on";
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
  };
  const stop = () => {
    delete roll.dataset.fallback;
    roll.style.removeProperty("--credits-progress");
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
  };

  if (!reduced.matches) start();
  reduced.addEventListener("change", (e) => (e.matches ? stop() : start()));
}
