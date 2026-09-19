import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// `z` re-exported from astro:content is deprecated in Astro 7.
import { z } from "astro/zod";

// PRD §6. Astro 7 uses the Content Layer API, so this file must live at
// src/content.config.ts — src/content/config.ts throws LegacyContentConfigError.
const projects = defineCollection({
  // `base` + a bare `*.mdx` pattern makes the generated id the filename, so
  // `entry.id` is the slug (kalacart.mdx → /projects/kalacart). PRD §6 lists
  // `slug` as a field, but the loader derives it; see the §6 note.
  // The pattern also keeps co-located cover images out of the collection.
  loader: glob({ pattern: "*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(140),
      role: z.string(),
      stack: z.array(z.string()),
      status: z.enum(["live", "in-progress", "archived"]),
      year: z.number(),
      // Plain strings, not URLs: `repo` currently holds a visibly marked
      // "[TODO]" placeholder per CLAUDE.md §7. The case study page guards
      // against rendering a non-URL as an href.
      links: z.object({
        live: z.string().optional(),
        repo: z.string().optional(),
      }),
      // Optional — no demo videos exist yet (PRD §7). Consumers omit the
      // whole block when absent rather than render an empty player.
      video: z
        .object({ webm: z.string(), mp4: z.string(), poster: z.string() })
        .optional(),
      cover: image(),
      order: z.number(),
    }),
});

export const collections = { projects };
