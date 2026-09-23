/**
 * Off-screen pause for the site's decorative CSS loops (increment 28). Every
 * element marked [data-offscreen-pause] — each Starfield sky, each
 * LoopDivider seam and the About grade grid — gets [data-offscreen] while it
 * is out of the viewport, and BaseLayout.astro's rule pauses every animation
 * on it and inside it. One IntersectionObserver, both directions: above or
 * below the viewport, it pauses; back in view (with a 100px lead so nothing
 * is caught frozen as it scrolls in), it resumes where it stopped.
 *
 * Measured before this: 668–959ms of main-thread work per second parked on
 * Projects or Contact, where nothing on screen moves — the five skies' star
 * twinkles running out of sight. The JS loops (skill-drift.ts,
 * constellation-motion.ts) already stop off-screen on their own observers.
 *
 * Without JS or IntersectionObserver nothing is marked and everything runs,
 * which is how it behaved before.
 */
export function initOffscreenPause(): void {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
    },
    { rootMargin: "100px 0px" },
  );
  for (const el of document.querySelectorAll("[data-offscreen-pause]")) observer.observe(el);
}
