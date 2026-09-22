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
| About: comic page — five placeholder panels, clock-cycled colour grade | `#about` | §5.6 |
| Skills: a skill tree of the dev-side skills | `#skills` | §5.6 |
| Video editing: a constellation map of the video-editing skills | `#skills-video` | §5.6 |
| Experience: pinned, scroll-scrubbed monitor + clip timeline of four moments | `#experience` | §5.11 |
| Projects: film-strip contact sheet, one frame per project | `#projects` | §5.3 |
| Contact: the footer — a scroll-driven credits roll that settles on the links | `#contact` | §5.8 |

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
--boot-square-bg: #0b0c0e   boot preloader square backdrop (§5.10) — the only place it is used
--monitor-bg:  #000000   Experience monitor (§5.11) — the one pure-black surface, chosen so the NLE monitor reads as a screen; nothing else may use it
--timeline-bg: #0b0c0e   Experience timeline ground (§5.11), between the monitor and --bg

Small palette (used by the Experience clips, §5.11; coral unused):
  --word-amber: #ffb454; --word-coral: #ff8f6b; --word-sky: #6ec9f5; --word-mint: #4ade80; --word-periwinkle: #8ea9ff

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

Single-page site, so every entry is an anchor. Left: a small `.label` mark, **RISHI**, `href="#top"` — per the HTML spec a `#top` fragment with no matching element scrolls to the document top, so the hero carries no id and nothing reloads. Right: four links, `.label` mono uppercase. **No hamburger, no menu overlay, no responsive collapse.** Four labels fit at 375 and 360px only because the bar steps its type down below 480px (phone step-down bullet below; measured in SESSION.md, increment 13).

| Label | Target |
| --- | --- |
| Skills | `#skills` |
| Experience | `#experience` |
| Projects | `#projects` |
| Contact | `#contact` |

- **No active state.** Anchors are positions on a page, not destinations, so nothing carries `aria-current`. Scroll-spy (highlighting the section in view) is deliberately not implemented — it would be client JS for a four-section page.
- Anchor targets carry `scroll-margin-top: calc(var(--nav-height) + 1rem)` in `global.css`, so a jump lands 80px below the top edge, clear of the fixed bar — measured, not assumed. `html { scroll-behavior: smooth }` applies under `prefers-reduced-motion: no-preference` only.
- The scroll observer runs at module scope. There is no client router swapping the DOM, so it is bound once and stays bound. Since increment 13 it and the progress fallback live in `src/scripts/nav.ts` (200-line cap).
- **Phone step-down (increment 13).** Below 480px the mark and the links drop to `--size-meta` (11px, the footer links' size) with `0.06em` tracking (the pills' value) and a 0.75rem gap; from 480px they are the normal 12px / 0.12em `.label` at 1.5rem (2rem from 768px). Measured at 375px: mark 36.3px + links 261.1px of 327px available, **29.6px spare**; at 360px **14.6px spare**; **at 320px the row is 25.4px too wide and the links run into the mark** — a known limit, recorded in SESSION.md. This is a deliberate, documented bend of CLAUDE.md §3's 0.12em label rule for the phone nav only. A fifth link needs a real overflow pattern for narrow phones, not another shrink.

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

### 5.3 Project frames `[now]`
The Projects section (`#projects`, after Experience per §3) is a **film-strip contact sheet** (increment 15; sizing, caption and expand mechanic revised in 15.1). `ProjectsSection.astro` reads the collection (§6), sorts by `order` and lays one `ProjectFrame.astro` per entry in a grid; `ProjectDetail.astro` is a frame's expandable panel and `ProjectLinks.astro` its links. **No client script**: hover, `:focus-within` and a pointer media query do everything.

**Grid.** `repeat(auto-fill, minmax(min(100%, 32rem), 1fr))`, 1.5rem gap: **two 573px frames per row at 1280**, one column at 375. `auto-fill`, not `auto-fit`, so frames keep their slot size and a later entry drops into the next slot with no rewrite — measured with a throwaway third entry: two on row one and one on row two at 1280, stacked at 375, no overflow. The increment-6 `:only-child` split is gone.

**Frame (rest state, every device, every status).** An `<article>` on `--bg-raised` with a 1px `--line` edge, in this order: a **sprocket strip** (`::before`, 14px, `radial-gradient` holes in `--bg` on 16px tiles with `background-repeat: space`, so only whole holes render and none is clipped at the frame's edge at any width); the cover through `<Image>` (own ratio, never cropped, inset 0.75rem, `sizes` 600px from 768px — 546px wide at 1280, 301px at 375); a **caption row of the `<h3>` title and the frame number** (`Frame 001`, `.meta`, zero-padded from the sheet index, on the right); a second sprocket strip (`::after`). **There is no year tag** (removed in 15.1) and **`status` is never printed**: a planned entry takes the shared `.planned` utility on the article — `opacity: 0.5` and a dashed edge — and that is its only signal. The frame's own defaults sit in `@layer components` so the unlayered utility wins.

**Hover / focus expand — fine pointers only** (`@media (hover: hover) and (pointer: fine)`). A frame with something real to show (`summary`, `stack` or `links`; marked `data-expandable`) carries a **panel that opens below it**: `ProjectDetail.astro`, absolutely positioned at `top: 100%` on the frame's bottom edge (1px wider each side to cover the frame's border), `z-index: 3`, on `--bg-raised` with a `--line` edge, a `color-mix(--monitor-bg 60%)` drop shadow and 1.25rem padding; inside, the summary at 1rem / 1.6, the stack as `Pills.astro` and the full links row, 1rem apart. It is out of grid flow, so nothing else moves. **The cover is never covered, dimmed or overlaid**: measured, the element at the cover's centre is the `<img>` at rest and while expanded, at opacity 1. At rest the panel is laid out at full height but `opacity: 0; pointer-events: none` — invisible, yet its links stay in the tab order, which is what lets keyboard focus open it. `.frame:hover` or `.frame:focus-within` → the panel fades in (160ms) and the frame lifts a little: `transform: scale(1.02)`, `z-index: 2`, the same shadow (200ms); the panel is the main event, the lift is feedback. **Transform only, so siblings never move**: Recurzn's rect is identical before, during and after KalaCart's hover, and with a third frame on row two its rect is identical while row one's panel overlaps it. Tab from the Experience clips lands on "Live site" inside KalaCart's panel and opens it the same way hover does, with the link scrolled fully into view (`scroll-margin-block: 2rem` on the links absorbs the lift); the next Tab reaches "GitHub", the one after leaves the section; Enter activates the link natively. Mouse-off or blur reverts. **A planned frame renders no panel and never expands.** Under `prefers-reduced-motion: reduce` there is no transition: scale and panel are at their final values in the same tick as the hover (measured).

