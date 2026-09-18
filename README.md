# Portfolio

Personal portfolio of Sai Rishi Ventrapragada — a dark, editorial single-page site
with a magazine-cover hero, built to show shipped work to recruiters, GDG organizers
and hackathon teammates.

`PRD.md` is the product spec. `CLAUDE.md` is how the work gets done. `SESSION.md`
carries the handoff between sessions.

## Stack

- **Astro 7** — static output, TypeScript strict
- **Tailwind v4** via `@tailwindcss/vite` — layout and spacing only; distinctive
  visual work lives in scoped `<style>` blocks
- **@astrojs/react** — installed for islands; nothing uses one yet
- **Astro Fonts API** — Space Grotesk and JetBrains Mono, self-hosted
- Motion is CSS scroll-driven animation with a `requestAnimationFrame` fallback.
  No animation libraries.

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
  assets/hero-subject.png   real cutout, 923x1435 transparent PNG
  components/               Nav, Hero, Footer, ProjectsPlaceholder, AccentToggle
  layouts/BaseLayout.astro  head, fonts, landmarks, view transitions
  pages/index.astro         home
  styles/global.css         all design tokens
```

The accent toggle bottom-right is dev-only and disappears from production builds;
it exists to choose between crimson and violet on the live site.
