/**
 * Keyboard route through the skills graph (PRD §5.6, increment 31). The
 * graph is aria-hidden; its content is the visually hidden list
 * (SkillsList.astro), and from 960px this makes that list one Tab stop with
 * roving focus: arrows step through every node in list order (centre, then
 * each hub followed by its skills), Home / End jump to the ends. The focused
 * item's own text is what a screen reader announces; `onFocus` lights its
 * star (a visible ring on the graph) and its cluster. Below 960px the list
 * is the visible layout and plain text again, so nothing here applies.
 *
 * While the route is live the list is also a tree (increment 32): tabindex
 * on a bare p / h3 / li gave 53 focusable elements no role, so nothing said
 * what they were or that arrows move between them. The centre is level 1,
 * each hub level 2, its skills level 3 (flat, placed by aria-level and
 * posinset — the wrappers are role none), always expanded; the tree is named
 * by the section heading and described by its visible key hint
 * (SkillsSection.astro), whose ids the list carries as data attributes.
 */

export interface Keys {
  enable(): void;
  disable(): void;
}

/** Tree roles on (the route is live) or off (the list is plain markup). */
function treeRoles(list: HTMLElement, items: HTMLElement[], on: boolean): void {
  const set = (el: Element, name: string, value: string | number | undefined) =>
    on && value !== undefined ? el.setAttribute(name, String(value)) : el.removeAttribute(name);
  set(list, "role", "tree");
  set(list, "aria-labelledby", list.dataset.labelledby);
  set(list, "aria-describedby", list.dataset.describedby);
  for (const el of list.querySelectorAll("ul, li:not([data-node])")) set(el, "role", "none");
  for (const el of items) {
    const level = el.tagName === "P" ? 1 : el.tagName === "H3" ? 2 : 3;
    const peers = level === 1 ? [el] : level === 2 ? items.filter((x) => x.tagName === "H3") : [...el.parentElement!.children];
    set(el, "role", "treeitem");
    set(el, "aria-level", level);
    set(el, "aria-setsize", peers.length);
    set(el, "aria-posinset", peers.indexOf(el) + 1);
    set(el, "aria-expanded", level < 3 ? "true" : undefined);
  }
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
      treeRoles(list, items, true);
    },
    disable() {
      on = false;
      items.forEach((el) => el.removeAttribute("tabindex"));
      treeRoles(list, items, false);
      onFocus(null);
    },
  };
}
