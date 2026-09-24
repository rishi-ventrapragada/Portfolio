/**
 * The hero cutout's renditions (PRD §5.2, increment 32), defined once for
 * Hero.astro's <Image> and the <link rel="preload"> index.astro puts in the
 * head: the same src, widths and format hash to the same files, so the
 * preload fetches exactly what the <img> then uses. 660w is new: a 2× phone
 * (88vw of 375 = 330px) used to jump from 470w straight to 923w. `sizes`
 * follows the subject's own breakpoint — 88vw below 640px, 470px from
 * there (Hero.astro). Increment 32.1: an AVIF set beside the WebP one
 * (`<Picture>`), and the preload names the AVIF set — the format every
 * browser that can use it will pick; its `type` makes the others skip it.
 */
import { getImage } from "astro:assets";
import subject from "../assets/hero-subject.png";
import { imageSize } from "./image-size";

export const heroWidths = [470, 660, 923];
export const heroSizes = "(min-width: 640px) 470px, 88vw";
/** The <Picture>'s formats, best first; WebP is also the <img> fallback. */
export const heroFormats = ["avif", "webp"] as const;

export const heroPreload = await getImage({ src: subject, widths: heroWidths, sizes: heroSizes, format: "avif" });

/** Height over width, for the layout maths in Hero.astro and Wordmark.astro. */
export const heroRatio = (() => {
  const { width, height } = imageSize(subject);
  return height / width;
})();
