import { getCollection } from "astro:content";
import featured from "../data/featured.json";
import { placeholderFor } from "../components/CoverImage.jsx";
import { layoutFor, spanClass } from "./featuredLayouts";

/**
 * The bullet points under the "## What it does" heading of a project's
 * Markdown body (plain text, Markdown markers removed). Used by /works.
 */
function highlightsFrom(body = "") {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+what it does\s*$/i.test(line.trim()));
  if (start === -1) return [];
  const items = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,6}\s/.test(line.trim())) break;
    const match = line.match(/^\s*[-*]\s+(.*)$/);
    if (match) items.push(match[1].replace(/[*_`]/g, "").trim());
  }
  return items;
}

/** Plain project object in the shape the components expect. */
function toWork(entry) {
  const { data } = entry;
  return {
    id: entry.id,
    slug: entry.id,
    title: data.title,
    tag: data.tag || "",
    description: data.description,
    image: data.image || "",
    alt: data.imageAlt || data.title,
    url: data.url || "",
    date: data.date.toISOString(),
    highlights: highlightsFrom(entry.body),
    placeholder: placeholderFor(entry.id),
  };
}

/** Published projects (drafts excluded), newest first. */
export async function getPublishedWorks() {
  const entries = await getCollection("works", ({ data }) => !data.draft);
  return entries
    .map(toWork)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * The (up to) 3 projects picked for the home page, in slot order, each with
 * its grid width from the chosen layout. Unpublished or missing picks are
 * skipped.
 */
export async function getFeaturedWorks() {
  const works = await getPublishedWorks();
  const bySlug = new Map(works.map((work) => [work.slug, work]));
  const { spans } = layoutFor(featured.layout);
  return (featured.works || [])
    .slice(0, 3)
    .map((slug, index) => {
      const work = bySlug.get(slug);
      return work ? { ...work, span: spanClass(spans[index] ?? 12) } : null;
    })
    .filter(Boolean);
}
