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

**Why this is manual:** the project has no Git integration moving the alias, so
it stays pinned to whichever deployment was last set by hand. A green build and
a live deployment URL do **not** mean the vanity URL moved. This has gone stale
twice (increments 1.6 and again through 1.9→5).

The local Vercel CLI is authenticated as `rishi-ventrapragada` and this works.
(The Vercel **MCP connector** is a different account — `orca-frontend`,
`aws-sbg-vjit`, `krishisathi` — and cannot see this project. Don't use it here.)

A custom domain added in the dashboard tracks production automatically and would
retire this whole entry.

### The nav is full at five links — a sixth needs a new approach

The nav lists **only routes that exist**: Home, Work (`/#projects-heading`),
KalaCart, About, Contact (`/#contact`). Community is absent because that page
does not exist yet (PRD §5.7).

**When Community ships, add it to the `links` array in `Nav.astro`.** Nothing
else references that array, so a new page will not appear in the nav on its own
and the omission is silent — no build error, no warning.

**But it will not simply fit.** Measured at 375px: 312px available inside the
gutters, and the five current links already take 306px at the `1rem` mobile gap.
A sixth link overflows. Shrinking the gap further is not the answer — it is
already tight. A sixth entry needs a real decision: drop or merge something,
truncate, or reintroduce a toggle for small screens.

The same applies to further case studies: the nav links to KalaCart by name, so
a second project needs a decision about whether the bar keeps listing projects
individually or collapses to a single "Work".

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
