# SESSION.md

Handoff notes per CLAUDE.md §8. Newest session at the top.

## Standing constraints

Things that outlive any one session. Read before refactoring.

### Set the Vercel alias after every major deployment

The owner approved this as a standing action on 2026-09-19. After a push that
deploys real user-visible work, wait for the build to reach `Ready`, then:

```
vercel alias set <latest-deployment-url> rishi-ventrapragada.vercel.app
```

Get the URL from `vercel ls` (row 1 = newest). Then **verify the vanity URL
itself**, not the deployment URL — the success message only says the pointer
moved, not that the right code is behind it.

**Why this is manual — corrected in increment 8.** This entry used to say the
project has no Git integration. That is **wrong**. Verified against the API:
the project *is* connected to `github:rishi-ventrapragada/Portfolio`, production
branch `main`, and every deployment in the history before increment 8 has
`source: git`. **Pushing to `main` deploys on its own; you do not need to run
`vercel --prod`.**

The real reason the alias is manual: `rishi-ventrapragada.vercel.app` is **not
a domain on the project**. The only project domain is the auto-assigned
`portfolio-gamma-lake-gtndl2ey0m.vercel.app`, which *does* auto-follow
production. The vanity URL is a bare alias pointing at one specific deployment
id, so nothing moves it but a hand-run `vercel alias set`. A green build and a
live deployment URL still do **not** mean the vanity URL moved. This has gone
stale twice (increments 1.6 and again through 1.9→5).

**Better fix available:** add `rishi-ventrapragada.vercel.app` to the project as
a domain in the dashboard. It would then auto-follow production like the
gamma-lake one does, and retire this whole entry. Owner's call.

The local Vercel CLI is authenticated as `rishi-ventrapragada` and this works.
(The Vercel **MCP connector** is a different account — `orca-frontend`,
`aws-sbg-vjit`, `krishisathi` — and cannot see this project. Don't use it here.)

A custom domain added in the dashboard tracks production automatically and would
retire this whole entry.

### Nav capacity — four links fit on phones only by a step-down (increment 13)

The bar is a `RISHI` mark (`#top`) plus four anchors: Skills, Projects,
Experience, Contact. At 375px in the normal 12px / 0.12em `.label` style the
row needs **383px of 327px** (mark 43.2 + links 339.9), so increment 13 added a
phone step-down in `Nav.astro`: below 480px the mark and links are
`--size-meta` (11px) with 0.06em tracking and a 0.75rem gap. Measured on the
built site, headless Chrome:

| Viewport | Available | Mark | Links | Spare |
| --- | --- | --- | --- | --- |
| 480px (normal style) | 432 | 43.2 | 339.9 | 48.9 |
| 375px | 327 | 36.3 | 261.1 | **29.6** |
| 360px | 312 | 36.3 | 261.1 | **14.6** |
| 320px | 272 | 36.3 | 261.1 | **−25.4 — the links run into the mark** |

**This is a known-tight fix, not a permanent one** (owner's words on
approval). It bends CLAUDE.md §3's 0.12em label rule for the phone nav only,
and the spare at 360px is one short label away from nothing. **320px phones
(iPhone SE 1st gen / 5s) already collide** — the previous three-link bar fit
there with 0px spare. Open: hide the mark below ~340px (links alone fit,
249px of 272), or accept. **The next nav addition (Community, whenever it
returns) needs a real overflow pattern for narrow phones — not another
text-size shrink.** Measure before adding anything.

### `#111214` is duplicated outside the token — change every copy together

`--bg` is defined once in `src/styles/global.css:13`, but the literal `#111214`
also appears **four times** in `src/layouts/BaseLayout.astro`:

- three in the inline critical-paint `<style>` (`:root`, `html, body`, `.boot`)
- one in `<meta name="theme-color">`, which predates the critical-paint fix

`grep -rn '#111214' src/` lists them all.

The duplicate is deliberate and load-bearing. `global.css` is bundled into an
external stylesheet, so it is not parsed in time for the first paint; without
the inline literal the page paints white on every hard reload before the dark
theme lands (see increment 2.1). It cannot reference `var(--bg)`, because the
token is defined in the file that has not loaded yet.

This bends CLAUDE.md §3 ("components never hardcode a hex"). It is the one
sanctioned exception. If the background token changes, **both** must change, or
the flash returns in the new colour. `global.css` carries a pointer comment
next to `--bg`, but a comment is easy to miss in a bulk token edit — hence this
entry.

## 2026-09-21 — increment 13

### Last milestone completed

Experience section (PRD §5.11) between the "currently building" strip and
the footer: an NLE-style monitor above a track of four clip buttons, and an
"Experience" anchor in the nav. New: `ExperienceTimeline.astro` (section,
monitor box, track), `ExperienceFrame.astro` (one frame),
`src/scripts/experience-timeline.ts` (commit on click / focus, preview on
hover), the shared `.planned` utility in `global.css`. `Nav.astro` gained
the link and the phone step-down (standing constraint above); its script
moved to `src/scripts/nav.ts` for the 200-line cap.

### Decisions the owner made in planning

- **Four clips, not five.** The brief named five clips but supplied four
  sentences. Offered the increment-5 "Started VJIT, CSE with Data Science"
  line as the fifth; the owner chose four.
- **Nav fit: shrink the phone nav text** over hiding the mark or a shorter
  label, with the fragility recorded (above).
- **`.planned` is a real shared class**, not a one-off on the clip.

### Decisions worth knowing before you touch this

- **Copy.** The four body sentences are the owner's, verbatim. The clip
  keywords (JavaScript, Python, KalaCart, Recurzn) are words from those
  sentences, picked by me; so are the "Journey" eyebrow and "Experience" h2.
  Nothing else is new text.
- **No `aria-live`.** A clip's accessible name is its visible label and its
  `aria-describedby` is the frame's sentence, so focusing a clip already
  announces what the monitor shows. A live region would say it twice per
  focus and once per hover. Enter / Space are native button activation; the
  script handles no keys.
- **Hover previews, click / focus commit.** Hover only under
  `(hover: hover) and (pointer: fine)`; leaving the track restores the
  committed frame. A pointer click also fires `focus` in Chrome / Firefox,
  so commit runs twice there — idempotent by design; Safari (no focus on
  click) takes the click path.
- **Monitor height = tallest frame.** All four frames sit in one grid cell,
  so the box never resizes: 290.8px at 1280 in every state. The text-only
  frames therefore leave empty space below their three lines on desktop.
  Centring them was considered and rejected: the three text frames would
  then shift by a few pixels between each other, which is the jump the spec
  forbids. If it looks too empty, that is the trade-off to revisit.
- **`.planned` beats a scoped rule via layers, not `!important`.** Astro's
  scoping (`.clip[data-astro-cid-…]`, 0,2,0) would outrank a global class,
  so the clip's defaults are wrapped in `@layer components` (Tailwind already
  declares the layer order) and the unlayered utility wins. Any component
  that wants `.planned` to override its own border must do the same.
- **No dashed treatment existed before.** The brief described the planned
  card as "dashed, dimmed"; the card is opacity 0.5 with a solid border.
  The clip is dimmed *and* dashed as briefed. `ProjectCard.astro` still
  uses its own `data-status` rule — moving it onto `.planned` is a separate
  decision.
- **The monitor's KalaCart image adds no image output**: same source, same
  two WebP renditions (636 / 1272) the project card already emits; the
  monitor's `sizes` is 480px from 768px up.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — Experience row in the site map. **§5.1** — four links, the
  Experience row, a phone step-down bullet with the numbers, the
  `nav.ts` note. **§5.11** — new, the full component spec. **§10** — line 9
  for increment 13 (and a note that 7–12 are recorded under §5, not §10).
- **README** — component and script lists. **SESSION.md** — this entry and
  the rewritten nav-capacity standing constraint.

### Verified by measurement, not eyeballing

Headless Chrome over CDP (`verify.mjs` in the session scratchpad; preloader
removed over CDP, scroll-behavior forced to auto) at 1280×900 and 375 / 360
/ 320 / 480 phones, reduced motion emulated per case:

- Build + `astro check`: 0 errors / 0 warnings / 0 hints. Longest file 189.
  `ExperienceTimeline` 162, `ExperienceFrame` 109, `Nav` 177.
- **Client JS: 3272 B gzipped, six inline blocks, no external script**
  (cap 40 KB; increment 12 was 2340 B).
- **Keyboard:** from the last project-card link, Tab lands on the four clips
  in order; each focus commits (`aria-pressed` on exactly that clip,
  `data-active` on exactly its frame) and `:focus-visible` matches. With
  the state made stale by hand, **Enter** on the focused clip recommits it and
  **Space** likewise. Focus ring fully inside the track's inset.
- **Cross-fade:** frame `transition-duration` "0.18s, 0s"; after a click
  the entering frame's opacity sampled **0 at 4ms, 0.64 at 71ms, 1 at
  372ms**. Under `prefers-reduced-motion: reduce`: duration `0s`, the new
  frame is at opacity 1 and the old at 0 / hidden in the same tick.
- **Hover** (fine pointer): moving onto "2025 · Python" shows its frame while
  "web" stays pressed; moving off the track restores the web frame.
- **Monitor height** identical in all four states: 290.8px at 1280, 347.6px
  at 375 (text-only and KalaCart alike).
- **Image:** `/_astro/kalacart-cover.D0KbdiRf_1NMcbk.webp` (the 636w
  candidate) loads, `naturalWidth` 479 × 264 at the 438px slot, `width` /
  `height` attributes present, `loading="lazy"`, alt set. Every image has
  `alt`; one `<h1>`.
- **Planned clip:** computed `opacity 0.5`, `border-style dashed`; pressed
  colour `#ff3b5c` under crimson and `#a78bfa` under violet (eyebrow too).
- **Nav:** the numbers in the standing constraint; `document.scrollWidth`
  equals the viewport at every width (no page overflow, even at 320 where the
  bar itself collides). Clicking "Experience" lands the section top at
  **80px**.
- **Track:** 657px of clips in a 327px row at 375 — scrolls inside the
  track, the document does not.
- Console clean on every run.
- Screenshots reviewed: desktop × four states, keyboard-focus state, violet,
  reduced-motion, 375 nav + section (web and KalaCart), 360 and 320 nav.

### Known, open

- **320px nav collision** (standing constraint above).
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain.

## 2026-09-21 — increment 12

### Last milestone completed

The square now fills cell by cell. `BootSquare.astro` is an 8×8 CSS grid of
64 `<span data-cell>` with 2px gaps; `src/scripts/boot-fill.ts` holds
`FILL_ORDER` (a literal permutation of 0–63, seed 73) and `cellsFor(step)`
(0, 3, 5 … 61, 64); `paint(step)` toggles `data-on` on the first
`cellsFor(step)` cells of the order and `data-lead` on the newest two. The
three clip-path layers, `RING_LEAD` / `BAND_LEAD` and the `[data-core|ring|
band]` hooks are gone. Timing (6000 / 9000, pause table), readiness, the
honesty rule, the percentage and the status stages are untouched.

**The centre-out guarantee from increment 9 is gone on purpose** — the
owner confirmed the trade-off before the build (PRD §5.10 records it).

### Decisions the owner made after seeing it

