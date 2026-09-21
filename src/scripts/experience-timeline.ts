// Experience track behaviour (PRD §5.11). Click and keyboard focus *commit*
// a clip: it becomes the pressed one and the monitor shows its frame. Hover
// only *previews* a frame, on fine pointers, and the track reverts to the
// committed clip on leave. No aria-live: each clip's accessible name and
// description already carry what the monitor shows.

export function initExperience(root: HTMLElement): void {
  const clips = [...root.querySelectorAll<HTMLButtonElement>("[data-clip]")];
  const frames = [...root.querySelectorAll<HTMLElement>("[data-frame]")];
  const track = root.querySelector<HTMLElement>("[data-track]");
  if (!track || clips.length === 0) return;

  // The server marks the first clip pressed, so no-JS and JS agree on load.
  let committed =
    clips.find((clip) => clip.getAttribute("aria-pressed") === "true")?.dataset.clip ??
    clips[0].dataset.clip ??
    "";

  const show = (id: string) => {
    for (const frame of frames) frame.toggleAttribute("data-active", frame.dataset.frame === id);
  };

  const commit = (id: string) => {
    committed = id;
    for (const clip of clips) clip.setAttribute("aria-pressed", String(clip.dataset.clip === id));
    show(id);
  };

  for (const clip of clips) {
    const id = clip.dataset.clip ?? "";
    // A pointer click also focuses the button in most browsers, so commit
    // runs twice there; it is idempotent, and Safari (no focus on click)
    // still gets the click path.
    clip.addEventListener("click", () => commit(id));
    clip.addEventListener("focus", () => commit(id));
  }

  // Scrub on hover only where a hover exists (CLAUDE.md §4): a touch pointer
  // would otherwise leave a stale preview after every tap.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    for (const clip of clips) {
      clip.addEventListener("mouseenter", () => show(clip.dataset.clip ?? ""));
    }
    track.addEventListener("mouseleave", () => show(committed));
  }
}
