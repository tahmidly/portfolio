import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Mirrors db/migrations/*.sql — the SQL files are the source of truth.
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    content: jsonb("content").notNull(),
    coverUrl: text("cover_url"),
    coverAlt: text("cover_alt"),
    coverWidth: integer("cover_width"),
    coverHeight: integer("cover_height"),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    authorId: text("author_id"),
    readingTime: text("reading_time"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
  },
  (table) => [index("posts_published_idx").on(table.status, table.publishedAt)],
);

export const postSlugRedirects = pgTable("post_slug_redirects", {
  slug: text("slug").primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
