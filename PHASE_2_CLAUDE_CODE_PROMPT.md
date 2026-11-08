# Claude Code Prompt — Phase 2: Real Dynamic Blog + Publishing

You are working in `C:\Users\Meer Tahmid\Desktop\v3`, a Next.js portfolio site with a working local-only blog studio. Implement Phase 2: replace the localStorage draft system with a real database-backed blog, authentication, image uploads, and server-rendered public posts.

Read `AGENTS.md` first. This project uses a newer Next.js than your training data, so before changing routing/data APIs, read the relevant guides in `node_modules/next/dist/docs/`. Use the App Router only.

---

## Current state (do not redo this work)

- Next.js `16.4.5` App Router, React `19.3.1`, Tailwind v4 via `@tailwindcss/postcss`, Tiptap `3.33.0`.
- Public blog:
  - `/blogs` is a server component at `src/app/blogs/page.jsx` rendering `src/views/BlogsPage.jsx`.
  - `/blogs/[slug]` is SSG at `src/app/blogs/[slug]/page.jsx`, using `generateStaticParams`, `dynamicParams = false`, `generateMetadata`, canonical URLs, and `BlogPosting` JSON-LD.
  - Content currently comes from static files: `src/data/portfolio.js` (`journalEntries`) and `src/data/journalContent.js` (`journalContent`).
  - `BlogPostPage.jsx` and `BlogsPage.jsx` are server components. Theme and HLS video are isolated in client components (`BlogThemeToggle`, `BlogsVideo`). Keep them server components.
- Admin:
  - `/admin` renders `src/views/AdminPage.jsx` (`"use client"`).
  - Posts are stored in `localStorage` under `mt_admin_posts_v1`; theme under `admin-theme`.
  - Admin has seeded the 4 existing blog posts, list/dashboard, edit/new/delete, autosave, dark/light mode.
  - Editor constraints: **no font-family or font-color controls**. Allowed: S/M/L size, bold, italic, underline, strike, inline code, fixed highlight palette, bullet/ordered lists, links, H2/H3, divider, cover upload, title, excerpt.
  - The title is an auto-growing multi-line `<textarea>`. The excerpt sits directly under the title as an unboxed subtitle field.
  - The studio sidebar is hidden in editor mode and below 900px. The New Post button is full-width on mobile.
  - `/admin` is `noindex`, disallowed in `robots.js`, and the public navbar is hidden via `SiteChrome`.
- Public typography is fixed and must not change:
  - Body: Questrial 18px / 32px.
  - H2: Bricolage Grotesque 30px / 54px / 700 / -0.6px.
  - Post title: Bricolage Grotesque 48px / 400 / -1.2px.
  - Dark text `#E5E5E5`, light text `#2D2D2D`.

The public site must not depend on `localStorage` for post content.

---

## Goal

A real publishing workflow:

1. Posts live in a database.
2. `/admin` is protected by authentication.
3. Creating/editing/publishing a post in `/admin` makes it available at `/blogs/<slug>` without a code deploy.
4. Public blog pages are rendered on the server from the database, with correct metadata, JSON-LD, sitemap entries, and draft protection.
5. Existing 4 posts and their content are migrated/seeded into the database.
6. The current design, typography, editor restrictions, responsive behavior, and dark/light modes remain intact.

---

## Recommended stack (use unless the repo already has a better fit)

- Database: Postgres (Supabase, Neon, or Vercel Postgres).
- ORM: Drizzle ORM (preferred) or Prisma.
- Auth: Auth.js or Supabase Auth. Single-owner/admin access is acceptable for this portfolio; still enforce auth server-side.
- Uploads: Vercel Blob, Cloudinary, S3-compatible storage, or Supabase Storage. Use signed/direct uploads and store only the public URL in the database.
- Validation: Zod.
- Deployment target: Vercel (or any Node host that supports Next.js App Router and image/domain config).

Do not add a second UI framework or change the visual design.

---

## Data model

Create a `posts` table with at least:

