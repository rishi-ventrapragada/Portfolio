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
| Experience: monitor + clip track of four moments | `#experience` | §5.11 |
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
--boot-square-bg: #0b0c0e   boot preloader square backdrop (§5.10) — the only place it is used

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
| Projects | `#projects` |
| Experience | `#experience` |
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
A section between the "currently building" strip and the footer (`#experience`, increment 13): eyebrow "Journey", h2 "Experience", then an NLE-style **monitor** above a horizontal **track** of clips. `ExperienceTimeline.astro` owns the section, the monitor box and the track; `ExperienceFrame.astro` renders one monitor frame; `src/scripts/experience-timeline.ts` holds the behaviour.

**Content.** Four moments in this order, each a year label, a one-word keyword taken from its own sentence, and the owner's sentence verbatim as the body:

| Clip label | Year | Keyword | Body (verbatim) | Cover |
| --- | --- | --- | --- | --- |
| `2025 · JavaScript` | 2025 | JavaScript | 2025 — Learnt C, HTML, CSS and JavaScript | — |
| `2025 · Python` | 2025 | Python | 2025 — Learnt Python and MySQL | — |
| `2026 · KalaCart` | 2026 | KalaCart | 2026 — Built KalaCart: AI Market Linkage for Artisans | the projects collection's `kalacart` cover through `<Image>` (lazy, 636 / 1272 widths, the same two renditions the project card emits) — no new asset |
| `Now · Recurzn` | Now | Recurzn | 2026 — Building Recurzn, a cross-platform Self-Improvement App | none: planned, no asset exists |

The moments are a typed const in the component, not a collection: nothing renders a per-entry body and the four rows change together with this table. A fifth "2025 · VJIT" clip was offered in planning and declined.

**Monitor.** `--bg-raised`, 1px `--line`, 1.5rem padding, `min-height: 14rem`. Every frame is in the HTML and stacked in the same grid cell (`grid-area: 1 / 1`), so the box is always as tall as its tallest frame — 290.8px at 1280 and 347.6px at 375 in every state — and never resizes on a swap. A frame: `.meta` year, `<h3>` keyword, the body at `clamp(1.125rem, 2vw, 1.375rem)`; the KalaCart frame splits 3fr / 2fr with the cover on the right from 768px. Inactive frames are `opacity: 0; visibility: hidden`, so only the active one is in the accessibility tree. A swap is a 180ms opacity cross-fade (`visibility` flips after the fade on the way out, at once on the way in); under `prefers-reduced-motion: reduce` there is no transition and the swap is instant. The first frame is active from the server, so the section reads without JavaScript.

**Track.** Four real `<button type="button">` clips in one `role="group"` row (`aria-label="Moments"`), `overflow-x: auto` so it scrolls sideways on phones (657px of clips in a 327px row at 375) with a 0.375rem inset so a focus ring is never clipped. Pill conventions from `Pills.astro`: `.label` mono uppercase, 1px `--line`, 2px radius, transparent ground, `--fg` text. Hover → `--accent` text; pressed (`aria-pressed="true"`) → `--accent` text and border, the site's active-state rule; the focus ring is the global `:focus-visible`. The accessible name is the visible label (year + keyword) and `aria-describedby` points at the frame's body sentence, so a screen reader hears "2026 · KalaCart, button, pressed, 2026 — Built KalaCart…" on focus.

**Planned clip.** The Recurzn clip carries the shared `.planned` utility from `global.css` (increment 13): `opacity: 0.5` — the project card's planned treatment — plus `border-style: dashed`. The clip's own defaults sit in `@layer components`, so the unlayered utility wins without `!important`; any future planned element takes the same class. `ProjectCard.astro` still uses its own `data-status="planned"` rule (solid border); moving it onto `.planned` is a separate change.

**Behaviour** (`experience-timeline.ts`). Click and keyboard focus **commit** a clip: it becomes the pressed one and its frame shows. On fine pointers only (`(hover: hover) and (pointer: fine)`), hovering a clip **previews** its frame without changing the pressed clip, and leaving the track restores the committed frame. **No `aria-live`**, on purpose: the clip's name and description already say exactly what the monitor shows, so a live region would announce every focus twice and every hover once. Enter and Space activate the button natively — the script handles no keys.

Verified in increment 13 (SESSION.md): Tab reaches the four clips in order and each focus commits; Enter and Space commit; the fade samples 0 → 0.64 → 1 at 4 / 71 / 372ms and is `0s` under reduced motion; hover previews and reverts; both accents; the `#experience` anchor lands 80px under the top. Client JS **3272 B gzipped, all inline** (2340 B at increment 12), against the 40 KB cap.

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
7. `[next]` "Currently building" strip (marquee + `now.json`). OG image and analytics.
8. `[later]` Community section, external component adoption (per CLAUDE.md §6), reference-site pattern pass.
9. `[done]` Increment 13: Experience section (§5.11) and the fourth nav anchor with the phone step-down (§5.1). Increments 7–12 (tech stack, progress bar, boot preloader) are recorded in §5.1, §5.6 and §5.10 rather than here.

## 11. Open decisions

- Final accent: crimson vs violet, decided by eye on the live site.
- Hero subject: photo cutout vs rendered object.
- Custom domain name.
