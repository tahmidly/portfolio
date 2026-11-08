# Meer Tahmid — Portfolio + Blog

Astro 7 portfolio (React islands) with a database-backed blog and a private
writing studio at `/admin`, deployed to **Cloudflare Workers**.

- **Rendering:** every page renders on request (`output: "server"`). Public
  pages (`/`, `/blogs`, `/blogs/<slug>`, RSS, sitemap) are edge-cached by
  Astro's route cache (`routeRules` in `astro.config.mjs`, Cloudflare cache
  provider). Publishing, editing or deleting a post purges the `posts` cache
  tag, so changes are live immediately. The cache is off in `astro dev`.
- **Navigation:** `<ClientRouter />` swaps pages without a full reload and
  prefetches links on hover. The navbar persists across pages.
- **Database:** Neon Postgres, queried with Drizzle ORM over Neon's HTTP driver
  (`src/lib/db`). SQL migrations live in `db/migrations`.
- **Auth:** single owner, password only. A signed, httpOnly session cookie
  (`mt_session`, HMAC-SHA256 with `AUTH_SECRET`). `src/middleware.js` verifies
  it, gates `/admin` + `/api/admin`, and runs the request inside an
  AsyncLocalStorage scope so the data layer (`src/lib/posts.js`) re-checks auth
  on every admin query.
- **Uploads:** cover images are validated (JPEG/PNG/WebP by magic bytes, max
  4 MB), stored in the R2 bucket bound as `UPLOADS`, and served from
  `/uploads/<uuid>.<ext>`.
- **Public blog:** Tiptap JSON is sanitized and rendered to static HTML
  (`src/components/PostContent.jsx`).

## Local setup

Requires Node 22.12+.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run db:migrate           # create tables
npm run db:seed              # insert the 4 original posts (skips existing slugs)
npm run dev                  # http://localhost:4321, studio at /admin
```

`astro dev` runs on Cloudflare's `workerd` runtime. Secrets are read from
`.env.local` (or `.dev.vars`), and the R2 bucket is emulated on disk under
`.wrangler/state`.

### Environment variables

| Variable | When | Purpose |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | build | Canonical site URL (meta, sitemap, RSS, JSON-LD) |
| `PUBLIC_GITHUB_USERNAME` | build | Optional, for the contribution graph |
| `DATABASE_URL` | runtime secret | Neon **pooled** connection string |
| `ADMIN_PASSWORD` | runtime secret | Studio login password |
| `AUTH_SECRET` | runtime secret | 32+ random bytes for signing the session cookie |

Never commit `.env.local` or `.dev.vars` (both are git-ignored).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Astro dev server (workerd) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally in workerd |
| `npm run deploy` | Build and `wrangler deploy` |
| `npm run db:migrate` | Applies new `db/migrations/*.sql` files once each (tracked in `_migrations`) |
| `npm run db:seed` | Seeds the original posts from `src/data` (legacy). `-- --force` overwrites them |

To change the schema, add a new numbered `.sql` file in `db/migrations`
(separate statements with `--> statement-breakpoint`) and update
`src/lib/db/schema.js` to match.

## Publishing flow

1. `/admin` → **New post** creates a draft row and opens the editor.
2. Edits autosave ~600 ms after you stop typing (`Saving…` / `Saved` / `Save failed`).
   The open post is kept in the URL (`?post=<id>`), so a refresh reopens it.
3. **Publish** validates title, slug, excerpt and body, sets `published_at` the
   first time, and purges the cached public pages — live immediately, no deploy.
4. **Unpublish** hides the post (404, removed from sitemap/RSS) but keeps its date.
5. Changing the slug of a post that was ever published stores the old slug in
   `post_slug_redirects`; `/blogs/<old>` then 308-redirects to the new URL.
   Duplicate slugs get `-2`, `-3`, … appended.
6. Drafts can be previewed (signed in only) at `/admin/preview/<id>`.

## Deployment (Cloudflare Workers)

1. `npx wrangler login`
2. Create the uploads bucket once: `npx wrangler r2 bucket create meer-tahmid-uploads`
   (name must match `wrangler.jsonc`).
3. Set the runtime secrets:
   `npx wrangler secret put DATABASE_URL` (repeat for `ADMIN_PASSWORD`, `AUTH_SECRET`).
4. Set `PUBLIC_SITE_URL` (and optionally `PUBLIC_GITHUB_USERNAME`) in the build
   environment, e.g. `.env` locally or the Workers Builds settings.
5. Run `npm run db:migrate` against the production database once.
6. `npm run deploy`.
7. Existing covers uploaded with the old Next.js app live in `storage/uploads`;
   copy them into R2 with
   `npx wrangler r2 object put meer-tahmid-uploads/<file> --file storage/uploads/<file> --remote`.
8. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Structure

```
db/migrations/            SQL migrations (source of truth for the schema)
scripts/                  migration runner + seed
astro.config.mjs          adapter, React, Tailwind, prefetch, route cache rules
wrangler.jsonc            Worker name, nodejs_compat, R2 binding
src/middleware.js         session check, /admin + /api/admin gate, auth scope
src/layouts/BaseLayout.astro  <head>, SEO tags, ClientRouter, navbar
src/pages/                routes: home, blogs, posts, studio, API, feeds
src/components/           React components (islands where interactive)
src/views/                page-level React views (blog list/post, studio, 404)
src/lib/db/               Drizzle schema + Neon client
src/lib/posts.js          all post queries; admin functions enforce auth
src/lib/auth.js           request auth scope + password check
src/lib/session.js        signed session cookie (Web Crypto)
src/lib/content.js        slugify, Tiptap sanitizer, reading time (shared)
src/lib/storage.js        R2 upload storage
src/lib/adminActions.js   studio → /api/admin/posts client
src/data/                 portfolio content (+ legacy posts used by the seed)
```