- **Accent leading edge ships**, not the plain fill. Both were built behind a
  `data-edge` toggle and screenshotted at 13 / 25 / 50 / 75 / 100 % in both
  accents and both widths; the owner picked the edge (my recommendation:
  it puts the accent back in the preloader, which the plain fill dropped).
  The toggle was then removed — `[data-lead]` is always `--accent`.
- **8×8 stays.** Offered 6×6 and 10×10 with the pixel sizes; owner kept 8.

### Decisions worth knowing before you touch this

- **Seed 73, and why.** Candidate seeds were screened offline for scatter:
  first eight cells in ≥ 5 rows, ≥ 5 columns, ≤ 4 per quadrant. 73 gives
  5 / 6 / [3,2,2,1]. The generator is *not* in the repo; only the literal is.
  If you regenerate, re-screen, and update the seed note in `boot-fill.ts`
  and PRD §5.10.
- **`percentFor` is now the one source of the readout's number**, and
  `cellsFor` derives from it, so the count and the percentage cannot drift.
  Both take `steps` as a parameter to avoid importing `STEPS` from
  `boot-preloader.ts` (circular).
- **The pale cells in mid-step screenshots are the 120ms settle**, not a
  third colour: a lead cell going `--accent` → `--heading`, or an unfilled
  cell going transparent → `--heading`. Screenshot ≥ 140ms after the step.
- **Gaps are the box colour.** Unfilled cells are transparent, so the 2px
  gaps and the empty cells are both `--boot-square-bg`; only filled cells
  draw. No new token.
- The overlay's `transitionend` filter (`e.target === root`) now guards
  against 64 bubbling cell transitions instead of three layer ones.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.10** — intro, foreground item 2 rewritten for the grid (cells,
  gap, order, seed, `cellsFor` table, leading edge) with an explicit
  "supersedes increment 9's centre-out guarantee" paragraph; quantisation
  sentence; budget; lifetime intro. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

Same CDP harness (session scratchpad). `recorder.mjs` now records the
filled and lead cell indices per frame; `t2` replaced the inset check with
four grid checks; `t5` pins screenshots by percentage per variant / accent.

- **All five first-paint cases + deep link** pass unchanged; 64 cells in the
  served HTML, none pre-filled, no layer hooks left.
- **Never ahead of truth:** step ≤ floor(readiness × 24) on every frame,
  fast / 200 / 60 — 0 violations. **Status ≤ stage(displayed step):** 0.
- **Pauses intact:** step 6 700 / 700 / 700ms, step 14 800 / 800 / 800ms,
  step 20 617 / 600 / 600ms; fast-step median 183–184ms.
- **Grid:** `FILL_ORDER` is a permutation (64 distinct, 0–63); **0 frames**
  where a filled cell unfilled; **0 frames** where the count ≠
  `cellsFor(step)`; **0 frames** with a cell outside the `FILL_ORDER`
  prefix — on all three network conditions. 64 / 64 at 100%, 61 / 64 at the
  96% cap.
- **Scatter:** first 8 = `[5,15,8,25,46,57,43,9]` → 5 rows, 6 columns,
  quadrants [3,2,2,1], not raster.
- **Grace cap:** stuck at `interactive`, last readout 96%, gone 9547ms after
  nav (expected ~9514). **Late checkpoint:** hero held to 7.2s → `100%` at
  `load` + 17ms, removed 417ms later.
- **Both accents:** lead cells `#ff3b5c` under crimson, `#a78bfa` under
  violet; filled cells unchanged.
- **Client JS: 2340 B gzipped, all inline** (cap 40 KB; inc 11 was 2167 B).
- Build + `astro check` 0/0/0. Longest file 189 (`boot-preloader.ts`).
- **Deployed and aliased.** Git integration built `9us508sh8` (production,
  Ready); `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it.
  Verified on the vanity URL itself: HTML byte-identical to the deployment,
  64 cells and the `FILL_ORDER` literal in the served page, no layer hooks,
  and a live CDP frame recording on the vanity origin — 25 steps, 0 step /
  0 stage / 0 grid violations, pauses 717 / 799 / 617ms, 64 / 64 at 100%,
  gone at 6.43s.

### Harness gotchas recorded for next time

- The `FILL_ORDER` literal has a trailing comma; strip it before
  `JSON.parse`. The recorder's destructured `rows` shadows any local `rows`.
- `t5` polls the percentage at 20ms; pinned frames are still occasionally
  missed at 1280 when a step lands between polls. Re-run for the missing one.

### Still open

- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain — see
  the standing constraint at the top.

## 2026-09-21 — increment 11

### Last milestone completed

Fixed non-uniform pacing and a longer dwell. The uniform `k × dwell / 24`
slot is gone; `src/scripts/boot-schedule.ts` holds a seven-row segment table
(linear within each segment) that opens the 24 slots at ~180ms spacing with
three deliberate holds — **700ms at step 6 (25%), 800ms at step 14 (58%),
600ms at step 20 (83%)**. Dwell 4200 → 6000ms, grace cap 6500 → 9000ms.
Commit `7bcd4fd`.

Untouched, as briefed: readiness, floor-not-round, t=0 arming, the no-snap
grace cap, skip-snaps-to-full, the status stages (still steps 8 / 18), the
fade path, all five first-paint bypasses and the deep-link skip.

### Decisions worth knowing before you touch this

- **Segment table, not a 25-entry array.** `[{to, at}]` rows make the three
  pauses visible as the one-step rows (`6→7 @1780`, `14→15 @3840`,
  `20→21 @5430`); the fast climbs are derived. `slotAt(step, dwell)` scales
  the table to the dwell the `.astro` passes, so `runBootSequence(6000, 9000)`
  is still the single place timing is set. Change the shape in the table,
  the length in the component.
- **Fixed, not random.** The owner's call: the never-ahead-of-truth harness
  compares displayed step to true readiness on every frame across repeated
  runs; a random schedule would only add noise, and this plays once a session.
- **Minimum hold is now per slot.** The 75% guard against a hitch collapsing
  two steps used to be 75% of the one uniform slot; it is now 75% of the gap
  `slotAt(displayed + 1) − slotAt(displayed)`, so it also guarantees a pause
  cannot be cut short by a late frame. Measured: pauses land within 2ms.
- **`slotOpen` scans, not divides.** Highest step whose slot has opened, by a
  25-iteration loop per frame — trivial cost, and it keeps the table the only
  source of truth.
- At 200kb/s `load` now arrives (7.1s) *before* the 9s cap, where at 6.5s it
  used to hit the cap. So that condition now ends at 100% one frame after
  `load`, not at 96% on the cap. Not a regression — the cap is later.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.10** paced-reveal paragraph rewritten around the table; timing,
  minimum-hold wording, budget and measured lifetimes updated. **PRD §8**
  overlay-duration note. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

Same CDP harness as increment 10 (session scratchpad, `t1`–`t4`, timing runs
one at a time). `t2` gained a pause assertion: holds at 6 / 14 / 20 must each
be ≥ 3× the median of the other holds.

- **All five first-paint cases + deep link** pass unchanged.
- **Never ahead of truth:** step ≤ floor(readiness × 24) on every frame,
  fast / 200 / 60 — 0 violations. **Status ≤ stage(displayed step):** 0.
- **Pauses visible:** step 6 **702 / 701 / 700ms**, step 14 **799 / 800 /
  800ms**, step 20 **600 / 599 / 600ms** (fast / 200 / 60), neighbours
  166–201ms, fast-step median 184ms. 0 pause points under 3× median.
- **Discrete:** 25 distinct steps fast; 24 at 60kb/s (cap); single-value
  insets, ring = core − 4, band = core − 8 at every step.
- **Stage swaps:** line 2 at 2.14s (step 8), line 3 at 4.61s (step 18);
  fade-outs ~150ms; 0 overlapping fades.
- **Lifetime:** 6.44s unthrottled; 7.5s at 200kb/s (`load` at 7.1s, `100%`
  the frame after); 9.42s at 60kb/s (cap, 96%).
- **Grace cap:** three resources stalled, `readyState` stuck at `interactive`,
  last readout 96%, overlay gone 9571ms after nav (expected ~9540).
- **Late checkpoint:** hero held to 7.2s → `100%` at `load` + 16ms, removed
  416ms later.
- **Client JS: 2167 B gzipped, all inline** (cap 40 KB; inc 10 was 2005 B).
- Build + `astro check` 0/0/0. Longest file 190 (`boot-preloader.ts`).
- **Deployed and aliased.** Git integration built `1pkumdl9f` (production,
  Ready); `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it.
  Verified on the vanity URL itself: HTML byte-identical to the deployment,
  `(6e3,9e3)` and the 1780 / 3840 / 5430 pause rows in the served page, and
  a live CDP frame recording on the vanity origin — 25 steps, 0 step / 0
  stage violations, pauses 700 / 801 / 603ms, gone at 6.42s.

### Still open

- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain — see
  the standing constraint at the top.

## 2026-09-21 — increment 10

### Last milestone completed

Status-line copy is **final, not a placeholder**, and the sequence is slower.
Three stage lines keyed to the same 24 steps that drive the readout and the
square — `Rendering first impressions` (0–7), `Cutting the unnecessary parts`
(8–17), `Final cut. No re-shoots.` (18–24) — written from inside the same
`paint(step)` call as the percentage and the clip-paths. Dwell 2800 → 4200ms,
grace cap 4500 → 6500ms. Commit `83315be`, pushed with the three audit
commits that had been sitting unpushed since 2026-09-20.

### Decisions worth knowing before you touch this

- **No separate timer for the text.** `statusFor(step)` in `boot-copy.ts` is
  a pure function of the step; `boot-status.ts` only owns the cross-fade. The
  honesty rule for the percentage therefore covers the line for free.
- **Fades never overlap.** The writer snapshots the target line when a fade
  starts, runs a full 160ms-out / 160ms-in, and only then looks again; a
  threshold crossed mid-fade waits and gets a complete fade of its own to the
  latest stage. In practice fast loads leave 1.75s between swaps, so this only
  matters when a late checkpoint jumps two stages at once.
- **`data-stage`, not `data-status`.** `ProjectCard.astro` already uses
  `data-status` for the project status; a document-wide `[data-status]` query
  lands on a card once the overlay is gone. The preloader's query is scoped to
  the overlay so it was never a product bug, but the harness tripped on it.
- **Period kept in the third line.** Rendered `FINAL CUT. NO RE-SHOOTS.` in
  12px JetBrains Mono at 0.12em the full stops read as deliberate. The owner's
  reserve variant is `FINAL CUT — NO RE-SHOOTS`; note a mono em dash is one
  cell wide, so it renders closer to a hyphen than a dash. Owner to judge live.
- Slot is now 175ms (24 × 175 = 4200). The 75%-of-a-slot minimum hold still
  applies while the slots are pacing.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.10** — status line rewritten for the final copy and mechanism;
  slot, dwell, grace, budget and measured lifetimes updated. **PRD §8**
  overlay-duration note updated. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

Headless Chrome over CDP against `astro preview`, rAF recorder installed via
`addScriptToEvaluateOnNewDocument`; scripts in the session scratchpad
(`t1`–`t5`). Timing-sensitive runs were run one at a time.

- **All five first-paint cases** pass unchanged, plus the deep-link case:
  `/#projects` on a fresh session → overlay absent at DCL, `boot-seen` unset.
- **Never ahead of truth:** displayed step ≤ floor(readiness × 24) on every
  frame, fast / 200kb/s / 60kb/s — 0 violations. **Status never ahead of the
  square:** stage(text) ≤ stage(displayed step) on every frame — 0 violations.
