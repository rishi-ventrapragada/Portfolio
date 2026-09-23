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

The bar is a `RISHI` mark (`#top`) plus four anchors: Skills, Experience,
Projects, Contact (document order since increment 14). At 375px in the normal 12px / 0.12em `.label` style the
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

## 2026-09-23 — increment 26 (barcode scale-up)

### Last milestone completed

One `dividers:` commit plus this handoff: the About/Skills barcode is now
**64px tall, bars 2–8px, gaps 2–6px, 852px tile** (seed 26), bars 8px short
of each edge. Owner picked it over a denser variant (200 × 1–3px bars,
1–2px gaps, 32px, 716px tile) from side-by-side 1280 / 375 shots taken in
the live seam. Clapper and checker untouched.

`barcode-data.ts` is now a `makeBarcode({ seed, bars, bar, gap })`
generator; the old and rejected specs are recorded in its comment.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.12** — barcode table row, increment 26 paragraph, track widths.
- CLAUDE.md not touched.

### Verified

Local and live: half-track 1704px = 2 tiles (1280, 1000), 852 = 1 tile
(375); frame 0 vs −50% byte-identical at all three; `reduce` →
`animation-name: none`; no horizontal overflow; one sprocket, clapper 28px,
checker 48px unchanged.

### Still open

- The seam is 32px taller than before — owner to judge live.
- Carried over from increment 25: résumé PDF, Google brand terms,
  planned-frame contrast, Experience sky density, 320px nav.

### Next milestone planned

None queued. Waiting on the owner.

## 2026-09-23 — increment 25 (five-part batch)

### Last milestone completed

Five code commits on `main`, each built clean (0 errors / warnings / hints),
pushed, aliased and verified on `rishi-ventrapragada.vercel.app`, plus this
docs commit. Order A → B → C → E → D (E before D so the magnetic commit
could include the résumé card).

- `8566748` **dividers** — Video editing/Experience sprocket removed;
  `LoopDivider.astro` barcode (About/Skills), clapper (Experience/Projects),
  checker (Projects/Contact, owner picked 3 rows × 16px of three
  screenshotted options). Hero/About keeps `Divider.astro`, untouched.
- `33949b3` **contact** — credits scrim gone; text-shadow glow instead.
- `3c9221e` **contact** — real GitHub / LinkedIn marks, plain envelope.
- `d11c98b` **contact** — résumé is a fourth card.
- `35f34aa` **contact** — magnetic hover on link cards.

Owner decisions this session: credits glow = dark outline + faint
off-white bloom (not a pure white glow, which fails AA); brand marks
pinned white (both brands forbid recolouring), mail = plain envelope, not
the unverified Gmail logo; résumé renders as a non-link `[TODO]` card while
the PDF is missing; no magnetic effect on project links, nav, timeline
clips or the accent toggle.

### Decisions worth knowing before you touch this

- **The loop is Starfield's 200% / −50% track, but the half is snapped to
  whole tiles**: `--half: round(up, 100cqw, var(--tile-w))`. A plain
  `100cqw` copy lands mid-tile at the wrap. Change a tile size and the
  snap follows; keep `--tile-w` equal to the pattern's real period.
- **Barcode tile is 90 bars / 390px.** 36 bars / 155px repeated visibly
  nine times across 1280. Seeded (`barcode-data.ts`, seed 25).
- **Credits glow: the ring is load-bearing.** `--halo` in
  `FooterCredits.astro` is 20 zero-blur `--bg` offset copies (1.5px and
  3px rings) + two blurs. Blur-only halos measured 3.27 (crimson): a
  Gaussian is ~50% opaque at the stroke edge. Don't "simplify" it.
- **Brand marks are trademarks, not just CC0 paths.** Simple Icons dropped
  LinkedIn in v14; the path is from v13.21.0. GitHub and LinkedIn terms
  both say white/black only, no recolour — the glyph is pinned to
  `var(--fg)` in `ContactIcon.astro`. ASSETS.md has the terms.
