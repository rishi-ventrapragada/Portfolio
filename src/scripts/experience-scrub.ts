// Scroll scrub for the Experience section (PRD §5.11). While the track is
// pinned, progress through its scroll distance picks the clip: four equal
// zones, one per clip. Only a zone *change* commits, and it commits through
// the same function click and keyboard use, so there is one path, not two.
// Reads only, one requestAnimationFrame per scroll event, absolute scrollY
// each frame so direction does not matter (the hero-dissolve.ts pattern).
// Listeners are live only while the track is on screen. `section` is the
// scroll track ([data-scrub]); since increment 30 the heading is inside it.
// `pin` is its sticky child: on a short screen the section's CSS un-pins it
// into the static layout (increment 32), and a static section is read in
// flow, so scrolling must not change what it shows. `before` (increment
// 34, the footer's): an id to commit while the track has not yet reached
// the top of the viewport — the pin is not engaged, so the first zone is
// not either. Without it that stretch clamps to the first zone.
export const isPinned = (pin: HTMLElement | null): boolean => !pin || getComputedStyle(pin).position === "sticky";

export function initScrub(
  section: HTMLElement,
  ids: readonly string[],
  commit: (id: string) => void,
  pin: HTMLElement | null = null,
  before?: string,
): void {
  let zone = -1;
  let ticking = false;

  const update = () => {
    ticking = false;
    // Forget the zone while static, so re-pinning (a rotation, a zoom
    // change) commits wherever the scroll then is.
    if (!isPinned(pin)) {
      zone = -1;
      return;
    }
    // Pinned distance = section height − the 100dvh pin.
    const distance = section.offsetHeight - innerHeight;
    if (distance <= 0) return;
    const top = section.getBoundingClientRect().top + scrollY;
    const raw = (scrollY - top) / distance;
    // -2: the "before" state, distinct from -1 (nothing committed yet).
    const next = before !== undefined && raw < 0 ? -2 : Math.min(ids.length - 1, Math.floor(Math.min(Math.max(raw, 0), 1) * ids.length));
    if (next === zone) return;
    zone = next;
    commit(next === -2 ? (before as string) : ids[next]);
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
