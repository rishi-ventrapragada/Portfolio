/**
 * An imported image's width and height, read without telling Astro its
 * original file is used (increment 32). Astro ships the untouched original
 * of any imported image whose metadata a component reads — a Proxy records
 * every property access except `clone` and `fsPath` — so reading `.width`
 * for an aspect ratio deployed the 1.07 MB hero PNG and the Recurzn
 * placeholder, which nothing ever requests. `clone` is the copy Astro's own
 * getImage() reads through (astro/dist/assets/internal.js). Were it ever
 * removed, this falls back to the proxy: the originals would ship again,
 * nothing would break.
 */
export function imageSize(image: ImageMetadata): { width: number; height: number } {
  const { width, height } = (image as ImageMetadata & { clone?: ImageMetadata }).clone ?? image;
  return { width, height };
}
