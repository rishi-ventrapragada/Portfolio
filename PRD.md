# PRD.md — Portfolio

Product requirements for the personal portfolio of Sai Rishi Ventrapragada. Owned by Rishi, maintained from the planning chat. Claude Code implements from this document; CLAUDE.md governs how.

Status legend: `[now]` build in the current phase, `[next]` planned, `[later]` parked. Increments are listed in §10.

## 1. Purpose

A single place that shows what Rishi builds and how he works, for three audiences at once: internship recruiters, GDG and community organizers, and hackathon teammates. It must be fast, honest, and clearly his, not a template.

Success looks like: a recruiter understands who he is in 10 seconds on the homepage, can open a live demo of a project in one click, and can download a résumé in one click.

## 2. Audience and goals

| Audience | What they need in the first minute |
| --- | --- |
| Internship recruiters | Role, stack, two shipped projects, résumé link |
| GDG / community | Evidence of community work, comfort with video and content |
| Hackathon teammates | What he owns end to end, what he is currently building |

## 3. Site map

- `/` Home: hero, project tiles, "currently building" strip, short about teaser, contact
- `/projects` Index generated from the projects content collection
- `/projects/kalacart`, `/projects/life-os`, `/projects/aegis` Case studies (MDX)
- `/about` Story, how he works, skills grouped by what shipped with them, résumé download
- `/community` GDG on Campus VJIT work, events, media
- Contact is a section on Home and in the footer, not a separate page `[now]`

## 4. Design system

### 4.1 Direction
Dark editorial. Magazine-cover hero (full-width wordmark behind a cutout subject), lots of negative space, small uppercase mono labels, one accent color used sparingly. Not neon, not glassmorphism, no 3D scenes.

### 4.2 Tokens (single source in `src/styles/global.css`)

```
--bg:        #111214   page background
--bg-raised: #1a1b1e   cards, nav after scroll
--fg:        #ffffff   body text
--fg-muted:  #9a9ca3   secondary text, meta labels
--line:      #2a2b30   hairlines, dividers
--heading:   #f2f2f2   large headings and wordmarks

Accent, switched by data-accent on <html>:
  crimson (default): --accent: #ff3b5c; --accent-soft: rgba(255,59,92,0.18)
  violet:            --accent: #a78bfa; --accent-soft: rgba(167,139,250,0.18)

--font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif   (weights 500, 700)
--font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, monospace (weights 400, 500)
```

Usage: big headings `--heading`; side headings, eyebrows, labels, active nav, link hover `--accent`; body `--fg`; secondary `--fg-muted`.

### 4.3 Type scale
- Wordmark: `clamp(6rem, 22vw, 20rem)`, weight 700, letter-spacing -0.04em, line-height 0.85
- H1 (page titles): `clamp(2.5rem, 6vw, 5rem)`, weight 700, letter-spacing -0.02em
- H2 (section): `clamp(1.75rem, 3.5vw, 2.75rem)`, weight 700
- Side heading / eyebrow: 12px mono, uppercase, letter-spacing 0.12em, `--accent`
- Body: 16-18px, line-height 1.6, `--fg`
- Meta / caption: 11-12px mono, uppercase, letter-spacing 0.12em, `--fg-muted`

### 4.4 Layout
- Max content width 1280px, 24px gutters on mobile, 48px on desktop
- Grid: 12 columns desktop, 4 columns mobile
- Section vertical rhythm: 96px desktop, 64px mobile
- Nav fixed, 64px tall, transparent over hero, `--bg-raised` with 1px `--line` bottom border after scrolling past the hero

### 4.5 Motion principles
- Motion explains structure or rewards scroll; it never blocks reading.
- Scroll-driven CSS animations first, script fallback second, libraries never (at launch).
- Every effect has a reduced-motion branch. Pointer effects only on fine pointers.
- Page transitions via Astro View Transitions, default crossfade, 200ms.

## 5. Component spec

### 5.1 Nav `[now]`
Fixed top bar, 64px tall, transparent over the hero and `--bg-raised` with a 1px `--line` bottom border after scrolling past it (§4.4).

Four links, right-aligned, `.label` mono uppercase. **No hamburger and no menu overlay**: with this few entries there is nothing worth hiding behind a toggle, so the bar shows them directly at every width. Measured ~259px of links against 327px available at 375px, so there is no responsive collapse.

| Label | Target |
| --- | --- |
| Home | `/` |
| Work | `/#projects-heading` |
| KalaCart | `/projects/kalacart/` |
| Contact | `/#contact` |

