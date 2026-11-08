import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Treat empty optional fields (null / "") as missing.
const blank = (value) => (value === null || value === "" ? undefined : value);
const optionalText = z.preprocess(blank, z.string().optional());
const optionalDate = z.preprocess(blank, z.coerce.date().optional());

// One Markdown file per post in src/content/blog/ (written by the studio at
// /admin during `npm run dev`, or by hand). The file name is the URL:
// src/content/blog/my-post.md → /blogs/my-post
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    /** Publish date, e.g. 2026-03-12. Newest posts are listed first. */
    date: z.coerce.date(),
    /** Optional "last updated" date. */
    updated: optionalDate,
    /** Cover image: an upload in public/blog/ (e.g. /blog/x.jpg) or an https URL. */
    cover: optionalText,
    /** Older name for an https cover; `cover` wins when both are set. */
    coverUrl: optionalText,
    coverAlt: optionalText,
    /** Set by the studio's cropper so the cover keeps its chosen ratio. */
    coverWidth: z.preprocess(blank, z.number().int().positive().optional()),
    coverHeight: z.preprocess(blank, z.number().int().positive().optional()),
    /** Studio bookkeeping: stable id + "was published before" flag. */
    studioId: optionalText,
    studioPublished: z.preprocess(blank, z.boolean().optional()),
    /** Optional, e.g. "6 min read". Calculated from the text when left out. */
    readingTime: optionalText,
    /** Drafts are skipped everywhere (pages, home, RSS, sitemap). */
    draft: z.preprocess(blank, z.boolean().default(false)),
  }),
});

export const collections = { blog };