- **Why opacity, not height.** A `grid-template-rows: 0fr → 1fr` height reveal was built first in 15.1 and dropped: when a keyboard user Tabs into a collapsed panel, the browser scrolls the link into view *before* the height grows, and the link ends up below the fold. A panel that is always full-size gives focus a stable target.
- **Bottom of the viewport.** The panel extends the document rather than being clipped (`scrollHeight` grows past it), so a frame hovered near the fold shows its panel partly below the edge until the user scrolls one notch; keyboard focus scrolls the link into view on its own (measured: panel 146px below the fold on hover at that position; after Tab, the link is inside the viewport and the panel bottom 410px above it). Flipping the panel upward would need script to know the frame's screen position, so this is an accepted edge, not a bug.

**No-hover devices** (the query above fails: phones, tablets, coarse pointers). The panel is `display: none` — out of the visual *and* the accessibility tree, so nothing desktop-only can be tapped or tabbed into (measured at 375 with touch emulation: the section's only tab stops are the quick links). Instead a **quick links row** under the caption shows `Live site ↗` / `GitHub ↗` (`.label` at `--size-meta`), only for real URLs; Recurzn shows none. No summary, no stack there — that detail is deliberately desktop-only. Both rows are in the HTML: which one shows is decided by the device's pointer capability, which only the client knows, and `display: none` removes the unused one from both trees without JavaScript.

**Links** (`ProjectLinks.astro`). `links.live` → "Live site", `links.repo` → "GitHub". A value may hold a visibly marked "[TODO]" placeholder (CLAUDE.md §7), so only real `http(s)` URLs render as `<a>`: the full variant (desktop panel) renders any other value as mono text so the placeholder stays visible; the quick variant simply skips it. KalaCart's two links are real.

**No case study, no demo video** (removed in increment 6). The links are the only way out of a frame; the title is plain text.

### 5.4 Currently building strip `[removed]`
Removed in increment 16. Increment 2's single static line ("Recurzn — a cross-platform life tracker with a voice assistant.", hardcoded in `CurrentlyBuilding.astro`) never grew into the marquee and the owner cut it; the component is deleted and `src/content/now.json` was never created. What Rishi is building now still shows as the planned Recurzn clip in Experience (§5.11) and the planned Recurzn frame in Projects (§5.3). The marquee idea is in git history if the strip ever returns.

### 5.5 Case study page `[removed]`
Removed in increment 6 with the move to a single page. The `/projects/[slug]` route, `CaseStudyMeta.astro`, `CaseStudyToc.astro` and the KalaCart MDX body (Context, What I built, Decisions, What broke, Outcome) are gone from the repo and the public site; the security-disclosure prose in particular is no longer published. `/projects/kalacart/` redirects to `/#projects`. Everything is in git history if a case study ever returns.

### 5.6 About and Skills `[now]`
Two sections on the single page, directly under the hero.

**About (`#about`)**: a comic page (increment 16). Eyebrow "Origin story" and h2 "About" in the shell (`About.astro`); below them a full-bleed page of five panels that runs viewport edge to edge like the Experience monitor. One panel = `AboutPanel.astro`, a `<figure>`: a `role="img"` art block and a `<figcaption>` caption box in the panel's top-left corner. From 768px the grid is four columns by two rows at a 2:1 aspect ratio (cells roughly square), the first panel the establishing shot spanning the left half; below 768px a single column with every panel at 4:3, the establishing panel first. Gutters are a 0.75rem gap and outer padding of `--bg` between 1px `--line` panel borders — no new ink token, no hand-drawn borders.

**Structure and mechanic only.** The art is a solid fill (each palette word mixed 60% into `--bg-raised`: amber, sky, mint, periwinkle, coral) tagged `[PANEL N — placeholder art]` in mono, and every caption is a visible `[TODO: panel N dialogue]`. The dialogue is the owner's own narrative and is never invented (CLAUDE.md §7). The placeholders are logged in ASSETS.md.

**Colour grade.** One CSS animation on the grid cycles `filter` through full colour → `grayscale(1)` → a warm duotone (`sepia(1) saturate(1.3) hue-rotate(-15deg)`) and back: three 5s holds with ~0.6s crossfades in a 15s loop, so every panel shifts together. Clock-based, never scroll-tied (owner's decision); no script. Every keyframe lists the same four filter functions in the same order so the browser interpolates instead of snapping. **Reduced motion freezes on full colour**: the animation is removed and the filter stays at `none` — a recurring filter change counts as motion like everything else on the site (CLAUDE.md §4). Measured in increment 16: the filter cycles across nine 1.5s samples with motion allowed and reads `none` on every sample with reduced motion forced.

No top rule: the hero subject fades into this section. The 240px photo placeholder, the story paragraph and the GDG line from increment 6 are gone from the page; the GDG line returns with the Community section (§5.7).

**Skills (`#skills`) — a skill tree (increment 18; branch scaling and the h2 rename in 19).** Eyebrow "Toolkit", h2 **"Skills"** — it matches the nav label, as Projects, Experience and Contact do (`SkillTree.astro`; one `SkillGroup.astro` per category, its leaves in `SkillChain.astro`; `TechStack.astro` deleted, `Pills.astro` kept for the project panels). **This is the dev/build side only.** The video-editing skills are a second, separate section — the constellation below (`#skills-video`, increment 20); the two are never merged. **Content, verbatim** (six category roots, then a learning cluster): Languages (C, Python, Java, HTML, CSS, JavaScript, TypeScript, Dart); Frameworks (Flutter, Astro, React, Next.js, Node.js, Django, FastAPI, Tailwind CSS, Vite); AI (Claude, Claude Code, Gemini, GPT-6 Astra, Codex, Ollama, Open Router); Tools (Notion, Figma — Canva moved to the video section); Platforms (Supabase, Firebase, Vercel, Render); Cloud (Google Cloud, AWS); Currently learning (Docker, Kubernetes). 41 nodes. Nothing links anywhere; every node is static text and its visible text is its accessible name (no per-skill detail exists to reveal, so no hover or focus state). Outline: h2 → one `<h3>` per root; leaves are `<li>`s of one `<ul>` per category.

**Priority: every name legible at a glance.** Leaves are pills — `--bg-raised` fill, 1px `--line`, 4px radius, mono **14px** `--fg`, 0.04em, not uppercased (product names read wrong shouted), `white-space: nowrap`; measured at 1280 and 375: 34 leaves, none clipped, none wrapped. Roots are solid `--accent` with **dark `--bg` text** (light text is 3.5:1 on crimson; dark is 5.4:1 on crimson, 6.9:1 on violet), uppercase mono 12px 0.12em, a touch taller than a leaf and at most 70% of their span so the skills, not the labels, carry the section. Connectors are 2px `--accent` at full opacity everywhere — solid bars (pseudo-elements) between leaves, `currentColor` SVG strokes for the fans — under both accents.

**Branches scale with the leaf count (increment 19)**: `branches = max(2, ceil(n / 3))` — about three leaves per branch, never fewer than two branches so even a two-item category forks visibly. Languages 8 → 3 (3/3/2), Frameworks 9 → 3 (3/3/3), AI 7 → 3 (3/2/2), Tools 2 → 2, Platforms 4 → 2 (2/2), Cloud 2 → 2, Currently learning 2 → 2. Computed in `SkillGroup.astro`'s frontmatter and passed to the chain; the leaves fill down each column in order (`--rows: ceil(n / branches)`, `data-head` on each column's first item).

**From 960px, a talent tree**: each group is root → a 28px **fan** (an SVG `viewBox="0 0 N 1"`, `preserveAspectRatio="none"`, one line per branch from the root's bottom centre `(N/2, 0)` to each column's top centre `(i + 0.5, 1)`, so the spread is even by construction — 0.5 / 1.5 / 2.5 for three, the middle line vertical; `vector-effect="non-scaling-stroke"` keeps them 2px at any width) → the leaves, one **8rem column per branch** (`grid-auto-flow: column`), each joined to the one above by a 16px vertical connector; a column's head has none, the fan reaches it. 8rem (128px) is the measured floor for a 12-character label at 14px, so every leaf is exactly 128px wide at every desktop width and a group is `branches × 8rem + (branches − 1) × 1rem` wide (416px for three, 272px for two). **The groups sit in centred, wrapping rows** (flex, 3rem × 1.5rem gaps, document order, never reflowed): three 3-branch groups would need 1296px in one band, more than the 1184px shell, so the rows fall out of the content — at 1280: [Languages, Frameworks] / [AI, Tools, Platforms] / [Cloud, Currently learning]; at 960: [Languages, Frameworks] / [AI, Tools] / [Platforms, Cloud, Currently learning]. Measured at both: 34 leaves at 128px, none clipped, none wrapped, no overflow, fan 416×28 / 272×28.

**Below 960px, stacked (option b, not a pannable diagram)**: the groups stack 2.5rem apart; each is the root, then a 2px accent **spine** down the left (the list's `border-left`) with the leaves in a **wrapping chain** — the same 14px pills, a 14px accent tick to the left of every leaf, and a horizontal gap equal to the tick, so a row's first leaf joins the spine and every later leaf joins the one before it. Nothing shrinks; at 375 the leaves are the same size as on desktop, two to four per row, no horizontal overflow, section 1472px tall. The fan is `display: none` here.

**Currently learning** reuses the shared `.planned` utility on the leaves (dashed 1px border, 0.5 opacity — white at 0.5 over `--bg-raised` is about 5:1, still AA) with dashed connectors, spine and fan (`stroke-dasharray: 4 4`); the root is the one bend: outlined dashed in `--accent` with no fill and full-opacity accent text, because a solid root at 0.5 would fail contrast. Leaf defaults sit in `@layer components` so the unlayered utility wins, as in `ExperienceClip.astro`.

**No animation.** The tree is static — no reveal, no draw-in — so there is nothing to change under `prefers-reduced-motion` (measured: `animation-name: none` on every element in the section). No client script; the split into columns is computed in frontmatter at build time. Nav "Skills" → `#skills` lands the section top at 80px (measured).

**Video editing (`#skills-video`) — a constellation map (increment 20).** The second, separate Skills section, immediately after the tree and before Experience (`SkillConstellation.astro`, one file, no children). Eyebrow **"Also"** — not "Toolkit", which the tree directly above already carries — and h2 **"Video editing"**, the owner's own descriptor. **Content, verbatim** (nine, no sub-grouping): Videography, After Effects, Premiere, Motion Design, DaVinci Resolve, Canva, Color Grading, CapCut, Audio Mixing. Canva sits here, not in the tree's Tools (§5.6 above). Nothing links anywhere; each star's visible name is its accessible name, and there is no hover or focus state (measured: 0 links in the section).

**Priority: names legible at a glance, connectors clearly visible.** One `.sky` box carries every coordinate: nine stars at fixed build-time `{x, y}` percentages, a dot in one of three sizes (8/10/14px, `--fg` with an `--accent-soft` ring and glow), and its name beside it in mono **14px** `--fg`, 0.04em, not uppercased, `nowrap`, on a `--bg` halo so a crossing line never touches the letters. A name sits on the side of its star with the room (`x > 50` → left, else right). Ten edges — eight spanning all nine stars plus two that close the figure — are `<line>`s in one SVG (`viewBox 0 0 100 100`, `preserveAspectRatio="none"`, `vector-effect="non-scaling-stroke"`, the tree's proven technique), 2px `--accent` at full opacity under both accents, so the geometry stretches with the box while the strokes and the type never scale. About 14 dim `--fg-muted` specks at 0.4 are decorative background, `aria-hidden`. No new tokens and no hardcoded colours.

**Responsive: one coordinate set, two box shapes.** The box is 16:10 (max 960px, centred) from 768px and 2:3 portrait below, which gives the nine y bands (~11% apart, the top and bottom stars pulled to 9% and 91% so their glow stays inside) room on a phone. Measured at 1280, 960, 768 and 375: nine names, none clipped, none wrapped, no pairwise overlap, every name inside the box, no horizontal overflow, labels a fixed 14px at every width. Line paint verified as **real rendered pixels** — 1×1 screenshot clips at all ten edge midpoints read `rgb(255, 59, 92)` under crimson; the stroke computes to the accent rgb under crimson and violet alike.

**No animation.** Static text in a shape — no reveal, no twinkle — so `prefers-reduced-motion` has nothing to change (measured: `animation-name: none` throughout). No client script, in this section or the page (measured: 0 external scripts in the built HTML). The nav is unchanged: "Skills" still → `#skills`, which lands the tree at 80px and puts this section below it; `#skills-video` is an own-anchor only.

Cut in increment 6, not deferred: the "How I work" paragraph and the `Timeline.astro` component (deleted). The résumé button the old About page carried is **intentionally not duplicated**: the footer (§5.8) is the résumé link and satisfies §1's one-click requirement. The GDG line stays plain text until a Community section exists (§5.7).

### 5.7 Community `[later]`
GDG on Campus VJIT production team work, event media, links. A section on the single page, not a route (§3).

### 5.8 Footer and contact `[now]`
Contact as a **staged credits sequence** (`Footer.astro` + `FooterStage.astro` + `FooterContact.astro` + `src/scripts/footer-scrub.ts`, increment 21). **This replaces increment 17's continuous crawl**, in which a single tall `.roll` translated upward against a view timeline: because the whole strip moved as one unit through a fixed pin, earlier content was physically forced off the top edge as later content arrived. Increment 21 keeps the pin and replaces the roll with four discrete stages that each settle into the *same* fixed position and hold. Nothing translates off-screen; `@keyframes credits-roll`, the `--credits` view timeline and the `--credits-progress` script fallback are all gone, along with `credits-roll.ts`.

Still the `<footer>` landmark and still `#contact` for the nav, with the global `scroll-margin-top` (a nav click lands the footer's top at 80px, measured). Inside the footer a **scroll track** (`.track`, `height: var(--pin-length)`, `--pin-length: 250vh` — the one number to tune) holds a **sticky pin** (`position: sticky; top: 0; height: 100dvh; padding-top: var(--nav-height); overflow: clip`) — the `Wordmark.astro` / `ExperienceTimeline.astro` technique, unchanged from increment 17.

**The stages.** Inside the pin a `.stack` (`display: grid`) holds four `FooterStage.astro` instances, each `grid-area: 1 / 1` so they occupy one cell and overlap exactly — the same "every frame in one grid cell" technique `ExperienceFrame.astro` uses for the Experience monitor, so there is no rigid strip that could push anything off-screen. Each stage is `min-height: var(--pin-inner)` (`100dvh − nav`) with `grid-template-rows: 1fr` and its content centred in that row (**not** `place-content: center`, which would collapse the row to content height and leave the contact card's absolutely-positioned © line anchored to a ~69px box instead of the whole stage). In order:

| Zone | `data-credits-stage` | Content |
| --- | --- | --- |
| 1 | `title` | "RISHI VENTRAPRAGADA" (`--size-h2`, 0.08em tracking, uppercase display) — server-rendered `data-active`, so the footer scrolls in as a title card and never as a blank screen |
| 2 | `built` | "Built with" over "Astro · Tailwind · Vercel" |
| 3 | `author` | "Directed, developed & edited by" over "Rishi" |
| 4 | `contact` | `FooterContact.astro` — "Get in touch", the links, © pinned to the bottom edge |

Stages 2–3 are the owner's credit line split into one role-over-name pair each (accent mono label, display name at `clamp(1.25rem, 2.2vw, 1.75rem)`) — increment 17 showed both rows together as one block; they are now one per zone. The footer is the last thing on the page and the track's end is the document's end, so there is no post-release flow content: the sequence settles on the contact stage and the page stops.

**The zone/commit mechanic.** `footer-scrub.ts` calls **`initScrub` from `experience-scrub.ts` unmodified** — the same engine Experience uses, which already takes a track, a list of ids and a `commit` callback. Progress is `(scrollY − trackTop) / (trackHeight − innerHeight)` clamped to [0,1], recomputed from **absolute `scrollY`** each frame (so direction never matters and scrolling back reverses exactly), zone is `min(n − 1, floor(progress × n))` over four equal zones, and `commit(id)` fires **only on a zone change**, never per frame. One passive scroll/resize listener coalesced to one `requestAnimationFrame`, live only while the track intersects the viewport. `commit(id)` is the single state owner: it toggles `data-active` onto the matching stage and clears the rest — the same shape as `experience-timeline.ts`'s `commit`. **Measured at 1280×900**: track 2250, pin 900, pinned distance 1350, zone boundaries at scrollY 6828 / 7166 / 7503 / 7841; every stage settles at top 64 / bottom 900 — the identical box — and the reverse walk returns `contact → author → built → title` at the same boundaries. **375×812**: every stage at top 64 / bottom 812, no horizontal overflow, contact links on one row.

**The entrance.** A stage enters by fading in and settling up from `translateY(0.75rem)` to `translateY(0)` over 320ms, then holds motionless for the rest of its zone — the "roll into place and pin" read. The *outgoing* stage fades in place only: it carries no exit transform, so it never slides toward the top edge. Measured: an inactive stage sits at top 76 / opacity 0 / `translateY(12px)`, the active one at top 64 / opacity 1 / `translateY(0)`, and no stage's box ever crosses the pin's top edge at any scroll position.

**Hidden with opacity, not `visibility`.** `ExperienceFrame.astro` hides an inactive frame with `visibility: hidden` so it leaves the accessibility tree, but that cannot work here: the contact links are the only focusable content in the sequence, and `visibility: hidden` drops them out of the focus order for three of the four zones — `.focus()` does not stick, `document.activeElement` falls back to `<body>`, and the keyboard reveal below has no focus event to fire on (measured during increment 21). So a hidden stage is `opacity: 0; pointer-events: none` — the links stay focusable from every zone, and `pointer-events` keeps a hidden stage from swallowing clicks meant for the visible one.

**Keyboard.** Unchanged in behaviour from increment 17. A focused link inside a stuck sticky pin never scrolls into view on its own — the browser scrolls the window, the pin absorbs it, the link stays clipped. So `footer-scrub.ts` listens for `focusin` on the stack and, when the target matches `:focus-visible`, jumps the window (instant, the browser's own focus-scroll behaviour) to the track's end, where the sequence has settled on the contact stage. Measured at 1280×900 from the footer's top (scrollY 6828, `title` active): focusing GitHub, LinkedIn, Gmail or Résumé each moves `scrollY` to 8178 (the document maximum), commits the `contact` stage and lands the link at 498–512px, in view; a mouse-modality focus (`:focus-visible` false) leaves `scrollY` at 6828, as before.

**No JavaScript.** A `<noscript>` style (the Experience pattern) un-pins the section into a static block — track `height: auto`, pin `position: static; height: auto; overflow: visible`, the stack `display: block` and every stage `opacity: 1; pointer-events: auto; transform: none` — so the four stages un-stack into plain flow in document order and still end on the contact card. The stack override is new to increment 21: with a single roll there was nothing to un-stack, but four overlapping grid cells would otherwise collapse onto each other. Measured with scripts disabled at 1280×900: pin static 3408px, stages at 64–900 / 900–1736 / 1736–2572 / 2572–3408, all `transform: none`.

**Reduced motion — the pin stays, the stage swaps go instant.** This inverts increment 17's rule, and the reason is that the mechanic itself changed. The old roll moved content at a rate *other* than the scroll rate, and a differential scroll rate is parallax — the named example in WCAG 2.3.3 — so the whole pin had to go. A stage commit is instead a discrete state change at a zone boundary: `position: sticky` is layout, not animation, and the commit adds no motion beyond the visitor's own scroll. That is exactly the rationale Experience already uses for keeping its pin under `reduce` (§5.11), so the footer now matches it. Only the entrance goes: `FooterStage.astro` drops its `transition` under `prefers-reduced-motion: reduce`, making each swap instant with no slide and no fade. Measured: `transition: none`, pin `position: sticky`, all four zones commit and reverse at the same boundaries as the default branch.

Contact values go through the shared `isUrl` guard (`src/lib/is-url.ts`, accepts http(s) and `mailto:`): GitHub (`https://github.com/rishi-ventrapragada`), LinkedIn (`https://www.linkedin.com/in/rishi-ventrapragada`), Gmail (`mailto:rishiventrapragada23@gmail.com`); a `[TODO]` value would render as mono text, never an href. The résumé link stays outside the guard as built (`/resume.pdf`, root-relative; the PDF is still pending, §7). Mono labels throughout. No form at launch.

### 5.9 Dev accent toggle `[now, dev only]`
Fixed 28px pill bottom-right, rendered only when `import.meta.env.DEV`, flips `data-accent` between crimson and violet, remembers in localStorage. Removed once a final accent is chosen.

### 5.10 Boot preloader `[now]`
A square that fills in cell by cell as the page actually loads, shown once per browser session before the hero. Increment 12 replaced the centre-out layers with an 8×8 grid of cells filling in a fixed scattered order; increment 11 replaced the uniform slot with fixed pause points and slowed the sequence again; increment 10 set the final status-line copy and slowed it once; increment 9 replaced increment 8's bottom-up fill; increment 8 had replaced the word-cycling greeting.

Full-viewport overlay, content vertically and horizontally **centred**, max-width 600px. This is a full-screen transient moment rather than page content, so it does not follow the site's left-margin convention.

**Background.** `--bg`, overlaid with an original pixelated noise texture: an inline SVG `feTurbulence` (`fractalNoise`, `baseFrequency 0.5`, fixed `seed` so it is identical across builds) collapsed to a single luminance channel by `feColorMatrix`, then quantised by a `discrete` alpha ramp so it reads as small flat squares rather than film grain. The collapse is load-bearing — turbulence generates each channel independently, so without it the three drift apart and the texture speckles green and magenta. Rendered at 120px and scaled to 360px so cells land at 2–4px, tiled, at `opacity: 0.05`. Measured from the compositor: **3 distinct tones spanning `rgb(17,18,20)` (`--bg` exactly) to `rgb(26,27,29)` (effectively `--bg-raised`)**. Generated in CSS — no image request, no build step, no third-party asset.

**Foreground**, stacked and centred with a 1rem gap:
1. **Percentage readout** — `--font-mono`, `1.125rem`, `--fg`, `tabular-nums`. Directly above the square. Rendered `0%` in the markup, so the overlay is never blank before script runs.
2. **The square** (`BootSquare.astro`) — `clamp(120px, 20vw, 180px)` (120px at 375, 180px at 1280), background `--boot-square-bg` (`#0b0c0e`): the unfilled box, darker than `--bg` so it reads as a distinct object against the texture. Since increment 12 it is a CSS grid of **8 × 8 = 64 cells** with **2px gaps** (cells 20.75px at 1280, 13.25px at 375), so they read as distinct blocks rather than a smooth surface. An unfilled cell is transparent over the box; a filled cell (`data-on`) is `--heading` — not `--accent`, so the fill reads the same under both accents. The **two newest cells carry `data-lead` and sit in `--accent`** until the next step lands, then settle to `--heading`: a leading edge that shows where the fill is now, and the one accent-switchable element on the boot screen (the job the old ring did). Chosen over a plain `--heading`-only fill by eye, both built and screenshotted at the same steps. Each cell pops in with a `120ms` ease-out `background-color` transition, `none` under reduced motion. All 64 cells render unfilled, so the frame before script runs shows the empty box.

   **Fill order.** `FILL_ORDER` in `src/scripts/boot-fill.ts` is a literal permutation of 0–63 (row-major index = row × 8 + column), generated **once, offline**, by a Fisher–Yates shuffle over mulberry32 with **seed 73** and pasted into source — nothing is shuffled at runtime, so the pattern is identical on every load and inspectable in the file. Seed 73 was chosen because its first eight cells `[5, 15, 8, 25, 46, 57, 43, 9]` land in five rows, six columns and no more than three per quadrant, so the fill reads scattered from the first step; it is neither raster nor spiral. Fixed rather than random for the same reason the pause points and the readiness table are: reproducible for the harness, and this plays once per session.

   **Cells per step.** `cellsFor(step) = round(percentFor(step) / 100 × 64)`, where `percentFor(step) = round(step / 24 × 100)` is the same number the readout prints — so over the 24 steps the count runs 0, 3, 5, 8, 11, 13, 16, 19, 21, 24, 27, 29, 32, 35, 37, 40, 43, 45, 48, 51, 53, 56, 59, 61, 64. The filled set at any step is the first `cellsFor(step)` entries of `FILL_ORDER`, so cells accumulate and **never unfill**; `paint(step)` writes the percentage, the status line and every cell from the same step.

   **This supersedes increment 9's centre-out guarantee.** Increments 9–11 grew three nested layers (`--heading` core, `--accent` ring, `--fg-muted` band) by a single-value `clip-path: inset()` each, verified to keep every visible edge equidistant from the box centre to 0.000px at all 25 steps. That symmetry is **deliberately abandoned**: the reference footage pops in chunk by chunk, not as a smooth centred bloom, and a scattered discrete fill reads closer to it. The trade is a blockier, less uniform square in exchange for that character; the honesty rule (nothing shown ahead of true readiness), the pause table, the percentage and the status stages are unchanged — only the visual representation of a step moved. Harness checks replace the equidistance measurement: `FILL_ORDER` is a valid permutation; the filled set is monotonic across every frame; the count equals `cellsFor(step)` on every frame; every filled cell is inside the `FILL_ORDER` prefix; the first eight are scattered as above.
3. **Status line** — `--font-mono`, uppercase, `letter-spacing: 0.12em`, `--fg-muted`, via `.label`. **Final copy (increment 10), three stage lines keyed to the 24 steps:**
   - steps 0–7: `Rendering first impressions`
   - steps 8–17: `Cutting the unnecessary parts`
   - steps 18–24: `Final cut. No re-shoots.`

   The strings live in `STATUS_STAGES` in `src/scripts/boot-copy.ts` (its own module because an `.astro` frontmatter export is not importable) with `statusFor(step)` beside them; the markup renders `statusFor(0)` so the line is never blank before script runs. The text is written inside the same `paint(step)` call as the percentage and the clip-paths, from the same step — there is no separate timer, so the line can never name a stage the square has not reached (verified: status stage ≤ stage of the displayed step on every frame, all three network conditions). Each swap is a 160ms-out / 160ms-in opacity cross-fade (`boot-status.ts`); a threshold crossed while a fade is running waits for that fade to finish and then gets a complete fade of its own to the latest stage, so fades never overlap. Rendered uppercase, the third line reads `FINAL CUT. NO RE-SHOOTS.`; the owner has an em-dash variant (`FINAL CUT — NO RE-SHOOTS`) in reserve if the periods read wrong live.

**Progress signal — unchanged from increment 8.** `document.readyState` gives the coarse floor (`loading` → 0.15, `interactive` → 0.5); between `interactive` and `complete` the settled share of `performance.getEntriesByType("resource")` entries (`responseEnd > 0`) moves the number, so on a slow network it tracks resources genuinely arriving. Because that collection only covers requests already *started*, the share pins at its ceiling while the page keeps fetching; the remaining gap is spent against the clock on an exponential curve, approaching 1 without arriving. **Only `load` reaches 1.**

**Quantisation.** Readiness is floored to one of 24 steps (`Math.floor`, so 0.99 stays at 23 and `load` is the only route to step 24 / 100%). 24 puts 25 / 50 / 75 % exactly on steps 6 / 12 / 18; each step is 4.17 %, two or three cells. The number, the status line and the cells update together from the same step.

**Paced reveal.** Every frame records the highest step the page has genuinely reached. Step *k* goes on screen once it has been reached **and** its time slot has opened. Since increment 11 the slots are a **fixed, non-uniform table** (`src/scripts/boot-schedule.ts`), not `k × dwell / 24`: fast climbs punctuated by three deliberate holds, echoing the jump / stall pattern of the reference footage. Cumulative slot-open times at the 6000ms dwell: 0, 180, 360, 540, 720, 900, **1080** | **1780** | 1960, 2140, 2320, 2500, 2680, 2860, **3040** | **3840** | 4038, 4236, 4434, 4632, **4830** | **5430** | 5620, 5810, 6000 — i.e. ~180ms per step with **holds of 700ms at step 6 (25%), 800ms at step 14 (58%) and 600ms at step 20 (83%)**. The table is a seven-row segment list, linear within each segment, scaled to whatever dwell the component passes. Fixed rather than randomised so the never-ahead-of-truth harness stays reproducible; this plays once per session, so variety would buy nothing. On an instant load that walks all 24 steps on that rhythm; on a slow load the slots are already behind, so a checkpoint shows the frame it lands, and a real jump shows as a jump — measured with the hero image held until 7.2s: `100%` appeared **16ms (one frame) after `load`**. While the slots are pacing, each step holds for at least 75 % of its own slot even if a long frame delayed the one before it, so a hitch cannot collapse two steps into a flicker and a scheduled pause is never cut short. **Nothing is ever shown ahead of true readiness**: the pacing only decides *when* an already-true step is displayed. Verified frame by frame under three network conditions: displayed step ≤ floor(readiness × 24) on every frame, zero violations.

**Timing.** Dwell 6000ms, grace cap 9000ms (increment 11; 4200 / 6500 in increment 10 and 2800 / 4500 in increment 9 both read too fast). The cap is armed at **t=0, not after the dwell** (the increment 1.7 bug). The grace cap does **not** snap to 100%: the page is not loaded, so the overlay fades from wherever the readout genuinely stands (measured: 96%). A **skip** does snap to full — the visitor asked to move on. Reveal: 400ms fade, then removal from the DOM, with a 500ms timeout as belt and braces; the `transitionend` listener ignores the cells' bubbled `background-color` events, which would otherwise end the fade at 120ms.

Behaviour:
- Once per browser session via `sessionStorage` key `boot-seen`. Same-session reloads go straight to the hero.
- The overlay is **visible by default in CSS**, needing no JavaScript to show. A synchronous inline script placed immediately after the overlay markup (classic, not a module, so it is not deferred) removes it before first paint when `boot-seen` is set or reduced motion is on. Repeat visits and reduced-motion visitors therefore never see a frame of it, and there is no flash of the hero before the overlay appears.
- A deep link — any URL with a fragment, including the redirected old routes — lands mid-page rather than on the hero, so the same inline script removes the overlay before first paint and leaves `boot-seen` unset. Before the 2026-09-20 audit the browser's own fragment scroll tripped the scroll skip a frame after first paint, and the overlay flashed for one 400ms fade over a page still scrolling to its anchor.
- Reduced motion is covered twice: the same inline script, and a `prefers-reduced-motion` CSS rule that hides the overlay outright. The layer transitions carry their own reduced-motion rule as belt and braces.
- Without JavaScript a `<noscript>` rule hides the overlay, since nothing would remove it.
- Skippable by click, keypress, wheel, touch or scroll: the sequence stops, the square snaps to full, and the overlay fades.
- The hero image stays `loading="eager"` behind the overlay so it is painted before the reveal.
- Budget: **2340 B gzipped, all inline, no external script** against the 40 KB cap (measured at the end of increment 12; 2167 B at increment 11, 2005 B at 10, 1570 B at 9).
- Accessibility: the overlay is `aria-hidden` (decorative — the real `<h1>` carries the name) and focus moves to the top of the document once it is removed.

Measured overlay lifetime after module start (increment 12, unchanged from 11 — the grid changed nothing in the timing): **6.43s unthrottled** (6.0s paced dwell + 0.4s fade; 25 distinct steps, fast steps held 166–201ms, the three pauses **702 / 799 / 600ms**); **7.5s at 200kb/s** (`load` arrived at 7.1s, after the dwell, and `100%` showed the frame it landed); **9.4s at 60kb/s**, ended by the grace cap at 96% because `load` never arrived; with the hero image held and released at 7.2s, `100%` at `load` + 16ms and removal 416ms later. The pauses measure the same under all three conditions. Stage lines landed at 2.14s (step 8) and 4.61s (step 18) on the fast run.

### 5.11 Experience timeline `[now]`
A section between the Tech stack and Projects (`#experience`; increment 13, visual rebuild 13.1, scroll scrub 14, layout / hierarchy / polish 14.1). In document order: the eyebrow "Journey" and the h2 "Experience" **in normal flow at shell width**, then a **scroll track** whose sticky pin holds only an NLE-style editor that runs viewport edge to edge — a black **monitor** above a slim multi-track **timeline** — so **scrolling the track scrubs the timeline**. `ExperienceTimeline.astro` owns the section, heading, track, pin, moments data and monitor box; `ExperienceFrame.astro` renders one monitor frame; `ExperienceTrack.astro` renders the ruler, both track rows, the A1 waveform and the playhead; `ExperienceClip.astro` is one clip button; `src/scripts/experience-timeline.ts` holds the one `commit` path plus click / focus / hover, `src/scripts/experience-scrub.ts` maps the track's scroll progress to it, and `src/scripts/experience-playhead.ts` moves the playhead.

**Content** (unchanged since increment 13). Four moments in this order, each a year label, a one-word keyword taken from its own sentence, and the owner's sentence verbatim as the body:

| Clip | Year | Keyword | Body (verbatim) | Cover |
| --- | --- | --- | --- | --- |
| amber | 2025 | JavaScript | 2025 — Learnt C, HTML, CSS and JavaScript | — |
| sky | 2025 | Python | 2025 — Learnt Python and MySQL | — |
| mint | 2026 | KalaCart | 2026 — Built KalaCart: AI Market Linkage for Artisans | the projects collection's `kalacart` cover through `<Image>` (lazy, 636 / 1272 widths, the same two renditions the project card emits) — no new asset |
| periwinkle, planned | Now | Recurzn | 2026 — Building Recurzn, a cross-platform Self-Improvement App | none: planned, no asset exists |

The moments are a typed const in the component, not a collection: nothing renders a per-entry body and the four rows change together with this table. A fifth "2025 · VJIT" clip was offered in planning and declined. **The keyword is the clip's label only** (increment 14.1): the monitor never repeats it as a heading.

**Layout.** The heading block (`padding-top: var(--rhythm)`, eyebrow, h2 with 2rem below) scrolls past normally. The `#experience` anchor keeps the global `scroll-margin-top` (nav + 1rem), so a nav click lands the section top at 80px with the heading under the bar and the monitor's top on screen below it; the pin engages ~210px later, when the track's top reaches the viewport top. The track is `height: var(--pin-length)` with `--pin-length: 250vh` (the one number to tune): the pin travels `250vh − 100dvh`, so each clip zone is a quarter of that (37.5vh). The pin is `position: sticky; top: 0; height: 100dvh; padding-top: var(--nav-height)` (the fixed nav is opaque past the hero) — the `Wordmark.astro` technique — and is a flex column of exactly two children: the monitor (`flex: 1`) and the timeline. Measured pinned viewport: monitor **744px** at 1280×900 (539 before 14.1) and **496px** at 375×667 (309 before), timeline **90px** at both.

**Interaction — three equal ways to pick a clip, one code path.** Scrolling the track, clicking a clip, or focusing it from the keyboard (Tab, then Enter / Space) all call the same `commit(id)`: that clip becomes `aria-pressed="true"`, its frame shows in the monitor and the playhead moves to it. None is secondary: a click or a key press wins at once at any scroll position, and the next scroll *zone change* takes over again.

- **Scroll scrub** (`experience-scrub.ts`). Progress is `(scrollY − trackTop) / (trackHeight − innerHeight)` clamped 0–1, computed from the absolute scroll position each frame (stateless, so scrolling back reverses exactly); the zone is `min(3, floor(progress × 4))`; edges measured at exactly 25 / 50 / 75 % at both viewports. Only a zone change commits. The `scroll` and `resize` listeners are passive and only schedule one `requestAnimationFrame`; the frame reads and calls `commit` — no per-event layout work (CLAUDE.md §4) — and an `IntersectionObserver` attaches them only while the track is on screen. Past the track the pin releases and the page scrolls on into Projects.
- **Click / keyboard.** Real `<button>`s; Enter and Space are native activation, the script handles no keys. Focus commits too.
- **Hover preview** (fine pointers only, `(hover: hover) and (pointer: fine)`): a temporary layer over whatever is committed — by scroll, click or key — that never changes `aria-pressed`; the playhead follows it; `mouseleave` restores the committed clip (the scroll-committed one, not clip 1). A preview needs a real cursor movement: no `mouseenter` handler; the lane listens to `mousemove` and previews only when the coordinates differ from the last ones seen (first event: `movementX/Y` non-zero) *and* lie inside the target clip's rect. Scrolling under a stationary cursor fires `mouseenter` (Chrome: exactly one in the regression run) and changes nothing.
- **No `aria-live`**, on purpose: the clip's name and description already say what the monitor shows.

**Monitor.** Full viewport width on `--monitor-bg` — the site's one pure-black surface (§4.2) — `overflow: hidden`, no padding, border or radius, `flex: 1` in the pin, height constant across all four states. It is a size container (`container-type: size`) so a frame can cap its cover in `cqh`. Every frame is in the HTML, stacked in the same grid cell (`grid-area: 1 / 1`), content centred. **Hierarchy (14.1):** a `.meta` year label, then the verbatim sentence as the dominant text — a `<p>` (still `id="experience-<id>"`, the clips' `aria-describedby` target) in `--font-display` 700 at `clamp(1.75rem, 4vw, 3rem)`, line-height 1.1, at most 24ch, `--fg`. No `<h3>`: the section's only heading is its h2. The KalaCart frame stacks the cover under the text on phones (cover ≤ 36cqh tall) and splits 2fr / 3fr from 768px with the cover on the right (≤ 560px wide, ≤ 70cqh tall); every frame's content measured inside the box at both viewports. A decorative `aria-hidden` timecode sits bottom-right of each frame. Inactive frames are `opacity: 0; visibility: hidden`, so only the active one is in the accessibility tree. A swap is a 180ms opacity cross-fade; under `prefers-reduced-motion: reduce` there is no transition and the swap is instant.

**Timeline** — a 90px strip on `--timeline-bg`, full viewport width, `overflow-x: auto`. Three rows, each `header | lane`: the header is a 90px sticky-left cell on `--bg-raised` with a 1px `--line` right edge and a **single-line** label (`V1` 0.6875rem `--fg`, then `video` / `audio` as 0.625rem `.meta`); every lane is the same `repeat(4, minmax(150px, 1fr))` grid with 2px gaps, so ruler ticks, clips and waveforms line up by construction (tick left = clip left, 0px off, at both widths). Below 694px the rows overflow and the timeline scrolls sideways under the sticky headers; the document never does. Row heights measured: ruler **22px**, V1 **39px** (34px clip + 2px lane padding each side + 1px border), A1 **29px**.

- **Ruler** (`aria-hidden`): blank corner, then one tick cell per clip column with a 1px `--line` left edge, minor ticks every quarter column along the bottom, and a 0.625rem timecode.
- **V1 / video**: the four clips in a `role="group"` (`aria-label="Moments"`). A clip is a real `<button type="button">` drawn as a **flat 34px block**: `--tone` (one of `--word-amber` / `--word-sky` / `--word-mint` / `--word-periwinkle`, in that order) ground, `--bg` text, a 1px `--timeline-bg` edge, 2px radius, and a 2px darker bottom edge (`inset 0 -2px 0 color-mix(in srgb, var(--tone) 65%, var(--timeline-bg))`) — no texture. Increment 14.1 compared this against a faint diagonal stripe (opacity 0.05, 6px period): the flat fill with a darker edge is how editing software draws clips, the stripe only added noise, so the stripe went. One line of label: year (`.meta` 0.625rem, 0.8 opacity) then keyword (`--font-display` 600, 0.75rem); at 375 the label leaves ≥ 42px spare in the 150px column — no wrap, no truncation. Hover → `brightness(1.08)`; pressed (`aria-pressed="true"`) → an inset 2px `--accent` ring over the bottom edge; the focus ring is the global `:focus-visible`. The accessible name is the two visible labels (year + keyword) and `aria-describedby` points at the frame's body sentence.
- **A1 / audio** (`aria-hidden`): one cell per column with an inline SVG of **40 thin bars** (`<rect>`s 1.4 wide in a 100 × 24 viewBox, heights 3–22 centred on the midline, `preserveAspectRatio="none"`) in `--tone` at 0.4 opacity. The heights come from a tiny seeded LCG in the component's frontmatter (seed = clip index + 1), so every build draws the same waveform. Decoration only: no controls, no tab stops (0 focusable nodes measured). Note: the nav's scroll progress (§5.1) is a single hairline fill, not a bar waveform — there was no bar pattern to reuse, so this is the site's only one.
- **Playhead** (`aria-hidden`): a 2px `--accent` line spanning all three rows with a triangle flag in the ruler, absolutely positioned inside the rows. Its CSS default puts it on the first clip's left edge so the no-JS page is right; the script only ever sets `transform: translateX()` from the active clip's `getBoundingClientRect()` relative to the rows (0px off in every state at both widths, after scroll, click or key), re-measured by a `ResizeObserver`. The move is a 200ms transform transition; `0s` under reduced motion.

**Planned clip.** The Recurzn clip carries the shared `.planned` utility from `global.css`: `opacity: 0.5` plus `border-style: dashed`. The clip's own defaults sit in `@layer components`, so the unlayered utility wins without `!important`. The project frames (§5.3) use the same utility since increment 15.

**Reduced motion.** The pin stays active: `position: sticky` is layout, not animation, and a zone change is a discrete state change, so the mechanic adds no motion beyond the user's own scroll. What it triggers obeys the existing rules — the cross-fade and the playhead glide are `0s` under `prefers-reduced-motion: reduce`, measured after a scroll-driven commit. The alternative (un-pin the section under reduce, leaving click / keyboard only) was considered and rejected in increment 14.

**No JavaScript.** A `<noscript><style>` inside the section (the BootPreloader pattern) makes the track `height: auto`, the pin `position: static` and the monitor `flex: none; 60vh / min 340px`, so the heading is followed by an ordinary content-height editor showing the first clip with the playhead on it, and the page scrolls past it into Projects. With JavaScript the pinned CSS is the default, so nothing shifts at hydration.

Verified in increment 14.1 (SESSION.md, headless Chrome over CDP at 1280×900 and 375×667, local then live): pin children are exactly the monitor and the timeline; heading fully above the viewport while pinned; nav anchor → section top 80px, heading visible, pin not engaged; scrolling the track in 5 % steps commits `web → python → kalacart → recurzn` forward and the reverse backward; zone edges at 25 / 50 / 75 %; pin `top` 0 throughout; monitor one height per width across all four states; playhead 0px off after scroll, click and key; ticks 0px off; release into Projects; wheel, click-while-pinned, hover revert, keyboard at 5 / 40 / 95 %; no-JS un-pinned with the heading in flow; no horizontal overflow. Client JS **3.9 KB gzipped, all inline**, against the 40 KB cap.

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
A `superRefine` enforces "required unless planned" at build time, so a live or in-progress frame cannot ship without a summary and stack (CLAUDE.md §7). `status` is data only — nothing prints it; "planned" dims and dashes the frame (§5.3). `role` and `video` were removed with the case study. `src/content/now.json` was never created; the strip it would have fed was removed in increment 16 (§5.4).

## 7. Assets

- Hero subject: transparent PNG, ~1200x1600, real cutout to be supplied by owner `[TODO]`.
- Demo videos `[parked]` (no `video` field or branch since increment 6): under 8 seconds, 1080p max, WebM (VP9) + MP4 (H.264), poster JPG, muted. `[TODO]`
- Résumé: `public/resume.pdf` `[TODO]`
- Every external asset logged in `ASSETS.md` with source and license.

## 8. Non-functional requirements

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95 on mobile.
- Client JS ≤ 40 KB gzipped per page at launch.
- Largest Contentful Paint ≤ 2.0s on a mid-range Android over 4G (hero image is the LCP element; keep it under 250 KB). **Excludes first-visit sessions where the §5.10 boot preloader plays.** The target applies to repeat visits within a session (`boot-seen` set), reduced-motion visitors, and any load where the preloader is skipped. In the first three the overlay is removed before first paint, so the hero is the LCP element as normal; on a skip the overlay paints first and the hero is revealed as soon as the visitor skips.
- The preloader covers the hero on a first visit, so a field LCP measurement for those sessions reads the overlay, not the hero. That is accepted, not a regression. Since increment 11 the overlay lasts 6.4s on a fast connection (a 6.0s paced dwell plus the 0.4s fade) and at most 9.4s under the grace cap — now in the region of the fixed ~7s the greeting cycle held it for, by the owner's choice. The hero image still loads `eager` behind the overlay so it is painted and ready at the moment of reveal.
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
7. `[dropped]` "Currently building" strip (marquee + `now.json`) — the static line was removed in increment 16 (§5.4). OG image and analytics stay `[next]`.
8. `[later]` Community section, external component adoption (per CLAUDE.md §6), reference-site pattern pass.
9. `[done]` Increment 13: Experience section (§5.11) and the fourth nav anchor with the phone step-down (§5.1). Increments 7–12 (tech stack, progress bar, boot preloader) are recorded in §5.1, §5.6 and §5.10 rather than here.
10. `[done]` Increment 13.1: Experience visual rebuild (§5.11) — full-bleed black monitor over a ruler / V1 / A1 timeline with a measured playhead; content and accessibility unchanged from increment 13.
11. `[done]` Increment 14: Experience pinned and scroll-scrubbed (§5.11) through the same commit path as click and keyboard; section order corrected so Experience precedes Projects (§3), nav links to match (§5.1).
12. `[done]` Increment 14.1: Experience heading moved out of the pin, timeline slimmed to 90px, monitor takes the pinned viewport; the sentence leads the monitor (no keyword heading); A1 bar waveform, `audio` label, flat clip fill (§5.11).
13. `[done]` Increment 15: Projects as a film-strip contact sheet (§5.3) — sprocket frames in an auto-fill grid, hover / focus expand on fine pointers, quick links on no-hover devices, `ProjectCard.astro` removed.
14. `[done]` Increment 15.1: Projects frames two per row, no year tag, detail panel opens below the frame (opacity reveal, cover untouched, siblings unmoved), 1.02 lift (§5.3).
15. `[done]` Increment 16: Currently building strip removed (§5.4); About rebuilt as a full-bleed comic page of five placeholder panels with a clock-cycled colour grade, frozen on full colour under reduced motion (§5.6); footer rebuilt as a credits roll over guarded contact links, `isUrl` shared from `src/lib/is-url.ts` (§5.8).
16. `[done]` Increment 17: the footer's credits roll made real — sticky pin in a 250vh track, the roll translated by a view timeline (script fallback), title card in, contact card out with the links centred at the document's end; keyboard focus jumps to the settled frame; static block for no-JS and for reduced motion (§5.8).
17. `[done]` Increment 18: Tech stack rebuilt as an RPG-style skill tree — six solid-accent roots fanning to 14px leaf pills in two columns, a dashed `.planned` learning cluster, stacked spine-and-chain layout below 960px, no script; `TechStack.astro` deleted (§5.6).
18. `[done]` Increment 19: Skills h2 renamed to match the nav; branches scale with the leaf count (`max(2, ceil(n/3))`: Languages, Frameworks and AI fork three ways), the fan draws one evenly spread line per branch, and the desktop tree becomes centred wrapping rows of fixed 8rem columns because three 3-branch groups no longer fit one band (§5.6).
19. `[done]` Increment 20: the video-editing constellation (§5.6) — a second, separate Skills section (`#skills-video`, `SkillConstellation.astro`), nine named stars joined by ten 2px accent lines into one shape, portrait box on a phone and 16:10 from 768px, static and script-free; nav unchanged.
20. `[done]` Increment 21: the footer's credits roll replaced by four staged reveals (§5.8) — the pin stays, but the continuous `.roll` becomes four stages stacked in one grid cell and committed by `experience-scrub.ts`'s zone engine, so each settles into the same fixed position instead of being pushed off the top edge; entrance slides up and fades, exits fade in place; stages hide with opacity (not `visibility`) to keep the contact links focusable for the keyboard jump; the pin now stays under reduced motion with instant swaps, matching Experience's rationale; `credits-roll.ts`, `@keyframes credits-roll` and the view timeline deleted.

## 11. Open decisions

- Final accent: crimson vs violet, decided by eye on the live site.
- Hero subject: photo cutout vs rendered object.
- Custom domain name.
