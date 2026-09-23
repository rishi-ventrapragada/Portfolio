/**
 * Footer credits sequence (PRD §5.8). Two jobs, in its own file for the
 * CLAUDE.md §5 cap:
 *
 * 1. Scroll-zone commit, reusing experience-scrub.ts's initScrub unmodified:
 *    absolute scrollY each frame (direction-free, reversible), one rAF per
 *    event, equal zones — a blank one first, one per credit line, one for
 *    the contact screen (increment 30: six credit stages, blank to name;
 *    the name's zone is also the hold on the assembled block). commit(id)
 *    is the single state owner. Since increment 23 the lines ACCUMULATE:
 *    each zone adds its line and keeps the ones before it, so the credits
 *    build into one block rather than replacing each other; scrolling back
 *    up takes them away again in reverse.
 * 2. Keyboard reveal, the increment-17 behaviour kept: focus a link in the
 *    sequence and the window jumps to the track's end, where it has settled
 *    on the contact stage. This is why FooterStage.astro hides an inactive
 *    stage with opacity rather than ExperienceFrame's `visibility: hidden`
 *    — visibility would drop the contact links out of the focus order for
 *    every zone but the last, and no focus event could ever fire on them.
 */
import { initScrub } from "./experience-scrub";

export function initFooterStages(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>("[data-credits-track]");
  const stack = root.querySelector<HTMLElement>("[data-credits-stack]");
  if (!track || !stack) return;

  const stages = [...stack.querySelectorAll<HTMLElement>("[data-credits-stage]")];
  const lines = [...stack.querySelectorAll<HTMLElement>("[data-credit-line]")];
  if (stages.length === 0) return;

  const zones = ["blank", ...lines.map((_, i) => `line-${i}`), "contact"];

  const commit = (id: string) => {
    // Zone 0 is blank; zone n shows lines 0..n-1. The contact zone leaves
    // every line shown, so going back up from it lands on the whole block.
    const zone = zones.indexOf(id);
    lines.forEach((line, i) => line.toggleAttribute("data-shown", i < zone));
    const stage = id === "contact" ? "contact" : "credits";
    for (const s of stages) s.toggleAttribute("data-active", s.dataset.creditsStage === stage);
  };

  initScrub(track, zones, commit);

  // A focused link inside a stuck sticky pin never scrolls into view on its
  // own — the browser scrolls the window, the pin absorbs it and the link
  // stays clipped. So keyboard focus (":focus-visible", never a mouse click)
  // jumps the window to the track's end, where the sequence has settled on
  // the contact stage and its links sit centred. This works because the
  // stages hide with opacity, not visibility: the links stay focusable
  // throughout, so the event fires from any zone. The pin stays under
  // reduced motion (a zone change is discrete state, not parallax — the
  // §5.11 rationale), so the jump is needed there too.
  stack.addEventListener("focusin", (event) => {
    const target = event.target as HTMLElement;
    if (!target.matches(":focus-visible")) return;
    const end = track.getBoundingClientRect().top + scrollY + track.offsetHeight - innerHeight;
    if (scrollY < end) scrollTo({ top: end, behavior: "instant" });
  });
}