- **Discrete:** 25 distinct steps on a fast load, holds 165–185ms (slot
  175ms); ring = core − 4, band = core − 8, single inset value, at all 25.
- **Stage swaps:** line 2 at 1.58s (step 8), line 3 at 3.33s (step 18); each
  fade-out ~165ms; zero overlapping fades.
- **Lifetime:** 4.63s unthrottled; 6.9s at 200kb/s and at 60kb/s, both ended
  by the grace cap at 96% with `load` never seen.
- **Grace cap:** three resources stalled, `readyState` stuck at `interactive`,
  last readout 96% (never 100%), overlay gone at cap + fade (7097ms after nav
  vs 7054 expected).
- **Late checkpoint:** hero image held to 5.2s → `100%` at `load` + 19ms,
  removal 414ms later.
- **Client JS: 2005 B gzipped, all inline** (cap 40 KB; inc 9 was 1570 B).
- Build + `astro check` 0/0/0. Longest file 187 (`boot-preloader.ts`).
- **Deployed and aliased.** Git integration built `mllxelx4y` (production,
  Ready); `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it.
  Verified on the vanity URL itself, not the deployment URL: HTML
  byte-identical to the deployment, `(4200,6500)` and all three lines in the
  served page, and a live CDP frame recording on the vanity origin — 25
  steps, 0 step / 0 stage violations, swaps at 1.58s and 3.32s, gone at 4.63s.

### Harness gotchas recorded for next time

- The browser round-trips `inset(N%)` strings, so comparing parsed layer
  insets needs a ~0.001 tolerance; at 1e-6 five steps "fail" on float noise.
- `[data-status]` is not unique in the document (see above).

### Still open

- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain — see
  the standing constraint at the top.

## 2026-09-20 — full audit

### Last milestone completed

A full audit of the build so far: every source file read against CLAUDE.md
and PRD.md, the production build inspected, and the built site driven in
headless Chrome over CDP at 1280×800 and 375×667, plus reduced-motion and a
forced script-fallback run. Two defects found and fixed, docs refreshed.

### Fixed

- **Deep links flashed the preloader.** Landing on `/#projects` (what the
  redirected `/about` and `/projects/*` routes produce) painted the overlay,
  then the browser's own fragment scroll tripped the `scroll` skip a frame
  later, so the visitor saw a 400ms fading overlay over a page still scrolling
  to its anchor. The inline first-paint script now also removes the overlay
  when `location.hash` is set, the same path as a repeat visit. `boot-seen`
  stays unset on that path, so a later hard load of `/` still plays it once.
  Judgement call: the PRD said "scroll skips"; a self-inflicted skip on frame
  one is a flash, not a skip. PRD §5.10 records the new behaviour.
- **Hero.astro was 253 lines**, over the CLAUDE.md §5 cap and open since
  increment 6. Layer A now lives in `Wordmark.astro` (162 lines: markup, all
  wordmark CSS, the dissolve, the mobile and reduced-motion branches) and its
  Firefox script branch in `src/scripts/hero-dissolve.ts`, mirroring the
  preloader split. `Hero.astro` (71 lines) keeps the section, the grid and the
  subject. The fallback flag moved from `.hero[data-fallback]` to
  `.wordmark-wrap[data-fallback]` so nothing crosses component scope; the
  unused `data-hero` hook is gone. The anti-merge prefix on the longhand rule
  is now `:where([data-wordmark])`; the built CSS still carries
  `animation-timeline:scroll(root)` and `animation-range:0 40dvh` as
  longhands with no `animation:` shorthand anywhere.
- README listed the deleted `Skills` / `SkillGroups` components and missed
  `TechStack`, `Pills`, `BootSquare`, `Wordmark` and the scripts; ASSETS.md
  still said `/about` links to the résumé.

### Verified by measurement (unchanged before and after the split)

- Build + `astro check`: 0 errors / 0 warnings / 0 hints. Longest file 197.
- Client JS: no external `<script src>`; five inline scripts.
- Preloader: 24 distinct steps across the 2800ms dwell, `100%` on `load`,
  removed ~3.3s; absent at the first sample under reduced motion and on a
  same-session reload; absent at the first sample on a `#projects` arrival.
- Nav: transparent at scrollY 0–798, raised at 802 (hero 800 tall), and at
  0–665 / 669 on the phone. Mark ends at 67px, links span 122–351 of 375.
- Progress fill: `scaleX` 0 at top, 0.30 at the hero's foot, exactly 1 at the
  bottom; identical numbers from the CSS branch and the forced script branch.
- Dissolve: opacity 1 / filter none at rest; 0.50 and 4px blur at 20% of the
  viewport; 0 and 8px at 40%; identical from both branches.
- Anchors: `#about`, `#skills`, `#projects` land with the section top 80px
  below the viewport edge; `#contact` is limited by page end; `#main` and
  `#top` return to 0.
- No horizontal overflow at 375. One `<h1>`. Every image has `alt`. Console
  clean on every run.
- Cards: KalaCart at opacity 1 with both links as real hrefs; Recurzn at 0.5
  with title and year only. Two columns of 518px at 1280, one of 277px at 375.
- Wordmark box 172,72 922×330 and subject 398,193 470×607 at 1280; 23,171
  330×118 and 23,241 330×426 at 375 — byte-identical to the pre-split run.

### Looked at and left alone

- `<meta name="twitter:card" content="summary_large_image">` with no
  `og:image` / `twitter:image`. Harmless until the OG image lands (PRD §8,
  `[next]`); switch to `summary` or add the image then.
- `vercel.json` carries two redirect rules that `/projects/:path*` already
  covers. Verified live in increment 6; not worth a redeploy to tidy.
- `.grid` is both a scoped class and a Tailwind utility; both say
  `display: grid`, so no conflict.
- `Footer.astro` bakes the copyright year in at build time. Standard for a
  static site; it refreshes on the next deploy.
- `AGENTS.md` sits untracked at the root: a Codex-flavoured copy of CLAUDE.md.
  Owner's file — neither committed nor removed here.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.10** — one bullet under Behaviour for the deep-link path.
- **README.md**, **ASSETS.md** — corrections above. **SESSION.md** — this.

### Not done

- **Not pushed.** Three local commits on `main`. Pushing deploys, and the
  alias step in the standing constraint needs the owner's CLI session.

### Still open

- Status-line copy (`STATUS_TEXT`), `public/resume.pdf`, the About photo.
- Final accent, custom domain, vanity URL as a project domain (PRD §11).

## 2026-09-20 — increment 9

### Last milestone completed

Centre-out concentric loading square, replacing increment 8's bottom-up fill.
Three stacked layers (`--heading` core, `--accent` ring, `--fg-muted` band) each
revealed by a single-value `clip-path: inset(N%)`, over a new `--boot-square-bg`
backdrop, in a `clamp(120px, 20vw, 180px)` box. Progress quantised to 24 steps
and revealed through time slots across a 2800ms dwell; grace cap 4500ms.

Kept untouched, as briefed: the readiness signal, `boot-seen` gate, both
reduced-motion bypasses, `<noscript>`, skip-on-interaction, first-paint script,
noise texture, `STATUS_TEXT` placeholder pattern, fade + DOM removal.

### The status line is STILL a placeholder

`STATUS_TEXT` in `src/scripts/boot-copy.ts` reads `LOADING`. Final copy pending
the owner. One-line swap.

### Decisions worth knowing before you touch this

- **Three bands, not two.** Built both, screenshotted both (`sq3-*` / `sq2-*` in
  the session scratchpad). The muted band separates the saturated ring from the
  near-black backdrop; without it the ring reads as a haloed border rather than
  a growing band, especially at 120px where 4% is under 5px.
- **Slot model for pacing.** Step *k* shows once reached AND once `k × dwell/24`
  has elapsed. Slots are absolute from module start, so on a slow load they are
  all behind by the time late checkpoints land, and those show the frame they
  land — no artificial delay outside the dwell window. Measured: `100%` one
  frame (16ms) after `load` with a resource held to 3.6s.
- **Floor, not round.** The creep term reaches 0.99; `Math.round(0.99 × 24)` is
  24, which would let the readout hit 100% without `load`. Floor keeps 0.99 at
  23. Do not change this to round.
- **The grace cap no longer paints 100%.** The brief said "reveal anyway
  regardless of true load state" and also "no checkpoint ever displays before
  its readiness event". Resolved toward honesty: the cap fades from wherever
  the readout stands (measured 96%). A *skip* still snaps to full, as the PRD
  has said since increment 8. Judgement call — flagged in the report.
- **`transitionend` bubbles.** The layers' 180ms clip-path transitions bubble
  up to the overlay, whose `transitionend` listener was removing it at 180ms
  instead of after its 400ms fade. Caught because the mid-fade screenshot kept
  coming back "already removed". The listener now checks `e.target === root`.
  Any future child transition inside the overlay is safe.
- **Minimum hold while paced.** A long frame early in the load delayed step 1
  by ~80ms, then step 2 landed on its own slot, so step 1 held for 34–66ms and
  its 180ms transition was retargeted mid-way. Each step now holds ≥ 75% of a
  slot *only while the slots are pacing*; once they are behind, no hold.
- **Initial clips are inline `style` attributes**, applied at parse time. This
  retired the `.boot-fill` critical-paint duplicate in BaseLayout — one fewer
  copy of the "duplicated outside the token" problem listed above.
- **New token `--boot-square-bg: #0b0c0e`** — the owner asked for it. Recorded
  in PRD §4.2. Used nowhere else.

### Doc edits this session (CLAUDE.md §7)

- **PRD §4.2** — new token. **PRD §5.10** rewritten for the new mechanic and
  numbers. **PRD §8** overlay-duration note updated.
- **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

Headless Chrome over CDP, in-page rAF recorder installed via
`addScriptToEvaluateOnNewDocument`, scripts in the session scratchpad.

- **All five first-paint cases** pass unchanged.
- **Centre-out:** at all 25 steps, all four insets equal, every visible edge
  the same distance from the box centre — worst spread **0.000px**. Box 180×180
  at 1280, 120×120 at 375.
- **Discrete:** 25 distinct values on a fast load, all from the 24-step set;
  the inline clip matches the label's step on every frame; every painted step
  held 100–119ms (slot 117ms). No intermediate values, no glide.
- **Never ahead of truth:** displayed step ≤ floor(readiness × 24) on **every
  frame**, unthrottled / 200kb/s / 60kb/s — 0 violations. (Before the grace-cap
  fix there were 11 per throttled run, all at the cap.)
- **Late checkpoint:** hero image held to 3.6s → `100%` at `load` + 16ms,
  removed 434ms later (full fade).
- **Grace cap:** three resources stalled, `readyState` stuck at `interactive`,
  last readout **96%**, overlay gone at cap + fade.
- **Removed, not hidden:** `[data-boot]` absent, focus on `body`, hero present.
- **Both accents:** ring `#ff3b5c` → `#a78bfa`; core, band, backdrop unchanged.
- **Client JS: 1570 B gzipped, all inline** (cap 40 KB; inc 8 was 1452 B).
- Build + `astro check` 0/0/0 at every commit. Longest file 184 lines.

### Harness gotchas recorded for next time

- Eight CDP scripts against one Chrome + one preview server inflate load times
  enough that throttled runs hit the grace cap and holds jitter. Run the
  timing-sensitive scripts alone; pinned-state screenshots can go in parallel.
