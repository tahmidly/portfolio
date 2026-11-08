// PUBLIC_SITE_URL is inlined at build time (set it in .env / the build env).
export const SITE_URL = (
  import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321"
).replace(/\/$/, "");

export const AUTHOR = "Meer Tahmid";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
