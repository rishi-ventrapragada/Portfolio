# Portfolio

Personal portfolio of Sai Rishi Ventrapragada 

`PRD.md` is the product spec. `CLAUDE.md` is how the work gets done. `SESSION.md`
carries the handoff between sessions. `ASSETS.md` logs every non-code asset.

## Stack

- **Astro 7** — static output, TypeScript strict, no integrations
- **Tailwind v4** via `@tailwindcss/vite` — layout and spacing only; distinctive
  visual work lives in scoped `<style>` blocks. No component uses a utility
  class yet, so automatic source scanning is off (`source(none)` in
  `global.css`); register a file with `@source` when one first does
- **Astro Fonts API** — Space Grotesk and JetBrains Mono, self-hosted
- Motion is CSS scroll-driven animation with a `requestAnimationFrame` fallback.
  No animation libraries, no client router, no islands.

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check && astro build — must pass with zero warnings
npm run preview  # serve the production build locally
```

## Layout

```
src/
  assets/hero-subject.png     real cutout, transparent PNG (hero, LCP element)
  components/                 Nav, NavProgress, Hero, Wordmark, HeroCaption, About,
                              AboutComic + AboutPanel (dormant — see SESSION.md),
                              SkillsSection, SkillsGraph, SkillNode, SkillLabel,
                              SkillsList, SkillChain, Pills,
                              ProjectsSection, ProjectFrame, ProjectDetail,
                              ProjectLinks, PlannedCard, HazardTape,
                              ExperienceTimeline, ExperienceHead, ExperienceFrame,
                              ExperienceTrack, ExperienceClip, ExperiencePlayhead,
                              Footer, FooterStage, FooterCredits, FooterContact,
                              ContactCard, ContactIcon, NewTab,
                              Divider, LoopDivider, EdgeCode, LeaderStrip,
                              ClapperStrip,
                              Starfield, StarfieldMeteors, StarfieldDefs,
                              ProjectorBeam,
                              BootPreloader, BootSquare
  content/projects/*.json     one data file per project, beside its cover image
                              (a planned entry has none)
  content.config.ts           the projects collection schema
  layouts/BaseLayout.astro    head, fonts, landmarks, share image and icons;
                              `bare` for pages outside the one-page site (404)
  lib/film-strips.ts          the edge-code and countdown-leader seams' SVG tiles
  lib/hero-image.ts           the hero cutout's widths / sizes, shared with its preload
  lib/image-size.ts           an imported image's size without deploying its original
  lib/is-url.ts               the href guard + new-tab linkAttrs, shared by
                              ProjectLinks, FooterContact, ContactCard and NewTab
  lib/prng.ts                 mulberry32, the seeded PRNG behind the generated art
  lib/skills-data.ts          the skills graph's content (hubs, skills, colours, ring)
  lib/skills-layout.ts        build-time force layout
  lib/skills-checks.ts        its overlap / crossing / clearance asserts (fail the build)
  lib/skills-geometry.ts      box overlap, segment-to-box distance, segment crossing
  lib/skills-metrics.ts       label and node sizes shared by the layout and the renderer
  lib/starfield-data.ts       seeded star layers (as box-shadow lists) and meteors
  lib/timecode.ts             the Experience timeline's cosmetic timecode
  pages/index.astro           the whole site: one page, anchored sections
  pages/404.astro             the not-found page
  scripts/                    boot-*.ts, footer-scrub.ts, hero-dissolve.ts, nav.ts,
                              experience-timeline.ts, experience-scrub.ts,
                              experience-playhead.ts, about-reveal.ts,
                              skills-graph.ts, skills-sim.ts, skills-keys.ts,
                              engage.ts, magnetic.ts,
                              offscreen-pause.ts
  styles/global.css           all design tokens and base element styles
  styles/utilities.css        the shared .label / .meta / .shell / .planned / .halo /
                              .visually-hidden(-wide) utilities
  styles/theme-light.css      the section-scoped light theme
public/                       static files: resume.pdf, og.png (share image), favicon.svg
                              + favicon-32 / icon-192 / apple-touch-icon PNGs, robots.txt,
                              sitemap.xml — the images generated once (SESSION.md, increment 32)
```

The accent is crimson, fixed since increment 29; there is no accent switch.
