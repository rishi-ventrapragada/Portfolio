// The timeline playhead (PRD §5.11): a line the script slides to whatever
// clip the monitor is showing. Its x is measured from the rendered clip, not
// computed from an index, and re-measured whenever the rows resize (viewport
// change, font swap). The CSS transition does the 200ms glide; under reduced
// motion the stylesheet removes it.

export type MovePlayhead = (clip: HTMLElement | undefined) => void;

export function initPlayhead(root: HTMLElement): MovePlayhead {
  const head = root.querySelector<HTMLElement>("[data-playhead]");
  const rows = root.querySelector<HTMLElement>("[data-grid]");
  if (!head || !rows) return () => {};

  let target: HTMLElement | undefined;

  const place = () => {
    if (!target) return;
    // Both rects move together when the timeline scrolls sideways, so the
    // difference is the clip's offset inside the rows regardless of scroll.
    const x = target.getBoundingClientRect().left - rows.getBoundingClientRect().left;
    head.style.transform = `translateX(${x + 1}px)`;
  };

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(place);
    observer.observe(rows);
    const lane = root.querySelector<HTMLElement>("[data-track]");
    if (lane) observer.observe(lane);
  }

  return (clip) => {
    target = clip;
    place();
  };
}
