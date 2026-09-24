/**
 * The hero cutout's renditions (PRD §5.2, increment 32), defined once for
 * Hero.astro's <Image> and the <link rel="preload"> index.astro puts in the
 * head: the same src, widths and format hash to the same files, so the
 * preload fetches exactly what the <img> then uses. 660w is new: a 2× phone
 * (88vw of 375 = 330px) used to jump from 470w straight to 923w. `sizes`
 * follows the subject's own breakpoint — 88vw below 640px, 470px from
 * there (Hero.astro).
 */
import { getImage } from "astro:assets";
import subject from "../assets/hero-subject.png";
import { imageSize } from "./image-size";

export const heroWidths = [470, 660, 923];
export const heroSizes = "(min-width: 640px) 470px, 88vw";

export const heroPreload = await getImage({ src: subject, widths: heroWidths, sizes: heroSizes });

/** Height over width, for the layout maths in Hero.astro and Wordmark.astro. */
export const heroRatio = (() => {
  const { width, height } = imageSize(subject);
  return height / width;
})();
