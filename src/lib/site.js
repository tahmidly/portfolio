// The live site URL, from `site` in astro.config.mjs (https://meer.men).
export const SITE_URL = (import.meta.env.SITE || "https://meer.men").replace(/\/$/, "");

export const AUTHOR = "Meer Tahmid";

/** Default share image for pages without their own (256×256 logo mark). */
export const DEFAULT_OG_IMAGE = {
  url: "/logo-mark.png",
  width: 256,
  height: 256,
  alt: "Meer Tahmid logo",
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