- `localStorage` is per origin, not per target: the accent test left
  `accent=violet` behind and the screenshot set came out violet. Set the accent
  explicitly in any script that captures pixels.
- The recorder's first frame with the overlay present is *after* module start,
  so the "hold" it reports for `0%` is an artefact, not a paint. Judge holds
  from step 1 onward.
- A child element's `transitionend` reaches the parent. Filter on `e.target`.

### Still open

- **Status-line copy** (`STATUS_TEXT`) — placeholder pending the owner.
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Hero.astro over the 200-line cap (pre-existing).
- Final accent, custom domain (PRD §11). Vanity URL as a project domain — see
  the standing constraint at the top.

## 2026-09-20 — increment 8

### Last milestone completed

Square-fill loading animation, replacing the word-cycling greeting preloader.
A bordered 72px square fills bottom-up from **real page readiness**, with a live
percentage above it, over an original generated pixel-noise texture.

Removed entirely: the greeting arrays, `BootCycler.astro`, the "I'M RISHI" line,
the status line and its looping dots.

Kept untouched (the five-case guarantee — do not re-derive these): the
`sessionStorage` `boot-seen` gate, the reduced-motion bypass in *both* the
inline script and CSS, the `<noscript>` hide, skip-on-interaction, and the
synchronous inline first-paint script.

### The status line is a PLACEHOLDER

`STATUS_TEXT` in `src/scripts/boot-copy.ts` currently reads `LOADING`. **Final
copy is still pending from the owner.** It is a standalone module rather than an
`.astro` frontmatter export, because frontmatter exports are not importable —
swapping the string is a genuine one-line change in one place.

### Decisions worth knowing before you touch this

- **clip-path, not height, and quantised to 16 steps.** Owner left the choice
  open. An animated `height` puts the fill edge on fractional pixels and Chrome
  antialiases it into a soft grey line, plainly visible at 72px. The fill is a
  full-size child revealed by `clip-path: inset()`, stepped to 1/16 so the edge
  always lands on a whole pixel. **Only the geometry is stepped** — the readout
  stays continuous, so the number is never rounded away from its true value.
- **The fill's empty state is duplicated into BaseLayout's critical-paint CSS.**
  Without it the square paints *full* for the frames before `global.css` lands —
  a white flash on a slow connection. Caught by measurement, not by eye. This is
  a third copy of the "duplicated outside the token" problem already recorded
  above for `#111214`; change them together.
- **Grace cap is armed at t=0, not after the dwell.** The increment 1.7 bug was
  an unbounded wait. Arming inside the dwell callback would reintroduce a path
  where a never-firing `load` strands the visitor. Do not move it back.
- **The texture had to be collapsed to one channel.** `feTurbulence` generates
  R, G and B independently, so the first version speckled green and magenta at
  0.55 opacity over a washed-out mid-grey. `feColorMatrix` collapses it to
  luminance before the discrete step; layer sits at 0.05.
- **The readout used to park at 95%.** `getEntriesByType("resource")` only
  covers requests already started, so once they settle the share pins and the
  number dead-stalls until `load`. The remaining gap is now spent against the
  clock on an exponential curve. First attempt used `Math.max` of share and
  creep, which silently did nothing — the creep was always the smaller of the
  two. It adds *above* the share now.
