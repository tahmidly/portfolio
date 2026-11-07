import "server-only";
import { cache } from "react";
import { and, desc, eq, like, ne, or } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "./db";
import { requireAdmin } from "./auth";
import {
  EMPTY_DOC,
  docToPlainText,
  estimateReadingTime,
  hasBodyText,
  sanitizeDoc,
  slugify,
} from "./content";

const { posts, postSlugRedirects } = schema;

// ─── Serialization ───────────────────────────────────────────────────────────

const iso = (value) => (value ? new Date(value).toISOString() : null);

function toPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverUrl: row.coverUrl || "",
    coverAlt: row.coverAlt || "",
    coverWidth: row.coverWidth || null,
    coverHeight: row.coverHeight || null,
    status: row.status,
    publishedAt: iso(row.publishedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    readingTime: row.readingTime || "",
    seoTitle: row.seoTitle || "",
    seoDescription: row.seoDescription || "",
  };
}

const summaryColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverUrl: posts.coverUrl,
  coverAlt: posts.coverAlt,
  coverWidth: posts.coverWidth,
  coverHeight: posts.coverHeight,
  status: posts.status,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  readingTime: posts.readingTime,
};

// ─── Public (published only) ─────────────────────────────────────────────────

export const getPublishedPosts = cache(async () => {
  const rows = await getDb()
    .select(summaryColumns)
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));
  return rows.map(toPost);
});

export const getPublishedPostBySlug = cache(async (slug) => {
  if (typeof slug !== "string" || slug !== slugify(slug)) return null;
  const [row] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);
  return toPost(row);
});

/** Current slug for an old slug, if the post is still published. */
export const getRedirectedSlug = cache(async (slug) => {
  if (typeof slug !== "string" || slug !== slugify(slug)) return null;
  const [row] = await getDb()
    .select({ slug: posts.slug })
    .from(postSlugRedirects)
    .innerJoin(posts, eq(posts.id, postSlugRedirects.postId))
    .where(
      and(eq(postSlugRedirects.slug, slug), eq(posts.status, "published")),
    )
    .limit(1);
  return row?.slug && row.slug !== slug ? row.slug : null;
});

// ─── Admin (auth enforced here, not only in the UI) ──────────────────────────

export async function getAllPosts() {
  await requireAdmin();
  const rows = await getDb()
    .select(summaryColumns)
    .from(posts)
    .orderBy(desc(posts.updatedAt));
  return rows.map(toPost);
}

export async function getPostById(id) {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;
  const [row] = await getDb().select().from(posts).where(eq(posts.id, id)).limit(1);
  return toPost(row);
}

