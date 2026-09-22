/**
 * Footer credits sequence (PRD §5.8). Two jobs, in its own file for the
 * CLAUDE.md §5 cap:
 *
 * 1. Scroll-zone commit, reusing experience-scrub.ts's initScrub unmodified:
 *    absolute scrollY each frame (direction-free, reversible), one rAF per
 *    event, equal zones — one per credit line, one hold on the assembled
 *    block, one for the contact screen. commit(id) is the single state
 *    owner. Since increment 23 the lines ACCUMULATE: zone n shows lines
 *    0..n and keeps them, so the credits build into one block rather than
 *    replacing each other; scrolling back up takes them away again in
 *    reverse.
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

  const zones = [...lines.map((_, i) => `line-${i}`), "hold", "contact"];

  const commit = (id: string) => {
    const zone = zones.indexOf(id);
    // The hold and the contact zone both leave every line shown, so going
    // back up from the contact screen lands on the complete block.
    lines.forEach((line, i) => line.toggleAttribute("data-shown", i <= zone));
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
