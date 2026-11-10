import { SITE_URL } from "../lib/site";

// Lets every search engine crawl the site and points them to the sitemap.
// (The old "Host:" line was Yandex-only; Google reports it as unknown.)
export const GET = () =>
  new Response(
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