- **Résumé switches itself on.** `FooterContact.astro` checks
  `import.meta.glob("/public/resume.pdf")` at build time. Drop the file in
  `public/`, push, and the card becomes a magnetic link — no code change.
  (`node:fs` isn't usable: no `@types/node`, and adding it needs asking.)
- **Phone contact screen now centres above the © line** (`padding-bottom:
  3.5rem` below 480px). Without it the résumé row touched © at 320×568.
- **Magnetic is off under reduced motion** (reasoning in PRD §5.8 and the
  `magnetic.ts` header). +443 B gz; page total 6,183 B gz of 40 KB.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.12** — rewritten: four seams, two kinds, pattern table, loop
  snapping, reduced motion; old sprocket text kept for Hero/About.
- **PRD §5.8** — contrast paragraph (glow, metric, numbers); contact
  screen (brand marks, hover); résumé card; magnetic hover paragraph;
  stage table row; isUrl paragraph.
- **PRD §5.15** — "carry their own glow" paragraph.
- **ASSETS.md** — new brand-marks entry; résumé entry reworded.
- CLAUDE.md not touched.

### Verified by measurement (local and live)

- **A**: one `.divider` (before `#about`); barcode → `#skills`, clapper →
  `#projects`, checker → `#contact`; nothing before `#experience`.
  Frame-0 vs −50% screenshots byte-identical, all three, at 1280 / 1000 /
  375. Reduced motion: `animation-name: none`, `transform: none`. No
  horizontal overflow.
- **B**: `::before` `content: none`. Worst within 2px of any glyph,
  5 viewports: crimson **5.10**, violet **6.06**, name 12.66.
- **C**: glyph `rgb(255,255,255)` at rest / hover / focus, both accents;
  only SVG request `favicon.svg`; zero off-origin requests.
- **E**: 331×80 at 1280 (= each contact card), dashed `<div>` while no PDF,
  `<a>` with a throwaway PDF (deleted, never committed); © clearance
  135 / 162 / 201 / 109 / 87 / 33px at 1280 / 1024 / 768 / 375 / 360 / 320.
- **D**: 20,10px off centre → 4,2; corners → ±6 / ±5.6 on every link card;
  spring-back ~450ms, one 0.58px overshoot; `reduce` and touch → `none`.

### Harness notes

- `Page.captureScreenshot` with `captureBeyondViewport: true` lays the page
  out un-stuck — the footer pin renders blank. Use the default (false)
  with document-space clip coordinates for anything inside a sticky pin.
- For "near the glyph" contrast, dilate with a **Euclidean** radius. A 5×5
  square reaches 2.83px on diagonals and false-fails pixels off corners.
- Rendering glyphs `color: transparent` keeps their `text-shadow`s — a
  clean way to see the ground under the text.

### Still open

- **Résumé PDF** — still pending from the owner (now self-activating).
- **Barcode repeat** — 390px tile still repeats ~3× across 1280. Longer
  tile = longer inline gradient; owner to judge live.
- **Google brand terms** unverified; if a Gmail mark is ever wanted,
  check them first.
- Carried over: planned-frame contrast, Experience sky density, 320px nav.

### Next milestone planned

None queued. Waiting on the owner.

## 2026-09-23 — increment 24 (three-part batch)

### Last milestone completed

Three commits on `main`, each built clean (0 errors / warnings / hints),
pushed, aliased and verified on `rishi-ventrapragada.vercel.app`:

- `44f5e2c` **skills** — divider between the tree and the constellation
  removed (the `<Divider />` after `<SkillTree />` in `index.astro`; the
  component is untouched). Five seams now.
- `79a7f63` **experience** — a fifth Starfield, in `.head` only.
- `4237946` **projects** — light-scoped frames are black film; perforations
  show the paper.

### Decisions worth knowing before you touch this

- **Experience sky is heading-only (owner's choice).** The monitor and
  timeline are opaque and fill the pin, so a whole-section sky would never
  show elsewhere. `.head` now runs to the monitor's top edge: the heading's
  2rem gap is padding, and `.head` has `margin-bottom: -var(--nav-height)`
  so the track slides up under it (the pin's transparent top padding). The
  monitor's document position is unchanged; each scrub zone starts 64px of
  scroll earlier. Same 160 stars in a 276px box → denser than the other
  skies. Owner to judge live.
- **Black frames re-point existing tokens on `.frame` only**
  (`ProjectFrame.astro`, `[data-theme="light"] .frame`). No new tokens, no
  literals. `--accent` can't be mixed into itself on one element, so link
  hover and `:focus-visible` inside the frame mix at the use site.
- **Sprocket holes: increment 23's "black in every theme" is superseded on
  the project frames** (owner's choice: `#111214` holes measured 1.1:1 on
  black). The section scope still doesn't redefine `--sprocket-hole`;
  the theme-light.css comment says so.
- **`--monitor-bg` (#000) now has two uses**: the Experience monitor and the
  light-scoped project frames. PRD §4.2 updated.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — seams six → five; starfield four → five sections.
- **PRD §5.12** — Skills/Video editing has no divider.
- **PRD §5.14** — new "Experience" paragraph; **§5.11** — heading over a sky.
- **PRD §4.2** — `--monitor-bg` and `--sprocket-hole` rows and paragraph.
- **PRD §5.3** — new "Black frame in the light scope" paragraph.
- **PRD §5.16** — audit line.
- CLAUDE.md not touched.

### Verified by measurement

- **A**: 5 dividers; order `DIV #about DIV #skills #skills-video DIV
  #experience DIV #projects` (+ the footer's); tree→video gap 0px.
- **B**: five skies (boot, hero, skills, skills-video, experience); the
  experience sky box equals `.head` exactly, `contain: strict`,
  `overflow: clip`, touching the divider above (0px), bottom = monitor top
  (4396 / 4794px at 1280 / 375). Stars `rgb(242,242,242)` only. Reduced
  motion: drift `none`, twinkle `none` @ 0.8. Scrub commits all four clips.
- **C** (both accents, 1280 hover + 375 touch): frame and panel `rgb(0,0,0)`;
  title / summary / pills / links 18.93; frame number 7.16; hover link +
  focus ring 5.40 crimson / 5.22 violet; hole centre `rgb(244,243,240)`;
  page, eyebrow 5.43 / 6.40 and heading 16.89 unchanged.

### Harness notes

- Chrome reports `color-mix()` results as `color(srgb 0–1 …)`. Scale by
  255 before computing a ratio, or everything reads 1.00.
- Right after `vercel alias set`, the first request can still get the old
  deployment. Re-run before you trust a mismatch.
- Astro 7's `astro preview` daemonises and listens on `localhost` (IPv6).
  `127.0.0.1:4321` refuses. Stop it with `npx astro preview stop`.

### Still open

- **Planned frame contrast**: `.planned` 0.5 opacity makes the black
  Recurzn frame read mid-grey; composited title 3.88, number 2.49. Below AA,
  but it was already below AA on the white card (3.63 / 2.24). The fade is
  the "not shipped" signal. Owner's call.
- **Experience sky density**: see above.

### Next milestone planned

None queued. Waiting on the owner.

## 2026-09-23 — increment 23 (six-part batch)

### Last milestone completed

**Six parts, one commit each, no source file shared between them** (PRD.md
is the one shared file; each commit edits only its own sections). Order
was A → C → B → E → D → F, not the brief's A–F: C went before B because
B's "bleeding past the top nav" turned out to be C's transparent bar.

- `79ef464` **hero** — boot noise removed; boot sky proven identical to the
  hero sky; meteors ported from Recurzn-Web's real geometry.
- `d863026` **nav** — solid from the bar's own bottom edge; 300ms fades.
- `cb02dd6` **about** — grid in the shell, height-capped; reveal on sight.
- `37aba47` **projects** — black sprockets; 12rem reserve for the panel.
- `09e2469` **skills** — tree drift/drag, ordered scatter, constellation
  turn, box-free names, line routing. **New client JS, flagged.**
- `a696b07` **contact** — accumulating credits, scrim, icon-card screen.

Owner decisions taken this session: the nav **stays dark** everywhere
(no per-section theme); the credits have **no title line**, three lines
only. Next milestone: none planned; see open items.

### Decisions worth knowing before you touch this

- **The nav "snap" was a gap, not a missing transition.** The bar went
  solid when the hero's bottom crossed y = 0, so for the last 64px it was
  transparent with white links over light About. `.is-scrolled` now has
  its own observer one bar-height lower (`rootMargin` can't `calc()`, so
  the px margins are rebuilt on viewport-height change).
  `[data-past-hero]` keeps the y = 0 trigger.
- **B's overflow was not measurable.** 0px horizontal overflow at nine
  widths before any change. The "bleed" was the full-bleed grid 12px off
  the edge plus the transparent bar. Contained in the shell and capped at
  `100dvh − nav − 2rem` from 768px.
- **`--sprocket-hole` is dark by *not* redefining it.** Custom
  properties inherit resolved values, so `:root`'s `var(--bg)` arrives
  in the light scope as `#111214`. Redefining it there is what made the
  holes paper-coloured.
- **The constellation could not be made crossing-free by placement
  alone.** The owner's nine stars sit near the box edges with 2–4 lines
  each; in the 327px phone box no arrangement is inside the box *and*
  clear of every line through the turn. So there are two layers: a
  build-time branch-and-bound search that minimises crossings (bounds,
  dots and label/label overlaps are hard rules, and the build throws),
  plus a runtime SVG mask that cuts lines under every name. Wide: 0
  crossings. Phone: 7, all cut. The phone turns ±3°, not ±6°: at ±6°
  "Videography" and "After Effects" collide at the extremes.
- **A greedy placer boxed itself in.** Videography took the only spot
  After Effects had. That is why it is branch-and-bound.
- **The first solver "pass" was fake.** While `labelSides` was an
  unused import, Vite tree-shook the module and the assertion never
  ran. It only threw once the component used it. Don't trust a
  build-time assert until something imports its result.
- **Scatter runtime motion is bounded by construction.** DRIFT 5px is
  under half the 12px build gap, so the rest state can't collide.
  `extent()` sizes canvases over the ±10° turn + drift. The drag needs
  runtime separation: 8 passes with the root and canvas clamps *inside*
  each pass (clamping after undid it: 7 overlaps). The held leaf yields
  as a last resort when a neighbour is pinned at the edge (the other 0).
- **Reduced motion keeps drag** on the tree (direct manipulation, 1:1
  with the pointer). Everything autonomous stops, and a released leaf is
  home in the same frame.
- **Credits scrim:** a radial gradient left the ends of the wide lines
  uncovered (2.51:1 unchanged). A blurred rounded `--bg` panel at 94%
  fixed it (5.19:1 worst).
- **Contact cards go three-across from 960px, not 720.** At 768 the
  213px cards wrapped every address.
- **Meteor reduced-motion dim moved to the track.** The keyframes own the
  streak's opacity, so the old `opacity: 0.35` on the streak was being
  overridden. Increment 22's "measured 0.34" was a mid-cycle sample.

### Doc edits this session (CLAUDE.md §7)

PRD §3 (two site-map rows), §4.2 (`--sprocket-hole` row and note), §5.1,
§5.3, §5.6 (About reveal and containment, scatter slots and balance,
tree motion, constellation placement, routing and turn), §5.8 (the whole
mechanic), §5.10, §5.14, §5.15, §5.16, §10 line 22. README: new
components, lib and scripts. SESSION.md: this entry. CLAUDE.md is
untouched.

### Verified by measurement

Harnesses in the session scratchpad (`lib.mjs` + `part*.mjs`, CDP over
the prior session's `cdp.mjs`). Every one was rerun against the
cache-busted vanity URL after the alias move, and every figure below
matched live to within timing noise.

- **A:** boot sky vs hero sky, animations paused, foreground hidden:
  **0 of 1 024 000 px differ**; clocks equal to the ms. Meteors 2px ×
  1276–1356px on screen, peak opacity 1. Reduce: 18s, track 0.35.
- **C:** transparent at hero-bottom 65px, solid at 63. Across both edges,
  one rect `0,0,1280,64` in 101/101 frames. Mid-fade
  `rgba(26,27,30,0.67)`.
- **B:** 0 overflow and 0 panels/captions outside the grid at seven
  sizes. Reveal 1→2→3 at 0/140/280ms, then 4→5, and it holds. Reduce and
  no-JS: all at opacity 1.
- **E:** holes `rgb(17,18,20)` (computed and pixel). Open panel 102px
  clear of the section bottom at four widths, in 3/3 real hovers.
- **D:** tree at rest 1.17px/s, 60 samples/30s with 0 overlaps (min gap
  20.9px); drag 0 overlaps in 40 steps; reduce 0.000px. Constellation 0
  accent px inside any name box at 1280/768/375; 2.5 / 2.0 / 1.6px/s.
  Balance before → after in PRD §5.6. JS +2.8 KB gz; page total ~6.7 KB
  of the 40 KB budget.
- **F:** lines `100 → 110 → 111 → 111 → contact`, reversible. The
  assembled block fits at 1280×720 / 1280×600 / 375×667 / 360×640 /
  320×568, with 182 / 122 / 245 / 231 / 167px spare. **At 375 the lines
  are 28px**, the widest 309 of 327px, one row each. Lines 2–3 wrap only
  at 320. Contrast worst 5.19 (crimson) / 6.64 (violet). © markup and CSS
  byte-identical.

### Harness notes

- A negative `animation-delay` plus a negative `currentTime` puts a
  paused CSS animation in its before-phase (progress `undefined`). Seek
  one full period later instead.
- CDP `captureScreenshot` `clip` is in **document** coordinates, not
  viewport.
- The nav's progress bar sets `visibility: visible` on itself, so hiding
  the nav with `visibility` leaves the accent bar painting. Use
  `display: none` when sampling accent pixels near the top.
- Inline `style.transform = 'none'` still animates if the element has a
  transition. Kill the transition first when auditing layout boxes.

### Still open

- **375px credits**: the owner will judge it live. 28px is the largest
  size where "DIRECTED & EDITED BY" stays on one row. A bigger size means
  each line wraps (the block fits either way, with ~245px spare).
- **Phone constellation**: names are correct and never on a line, but a
  few sit a little way from their star ("After Effects", "Motion
  Design"). Moving stars or edges is the owner's call.
- The contact glyphs are hand-drawn allusions, not official marks
  (GitHub is a cat's head). Swap in official brand SVGs only with their
  licences recorded in ASSETS.md.
- Carried over: `public/resume.pdf`, About art and dialogue, no-JS nav
  transparency, `@astrojs/react` named in CLAUDE.md §2 but absent from
  `package.json`, PRD §5.13 reserved, the AboutPanel fills judgment call.

## 2026-09-22 — increment 22 (seven-part batch)

### Last milestone completed

**Seven independent visual changes, one commit each, no file shared
between parts** (A nav bar, B dividers, F skill scatter, C starfield,
E constellation drift, D topo backdrop, G light theme), plus this docs
commit. Order was A → B → F → C → E → D → G: F had to settle
`SkillTree.astro` before C mounted a starfield into it, and G landed last
so it could validate B's dividers against a real light section.

Excluded by the brief and untouched: the eyebrow words ("Origin story",
"Also") and the comic-panel layout.

### Decisions worth knowing before you touch this

- **The sprocket divider's holes are *painted*, not punched.** This is
  the whole reason `Divider.astro` takes `above` / `below` / `stock`
  rather than being one CSS rule. A hole only reads as a hole while its
  fill matches the section behind it, so the divider is two 12px halves
  sharing one film stock, each punching its own side's colour. My first
  cut defaulted both halves *and* the stock to `--bg` and shipped an
  invisible solid band — the strip has to be a different surface from
  the holes, which is what ProjectFrame was doing with `--bg-raised` all
  along.
- **Five section `border-top` hairlines were deleted** when the dividers
  landed. The perforation is the seam now; keeping both read as a
  doubled rule.
- **The skill scatter asserts, it does not hope.** `skill-scatter.ts`
  throws at build time if any two labels — or any label and its root
  chip — still overlap after relaxation. Two bugs it caught that a
  screenshot alone would not have: two-item groups placing both leaves
  dead horizontal *through* the root (fixed with a quarter-turn phase
  offset for n ≤ 3), and the root needing to be a collision **box**, not
  a radius, because "Currently learning" is ~190px wide. The root is
  `white-space: nowrap` for the same reason — the obstacle box is sized
  from a one-line estimate.
- **`--on-accent` is not `--bg`, and `--tag-ink` is not `--on-accent`.**
  The ink that stays legible on a fill flips with the theme, and it
  flips *differently* for the accent chip than for the comic panels:
  near-black wins on dark-theme crimson (5.38) and on the light panel
  fills (5.28), white wins on the darkened light accent (6.02) and on
  the dark panel fills (4.81). Two separate tokens, both measured.
- **The panel fills needed a real decision, not a token swap.** Their
  `color-mix` partner's job is to *darken* the palette word; on a light
  surface `--bg-raised` is white, so the same expression would have
  washed all five out to pastel. Light keeps a dark partner (`#2a2b30`)
  at 72%. Dropping the dark share to 52% also fixed a **pre-existing**
  AA failure (tag at 3.89 → 4.81) that nobody had measured before.
- **The topo backdrop's `feColorMatrix` tints to `--fg-muted`.** Left
  white, the contours measured 3.13:1 behind the contact links — under
  AA. That was a real failure found by sampling rendered pixels, not a
  harness artefact, and the fix was the cause (tint the filter output),
  not the symptom (dim the layer).
- **The constellation drifts via one transform on the container.** Not
  per-star, which would desync the stars from their fixed-coordinate
  lines. Verified rather than argued: 0.01px worst endpoint offset
  across seven samples of the loop.
- **Starfield meteors are halved and dimmed under reduced motion, not
  removed** — reduced-motion is an OS battery default for many mobile
  visitors, and deleting them would silently take the feature away.
  Preserved from the original's reasoning.
- **`[data-hero]`, not `#hero`**: every `[id]` inherits a 5rem
  `scroll-margin-top` from `global.css`, and nothing links there. The
  nav's old 1×1 sentinel at a hardcoded `top: 100dvh` is gone; both
  `.is-scrolled` and `[data-past-hero]` now observe the real box.
- **`[data-constellation]`** exists because `Starfield.astro` has a
  `.sky` of its own and one is mounted in that section. Astro scopes the
  styles but not the class name, so `querySelector('.sky')` was hitting
  the wrong element — it cost me a debugging cycle.
- **`theme-light.css` is a separate file for the cascade, not just the
  cap.** `[data-theme="light"]` is (0,1,0) and `:root[data-accent=…]` is
  (0,1,1), so the light tokens can only win on source order.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — site map rewritten (light sections, dividers, starfield
  hosts). **§4.2** — new "tokens that are not surfaces" block.
  **§5.1** — progress-bar hiding and the real-box observer. **§5.3** —
  light scope and the `.shell` move. **§5.6** — the scatter replaces the
  column-fan paragraphs, mobile marked a deliberate scope boundary, the
  constellation's "no animation" paragraph replaced by the drift.
  **§5.8** — backdrop and divider pointers. **New §5.12** dividers,
  **§5.14** starfield, **§5.15** contact backdrop, **§5.16** light
  sections (§5.13 left reserved). **§10** — new line 21.
  **README** — three new components, three lib modules, the new
  stylesheet. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`cdp.mjs` + per-part harnesses in the session scratchpad (headless
Chrome over CDP, `astro preview` over `dist/`, `boot-seen` pre-set).
Build + `astro check` 0/0/0 before every commit.

- **A**: hidden at scrollY 0–900 with `scaleX(0)`, visible from 901,
  `scaleX(1.0000)` exactly at the document end, hides again on the way
  up; nav height and track geometry identical hidden vs shown.
- **B**: 6 dividers at the 6 expected seams; all six sections compute
  `border-top-width: 0`; at a simulated dark/light seam the upper half
  punched `rgb(17,18,20)` and the lower `rgb(244,243,240)` — checked
  from computed values *before* G existed, then visually after.
- **F**: 34 leaves / 34 rays at 1280 and 960 — none clipped, none
  wrapped, **zero label overlaps, zero leaf-on-root collisions**; mobile
  re-confirmed unchanged at 768 and 375.
- **C**: 4 instances × 170 nodes = **684 starfield nodes** on a
  ~1100-node page; every star `rgb(242,242,242)`, zero accent pixels;
  `contain: strict`, `will-change` on near/mid layers only; seamless
  loop proven by geometry (layer 1280 / track 2560 / copy offset 1280 /
  keyframe end 1280, all equal); reduced motion exactly as specified.
- **E**: 0.01px worst endpoint offset across the loop, no label leaves
  the box, no overflow, `animation: none` under reduce.
- **D**: contact links **7.81:1** worst case over the contours (was 3.13
  before the tint); fully static in both motion branches.
- **G**: **27 text pairings computed, 0 failing**, both accents; panel
  tags sampled from rendered pixels in all three grade states — 5.22 /
  5.22 / 6.77; sprocket holes `rgb(244,243,240)` on white frames; light
  scope resolves `#c2183a` / `#6d28d9` while the document keeps
  `#ff3b5c` / `#a78bfa`; 375px both sections light, single column, no
  overflow, grade cycle still stops under reduce.

### Harness notes

- **Astro scopes styles, not class names.** Two components can both own
  a `.sky`; scope page-level selectors with a data attribute.
- `getComputedStyle` returns `color(srgb 0.76 0.55 0.28)` for a
  `color-mix`, not `rgb()`. A naive `rgb\\(` parser reads those as
  fractional and reports false contrast failures — five of them, in my
  case. Sample rendered pixels instead.
- Lazy images are still blank when `captureBeyondViewport` fires.
  Scroll the page, `await Promise.all([...document.images].map(i =>
  i.decode()))`, then capture.
- `Storage.clearDataForOrigin` did not clear `sessionStorage` for the
  preview origin, so the boot overlay would not re-render; the built
  HTML is the authoritative check for markup that only appears once per
  session.

### Live

Alias pointed at `rishi-ventrapragada-2hacrbusf` and verified **on the
vanity URL itself**. Served markup: 6 dividers, 649 `.star` (640
starfield + 9 constellation), 12 layers, 12 meteors, 2 `data-theme=
"light"`, 1 `.topo`, 34 scatter leaves. Live CDP re-runs match local
exactly — A: nav geometry identical hidden vs shown, `scaleX(1.0000)` at
the document end; F: 34/34 leaves, zero overlaps at 1280 and 960;
E: 0.01px worst endpoint offset across the loop; C: every star
`rgb(242,242,242)`; D: 7.81:1 worst over the contours; G: light scope
resolves `#c2183a` and sprocket holes `#f4f3f0`.

**Harness gotcha worth keeping:** the first post-alias `curl` of the
vanity URL returned the *previous* deployment's HTML — a stale CDN read,
not a bad deploy. The deployment URL and a cache-busted vanity request
both returned the correct 154 390-byte document. Always cache-bust when
verifying an alias move, or you will chase a deployment problem that
does not exist.

### Still open

- The owner will look at the AboutPanel placeholder fills across all
  three grade states; that mix partner and share are the one visual
  judgment call in the batch rather than a measured fact.
- `public/resume.pdf`, the About panel art and dialogue, the no-JS nav
  transparency.
- `@astrojs/react` is named in CLAUDE.md §2 as installed but is not in
  `package.json` — still unreconciled, unrelated to this batch.
- PRD §5.13 is deliberately left reserved.

## 2026-09-22 — increment 21

### Last milestone completed

**Contact/credits: the continuous crawl replaced by staged reveals**
(PRD §5.8), one code commit plus this docs commit. Increment 17's single
tall `.roll` translating against a view timeline is gone — with one rigid
strip moving through a fixed pin, earlier content was *physically forced*
off the top edge as later content arrived. Now four discrete stages
(`FooterStage.astro`, new) stack in one grid cell inside the same pin and
are committed one at a time by scroll zone, each settling into the same
fixed box and holding. `credits-roll.ts`, `@keyframes credits-roll`, the
`--credits` view timeline and the `--credits-progress` fallback all
deleted; `src/scripts/footer-scrub.ts` (new) replaces them.
`Footer.astro` 200 → 145 lines.

Stages: `title` (RISHI VENTRAPRAGADA) → `built` (Astro · Tailwind ·
Vercel) → `author` (Directed, developed & edited by Rishi) → `contact`
(`FooterContact.astro`, unchanged content).

### Decisions worth knowing before you touch this

- **The zone engine is `experience-scrub.ts`'s `initScrub`, imported
  unmodified.** It already takes (track, ids, commit) and is generic;
  there was no reason to write a second one. Absolute `scrollY` each
  frame, four equal zones, commit only on zone change — so reversal is
  free and stateless, exactly like Experience.
- **Stages hide with `opacity`, NOT `visibility: hidden`** — and this is
  the one place the footer deliberately diverges from
  `ExperienceFrame.astro`. `visibility: hidden` drops the contact links
  out of the focus order for three of the four zones; measured during
  this increment, `.focus()` did not stick and `document.activeElement`
  fell back to `<body>`, so the `focusin` keyboard jump had no event to
  fire on. Experience does not hit this because its clip *buttons* live
  outside the frames and are always visible; here the links are the only
  focusable content and they live inside a stage. `pointer-events: none`
  keeps a hidden stage from swallowing clicks.
- **Reduced motion now KEEPS the pin — the inverse of increment 17.**
  That is not a reversal of judgment, it follows from the mechanic
  changing. A roll moving content at a rate other than the scroll rate is
  parallax (WCAG 2.3.3's own example), so it had to go. A zone commit is
  a discrete state change and `position: sticky` is layout, so it adds no
  motion beyond the visitor's own scroll — precisely the rationale §5.11
  already uses for Experience. Only the 320ms entrance transition drops.
- **`grid-template-rows: 1fr` + `align-items: center`, never
  `place-content: center`.** `place-content` collapses the grid row to
  the content height; the contact card's absolutely-positioned © line
  then anchors to a ~69px box and lands between "Get in touch" and the
  links instead of on the pin's bottom edge. Caught in a screenshot, then
  measured (contact box 448–516 instead of 64–900). `.contact` carries
  `width/height: 100%` + `justify-self/align-self: stretch` to fill the
  stage it is centred in.
- **The attribute is `data-credits-stage`, not `data-stage`.**
  `BootPreloader.astro:27` already owns a bare `data-stage` for its
  status line, and the first cut collided with it — both the script query
  and the noscript `[data-stage]` override would have hit the preloader.
- **Entrance vs exit is the whole fix.** Entering: `translateY(0.75rem)`
  → 0 plus a fade, 320ms. Leaving: opacity only, no exit transform — so
  an outgoing stage fades where it stands and never appears to leave by
  the top.
- **The no-JS `[data-credits-stack] { display: block }` override is new.**
  With one roll there was nothing to un-stack; four overlapping grid
  cells would otherwise collapse onto each other in static flow.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.8** — rewritten in full, opening with an explicit "this
  replaces increment 17's continuous crawl" and why; new sections for the
  stage table, the zone/commit mechanic, the entrance, the
  opacity-not-visibility rule, keyboard, no-JS and the inverted
  reduced-motion rule. **§10** — new line 20 (increment 21).
  **README** — `FooterStage` added to the component list,
  `credits-roll.ts` → `footer-scrub.ts` in scripts.
  **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`cdp.mjs` + `verify.mjs` / `keyboard5.mjs` / `final.mjs` / `mobile.mjs`
in the session scratchpad (headless Chrome over CDP, `astro preview` over
`dist/`, `boot-seen` pre-set):

- Build + `astro check`: 0 errors / 0 warnings / 0 hints.
- **Zones at 1280×900**: track 2250, pin 900, pinned distance 1350.
  Forward `title → built → author → contact`; reverse returns
  `contact → author → built → title` at the same boundaries. **Every
  stage settles at top 64 / bottom 900** — the identical box, which is
  the whole point of the increment. Inactive stages sit at top 76,
  opacity 0, `translateY(12px)`; none ever crosses the pin's top edge.
- **375×812**: all four stages at top 64 / bottom 812, no horizontal
  overflow, contact links on one row (single row, top 454).
- **Keyboard**: from the footer's top (scrollY 6828, `title` active),
  focusing GitHub / LinkedIn / Gmail / Résumé each moves scrollY to 8178
  (document max), commits `contact`, and lands the link at 498–512, in
  view, `:focus-visible` true. Mouse-modality focus leaves scrollY at
  6828 (`:focus-visible` false) — increment 17's behaviour preserved.
- **Reduced motion**: stage `transition: none` (instant swaps), pin still
  `position: sticky`, all four zones commit and reverse identically.
- **No JS**: pin `static` 3408px, stack `display: block`, stages at
  64–900 / 900–1736 / 1736–2572 / 2572–3408, all `transform: none`,
  opacity 1 — four frames in plain document order ending on contact.
- **Contact card geometry after the layout fix**: stage 64–900 (836),
  `.contact` 64–900 (fills it), body centred 448–516, © at 850–868 —
  matching increment 17's measured 868 exactly.
- **Budget**: 1278 B gzipped of referenced external JS + 2356 B inline
  ≈ 3.6 KB of the 40 KB cap. The Footer chunk shrank (617 B raw / 444 B
  gz) now that the progress fallback is gone.
- **Screenshots read by eye**: `stage-p125.png` (title), `stage-p375.png`
  (built), `stage-p625.png` (author), `stage-p875.png` (contact),
  `nojs-top.png`, plus `m-*.png` at 375.

### Live

Alias pointed at `rishi-ventrapragada-7fpzsweun` (Git deploy of the code
+ docs push, Ready in ~16s) and verified **on the vanity URL itself**
with `live.mjs` / `live-kb.mjs` / `live-final.mjs`: served HTML carries
all four `data-credits-stage` values with `title` pre-`data-active`, and
**zero** hits for `credits-roll` / `data-credits-roll` (the old mechanic
is gone from the deployed bundle). Live CDP at 1280×900 reads the same
numbers as local — track 2250, pinned distance 1350, forward
`title → built → author → contact` and the reverse walk returning
correctly, every stage settling at top 64 / bottom 900; all four contact
links jump scrollY 6828 → 8178 and land at 498–512 in view with
`:focus-visible` true; mouse-modality focus leaves scrollY at 6828;
reduced motion `transition: none` with the pin still `sticky`.
`liveshots/stage-p*.png` match the local shots. Re-point once more after
this docs line lands.

### Still open

- The owner said they will watch the entrance animation live to confirm
  it reads as *settling into place* rather than a fade with a jump. The
  320ms / 0.75rem values are the tuning knobs if it does not.
- `public/resume.pdf`, the About panels, the no-JS nav transparency.
- `@astrojs/react` is named in CLAUDE.md §2 as installed but is **not**
  in `package.json` — unrelated to this increment, but worth reconciling.

## 2026-09-22 — increment 20

### Last milestone completed

**Skills: the video-editing constellation** (PRD §5.6), one code commit
(`skills: add video-editing constellation`) plus this docs commit. A new,
**separate** second Skills section — `SkillConstellation.astro`, one file,
no children, 200 lines — mounted in `index.astro` between `<SkillTree />`
and `<ExperienceTimeline />`. Nine named stars (Videography, After
Effects, Premiere, Motion Design, DaVinci Resolve, Canva, Color Grading,
CapCut, Audio Mixing) joined by ten 2px `--accent` lines into one closed
shape, over ~14 dim decorative specks. Static: no script, no animation,
no hover, no links. `SkillTree.astro`, `Nav.astro` and `global.css` were
not touched; no tokens added.

### Decisions worth knowing before you touch this

- **The eyebrow is "Also", not "Toolkit".** The tree directly above
  already says "Toolkit"; repeating it reads as a duplicated header. The
  h2 "Video editing" is the owner's own descriptor. Both are copy
  choices made here — flag them if the owner wants different words.
- **One coordinate set, two box shapes.** Every star is a build-time
  `{x, y}` percent of the `.sky` box; only the box changes across
  breakpoints (2:3 portrait below 768px, 16:10 and max 960px above), so
  the labels stay a fixed 14px while the geometry rescales. Do not add a
  second coordinate set for mobile — the portrait box is what makes
  nine rows fit at 375px.
- **A label sits on the side with the room:** `x > 50` → left of its
  star, else right. That rule, plus the nine y bands ~11% apart, is the
  whole no-overlap / no-clipping guarantee. Moving a star's `x` across
  50 flips its label side; moving two stars into the same band at 375px
  is what would break it.
- **Top and bottom stars are at y 9 and 91, not 6 and 94.** At 6/94 the
  dot's `--accent-soft` glow ring rendered half outside the box (caught
  in the screenshot, not by the geometry assertions, which only measure
  the label rects).
- The SVG is the tree's proven technique: `viewBox="0 0 100 100"`,
  `preserveAspectRatio="none"` so the shape stretches with the box, and
  `vector-effect="non-scaling-stroke"` so the strokes stay 2px.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — new `#skills-video` site-map row; the Skills row's
  "constellation is next" aside removed. **§5.6** — the tree paragraph's
  forward reference closed; four new constellation paragraphs (content,
  geometry, responsive rule, measurements, no-animation). **§10** — new
  line 19; line 17's stale "next, separate section" tail removed.
  **README** — `SkillConstellation` in the component list.
  **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`cdp.mjs` + `verify20.mjs` in the session scratchpad (headless Chrome
over CDP, static server over `dist/`; 1280, 960, 768, 375):

- Build: 0 warnings. **Geometry at all four widths**: 9 names, all nine
  verbatim, none clipped (`scrollWidth <= clientWidth`), none wrapped,
  no pairwise label overlap, every label inside the `.sky` rect, no
  horizontal overflow, labels a fixed 14px. Boxes 960×600 / 864×540 /
  672×420 / 327×491.
- **Real rendered pixels**: 1×1 `captureScreenshot` clips decoded from
  PNG at all ten edge midpoints — **10/10** read accent red (pure
  `rgb(255,59,92)` on six, antialiased 173–249 on the diagonals).
- **Accents**: line stroke computes to `rgb(255, 59, 92)` under crimson
  and `rgb(167, 139, 250)` under violet; the star glow picks up
  `--accent-soft` in both.
- **Structure / a11y**: `<section>` labelled by its h2 "Video editing",
  still exactly one h1 on the page, 0 links in the section, `.lines` and
  `.specks` both `aria-hidden="true"`.
- **Nav unchanged**: hrefs still `#top #skills #experience #projects
  #contact`, no `#skills-video` link; `#skills` lands the tree at 80px
  and the constellation sits below it (top 981px at 1280).
- **Budget**: 0 external scripts; inline 3276 B gz — unchanged from
  increment 19's 3280 B, so the section added no client JS.
- **Reduced motion**: `animation-name: none` on every star, name, speck
  and line — nothing to branch on.
- **Screenshots read by eye**: `i20-1280.png`, `i20-960.png`,
  `i20-768.png`, `i20-375.png`.
- **Harness note (cost me a false alarm):** `Page.captureScreenshot`
  with a `clip` silently returns background for anything outside the
  current viewport. The section is ~3000px down the page, so the first
  pixel probe read 0/10 and the first screenshots showed the *tree*.
  Both fixes: compute the clip in **page** coordinates
  (`rect + window.scrollX/Y`) and pass `captureBeyondViewport: true`.
  Use that for any section below the fold.

### Live

Alias pointed at `rishi-ventrapragada-ee9jwspdq` (Git deploy of the code
push, Ready in 16s) and verified **on the vanity URL itself** with
`live20.mjs`: served HTML carries `#skills-video`, the h2 and all nine
names; at 1280 and 375 — 9 names, 10 edges, none clipped or wrapped, no
overlap, all inside the box, no overflow, lines `rgb(255,59,92)` 2px,
boxes 960×600 and 327×491. `live20-1280.png`, `live20-375.png` match the
local shots. Re-point once more after this docs commit lands.

### Still open

- Copy: the "Also" eyebrow and the "Video editing" h2 are mine, not the
  owner's words — confirm or replace.
- `public/resume.pdf`, the About panels, the no-JS nav transparency.
- `AGENTS.md` is untracked at the repo root and is not mine; left alone.

## 2026-09-22 — increment 19

### Last milestone completed

**Skills: heading renamed, branches scale with leaf count** (PRD §5.6),
one code commit (`skills: scale branches with leaf count, rename to
Skills`) plus this docs commit. h2 "Tech stack" → "Skills" (eyebrow
"Toolkit" stays). `SkillGroup.astro` computes
`branches = max(2, ceil(n / 3))` → Languages / Frameworks / AI fork three
ways, the rest two; the fan SVG is `viewBox="0 0 N 1"` with one line per
branch from `(N/2, 0)` to `(i + 0.5, 1)`; `SkillChain.astro` takes
`branches` and lays out `repeat(var(--branches), 8rem)` columns. Mobile
untouched.

### Decisions worth knowing before you touch this

- **The desktop tree is now centred wrapping rows, not the six-column
  band grid.** Forced by arithmetic, not taste: a leaf column must stay
  ≥ 128px (increment 18's measured floor for "Tailwind CSS" at 14px), so
  three 3-branch groups need 3 × 416 + 48 = 1296px in one band and the
  shell is 1184px (864 at 960). Every leaf is now exactly 8rem at every
  desktop width; a group is `branches × 8rem + gaps` wide; rows fall out
  of the content in document order (no `dense`). Rows: 1280 →
  [Languages, Frameworks] / [AI, Tools, Platforms] / [Cloud, Learning];
  960 → [Languages, Frameworks] / [AI, Tools] / [Platforms, Cloud,
  Learning]. The learning cluster no longer has a placement rule; it
  centres in its row like everything else.
- **8rem is a hard floor.** Going below it clips "Tailwind CSS" /
  "Google Cloud" at 14px. If a longer label ever arrives, widen `8rem` in
  `SkillChain.astro` *and* `SkillGroup.astro` together.
- The fan's viewBox is in branch units, so a 3-branch fan's outer lines
  span 144px over 28px — shallow, but the middle line is vertical and the
  spread reads as intended in the screenshots.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — Skills row. **§5.6** — heading "About and Skills"; the
  Skills paragraph: h2 rename, the branch rule, the fan generalised, the
  row layout and its arithmetic, measurements. **§10** — new line 18.
  **SESSION.md** — this entry. README unchanged (same components).

### Verified by measurement, not eyeballing

`cdp.mjs` + `verify19.mjs` in the session scratchpad (headless Chrome over
CDP, static server over `dist/`; 1280×1250, 960×1400, 768×1400, 375×812):

- Build + `astro check`: 0 / 0 / 0. Built HTML: 3 × `viewBox="0 0 3 1"`,
  4 × `"0 0 2 1"`. h2 text "Skills" = nav label "Skills". Headings 4 h2 /
  7 h3, 0 links, 0 scripts (7 inline blocks, 3280 B gz, unchanged).
- **Branches**: per group `--branches` / grid tracks / `data-head` count /
  fan lines = 3,3,3,2,2,2,2 at 1280 and 960; fan `x1` 1.5 (three) or 1
  (two), `x2` 0.5,1.5,2.5 / 0.5,1.5 — even by construction; fan boxes
  416×28 and 272×28; learning fan `stroke-dasharray 4px, 4px`.
- **Legibility again**: 34 leaves + 7 roots at all four widths, none
  clipped, none wrapped, leaves 14px; **every leaf 128px wide** at 1280
  and 960 (was 181 / 126–130). All names read in the screenshots.
- **Rows**: 1280 → groups at y 2418 / 2666 / 2913 exactly as predicted
  (Languages x 212, Frameworks 652; AI 136, Tools 576, Platforms 872;
  Cloud 356, Learning 652); 960 → y 2385 / 2633 / 2880 with Platforms,
  Cloud, Learning on the last row. `scrollWidth == clientWidth` at 375 /
  768 / 960 / 1280. Section 902px tall at 1280 (953 before).
- **Unchanged**: root `rgb(255,59,92)` / dark text, connectors
  `rgb(255,59,92)` 2×16, Docker / Kubernetes 0.5 + dashed, anchor →
  80px, `animation-name: none` throughout, mobile identical to 18.
- **Screenshots**: `skills19-1280.png`, `skills19-960.png`,
  `skills19-768.png`, `skills19-375.png` + `-b` (compare `skills-*.png`
  from increment 18).

### Still open

- The video-editing constellation section (next increment): separate
  section, separate anchor, Canva goes there.
- `public/resume.pdf`, the About panels, the no-JS nav transparency.
- Vercel alias: pointed at `rishi-ventrapragada-q0pdnp0ij` (Git deploy of
  the code + docs push, Ready in 24s) and verified on the vanity URL
  itself with `live19.mjs`: h2 "Skills", 3 × `viewBox="0 0 3 1"` and
  4 × `"0 0 2 1"` in the served HTML, 34 leaves + 7 roots at 1280 and
  375, none clipped or wrapped, every leaf 128px at 1280, fan lines and
  heads 3/3/3/2/2/2/2, rows at y 2418 / 2666 / 2913, no overflow, nav
  "Skills" lands at 80px. `live-skills19-1280.png`,
  `live-skills19-375.png`. Re-pointed once more after this line landed.
  (Harness note: the deploy poll must skip the *previous* deployment's
  row — the first `Ready` row is the old one until the new build lands.)

## 2026-09-22 — increment 18

### Last milestone completed

**Tech stack is a skill tree** (PRD §5.6), one code commit
(`skills: replace the pill cards with a skill tree`) plus this docs commit.
`TechStack.astro` deleted (nothing else referenced it; `Pills.astro` stays
for `ProjectDetail.astro`). New `SkillTree.astro` (section, data, the
six-column grid), `SkillGroup.astro` (root + fan SVG) and
`SkillChain.astro` (the leaves, both layouts, connectors). Same
`id="skills"`, same nav anchor. Canva is out of Tools — it belongs to the
video-editing constellation, which is the **next increment and a separate
section**; do not fold it into this tree.

### Decisions worth knowing before you touch this

- **Legibility set the numbers.** 14px mono leaves with 12-character
  labels ("Tailwind CSS", "Google Cloud") need 128px pills; six columns of
  those plus gaps and gutters is 944px, so the tree layout starts at
  **960px** and everything below stacks. Tablets get the stacked layout on
  purpose — it is the same pills at the same size.
- **Below 960px is option (b), stacked spine-and-chain, not a pannable
  diagram.** A wrapping flex chain where every pill carries a left tick and
  the gap equals the tick: the first pill in a row joins the spine, the
  rest join the pill before them. No panning, no shrinking.
- **Roots have dark text on the accent.** `--fg` on crimson is 3.5:1 (fails
  AA at 12px); `--bg` is 5.4:1 on crimson and 6.9:1 on violet.
- **Learning cluster = `.planned` on the leaves + dashed lines; the root is
  outlined, not filled-and-dimmed.** A solid accent root at 0.5 opacity
  would fail contrast. Flagged in the report as the one bend on the
  utility. Leaf defaults are in `@layer components` so `.planned` wins
  border-style and opacity (the `ExperienceClip.astro` pattern).
- **Static, no interaction, no animation.** There is no per-skill detail to
  reveal and inventing one is §7; a list reads faster than a widget. A
  scroll-in draw was considered and dropped for the same reason the brief
  gives: instant legibility. Reduced motion therefore changes nothing.
- **Column split is build-time** (`rows = ceil(n/2)`, `data-head` on each
  column's first item so it gets no connector above) — the
  seeded-waveform pattern; zero client JS.
- **Fan trick**: the SVG is a `2×1` box stretched with
  `preserveAspectRatio="none"`; straight lines stay straight under
  non-uniform scaling and `vector-effect="non-scaling-stroke"` keeps them
  2px at any column width. No coordinates depend on the viewport.
- h2 still says "Tech stack" under the "Toolkit" eyebrow; renaming it
  "Skills" to match the nav is the owner's call.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — Tech stack row. **§5.6** — the Tech stack paragraph
  rewritten in full, with the "separate video section, do not merge"
  note. **§10** — new line 17. **README** — components list.
  **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`cdp.mjs` + `verify18.mjs` + `violet18.mjs` in the session scratchpad
(headless Chrome over CDP, static server over `dist/`, `boot-seen`
pre-set; 1280×1150, 960×1150, 768×1400 fine pointer, 375×812 touch):

- Build + `astro check`: 0 / 0 / 0. `grep -rn TechStack src` → 0 hits.
  Headings: 1 h1, 4 h2, **7 h3** (the roots) — the outline gained the
  category level. 0 links in the section.
- **Every node legible at every width**: 34 leaves + 7 roots at all four
  widths, `scrollWidth <= clientWidth` on each (nothing clipped), every
  leaf one line (≤ 40px tall), leaves 14px, roots 12px. All 34 names
  read in the screenshots at 1280 and 375.
- **Hierarchy**: root `rgb(255,59,92)` fill / `rgb(17,18,20)` text; leaf
  `rgb(26,27,30)` fill. Leaves 181px wide at 1280, 126–130 at 960.
- **Lines**: connector pseudo-elements `background rgb(255,59,92)` 2px, fan
  `stroke rgb(255,59,92)` 2px, spine `2px solid rgb(255,59,92)` below
  960 — full opacity, and the screenshots read as bright red lines, not
  hints. Violet: root `rgb(167,139,250)` with the same dark text, lines
  and fan violet.
- **Learning**: Docker / Kubernetes opacity 0.5, dashed border; their
  connectors `dashed rgb(255,59,92)`, spine dashed, fan
  `stroke-dasharray 4 4`; root transparent with accent text, dashed.
- **Layout**: `scrollWidth == clientWidth` at 375 / 768 / 960 / 1280.
  1280: three groups per band at x = 48 / 451 / 853, 379px each, bands at
  y 2318 / 2667, learning at 451,2864 (the middle pair). 375: seven
  stacked groups 327px wide, section 1472px.
- **Anchor**: nav "Skills" → `#skills` top at 80px.
- **Reduced motion**: `animation-name: none` on every element in the
  section (there is none to remove).
- **Client JS**: unchanged — 0 external, 7 inline blocks, 3280 B gz.
- **Screenshots**: `skills-1280.png`, `skills-960.png`, `skills-768.png`,
  `skills-375.png` + `-b` + `-c`, `skills-1280-violet.png`.

### Still open

- The video-editing constellation section (next increment): separate
  section, separate anchor, Canva goes there.
- `public/resume.pdf` still missing; the five About panels; the no-JS nav
  transparency noted in increment 17.
- Vercel alias: pointed at `rishi-ventrapragada-opbwxp4eb` (Git deploy of
  the code + docs push, Ready in 20s) and verified on the vanity URL
  itself with `live18.mjs`: 34 leaves + 7 roots at 1280 and 375, none
  clipped or wrapped, 14px leaves, root `rgb(255,59,92)` / dark text,
  connectors `rgb(255,59,92)`, fan shown at 1280 and hidden at 375,
  Docker / Kubernetes at 0.5, no overflow, nav "Skills" lands at 80px.
  `live-skills-1280.png`, `live-skills-375.png`. Re-pointed once more
  after this line landed.

## 2026-09-22 — increment 17

### Last milestone completed

**The footer's credits roll is real** (PRD §5.8), one code commit
(`footer: roll the credits on scroll, settle on the links`) plus this docs
commit. `Footer.astro` (200 lines, at the cap) now holds a 250vh scroll
track → sticky 100dvh pin (`overflow: clip`) → the roll: a pin-height
title card, the two credit rows, then `FooterContact.astro` (new): a
pin-height contact card with "Get in touch" + the four links centred and
the © line 2rem above its bottom edge. The roll translates
`0 → calc(--pin-inner − 100%)` against a named view timeline on the track
(`contain 0% → contain 100%`); `src/scripts/credits-roll.ts` (new) is the
`CSS.supports` fallback (rAF, absolute scrollY, `--credits-progress`) and
the keyboard reveal. Still `<footer id="contact">`; nav anchor lands at
80px.

### Decisions worth knowing before you touch this

- **0% is a title card, not a blank screen.** Whatever is in the pin at
  progress 0 is what scrolls into view before the pin engages, so a roll
  that starts from empty would put 100vh of nothing after Projects. The
  title card is that frame instead.
- **The document ends at 100%.** The contact card is pin-height, so the
  track's end is the page's end and the © line is inside the last frame.
  There is no post-release flow content by design; if something is ever
  added after the footer the "release" becomes a real scroll again.
- **The rate is < 1 on purpose and tunable in one place.** Rate =
  (roll − pin-inner) / (`--pin-length` − 100dvh) = 0.773 px/px at
  1280×900 with `--pin-length: 250vh`. At 1:1 the pin is visually
  identical to plain flow; the slower roll is what the pin buys. Shorten
  the track to speed it up.
- **Reduced motion disables the roll (static block), unlike Experience.**
  Experience kept its pin because sticky is layout and a zone change is
  discrete. Here the pin exists only to move content slower than the
  scroll — a differential rate is parallax, WCAG 2.3.3's own example — so
  the mechanic goes. The static block is the same three frames at 1:1 and
  still ends on the contact card. Nav progress bar stays on under reduce
  because it is 1:1 state; this isn't.
- **Keyboard: `focusin` + `:focus-visible` → jump to the track end.** A
  link focused inside a stuck pin never scrolls into view on its own (the
  window scrolls, the pin absorbs it). The jump is instant because the
  browser's own focus-scroll runs *after* `focusin` and then clamps to
  the same document end. `:focus-visible` keeps mouse clicks on a
  half-visible link from being yanked (measured with a real CDP click).
- **`overflow: clip`, not `hidden`**, on the pin: hidden makes a scroll
  container that focus() would scroll internally, out from under the
  transform.
- **Hooks are `data-credits-track/pin/roll`**, not `data-track/pin`:
  Experience already uses `[data-pin]` and its ruler rows `[data-track]`,
  and the first harness run measured those instead (38px "track").
- **Links block centre = viewport centre; the links themselves sit 21px
  lower** because "Get in touch" shares the centred block. Left as is;
  say if the links row itself should be the centre.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — Contact row. **§5.8** — rewritten for the real mechanic.
  **§10** — new line 16. **README** — components (FooterContact), lib
  line, scripts (credits-roll.ts). **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`cdp.mjs` + `verify17.mjs` + `verify17b.mjs` in the session scratchpad
(headless Chrome over CDP, static server over `dist/`, `boot-seen`
pre-set; 1280×900 fine pointer and 375×812 touch-emulated; every scroll
`behavior: 'instant'` + two rAFs before reading):

- Build + `astro check`: 0 errors / 0 warnings / 0 hints. Landmarks: one
  `<h1>`, four `<h2>`, one `<footer>`; four anchors, `rel=noopener` ×3.
- **Rate table, CSS branch, 1280×900**: track 2250, pin 900, roll 1880,
  D 1350; `translateY` 0 → −1044 in ten equal steps of −104.4 →
  **−0.773 px/px every interval**, same values scrolling back up
  (reversible), pin top 0 throughout, ty 0 at track top − 300. **375×812**:
  roll 1672, D 1218, −0.759 px/px. **Fallback** (`CSS.supports` stubbed,
  `animation: none` injected, `data-fallback="on"`): the identical table.
- **Landing / end**: at max scroll the links are at 490–516 (block centre
  482 = 64 + 836/2), © bottom 868, pin bottom = track bottom = 900 =
  innerHeight, `scrollY` = `scrollHeight − innerHeight`, `scrollWidth ==
  clientWidth`, links on one row at both widths (375: 447–473).
- **Anchor**: nav "Contact" click from the top → footer top at 80px.
- **Keyboard**: Tab from Projects' last link → GitHub 497–511, in view,
  `:focus-visible`, scrollY = end; LinkedIn / Gmail / Résumé same;
  Shift+Tab out → Projects link in view after the smooth scroll settles
  (a 2-rAF sample mid-scroll read −1304, harness artefact); real CDP
  click on the Résumé link at 892px (6px visible): focused, not
  `:focus-visible`, scrollY unchanged.
- **Reduced motion**: pin static (1944px = 64 + 1880), track 1944,
  animation `none`, no fallback flag, footer top moves 500 for 500, page
  ends on the contact card with links at 490–516, Tab into GitHub revealed
  by the browser at 497–511.
- **No JS** (`Emulation.setScriptExecutionDisabled`, boxes via the DOM
  domain): pin `static` 1944px, animation `none`, transform `none`; after
  a synthesized scroll to the end the links are at 490–516 and the footer
  bottom at 900.
- **Screenshots**: `credits-0.png` (title card), `credits-50.png`
  (credit rows mid-roll), `credits-100.png`, `credits-100-phone.png`,
  `credits-50-phone.png`, `credits-focus.png` (ring on Résumé),
  `credits-reduced.png`, `credits-nojs-true.png`, `credits-fallback-100.png`.
- **Client JS**: 0 external scripts; 7 inline blocks, 3280 B gzipped
  concatenated (16: 6 blocks, 3077 B) → **+203 B**.

### Harness notes

- Scope every footer selector to `#contact`: `[data-pin]`, `.links` and
  `.credit`-ish names exist in Experience and the nav.
- `Runtime.evaluate` is refused while scripts are disabled; read no-JS
  layout with `DOM.getBoxModel` / `CSS.getComputedStyleForNode` and scroll
  with `Input.synthesizeScrollGesture`. Injecting `noscript.textContent`
  into a `<style>` does *not* emulate it (the text includes the
  `<style>` tags and the first rule is dropped).
- Synthetic `MouseEvent` + `focus()` still reads `:focus-visible` true;
  only `Input.dispatchMouseEvent` exercises the mouse path.
- Long heredocs still break this shell; the Write tool for scripts.

### Still open

- Owner to supply `public/resume.pdf` (link still 404s) and the five
  About panels.
- **Pre-existing, not this increment**: without JavaScript the nav never
  gets `.is-scrolled`, so it stays transparent and content shows through
  it (the credits' "Rishi" line in `credits-nojs-true.png`).
- Vercel alias: pointed at `rishi-ventrapragada-pmnzwm3jl` (the code +
  docs push, Git deploy, Ready in 21s) and verified on the vanity URL
  itself: curl shows `data-credits-track/pin/roll`, `data-contact`, the
  mailto and résumé hrefs; live CDP at 1280×900 reads the same table —
  track 2250, roll 1880, `translateY` 0 → −1044 at −0.773 px/px over four
  intervals, links 490–516 at `scrollY` = max, pin bottom 900; reduced
  motion static (pin 1944, animation `none`), same landing.
  `live-credits-0/50/100.png`. Re-pointed once more after this line landed.

## 2026-09-21 — increment 16

### Last milestone completed

Three independent pieces, one commit each, plus this docs commit:

- **A — Currently building strip removed** (PRD §5.4 `[removed]`).
  `CurrentlyBuilding.astro` deleted, its import and `<CurrentlyBuilding />`
  gone from `index.astro`, README list updated. No data file existed
  (`now.json` was only ever deferred). Spacing: the strip carried its own
  top rule and padding; Projects keeps its rule and the footer's rule now
  closes `<main>`, so nothing else assumed it.
- **B — About as a comic page** (PRD §5.6). `About.astro` (116 lines) +
  new `AboutPanel.astro` (94). Eyebrow "Origin story" + h2 in the shell;
  five panels full-bleed, 4×2 grid at 2:1 from 768px with panel 1 spanning
  the left half, single column of 4:3 panels below. Art = palette fills
  (`color-mix` 60% into `--bg-raised`, all five `--word-*` now used;
  comment in `global.css` updated), tags `[PANEL N — placeholder art]`,
  captions `[TODO: panel N dialogue]`. One `@keyframes grade` on the grid,
  15s loop, three 5s holds (colour → grayscale → warm duotone), no script.
  `prefers-reduced-motion: reduce` → `animation: none` → filter `none`.
- **C — Footer as a credits roll** (PRD §5.8). Still `<footer id="contact">`.
  Title "RISHI VENTRAPRAGADA", credits "Built with — Astro · Tailwind ·
  Vercel" and "Directed, developed & edited by — Rishi"; then GitHub,
  LinkedIn (`www.` form), Gmail (mailto) through the guard, the résumé link
  as built, "© 2026 Rishi". `isUrl` moved to `src/lib/is-url.ts` (new
  folder), shared with `ProjectLinks.astro`, and now accepts `mailto:`.

### Decisions worth knowing before you touch this

- **Reduced motion freezes the grade on full colour, not grayscale.**
  Judgment call, stated in the report: a recurring filter change is motion
  (CLAUDE.md §4), so the animation is removed outright; the rest value of
  an unanimated `filter` is `none`, which is the full-colour state.
- **The cycle is clock-based on purpose.** Owner decided earlier in the
  project that it must not be scroll-tied. It is a plain CSS animation, so
  it also starts at page load for everyone at once and costs no JS.
- **Placeholder fills are coloured, not `--bg-raised`.** A flat dark box
  reads identically in every grade state, so the mechanic would be
  invisible in screenshots. The five palette words already existed.
- **375px stacks to one column, establishing panel first** — my call,
  flagged in the report. A 2-column phone grid would make the caption
  boxes wider than the panels.
- **The old About copy is gone from the page**: the story paragraph and
  the GDG line no longer appear anywhere. The owner asked for the content
  to be replaced structurally; the GDG line comes back with Community
  (§5.7). Both are in git history (`git show 4907721^:src/components/About.astro`).
- **"Supabase" → "Vercel"** in the credits, approved at plan review.
  "© 2026 Rishi" with a live year and the shortened name, confirmed.
- **Résumé stays outside the guard.** `/resume.pdf` is root-relative, not
  a URL to `isUrl`, and the PDF is still pending. It is a plain `<a>` in
  the same list, labelled `Résumé [TODO]`, as before.
- **`mailto:` added to the guard.** Without it the Gmail link would have
  rendered as text. Harmless for project links, where a mailto never
  appears.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — About, Projects and Contact rows. **§5.4** — `[removed]`.
  **§5.6** — About rewritten. **§5.8** — rewritten, `[now]`. **§6** — the
  `now.json` sentence. **§10** — line 7 `[dropped]`, new line 15.
- **README** — component list (AboutPanel, no CurrentlyBuilding), `lib/`.
- **ASSETS.md** — "About page photo" entry replaced by "About comic
  panels". **global.css** — the coral comment. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`cdp.mjs` + `verify-about.mjs` + `verify-footer.mjs` in the session
scratchpad (headless Chrome over CDP with its own profile, a tiny static
server over `dist/`, `boot-seen` pre-set so the preloader is skipped;
1280×900 / 1280×1100 fine pointer and 375×812 touch-emulated):

- Build + `astro check`: 0 errors / 0 warnings / 0 hints after each part;
  `grep -rn CurrentlyBuilding src README.md` → 0 hits.
- **Headings**: one `<h1>`; `<h2>` = About, Tech stack, Experience,
  Projects. Landmarks: header, main, four labelled sections, footer —
  About is a section inside `<main>`, not a second landmark.
- **About grid**: 4 columns × 2 rows, 1280×640; panel 1 622×640, the
  four small panels 305×314; 1 column at 375 with five 351×263 panels; no
  caption overflows; `scrollWidth == clientWidth` at both widths.
- **Grade cycle, motion allowed**: nine samples 1.5s apart read
  identity → `grayscale(0.027…)` (a crossfade) → `grayscale(1)` ×3 →
  `sepia(1) saturate(1.3) hue-rotate(-15deg)` ×2. **Reduced motion
  forced**: `animation-name: none`, filter `none` on all five samples.
- **Screenshots**: `about-colour.png`, `about-grayscale.png`,
  `about-duotone.png` (pinned by an injected negative `animation-delay`
  + `paused`), `about-reduced-motion.png`, `about-phone.png` (+ `-2`),
  `footer-desktop.png`, `footer-phone.png`.
- **Footer**: `FOOTER#contact`, `position: static`, 808px tall at 1280,
  0 sticky/fixed descendants, 0 clipped scrollers; top moves 500px for a
  500px instant scroll (a first reading of 31px was smooth-scroll sampled
  too early, not a pin); bottom lands on the viewport bottom at the end
  of the document. Anchors: GitHub, LinkedIn, Gmail (all `rel=noopener`)
  and `Résumé [TODO]` → `/resume.pdf`. Guard unit-tested from node:
  http/https/mailto true; `[TODO]`, `/resume.pdf`, empty, undefined false.
  Links on one row at 375.
- **Client JS**: 0 external scripts, the same 6 inline blocks as
  increment 15.1; 3077 B gzipping the six blocks concatenated (15.1's
  3839 B summed per-block gzips, so the two figures are not comparable).
  The increment adds no script and removes none.

### Harness notes

- `scroll-behavior: smooth` is on unless reduced motion is forced. Any
  "did it move" measurement must force reduced motion or use
  `behavior: 'instant'`, or it samples mid-animation.
- Pin a grade state with
  `[data-about-page]{animation-delay:-Ns !important;animation-play-state:paused !important}`:
  −2s colour, −7s grayscale, −12s duotone.
- Long python/bash heredocs still break in this shell (`unexpected EOF`).
  Write the script to the scratchpad and run it.

### Still open

- Owner to supply five panel artworks and five captions (ASSETS.md).
- `public/resume.pdf` still missing; the footer link 404s.
- The GDG line has no home until Community (§5.7).
- Vercel alias: pointed at the docs deployment and verified on the vanity
  URL itself (curl: no "Currently building", `data-about-page`, credits,
  all four hrefs; live CDP: `animation-name: grade` with motion allowed,
  `none / none` with reduced motion forced; `live-about.png`,
  `live-footer.png`). Re-pointed once more after this line landed.

## 2026-09-21 — increment 15.1

### Last milestone completed

**Projects: bigger frames, panel below, no year tag** (PRD §5.3). Grid
minimum 20rem → 32rem (two 573px frames per row at 1280, was three at
374px); the year tag is gone and the caption row is title + frame number;
the detail panel no longer overlays the cover — it opens *below* the frame,
attached to its bottom edge, out of grid flow, over the next row; the frame
lift is 1.02 (was 1.04). Everything else from 15 unchanged: no client JS,
`:focus-within`, `display: none` panel + quick links on no-hover devices,
reduced motion, sprockets, numbering, `.planned`, no panel for Recurzn.

Files: `ProjectFrame.astro` (156), `ProjectDetail.astro` (90),
`ProjectLinks.astro` (85), `ProjectsSection.astro` (46). Four code commits:
tag + grid; panel below; padding wrapper; opacity-only reveal; scroll
cushion.

### Decisions worth knowing before you touch this

- **Opacity reveal, not height.** The first cut animated
  `grid-template-rows: 0fr → 1fr`. Measured: on the first Tab into a
  collapsed panel the browser scrolled the link into view while the panel
  was 0px tall, then the growth pushed the link below the fold
  (`linkInsideViewport: false`); the second Tab was fine because the panel
  was already open. The panel is now always laid out at full height,
  invisible at rest, so focus has a stable target.
- **`scroll-margin-block: 2rem` on the links.** Even with a stable panel,
  the browser scrolls the minimum and the frame's 1.02 lift then moves the
  panel bottom ~6px back below the fold. The cushion absorbs it; the first
  Tab now lands fully inside the viewport.
- **Panel padding on an inner `.pad`, not as child margins.** `Pills` and
  the links list set `margin: 0` with higher specificity, so margins on
  children would have been lost.
- **Frame number is in the caption row, right side** (where the tag was);
  the owner said they would look at this live.
- **Bottom of the viewport: accepted edge.** The panel extends the
  document (`scrollHeight` grows past it), never clipped; hovered at the
  fold it sits 146px below the edge until the user scrolls; keyboard focus
  scrolls the link in by itself (panel bottom then 410px above the fold).
  Flipping upward would need JS to know the frame's screen position.
- **Cover untouched**: the element at the cover's centre is the `<img>` at
  rest and expanded, opacity 1; its rect changes only by the 1.02 lift.
- **Harness gotcha**: sample sibling rects only after `img.decode()` on the
  lazy covers, or a cover finishing loading between samples reads as "the
  sibling moved".

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.3** — rewritten: grid minimum, caption without the tag, the
  panel-below mechanic, the opacity-vs-height note, the bottom-edge note.
  **§10** — line 14. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`verify15.mjs` (extended: panel geometry, cover centre, bottom edge, link
in viewport) and `third.mjs` (waits for covers, asserts the panel opens):

- Build + `astro check`: 0 errors / 0 warnings / 0 hints. Client JS
  unchanged (3839 B gzipped).
- **Grid**: 2 columns at 1280, 1 at 375; no `.tag` in the DOM; caption
  children `H3, P.number` on both frames.
- **Hover KalaCart**: `matrix(1.02,…)`, z-index 2, shadow; panel opacity 1,
  pointer-events auto, top on the frame's bottom edge, 183px tall; cover
  centre is the `<img>`; **Recurzn's rect identical**. Hover Recurzn: no
  transform, no panel. Mouse off: panel opacity 0, pointer-events none.
- **Third frame** (throwaway, then removed, tree clean): row 1 KalaCart +
  Recurzn, row 2 Throwaway at 1280; hovering row 1 opens its panel over
  row 2 (`elementFromPoint` at row 2's top-left is KalaCart's panel) and
  **both siblings' rects identical**; stacked at 375.
- **Keyboard**: Tab → "Live site" (panel open, frame 1.02, link inside the
  viewport, `:focus-visible`), Tab → "GitHub", Tab → footer Email. Enter
  fires the click with `https://kalacart-website.vercel.app/`.
- **Bottom edge**: see above.
- **Reduced motion**: frame and panel `0s`; transform 1.02 and panel
  opacity 1 in the same tick.
- **375 touch**: panel `display: none`; quick links only; cover 301px in
  a 375 viewport; tab stops are the two quick links; no horizontal
  overflow.
- Console clean. Screenshots reviewed: 1280 rest, hover-expanded,
  bottom-edge hover and focus, keyboard-focus-expanded, reduced-motion
  hover, 375 rest, three-frame grid and three-frame hover.
- **Deployed and aliased.** Git integration built
  `rishi-ventrapragada-h9xg0xblr-rishiventra.vercel.app` (Ready);
  `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it, and the
  vanity HTML is byte-identical (sha1) to the deployment, to the
  `portfolio-gamma-lake` production domain and to the local `dist` (no
  `.tag`, one `.pad` panel). `verify15.mjs` re-run against the vanity URL:
  every number above identical — two columns, cover centre is the `<img>`
  while expanded, panel on the bottom edge at 183px, sibling rect unchanged,
  first Tab lands inside the viewport, bottom-edge focus scrolls the link
  in, reduced motion instant, 375 touch quick links only, console clean.
  The third-frame test cannot run live (it needs the throwaway entry in
  the build); its local result stands.

### Known, open

- `ExperienceTrack.astro` is at the 200-line cap.
- 320px nav collision (standing constraint above).
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain.

## 2026-09-21 — increment 15

### Last milestone completed

**Projects is a film-strip contact sheet** (PRD §5.3): one `ProjectFrame`
per collection entry in an `auto-fill` grid, each with sprocket strips, a
frame number, the cover, the title and a year tag; on fine-pointer devices a
frame with real detail expands in place on hover or keyboard focus (scale
1.04, shadow, summary + `Pills` stack + links over the cover); on no-hover
devices nothing expands and small "Live site ↗ / GitHub ↗" affordances sit
under the caption. Zero client JavaScript. The projects collection, its
schema and both entries are unchanged. Owner's change at approval: the tag
shows **only the year**; `status` stays unprinted and `.planned` on the
article is the planned frame's only signal.

Files: new `ProjectFrame.astro` (162), `ProjectDetail.astro` (73),
`ProjectLinks.astro` (81); `ProjectsSection.astro` rewritten (45);
`ProjectCard.astro` **deleted** (only `ProjectsSection` imported it; the
comment in `content.config.ts` now names `ProjectLinks`).

### Decisions worth knowing before you touch this

- **Keyboard expand is `:focus-within`, not a focusable article.** The
  panel's links are in the tab order while the panel is at `opacity: 0`;
  focusing one reveals it in the same tick. No `tabindex` on the frame, so
  there is no non-interactive tab stop. A frame with no links (planned) is
  not reachable, and has nothing to reach.
- **The panel is `display: none` on no-hover devices, not conditionally
  rendered.** The server cannot know the pointer; `display: none` under
  `@media not all and (hover: hover) and (pointer: fine)` removes the
  panel from the accessibility tree and the tab order (measured with touch
  emulation at 375: the section's tab stops are only the two quick links).
  The quick row is hidden the same way on fine pointers.
- **Planned frame: static.** No `.detail` is rendered (`data-expandable`
  absent), so no hover transform either. Nothing fabricated.
- **One tag tone for every frame** (`--word-amber`). Colour-coding the tag
  by status was in the plan; the owner struck status from the tag, and a
  status-coloured tag would have been a status signal by another name.
- **Sprockets: `background-repeat: space`.** Whole 16px tiles only, the
  remainder spread between them, so the last hole is never clipped at the
  frame's edge at any width (2× corner close-ups at 1280 and 375).
- **`auto-fill`, not `auto-fit`.** Two frames occupy two of three slots at
  1280; a third entry drops into the empty one. Verified with a throwaway
  `zzz-test.json` (+ a copied cover): three on one row at 1280, stacked at
  375, no overflow; then deleted and rebuilt, `git status` clean.
- **The `.detail` reveal rule lives in `ProjectDetail.astro`** as
  `:global([data-expandable]:hover) .detail` (and `:focus-within`): the
  child cannot see the parent's scoped class, and the attribute is set by
  the frame only when a panel exists.
- **Harness gotcha:** `Emulation.setEmulatedMedia` ignores `hover` /
  `pointer`; `Emulation.setTouchEmulationEnabled` (maxTouchPoints ≥ 1) with
  a `mobile: true` viewport is what flips those queries in headless Chrome.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.3** — rewritten in full for the contact sheet. **§5.11** — the
  "ProjectCard still uses its own data-status rule" note is gone (the
  frame uses `.planned`). **§6** — "dims the card" → "dims and dashes the
  frame". **§10** — line 13.
- **README** — component list. **`content.config.ts`** — two comments.
  **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`verify15.mjs` in the session scratchpad (headless Chrome over CDP, 1280×900
fine pointer and 375×667 touch-emulated), `third.mjs` for the grid test:

- Build + `astro check`: 0 errors / 0 warnings / 0 hints; `grep
  ProjectCard src` → 0 hits; no `.card` in the DOM.
- **Client JS unchanged: 3839 B gzipped, six inline blocks** — the section
  adds none.
- **Grid**: 3 columns at 1280, 1 at 375; Experience precedes Projects.
- **Rest**: KalaCart `transform none`, panel opacity 0 / pointer-events
  none, links "Live site", "GitHub"; Recurzn `.planned` → opacity 0.5,
  dashed border, no panel; sprockets `space no-repeat / 14px` on both.
- **Hover KalaCart** (real two-step `mouseMoved`): `matrix(1.04,…)`,
  z-index 2, shadow on, panel opacity 1 / pointer-events auto; **Recurzn's
  rect identical** before, during and after. Hover Recurzn: no transform,
  no shadow. Mouse off: KalaCart back to `none`, panel 0.
- **Keyboard**: from the Recurzn clip, Tab → "Live site" (in the panel,
  frame at 1.04, panel opacity 1, `:focus-visible`), Tab → "GitHub", Tab →
  footer Email (out of the section). Enter on "Live site" fires a click
  with `https://kalacart-website.vercel.app/`.
- **Reduced motion**: frame and panel `transition-duration 0s`; transform
  already `1.04` and panel opacity `1` immediately after the hover moves.
- **375 touch**: `(hover: hover) and (pointer: fine)` false; panel
  `display: none`; quick links "Live site ↗", "GitHub ↗" visible on
  KalaCart, none on Recurzn; no pills visible; tab order from the last
  clip: the two quick links, then the footer; `scrollWidth ===
  clientWidth`.
- **Third project**: see above.
- Console clean. Screenshots reviewed: 1280 rest, hover-expanded KalaCart,
  hover on Recurzn (static), keyboard-focus-expanded, reduced-motion hover,
  375 rest, sprocket corners at both widths, three-frame grid at both.
- **Deployed and aliased.** Git integration built
  `rishi-ventrapragada-3z65cnhz9-rishiventra.vercel.app` (Ready);
  `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it, and the
  vanity HTML is byte-identical (sha1) to the deployment, to the
  `portfolio-gamma-lake` production domain and to the local `dist` (two
  frames, no `.card` markup). `verify15.mjs` and `verify14.mjs` re-run
  against the vanity URL: every number above identical — hover scale 1.04
  with the sibling rect unchanged, Tab into the panel expands it, Enter
  fires the right href, reduced motion instant, 375 touch shows only the
  quick links, Experience still releases into `#projects`, console clean.

### Known, open

- `ExperienceTrack.astro` is at the 200-line cap.
- 320px nav collision (standing constraint above).
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain.

## 2026-09-21 — increment 14.1

### Last milestone completed

**Experience: layout, hierarchy, polish** (PRD §5.11), three commits in
order. *Layout:* the "Journey / Experience" heading is normal flow ahead of
the scroll track; the sticky pin holds only the monitor and the timeline;
the timeline is a 90px strip (ruler 22, V1 39 with 34px clips, A1 29) and
the monitor takes the rest — 744px at 1280×900 (was 539), 496px at 375×667
(was 309). *Hierarchy:* the monitor no longer repeats the clip keyword as an
`<h3>`; the verbatim sentence is the dominant text (display 700, heading
size, ≤ 24ch) under a small year label. *Polish:* the A1 row is a seeded
bar waveform (40 rects per clip), its label is `A1 audio` (uppercased by
`.meta`, matching `V1 video`), and the clips are a flat tone fill with a
2px darker bottom edge — no stripes.

Files: `ExperienceTimeline.astro` (154 lines), `ExperienceFrame.astro`
(151), `ExperienceTrack.astro` (**200 — at the CLAUDE.md §5 cap**; the next
addition must split the A1 row or the ruler out), `ExperienceClip.astro`
(103), `experience-timeline.ts` (one line: the scrub measures
`[data-scrub]`), `experience-scrub.ts` (comment only).

### Premise correction, recorded

The brief for the A1 row asked to reuse "the top nav's scroll-progress
waveform (many thin vertical bars)". **The nav has no such thing**: its
progress indicator is one 2px hairline whose fill is `scaleX(--scroll-
progress)` (`Nav.astro`, `.progress` / `.fill`), and nothing in `src/` drew
vertical bars. The bars were built new, as the brief described them, in
`ExperienceTrack.astro`'s frontmatter. Flagged in the plan before building.

### Decisions worth knowing before you touch this

- **Texture: flat fill + darker edge won.** Both were screenshotted at 2×
  on the built page (`shots141/texture-*.png` in the session scratchpad):
  a faint stripe (opacity 0.05, 6px period) still read as a pattern laid
  over the block; the flat fill with `inset 0 -2px 0 color-mix(tone 65%,
  timeline-bg)` reads like an NLE clip. The pressed ring is layered over
  the edge in the same `box-shadow`. "Accent-coloured bottom border" in the
  brief was read as *a darker accent of the clip's own tone*, not
  `--accent`: the site's accent already means "active" here (pressed ring,
  playhead).
- **Clip label is one line** (year · keyword, 10px / 12px). Two stacked
  lines do not fit 34px. At 375 the four labels leave 42 / 62 / 55 / 64px
  spare in their 150px columns — no wrap (`white-space: nowrap`), no
  ellipsis reached. `.keyword` has `text-overflow: ellipsis` as the guard
  for any longer future keyword.
- **Track headers are one line too** (`V1 video`): a two-line header made
  the A1 row 36px because the header, not the 24px cell, set the row
  height. Same for the ruler: font-size and line-height sit on `.tick`
  itself, or the parent's 16px line box makes the row 34px.
- **Year label + sentence starting with the year** ("2025" above "2025 —
  Learnt…") is now visibly redundant in the monitor. Both are as specified
  (year label stays, sentence verbatim); dropping the label or the sentence
  prefix is the owner's call, not mine.
- **Anchor landing**: section top at 80px, heading 81–260, monitor top at
  292; the pin engages when the track's top reaches 0, about 210px of
  scrolling later. Progress is 0 until then, so the first clip is already
  committed.
- **`--pin-length` moved from the section to the track** (`.scrub`) and is
  still 250vh: the pin travels the same 150vh, zones are the same 37.5vh;
  the heading simply adds its own scroll before the track. The no-JS
  `<noscript>` block targets `[data-scrub]` now.
- **`keyword` stays in `ExperienceFrame`'s Props** (optional, unused) so the
  moment can still be spread into it.

### Doc edits this session (CLAUDE.md §7)

- **PRD §5.11** — rewritten in full: heading outside the pin, pin contents,
  anchor landing, monitor hierarchy and heights, row dimensions, waveform
  and its premise note, texture decision. **§10** — line 12.
- **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

`verify14.mjs` (re-pointed at `[data-scrub]`, plus layout, anchor and
375-label checks), `verify.mjs` (13.1 suite) and `polish.mjs` in the
session scratchpad, headless Chrome over CDP at 1280×900 and 375×667:

- Build + `astro check`: 0 errors / 0 warnings / 0 hints.
- **Pin children**: `monitor`, `track-slot` — nothing else.
- **Heading**: bottom at 260 on anchor landing (visible), −437 while pinned
  at 30 %, −1450 after release (above the viewport throughout the pin).
- **Rows**: 22 / 39 / 29, timeline 90; clip 34; at 375 identical.
- **Monitor**: 744.1 at 1280, 496.1 at 375, one value across all four
  states; every frame's content inside the box at 375.
- **Scrub**: track height 2.5 × innerHeight; forward `web, python,
  kalacart, recurzn`, backward the reverse; edges `web → python` at 25 %,
  `python → kalacart` at 50 %, `kalacart → recurzn` at 75 % (±1px); pin
  `top` 0 while pinned; playhead 0px off at every step; `scrollWidth ===
  clientWidth`.
- **Release**: 0.6 viewport past the track, pin top −68 / −51, element at
  the viewport bottom `#projects`.
- **Wheel** → python; **click Recurzn in zone 0** → committed at once,
  held through a same-zone scroll, python at zone 1; **hover at 60 %**
  previews python and reverts to kalacart; **keyboard** at 5 / 40 / 95 %
  focus / Enter / Space all commit.
- **Reduced motion**: pin sticky, scroll commit lands, frame and playhead
  `0s`. **No-JS**: pin static, track = content height (696), monitor 540,
  heading in flow above the track, first clip pressed.
- **13.1 suite**: playhead 0px off in all eight states, ticks 0px off, A1 0
  focusables, Tab order, Enter / Space, scroll-hover guard, both accents,
  image loads, console clean.
- **Screenshots reviewed**: before (increment 14) vs after at 1280 and 375;
  2× close-ups of the timeline strip at both widths, of the two textures
  side by side, of the A1 bars and the nav hairline.
- **Deployed and aliased.** Git integration built
  `rishi-ventrapragada-muhmg704q-rishiventra.vercel.app` (Ready, 17s);
  `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it, and the
  vanity HTML is byte-identical (sha1) to the deployment, to the
  `portfolio-gamma-lake` production domain and to the local `dist`. Both
  harnesses and the no-JS check re-run against the vanity URL: every number
  above identical — pin children, rows 22 / 39 / 29, monitor 744 / 496,
  anchor landing at 80px with the pin not engaged, 375 labels one line with
  ≥ 42px spare, scrub sequences and edges, release into `#projects`, wheel,
  click-while-pinned, hover revert, keyboard, reduced motion `0s`, no-JS
  un-pinned with the heading in flow (monitor 540 / 400), 13.1 suite green,
  console clean. Note for the next session: `vercel ls` prints its table on
  stderr — a poll that silences stderr sees nothing.

### Known, open

- `ExperienceTrack.astro` is at the 200-line cap.
- 320px nav collision (standing constraint above).
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain.

## 2026-09-21 — increment 14

### Last milestone completed

**Experience is scroll-scrubbed and sits before Projects.** The section
(PRD §5.11) is now a 250vh scroll track with a sticky 100dvh pin holding the
heading, monitor and timeline; progress through the track picks the clip in
four equal zones, through the same `commit()` that click and keyboard use.
Click, Tab / Enter / Space and the mousemove-gated hover preview are
unchanged and verified at every scroll position. Owner's required addition
at plan approval: **Projects now comes after Experience** — `index.astro`
order is Hero → About → Skills → Experience → Projects (+ the "currently
building" strip, which belongs to Projects per PRD §3) → footer/Contact, and
the nav links follow the same order (Skills, Experience, Projects, Contact).

Files: `ExperienceTimeline.astro` (pin wrapper, `<noscript>` un-pin, flex
monitor, 149 lines), `ExperienceFrame.astro` (cqh cover cap, 158), new
`experience-scrub.ts` (50), `experience-timeline.ts` (96; wires the scrub),
`index.astro`, `Nav.astro` (link order only).

### Decisions worth knowing before you touch this

- **`--pin-length: 250vh`** on `.experience` is the one tunable. The pin
  travels `250vh − 100dvh`; each clip zone is a quarter of that (37.5vh at
  1280×900 = 337px of scrolling per clip). Zone edges measured at exactly
  25 / 50 / 75 %.
- **One commit path.** `experience-scrub.ts` never touches the DOM; it
  calls the `commit` closure from `experience-timeline.ts` only when the
  zone *changes*. So a click or key press wins immediately and holds until
  the next zone edge, and `mouseleave` reverts to whatever scroll (or click)
  last committed — never to clip 1.
- **Stateless progress.** `(scrollY − sectionTop) / (height − innerHeight)`
  from absolute values each rAF; scrolling back reverses exactly. Passive
  listeners only schedule the frame (hero-dissolve.ts pattern); an
  `IntersectionObserver` attaches them only while the section is on screen.
- **Reduced motion keeps the pin.** Sticky is layout, zone changes are
  discrete; the swap and playhead are already `0s` under reduce (measured
  after a scroll commit). Alternative considered and rejected: un-pinning
  under reduce would drop the primary interaction without removing motion.
  If a user reports the frozen-page feel as disorienting, the alternative is
  a two-line change in `experience-scrub.ts` plus a media query on `.pin`.
- **Monitor height is no longer 60vh.** Inside the pin the monitor is
  `flex: 1` between heading and timeline: 539px at 1280×900, 309px at
  375×667, constant across states. It is a `container-type: size` box so
  the KalaCart cover is capped in `cqh` (36 stacked, 70 side-by-side) — a
  `vh` cap overflowed the 309px phone monitor.
- **No-JS un-pins via `<noscript><style>`** inside the section, so the
  pinned CSS is the default and nothing shifts at hydration. The noscript
  block also restores `60vh / min 340px` on the monitor, because a size
  container has zero intrinsic height once nothing stretches it (found by
  measurement: the section was 362px tall without it).
- **`.head` needs `width: 100%`.** A `.shell` block as a bare flex item
  shrink-wraps and its auto margins centre it; the heading rendered centred
  until this was added.
- **Anchor lands on the pin start** (`scroll-margin-top: 0` beats the global
  `[id]` rule by specificity); the pin's own `padding-top: var(--nav-height)`
  keeps the heading out from under the bar.
- **`100dvh` on the pin, like the hero.** On mobile browsers the dynamic
  toolbar changes dvh while scrolling, so the pinned content can resize by
  the toolbar height mid-scrub. `svh` would be stable but leave a gap when
  the bar hides. Kept dvh for consistency with the hero; revisit if it
  looks jumpy on a real phone.
- **Harness gotchas** (both scripts in the session scratchpad): `focus()` on
  an already-focused button fires no event — blur first; sample playhead
  positions ≥ 260ms after a scroll so the 200ms glide has finished; the
  13.1 scroll-hover regression must park the cursor at a zone-0 scroll
  position now, or the scroll itself legitimately commits zone 1. And a
  `scrollTo` followed by a `click()` in the *same frame* lets the scrub's
  first rAF commit (zone 0) land after the click — a 16ms window no hand
  can hit, but the harness did once on the live run; settle 300ms first.

### Doc edits this session (CLAUDE.md §7)

- **PRD §3** — site map rows reordered (Experience before Projects).
  **§5.11** — rewritten: scroll scrub, click and keyboard as three equal
  ways into one commit path; monitor height rule; reduced-motion decision;
  no-JS un-pin. **§10** — line 11 for increment 14.
- **README** — script list. **SESSION.md** — this entry and the nav-order
  words in the nav-capacity standing constraint.

### Verified by measurement, not eyeballing

Headless Chrome over CDP (`verify14.mjs` for the new behaviour, `verify.mjs`
re-run for everything from 13.1) at 1280×900 and 375×667:

- Build + `astro check`: 0 errors / 0 warnings / 0 hints. Longest
  Experience file 182.
- **Client JS: 3829 B gzipped, six inline blocks, no external script**
  (cap 40 KB; 13.1 was 3585 B).
- **Order**: `hero > about > skills > experience > projects > now >
  contact`; nav `#top #skills #experience #projects #contact`.
- **Scrub**: section height exactly 2.5 × innerHeight (2250 / 1668);
  stepping the track at 5 % forward gives `web, python, kalacart, recurzn`,
  backward the reverse, both widths; zone edges `web → python` at 25 %,
  `python → kalacart` at 50 %, `kalacart → recurzn` at 75 % (±1px); pin
  `top` 0 while pinned; monitor height one value per width (539 / 308.6);
  playhead 0px off the pressed clip at every step; `scrollWidth ===
  clientWidth`.
- **Release**: 0.6 viewport past the track the pin's `top` is −67 (1280) /
  −51 (375) and the element at the viewport bottom is `#projects`.
- **Wheel**: one `mouseWheel` of 30 % of the track from the pin start →
  python, pin top 0.
- **Click while pinned**: real mouse click on Recurzn in zone 0 → pressed +
  frame + playhead on Recurzn at once; scrolling to 20 % (same zone) keeps
  it; 30 % (zone 1) → python.
- **Hover on a scroll commit**: at 60 % (kalacart) a real two-step move
  onto Python previews it (pressed stays kalacart); moving off the track →
  kalacart / kalacart.
- **Keyboard** at 5 / 40 / 95 %: focus commits python; with the state made
  stale by hand Enter recommits, Space recommits; python stays focused.
- **Reduced motion**: pin `sticky`, scroll commit lands (kalacart), frame
  and playhead `transition-duration 0s`, new frame opacity 1 at once.
- **No-JS**: pin `static`, section = content height (not 2.5 × viewport),
  monitor 540 / 400 (60vh rule restored), first clip pressed and visible,
  the next section is `#projects`, no horizontal overflow.
- **13.1 suite re-run**: playhead 0px off in all eight states; ticks 0px
  off; monitor constant; A1 0 focusables; Tab order web → python → kalacart
  → recurzn → the next section's first link; Enter / Space; scroll-hover
  (`mouseenter` ×1, no change; real move previews; leave reverts); reduced
  motion 0s; both accents; image loads; every frame inside the monitor at
  375 (KalaCart 16px from the top, 37px from the bottom); console clean.
- Screenshots reviewed: 1280 in all four zones and after release (Projects
  entering under the timeline), 375 zone 1, 375 KalaCart.
- **Deployed and aliased.** Git integration built
  `rishi-ventrapragada-fuegmzj6k-rishiventra.vercel.app` (Ready);
  `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it, and the
  vanity HTML is byte-identical (sha1) to the deployment, to the
  `portfolio-gamma-lake` production domain and to the local `dist`. Both
  harnesses and the no-JS check re-run against the vanity URL: every number
  above identical — scrub sequences and zone edges at both widths, release
  into `#projects`, wheel, click-while-pinned, hover revert, keyboard at
  5 / 40 / 95 %, reduced motion `0s`, no-JS un-pinned (monitor 540 / 400),
  13.1 suite all green, console clean.

### Known, open

- 320px nav collision (standing constraint above).
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain.

## 2026-09-21 — increment 13.1

### Last milestone completed

**Visual-only correction to increment 13.** The Experience section (PRD
§5.11) now looks like an editing timeline instead of a content card: a
full-bleed black monitor (60vh, min 340px) over a near-black timeline with a
ruler, a V1 track of solid colour-coded clip buttons, a decorative A1 track
of waveform squiggles, sticky track headers and a measured, animated
playhead. **Content and accessibility are unchanged**: the same four
moments, the same verbatim sentences, the same KalaCart cover through
`<Image>`, real buttons with `aria-pressed` / `aria-describedby`, Tab /
Enter / Space, no-JS first frame, reduced motion. Owner's one change at
plan approval: the monitor and timeline run viewport edge to edge (the
heading stays at shell width).

Files: `ExperienceTimeline.astro` (section, data, monitor box — 101 lines),
`ExperienceFrame.astro` (one frame, 140), new `ExperienceTrack.astro`
(ruler, rows, playhead, 182) and `ExperienceClip.astro` (one clip, 98 —
split out when the track file hit 267), `experience-timeline.ts` (86) and
new `experience-playhead.ts` (35). Tokens: `--monitor-bg: #000000` and
`--timeline-bg: #0b0c0e` added in `global.css`; the clips consume the
previously unused `--word-amber / sky / mint / periwinkle`.

### Decisions worth knowing before you touch this

- **`--monitor-bg` is the site's one pure-black surface.** CLAUDE.md §3
  says "never pure black"; the owner asked for `#000` on the monitor
  explicitly (increment 13.1 brief) so it reads as a screen. It is a token
  so no component hardcodes the hex, and PRD §4.2 says nothing else may use
  it. That rule in CLAUDE.md was *not* edited — this is a recorded
  exception, not a new standing rule.
- **The playhead follows the hover preview**, not only the committed clip:
  a playhead sits wherever the monitor is. It snaps back on `mouseleave`.
- **No `mouseenter` anywhere.** Scrolling the page under a stationary
  cursor fires `mouseenter` on whatever lands under it (Chrome fired
  exactly one in the regression run), which looked like the clips cycling
  by themselves. Preview now needs a `mousemove` whose coordinates differ
  from the last one *and* land inside the clip's rect. Keep it that way.
- **Playhead x is measured, never index math.** `getBoundingClientRect()`
  of the active clip minus the rows' rect, applied as `translateX`, with a
  `ResizeObserver` on the rows and the V1 lane. Its CSS default
  (`--head-w + 3px`) equals the measured first-clip position, so the no-JS
  page matches: 0px off at both widths.
- **Alignment is structural.** Every row is `header (90px sticky) | lane`,
  every lane the same `repeat(4, minmax(150px, 1fr))` grid. If you change
  one lane's columns or padding, change all three or the ticks drift.
- **Fixed-height monitor**: the frames are still stacked in one grid cell
  (that is the cross-fade mechanism), but the height no longer depends on
  them. The KalaCart cover is capped at `30vh` tall so it cannot overflow
  the 340px minimum; measured fit at 1280×900 and 375×667.
- **Accessible name changed shape, not content**: the clip's name is now
  "2025 JavaScript" (two spans) instead of "2025 · JavaScript"; the
  description is still the sentence.
- **Screenshot harness artefact**: `captureBeyondViewport` with a clip
  paints the fixed nav as a ghost band inside section captures. A plain
  viewport capture shows no band. Not a page bug.
- At 1280×900 the section is taller than the viewport (heading + 60vh +
  timeline ≈ 930px), so the timeline sits just under the fold when the
  anchor lands the section top at 80px. Expected with 60vh; owner's call if
  it should be shorter.

### Doc edits this session (CLAUDE.md §7)

- **PRD §4.2** — `--monitor-bg`, `--timeline-bg`, and the small palette
  listed as used by §5.11. **§5.11** — rewritten in full for the new
  structure (content table unchanged). **§10** — line 10 for 13.1.
- **README** — component and script lists. **global.css** — the palette
  comment no longer says UNUSED. **SESSION.md** — this entry.

### Verified by measurement, not eyeballing

Headless Chrome over CDP (`verify.mjs` + `cdp.mjs` in the session
scratchpad; preloader skipped via `sessionStorage`, scroll-behavior forced
to auto) at 1280×900 and 375×667:

- Build + `astro check`: 0 errors / 0 warnings / 0 hints. Longest
  Experience file 182.
- **Client JS: 3585 B gzipped, six inline blocks, no external script**
  (cap 40 KB; increment 13 was 3272 B).
- **Playhead**: left edge exactly on the active clip's left edge (delta
  0.00) in all four states at 1280 (92 / 385.25 / 678.5 / 971.75) and at
  375 (92 / 244 / 396 / 548). Transition `0.2s`; `0s` under reduced motion.
- **Ruler**: each tick's left edge 0px off its clip's, both widths.
- **Monitor**: height 540 at 1280 and 400.19 at 375 in every state; `left`
  0 and width = `clientWidth` (1265 / 360 with headless scrollbars);
  `scrollWidth` = `clientWidth` (no page overflow); every frame's content
  inside the box.
- **A1 row**: 0 focusable elements. **Tab order** from the last project
  link: web → python → kalacart → recurzn → footer Email → GitHub; each
  focus commits and `:focus-visible` matches; nothing inside the A1 row.
- **Enter / Space** on a stale state recommit (`aria-pressed` true, frame
  active).
- **Scroll-hover regression**: cursor parked over where the KalaCart clip
  would land, page scrolled under it → `mouseenter` fired once,
  `mousemove` zero times, state stayed web / web. A real 3px move →
  kalacart previewed, web still pressed, playhead on kalacart. Move off →
  web / web.
- **Reduced motion**: frame and playhead `transition-duration 0s`; after a
  click the new frame is at opacity 1 and the old at 0 / hidden at once.
- **No-JS**: first frame visible, first clip pressed, playhead 0px off the
  first clip; KalaCart `<img>` has `width` / `height` (1272 × 700),
  `loading="lazy"`, alt; every image has `alt`; one `<h1>`.
- **Image** loads: 636w WebP, natural 560 × 308, rendered 491 × 270.
- **Accents**: playhead and pressed ring `#ff3b5c` under crimson,
  `#a78bfa` under violet; planned clip `opacity 0.5`, `dashed` in both.
- Console clean on every run. Screenshots reviewed: desktop × four states
  (playhead in each position), keyboard-focus, violet, reduced motion, 375
  web and KalaCart.
- **Deployed and aliased.** Git integration built
  `rishi-ventrapragada-1yx5nzc7f-rishiventra.vercel.app` (Ready, 21s);
  `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it, and the
  vanity HTML is byte-identical (sha1) to the deployment, to the
  `portfolio-gamma-lake` production domain and to the local `dist`. The
  same harness run against the vanity URL: every number above identical —
  playhead delta 0 in all eight states, ticks 0px off, monitor 540 /
  400.19, A1 0 focusables, Tab order, Enter / Space, scroll-hover
  (`mouseenter` ×1, no change; real move previews; leave reverts), reduced
  motion `0s`, no-JS first frame, both accents, console clean.

### Known, open

- 320px nav collision (standing constraint above).
- `public/resume.pdf` still missing; About photo still a CSS placeholder.
- Final accent, custom domain (PRD §11). Vanity URL as a project domain.

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
- **Deployed and aliased.** Git integration built
  `rishi-ventrapragada-c8kj0q6ls-rishiventra.vercel.app` (Ready 27s after the
  push); `vercel alias set` moved `rishi-ventrapragada.vercel.app` to it and
  the vanity HTML is byte-identical to the deployment and to the
  `portfolio-gamma-lake` production domain. The same harness run against the
  vanity URL: Tab / Enter / Space / hover / reduced-motion / anchor / image /
  both accents all as above; fade 0.08 → 0.76 → 1 at 8 / 76 / 387ms; nav
  spare 29.6 / 14.6 / −25.4 at 375 / 360 / 320; console clean.

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