async function uniqueSlug(base, excludeId) {
  const root = slugify(base) || "untitled";
  const db = getDb();
  const taken = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(
      and(
        or(eq(posts.slug, root), like(posts.slug, `${root}-%`)),
        excludeId ? ne(posts.id, excludeId) : undefined,
      ),
    );
  const used = new Set(taken.map((row) => row.slug));
  if (!used.has(root)) return root;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${root}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export async function createDraft() {
  await requireAdmin();
  const slug = await uniqueSlug(`untitled-${Date.now().toString(36)}`);
  const [row] = await getDb()
    .insert(posts)
    .values({ slug, content: EMPTY_DOC, readingTime: "1 min read" })
    .returning();
  return toPost(row);
}

const optionalText = (max) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((value) => (value ?? "").trim());

const coverUrlSchema = z
  .string()
  .max(2048)
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine(
    (value) =>
      value === "" ||
      /^\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/.test(value) ||
      /^https:\/\/[^\s]+$/.test(value),
    "Cover must be an uploaded image or an https URL.",
  );

const updateSchema = z.object({
  title: z.string().max(300).default(""),
  excerpt: z.string().max(1000).default(""),
  slug: z.string().max(200).default(""),
  content: z.unknown(),
  coverUrl: coverUrlSchema,
  coverWidth: z.number().int().min(1).max(20000).nullish(),
  coverHeight: z.number().int().min(1).max(20000).nullish(),
  readingTime: optionalText(40),
});

/** Cut to max length at a word boundary, with an ellipsis. */
function clamp(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

// Search appearance is generated, not edited: title → SEO title,
// excerpt (or opening body text) → description, title → cover alt.
function autoSeo({ title, excerpt, content, hasCover }) {
  const description = excerpt.trim() || docToPlainText(content);
  return {
    seoTitle: clamp(title, 60) || null,
    seoDescription: clamp(description, 160) || null,
    coverAlt: hasCover && title.trim() ? clamp(title, 200) : null,
  };
}

function slugError() {
  const error = new Error("That slug is already used by another post.");
  error.status = 409;
  return error;
}

export async function updatePost(id, input) {
  await requireAdmin();
  const data = updateSchema.parse(input);
  const db = getDb();

  const [current] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!current) return null;

  const content = sanitizeDoc(data.content ?? current.content);
  const requestedSlug = slugify(data.slug) || slugify(data.title) || current.slug;
  const slug =
    requestedSlug === current.slug
      ? current.slug
      : await uniqueSlug(requestedSlug, id);

  const values = {
    title: data.title,
    excerpt: data.excerpt,
    slug,
    content,
    coverUrl: data.coverUrl || null,
    coverWidth: data.coverUrl ? data.coverWidth ?? null : null,
    coverHeight: data.coverUrl ? data.coverHeight ?? null : null,
    readingTime: data.readingTime || estimateReadingTime(content),
    ...autoSeo({ title: data.title, excerpt: data.excerpt, content, hasCover: Boolean(data.coverUrl) }),
    updatedAt: new Date(),
  };

  const slugChanged = slug !== current.slug;
  const statements = [
    db.update(posts).set(values).where(eq(posts.id, id)).returning(),
  ];
  if (slugChanged) {
    // The new slug is live again → drop any redirect pointing away from it.
    statements.push(db.delete(postSlugRedirects).where(eq(postSlugRedirects.slug, slug)));
    // Only links that were ever public need to keep working.
    if (current.publishedAt) {
      statements.push(
        db
          .insert(postSlugRedirects)
          .values({ slug: current.slug, postId: id })
          .onConflictDoUpdate({
            target: postSlugRedirects.slug,
            set: { postId: id, createdAt: new Date() },
          }),
      );
    }
  }

  let results;
  try {
    results = await db.batch(statements);
  } catch (error) {
    if (String(error?.code || error?.cause?.code) === "23505") throw slugError();
    throw error;
  }
  const [row] = results[0];
  return { post: toPost(row), previousSlug: slugChanged ? current.slug : null };
}

export function validateForPublish(post) {
  const errors = [];
  if (!post.title?.trim()) errors.push("Add a title.");
  if (!post.slug?.trim()) errors.push("Add a slug.");
  if (!post.excerpt?.trim()) errors.push("Add an excerpt.");
  if (!hasBodyText(post.content)) errors.push("Write some body content.");
  return errors;
}

export async function publishPost(id) {
  await requireAdmin();
  const post = await getPostById(id);
  if (!post) return { ok: false, errors: ["Post not found."] };
  const errors = validateForPublish(post);
  if (errors.length) return { ok: false, errors };

  const now = new Date();
  const [row] = await getDb()
    .update(posts)
    .set({
      status: "published",
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : now,
      updatedAt: now,
    })
    .where(eq(posts.id, id))
    .returning();
  return { ok: true, post: toPost(row) };
}

export async function unpublishPost(id) {
  await requireAdmin();
  // published_at is kept, so re-publishing restores the original date.
  const [row] = await getDb()
    .update(posts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return toPost(row);
}

export async function deletePost(id) {
  await requireAdmin();
  const [row] = await getDb()
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug, status: posts.status });
  return row || null;
}
