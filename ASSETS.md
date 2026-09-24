# ASSETS.md

Provenance and licence for every non-code asset in the repo, per CLAUDE.md §7
and PRD §7. One entry per file. Anything marked `[PLACEHOLDER]` is stand-in
material that must be replaced before launch.

---

## About comic panels `[PLACEHOLDER]`

| | |
| --- | --- |
| Source | None — CSS only, no files |
| Licence | N/A |
| Date | 2026-09-21 |

**Dormant since increment 29**: the comic is not on the page (About shows
the owner's bio instead), but its code is kept for when real art exists —
`AboutComic.astro` renders the panels. There are **no image files**.
`src/components/AboutPanel.astro` renders each of
the five panels as a solid fill (a palette word mixed 72% into the light
scope's `--fg` — About is light-themed; 52% into `--bg-raised` on a dark ground)
with a centred `[PANEL N — placeholder art]` mono tag, and every caption box
reads `[TODO: panel N dialogue]`. Nothing goes through `<Image>` until real
art arrives. This entry replaced the increment 6 "About page photo"
placeholder (a 3:4 `[TODO: photo]` box) in increment 16.

**[TODO: owner to supply five panel artworks and five captions.]** When they
land, swap each fill for an `<Image>` with explicit width and height, put the
owner's dialogue in the captions verbatim, and log the files here.

---

## `public/resume.pdf`

| | |
| --- | --- |
| Source | Supplied by the owner — the final résumé |
| Licence | Owner's own material |
| Date | Added 2026-09-24 (increment 32) |
| Size | 37 KB, one page, PDF 1.4 |

The footer's résumé card checks for the file at build time
(`import.meta.glob` in `FooterContact.astro`), so committing it turned the
dashed "Résumé [TODO]" placeholder into a live link (new tab, measured) with
no code change.

--- | --- |
| Source | To be supplied by the owner |
| Licence | Owner's own material |
| Date | Not yet added |

**The file is not in the repo.** Since increment 25 the footer's résumé card
checks for it at build time (`import.meta.glob` in `FooterContact.astro`):
while it is missing the card renders as a dashed "Résumé [TODO]" placeholder
that is not a link, so nothing 404s. Adding the file and redeploying turns
the card into a live link with no code change.

**[TODO: owner to add `public/resume.pdf`.]**

---

## `src/content/projects/recurzn-cover.png` — removed (increment 32)

The generated 1272 × 700 "RECURZN" placeholder (2026-09-20) is deleted. It
had not been displayed since increment 29 (the planned frame shows a slate)
and was kept only for its aspect ratio, but Astro shipped it in every build:
an imported image that never goes through `<Image>` always deploys its
original. A planned entry now carries no cover (PRD §5.3, §6); the slate
takes the first real cover's shape. When Recurzn has a real screenshot, add
it as the entry's `cover` and log it here.

--- | --- |
| Source | Generated locally, not obtained externally |
| Licence | None required — no third-party material |
| Date | 2026-09-20 |
| Size | 1272 × 700 (1.82:1, matching the KalaCart cover), 13 KB |

Solid `--bg-raised` (`#1a1b1e`) ground with centred `--fg-muted` (`#9a9ca3`)
text reading "RECURZN". Generated one-off with the `sharp` Astro already
ships, from a script kept outside the repo — it is not part of the build.

The rasteriser could not use the site's JetBrains Mono file, so the text
falls back to a generic monospace face rather than `--font-mono` — the same
deviation the original KalaCart placeholder had, acceptable for a placeholder.

Token values are baked in because a PNG cannot reference a CSS custom property.
If the surface or muted-text tokens change, regenerate this file to match.

It is the cover of the **planned** Recurzn frame (PRD §5.3), but since
increment 29 it is **not displayed**: the frame shows a slate
(`PlannedCard.astro`) and uses this file only for its aspect ratio. The
schema requires a cover, so it stays. Rebranding the deployed Life OS app to Recurzn is a separate task in a
different repo, not this portfolio.

**[TODO: replace with a real Recurzn screenshot once there is one.]**

---

## `src/content/projects/kalacart-cover.jpeg`

| | |
| --- | --- |
| Source | Screenshot of the live KalaCart site, taken by the owner (Sai Rishi Ventrapragada) |
| Licence | Owner's own material — his own project; no third-party rights |
| Date | Added 2026-09-20 |
| Size | 1272 × 700 (1.82:1), 215 KB source |

The KalaCart homepage hero: wordmark and nav, the "Handmade goods, direct from
the artisan" headline, and the scattered craft-photo collage.

**This is real, not a placeholder.** It replaced a generated `[PLACEHOLDER]`
PNG (1600 × 900, solid `--bg-raised` with "KALACART" in `--fg-muted`), which was
deleted in the same change and is no longer referenced anywhere.

It renders in the Projects frame (`ProjectFrame.astro`, which replaced
`ProjectCard.astro` in increment 15) and on the KalaCart Experience monitor
frame (`ExperienceFrame.astro`); the case study page that also showed it is gone.

Two notes for whoever touches the tile next:

- **The frame never forces 16:9.** The old placeholder was generated at 16:9
  precisely so it needed no layout change; this screenshot is 1.82:1, so the
  frame (`ProjectFrame.astro` today; `ProjectCard.astro` and `ProjectTile.astro`
  before it) lets the image set its own ratio instead of cropping ~14px off
  each side. Demo **video** still uses 16:9 per PRD §7.
- **Body text in the screenshot is not legible at tile size.** Rendered ~700px
  wide, the source's 16px body text lands near 8px. The headline stays readable;
  the rest reads as texture. That is inherent to a full desktop screenshot in a
  tile, not a crop bug — a cropped detail shot would be the fix if it ever matters.

---

## `src/assets/hero-subject.png`

| | |
| --- | --- |
| Source | Supplied by the owner (Sai Rishi Ventrapragada) — photograph of himself |
| Licence | Owner's own material; no third-party rights |
| Date | Added 2026-09-18 (increment 1) |
| Size | 1.07 MB source (not deployed since increment 32); built to 470 / 660 / 923w AVIF, 16 / 25 / 40 KB (increment 32.1), and WebP, 35 / 60 / 95 KB |

Transparent-background cutout used as the hero subject and LCP element
(PRD §5.2). Logged here retroactively — it predates this file.

---

## Contact card brand marks — GitHub, LinkedIn (inline SVG paths)

| | |
| --- | --- |
| Source | Simple Icons, simpleicons.org — `github` from v16.32.0 (github.com/simple-icons/simple-icons, `icons/github.svg`); `linkedin` from **v13.21.0**, the last release that shipped it (removed in v14 at LinkedIn's request) |
| Licence | Simple Icons is CC0 1.0 for its SVG data. **The marks themselves remain trademarks** of GitHub, Inc. and LinkedIn Corporation; CC0 does not license them |
| Date | 2026-09-23 (increment 25) |
| Where | `src/components/ContactIcon.astro`, path data inlined — no file, no network request |

Used under each brand's own terms for linking to a profile:

- **GitHub** (brand.github.com/foundations/logo): the Invertocat may be used
  "as a social button to link to your GitHub profile"; only in white, black,
  or in few cases grey or green; do not change its colour.
- **LinkedIn** (brand.linkedin.com/in-logo): members may use the [in] logo
  "as a hyperlink to your LinkedIn profile"; blue, black or white only; do
  not modify its colour or shape.

So both are rendered **white** (`var(--fg)`, `#ffffff`) under both accents
and on hover/focus, unmodified in shape. Hover is signalled by the card's
border and address, never the mark. Re-check both pages if either brand's
rules change.

The **mail** glyph is a plain hand-drawn envelope, not the Gmail logo: Google's
brand terms could not be verified (increment 25), so no Google mark is used.

---

## Space Grotesk 700 glyph outlines (in `public/og.png` and the favicon set)

| | |
| --- | --- |
| Source | Space Grotesk, static weight-700 instance served by Google Fonts (`fonts.gstatic.com/s/spacegrotesk/v22/…`, TrueType) — the site's own display face |
| Licence | SIL Open Font License 1.1 (Florian Karsten) — embedding outlines in images and icons is permitted |
| Date | 2026-09-24 (increment 32) |

The glyphs R, I, S and H were read out of the TTF as quadratic outlines by a
one-off script in the session scratchpad (recipe in SESSION.md, increment 32)
and drawn as SVG paths, so the favicon's R no longer depends on a system
font and the share image needs no font at all. The font file itself is not in
the repo; the page still loads the face through Astro's Fonts API.

---

## `public/og.png` — the share image

| | |
| --- | --- |
| Source | Generated from this repo's own assets |
| Licence | Owner's own material |
| Date | 2026-09-24 (increment 32) |
| Size | 1200 × 630, 267 KB |

The og:image / twitter:image card: RISHI as Space Grotesk 700 outlines in
`--heading`, 820px wide, behind the hero cutout (`src/assets/hero-subject.png`,
470px tall, bottom-anchored, its head crossing the letters' lower half at the
hero's 56% overlap), on `--bg` with the near / mid / far stars of
`lib/starfield-data.ts` (same seeds). No text; the name is in og:title.
Colours are read from `global.css` by the generator. Approved by the owner
before commit. Regenerate (SESSION.md recipe) if the cutout or the tokens
change.

---

## `public/favicon.svg`, `favicon-32.png`, `icon-192.png`, `apple-touch-icon.png`

| | |
| --- | --- |
| Source | Generated from this repo's own assets (one SVG source) |
| Licence | Owner's own material |
| Date | 2026-09-24 (increment 32); the SVG's design dates from increment 1 |
| Size | 622 B SVG; 432 B / 2.4 KB / 1.3 KB PNG |

The increment-1 favicon — a 32px `#111214` rounded square with a `#ff3b5c`
R, colours unchanged at the owner's request — with the R now a Space Grotesk
700 path (it was a `<text>` in the system UI font) and its ink centred.
The PNGs are that SVG rasterised: 32 and 192 with the rounded corners, and a
180px full-bleed square for iOS, which rounds its own. Approved by the owner
before commit.