- **Scope is what exists.** About and Community are not listed because those pages do not exist. They are added here when they ship.
- **Active state** is resolved at build time from `Astro.url.pathname` — `aria-current="page"` plus an `--accent` colour and underline. Anchor-only links (Work, Contact) are positions on a page rather than destinations, so they are never marked current.
- Anchor targets carry `scroll-margin-top: calc(var(--nav-height) + 1rem)` in `global.css`. Without it a jump to `#projects-heading` lands at `top: 0`, behind the fixed bar — measured, not assumed.
- The scroll observer runs on `astro:page-load`, not at module scope: ClientRouter swaps the DOM but does not re-run an identical script, so a module-scope observer would stay bound to the discarded nav and stop working from the second page onward.

### 5.2 Hero `[now]`
100dvh, background `--bg`, two layers.

Layer A, wordmark: `RISHI` in `--font-display` 700, color `--heading`, z-index 1. Rendered as inline SVG rather than a text node, because only `textLength` can pin the glyphs to an exact width at every viewport. A visually hidden `<h1>RISHI</h1>` carries the semantics.

- The `viewBox` is the glyphs' painted ink box, measured from a real render (`getBBox`/`getExtentOfChar` report advance boxes, which are wider and much taller than the paint). Cropping to it removes the dead space around the letters.
- `preserveAspectRatio` stays at its default so the letterforms scale uniformly — never `none`, which visibly stretches them. `lengthAdjust="spacing"` only redistributes inter-glyph gaps.
- Width: `clamp(320px, 72vw, 1100px)`, centred — about 14% margin each side at 1440px. Under 640px it goes to 88vw so it still reads big.
- Wrapper is `position: sticky; top: 0` inside the hero, letters starting just under the nav.

Layer B, subject: transparent-background PNG cutout at `src/assets/hero-subject.png` (923x1192), z-index 2, centered horizontally, bottom-aligned to the hero. The PNG's own bottom ~4% fades to transparent, so it dissolves into the page with no cut edge. Sized so the head and shoulders cross the lower 40-50% of the wordmark. Loaded via `<Image>`, eager, explicit dimensions.

Scroll behaviour over the first 40% of the hero's height:
- Wordmark: opacity 1 → 0, translateY 0 → -8%, blur 0 → 8px. Dissolves in place.
- Subject: no transform, scrolls naturally.
- Implementation: `animation-timeline: scroll()` / `view()` with `animation-range`; fallback script sets `--hero-progress` (0-1) via `requestAnimationFrame`, enabled only when `CSS.supports('animation-timeline: scroll()')` is false.
- The timeline must be declared as longhands in a rule of its own. Folded into the `animation` shorthand, the minifier emits `animation: ... scroll(root)`, which every browser drops — silently disabling the dissolve.
- Animate the wrapper, not the SVG, and keep the resting frame at `filter: none` / `transform: none`; a `blur(0)` layer softens the glyph edges.
- Reduced motion: opacity fade only, no blur or movement.
- Mobile: wordmark at 88vw, pushed down from the nav so the figure still reaches into it; subject scaled to fit height.

### 5.3 Project tiles `[now]`
Large tiles on Home, one per project, each with: eyebrow (`--accent`), title, one-line summary, stack labels, a cover image, and a link to the case study. Data comes from the projects collection.

As of increment 2 there is **one** tile (KalaCart); the others land when their copy does. The grid is `repeat(auto-fit, …)` so further entries form columns with no rewrite, and a lone tile splits into cover + text at ≥768px via `:only-child` so it does not read as a stretched banner.

Two deviations from the original spec, both deliberate:
- **The demo video is optional, not required.** No project has one yet (PRD §7 `[TODO]`), so the tile omits the whole `<video>` block when absent rather than rendering an empty player. Videos land in increment 4.
- **The eyebrow is `status · year`**, not a project type. There is no `type` field in the schema and inventing a taxonomy would be inventing copy (CLAUDE.md §7). Revisit if a real type field is added.

### 5.4 Currently building strip `[now, partial]`
**Increment 2 ships a single static line**, copy hardcoded in `CurrentlyBuilding.astro`:
"Recurzn — a cross-platform life tracker with a voice assistant."

**Deferred to a later increment:** the horizontal marquee, the `src/content/now.json` source (project, one-line status, date), the pause-on-hover behaviour and the reduced-motion static fallback. A one-entry JSON collection would be overhead with no payoff until the marquee exists.

