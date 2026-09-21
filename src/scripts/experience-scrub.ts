// Scroll scrub for the Experience section (PRD §5.11). While the track is
// pinned, progress through its scroll distance picks the clip: four equal
// zones, one per clip. Only a zone *change* commits, and it commits through
// the same function click and keyboard use, so there is one path, not two.
// Reads only, one requestAnimationFrame per scroll event, absolute scrollY
// each frame so direction does not matter (the hero-dissolve.ts pattern).
// Listeners are live only while the track is on screen. `section` is the
// scroll track ([data-scrub]) — the heading above it is ordinary flow.

export function initScrub(section: HTMLElement, ids: readonly string[], commit: (id: string) => void): void {
  let zone = -1;
  let ticking = false;

  const update = () => {
    ticking = false;
    // Pinned distance = section height − the 100dvh pin. Zero without the
    // pin (the no-JS layout never runs this), so nothing to map.
    const distance = section.offsetHeight - innerHeight;
    if (distance <= 0) return;
    const top = section.getBoundingClientRect().top + scrollY;
    const progress = Math.min(Math.max((scrollY - top) / distance, 0), 1);
    const next = Math.min(ids.length - 1, Math.floor(progress * ids.length));
    if (next === zone) return;
    zone = next;
    commit(ids[next]);
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  const attach = () => {
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    schedule();
  };
  const detach = () => {
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
  };

  if (!("IntersectionObserver" in window)) {
    attach();
    return;
  }
  new IntersectionObserver((entries) => {
    for (const entry of entries) (entry.isIntersecting ? attach : detach)();
  }).observe(section);
}
