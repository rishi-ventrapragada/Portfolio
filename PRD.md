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

One page, `/`, with anchored sections in this order. The nav (§5.1) links to the anchors. Restructured in increment 6; the old `/about/` and `/projects/kalacart/` routes redirect permanently to `/#about` and `/#projects` via `vercel.json`.

| Section | Anchor | Spec |
| --- | --- | --- |
| Hero | — (the nav mark's `#top` scrolls here) | §5.2 |
| About: photo, story, GDG line | `#about` | §5.6 |
| Tech stack: six category cards of tags | `#skills` | §5.6 |
| Projects: one card per project, then "currently building" | `#projects` | §5.3, §5.4 |
| Contact: the footer | `#contact` | §5.8 |

No `/projects` index, no case study pages, no `/community` page. A Community section is `[later]` (§5.7).

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
- Nav fixed, 64px tall, transparent over hero, `--bg-raised` after scrolling past the hero; its bottom hairline is the scroll progress track (§5.1)

### 4.5 Motion principles
- Motion explains structure or rewards scroll; it never blocks reading.
- Scroll-driven CSS animations first, script fallback second, libraries never (at launch).
- Every effect has a reduced-motion branch. Pointer effects only on fine pointers.
- No page transitions: the site is one page (§3). `<ClientRouter />` was removed in increment 6 along with its 5.6 KB of client JS.

## 5. Component spec

### 5.1 Nav `[now]`
Fixed top bar, 64px tall, transparent over the hero and `--bg-raised` after scrolling past it (§4.4). Its bottom edge is the scroll progress bar below, so the bar carries no border of its own.

Single-page site, so every entry is an anchor. Left: a small `.label` mark, **RISHI**, `href="#top"` — per the HTML spec a `#top` fragment with no matching element scrolls to the document top, so the hero carries no id and nothing reloads. Right: three links, `.label` mono uppercase. **No hamburger, no menu overlay, no responsive collapse**: three short labels fit at every width (measured in SESSION.md, increment 6).

| Label | Target |
| --- | --- |
| Skills | `#skills` |
| Projects | `#projects` |
| Contact | `#contact` |

- **No active state.** Anchors are positions on a page, not destinations, so nothing carries `aria-current`. Scroll-spy (highlighting the section in view) is deliberately not implemented — it would be client JS for a four-section page.
- Anchor targets carry `scroll-margin-top: calc(var(--nav-height) + 1rem)` in `global.css`, so a jump lands 80px below the top edge, clear of the fixed bar — measured, not assumed. `html { scroll-behavior: smooth }` applies under `prefers-reduced-motion: no-preference` only.
- The scroll observer runs at module scope. There is no client router swapping the DOM, so it is bound once and stays bound.

**Scroll progress** (increment 7). A 2px track across the bar's full width at its bottom edge, `--line` at every scroll position — it *is* the nav's hairline, from the very top of the page rather than only after the hero. Inside it a `--accent` fill grows left to right with document scroll, `scrollY / (scrollHeight − innerHeight)`: 0 at the top, exactly 100% at the bottom, 0 on a page that cannot scroll. Rendered as `transform: scaleX()` from the left edge with no transition — a progress indicator tracks scroll, it never eases toward it. Primary branch is a CSS scroll-driven animation (`animation-timeline: scroll(root)`, longhands in their own rule per CLAUDE.md §4); where that is unsupported, the same `requestAnimationFrame`-throttled script pattern as the hero dissolve writes `--scroll-progress`. It stays on under reduced motion: it follows the visitor's own scroll 1:1 and never moves by itself, so it is state, not decoration. `aria-hidden` — it duplicates the scrollbar.

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

### 5.3 Project cards `[now]`
One card per project in the Projects section, from the projects collection (§6). Each card: cover image (`<Image>`, lazy; the image sets its own aspect ratio so a screenshot is never cropped), then a heading line `Title · Year` (one `<h3>`, the year in `--fg-muted`), the one-line summary, the stack as tag pills (`Pills.astro`, shared with §5.6), and a links row.

- **`status` is never printed.** Increment 7 removed the `status · year` eyebrow; the field only drives the planned state below.
- **Links row.** `links.live` renders as "Live site" and `links.repo` as "GitHub", each an `<a>` only when the value is a real `http(s)` URL; any other value renders as visible mono text, never as an href (CLAUDE.md §7). The row is omitted when `links` is absent. KalaCart's repo is public as of increment 7, so both of its links are real.
- **Planned projects.** `status: "planned"` renders the card at `opacity: 0.5` with only the cover (a placeholder, §7), the title and the year if known — no summary, no stack, no links. The schema makes those fields optional and, for every other status, required (§6), so a shipped project can never silently render empty.
- **No case study, so no stretched link and no card hover.** The links row is the only way out of the card; the title is plain text.
- **No demo video.** Removed in increment 6.
- The grid is `repeat(auto-fit, minmax(28rem, 1fr))`: two cards sit side by side from roughly 60rem and stack below it. A lone card splits into cover + text at ≥768px via `:only-child`, which stops matching the moment a second card exists.

### 5.4 Currently building strip `[now, partial]`
**Increment 2 ships a single static line**, copy hardcoded in `CurrentlyBuilding.astro`:
"Recurzn — a cross-platform life tracker with a voice assistant."

**Deferred to a later increment:** the horizontal marquee, the `src/content/now.json` source (project, one-line status, date), the pause-on-hover behaviour and the reduced-motion static fallback. A one-entry JSON collection would be overhead with no payoff until the marquee exists.

### 5.5 Case study page `[removed]`
Removed in increment 6 with the move to a single page. The `/projects/[slug]` route, `CaseStudyMeta.astro`, `CaseStudyToc.astro` and the KalaCart MDX body (Context, What I built, Decisions, What broke, Outcome) are gone from the repo and the public site; the security-disclosure prose in particular is no longer published. `/projects/kalacart/` redirects to `/#projects`. Everything is in git history if a case study ever returns.

### 5.6 About and Tech stack `[now]`
Two sections on the single page, directly under the hero.

**About (`#about`)**: h2 "About"; a 240px CSS photo placeholder at 3:4 (`role="img"`, `[TODO: photo]` in mono — logged in ASSETS.md) beside the owner's story paragraph, verbatim; below the story, the GDG one-liner as small plain mono text. No top rule: the hero subject fades into this section.

**Tech stack (`#skills`)**: eyebrow "Toolkit", h2 "Tech stack" (`TechStack.astro`, increment 7). Six category cards — `--bg-raised`, 1px `--line` — in a grid that lands three across on desktop, two on a tablet, one on a phone (`auto-fit`, 20rem floor). Each card: the category name as an uppercase mono `--accent` label, then its items as tag pills (`Pills.astro`: mono 12px, not uppercased, 1px `--line` border, `--fg` text, transparent ground). Order and items, verbatim: Languages (C, Python, Java, HTML, CSS, JavaScript, TypeScript, Dart); Frameworks (Flutter, Astro, React, Next.js, Node.js, Django, FastAPI, Tailwind CSS, Vite); AI (Claude, Claude Code, Gemini, GPT-6 Astra, Codex, Ollama, Open Router); Tools (Notion, Canva, Figma); Platforms (Supabase, Firebase, Vercel, Render); Cloud (Google Cloud, AWS). Below the grid, a "Currently learning" `--fg-muted` label with muted pills: Docker, Kubernetes. **Nothing in the section links anywhere** — it is a showcase, not the old "shipped with" list, so the per-skill `#projects` links from increment 6 are gone. `SkillGroups.astro` and `Skills.astro` were deleted.

Cut in increment 6, not deferred: the "How I work" paragraph and the `Timeline.astro` component (deleted). The résumé button the old About page carried is **intentionally not duplicated**: the footer (§5.8) is the résumé link and satisfies §1's one-click requirement. The GDG line stays plain text until a Community section exists (§5.7).

### 5.7 Community `[later]`
GDG on Campus VJIT production team work, event media, links. A section on the single page, not a route (§3).

### 5.8 Footer and contact `[now, minimal]`
Email link (`mailto`), GitHub, LinkedIn, résumé. Mono labels. No form at launch.

### 5.9 Dev accent toggle `[now, dev only]`
Fixed 28px pill bottom-right, rendered only when `import.meta.env.DEV`, flips `data-accent` between crimson and violet, remembers in localStorage. Removed once a final accent is chosen.

### 5.10 Boot preloader `[now]`
A square-fill loading animation shown once per browser session before the hero. Replaced the word-cycling greeting in increment 8.

Full-viewport overlay, content vertically and horizontally **centred**, max-width 600px. This is a full-screen transient moment rather than page content, so it does not follow the site's left-margin convention.

**Background.** `--bg`, overlaid with an original pixelated noise texture: an inline SVG `feTurbulence` (`fractalNoise`, `baseFrequency 0.5`, fixed `seed` so it is identical across builds) collapsed to a single luminance channel by `feColorMatrix`, then quantised by a `discrete` alpha ramp so it reads as small flat squares rather than film grain. The collapse is load-bearing — turbulence generates each channel independently, so without it the three drift apart and the texture speckles green and magenta. Rendered at 120px and scaled to 360px so cells land at 2–4px, tiled, at `opacity: 0.05`. Measured from the compositor: **3 distinct tones spanning `rgb(17,18,20)` (`--bg` exactly) to `rgb(26,27,29)` (effectively `--bg-raised`)**, low enough contrast to read as texture rather than pattern. Generated in CSS — no image request, no build step, no third-party asset.

**Foreground**, stacked and centred with a 1rem gap:
1. **Percentage readout** — `--font-mono`, `1.125rem`, `--fg`, `tabular-nums` so the box does not jog as digits change. Directly above the square. Rendered `0%` in the markup, so the overlay is never blank in the frame before script runs.
2. **The square** — 72px, `border: 3px solid var(--accent)`, transparent background. Inside it a full-size fill child in `--heading` (not `--accent`, so it reads the same under both accents), revealed by `clip-path: inset(X% 0 0 0)` from the bottom up. Clipping rather than an animated `height`: a height-driven edge lands on fractional pixels and the browser antialiases it into a soft grey line, which is visible at 72px. Progress is **quantised to 16 steps for the clip only**, so the fill edge always lands on a whole pixel; the readout above stays continuous and is never rounded away from its true value. The empty state is duplicated into BaseLayout's critical-paint `<style>`, or the square paints full for the frames before `global.css` lands — a white flash on a slow connection.
3. **Status line** — `--font-mono`, uppercase, `letter-spacing: 0.12em`, `--fg-muted`, via the `.label` class. Currently the placeholder `LOADING`; **final copy is deferred**. It lives as a single exported constant, `STATUS_TEXT` in `src/scripts/boot-copy.ts`, so swapping it is a one-line change. It is its own module because an `.astro` frontmatter export is not importable.

**Progress mechanic — tied to real load state, not a fixed timer.** `document.readyState` gives the coarse floor (`loading` → 0.15, `interactive` → 0.5); between `interactive` and `complete` the settled share of `performance.getEntriesByType("resource")` entries (`responseEnd > 0`) moves the number, so on a slow network it tracks resources genuinely arriving. Because that collection only covers requests the browser has already *started*, the share pins at its ceiling while the page keeps fetching and the readout visibly hangs; the remaining gap is therefore spent against the clock on an exponential curve, approaching 1 without arriving. **Only `load` reaches 100%.** The displayed value eases toward true readiness each `requestAnimationFrame` and is capped by it, so the readout can never overstate how loaded the page is.

**Minimum dwell** 700ms before the readout may commit to 100%, so an instant load sweeps 0→100 across the dwell rather than flashing in a single frame.

**Grace cap** 3000ms, armed at **t=0, not after the dwell**: a `load` that never fires must not strand the visitor behind the overlay (the increment 1.7 bug). At the cap the overlay reveals regardless of true load state.

**Reveal.** At 100% and past the dwell, the overlay fades over 400ms and is **removed from the DOM**, with a `transitionend` listener plus a 500ms `setTimeout` as belt and braces, and focus moved to the top of the document.

Behaviour:
- Once per browser session via `sessionStorage` key `boot-seen`. Same-session reloads go straight to the hero.
- The overlay is **visible by default in CSS**, needing no JavaScript to show. A synchronous inline script placed immediately after the overlay markup (classic, not a module, so it is not deferred) removes it before first paint when `boot-seen` is set or reduced motion is on. Repeat visits and reduced-motion visitors therefore never see a frame of it, and there is no flash of the hero before the overlay appears.
- Reduced motion is covered twice: the same inline script, and a `prefers-reduced-motion` CSS rule that hides the overlay outright.
- Without JavaScript a `<noscript>` rule hides the overlay, since nothing would remove it.
- Skippable by click, keypress, wheel, touch or scroll: the sequence stops, the square snaps to full, and the overlay fades.
- The hero image stays `loading="eager"` behind the overlay so it is painted before the reveal.
- Budget: **1452 B gzipped, all inline, no external script** against the 40 KB cap (measured at the end of increment 8, down from 2020 B in increment 7 — the square-fill script is smaller than the cycler machinery it replaced).
- Accessibility: the overlay is `aria-hidden` (decorative — the real `<h1>` carries the name) and focus moves to the top of the document once it is removed.

Measured overlay lifetime, three network conditions (increment 8): **1.6s unthrottled, 4.4s at 200kb/s, 6.1s at 60kb/s.** A fixed-clock animation would give three identical figures; these track the real network, which is the point.

## 6. Content model

`src/content/projects/*.json`, one file per project, loaded by `glob({ pattern: "*.json" })` from `src/content.config.ts` (Content Layer API; `src/content/config.ts` throws in Astro 7). The id is the filename, so `kalacart.json` → `kalacart`. Entries are data only — nothing renders a body, so MDX was dropped in increment 6 and `@astrojs/mdx` is uninstalled.
```
title: string
summary?: string (max 140 chars)     required unless status is "planned"
stack?: string[]                     required unless status is "planned"
status: "live" | "in-progress" | "archived" | "planned"
year?: number
links?: { live?: string, repo?: string }   plain strings; only http(s) values render as hrefs
cover: image()                       relative to the entry file; a planned entry uses a placeholder (§7)
order: number
```
A `superRefine` enforces "required unless planned" at build time, so a live or in-progress card cannot ship without a summary and stack (CLAUDE.md §7). `status` is data only — nothing prints it (§5.3). `role` and `video` were removed with the case study. `src/content/now.json` (§5.4) is still deferred.

## 7. Assets

- Hero subject: transparent PNG, ~1200x1600, real cutout to be supplied by owner `[TODO]`.
- Demo videos `[parked]` (no `video` field or branch since increment 6): under 8 seconds, 1080p max, WebM (VP9) + MP4 (H.264), poster JPG, muted. `[TODO]`
- Résumé: `public/resume.pdf` `[TODO]`
- Every external asset logged in `ASSETS.md` with source and license.

## 8. Non-functional requirements

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95 on mobile.
- Client JS ≤ 40 KB gzipped per page at launch.
- Largest Contentful Paint ≤ 2.0s on a mid-range Android over 4G (hero image is the LCP element; keep it under 250 KB). **Excludes first-visit sessions where the §5.10 boot preloader plays.** The target applies to repeat visits within a session (`boot-seen` set), reduced-motion visitors, and any load where the preloader is skipped. In the first three the overlay is removed before first paint, so the hero is the LCP element as normal; on a skip the overlay paints first and the hero is revealed as soon as the visitor skips.
- The preloader covers the hero on a first visit, so a field LCP measurement for those sessions reads the overlay, not the hero. That is accepted, not a regression. Since increment 8 the overlay lasts only as long as the page genuinely takes to load (1.6s unthrottled, 4.4s at 200kb/s, 6.1s at 60kb/s, 3s hard cap), rather than the fixed ~7s the greeting cycle held it for. The hero image still loads `eager` behind the overlay so it is painted and ready at the moment of reveal.
- Works without JavaScript except the scroll dissolve and accent toggle. The boot preloader is hidden outright without JavaScript, since nothing would remove it.
- Page metadata and an Open Graph image `[next]`.
- Analytics: Vercel Analytics or Umami `[next]`.

## 9. Out of scope

- CMS, database, authentication, contact form, comments, blog (blog may become `[later]` after launch).
- Heavy 3D or WebGL backgrounds.
- Any theme beyond dark with two accents.

## 10. Increments

1. `[done]` Scaffold, tokens, fonts, BaseLayout, Nav, Hero, placeholder section, footer, dev accent toggle, Vercel deploy.
2. `[done, superseded by 6]` Projects collection, project tiles on Home, case study route `/projects/[slug]`.
3. `[done, superseded by 6]` Case study template and KalaCart write-up.
4. `[dropped]` Life OS and AEGIS case studies, demo videos. Case studies no longer exist (§5.5); further projects are cards (§5.3).
5. `[done, superseded by 6]` About page. Merged into the single page as the About and Skills sections.
6. `[done]` Single-page restructure: anchor nav, About and Skills sections under the hero, one project card, case study removed, MDX and ClientRouter dropped, old routes redirected. Résumé PDF still pending from the owner.
7. `[next]` "Currently building" strip (marquee + `now.json`). OG image and analytics.
8. `[later]` Community section, external component adoption (per CLAUDE.md §6), reference-site pattern pass.

## 11. Open decisions

- Final accent: crimson vs violet, decided by eye on the live site.
- Hero subject: photo cutout vs rendered object.
- Custom domain name.
