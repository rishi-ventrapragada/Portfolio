# PRD.md — Portfolio

Product requirements for the personal portfolio of Sai Rishi Ventrapragada. Owned by Rishi, maintained from the planning chat. Claude Code implements from this document; CLAUDE.md governs how.

Status legend: `[now]` build in the current phase, `[next]` planned, `[later]` parked. Increments are listed in §10.

## 1. Purpose

A single place that shows what Rishi builds and how he works, for three audiences at once: internship recruiters, GDG and community organizers, and hackathon teammates. It must be fast, honest, and clearly his, not a template.

Success looks like: a recruiter understands who he is in 10 seconds on the homepage, can open a live demo of a project in one click, and can download a résumé in one click.

## 2. Audience and goals

| Audience | What they need in the first minute |
| --- | --- |
| Internship recruiters | Role, stack, two shipped projects, résumé link |
| GDG / community | Evidence of community work, comfort with video and content |
| Hackathon teammates | What he owns end to end, what he is currently building |

## 3. Site map

- `/` Home: hero, project tiles, "currently building" strip, short about teaser, contact
- `/projects` Index generated from the projects content collection
- `/projects/kalacart`, `/projects/life-os`, `/projects/aegis` Case studies (MDX)
- `/about` Story, how he works, skills grouped by what shipped with them, résumé download
- `/community` GDG on Campus VJIT work, events, media
- Contact is a section on Home and in the footer, not a separate page `[now]`

## 4. Design system

### 4.1 Direction
Dark editorial. Magazine-cover hero (full-width wordmark behind a cutout subject), lots of negative space, small uppercase mono labels, one accent color used sparingly. Not neon, not glassmorphism, no 3D scenes.

### 4.2 Tokens (single source in `src/styles/global.css`)

```
--bg:        #111214   page background
--bg-raised: #1a1b1e   cards, nav after scroll
--fg:        #ffffff   body text
--fg-muted:  #9a9ca3   secondary text, meta labels
--line:      #2a2b30   hairlines, dividers
--heading:   #f2f2f2   large headings and wordmarks

Accent, switched by data-accent on <html>:
  crimson (default): --accent: #ff3b5c; --accent-soft: rgba(255,59,92,0.18)
  violet:            --accent: #a78bfa; --accent-soft: rgba(167,139,250,0.18)

--font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif   (weights 500, 700)
--font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, monospace (weights 400, 500)
```

Usage: big headings `--heading`; side headings, eyebrows, labels, active nav, link hover `--accent`; body `--fg`; secondary `--fg-muted`.

### 4.3 Type scale
- Wordmark: `clamp(6rem, 22vw, 20rem)`, weight 700, letter-spacing -0.04em, line-height 0.85
- H1 (page titles): `clamp(2.5rem, 6vw, 5rem)`, weight 700, letter-spacing -0.02em
- H2 (section): `clamp(1.75rem, 3.5vw, 2.75rem)`, weight 700
- Side heading / eyebrow: 12px mono, uppercase, letter-spacing 0.12em, `--accent`
- Body: 16-18px, line-height 1.6, `--fg`
- Meta / caption: 11-12px mono, uppercase, letter-spacing 0.12em, `--fg-muted`

### 4.4 Layout
- Max content width 1280px, 24px gutters on mobile, 48px on desktop
- Grid: 12 columns desktop, 4 columns mobile
- Section vertical rhythm: 96px desktop, 64px mobile
- Nav fixed, 64px tall, transparent over hero, `--bg-raised` with 1px `--line` bottom border after scrolling past the hero

### 4.5 Motion principles
- Motion explains structure or rewards scroll; it never blocks reading.
- Scroll-driven CSS animations first, script fallback second, libraries never (at launch).
- Every effect has a reduced-motion branch. Pointer effects only on fine pointers.
- Page transitions via Astro View Transitions, default crossfade, 200ms.

## 5. Component spec

### 5.1 Nav `[now]`
Fixed top bar, three-column grid on desktop, two on mobile.
- Left: `RISHI ©` (mono label, `--fg`)
- Center (desktop only): two stacked mono labels `PORTFOLIO 01` / `MMXXVI`
- Right: stacked `CSE · DATA SCIENCE` / `HYDERABAD, IN`, then a two-line hamburger `<button aria-expanded aria-controls>`. Menu behaviour is `[next]`; the button exists now.
- Active route label uses `--accent`.

### 5.2 Hero `[now]`
100dvh, background `--bg`, three layers.

Layer A, wordmark: `RISHI` in `--font-display` 700, full-width per §4.3, color `--heading`. Wrapper is `position: sticky; top: 0` inside the hero, z-index 1.

Layer B, subject: transparent-background PNG cutout at `src/assets/hero-subject.png`, z-index 2, centered horizontally, bottom-aligned to the hero, sized so its top overlaps the lower half of the wordmark. Loaded via `<Image>`, eager, explicit dimensions. Placeholder: generated abstract silhouette until the real cutout is supplied `[TODO asset]`.

