import { getPublishedPosts } from "../../../lib/posts";
import { AUTHOR, SITE_URL, absoluteUrl } from "../../../lib/site";

export const revalidate = 60;

const escape = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blogs/${post.slug}`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escape(post.excerpt)}</description>${
        post.coverUrl
          ? `\n      <enclosure url="${escape(absoluteUrl(post.coverUrl))}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${AUTHOR} — Journal`)}</title>
    <link>${SITE_URL}/blogs</link>
    <description>Perspectives on design, technology, and the craft of building things.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blogs/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
