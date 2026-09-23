// Experience timeline behaviour (PRD §5.11). Scroll through the pinned
// section (experience-scrub.ts), a click or keyboard focus all *commit* a
// clip through the one `commit` below: it becomes the pressed one and the
// monitor shows its frame. Hover only *previews* a frame, on fine pointers,
// and the track reverts to the committed clip on leave. The playhead follows
// whatever the monitor shows. No aria-live: each clip's accessible name and
// description already carry what the monitor shows.
//
// On a narrow screen the lane is wider than the viewport (four clips never
// shrink below --lane-min), so a commit also pages the timeline sideways to
// keep the committed clip — and the playhead on it — in view, the way an
// editor's timeline follows its playhead (increment 28; at 375px KalaCart and
// Recurzn used to commit off-screen). A hover preview never pages it.
import { initPlayhead } from "./experience-playhead";
import { initScrub } from "./experience-scrub";

export function initExperience(root: HTMLElement): void {
  const clips = [...root.querySelectorAll<HTMLButtonElement>("[data-clip]")];
  const frames = [...root.querySelectorAll<HTMLElement>("[data-frame]")];
  const track = root.querySelector<HTMLElement>("[data-track]");
  if (!track || clips.length === 0) return;
  const movePlayhead = initPlayhead(root);
  const scroller = root.querySelector<HTMLElement>("[data-timeline]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  // The server marks the first clip pressed, so no-JS and JS agree on load.
  let committed =
    clips.find((clip) => clip.getAttribute("aria-pressed") === "true")?.dataset.clip ??
    clips[0].dataset.clip ??
    "";

  const show = (id: string) => {
    for (const frame of frames) frame.toggleAttribute("data-active", frame.dataset.frame === id);
    movePlayhead(clips.find((clip) => clip.dataset.clip === id));
  };

  const commit = (id: string) => {
    committed = id;
    for (const clip of clips) clip.setAttribute("aria-pressed", String(clip.dataset.clip === id));
    show(id);
    if (scroller) reveal(scroller, clips.find((clip) => clip.dataset.clip === id), reduced.matches);
  };

  for (const clip of clips) {
    const id = clip.dataset.clip ?? "";
    // A pointer click also focuses the button in most browsers, so commit
    // runs twice there; it is idempotent, and Safari (no focus on click)
    // still gets the click path.
    clip.addEventListener("click", () => commit(id));
    clip.addEventListener("focus", () => commit(id));
  }

  // Scroll drives the same commit; a click or focus still wins at once and
  // the next zone change takes over again.
  initScrub(
    root.querySelector<HTMLElement>("[data-scrub]") ?? root,
    clips.map((clip) => clip.dataset.clip ?? ""),
    commit,
  );

  // Scrub on hover only where a hover exists (CLAUDE.md §4): a touch pointer
  // would otherwise leave a stale preview after every tap.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    initHoverPreview(track, show, () => committed);
  }
}

// A preview needs a *real* cursor movement into the clip. Scrolling the page
// under a stationary cursor fires mouseenter (and, in some engines, a
// synthetic mousemove at the old coordinates) on whatever passes beneath it,
// which would look like the clips cycling on their own. So: no mouseenter;
// only a mousemove whose coordinates differ from the last one seen, and
// which lands inside the clip's current rect, previews that clip.
function initHoverPreview(track: HTMLElement, show: (id: string) => void, committed: () => string): void {
  let last: { x: number; y: number } | undefined;
  let previewing = "";

  track.addEventListener("mousemove", (event) => {
    const moved = last
      ? last.x !== event.clientX || last.y !== event.clientY
      : event.movementX !== 0 || event.movementY !== 0;
    last = { x: event.clientX, y: event.clientY };
    if (!moved) return;

    const clip = (event.target as Element).closest<HTMLElement>("[data-clip]");
    if (!clip) return;
    const rect = clip.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) return;

    const id = clip.dataset.clip ?? "";
    if (id === previewing) return;
    previewing = id;
    show(id);
  });

  track.addEventListener("mouseleave", () => {
    previewing = "";
    show(committed());
  });
}

// Scrolls the timeline the least distance that brings the clip fully into
// view, clear of the sticky V1 / A1 track header that covers the lane's
// left edge. Reads layout once, writes one scroll; a no-op where the lane
// already fits (768px and up).
function reveal(scroller: HTMLElement, clip: HTMLElement | undefined, instant: boolean): void {
  if (!clip || scroller.scrollWidth <= scroller.clientWidth) return;
  const box = scroller.getBoundingClientRect();
  const r = clip.getBoundingClientRect();
  const head = scroller.querySelector<HTMLElement>("[data-track]")?.previousElementSibling?.getBoundingClientRect().width ?? 0;
  const pad = 4;
  let left = scroller.scrollLeft;
  if (r.left < box.left + head + pad) left += r.left - (box.left + head + pad);
  else if (r.right > box.right - pad) left += r.right - (box.right - pad);
  if (left !== scroller.scrollLeft) scroller.scrollTo({ left, behavior: instant ? "instant" : "smooth" });
}
