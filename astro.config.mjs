// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://rishi-ventrapragada.vercel.app",
  output: "static",
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        // Astro generates `"use astro:head-inject"` in the module it builds for
        // every content-collection entry with propagated assets (MDX). Rolldown
        // warns that it cannot preserve an unknown directive; Astro reads the
        // marker itself at build time and never needs it in the bundle, so the
        // warning is noise. Scoped to that generated module so a directive
        // warning from our own source still surfaces. CLAUDE.md §1.3.
        onwarn(warning, defaultHandler) {
          const isAstroPropagatedAssets =
            warning.code === "MODULE_LEVEL_DIRECTIVE" &&
            warning.id?.includes("astroPropagatedAssets");
          if (isAstroPropagatedAssets) return;
          defaultHandler(warning);
        },
      },
    },
  },
  // PRD 4.2 — self-hosted through Astro's Fonts API, never a <link> to Google.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-display-src",
      weights: [500, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono-src",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "SFMono-Regular", "monospace"],
    },
  ],
});
