# Meer Tahmid — Portfolio + Blog

Astro 7 portfolio (React islands) with a Markdown blog, built as a fully
static site and deployed to **Vercel**.

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
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:4321
```

### Environment variables (build time)

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Optional override of the site URL (default `https://meer.men`, set as `site` in `astro.config.mjs`) |
| `PUBLIC_GITHUB_USERNAME` | Optional override for the contribution graph (default `tahmidly`) |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Astro dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Deployment (Vercel)

The site is fully static (`dist/`). Vercel detects Astro automatically
(build `npm run build`, output `dist`); Node 22 comes from `engines` in
`package.json`. No environment variables are required.

1. vercel.com → Add New → Project → import `tahmidly/portfolio` → Deploy.
2. Every push to `main` redeploys.
3. Project → Settings → Domains → add `meer.men` (and `www.meer.men`), then
   add the DNS records Vercel shows at your domain registrar.
4. Submit `https://meer.men/sitemap.xml` in Google Search Console.

## Structure

```
astro.config.mjs          site URL, React, Tailwind, prefetch, studio
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
