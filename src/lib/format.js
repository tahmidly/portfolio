// Dependency-free helpers for blog posts (dates, slugs, reading time).

/** "March 12, 2026" (UTC, so the calendar date never shifts). */
export function formatPostDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Plain text of a Markdown body (good enough for word counts). */
export function markdownToText(markdown = "") {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~=|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadingTime(markdown = "") {
  const words = markdownToText(markdown).split(" ").filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
