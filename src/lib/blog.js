import { getCollection } from "astro:content";
import { estimateReadingTime, formatPostDate } from "./format";

export { formatPostDate };

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

/**
 * A post as a row of the RecentWriting list (homepage and /blogs). The
 * thumbnail is small, so Unsplash covers are requested at 320px.
 */
export function toListPost(post) {
  const cover = post.coverUrl?.includes("images.unsplash.com")
    ? post.coverUrl.replace(/([?&])w=\d+/, "$1w=320")
    : post.coverUrl;
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt,
    date: formatPostDate(post.publishedAt),
    cover,
    coverAlt: post.coverAlt || post.title,
  };
}

/** Published posts (drafts excluded), newest first. */
export async function getPublishedPosts() {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries
    .map(toPost)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}
