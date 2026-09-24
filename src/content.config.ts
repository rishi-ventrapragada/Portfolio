import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// `z` re-exported from astro:content is deprecated in Astro 7.
import { z } from "astro/zod";

// PRD §6. Astro 7 uses the Content Layer API, so this file must live at
// src/content.config.ts — src/content/config.ts throws LegacyContentConfigError.
//
// Entries are data-only JSON as of increment 6: nothing renders a body.
// `image()` resolves `cover` relative to the entry file, so it goes through
// <Image>.
const projects = defineCollection({
  // `base` + a bare `*.json` pattern makes the generated id the filename, so
  // `entry.id` is the slug. The pattern also keeps co-located cover images out
  // of the collection.
  loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        // Optional so a planned entry can be a title and nothing else. The
        // refinement below makes summary, stack and cover required for every
        // other status, so a shipped project can never silently render empty
        // (CLAUDE.md §7).
        summary: z.string().max(140).optional(),
        stack: z.array(z.string()).optional(),
        // Never printed (PRD §5.3); "planned" dims and dashes the frame.
        status: z.enum(["live", "in-progress", "archived", "planned"]),
        year: z.number().optional(),
        // Plain strings, not URLs: a value may be a visibly marked "[TODO]"
        // placeholder per CLAUDE.md §7. ProjectLinks renders only real URLs
        // as hrefs and everything else as text.
        links: z
          .object({
            live: z.string().optional(),
            repo: z.string().optional(),
          })
          .optional(),
        // A planned entry has none: its frame shows a slate (PRD §5.3).
        cover: image().optional(),
        order: z.number(),
      })
      .superRefine((data, ctx) => {
        if (data.status === "planned") return;
        for (const key of ["summary", "stack", "cover"] as const) {
          if (data[key] === undefined) {
            ctx.addIssue({
              code: "custom",
              message: `${key} is required unless status is "planned"`,
              path: [key],
            });
          }
        }
      }),
});

export const collections = { projects };