- **`--word-*` tokens kept, not deleted** (owner's call), annotated UNUSED in
  `global.css`.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.10** rewritten in full, replacing the greeting-cycle spec entirely.
- **PRD §8** — the "covers the hero for roughly 11s" line was stale; the overlay
  now lasts as long as the page actually takes.
- **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

Headless Chrome over CDP, fresh target per case, reduced motion emulated
per-target. Scripts in the session scratchpad.

- **All five first-paint cases** pass unchanged: first visit present at DCL
  (`display: grid`, `position: fixed`); `boot-seen` absent; reduced motion
  absent; reduced + `boot-seen` absent; scripts disabled → `display: none`.
- **Progress is real, not a fixed clock.** Overlay lifetime **1.6s unthrottled /
  4.4s at 200kb/s / 6.1s at 60kb/s**. A fixed timer would give three identical
  figures. Readout tracks settled Resource Timing entries; only `load` hits 100%.
- **Grace cap fires.** Three resources held open with `Fetch.requestPaused` so
  `load` never fired (`readyState` stuck at `interactive`); overlay still gone at
  ~3.4s = 3000ms cap + 400ms fade.
- **Removed, not hidden:** `[data-boot]` absent from the DOM after reveal,
  `.boot` count 0, `boot-seen` set, focus on `body`, hero present.
- **Texture, read from the compositor:** 3 distinct tones, `rgb(17,18,20)`
  (= `--bg` exactly) → `rgb(26,27,29)` (= `--bg-raised`).
- **Both accents + mobile:** border follows `--accent` (`#ff3b5c` → `#a78bfa`),
  fill stays `--heading` in both, square exactly 72x72 and centred at 1280 and
  375, no horizontal overflow.
- **Client JS: 1452 B gzipped, all inline, no external script** (cap 40 KB),
  down from 2020 B in increment 7.
- Build + `astro check` 0/0/0 at every commit. All touched files under the
  200-line cap.

### Harness gotchas recorded for next time

- Under heavy throttling the overlay does not exist yet at first poll — the HTML
  has not streamed. A sampler that treats "not found" as "removed" reports a
  *faster* load on a slower network. Wait until the element has been seen once.
- CDP eval round-trips are slower than the fill, so polling for an exact
  percentage misses every threshold. For state screenshots, stub
  `requestAnimationFrame` via `Page.addScriptToEvaluateOnNewDocument` and pin
  the state instead of chasing it.
- Clear `boot-seen` in that same on-new-document script, or the inline
  first-paint script removes the overlay before the screenshot.
- `Network.setCacheDisabled` takes `cacheDisabled`, not `value`.

### The "two projects" scare — resolved, and the stale file fixed

The increment 8 deploy showed up as `rishiventra/portfolio` while all history
was `rishiventra/rishi-ventrapragada`. Checked against the API: **there is only
one project** (`prj_R7zqnBIxWhGIUImcGAZJHWsQhWXN`), and only three in the whole
team, one per repo. Nothing to delete. A previous session had already diagnosed
this (see increment 1.9 above); it recurred because the cause was never fixed.

**Cause:** `.vercel/project.json` still carried `"projectName":"portfolio"` from
before the rename, and a CLI deploy labels the deployment from that field.
**Fixed this session** — the file now reads `rishi-ventrapragada`, so CLI
deploys stop mislabelling. It is gitignored, so this is local-only; a fresh
clone that runs `vercel link` gets the right name anyway.

**Also learned:** the push had *already* auto-deployed via the Git integration
(`source: git`, same commit) before the manual `vercel --prod` ran. The manual
deploy was a redundant rebuild of the identical commit. See the corrected
standing constraint at the top of this file.

### Still open

- **Status-line copy** (`STATUS_TEXT`) — placeholder pending the owner.
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Hero.astro over the 200-line cap (pre-existing).
- Final accent, custom domain (PRD §11).

## 2026-09-20 — increment 7

### Last milestone completed

Seven commits: preloader role line cut; scroll progress bar in the nav; Skills
rebuilt as six tech-stack cards with a shared `Pills.astro`; `planned` status
and the project-card rework (no status text, pill stack, real KalaCart repo
link); Recurzn planned card with a generated placeholder; `BootCycler.astro`
split out for the line cap; these docs.

### Decisions worth knowing before you touch this

- **Progress bar is CSS-first, script-fallback** (CLAUDE.md §4, same shape as the
  hero dissolve). `@supports (animation-timeline: scroll())` drives the fill;
  the rAF script in `Nav.astro` only runs where that is unsupported. The
  timeline longhands live in their own rule — verified in the built CSS that
  nothing folded into an `animation` shorthand. **The track is the nav's bottom
  hairline at every scroll position**; `.nav` has no `border-bottom` any more.
  It stays on under reduced motion by design (state, not decoration).
- **`status` is never printed.** The card heading is `Title · Year`. The field
  only dims a `planned` card to `opacity: 0.5`. A `superRefine` in
  `content.config.ts` makes `summary` and `stack` required unless planned;
  proven by building with KalaCart's stack removed — the build fails.
- **`Pills.astro` is the only pill.** Tech-stack cards and the project card both
  render `string[]` through it; `muted` is for "currently learning". Pills are
  mono 12px, **not uppercased** (product names read wrong shouted) — a deliberate
  departure from the `.label` rule, they are tags, not labels.
- **Tech stack links nowhere.** The old per-skill `#projects` links are gone with
  the "shipped with" framing. The section id is still `#skills`, so the nav and
  every PRD anchor reference are unchanged; the h2 says "Tech stack".
- **Currently learning is now Docker, Kubernetes** (owner's wording), replacing
  "Flutter & Dart, for Recurzn."
- **Recurzn placeholder** is `recurzn-cover.png`, 1272×700 to match the KalaCart
  cover so the two cards align. libvips could not read the woff2 in
  `.astro/fonts/` (no brotli in its build), so the text is a generic monospace
  face; logged in ASSETS.md. Rebranding the Life OS app is another repo's job.
- **Line cap:** BootPreloader.astro 259 → 176 via the split; Hero.astro (253) is
  the one remaining violation, untouched this increment.

### Doc edits this session (CLAUDE.md §7)

PRD §5.10 (two beats, 7.1s, budget), §5.1 (progress bar), §4.4 (one clause: the
hairline is the track), §5.6 (tech stack), §3 (site-map row), §5.3 (cards),
§6 (schema). ASSETS.md: Recurzn placeholder entry. README unchanged.

### Verified by measurement, not eyeballing

Headless Chrome over CDP, fresh target per case, reduced motion emulated per
target rather than forced at launch so the preloader could run with motion on.

- **Preloader, all five first-paint cases**, on the split build: first visit
  present at DOMContentLoaded (`position: fixed` from the critical-paint CSS,
  no role line in the DOM); `boot-seen` absent; reduced motion absent; reduced +
  `boot-seen` absent; scripts disabled → `display: none` from the noscript rule.
  Loading line on and greeting off at 5.9s; **overlay removed at 6,961 ms**.
- **Progress bar**, 1280 and 375: fill 0 / 640 / 1280 px and 0 / 187.5 / 375 px
  at 0 / 50 / 100% of max scroll — exact. Track `--line`, fill `--accent`, track
  bottom = 64 = nav height, nav `border-bottom-width: 0`. Script branch forced in
  Chrome (stubbed `CSS.supports`, `animation: none` injected): same three
  readings, `--scroll-progress` written 0 / 0.5 / 1.
- **Tech stack:** 6 cards, 8/9/7/3/4/2 pills, 3 columns at 1280 and 1 at 375,
  zero `<a>` in the section, learning pills in `--fg-muted`.
- **Cards:** KalaCart — "KalaCart · 2026", 5 pills, Live site + GitHub hrefs both
  200. Recurzn — opacity 0.5, no summary/pills/links, cover renders. Two columns
  at 1280, one at 375. "in-progress" appears nowhere in rendered text.
- One `<h1>`, every fragment resolves, `[TODO: photo]` still present,
  `[TODO: add if public]` gone. Build + `astro check` 0/0/0 at every commit.
- **Client JS: 2020 B gzipped, all inline, no external script** (cap 40 KB).

### Harness gotchas recorded for next time

- `Page.addScriptToEvaluateOnNewDocument` runs before `document.documentElement`
  exists; observe `document` itself or attach at DOMContentLoaded.
- `innerText` applies `text-transform`, so a `[TODO: photo]` check against an
  uppercase `.meta` fails; use `textContent`.
- `Page.captureScreenshot` `clip` is in document coordinates: `y: 0` while
  scrolled captures the hero top, not the fixed nav. Crop a viewport capture.

### Still open

- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Hero.astro over the 200-line cap (pre-existing).
- Final accent, custom domain (PRD §11).

## 2026-09-20 — increment 6

### Last milestone completed

**Single-page restructure.** `/about/` and `/projects/kalacart/` are gone; the
site is `/` with anchored sections — Hero, About (`#about`), Skills (`#skills`),
Projects (`#projects`) + Currently building, Contact (`#contact`, the footer).
Nav is anchor-only: `RISHI` mark left (`#top`), Skills / Projects / Contact
right. The case study and its security-disclosure prose are off the public
site. Old routes 301 to `/#about` and `/#projects` via `vercel.json`.

### Decisions worth knowing before you touch this

- **Content model is a JSON collection, not MDX.** `kalacart.json` under
  `glob({ pattern: "*.json" })`, schema without `role`/`video`. CLAUDE.md §5
  requires a `src/content/` collection, which ruled out a plain data object; MDX
  was overhead with no body to render. Verified in Astro source before choosing:
  `.json` is a registered data-entry type and `image()` resolves relative to any
  Content Layer entry. `@astrojs/mdx` is uninstalled and the `onwarn` head-inject
  filter in `astro.config.mjs` is gone with it — no MDX, no warning (build proven).
- **`<ClientRouter />` removed.** It was the entire 5.6 KB of external client JS
  and only existed for cross-page crossfades. PRD §4.5 updated (flagged in the
  plan; outside the originally authorised sections). Nav's observer is now module
  scope — the `astro:page-load` rebinding dance was only for the router.
- **`#top` for the mark.** Per the HTML spec a `#top` fragment with no matching
  element scrolls to the document top, so `Hero.astro` stays untouched.
- **`Timeline.astro`, `CaseStudyMeta.astro`, `CaseStudyToc.astro`,
  `ProjectTile.astro` deleted**, not parked. Each was grep-verified to have zero
  references outside another deletion target before `git rm`.
- **The About résumé button is intentionally not duplicated.** Owner confirmed:
  the footer is the résumé link and satisfies PRD §1. Do not "restore" it.
- **Smooth anchor scrolling** moved from the deleted case-study page into
  `global.css`, gated on `prefers-reduced-motion: no-preference`.

### Doc edits this session (CLAUDE.md §7)

PRD.md §3 (site map → single page + anchors + redirects), §4.5 (no page
transitions), §5.1 (anchor nav), §5.3 (tiles → cards; no stretched link, no
video, links-row rule), §5.5 (`[removed]`), §5.6 (About and Skills sections),
§5.7 (section, not route), §6 (JSON collection, simplified schema), §7 (demo
videos parked), §8 (OG line no longer "per case study"), §10 (increments
renumbered: 6 = this restructure, 7 = currently-building strip, 8 = later; 2/3/5
marked superseded, 4 dropped). README.md rewritten for the single page and to
drop the stale `@astrojs/react` line. ASSETS.md paths updated. CLAUDE.md
unchanged.

### Verified by measurement, not eyeballing

Static, on `dist/`:
- Only `index.html`; no `about/`, no `projects/`. `astro check` + build 0/0/0.
- Every `#fragment` href resolves to an id on the page (`#projects` ×9 = nav +
  8 linked skills). Zero occurrences of `/about`, `/projects/`, `ClientRouter`,
  `astro-island`, `<video>`. Exactly one `<h1>`. `[TODO: photo]` and
  `[TODO: add if public]` present as text; the latter has no href.
- External links HEAD 200: kalacart-website.vercel.app, GitHub, LinkedIn.
  `/resume.pdf` is the known pre-existing 404.
- **Client JS: 1,843 B gzipped, five inline blocks, no external script at all.**
  Was 5.6 KB with ClientRouter. Cap is 40 KB.

In headless Chrome over CDP, 1280×900 and 375×812, reduced motion forced so the
preloader self-removes and scrolls are instant:
- Nav height 64. Clicking Skills and Projects lands the target at **80px** from
  the top on both viewports (64 nav + 1rem `scroll-margin-top`). Contact lands
  at 660 / 605 with the footer fully in view — the page cannot scroll further.
  `#top` returns to `scrollY 0`; `.is-scrolled` toggles correctly both ways.
- Card: desktop `:only-child` split 646.8 / 431.2px (3fr/2fr matched the new
  `.card`); image ratio 1.8172 = source, zero crop. Mobile single column 277px.
- Full-page screenshots reviewed at both widths; section order and split
  layout correct.

### Harness gotchas recorded for next time

- **Bash commands over roughly 8 KB are silently truncated** before bash parses
  them; the symptom is `unexpected EOF while looking for matching '` at a line
  number that drifts as you edit. Write long scripts with the Write tool into
  the scratchpad and run them — do not fight it with heredoc tweaks.
- Full-page screenshots: `captureBeyondViewport` resizes the viewport, which
  balloons `100dvh` sections. `cdp-verify.mjs` stitches viewport-sized captures
  with sharp instead (sharp resolved from the project cwd via `createRequire`).
- `vercel ls` prints the status table to **stderr** and bare URLs to stdout. Poll
  with `2>&1`; a `2>/dev/null` loop never sees `Ready` and times out blind.
- For a few seconds after `vercel alias set`, requests can still hit the previous
  deployment. Re-check before concluding a redirect rule is broken.
- Kill the harness Chrome by PID with its own `--user-data-dir`, never
  `taskkill /IM chrome.exe` — that takes the owner's browser down too.

### Still open

- `public/resume.pdf` still missing; footer link 404s.
- About photo still a CSS placeholder.
- Live redirects — **done, 71e68fe.** All six old-route forms (`/about`, `/about/`,
  `/projects`, `/projects/`, `/projects/kalacart`, `/projects/kalacart/`) 308 on
  the vanity URL and land 200 on `/#about` / `/#projects`. The first deploy
  missed the trailing-slash forms — `:path*` does not match a trailing slash
  — and those were exactly the URLs the old nav emitted. Explicit sources fixed it.
- Final accent, custom domain (PRD §11).

## 2026-09-20 — increment 5.4

### Last milestone completed

KalaCart cover is now a real screenshot of the live site, replacing the
generated placeholder PNG. Also silenced the Astro `head-inject` build warning
in a separate commit, so the build is genuinely 0 warnings / 0 errors again.

### The head-inject warning was never ours

Astro generates `"use astro:head-inject"` in the wrapper module it builds for
every content-collection entry with propagated assets — so **every MDX entry**
triggers it (`astro/dist/content/vite-plugin-content-assets.js`). Rolldown (via
Vite 8) warns it cannot preserve an unknown module-level directive. Astro reads
the marker at build time and never needs it bundled, so it is noise.

Filtered in `astro.config.mjs` by **module id, not warning code**, so a directive
warning from our own source still surfaces. Verified by breaking the id match
and confirming the warning reappears. Astro 7.3.3 is already latest — no
upgrade was available to take instead.

### The cover file differed from the brief

The owner described `src/assets/projects/kalacart-cover.jpg`. The actual file was
`src/assets/kalacart-cover.jpeg` — no `projects/` subdirectory, `.jpeg` not
`.jpg`. Dimensions were exactly as stated (1272 × 700). Moved it to
`src/content/projects/` to sit beside the entry that references it, matching
where the old cover lived; the loader's `*.mdx` pattern keeps images out of the
collection.

### The tile no longer forces 16:9

`ProjectTile.astro` had `aspect-ratio: 16/9` + `object-fit: cover` on the image,
sized for the old 1600 × 900 placeholder. The screenshot is 1.82:1, so that box
would have shaved ~14px off each side (2.17%). Small, but on a **screenshot**
clipped UI chrome reads as a mistake in a way it would not on a photo, so the
image now sets its own ratio (`height: auto`).

**Video still uses 16:9**, the ratio PRD §7 specifies for demo posters — only the
`img` rule changed. `widths` went `[592, 1184]` → `[636, 1272]` to match the new
source width.

### Known, accepted: screenshot text is not legible at tile size

Rendered 647px wide, the source's 16px body text lands near 8px. The headline
and the "Browse crafts" button read fine; the paragraph reads as texture. That
is inherent to a full desktop screenshot in a tile, **not a crop bug**. A cropped
detail shot would be the fix if it ever matters. Flagged to the owner.

### Verified by measurement, not eyeballing

Measured in headless Chrome over CDP (no new dependency — Chrome was already
installed, driven with Node 24's built-in WebSocket):

- Rendered image ratio **1.8172** vs source **1.8171** — zero crop.
- Rendered 647 × 356 from a 700 × 385 WebP; `width`/`height` attributes emitted, so
  no layout shift.
- "Admin" at the screenshot's right edge survives intact.
- Build 0/0, `astro check` 0 errors / 0 warnings / 0 hints.
- Cover optimises to 22—88 KB WebP from a 215 KB source.

### Screenshot gotcha for next time

A plain headless screenshot of `/` captures **the boot preloader**, not the page.
Pass `--force-prefers-reduced-motion` (the preloader self-removes under it) or
remove `[data-boot]` over CDP first. An iframe wrapper does **not** work —
cross-origin rules block the scroll script.

### Still open

- About-page photo is still a CSS `[TODO: photo]` placeholder (unrelated asset).
- `public/resume.pdf` still does not exist; `/about` and the footer 404 on it.

## 2026-09-19 — increment 5.3

### Last milestone completed

Removed the unused React scaffold. `react()` is gone from `astro.config.mjs`
integrations, and `@astrojs/react`, `react`, `react-dom`, `@types/react` and
`@types/react-dom` are uninstalled (45 packages removed).

**If you need client-side state later, re-add `@astrojs/react`** — `npm i
@astrojs/react react react-dom`, add `react()` to the integrations array, and
restore the `jsx`/`jsxImportSource` options in `tsconfig.json`.

### Why it was safe

No `client:*` directive existed anywhere in the repo — no `.tsx`/`.jsx` files,
no `react` imports in `src/`, no `<astro-island>` in any built page. The 220 KB
React client chunk was deployed but never fetched by a browser.

### Also removed: two tsconfig options

`"jsx": "react-jsx"` and `"jsxImportSource": "react"` were local additions (not
part of `astro/tsconfigs/strict`) left by the React integration setup. With
React uninstalled they pointed at a package that no longer exists.

### Verified by measurement

- `dist` total: **507,425 → 286,600 bytes** (−220,825, exactly the React chunk).
- Only `.js` in `dist`: ClientRouter, **5,653 bytes gzipped**. Unchanged.
- All three HTML files **byte-identical in size** to before, each referencing the
  same single `<script src>`. Page weight is unchanged, as predicted.
- `grep` for `react.transitional`/`react-dom` across `dist`: no matches.
- Build: 0 errors. One `[WARN]` remains (`use astro:head-inject` in
  `kalacart.mdx`) — **pre-existing**, confirmed by stashing the change and
  rebuilding: the same single warning appears with React still installed.

### Doc edits this session

- CLAUDE.md §4: added a line stating the 40 KB budget is measured against bytes
  referenced by `<script src>` in built HTML, not total `dist/` size.
- The owner's wording cited a "§7-adjacent cleanup norm". **No such norm exists**
  — §7 is the "Never" list. The pointer was dropped and the clause kept; whether
  to add a real cleanup norm to §7 is an open owner decision.
- Corrected the increment 5.2 entry below, which wrongly reported the JS budget
  as over by counting unreferenced bytes.

### Still open

- The `use astro:head-inject` build warning in `kalacart.mdx` predates this work
  and still violates CLAUDE.md §1.3's zero-warning rule. Not investigated here.

## 2026-09-19 — increment 5.2

### Preloader reverted to centred; loading text enlarged

The owner reversed increment 5.1's decision. The preloader is a **full-screen
transient moment, not page content**, so it does not follow the site's
left-margin convention the way persistent content does. Content is centred on
both axes again, and **PRD §5.10 was updated to match** — 5.1 had rewritten that
paragraph to specify left-alignment, so leaving it would have left the spec
describing the opposite of the code.

`.boot-track` is gone; `.boot` uses `place-items: center` with the gutter as
padding, and `.boot-inner` is back to `margin-inline: auto`.

**Do not "re-fix" this by reading 5.1's entry below.** That entry describes a
decision that has since been reversed; it is kept for the scrollbar/`100vw`
lesson, not as a statement of current intent.

### Line 3 size is now specified

`Website loading` was inheriting `.label`'s `--size-label` (0.75rem / 12px) and
read as an afterthought. It is now `0.9375rem` (15px), set on `.boot-status`
after the `.label` class so it wins. Deliberately **above** the site's 12px page
label size — this is a final beat in a full-screen moment, not a page label. The
dots box went 1.5em → 1.8em: three JetBrains Mono glyphs advance 0.6em each, so
1.5em would have clipped the third at the larger size.

PRD §5.10 line 3 now records both numbers; it previously pinned font, case,
spacing and colour but no size.

### Verified by measurement, not eyeballing

Block centring, measured as distance to each viewport edge:

| viewport | left / right | top / bottom |
| --- | --- | --- |
| 1440px | 420 / 420 | 392.4 / 392.4 |
| 375px | 24 / 24 | 372.4 / 372.4 |

Glyph ink (not just box) centred at both widths: offset 0.0px for the greeting
word, the name, and the status line.

**Word-swap stability unregressed.** Sampled every 250ms through all five
greetings and all four roles at both widths: cycler widths (213.2px / 386.9px at
1440), "I'm Rishi" left, and the "I am a" tail each held a *single* value
throughout. The fixed-width sizer fix from 5.1 is intact and was not touched.

All five first-paint cases pass: first visit, repeat session, reduced motion
(desktop + mobile), no-JS (overlay `display:none`, hero `<h1>` visible).

### Client JS budget — this entry was wrong, corrected 2026-09-19

**Superseded — the budget was never over.** This entry counted every `.js` file
in `dist`, but the 68 KB React chunk was **not referenced by any page**: no
`client:*` directive existed anywhere in the repo, so no `<astro-island>` was
emitted and no browser ever fetched it. Actual shipped JS was ~5.6 KB gzipped
(ClientRouter alone), comfortably inside the 40 KB budget.

The React scaffold was removed in increment 5.3 and CLAUDE.md §4 now states how
the budget is measured, so this miscount should not recur.

## 2026-09-19 — increment 5.1

### Bug fixed: preloader content was centred, not left-aligned

PRD §5.10 specifies a left-aligned block. Three rules had crept in during the
increment 1.9 restructure and centred it on both axes: `margin-inline: auto` on
`.boot-inner`, plus `text-align: center` on `.boot-line` and `.boot-status`.
I introduced them when line 1 became two stacked rows; the spec was right and
the implementation had drifted.

### The fix, and the false start worth recording

First attempt derived the inset arithmetically —
`margin-inline: max(0px, calc((100vw - var(--max-width)) / 2))`. It measured
**128px against the site's 121px**: `100vw` includes the scrollbar, so the
computed offset was 7px too wide.

Replaced with a `.boot-track` wrapper that *mirrors `.shell`* (`max-width`
track, `margin-inline: auto`, `padding-inline: var(--gutter)`) rather than
re-deriving its arithmetic. Any future change to `.shell`'s mechanics now
carries over instead of silently desynchronising.

### Verified by measurement

Left edge of the preloader's greeting line and status line vs real site content:

| viewport | preloader | footer text | projects eyebrow |
| --- | --- | --- | --- |
| 1440px | 121px | 121px | 121px |
| 375px | 24px | 24px | 24px |

**Word-swap stability unregressed.** Cycling through all five greetings: the
cycler box stays 213px, "I'm Rishi" stays at 121px, and every word starts at
121px. The fixed-width container still prevents reflow; the words now start at
the block's left edge rather than being centred inside it.

All five first-paint cases still pass (first visit, repeat session, reduced
motion first/repeat, no-JS).

### Testing flag

`replayAlways` had been fully removed in an earlier commit, so it was
reintroduced temporarily — named flag, loud revert comment, never committed —
and removed again before committing. The `boot-seen` gate is byte-identical to
its previous committed state, verified by diff.

## 2026-09-19 — increment 5

### Last milestone completed

About page (PRD §5.6) at `/about`, the site's third route.

- `src/pages/about.astro` — story, How I work, skills, GDG line, résumé button.
- `src/components/Timeline.astro` — reusable; entries come in as a prop.
- `Nav.astro` — About added, and the mobile gap reduced (see below).
- `ASSETS.md` — photo placeholder and the pending résumé PDF logged.

All owner copy is used verbatim. Verified programmatically: nine strings —
story, How I work, GDG line, Currently learning, and all five timeline entries —
compared character-for-character against the brief, not read by eye.

### Adding a fifth nav link broke the mobile layout

Not anticipated by the brief, and caught by measuring before writing the code:

| | width at 375px |
| --- | --- |
| Available inside the gutters | 312px |
| 5 links at the old `1.25rem` gap | 322px — **overflows** |
| 5 links at `1rem` | 306px — fits, 6px spare |

The mobile gap is now `1rem`; the ≥768px gap is untouched. Re-verified after
the change: all three routes have `scrollWidth == clientWidth` at 375px with
zero overflowing elements.

**This is why the nav is now recorded as full** in the standing constraints
above. A sixth link does not fit at any sane gap.

### One copy detail worth noting

The first render used typographic apostrophes (`&rsquo;`, U+2019) where the
brief has straight `'`. The words were identical, but "exactly as written"
means the character too, so the page now uses straight apostrophes and the
verbatim check passes on all nine strings.

### Verified

- Build clean: 0 errors, 0 warnings, 0 hints.
- `dist/about/index.html` exists; exactly one `<h1>`.
- Nav renders 5 links on all three routes; `aria-current="page"` lands on Home,
  About and KalaCart respectively. No dead hrefs.
- Skills links all resolve to `/projects/kalacart/`; résumé link is
  `/resume.pdf` with `download`.
- No new client JS.

### Two things adjusted after looking at the render

- Timeline entries were spaced so far apart the connecting rule barely read as
  a line. Gap tightened from `1.75rem` to `1.25rem`.
- The photo placeholder filled the width on mobile at 3:4, dominating the
  screen. Capped at `240px`.

### Still open

- **`public/resume.pdf` does not exist.** Both `/about` and the footer link to
  it. A static build cannot verify link targets, so this 404s silently — it
  will not show up as a build error. Logged in ASSETS.md.
- **GDG line becomes a link** when the Community page (§5.7) ships.
- **Skills links** all point at the same URL, which is right with one project
  and will read oddly with several.
- ~~**Alias** still pinned to an old build.~~ **Resolved.** The owner approved
  `vercel alias set` as a standing action; the alias now points at the
  increment 5 deployment and all three routes were verified on the vanity URL.
  See the standing constraint at the top of this file.

## 2026-09-19 — increment 4

### Last milestone completed

Navigation restored (PRD §5.1). `Nav.astro` remounted in `BaseLayout.astro`
after being unmounted since increment 1.6.

### The brief changed during planning

The brief asked for a hamburger opening a full-screen overlay with focus trap,
Escape handling and click-outside. While choosing between overlay and dropdown,
the owner asked why a hamburger is needed when a bar already exists.

It isn't. The bar was empty apart from the button, and four short labels fit at
every width (measured: ~259px of links against 327px available at 375px). So
the bar shows the links directly.

**Not built, by that decision:** hamburger, overlay, open/close state, focus
trap, Escape handler, click-outside, reduced-motion menu transition, and the
`aria-expanded`/`aria-controls` attributes that described the removed button.

### Verified

- Build clean: 0 errors, 0 warnings, 0 hints.
- Every nav `href` resolves — routes against the built file list, anchors
  against real `id`s in the target page. Checked programmatically.
- Exactly one `aria-current="page"` per page, on the correct link: Home on `/`,
  KalaCart on `/projects/kalacart/`.
- No `aria-expanded`, `<button>` or overlay markup left anywhere.
- 375px: `clientW == scrollW`, links 259px wide, zero overflowing nav elements.

### Two bugs found by measuring rather than assuming

1. **Anchor targets landed behind the fixed bar.** The owner asked for this
   check specifically. Measured `#projects-heading` at `top: 0` against a 64px
   nav — fully occluded. Fixed with
   `scroll-margin-top: calc(var(--nav-height) + 1rem)` on `[id]` in
   `global.css`; re-measured at `top: 80`, clear. Applied globally so future
   anchors inherit it.

2. **The scroll observer would have died on the second page.**
   `detectScriptExecuted` (`astro/dist/transitions/swap-functions.js:29`)
   deduplicates identical scripts and does not re-run them after a view
   transition, while ClientRouter swaps the nav DOM. A module-scope observer
   would have stayed bound to the discarded element: working on first load,
   silently broken after navigating. Moved to an `astro:page-load` listener
   that disconnects the previous observer first. Verified the sentinel count
   stays at 1 after repeated `astro:page-load` events — no accumulation.

   No other script in the repo uses `astro:page-load`; nothing else needed to
   survive navigation until now. Worth remembering for any future component
   that attaches listeners.

### Doc edits this session

PRD §5.1 rewritten for the shipped nav (links not hamburger, the link table,
active-state rule, the `scroll-margin-top` requirement and the
`astro:page-load` constraint). §10.6 amended since the hamburger it listed is
no longer planned.

### Still open

- **About/Community nav links** — recorded as a standing constraint at the top
  of this file, since a new page will not appear in the nav by itself.
- **Alias** still pinned to an old build; `vercel alias set` remains blocked by
  this environment's permission classifier.

## 2026-09-19 — increment 3

### Last milestone completed

KalaCart case study body and desktop sidebar (PRD §5.5).

- `kalacart.mdx` body replaced: six `##` sections per §5.5's order.
- `CaseStudyToc.astro` — sticky TOC, built from `render()`'s `headings`.
- `CaseStudyMeta.astro` — meta panel (role, stack, links), extracted from the
  page to stay under the 200-line cap.
- `[slug].astro` — two-column layout at ≥1024px, plus MDX prose styling.

### Two owner decisions on the copy

The brief said both "exactly as written" and "shorten this entire context".
Flagged the conflict; the owner chose **shorten**, then read the result and
confirmed nothing important was lost. Body is ~609 words, down from ~640 of
source prose, with every section and claim intact.

The owner also chose to **soften the exploit specifics** in "What broke". The
admission, severity, self-discovery and "open fix, not a shipped feature"
framing all stay. What changed:

| Source | Published |
| --- | --- |
| "wide-open write policy on the **products table**" | "database write policies are too permissive" |
| "anyone could **flip a listing's status directly**" | "the review step can be bypassed" |

A reader still learns there is a real unfixed auth gap; they do not get the
mechanism. Verified `products table`, `wide-open` and `flip a listing` appear
nowhere in `dist/`.

### Verified

- Build clean: 0 errors, 0 warnings, 0 hints.
- **All six TOC anchors resolve** to real heading `id`s — checked
  programmatically, not by eye. No dead links.
- `## Links` renders with no content under it; `[TODO: add if public]` is still
  text, never an href. No repo URL invented.
- Exactly one `<h1>`.
- Mobile (390px): `scrollWidth == clientWidth`, **zero** overflowing elements,
  TOC `display: none`.
- Client JS unchanged at 6.43 KB gz (the TOC is build-time only).

### One thing the screenshots caught

MDX content carries no classes, and `.body` only set a `max-width` — so the
`##` headings rendered at body size with no spacing and were indistinguishable
from the prose. Added `:global` prose styles (heading scale, paragraph rhythm,
bold lead-ins in `--heading`, `scroll-margin-top` for TOC anchors).

### Deliberately not built

**Scroll-spy / active-section highlighting.** §5.5 asks for a sticky TOC, not a
position tracker, and it would be the first client JS on this page. Flagged in
the plan, approved as an exclusion, and recorded in §5.5.

### Doc edits this session

PRD §5.5 (`[next]` → `[now]`, plus an "as built" note covering the generated
TOC, the DOM order, the mobile behaviour and the scroll-spy exclusion) and
§10.3 (`[next]` → `[now]`).

### Still open

- **Nav** remains unmounted. There is now a real case study route, so this is
  worth revisiting.
- **Alias** still pinned to an old build; `vercel alias set` is blocked by this
  environment's permission classifier. The owner's custom domain resolves it.

## 2026-09-19 — increment 2.1

### Bug fixed: white flash on hard reload

**Root cause: the entire dark theme lives in an external stylesheet.**

`global.css` is imported as a module in `BaseLayout.astro`, so Astro bundles it
into `/_astro/_astro_content.*.css`. Every base rule — `:root` tokens including
`--bg`, the `html` and `body` background, `color-scheme: dark` — exists **only**
there. The inline `<style>` blocks in the head are just `@font-face` and scoped
component CSS; they contain no `html`, `body` or `--bg` rule at all.

So between first paint and the stylesheet arriving, the document had **no
background**. The browser painted its default white, with the hero image and
wordmark already in the DOM and visible against it.

Astro's head ordering made it worse: the ClientRouter module script and the
inline accent script are emitted *before* the `<link rel="stylesheet">`.

`<meta name="theme-color">` does not help — it tints browser chrome, not the
page canvas.

### Ruled out (the four things asked about)

1. **Not async/deferred CSS.** The `<link rel="stylesheet">` is a normal
   render-blocking link. Tailwind v4 and the Vite plugin are not at fault. The
   problem is that it is *external at all*, so nothing paints correctly until a
   second network round trip completes.
2. **Not the Fonts API.** Font CSS is already inlined ahead of everything, with
   a `preload` for the display face. Fonts affect text rendering, not the page
   background, and could not produce a light canvas.
3. **Not ClientRouter.** View Transitions only take over in-app navigation; a
   hard reload is an ordinary document load. Its script sits before the
   stylesheet in the head, which does not help, but removing it would not fix
   the flash. Confirmed by reproducing with the same ordering.
4. **The overlay CSS was the victim, not the cause.** `.boot` is
   visible-by-default, but its `position: fixed` and background come from the
   external sheet, so during the gap it was an unstyled block that did not
   cover the hero.

### Reproduced before fixing

Built a static server that delays **only** `.css` responses by 1500ms
(`scratchpad/slowserve.mjs`), then sampled the iframe's computed
`backgroundColor` every 50ms. Plain screenshots do not show this: headless
Chrome blocks first paint on the stylesheet.

- **Before:** `rgba(0, 0, 0, 0)` — transparent, painted white — for the full
  1.5s window.
- **After:** `rgb(17, 18, 20)` from the first sample at 59ms.

Pixel-sampled the rendered output at 200ms and 600ms with CSS still in flight:
all four corners and centre `(17, 18, 20)`. No white frame.

### The fix

A small `is:inline` critical-paint `<style>` in `BaseLayout.astro`, placed
immediately after `<meta name="viewport">` — byte 203 of the document, versus
4630 for the ClientRouter script and 5042 for the stylesheet. It sets
`color-scheme: dark`, the `html`/`body` background, and enough of `.boot`
(`position: fixed; inset: 0; z-index: 200`) that the overlay covers the hero
from the first paint.

247 B gzipped. No change to client JS (6.94 KB against the 40 KB cap).

**Maintenance note:** `#111214` is now duplicated as a literal, because nothing
else is parsed at that point. Recorded as a standing constraint at the top of
this file, since a code comment alone is easy to miss in a later refactor.

### Verified

- Build clean: 0 errors, 0 warnings, 0 hints.
- Overlay computes `position: fixed`, `z-index: 200` from 64ms with CSS delayed.
- All five first-paint cases still correct (first visit, repeat session,
  reduced motion first/repeat, no-JS).

## 2026-09-19 — increment 2

### Last milestone completed

Projects content collection, KalaCart tile, case study route.

- `src/content.config.ts` — `projects` collection, glob loader, Zod schema per
  PRD §6. **Must be `src/content.config.ts`**: Astro 7 throws
  `LegacyContentConfigError` on `src/content/config.ts`.
- `src/content/projects/kalacart.mdx` + co-located placeholder cover.
- `ProjectTile.astro`, `ProjectsSection.astro`, `CurrentlyBuilding.astro`.
- `src/pages/projects/[slug].astro` — case study route, MDX body.
- `ProjectsPlaceholder.astro` deleted; `index.astro` now renders the real section.
- `ASSETS.md` created (did not exist, required by CLAUDE.md §7). Logs the
  KalaCart placeholder and, retroactively, the hero subject.

### New dependency

`@astrojs/mdx` 8.0.1, MIT, first-party Astro. Owner approved. PRD §6 specifies
`.mdx`, and increment 3's case study body will want components.

### Verified

- Build clean: 0 errors, 0 warnings, 0 hints.
- `dist/projects/kalacart/index.html` exists; the tile's `href` is
  `/projects/kalacart/` and matches. Both routes return HTTP 200 under preview.
- **Zero `<video>` elements emitted** on either page — the optional-video path
  omits the block rather than rendering an empty player, as specified.
- Exactly one `<h1>` per page.
- `[TODO: add if public]` renders as plain text, never as an `href`.
- Role string verified byte-identical to the owner's wording, with a literal
  `&` (escaped to `&amp;` in HTML, displays correctly).
- Client JS: home 6.94 KB gz, case study 6.43 KB gz, against the 40 KB cap.
- Cover PNG 37 KB → 1.5–5 KB WebP variants.

### Two bugs caught by screenshotting

1. **`:only-child` never matched.** The tile's `<script>` was emitted as a
   sibling of `<article>`, making it a second child of the grid, so the
   single-tile split layout silently did not apply and the tile stacked
   full-width — exactly the "awkward single tile" the increment was meant to
   avoid. Fixed by moving the script inside the `<article>`. Confirmed in the
   browser: `matches: true`, `grid-template-columns: 646.8px 431.2px`.
2. `astro check` reported 17 hints: `z` re-exported from `astro:content` is
   deprecated in Astro 7. Switched to `import { z } from "astro/zod"`.

### Deferred, with PRD updated

- **`/projects` index page** — not built. PRD §10.2 said increment 2 would
  include it, but with one project there is nothing to index. §10.2 amended.
- **Marquee + `now.json`** (§5.4) — static line only this increment.
- **Demo videos** (§5.3) — schema supports them, no assets exist yet.

### Doc edits this session

PRD §5.3 (`[next]` → `[now]`, video now optional, eyebrow is `status · year`),
§5.4 (`[now, partial]`, marquee deferred), §6 (slug derives from the filename;
config path note), §10.2 (scope reduced to KalaCart, index deferred).

### Open item carried forward

**Nav re-added once increment 2+ gives it somewhere to go.** Still unmounted.
There is now a case study route, so this is worth revisiting next session.

### Blocker for the owner — alias, and a better fix

`rishi-ventrapragada.vercel.app` is **still serving a pre-1.9 build**
(`Age: 8684`), while `portfolio-gamma-lake-gtndl2ey0m.vercel.app` serves the
current one. The push deploys fine; the vanity alias is pinned to an old
deployment. Same failure as increment 1.6.

I could not fix it: the Vercel MCP connector is authenticated to a **different
account** (projects `orca-frontend`, `aws-sbg-vjit`, `krishisathi` — no
portfolio project), and there is no Vercel CLI auth in this environment.

The owner's plan is to **buy a custom domain and add it in the Vercel
dashboard**, which replaces the vanity alias and stops this recurring.

## 2026-09-19 — increment 1.9

### Changes

- **Nav unmounted.** `<Nav />` was rendered in `BaseLayout.astro`, not
  `index.astro`, so removing it there takes it off every page rather than just
  the homepage. `Nav.astro` itself is untouched.
- Preloader line 1 is now two stacked rows in one slide: the cycling greeting
  above, static `I'm Rishi` below, no connector punctuation. The em dash is gone.
- Cycling words take a fixed per-word colour from five new tokens in
  `global.css` (`--word-amber`, `--word-coral`, `--word-sky`, `--word-mint`,
  `--word-periwinkle`). Roles reuse the first four in order. The colour rides
  the existing 150ms opacity cross-fade rather than animating separately.
- `I'm Rishi` stays `--fg`; the status line stays `--fg-muted`.

### Caught while screenshotting

Line 2 showed a floating gap between `I AM A` and short roles, because the
cycler box is sized to the longest word and was centring shorter ones inside it.
The cycler now aligns left on line 2 (where it follows static text) and stays
centred on line 1 (where it is its own row).

### Open item

**Nav re-added once increment 2+ gives it somewhere to go.** The component is
kept for reuse; this is a temporary unmount, not a deletion.

### Note on the brief

There is no `STATUS — READY` text in the preloader — line 3 reads
`Website loading`. Left untouched, which was the intent.

### Testing flag removed before push

The temporary `replayAlways` flag used to replay the preloader on every refresh
is gone entirely — not just set to `false`. The `boot-seen` gate is byte-identical
to what it was before the flag was added. Verified against the five first-paint
cases with the flag removed: first visit paints, repeat session / reduced motion
(first and repeat) / no-JS all skip.

## 2026-09-19 — increment 1.8

### Last milestone completed

Boot preloader flash fix, and the LCP carve-out written into PRD §8.

**Flash fix.** The overlay used to render `hidden` and be revealed by a deferred
module, which left a window where the hero could paint first. It is now the other
way round:

- The overlay is **visible by default in CSS**, no JavaScript needed to show it.
- A **synchronous classic inline script** (`is:inline`, not a module, so not
  deferred) sits immediately after the overlay markup and before the hero. It
  removes the overlay outright when `boot-seen` is set or reduced motion is on.
  Being synchronous and above the hero, it runs before first paint.
- `src/scripts/boot-preloader.ts` no longer un-hides anything or re-checks those
  two conditions; a missing `[data-boot]` now just means the sync script already
  handled it.
- Reduced motion is covered twice over: the inline script *and* a
  `prefers-reduced-motion` CSS rule, so it cannot paint even for one frame.

### New edge case this introduced, and handled

Making the overlay visible by default meant a **no-JavaScript visitor would have
been stuck behind it forever** — nothing would ever remove it. A `<noscript>`
rule now hides it. PRD §8 requires the site to work without JS, so this was a
real regression in the making, caught before commit.

### Verified

Drove the *actual shipped* inline script from `dist/index.html` against a DOM
stand-in, checking whether the overlay is present and paintable at first paint.
CSS facts were read out of the built stylesheet rather than assumed:

| case | overlay paints | wanted |
| --- | --- | --- |
| first visit, normal motion | yes | yes |
| repeat session (`boot-seen=1`) | no | no |
| reduced motion, first visit | no | no |
| reduced motion + repeat | no | no |
| no JavaScript at all | no | no |

All five correct — zero flash in every skip case. Sequence timing is unchanged:
reveal at 11200ms, removed at 11700ms.

- Build clean: 0 errors, 0 warnings, 0 hints.
- Preloader JS now 975 B gzipped (263 B sync + 712 B module) against the 2.5 KB
  allowance. Page total 7.04 KB against the 40 KB cap.

### PRD §8 amended

The LCP target now carries an explicit carve-out, in §8 itself rather than only
here: ≤ 2.0s **excludes first-visit sessions where the preloader plays**, and
applies to repeat visits, reduced-motion visitors and skip-triggered loads. A
second bullet records that a first-visit field LCP reads the overlay rather than
the hero, and that this is accepted rather than a regression. §5.10 gained the
visible-by-default/sync-skip behaviour and the no-JS rule.

### Still to eyeball in the browser

- The 150ms word swap: is the upward slide too subtle or too much?
- Whether ~11s before the hero feels right on a first visit.

Both are one-line changes if you want them different. Not pushed.

## 2026-09-19 — increment 1.7

### Last milestone completed

Boot preloader (PRD §5.10, new section added this session).

- `src/components/BootPreloader.astro` — overlay markup and scoped styles.
- `src/scripts/boot-preloader.ts` — the sequence, split out to stay under the
  CLAUDE.md §5 200-line cap. Astro inlines it into the HTML rather than emitting
  a file, which is what we want: no extra request before the first frame.
- Mounted as the first child of `<body>` in `BaseLayout.astro`. `<body>` gained
  `tabindex="-1"` so focus can move there when the overlay is removed, with
  `body:focus { outline: none }` so it never shows a ring.

### Verified

Timing was checked by running the *built* script against a DOM stand-in in Node
(no browser automation in this repo, and adding one needs owner sign-off per §2):

- Greeting 5 × 1000ms → line 2 at 5000ms → roles 4 × 1250ms → line 3 at 10000ms
  → fade at 11200ms → removed from the DOM at 11700ms.
- `boot-seen` set, and `prefers-reduced-motion`, both remove the overlay at 0ms
  with no sequence.
- Build clean: 0 errors, 0 warnings, 0 hints.
- Boot script 785 B gzipped against the 2.5 KB allowance. Page total 6.85 KB
  gzipped against the 40 KB cap.

### Bug caught and fixed before commit

The first version waited on `window.load` with no ceiling, so a single stalled
image or font would have left the overlay up forever with the dots spinning —
the site unreachable except by clicking to skip. There is now a 3000ms grace cap
after the 1200ms dwell: reveal happens regardless. Re-tested, reveals at 14200ms
on a load event that never fires.

### Still to eyeball in the browser

None of the below is verifiable from the build output — please look:

- The word swap at 150ms: is the upward slide too subtle or too much?
- Whether 10s before the hero feels right. It is a long hold on a first visit.
  Shortening the cycles is a one-line change in `BootPreloader.astro`.
- ~~The overlay is `hidden` in markup and revealed by script, so the hero may
  flash before it appears.~~ **Fixed below.**

### Open question — now resolved in PRD §8

The LCP tension is no longer an open question. See the §8 amendment in the
increment 1.8 entry above.

## 2026-09-19 — increment 1.6

### Last milestone completed

Post-deploy metadata and alias fixes.

- `site: "https://rishi-ventrapragada.vercel.app"` added to `astro.config.mjs`.
  `BaseLayout.astro` derives canonical, `og:url` and `twitter:url` from one
  `canonical` const, so a custom domain later only needs `site` changed.
  Added `twitter:url`, `twitter:title`, `twitter:description`, which were missing.
- Live URL is now **https://rishi-ventrapragada.vercel.app** and serves increment 1.6.
- CLAUDE.md §4 gained the Lightning CSS rule: `animation-timeline` and
  `animation-range` must live in their own rule, never beside the `animation`
  shorthand. Authorized by the owner this session.

### The "old nav still in the DOM" report — root cause

Not a code bug. The source was already correct after increment 1.5; nothing was
re-deleted this session. `rishi-ventrapragada.vercel.app` was an **alias pinned to a
10-hour-old increment-1 deployment**, so it served pre-1.5 markup while
`portfolio-gamma-lake-gtndl2ey0m.vercel.app` served the current build. Fixed with
`vercel alias set <deployment> rishi-ventrapragada.vercel.app`.

**There is only one Vercel project.** It was renamed `portfolio` →
`rishi-ventrapragada` (ID `prj_R7zqnBIxWhGIUImcGAZJHWsQhWXN`). `vercel ls` prints each
deployment under the project name as it was at deploy time, which makes the history
look like two projects. `.vercel/project.json` still records the old
`"projectName":"portfolio"`; the ID is what matters and it matches.

**Takeaway:** after a push, verify the alias points at the new deployment. A green
Vercel build does not mean the vanity URL moved.

### Verified on production after this deploy

- canonical / `og:url` / `twitter:url` — all `https://rishi-ventrapragada.vercel.app/`.
- Zero `localhost:4321` occurrences.
- Zero occurrences of `Rishi ©`, `Portfolio 01`, `MMXXVI`, `CSE · Data Science`,
  `Hyderabad, IN`, `React · Astro · Supabase`, `KalaCart`, `Life OS`, `AEGIS`.
- Served nav is the single inert hamburger.
- Client JS on `/`: 5.6 KB gzipped (ClientRouter only), against the 40 KB budget.

### Note

`<title>` and `<meta name="description">` still contain "Building for the web",
"CSE Data Science" and "Supabase". That is page metadata in `src/pages/index.astro`,
not the deleted caption layer. The owner confirmed this copy stays as is.

## 2026-09-19 — increment 1.5

### Last milestone completed

Hero and nav simplification, on top of increment 1.

- Nav reduced to a single inert hamburger, top right, 64px hit area. The brand label,
  `PORTFOLIO 01 / MMXXVI` block and `CSE · DATA SCIENCE / HYDERABAD, IN` stack are gone.
- Hero Layer C (the three-line caption) removed entirely, along with its CSS, its
  `caption-fade` keyframes and the mobile scrim.
- Wordmark capped at `clamp(320px, 72vw, 1100px)` centred, 88vw under 640px. Measured
  72.0% width / 14.0% margins at 1440px.
- Hair crosses the lower 40.4% of the letters at 1440px and 40.6% at 375px.
- Hero image deliberately untouched: same binary, same rendered box (470x607 at 1440px).

Verified after the resize: dissolve still 1 → 0.689 → 0.378 → 0 over the first 40% with
blur 0 → 8px; reduced motion still opacity-only; no horizontal overflow at 375px.

### Watch out for

`animation-timeline` must stay in its own CSS rule. When it sits beside `animation` (or
in a rule the minifier can merge with that one), Lightning CSS folds it into the shorthand
as `animation: ... scroll(root)`, which browsers reject — the dissolve then silently stops
working with no build error. This already happened once. The `:where(.hero)` prefix on the
longhand rule in `Hero.astro` exists solely to prevent that merge.

### Doc edits this session

- PRD.md §5.1 rewritten for the hamburger-only nav.
- PRD.md §5.2 rewritten: two layers instead of three, the SVG wordmark approach and its
  ink-box viewBox, the 72vw/88vw caps, and the minifier constraint above.

## 2026-09-18 — increment 1

### Last milestone completed

Increment 1 (PRD §10.1) complete: repo, Astro 7 scaffold, tokens, BaseLayout, Nav,
Hero with scroll dissolve, projects placeholder, footer, dev accent toggle, Vercel deploy.

- Repo: https://github.com/rishi-ventrapragada/Portfolio
- Live (public): https://portfolio-gamma-lake-gtndl2ey0m.vercel.app
- Vercel project: `rishiventra/rishi-ventrapragada`, framework preset Astro, output `dist`.
- Build: `astro check` clean — 0 errors, 0 warnings, 0 hints.
- Client JS on `/`: 5.6 KB gzipped (ClientRouter only) against the 40 KB budget in PRD §8.
  The React runtime chunk is emitted but never referenced, since no island exists yet.
- Hero image: 1342 KB source PNG → 51 KB / 110 KB WebP, well under the 250 KB LCP ceiling.

### Next milestone planned

Increment 2 (PRD §10.2): projects content collection with three entries
(KalaCart, Life OS, AEGIS), project tiles on Home per §5.3, `/projects` index.
Needs real copy and demo video assets from the owner before tiles can be honest —
PRD §7 lists both as `[TODO]`.

### Changes to governing docs

- CLAUDE.md §2 changed "Astro 6" → "Astro 7 (latest stable)", authorized by the owner
  in this session. The owner chose Astro 7.3.3 over 6.4.8 after I flagged that 7 is the
  current stable release. PRD.md never named a version, so it needed no edit.

### Open questions

- **Final accent** (PRD §11): crimson vs violet, to be decided by eye on the live site
  using the dev toggle. The toggle is removed once decided.
- **Résumé**: footer links to `/resume.pdf`, which does not exist yet. The link is
  labelled `[TODO]` until the file lands in `public/`.
- **Deployment Protection is ON** (`ssoProtection: all_except_custom_domains`), so every
  newly created `*.vercel.app` URL returns Vercel's login page instead of the site. Only the
  original alias `portfolio-gamma-lake-gtndl2ey0m.vercel.app` predates it and is public.
  Turn it off at Vercel → Project → Settings → Deployment Protection → Vercel Authentication
  → Disabled. I could not run `vercel project protection disable` — it was blocked here as a
  security-weakening action, so it needs the owner.
- **Pretty free URL**: ~~blocked~~ **RESOLVED in increment 1.6.**
  https://rishi-ventrapragada.vercel.app is live, public and serving the current build.
- **Custom domain** (PRD §11): not touched, and no domain was purchased or registered. The
  `.vercel.app` URLs are Vercel's free auto-generated ones. Owner adds any custom domain
  in the dashboard.
- **Hamburger menu**: the button is rendered `disabled` with `aria-expanded="false"`
  per PRD §5.1; behaviour is increment 6.
- **Firefox**: `animation-timeline: scroll()` is still behind a flag as of Firefox 152,
  so the rAF fallback in `Hero.astro` is the live path there. Worth eyeballing in Firefox.
