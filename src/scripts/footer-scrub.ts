/**
 * Footer staged reveal (PRD §5.8), replacing increment 17's continuous
 * crawl. Two jobs, in its own file for the CLAUDE.md §5 cap:
 *
 * 1. Scroll-zone commit, reusing experience-scrub.ts's initScrub unmodified:
 *    absolute scrollY each frame (direction-free, reversible), one rAF per
 *    event, four equal zones (one per stage). commit(id) is the single
 *    state owner — toggles data-active on the matching stage, clears the
 *    rest, same shape as experience-timeline.ts's commit.
 * 2. Keyboard reveal, the increment-17 behaviour kept: focus a link in the
 *    sequence and the window jumps to the track's end, where it has settled
 *    on the contact stage. This is why FooterStage.astro hides an inactive
 *    stage with opacity rather than ExperienceFrame's `visibility: hidden`
 *    — visibility would drop the contact links out of the focus order for
 *    three of the four zones, and no focus event could ever fire on them.
 */
import { initScrub } from "./experience-scrub";

export function initFooterStages(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>("[data-credits-track]");
  const stack = root.querySelector<HTMLElement>("[data-credits-stack]");
  if (!track || !stack) return;

  const stages = [...stack.querySelectorAll<HTMLElement>("[data-credits-stage]")];
  if (stages.length === 0) return;

  const commit = (id: string) => {
    for (const stage of stages) stage.toggleAttribute("data-active", stage.dataset.creditsStage === id);
  };

  initScrub(
    track,
    stages.map((stage) => stage.dataset.creditsStage ?? ""),
    commit,
  );

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
