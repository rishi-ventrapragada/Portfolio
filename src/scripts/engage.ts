/**
 * Calls `go` once, on the first real engagement with `section`: a mouse
 * moving inside it, a tap that ends inside it (pointerup — a touch that
 * turns into a scroll is cancelled and never fires one), or focus moving
 * into it. A real movement, not pointerenter: scrolling the page under a
 * resting cursor fires enter (and a synthetic zero-movement move) on
 * whatever passes beneath it, the experience-timeline.ts lesson.
 * Used by skills-graph.ts (increment 31; the skill tree's and the
 * constellation's loops before it, increment 29): its drift waits for this.
 */
export function onEngage(section: HTMLElement, go: () => void): void {
  const ctrl = new AbortController();
  const fire = () => {
    ctrl.abort();
    go();
  };
  const opts = { signal: ctrl.signal, passive: true };
  section.addEventListener("pointermove", (e) => e.pointerType === "mouse" && (e.movementX || e.movementY) && fire(), opts);
  section.addEventListener("pointerup", fire, opts);
  section.addEventListener("focusin", fire, opts);
}
