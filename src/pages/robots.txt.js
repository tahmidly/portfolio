import { SITE_URL } from "../lib/site";

export const GET = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Host: ${SITE_URL}
Sitemap: ${SITE_URL}/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
