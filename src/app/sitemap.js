import { getPublishedPosts } from "../lib/posts";
import { SITE_URL } from "../lib/site";

export const revalidate = 60;

export default async function sitemap() {
  const posts = await getPublishedPosts();
  const latest = posts[0]?.updatedAt ? new Date(posts[0].updatedAt) : new Date();
  const newestUpdate = posts.reduce(
    (max, post) => Math.max(max, new Date(post.updatedAt).getTime()),
    latest.getTime(),
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(newestUpdate),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: new Date(newestUpdate),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blogs/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
