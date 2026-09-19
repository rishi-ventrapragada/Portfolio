# ASSETS.md

Provenance and licence for every non-code asset in the repo, per CLAUDE.md §7
and PRD §7. One entry per file. Anything marked `[PLACEHOLDER]` is stand-in
material that must be replaced before launch.

---

## About page photo `[PLACEHOLDER]`

| | |
| --- | --- |
| Source | None — CSS only, no file |
| Licence | N/A |
| Date | 2026-09-19 |

There is **no image file**. `src/pages/about.astro` renders a bordered
`--bg-raised` box at `aspect-ratio: 3/4` with centred `[TODO: photo]` in mono
`--fg-muted`. Unlike the KalaCart cover there is no PNG to optimise, so nothing
goes through `<Image>` until a real photo arrives.

**[TODO: replace with a real photo.]** When it lands, swap the box for an
`<Image>` and log the file here.

---

## `public/resume.pdf` `[PENDING — FILE DOES NOT EXIST]`

| | |
| --- | --- |
| Source | To be supplied by the owner |
| Licence | Owner's own material |
| Date | Not yet added |

`/about` and the footer both link to `/resume.pdf`. **The file is not in the
repo**, so both links 404 until the owner adds it. A static build cannot verify
link targets, so this does not fail the build and will not surface as an error —
it has to be remembered.

**[TODO: owner to add `public/resume.pdf`.]**

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

Two notes for whoever touches the tile next:

- **The tile no longer forces 16:9.** The old placeholder was generated at 16:9
  precisely so it needed no layout change; this screenshot is 1.82:1, so
  `ProjectTile.astro` lets the image set its own ratio instead of cropping
  ~14px off each side. Demo **video** still uses 16:9 per PRD §7.
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
| Size | 1.07 MB source; built to 51 KB / 110 KB WebP |

Transparent-background cutout used as the hero subject and LCP element
(PRD §5.2). Logged here retroactively — it predates this file.
