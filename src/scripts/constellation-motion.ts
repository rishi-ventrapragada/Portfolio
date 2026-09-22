/**
 * Constellation motion (PRD §5.6, increment 23). The figure turns slowly
 * about its own centroid and drifts a little, as one rigid shape: each star
 * is moved by a transform and each line's ends are rewritten to match, so
 * the two can never come apart. The names ride with their stars but stay
 * upright.
 *
 * It also routes the lines around the names: one black rect per name in the
 * SVG mask, kept under its label every frame, so no line is ever drawn under
 * the letters. That part runs under reduced motion too (once, and on
 * resize) — it is layout, not movement.
 *
 * The rotation is done in px, not in the box's percentages: the box is not
 * square, so turning percentage coordinates would shear the figure. The turn
 * limit per layout arrives as data attributes from lib/constellation-labels.ts
 * so the build-time solver itself never ships.
 *
 * Moves only while the box is on screen. Reduced motion: never moves; the
 * build-time positions are the rest frame.
 */

const TURN_PERIOD = 40; // s, one full sway of the rotation
const DRIFT_X = 12; // px
const DRIFT_Y = 8;
const CUT_PAD = 2; // px of clear line around each name

export function initConstellation(box: HTMLElement): void {
  const wide = matchMedia("(min-width: 768px)");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stars = [...box.querySelectorAll<HTMLElement>(".star")];
  const names = stars.map((s) => s.querySelector<HTMLElement>(".name")!);
  const home = stars.map((s) => [Number(s.dataset.x), Number(s.dataset.y)]);
  const lines = [...box.querySelectorAll<SVGLineElement>(".lines line")].map((l) => ({
    el: l,
    a: Number(l.dataset.a),
    b: Number(l.dataset.b),
  }));
  const cuts = [...box.querySelectorAll<SVGRectElement>(".cut")];
  const specks = box.querySelector<HTMLElement>(".specks");
  // The centroid in percentage space maps to the centroid in px at any size.
  const cx = home.reduce((n, p) => n + p[0], 0) / home.length;
  const cy = home.reduce((n, p) => n + p[1], 0) / home.length;

  let w = 1;
  let h = 1;
  // Each name's box relative to its star's point, px. Measured, not
  // estimated, so the cut fits the real text.
  let label: DOMRect[] = [];
  const pos: number[][] = home.map(() => [0, 0]);
  const offset: number[][] = home.map(() => [0, 0]);

  const measure = () => {
    w = box.clientWidth || 1;
    h = box.clientHeight || 1;
    label = names.map((n, i) => {
      const a = n.getBoundingClientRect();
      const s = stars[i].getBoundingClientRect();
      return new DOMRect(a.left - s.left, a.top - s.top, a.width, a.height);
    });
  };

  // Cut rects follow the names, in the SVG's 0–100 viewBox units.
  const cut = () => {
    label.forEach((r, i) => {
      const x = (home[i][0] / 100) * w + offset[i][0] + r.x - CUT_PAD;
      const y = (home[i][1] / 100) * h + offset[i][1] + r.y - CUT_PAD;
      const rect = cuts[i];
      rect.x.baseVal.value = (x / w) * 100;
      rect.y.baseVal.value = (y / h) * 100;
      rect.width.baseVal.value = ((r.width + CUT_PAD * 2) / w) * 100;
      rect.height.baseVal.value = ((r.height + CUT_PAD * 2) / h) * 100;
    });
  };

  measure();
  cut();
  new ResizeObserver(() => {
    measure();
    cut();
  }).observe(box);

  if (still) return;

  let frame = 0;
  let clock = 0; // ms of motion so far; paused while off screen
  let last = 0;

  const draw = (now: number) => {
    clock += Math.min(now - last, 50);
    last = now;
    const t = clock / 1000;
    const turn = (Number(wide.matches ? box.dataset.turnWide : box.dataset.turnPhone) * Math.PI) / 180;
    const a = turn * Math.sin((t / TURN_PERIOD) * Math.PI * 2);
    const tx = DRIFT_X * Math.sin((t / 31) * Math.PI * 2);
    const ty = DRIFT_Y * Math.sin((t / 23) * Math.PI * 2 + 1);
    const cos = Math.cos(a);
    const sin = Math.sin(a);

    home.forEach(([x, y], i) => {
      const dx = ((x - cx) / 100) * w;
      const dy = ((y - cy) / 100) * h;
      // Offset from home, in px, of the turned-and-drifted star.
      const ox = dx * cos - dy * sin - dx + tx;
      const oy = dx * sin + dy * cos - dy + ty;
      offset[i][0] = ox;
      offset[i][1] = oy;
      stars[i].style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
      pos[i][0] = x + (ox / w) * 100;
      pos[i][1] = y + (oy / h) * 100;
    });
    for (const { el, a: i, b: j } of lines) {
      el.x1.baseVal.value = pos[i][0];
      el.y1.baseVal.value = pos[i][1];
      el.x2.baseVal.value = pos[j][0];
      el.y2.baseVal.value = pos[j][1];
    }
    cut();
    // The dim background specks drift but do not turn: a second, slower
    // plane behind the figure.
    if (specks) specks.style.transform = `translate(${(tx * 0.4).toFixed(2)}px, ${(ty * 0.4).toFixed(2)}px)`;
    frame = requestAnimationFrame(draw);
  };

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !frame) {
      // Resume where the clock stopped, so re-entering never jumps.
      last = performance.now();
      frame = requestAnimationFrame(draw);
    } else if (!entry.isIntersecting && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(box);
}
