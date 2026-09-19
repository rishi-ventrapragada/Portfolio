import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// `z` re-exported from astro:content is deprecated in Astro 7.
import { z } from "astro/zod";

// PRD §6. Astro 7 uses the Content Layer API, so this file must live at
// src/content.config.ts — src/content/config.ts throws LegacyContentConfigError.
//
// Entries are frontmatter-only JSON as of increment 6: the case study route is
// gone, nothing renders a body, and MDX would be overhead. `image()` still
// resolves `cover` relative to the entry file, so it goes through <Image>.
const projects = defineCollection({
  // `base` + a bare `*.json` pattern makes the generated id the filename, so
  // `entry.id` is the slug. The pattern also keeps co-located cover images out
  // of the collection.
  loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(140),
      stack: z.array(z.string()),
      status: z.enum(["live", "in-progress", "archived"]),
      year: z.number(),
      // Plain strings, not URLs: `repo` holds a visibly marked "[TODO]"
      // placeholder per CLAUDE.md §7. ProjectCard renders only real URLs as
      // hrefs and everything else as text.
      links: z.object({
        live: z.string().optional(),
        repo: z.string().optional(),
      }),
      cover: image(),
      order: z.number(),
    }),
});

export const collections = { projects };
