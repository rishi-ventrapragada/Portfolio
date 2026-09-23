/**
 * Magnetic hover (PRD §5.8, increment 25). A `[data-magnetic]` element leans
 * toward the cursor while a mouse is over it — a fraction of the cursor's
 * offset from its centre, capped — and springs back on leave. The script
 * only writes `transform`; the owning component (ContactCard.astro) holds
 * the two transitions: a short ease while following (`data-pulling`), a
 * springy overshoot on the way back.
 *
 * Gated three ways. `(pointer: fine)` and `pointerType === "mouse"`, so
 * touch and pen never trigger it. And off under `prefers-reduced-motion:
 * reduce`: the card does not go where the pointer goes (the skill-tree drag
 * exception) — it moves a fraction as far, then keeps moving on its own as
 * it springs back. That is motion triggered by interaction (WCAG 2.3.3),
 * and it is decoration. Both queries are re-read live; flipping either one
 * mid-hover drops the card straight back to rest.
 */

const PULL = 0.2;
const MAX = 6;

export function initMagnetic(): void {
  const fine = matchMedia("(pointer: fine)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const allowed = () => fine.matches && !reduce.matches;

  for (const el of document.querySelectorAll<HTMLElement>("[data-magnetic]")) {
    let x = 0;
    let y = 0;
    let frame = 0;

    const write = () => {
      frame = 0;
      el.style.transform = x || y ? `translate(${x}px, ${y}px)` : "";
    };

    const release = () => {
      x = 0;
      y = 0;
      delete el.dataset.pulling;
      if (frame) cancelAnimationFrame(frame);
      write();
    };

    el.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || !allowed()) return;
      // The box already carries the current lean; take it off to find the
      // resting centre, or the pull would feed on itself.
      const box = el.getBoundingClientRect();
      const dx = event.clientX - (box.left - x + box.width / 2);
      const dy = event.clientY - (box.top - y + box.height / 2);
      x = Math.max(-MAX, Math.min(MAX, dx * PULL));
      y = Math.max(-MAX, Math.min(MAX, dy * PULL));
      el.dataset.pulling = "";
      if (!frame) frame = requestAnimationFrame(write);
    });

    el.addEventListener("pointerleave", release);
    fine.addEventListener("change", release);
    reduce.addEventListener("change", release);
  }
}
