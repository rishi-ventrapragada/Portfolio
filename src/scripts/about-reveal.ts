/**
 * About comic panels: reveal on first sight (PRD §5.6, increment 23). Each
 * panel fades up the first time it enters the viewport and then stays — the
 * page reads as a story unfolding panel by panel under ordinary scroll. No
 * pinning, no scroll handler: one IntersectionObserver, and each panel is
 * unobserved the moment it has been revealed, so the work ends there.
 *
 * AboutPanel.astro owns the styles. The hidden start state is keyed off
 * [data-reveal], which only this script sets, so without JS every panel is
 * visible; under reduced motion the script never arms at all.
 */

/** Gap between panels that enter in the same frame, in ms. */
const STAGGER = 140;

export function initAboutReveal(page: HTMLElement): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const panels = [...page.querySelectorAll<HTMLElement>(".panel")];
  if (panels.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      // Document order, so panels that arrive together reveal left to
      // right, top to bottom — reading order.
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target as HTMLElement)
        .sort((a, b) => panels.indexOf(a) - panels.indexOf(b));

      entering.forEach((panel, i) => {
        panel.style.setProperty("--reveal-delay", `${i * STAGGER}ms`);
        panel.toggleAttribute("data-revealed", true);
        observer.unobserve(panel);
      });
    },
    // A fifth of the panel on screen: early enough that the fade is seen
    // arriving, late enough that it is not spent below the fold.
    { threshold: 0.2 },
  );

  page.toggleAttribute("data-reveal", true);
  for (const panel of panels) observer.observe(panel);
}