```ts
id: uuid primary key
slug: text unique not null
title: text not null default ''
excerpt: text not null default ''
content: jsonb not null          // Tiptap/ProseMirror JSON
cover_url: text
cover_alt: text
status: 'draft' | 'published' not null default 'draft'
published_at: timestamptz
created_at: timestamptz not null default now()
updated_at: timestamptz not null default now()
author_id: uuid/text             // nullable if single-owner
reading_time: text               // e.g. "5 min read"
seo_title: text
seo_description: text
```

Rules:

- Slugs are unique and URL-safe. Normalize on the server with a shared `slugify`. Handle collisions by appending `-2`, `-3`, etc., or returning a clear error.
- Setting `status = published` fills `published_at` if empty; unpublishing keeps the old date but hides the post.
- `updated_at` changes on every write.
- `content` must remain compatible with the existing Tiptap document schema (`doc`, `paragraph`, `heading`, `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `horizontalRule`, `text` with marks `bold`, `italic`, `underline`, `strike`, `code`, `link`, `highlight`, and the custom `textSize` mark with `size: 'sm' | 'md' | 'lg'`).
- Do not allow arbitrary `style` attributes or font/color marks in stored content.

---

## Authentication and authorization

- Add a sign-in page (e.g. `/admin/login`) with email magic link, OAuth, or email/password.
- Protect `/admin` and all write endpoints/server actions. Redirect unauthenticated visitors to the sign-in page.
- Enforce auth in the data layer/server actions, not only in client components or middleware.
- Keep `/admin` and the login page `noindex` and disallowed in `robots`.
- If using Supabase, enable Row Level Security: public read only for `status = 'published'`; writes only for the authenticated owner.
- Never expose database service keys, storage secrets, or auth secrets to the browser.

---

## Public blog (server-rendered from the database)

### `/blogs`

- Query published posts on the server, newest `published_at` first.
- Render the existing `BlogsPage` design from DB data. Keep the HLS video background client component isolated.
- Each card shows title, excerpt, date, read time, cover.
- Empty state should be intentional, not a crash.

### `/blogs/[slug]`

- Fetch the post by slug on the server.
- Only return `status = 'published'`.
- Call `notFound()` for drafts, missing posts, or unpublished posts.
- Keep `generateMetadata` server-side using the DB post:
  - title/description from `seo_title`/`seo_description` or `title`/`excerpt`
  - canonical `/blogs/<slug>`
  - Open Graph article metadata and cover image
- Keep `BlogPosting` JSON-LD, using real `published_at` and `updated_at`.
- Render Tiptap JSON to semantic HTML on the server. Use `@tiptap/html` `generateHTML` with the same extension set as the editor, or a small server renderer. Sanitize the output if any HTML is accepted. The rendered classes must match the existing `post-content` styles (`post-h2`, `post-p`, lists, links, blockquote, code, etc.).
- Preserve the fixed typography. Do not emit inline font-family or color styles.
- Suggested caching: ISR (`export const revalidate = 60`) or tag-based revalidation. Publishing/updating/deleting a post must revalidate `/blogs`, `/blogs/[slug]`, and `/sitemap.xml` so changes appear immediately. If you use `dynamic = 'force-dynamic'`, that is acceptable but must be measured.
- Keep `dynamicParams` behavior sensible: unknown slugs should 404; newly published slugs should become available without a rebuild.

### Sitemap / SEO

- `src/app/sitemap.js` must include published posts from the database, with `lastModified` from `updated_at`.
- Drafts must never appear in the sitemap, metadata, or public queries.
- Keep `robots.js` disallowing `/admin`.

---

## Admin studio

Replace localStorage with server-backed CRUD.

- On load, fetch posts from the server. Show loading, empty, and error states.
- Create post: creates a draft in the DB and opens the editor.
- Edit post: loads the DB record.
- Autosave: debounce (400–800ms) and save via a server action or route handler. Show `Saving…`, `Saved`, and `Save failed` states. Do not lose edits on refresh.
- Publish/unpublish: explicit action with clear status. Publishing validates required fields (title, slug, excerpt, cover, content).
- Delete: confirm, delete, and revalidate public pages.
- Cover upload: upload to storage, store URL + alt text. Enforce type and size limits (e.g. JPEG/PNG/WebP, max 2–5 MB). Keep the current cover preview and remove-cover control.
- Keep the Tiptap editor and toolbar exactly as restricted today:
  - No font family, no text color, no arbitrary colors.
  - S/M/L, bold, italic, underline, strike, code, fixed highlights, lists, links, H2/H3, divider, undo/redo.
- Keep the auto-growing multi-line title textarea and the excerpt directly under it.
- Keep the list layout, sidebar behavior, mobile rules, and dark/light mode.
- Add a “View post” link that only works for published posts; for drafts, show a preview route or disable it.
- Optional but recommended: a draft preview route protected by auth.

---

## Migration / seed

- Add a seed or migration script that inserts the 4 existing posts from `journalEntries` + `journalContent` into the database, preserving title, slug, excerpt, cover, alt text, date, read time, body content, and published status.
- Convert the existing `{ type: 'h2' | 'p', text }` blocks to Tiptap JSON, or seed the equivalent ProseMirror JSON.
- Do not delete the static files immediately; keep them until the DB seed is verified, then remove or mark them as legacy.
- If a local draft export is useful, add a one-time import path, but do not make production depend on localStorage.

---

## Implementation order

1. Add environment variables and document them in `.env.example`.
2. Add DB schema + migration + seed script.
3. Add server-only DB client and query functions.
4. Add auth and protect `/admin`.
5. Move admin CRUD to server actions/route handlers.
6. Add cover upload.
7. Switch `/blogs` and `/blogs/[slug]` to DB queries; add server-side Tiptap rendering.
8. Add revalidation + dynamic sitemap.
9. Seed the 4 posts and verify.
10. Run the full verification checklist.
11. Remove localStorage persistence only after the DB flow works end to end.

Suggested query functions:

```ts
getPublishedPosts()
getPublishedPostBySlug(slug)
getAllPosts()          // admin only
getPostById(id)        // admin only
createDraft(input)
updatePost(id, input)
publishPost(id)
unpublishPost(id)
deletePost(id)
```

---

## Constraints

- Do not redesign the public pages or admin UI.
- Do not change the fixed typography or add font/color controls.
- Do not make public blog pages client components or read posts from `localStorage`.
- Do not expose secrets or allow unauthenticated writes.
- Do not break `/admin` noindex, `robots`, `SiteChrome`, sitemap, canonical URLs, or JSON-LD.
- Keep the site working at 390px; no horizontal overflow.
- Keep the existing dark/light theme behavior.
- Use `npm run build` as the source of truth; TypeScript/ESLint errors must be fixed.
- Make small commits with clear messages.

---

## Definition of done / verification

- [ ] `npm run build` passes with no errors.
- [ ] `/admin` redirects to sign-in when logged out; only the authenticated owner can write.
- [ ] Create → autosave → refresh → edits persist (DB, not localStorage).
- [ ] Publish a new post → it appears on `/blogs` and `/blogs/<slug>` without rebuilding.
- [ ] Draft → `/blogs/<slug>` returns 404 and does not appear on `/blogs` or the sitemap.
- [ ] Unpublish/delete → public page and sitemap update.
- [ ] Slug changes and duplicate slugs are handled without breaking links.
- [ ] Cover upload works; invalid type/size is rejected with a clear message.
- [ ] Public HTML contains the post title, body, canonical, and JSON-LD before hydration (verify with `curl` or by disabling JS).
- [ ] Existing 4 posts are present and match the current public content and design.
- [ ] Admin list, editor, title auto-grow, excerpt placement, toolbar restrictions, dark/light mode, and 390px layout still work.
- [ ] No secrets committed; `.env.example` documents every required variable.
- [ ] `README` or `docs/` explains local setup, migrations, seeding, and deployment.

---

## Report back

When finished, report:

1. Stack chosen and why.
2. Files added/changed.
3. DB schema and auth model.
4. How publishing/revalidation works.
5. How to run migrations/seed locally.
6. What was verified (build + manual checks).
7. Anything still mocked or deferred.
