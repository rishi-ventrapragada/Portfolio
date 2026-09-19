# ASSETS.md

Provenance and licence for every non-code asset in the repo, per CLAUDE.md §7
and PRD §7. One entry per file. Anything marked `[PLACEHOLDER]` is stand-in
material that must be replaced before launch.

---

## `src/content/projects/kalacart-cover.png` `[PLACEHOLDER]`

| | |
| --- | --- |
| Source | Generated locally, not obtained externally |
| Licence | None required — no third-party material |
| Date | 2026-09-19 |
| Size | 1600 × 900 (16:9), 37 KB |

Solid `--bg-raised` (`#1a1b1e`) ground with centred `--fg-muted` (`#9a9ca3`)
text reading "KALACART". Generated with `sharp` 0.35.4 (already present as
Astro's image dependency) from an inline SVG, as a one-off — the script is not
part of the build.

Token values are baked in because a PNG cannot reference a CSS custom property.
If the accent or surface tokens change, this file must be regenerated to match.

Two known deviations, both acceptable for a placeholder:

- The rasteriser has no access to JetBrains Mono, so the text falls back to a
  generic sans face rather than the site's `--font-mono`.
- 16:9 was chosen to match the demo-video aspect PRD §7 specifies, so replacing
  this with a real screenshot or video poster needs no layout change.

**[TODO: replace with a real KalaCart screenshot or demo poster.]**

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