### 5.5 Case study page `[now]`
MDX with frontmatter: `title, summary, role, stack[], status, year, links{live, repo}, video, cover`. Sections in order: hero (title, meta row, cover video or image), Context, What I built, Decisions and trade-offs, What broke and what I learned, Outcome, Links. Sidebar on desktop with meta and a sticky table of contents.

As built (increment 3):
- The table of contents is generated at build time from the rendered headings (`render()` returns `headings`), not a hardcoded list, so it cannot drift from the document. Anchors use Astro's auto-injected heading `id`s.
- Two columns at ≥1024px, sidebar second in the DOM so reading and tab order stay content-first. Below that it is one column and the TOC is hidden; the meta panel stays.
- **Scroll-spy (active-section highlighting) is deliberately not implemented.** §5.5 asks for a sticky TOC, not a position tracker, and it would be the first client JS on this page. Revisit only if the page gets long enough to need it.

### 5.6 About `[now]`
Photo, 3-4 line story, "How I work" (product-owner approach, architecture-first, AI-assisted implementation, security auditing), skills grouped by shipped-with (frontend, backend and data, languages) where each skill links to the project it was used in, "Currently learning" line, GDG one-liner, résumé download button.

As built (increment 5):
- **Photo is a CSS placeholder**, not an image — a bordered `--bg-raised` box at 3:4 with `[TODO: photo]` in mono. Logged in ASSETS.md.
- **"How I work" gained a vertical timeline** (`Timeline.astro`, entries passed as a prop so a Community page can reuse it). Mono dates, thin `--line` rule, `--accent` dot on the current entry.
- **Every linked skill points at `/projects/kalacart/`**, the only case study that exists. Languages are plain text. Revisit per-skill targets once there are more projects, or the grouping will read oddly.
- **The GDG line is plain text.** It becomes a link when the §5.7 Community page ships.
- **The résumé button links to `/resume.pdf`, which is not in the repo.** A static build cannot verify link targets, so it 404s silently until the owner adds the file.

### 5.7 Community `[later]`
GDG on Campus VJIT production team work, event media, links.

### 5.8 Footer and contact `[now, minimal]`
Email link (`mailto`), GitHub, LinkedIn, résumé. Mono labels. No form at launch.

### 5.9 Dev accent toggle `[now, dev only]`
Fixed 28px pill bottom-right, rendered only when `import.meta.env.DEV`, flips `data-accent` between crimson and violet, remembers in localStorage. Removed once a final accent is chosen.

### 5.10 Boot preloader `[now]`
A word-cycling greeting shown once per browser session before the hero.

Full-viewport overlay, background `--bg`, content vertically and horizontally centred, max-width 600px. One line occupies the box at a time; they do not accumulate.

1. Two stacked rows, centred, no connector punctuation: the cycling `{GREETING}` above, static `I'm Rishi` (`--fg`) below, visible from the start. `--font-display` 700, uppercased in CSS. `{GREETING}` cycles `["Hello", "Namaste", "Bonjour", "Hola", "Ciao"]` once, 5000ms / 5 = 1000ms each. Swap is a 150ms fade plus a slight upward slide. Each word carries a fixed colour token — amber, coral, sky, mint, periwinkle in order — and the colour cross-fades with the word rather than animating separately.
2. `I am a {ROLE}` — `--font-display` 500, static text `--fg`. `{ROLE}` cycles `["Developer", "Video Editor", "Problem Solver", "Builder"]` over 5000ms (1250ms each), same transition, reusing the first four colour tokens in order. The cycling word sits in a box sized to the longest role and aligned left, so the static text beside it never shifts and short roles do not float.
3. `Website loading` — `--font-mono`, uppercase, `letter-spacing: 0.12em`, `--fg-muted`. Three dots loop `.` → `..` → `...` at 400ms per step until reveal.

Only one line is on screen at a time: each cycles, exits over 450ms with an ease-in-out curve, and the next enters. The line transition is deliberately slower and eased than the 150ms word swap within a line. Total run is about 12.6s.

Reveal: once line 3 has been visible 1200ms **and** the page has fired `load`, the overlay fades over 400ms and is removed from the DOM. A 3000ms grace cap after the dwell reveals anyway, so a stalled asset can never strand the visitor behind the overlay.

