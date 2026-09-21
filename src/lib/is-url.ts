/**
 * The href guard (PRD §5.3, §5.8). A link value in content or component
 * data may be a visibly marked "[TODO]" placeholder (CLAUDE.md §7), which
 * must never become an href. Only an absolute http(s) URL or a mailto:
 * address renders as a real <a>; anything else renders as text. Lived in
 * ProjectLinks.astro until increment 16, when the footer needed it too.
 */
export const isUrl = (value?: string): boolean =>
  !!value && /^(https?:\/\/|mailto:)/.test(value);
