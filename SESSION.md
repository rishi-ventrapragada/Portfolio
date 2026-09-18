# SESSION.md

Handoff notes per CLAUDE.md §8. Newest session at the top.

## 2026-09-19

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
- **Pretty free URL**: blocked by the above, not by naming. Once protection is off, run
  `vercel alias set <latest-deployment-url> rishi-ventrapragada.vercel.app` and re-check that
  the page title is the portfolio, not "Login – Vercel" — an alias can report success without
  actually serving your site while protection is on.
- **Custom domain** (PRD §11): not touched, and no domain was purchased or registered. The
  `.vercel.app` URLs are Vercel's free auto-generated ones. Owner adds any custom domain
  in the dashboard.
- **Hamburger menu**: the button is rendered `disabled` with `aria-expanded="false"`
  per PRD §5.1; behaviour is increment 6.
- **Firefox**: `animation-timeline: scroll()` is still behind a flag as of Firefox 152,
  so the rAF fallback in `Hero.astro` is the live path there. Worth eyeballing in Firefox.
