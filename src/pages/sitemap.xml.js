import { getPublishedPosts } from "../lib/blog";
import { getPublishedWorks } from "../lib/works";
import { moments } from "../data/moments";
import { pageUrl } from "../lib/site";

// Every public page, so Google can find them all: the main pages, each
// project, each blog post and each Photobook moment. Addresses end in "/"
// to match the canonical links. (Google ignores changefreq/priority, so only
// the address and the last-changed date are listed.)
const entry = ({ path, lastModified }) => `  <url>
    <loc>${pageUrl(path)}</loc>${
      lastModified ? `\n    <lastmod>${new Date(lastModified).toISOString()}</lastmod>` : ""
    }
  </url>`;

export const GET = async () => {
  const [posts, works] = await Promise.all([getPublishedPosts(), getPublishedWorks()]);
  const newestPost = posts[0]?.updatedAt;

  const urls = [
    { path: "/" },
    { path: "/about" },
    { path: "/works", lastModified: works[0]?.date },
    { path: "/blogs", lastModified: newestPost },
    { path: "/photobook", lastModified: moments[0] && `${moments[0].date}T12:00:00Z` },
    // Velox's own website (static files in public/velox/).
    { path: "/velox" },
    ...works.map((work) => ({ path: `/projects/${work.slug}`, lastModified: work.date })),
    ...posts.map((post) => ({ path: `/blogs/${post.slug}`, lastModified: post.updatedAt })),
    ...moments.map((moment) => ({
      path: `/photobook/${moment.slug}`,
      lastModified: `${moment.date}T12:00:00Z`,
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
