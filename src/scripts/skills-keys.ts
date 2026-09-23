/**
 * Keyboard route through the skills graph (PRD §5.6, increment 31). The
 * graph is aria-hidden; its content is the visually hidden list
 * (SkillsList.astro), and from 960px this makes that list one Tab stop with
 * roving focus: arrows step through every node in list order (centre, then
 * each hub followed by its skills), Home / End jump to the ends. The focused
 * item's own text is what a screen reader announces; `onFocus` lights its
 * star (a visible ring on the graph) and its cluster. Below 960px the list
 * is the visible layout and plain text again, so nothing here applies.
 */

export interface Keys {
  enable(): void;
  disable(): void;
}

export function initKeys(list: HTMLElement, onFocus: (id: number | null) => void): Keys {
  // List (document) order, the owner's — not node-id order, which is the ring's.
  const items = [...list.querySelectorAll<HTMLElement>("[data-node]")];
  let current = 0;
  let on = false;

  const move = (to: number) => {
    items[current].tabIndex = -1;
    current = (to + items.length) % items.length;
    items[current].tabIndex = 0;
    items[current].focus();
  };

  list.addEventListener("keydown", (e) => {
    if (!on) return;
    const to = { ArrowDown: current + 1, ArrowRight: current + 1, ArrowUp: current - 1, ArrowLeft: current - 1, Home: 0, End: items.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    move(to);
  });

  list.addEventListener("focusin", (e) => {
    if (!on) return;
    const i = items.indexOf(e.target as HTMLElement);
    if (i < 0) return;
    items[current].tabIndex = -1;
    current = i;
    items[current].tabIndex = 0;
    onFocus(+items[i].dataset.node!);
  });

  list.addEventListener("focusout", (e) => {
    if (on && !list.contains(e.relatedTarget as Node)) onFocus(null);
  });

  return {
    enable() {
      on = true;
      items.forEach((el, i) => (el.tabIndex = i === current ? 0 : -1));
    },
    disable() {
      on = false;
      items.forEach((el) => el.removeAttribute("tabindex"));
      onFocus(null);
    },
  };
}
