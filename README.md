# Meer Tahmid — Portfolio + Blog

Next.js 16 (App Router) portfolio with a database-backed blog and a private
writing studio at `/admin`.

- **Database:** Neon Postgres, queried with Drizzle ORM over Neon's HTTP driver
  (`src/lib/db`). SQL migrations live in `db/migrations`.
- **Auth:** single owner, password only. A signed, httpOnly session cookie
  (`mt_session`, HMAC-SHA256 with `AUTH_SECRET`). Checked in `src/proxy.js`
  *and* again in every admin page, server action, route handler and admin data
  function.
- **Uploads:** cover images are validated (JPEG/PNG/WebP by magic bytes, max
  4 MB) and stored on local disk in `storage/uploads`, served from `/uploads/<uuid>.<ext>`. See
  `src/lib/storage.js` to swap in Cloudflare R2 / S3.
- **Public blog:** server-rendered from the database with ISR. Tiptap JSON is
  sanitized and rendered to React elements (`src/components/PostContent.jsx`).

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run db:migrate           # create tables
npm run db:seed              # insert the 4 original posts (skips existing slugs)
npm run dev                  # http://localhost:3000, studio at /admin
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, sitemap, RSS, JSON-LD) |
| `DATABASE_URL` | Neon **pooled** connection string |
| `ADMIN_PASSWORD` | Studio login password |
| `AUTH_SECRET` | 32+ random bytes for signing the session cookie |
| `NEXT_PUBLIC_GITHUB_USERNAME` | Optional, for the contribution graph |

Never commit `.env.local` (it is git-ignored).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Applies new `db/migrations/*.sql` files once each (tracked in `_migrations`) |
| `npm run db:seed` | Seeds the original posts from `src/data` (legacy). `-- --force` overwrites them |
| `npm run build` | Production build (needs `DATABASE_URL` — published posts are prerendered) |

To change the schema, add a new numbered `.sql` file in `db/migrations`
(separate statements with `--> statement-breakpoint`) and update
`src/lib/db/schema.js` to match.

## Publishing flow

1. `/admin` → **New post** creates a draft row and opens the editor.
2. Edits autosave ~600 ms after you stop typing (`Saving…` / `Saved` / `Save failed`).
   The open post is kept in the URL (`?post=<id>`), so a refresh reopens it.
3. **Publish** validates title, slug, excerpt, cover, cover alt text and body,
   sets `published_at` the first time, and revalidates `/`, `/blogs`,
   `/blogs/<slug>`, `/sitemap.xml` and `/blogs/rss.xml` — live immediately, no deploy.
4. **Unpublish** hides the post (404, removed from sitemap/RSS) but keeps its date.
5. Changing the slug of a post that was ever published stores the old slug in
   `post_slug_redirects`; `/blogs/<old>` then 308-redirects to the new URL.
   Duplicate slugs get `-2`, `-3`, … appended.
6. Drafts can be previewed (signed in only) at `/admin/preview/<id>`.

## Deployment (Vercel or any Node host)

1. Set every variable from the table above in the host's environment settings
   (`NEXT_PUBLIC_SITE_URL` = your real domain).
2. Run `npm run db:migrate` against the production database once.
3. Deploy. `next build` reads published posts to prerender them.
4. **Uploads:** local disk does not persist on Vercel/serverless. Before
   uploading covers in production, replace `saveImage`/`readImage` in
   `src/lib/storage.js` with Cloudflare R2 (S3 API) and add the bucket's host to
   `images.remotePatterns` in `next.config.mjs`.
5. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Structure

```
db/migrations/            SQL migrations (source of truth for the schema)
scripts/migrate.mjs       migration runner
scripts/seed.mjs          seeds the 4 original posts
src/proxy.js              optimistic /admin + /api/admin gate
src/lib/db/               Drizzle schema + Neon client (server-only)
src/lib/posts.js          all post queries; admin functions enforce auth
src/lib/auth.js           session + password check (server-only)
src/lib/content.js        slugify, Tiptap sanitizer, reading time (shared)
src/lib/storage.js        upload storage (local disk today)
src/app/admin/            studio, login, preview, server actions
src/app/api/admin/upload  cover upload endpoint
src/app/uploads/[name]    serves local uploads
src/app/blogs/            public list, post pages, RSS
src/components/PostContent.jsx  server renderer for post bodies
src/data/                 legacy static content (only used by the seed)
```
