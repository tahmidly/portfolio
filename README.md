# Meer Tahmid — Portfolio + Blog

Astro 7 portfolio (React islands) with a Markdown blog, deployed to
**Cloudflare Workers** as a fully static site.

- **Blog:** one Markdown file per post in `src/content/blog/`. The file name is
  the URL: `src/content/blog/my-post.md` → `/blogs/my-post`.
- **Projects:** `src/data/portfolio.js` (`works`) feeds the home page and `/works`.
- **Rendering:** every page is prerendered to static HTML at build time.
- **Navigation:** `<ClientRouter />` swaps pages without a full reload and
  prefetches links on hover. The navbar persists across pages.

## Writing a post

Create `src/content/blog/<slug>.md`:

```md
---
title: "My new post"
excerpt: "One or two sentences shown in the list, RSS and search results."
date: 2026-11-08
cover: "/blog/my-new-post.jpg"   # optional: file in public/blog/ or an https URL
coverAlt: "What the cover shows" # optional
readingTime: "5 min read"        # optional, calculated when left out
draft: false                     # optional, true hides the post everywhere
---

Your post in Markdown. **Bold**, _italic_, [links](https://example.com),
lists, `code`, code blocks and

> quotes

## Headings

all work.
```

Newest `date` comes first. The 4 latest posts also appear in the home page
Journal section, `/blogs/rss.xml` and `/sitemap.xml`. Commit and deploy to
publish.

## Local setup

Requires Node 22.12+.

```bash
npm install
cp .env.example .env.local   # set PUBLIC_SITE_URL (optional)
npm run dev                  # http://localhost:4321
```

### Environment variables (build time)

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Canonical site URL (meta, sitemap, RSS, JSON-LD) |
| `PUBLIC_GITHUB_USERNAME` | Optional, for the contribution graph |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Astro dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run deploy` | Build and `wrangler deploy` |

## Deployment (Cloudflare Workers)

1. `npx wrangler login`
2. Set `PUBLIC_SITE_URL` (and optionally `PUBLIC_GITHUB_USERNAME`) in the build
   environment, e.g. `.env` locally or the Workers Builds settings.
3. `npm run deploy`
4. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Structure

```
astro.config.mjs          adapter, React, Tailwind, prefetch
wrangler.jsonc            Worker name and compatibility date
src/content.config.js     blog collection schema (frontmatter fields)
src/content/blog/         one .md file per post
src/layouts/BaseLayout.astro  <head>, SEO tags, ClientRouter, navbar
src/pages/                routes: home, works, blogs, posts, RSS, sitemap
src/components/           React components (islands where interactive)
src/views/                page-level React views (blog list/post, works, 404)
src/lib/blog.js           reads the blog collection, date formatting
src/data/portfolio.js     projects, gallery, stats, social links
public/                   static files (logo, video, tech icons, blog images)
```
