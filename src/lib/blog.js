import { getCollection } from "astro:content";
import { estimateReadingTime } from "./format";

export { formatPostDate } from "./format";

/** Plain post object in the shape the views expect. */
function toPost(entry) {
  const { data } = entry;
  return {
    id: entry.id,
    slug: entry.id,
    title: data.title,
    excerpt: data.excerpt,
    coverUrl: data.cover || data.coverUrl || "",
    coverAlt: data.coverAlt || data.title,
    coverWidth: data.coverWidth ?? null,
    coverHeight: data.coverHeight ?? null,
    publishedAt: data.date.toISOString(),
    updatedAt: (data.updated || data.date).toISOString(),
    readingTime: data.readingTime || estimateReadingTime(entry.body || ""),
  };
}

/** Published posts (drafts excluded), newest first. */
export async function getPublishedPosts() {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries
    .map(toPost)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}
