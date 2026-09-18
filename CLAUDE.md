# CLAUDE.md — Portfolio

Governing rules for Claude Code in this repository. Read fully before any action. PRD.md is the product spec; this file is how we work. If they conflict, stop and ask.

## 0. Roles

- Owner: Sai Rishi Ventrapragada. Makes all product and design decisions.
- Architecture authority: the planning chat (Claude on claude.ai). Design decisions, tokens, and page structure originate there and land in PRD.md.
- Claude Code: implements what PRD.md specifies. Does not redesign, does not add scope, does not author new standing rules without flagging them explicitly.

## 1. Process

1. Plan Mode first. Read the relevant PRD section, write a plan of at most 10 lines, wait for approval, then execute.
2. One milestone per commit. A milestone is a working, buildable state the owner can look at.
3. `npm run build` must pass with zero warnings before every commit.
4. Stage by explicit path. Never `git add -A` or `git add .`.
5. Commit messages: imperative, under 72 chars, scope prefix (`hero:`, `nav:`, `tokens:`, `content:`, `chore:`).
6. Push to `main` only after a passing build. Vercel deploys from `main`.
7. After each milestone, report: what changed, what to eyeball in the browser, anything you were unsure about. Keep it short.
8. Never run a destructive git or filesystem command (reset --hard, force push, rm -rf outside node_modules/dist) without an explicit yes.
9. Do not start a sequencing-sensitive task (multi-file refactor, dependency upgrade) if the session context is nearly full. Say so and stop at a clean commit.

## 2. Stack constraints

- Astro 6, TypeScript strict, static output. No adapter unless PRD.md adds a server feature.
- Tailwind v4 via `@tailwindcss/vite`. Tailwind for layout and spacing. Distinctive visual work (gradients, blur, clip-path, animation) lives in scoped `<style>` blocks in the component that owns it.
- @astrojs/react is installed for islands only. Default to plain `.astro` + a small `<script>`. Use a React island only when the component holds real state across interactions. Every island must justify its `client:*` directive in a one-line comment.
- Fonts via Astro's Fonts API. No `<link>` to Google Fonts.
- No animation libraries (no GSAP, Motion, Lenis) unless PRD.md names one. Motion is CSS scroll-driven animations or CSS transitions, with a script fallback only where support is missing.
- No new dependency without asking. State the package, why, size, and license.

## 3. Design system rules

- All colors and fonts are CSS custom properties defined once in `src/styles/global.css` `:root`. Components never hardcode a hex or a font-family.
- Token names are fixed by PRD.md §4. Do not add tokens without asking.
- Big headings use `--heading`. Side headings, eyebrows, uppercase labels, active nav, link hover use `--accent`. Body `--fg`, secondary `--fg-muted`. Backgrounds `--bg` / `--bg-raised`. Never pure black.
- Accent is switchable through `data-accent` on `<html>` (`crimson` default, `violet`). Any new accent-colored element must work in both.
- Type: `--font-display` (Space Grotesk) for headings and wordmarks, `--font-mono` (JetBrains Mono) for labels, meta, captions. Labels are uppercase with `letter-spacing: 0.12em`.

## 4. Motion rules

- Every animation has a `prefers-reduced-motion: reduce` branch that removes movement and blur, keeping at most an opacity fade.
- Pointer-driven effects (cursor, tilt, hover-follow) are gated behind `@media (pointer: fine)` and feature-detected in script.
- Scroll effects use `animation-timeline` with `CSS.supports` detection; fallback scripts use `requestAnimationFrame`, never scroll handlers that do layout work per event.
- No scroll-jacking. Native scroll always wins.
- Budget: no page may ship more than 40 KB of client JavaScript (gzipped) at launch. Check with the build output.

## 5. File and code rules

- 200-line cap per file. Split before exceeding it.
- One component per file, named for what it is (`Hero.astro`, `Nav.astro`), single purpose.
- Images go through Astro `<Image>` with explicit width and height. Hero image is eager; everything else lazy.
- Content (case studies, project metadata) lives in `src/content/` collections with typed schemas, never hardcoded in pages.
- Accessibility baseline: semantic landmarks, one `<h1>` per page, `alt` on every image (empty for decorative), `aria-expanded`/`aria-controls` on toggles, visible focus styles, form errors in `aria-live` regions.

## 6. External components

When the owner asks to add a component from a library (React Bits, Aceternity, etc.) or a snippet from another site:

1. Check license. Report it. Stop if it is not permissive.
2. Copy the source into `src/components/vendor/<Name>/` with a `SOURCE.md` (URL, license, date, what was changed).
3. Rewrite hardcoded colors and fonts to tokens.
4. Add reduced-motion and pointer gates per §4.
5. Wrap as an Astro island only if it needs React state; otherwise port to plain `.astro`.

## 7. Never

- Never invent copy, project descriptions, or personal facts. Placeholder text must be visibly marked `[TODO]`.
- Never use assets you found on the web without recording the source and license in `ASSETS.md`.
- Never put secrets, tokens, or passwords in the repo, scripts, or commit messages. `.env` is gitignored.
- Never change PRD.md or this file without saying so in the same message.
- Never turn a one-time instruction into a standing rule here. Flag it and let the owner decide.

## 8. Handoff

Keep `SESSION.md` at the repo root: last milestone completed, next milestone planned, open questions. Update it at the end of every session so a fresh session can continue without chat history.
