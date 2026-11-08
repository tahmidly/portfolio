import { getCollection } from "astro:content";
import featured from "../data/featured.json";
import { placeholderFor } from "../components/CoverImage.jsx";
import { layoutFor, spanClass } from "./featuredLayouts";

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
