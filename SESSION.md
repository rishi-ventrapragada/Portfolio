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
`*.vercel.app` one, which *does* auto-follow production. The vanity URL is a bare alias pointing at one specific deployment
id, so nothing moves it but a hand-run `vercel alias set`. A green build and a
live deployment URL still do **not** mean the vanity URL moved. This has gone
stale twice (increments 1.6 and again through 1.9→5).

**Better fix available:** add `rishi-ventrapragada.vercel.app` to the project as
a domain in the dashboard. It would then auto-follow production like the
auto-assigned one does, and retire this whole entry. Owner's call.

The local Vercel CLI is authenticated as `rishi-ventrapragada` and this works.
(The Vercel **MCP connector** is signed in to a different
account and cannot see this project. Don't use it here.)

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

### `--bg` (`#0b0b0d`) is duplicated outside the token — change every copy together

`--bg` is defined once in `src/styles/global.css`, but its literal also appears
**four times** in `src/layouts/BaseLayout.astro`:

- three in the inline critical-paint `<style>` (`:root`, `html, body`, `.boot`)
- one in `<meta name="theme-color">`, which predates the critical-paint fix

`grep -rn '#0b0b0d' src/` lists them all, with the token itself. (Until
increment 32 this entry said `#111214`, the value before increment 30, so the
grep it gave found none of them.)

The duplicate is deliberate and load-bearing. `global.css` is bundled into an
external stylesheet, so it is not parsed in time for the first paint; without
the inline literal the page paints white on every hard reload before the dark
theme lands (see increment 2.1). It cannot reference `var(--bg)`, because the
token is defined in the file that has not loaded yet.

This bends CLAUDE.md §3 ("components never hardcode a hex"). It is the one
sanctioned exception. If the background token changes, **all** must change, or
the flash returns in the new colour. `global.css` carries a pointer comment
next to `--bg`, but a comment is easy to miss in a bulk token edit — hence this
entry.

`#111214` itself survives on purpose in two places that are not the page
ground: `--on-accent` (ink on a solid accent fill, §4.2) and the favicon's
ground in `public/favicon.svg` and its PNGs (the owner kept its colours when
the R became a path, increment 32). Neither follows `--bg`.

### About is a TEMPORARY content swap (increment 29) — not a design decision

The live About section shows the owner's approved bio as plain text. The
comic page it replaced is **kept intact and dormant**: `AboutComic.astro`
(grid, colour grade, reveal), `AboutPanel.astro` and
`scripts/about-reveal.ts` are untouched and simply not imported. It came
off the page only because its art and dialogue are still `[TODO]`
placeholders, which CLAUDE.md §7 means for the owner, not for visitors.
**When real panel art and captions exist**, render `<AboutComic />` in
`About.astro` in place of the `.bio` block — one import and one line.
Don't delete the dormant files as dead code.

## 2026-09-25 — increment 34 (Contact skin)

### Last milestone completed

`contact:` one commit — owner picked **option B** (starfield) of two
screenshotted backdrops (the other: plain `--bg`). PRD §3, §5.3, §5.8,
§5.15 and §10 updated.

- `ProjectorBeam.astro` deleted; Footer mounts `<Starfield variant={3}
  meteors={false} />`.
- Credit lines and "Get in touch": no text-shadow at all. Each is a `--bg`
  box the width of its words (invisible on `--bg`, keeps stars out). Name:
  weight 500, `min(1.1em, 8.2vw)`, 0.08em tracking, −0.08em end margin.
- Tape: X of two full diagonals (`HazardTape.astro`, drawn by
  `PlannedCard.astro`, no longer by `ProjectFrame.astro`). Below 360px the
  slate's `dt` labels translate −0.625rem −0.25rem to clear the `/` arm.
- Measured (6 viewports × 7 sky frames, every pixel within 2px of a glyph):
  crimson 5.65, name 17.57, heading 17.57, zero under 4.5. Tape, on ink
  pixels: TAKE 2px clear at 320, 5 at 340.

### Second commit: increment 33 parts 5 and 10 (owner approved)

`skills:` / `experience:` — the work that sat uncommitted in the tree.
- Skills: nodes and labels ~⅓ larger (`TYPE` in `skills-metrics.ts`),
  heavier links (leaf 1.5px @0.5, centre spokes 2.5px @0.42), hub names
  over 14 chars on two lines (`labelLines`). Build asserts 0 overlaps.
- Experience: heading in the monitor's top-left (`ExperienceHead.astro`
  inside `.monitor`, frames in `.screen`), its Starfield removed — which
  also frees variant 3 for Contact (between the two pushes the live page
  briefly had variant 3 twice). Short-screen thresholds 512 / 444 / 348.
