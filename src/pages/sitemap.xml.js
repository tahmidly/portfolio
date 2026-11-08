import { getPublishedPosts } from "../lib/posts";
import { SITE_URL } from "../lib/site";

const entry = ({ url, lastModified, changeFrequency, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export const GET = async () => {
  const posts = await getPublishedPosts();
  const newestUpdate = new Date(
    posts.reduce(
      (max, post) => Math.max(max, new Date(post.updatedAt).getTime()),
      posts[0]?.updatedAt ? new Date(posts[0].updatedAt).getTime() : Date.now(),
    ),
  );

  const urls = [
    { url: SITE_URL, lastModified: newestUpdate, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blogs`, lastModified: newestUpdate, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blogs/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
