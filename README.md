# Portfolio

Personal portfolio of Sai Rishi Ventrapragada — a dark, editorial single-page site
with a magazine-cover hero, built to show shipped work to recruiters, GDG organizers
and hackathon teammates.

`PRD.md` is the product spec. `CLAUDE.md` is how the work gets done. `SESSION.md`
carries the handoff between sessions. `ASSETS.md` logs every non-code asset.

## Stack

- **Astro 7** — static output, TypeScript strict, no integrations
- **Tailwind v4** via `@tailwindcss/vite` — layout and spacing only; distinctive
  visual work lives in scoped `<style>` blocks
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
  components/                 Nav, Hero, Wordmark, About, AboutPanel, TechStack, Pills,
                              ProjectsSection, ProjectFrame, ProjectDetail,
                              ProjectLinks,
                              ExperienceTimeline, ExperienceFrame, ExperienceTrack,
                              ExperienceClip,
                              Footer, FooterContact, BootPreloader, BootSquare,
                              AccentToggle (dev only)
  content/projects/*.json     one data file per project, beside its cover image
  content.config.ts           the projects collection schema
  layouts/BaseLayout.astro    head, fonts, landmarks
  lib/is-url.ts               the href guard shared by ProjectLinks and FooterContact
  pages/index.astro           the whole site: one page, anchored sections
  scripts/                    boot-*.ts, credits-roll.ts, hero-dissolve.ts, nav.ts,
                              experience-timeline.ts, experience-scrub.ts,
                              experience-playhead.ts
  styles/global.css           all design tokens
```

The accent toggle bottom-right is dev-only and disappears from production builds;
it exists to choose between crimson and violet on the live site.