- The approved "safety margin on the 1280×352 monitor height" was not in
  the code. Re-measured (`h/expscan.mjs`, `h/exptc.mjs`, pin forced on):
  no frame clips anywhere down to 300px; 31px spare at 348, frame counter
  ≥63px clear. **Owner kept 348, no margin** — recorded in PRD §5.11.
  (`.inner`'s grid box overlaps the counter below ~352 at ≥768; the real
  elements don't — measure ink/elements, not `.inner`.)
- `skills-data.ts` / `skills-layout.ts` showed as modified with no diff
  (stat-dirty only); `git update-index --refresh` cleared them.

### Still open

- Known small tape overlaps: `\` arm grazes SCENE's tips by 3px at 1280;
  TAKE's "—" by 2–14px between 359 and 480px (it sits at the X's centre).
- `AGENTS.md` (untracked, a Codex copy of CLAUDE.md with stale lines —
  says @astrojs/react is installed) is still uncommitted. Owner's call.
- Probes: this session's scratchpad `h/` — `credits.mjs` (A/B contrast),
  `heading.mjs`, `tapeink.mjs` (`CSS=` trials), `names.mjs`, `tape.mjs`.

## 2026-09-24 — increment 32.1 (LCP follow-up)

### Last milestone completed

`6e9fd79` **perf** — the hero is a `<Picture>` with an AVIF set beside the
WebP one (660w: 25 KB against 60), the head preload names the AVIF set
(`type="image/avif"`, so browsers without AVIF skip it), and the display
face is no longer preloaded (`font-display: swap` was already set). Built
clean, pushed, aliased. Checked: the preload's URLs equal the
`<source type="image/avif">` URLs; AVIF chosen with one hero request at
375@2, 1280, 1920 and 844×390; the subject's box unchanged (330×426 /
470×607); fonts load; 0 console messages; CLS 0.

### Measured (live, 375px, DPR 2, 4× CPU + slow 4G, repeat visit, 7 runs)

LCP 2128 / 2144 / 2188 / 2192 / 2292 / 2992 / 3140ms, **median 2.19s** —
no better than increment 32's 2.15 (2.54 before it). The hero now finishes
at ~1.52–1.63s (was ~1.85–1.9s) and transfer is 96.7 KB (was 131), but FCP
is 1.84–2.50s (median 2.13) and LCP cannot come before it.

### What is left (not chased, per the owner)

**Closed by the owner:** PRD §8's target is now ≤ 2.2s under this throttling (real-world mobile LCP is well under 2s). The levers below are **not to be pursued**; they stay listed only as a record.

- **The first paint is the bound.** Both render-blocking stylesheets
  (BaseLayout 6.4 KB + index 5.9 KB — split since the 404 page shares
  styles) land at ~1.42–1.50s; then, at 4× CPU, parsing the 164 KB HTML
  (43 KB of it the star lists), style recalculation and the first layout of
  the whole one-page DOM (~1,100 layout objects: four skies, the 52-node
  graph, every section) take ~0.4–0.8s before anything paints. The audit
  measured that first layout at 815ms.
- **Levers, likely biggest first:** `content-visibility: auto` (with a
  `contain-intrinsic-size`) on the sections below the hero, so their style
  and layout skip the first frame; lighter star lists; one stylesheet
  instead of two. Each touches structure or design, so it is the owner's
  call.
- **Network variance** explains the two slow runs (TTFB 199ms; a hero that
  only started at 1.05s in run 2).

## 2026-09-24 — increment 32 (audit Bucket 1 and cleanup)

### Last milestone completed

Every Bucket 1 finding of the 2026-09-24 audit, the credits scrim and the
cleanup list, one commit per group on `main`, each built clean (0 errors /
warnings / hints), pushed, aliased and re-measured live. The push first hit
the owner's own README edit on GitHub (`992d2f3`, 19:35); the unpublished
commits were rebased onto it and the owner's intro line kept.

| Commit | Group |
| --- | --- |
| `f475b41` content | the owner's final `public/resume.pdf` |
| `60f8043` pins | H1 + H2 short-screen static layouts, L2; `ExperienceHead.astro` |
| `c6234b2` a11y | M1, L7, M5, L5, L11; `ExperiencePlayhead.astro` |
| `bf2d2f0` links | L6 `NewTab.astro`, L3 address breaks |
| `0d9365f` nav | L1; `NavProgress.astro` |
| `473dcbd` perf | M2 preload + 660w, L8, L12 |
| `4989316` meta | M3 404, M4 og.png, L10 favicon set, L9 robots + sitemap |
| `4b31983` sky | L4 `.halo`, meteor lanes |
| `daa4c36` contact | credits scrim 94% → 70% |
| `6e59d8e` chore | dead code, shared modules, splits, stale comments |
| `6dbab9e` perf | star lists back in the `<head>` (see below) |
| docs | this entry, PRD, README, ASSETS, SESSION-archive.md |

### Decisions worth knowing before you touch this

- **Short-screen thresholds are measured, per width band.** Contact:
  binary search of the smallest pinned height that fits heading, cards,
  résumé ≥8px above ©, per width — 532 below 480, 647–665 at 480–959,
  498–505 from 960; +2px → `533.98 / 667.98 / 507.98px`. Experience: a 4px
  scan of 300–800px, because it is **not monotonic** (it fit at 500 in the
  compact band and failed again at 504–572 once the full band returned) →
  `531.98 / 463.98 / 523.98 / 575.98px`. Both lists live in the components'
  `<style>` (Footer.astro, ExperienceTimeline.astro); the scripts read the
  pin's computed `position` (`isPinned` in experience-scrub.ts), so there is
  no second copy of the numbers in TypeScript. **Re-scan if a frame's
  content, the band or the contact cards change.**
- **The compact Experience heading now applies.** Its ≤500px rules sat
  above the base rules in the old file and lost; the split into
  `ExperienceHead.astro` put them after. Only visible below 500px tall,
  which is static now anyway.
- **The star lists stay in the `<head>`** (owner's rule: only move them if
  the boot sky never loses a frame). Moved to the end of the body they
  passed locally (6/6 runs) but **live on slow 4G the overlay painted two
  starless frames in each of 3 runs** — streamed HTML lets the first paint
  happen before the end of the body is parsed. Reverted in `6dbab9e`; live
  after: 0 starless frames in 6 runs. The hero preload is first in the head
  either way, so the star CSS no longer delays the hero request.
- **Originals.** Astro deploys an imported image's original whenever
  component code reads its metadata (a Proxy records every property but
  `clone` / `fsPath`), and always for an image that never goes through
  `<Image>`. `lib/image-size.ts` reads through `clone` (Astro's own
  internal.js does the same; if it disappears the originals simply ship
  again). Recurzn's placeholder had no transform at all, so it was deleted
  and planned entries carry no cover.
- **Grace cap.** Counted from navigation start in the module, plus a
  backstop in the synchronous inline script (fires only if the module has
  not set `data-running`). No script can run before the render-blocking
  CSS, so on slow 3G the overlay is fading at the first paint.
- **`.halo` is the ©'s full ring recipe** (0.8 / 1.5 / 2.25 / 3px rings + two
  blurs). The two outer rings alone left near-glyph star pixels on 12px text.
- **Hero meteors** start 3rem below the letters' box, which `Hero.astro`
  now computes (`--letters-top`, `--wm-w`, `--wm-h`, `--overlap`) for both
  the wordmark and the sky. Skills has no meteors (no clear lane). The boot
  overlay keeps its full-height meteors, so during its 0.4s fade the two
  skies' meteors can differ; stars and timings are still identical.
- **Scrim 70%**, shape unchanged. A tighter panel (−1.75 / −2.25rem) at 70%
  passed only at 4.51 for ~2–3 points more beam; −1.25 / −1.5rem failed.
- **Nav step at 358px, not 346.** The old step-down left the mark and links
  under 12px apart up to 357px (0.6px at 346).
- **Preload quirk.** A cold load at any size makes exactly one hero request (live, nine sizes). But when a larger rendition is already cached — a tab that loaded the page at another size first — Chrome's `<img>` reuses it while `<link rel=preload imagesrcset>` still fetches its own candidate: one extra ~35 KB request and a "preloaded but not used" console warning; LCP unaffected. Kept, because the preload was asked for; drop the link if the warning ever matters more than the head start.
- **`<wbr>`** in card addresses: Chrome computes a space at each one in the
  accessible name ("github.com/ rishi-ventrapragada"); copied text is clean.
- **Nav.astro's line-ending entry** was stat-only (index LF = working LF);
  the nav commit settled it. `AGENTS.md` left untracked and untouched.
- **Worktree** `C:/dev/portfolio-nav-fix` and branch `nav-contrast-fix`
  removed with `git worktree remove` / `git branch -d` after confirming
  the branch was an ancestor of `main` and its tree clean.

### Doc edits this session (CLAUDE.md §7)

- **PRD** §3 (five boundaries, starfield list, 404 / robots / sitemap),
  §4.2 (`--accent-soft` removed), §4.3 (h1 text), §5.1 (320px, NavProgress),
  §5.2 (caption 5.1%, h1, preload / 660w / LCP, letters' box), §5.3 (no
  cover for planned, dimming history marked, new-tab cue), §5.6 (tree,
  focus, forced colours, sky, code), §5.8 (résumé, short screens, scrim,
  links, halo), §5.10 (grace cap), §5.11 ("between Skills and Projects",
  short screens, ring, forced colours, splits), §5.12 (48s), §5.14 (halo,
  meteor lanes), §6 (`year` gone, `cover?`), §7 (hero, résumé, share image
  and icons), §8 (OG done, LCP measured), §9 (one accent), §10 (entry 31).
- **README** — components, lib, pages, utilities, public/; the owner's
  shortened intro line kept.
- **ASSETS** — résumé (exists), Recurzn placeholder (removed), hero sizes,
  Space Grotesk outlines (OFL), og.png, the favicon set.
- **SESSION** — this entry; the `#111214` constraint rewritten for
  `#0b0b0d`; increments 30 and older moved to `SESSION-archive.md`; Vercel
  project IDs, deployment hashes and the other account's team names
  scrubbed from both files (they remain in git history — rewriting it is
  destructive, so it was not done).
- CLAUDE.md not touched.

### Verified by measurement (live unless noted; before = audit or same probe on the pre-change build)

| Item | Check | Before | After |
| --- | --- | --- | --- |
| H1 | Contact at 568×320 → 932×430, 320×256, 400% / 200% zoom | résumé and © hidden at every landscape size; only GitHub at 400% | static layout; every card, résumé and © reachable; résumé 22px above © |
| H2 | every Experience frame inside its monitor | monitor 0px at 400%, 45px at 320×256; KalaCart clipped 19 / 5px (568×320 / 740×360); 1280×501–572 clipped | 16px clear at all 13 short sizes; 0 failing heights, 18 widths × 300–800px |
| — | pinned sizes still pinned, scrub and keyboard jump | — | 7 sizes sticky; clips and credits walk forward and back; jump fires |
| L2 | no-JS horizontal overflow, 320–430 | 24–29px | 0 |
| M1 | ring after first Tab / Home / End | 785–821 (1280×800), 1065–1101 (1920×1080): below the fold | 737–773 / 1017–1053: on screen, clear of the nav |
| L7 | roles, hint | 52 focusables, no role, no hint | tree "Skills" described by the hint; treeitems 1 / 8 / 43 at levels 1 / 2 / 3 |
| M5 | forced colours | four identical clips, no playhead, no dots | pressed clip 3px Highlight border, playhead Highlight, dots CanvasText |
| L5 | pressed ring against the fill | 1.88–2.00:1 | inner band vs fill 10.93–11.62 (6.97 Recurzn); ring vs band 5.82 / 3.48 |
| L11 | h1 | "Rishi" | "Sai Rishi Ventrapragada" |
| L6 | new-tab cue | 0 of 5 links | 5 of 5 (arrow + "(opens in new tab)"), none on same-tab links |
| L3 | mail address at 320 | "…@gmail.co / m" | "rishiventrapragada23 / @gmail.com" |
| L1 | nav mark ↔ links, 320–357px | 0px (320–345), 0.6 (346), Contact 1.4px past the edge | ≥12.6px everywhere, 18.5 at 320, 16px inside the edge |
| M2 | LCP, 375 DPR 2, 4× CPU + slow 4G, live ×5 | median 2.54s (2.40–2.76) | median 2.15s (2.10–2.65) — **2.0 target not met** |
| M2 | hero bytes at DPR 2, first request | 95.5 KB (923w), after head parsing | 60 KB (660w), first request |
| — | boot overlay's first painted frame, live slow 4G | stars | stars (0 starless frames, 6 runs) |
| L8 | unreferenced originals deployed | hero PNG 1.07 MB, Recurzn 13 KB | none |
| L12 | loader, slow 3G / stalled hero | 8.47s / 4.49s | fading at first paint 4.94s, gone 5.39 / cap at 4.005s |
| M3 | unknown path | plain-text NOT_FOUND | the site's 404 page, status 404, noindex |
| M4 | share image | none | og:image + twitter:image 1200×630, with alt |
| L10 | favicon | system-font R, SVG only | Space Grotesk path; SVG + 32 / 192 PNG + 180 apple-touch |
| L9 | robots.txt / sitemap.xml | 404 / 404 | 200 / 200 |
| L4 | frames with a near-glyph pixel under 4.5 (375 / 1280), fixed probe | Exp eyebrow 89.7 / 31.7%, h2 65.2 / 3.2%, Skills eyebrow 30.9 / 9.5%, caption 73.8 / 0% | 0% everywhere except the Skills eyebrow, ≤ 2.9% (worst 3.52–4.17: one dim star on the ring's fringe) |
| L4 | meteors vs hero text | crossed the wordmark | lane 16–48px below the caption, 11 sizes; Skills 0 meteors |
| Scrim | crimson worst / beam kept (1280×800) | 5.54 / 21% at 94% | 4.73 / 43% at 70% (live; 4.56 worst over all sizes) |
| Cap | files at 199–200 lines | Nav 200, ExperienceTrack 200, ExperienceTimeline 199, skills-layout 199 | largest 196 (ContactCard, ProjectFrame, boot-preloader) |
| JS | gzipped, referenced by `<script src>` | ~4.7 KB (+ ~2.4 inline) | 4.5 KB (+ 2.9 inline) of 40 |
| Console | every live probe | 0 | 0, except the preload quirk (below) |

### Generation recipe — og.png and the favicon set

One-off, not part of the build (owner: no build-time endpoints, no `sharp`
import in project code). In the session scratchpad (`gen/`):

1. `SpaceGrotesk-700.ttf` — the static weight-700 instance Google Fonts
   serves to a legacy user agent:
   `curl -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700"`
   and download the `.ttf` it names (v22).
2. `ttf.mjs` — a ~120-line TrueType reader (cmap 4, hmtx, loca, glyf simple
   and composite) returning quadratic contours as SVG paths.
3. `make-icons.mjs` — reads `--bg` / `--heading` from `global.css`; draws
   the favicon's R (18/1000 scale, baseline 22, ink centred) on the
   unchanged `#111214` / `#ff3b5c` artboard and rasterises it with the
   `sharp` Astro installs (32 and 192 rounded, 180 full-bleed); lays RISHI
   out at 820px of ink with spacing redistributed, behind the cutout
   (470px tall, bottom-anchored, head at the hero's 56% overlap), over the
   near / mid / far stars from `starfield-data.ts`'s seeds; writes `out/`.
4. Copy `out/{og.png,favicon.svg,favicon-32.png,icon-192.png,apple-touch-icon.png}`
   to `public/`. The owner approved both images before the commit.

### Harness notes

- This session's scratchpad `h/` holds the audit harness (`lib.mjs`, now
  with `GZ=1` for a local gzip server, `gzserve.mjs`, port 4400) and the
  increment's probes: `sweep.mjs` / `sweepc.mjs` / `scanexp.mjs` (pin
  thresholds), `pins.mjs`, `walk.mjs`, `a11y32.mjs` (`SECTION=`),
  `perf32.mjs`, `starframe.mjs` (trace filmstrip of the boot overlay),
  `boot.mjs`, `sky.mjs`, `scrim.mjs` (`ALPHAS` / `INSET` / `TIMES`),
  `shot404.mjs`, `resume.mjs`. `LIVE=1` points any of them at the vanity
  URL.
- `git stash pop` rewrites files with CRLF; a scripted edit matching `\n`
  then silently misses. Normalise first or use the Edit tool.
- `scrollIntoView` inherits `scroll-behavior: smooth`: pass
  `behavior: "instant"` in probes, or the reference mask is taken
  mid-scroll (the audit's star-near-text numbers were partly this).
- A CDP screenshot `clip` is in document coordinates (add `scrollY`).
- The first fetches after `vercel alias set` served the previous build
  again this session; wait ~20s and re-fetch.

### Still open

- **LCP is still above 2.0s** (live median 2.15s at 375 / 4× CPU / slow
  4G, from 2.54). What remains is the first paint at 4× CPU (FCP 1.8–2.7s)
  and the fonts and two stylesheets sharing the link with the 60 KB hero.
  Candidates, none in this increment's scope: an AVIF rendition via
  `<Picture>`, not preloading the display font, fewer render-blocking
  bytes. Owner's call.
- The preload quirk above (an extra request and a console warning once a larger rendition is cached).
- A Tab-focused card at 400% zoom (320×200) sits 5px under the fixed nav:
  partly obscured (passes WCAG 2.4.11 AA, not 2.4.12 AAA).
- The Skills eyebrow can still meet one dim star on the halo's
  anti-aliased fringe (worst 4.17:1, 1 frame in 135 at 1280).
- Carried over: Google brand terms, contact cards at 960–1119px, the tape
  over the slate's stripes, the audit's Bucket 2 list.

### Next milestone planned

None queued. Waiting on the owner.

## 2026-09-23 — increment 31 (one skills graph)

### Last milestone completed

`fd07437` **skills** — the skill tree and the video-editing constellation
are one section: an Obsidian-style graph (a centre, eight hubs, 43 skills)
from 960px, a stacked list below it and without JS. Two review rounds with
the owner before the commit (spacing, link crossings, width, hover dim,
then content). Built clean, pushed, aliased and re-measured
live; live matched local on every check below.

### Decisions worth knowing before you touch this

- **Content is the owner's revised list** (`lib/skills-data.ts`, PRD §5.6
  table). `hubs` is the owner's order (list, keyboard, screen readers);
  `ring` is only where each hub sits in the graph. Don't conflate them.
- **The layout is computed at build time and asserted.** `skills-layout.ts`
  throws — failing the build — on label boxes closer than 12px (24px across
  clusters), any two links crossing, or any link within 12px of a label or
  dot it doesn't end at. **Changing a skill can fail the build**: that is the
  point. If it does, rebalance `ring` first (this increment's fixes were all
  ring moves: big clusters on diagonals, Tools/Cloud opposite on the side
  axes). Tuning harness: `tune.sh` + `preview.mjs` in this session's
  scratchpad (a soft-fail copy that prints problems and draws the boxes).
- **Percent positions, never-smaller box.** x and y are % of the graph box,
  type is px, and the box is never smaller than the 864 × 720 reference —
  that is what makes the build-time checks hold at every width. Don't give
  the box a smaller height or width than `--ref-h` / 864px.
- **HTML nodes, SVG links, on purpose.** Opacity animations on SVG children
  repaint the SVG every frame; on HTML they're composited. Keep twinkle on
  HTML.
- **Drift runs on a 125ms timer and is placed, not simulated.** Waiting
  through skipped rAFs cost ~200 ms/s (every requested frame is a full
  main-thread frame). Links couple *deviations from drift*, or pure drift
  never settles and the loop falls back to 60fps.
- **The hovered node is never pushed** (else it runs from the cursor and
  can't be hovered). Hit test: its label, or its dot within 26px.
- **Hover dim: labels 0.72, stars 0.25.** 0.72 is the floor for AA —
  periwinkle and coral hub labels need 0.69.
- **Reduced motion keeps drag** (direct manipulation); release snaps home.
- `offscreen-pause.ts` now dispatches `offscreenchange` on marked elements.
- `SkillChain.astro` is kept (owner's call): it is the list's spine.
  Starfield variant 2 (Video editing's) is unused now; left in Starfield.

### Doc edits this session (CLAUDE.md §7)

- **PRD** §3 (site map row; seams sentence), §5.6 (Skills rewritten in full;
  the increment-29 drift note for the old sections removed), §5.14 (mount
  list), §10 (increments 30 and 31 — **increment 30 had missed its §10
  entry; added here**).
- **README** — components, lib and scripts lists.
- CLAUDE.md, ASSETS.md not touched. `AGENTS.md` (untracked) and
  `Nav.astro` (line endings only) still left alone, unstaged.

### Verified by measurement (local, then live)

- Rendered page, 960 / 1280 / 1920 (box 864×720 / 1184×720 / 1680×840):
  **0 label overlaps, 0 link crossings, 0 links within 12px of an unrelated
  label or dot**; min label gap 14.8 / 14.8 / 20px; min across clusters
  26.8 / 27 / 88.5px; min link clearance 14.1 / 21.6 / 26.1px.
- Content: graph leaves = list = the owner's 43 names; list order =
  Languages, Frameworks, AI, Tools, Platforms, Cloud, Currently learning,
  Video editing.
- Hover: a cluster lights (9 nodes / 9 links for Languages); worst dimmed
  label 4.88:1. Contrast sweep: 0 failures (1280 / 375, top / end).
- Drag: hub follows exactly, its leaf ~1/3 as far; after release its offset
  is inside the drift's ±4px. Reduced motion: cluster still, snap home.
- Keyboard: one Tab stop, arrows through every node with the ring on it,
  End → Color Grading. No-JS: graph hidden, 43 skills in the list.
- CPU (ms/s): before interaction 4 (old sections 3 / 1), drifting 36–48
  (old 225 / 265), off-screen 0, reduced motion 1. rAF 7/s drifting, 0
  off-screen.
- JS: skills 2,606 B gz (old 3,120); page ≈ 7.1 KB of 40. Every file ≤ 200
  lines — **`skills-layout.ts` is at 199**: split before adding to it.

### Harness notes

- `skills31.mjs` (overlaps, crossings, clearance from rendered rects;
  content; hover dim), `interact31.mjs` (push / drag / release / keys /
  off-screen / no-JS), `cpu31.mjs` (ms/s, `REDUCE=1`), `cpuexp*.mjs` (what a
  frame costs). `LIVE=<url>` redirects all of them.
- The first fetch after `vercel alias set` returned the previous build's
  HTML twice this session; re-fetch before concluding the deploy failed.
- Python heredocs with long prose broke bash quoting; write the script to a
  file and run it.

### Still open

- The cursor push is hard to see while drift runs (both ~4px); owner to
  judge by hand.
- Carried over: résumé PDF, Google brand terms, 320px nav, hero on short
  landscape, contact cards at 960–1119px, the credits scrim over the beam,
  the tape over the slate's stripes.

### Next milestone planned

None queued. Waiting on the owner.