Layer C, caption: bottom-left, three mono lines, first line in `--accent`, rest `--fg-muted`:
```
BUILDING FOR THE WEB
REACT · ASTRO · SUPABASE
KALACART · LIFE OS · AEGIS
```

Scroll behaviour over the first 40% of the hero's height:
- Wordmark: opacity 1 → 0, translateY 0 → -8%, blur 0 → 8px. Dissolves in place.
- Caption: opacity 1 → 0, scrolls naturally.
- Subject: no transform, scrolls naturally.
- Implementation: `animation-timeline: scroll()` / `view()` with `animation-range`; fallback script sets `--hero-progress` (0-1) via `requestAnimationFrame`, enabled only when `CSS.supports('animation-timeline: scroll()')` is false.
- Reduced motion: opacity fade only.
- Mobile: wordmark still full width, subject scaled to fit height, caption clear of the safe area.

### 5.3 Project tiles `[next]`
Three large tiles on Home, one per project, each with: eyebrow (`--accent`, project type), title, one-line summary, stack labels, a muted looping demo video (WebM + MP4, poster image, autoplay muted playsinline, paused under reduced motion), and a link to the case study. Data comes from the projects collection.

### 5.4 Currently building strip `[next]`
Horizontal marquee or static row of mono labels reading from `src/content/now.json` (project, one-line status, date). Marquee pauses on hover and is static under reduced motion.

### 5.5 Case study page `[next]`
MDX with frontmatter: `title, summary, role, stack[], status, year, links{live, repo}, video, cover`. Sections in order: hero (title, meta row, cover video or image), Context, What I built, Decisions and trade-offs, What broke and what I learned, Outcome, Links. Sidebar on desktop with meta and a sticky table of contents.

### 5.6 About `[next]`
Photo, 3-4 line story, "How I work" (product-owner approach, architecture-first, AI-assisted implementation, security auditing), skills grouped by shipped-with (frontend, backend and data, languages) where each skill links to the project it was used in, "Currently learning" line, GDG one-liner, résumé download button.

### 5.7 Community `[later]`
GDG on Campus VJIT production team work, event media, links.

### 5.8 Footer and contact `[now, minimal]`
Email link (`mailto`), GitHub, LinkedIn, résumé. Mono labels. No form at launch.

### 5.9 Dev accent toggle `[now, dev only]`
Fixed 28px pill bottom-right, rendered only when `import.meta.env.DEV`, flips `data-accent` between crimson and violet, remembers in localStorage. Removed once a final accent is chosen.

## 6. Content model

`src/content/projects/*.mdx` with schema:
```
title: string
slug: string
summary: string (max 140 chars)
role: string
stack: string[]
status: "live" | "in-progress" | "archived"
year: number
links: { live?: url, repo?: url }
video?: { webm: string, mp4: string, poster: string }
cover: image
order: number
```
`src/content/now.json`: array of `{ project, status, date }`.

## 7. Assets

- Hero subject: transparent PNG, ~1200x1600, real cutout to be supplied by owner `[TODO]`.
- Demo videos: under 8 seconds, 1080p max, WebM (VP9) + MP4 (H.264), poster JPG, muted. `[TODO]`
- Résumé: `public/resume.pdf` `[TODO]`
- Every external asset logged in `ASSETS.md` with source and license.

## 8. Non-functional requirements

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95 on mobile.
- Client JS ≤ 40 KB gzipped per page at launch.
- Largest Contentful Paint ≤ 2.0s on a mid-range Android over 4G (hero image is the LCP element; keep it under 250 KB).
- Works without JavaScript except the scroll dissolve and accent toggle.
- Per-page metadata and Open Graph image; dynamic OG images per case study `[next]`.
- Analytics: Vercel Analytics or Umami `[next]`.

## 9. Out of scope

- CMS, database, authentication, contact form, comments, blog (blog may become `[later]` after launch).
- Heavy 3D or WebGL backgrounds.
- Any theme beyond dark with two accents.

## 10. Increments

1. `[now]` Scaffold, tokens, fonts, BaseLayout, Nav, Hero, placeholder section, footer, dev accent toggle, Vercel deploy.
2. `[next]` Projects collection with three entries, project tiles on Home, `/projects` index.
3. `[next]` Case study template and KalaCart write-up.
4. `[next]` Life OS and AEGIS case studies, demo videos.
5. `[next]` About page, résumé, OG images, analytics.
6. `[next]` Hamburger menu and mobile nav, "currently building" strip.
7. `[later]` Community page, external component adoption (per CLAUDE.md §6), reference-site pattern pass.

## 11. Open decisions

- Final accent: crimson vs violet, decided by eye on the live site.
- Hero subject: photo cutout vs rendered object.
- Custom domain name.