Behaviour:
- Once per browser session via `sessionStorage` key `boot-seen`. Same-session reloads go straight to the hero.
- The overlay is **visible by default in CSS**, needing no JavaScript to show. A synchronous inline script placed immediately after the overlay markup (classic, not a module, so it is not deferred) removes it before first paint when `boot-seen` is set or reduced motion is on. Repeat visits and reduced-motion visitors therefore never see a frame of it, and there is no flash of the hero before the overlay appears.
- Reduced motion is covered twice: the same inline script, and a `prefers-reduced-motion` CSS rule that hides the overlay outright.
- Without JavaScript a `<noscript>` rule hides the overlay, since nothing would remove it.
- Skippable by click, keypress, wheel, touch or scroll: cycling stops, every line snaps to its final word, and the overlay fades.
- `prefers-reduced-motion: reduce` skips it entirely — no overlay, straight to the hero.
- No layout shift on swap: words are absolutely positioned over an invisible grid holding all of them, so the box is always as wide as the widest word.
- The hero image stays `loading="eager"` behind the overlay so it is painted before the reveal.
- Budget: 785 B gzipped against the 2.5 KB allowance; page total 6.85 KB against the 40 KB cap.
- Accessibility: the overlay is `aria-hidden` (decorative — the real `<h1>` carries the name) and focus moves to the top of the document once it is removed.

## 6. Content model

`src/content/projects/*.mdx` with schema. Note `slug` is **not** a frontmatter
field: Astro's Content Layer API derives it from the filename
(`kalacart.mdx` → `/projects/kalacart`), and the config lives at
`src/content.config.ts` — `src/content/config.ts` throws in Astro 7.
```
title: string
summary: string (max 140 chars)
role: string
stack: string[]
status: "live" | "in-progress" | "archived"
year: number
links: { live?: url, repo?: url }
video?: { webm: string, mp4: string, poster: string }
cover: image
order: number
```
`src/content/now.json`: array of `{ project, status, date }`.

## 7. Assets

- Hero subject: transparent PNG, ~1200x1600, real cutout to be supplied by owner `[TODO]`.
- Demo videos: under 8 seconds, 1080p max, WebM (VP9) + MP4 (H.264), poster JPG, muted. `[TODO]`
- Résumé: `public/resume.pdf` `[TODO]`
- Every external asset logged in `ASSETS.md` with source and license.

## 8. Non-functional requirements

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95 on mobile.
- Client JS ≤ 40 KB gzipped per page at launch.
- Largest Contentful Paint ≤ 2.0s on a mid-range Android over 4G (hero image is the LCP element; keep it under 250 KB). **Excludes first-visit sessions where the §5.10 boot preloader plays.** The target applies to repeat visits within a session (`boot-seen` set), reduced-motion visitors, and any load where the preloader is skipped. In the first three the overlay is removed before first paint, so the hero is the LCP element as normal; on a skip the overlay paints first and the hero is revealed as soon as the visitor skips.
- The preloader deliberately covers the hero for roughly 11s on a first visit, so a field LCP measurement for those sessions reads the overlay, not the hero. That is accepted, not a regression. The hero image still loads `eager` behind the overlay so it is painted and ready at the moment of reveal.
- Works without JavaScript except the scroll dissolve and accent toggle. The boot preloader is hidden outright without JavaScript, since nothing would remove it.
- Per-page metadata and Open Graph image; dynamic OG images per case study `[next]`.
- Analytics: Vercel Analytics or Umami `[next]`.

## 9. Out of scope

- CMS, database, authentication, contact form, comments, blog (blog may become `[later]` after launch).
- Heavy 3D or WebGL backgrounds.
- Any theme beyond dark with two accents.

## 10. Increments

1. `[now]` Scaffold, tokens, fonts, BaseLayout, Nav, Hero, placeholder section, footer, dev accent toggle, Vercel deploy.
2. `[now]` Projects collection, project tiles on Home, case study route `/projects/[slug]`. **Scoped to KalaCart only** — the other entries need real copy first (CLAUDE.md §7). The `/projects` index page is deferred until there is more than one project to index.
3. `[now]` Case study template and KalaCart write-up.
4. `[next]` Life OS and AEGIS case studies, demo videos.
5. `[now]` About page. Résumé PDF pending from the owner; OG images and analytics still `[next]`.
6. `[next]` "Currently building" strip (marquee + `now.json`). Nav shipped in increment 4 as links rather than a hamburger menu.
7. `[later]` Community page, external component adoption (per CLAUDE.md §6), reference-site pattern pass.

## 11. Open decisions

- Final accent: crimson vs violet, decided by eye on the live site.
- Hero subject: photo cutout vs rendered object.
- Custom domain name.
