# Portfolio

Personal portfolio of Sai Rishi Ventrapragada — a dark, editorial single-page site
with a magazine-cover hero, built to show shipped work to recruiters, GDG organizers
and hackathon teammates.

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
  components/                 Nav, Hero, Wordmark, HeroCaption, About,
                              AboutComic + AboutPanel (dormant — see SESSION.md),
                              SkillsSection, SkillsGraph, SkillNode, SkillLabel,
                              SkillsList, SkillChain, Pills,
                              ProjectsSection, ProjectFrame, ProjectDetail,
                              ProjectLinks, PlannedCard, HazardTape,
                              ExperienceTimeline, ExperienceFrame, ExperienceTrack,
                              ExperienceClip,
                              Footer, FooterStage, FooterCredits, FooterContact,
                              ContactCard, ContactIcon,
                              Divider, LoopDivider, EdgeCode, LeaderStrip,
                              ClapperStrip,
                              Starfield, StarfieldMeteors, StarfieldDefs,
                              ProjectorBeam,
                              BootPreloader, BootSquare
  content/projects/*.json     one data file per project, beside its cover image
  content.config.ts           the projects collection schema
  layouts/BaseLayout.astro    head, fonts, landmarks
  lib/film-strips.ts          the edge-code and countdown-leader seams' SVG tiles
  lib/is-url.ts               the href guard + new-tab linkAttrs, shared by
                              ProjectLinks, FooterContact and ContactCard
  lib/skills-data.ts          the skills graph's content (hubs, skills, colours, ring)
  lib/skills-layout.ts        build-time force layout + overlap / crossing / clearance asserts
  lib/skills-geometry.ts      box overlap, segment-to-box distance, segment crossing
  lib/skills-metrics.ts       label and node sizes shared by the layout and the renderer
  lib/starfield-data.ts       seeded star layers (as box-shadow lists) and meteors
  pages/index.astro           the whole site: one page, anchored sections
  scripts/                    boot-*.ts, footer-scrub.ts, hero-dissolve.ts, nav.ts,
                              experience-timeline.ts, experience-scrub.ts,
                              experience-playhead.ts, about-reveal.ts,
                              skills-graph.ts, skills-sim.ts, skills-keys.ts,
                              engage.ts, magnetic.ts,
                              offscreen-pause.ts
  styles/global.css           all design tokens and base element styles
  styles/utilities.css        the shared .label / .meta / .shell / .planned utilities
  styles/theme-light.css      the section-scoped light theme
```

The accent is crimson, fixed since increment 29; there is no accent switch.
