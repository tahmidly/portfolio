// Seeds the 4 original journal posts from the legacy static files.
// Existing slugs are left untouched unless you pass --force.
// Run: npm run db:seed   (or: npm run db:seed -- --force)
import { neon } from "@neondatabase/serverless";
import { journalEntries } from "../src/data/portfolio.js";
import { journalContent } from "../src/data/journalContent.js";
import { blocksToDoc, sanitizeDoc } from "../src/lib/content.js";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local).");
  process.exit(1);
}

const force = process.argv.includes("--force");
const sql = neon(url);

for (const entry of journalEntries) {
  const article = journalContent[entry.id] || { excerpt: "", content: [] };
  // Noon UTC so the calendar date never shifts across time zones.
  const publishedAt = new Date(`${entry.date} 12:00:00 UTC`).toISOString();
  const content = JSON.stringify(sanitizeDoc(blocksToDoc(article.content)));

  const rows = force
    ? await sql`
        INSERT INTO posts (slug, title, excerpt, content, cover_url, cover_alt,
          status, published_at, created_at, updated_at, reading_time)
        VALUES (${entry.id}, ${entry.title}, ${article.excerpt}, ${content}::jsonb,
          ${entry.image}, ${entry.alt}, 'published', ${publishedAt},
          ${publishedAt}, ${publishedAt}, ${entry.readTime})
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title, excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content, cover_url = EXCLUDED.cover_url,
          cover_alt = EXCLUDED.cover_alt, status = EXCLUDED.status,
          published_at = EXCLUDED.published_at, reading_time = EXCLUDED.reading_time,
          updated_at = now()
        RETURNING slug`
    : await sql`
        INSERT INTO posts (slug, title, excerpt, content, cover_url, cover_alt,
          status, published_at, created_at, updated_at, reading_time)
        VALUES (${entry.id}, ${entry.title}, ${article.excerpt}, ${content}::jsonb,
          ${entry.image}, ${entry.alt}, 'published', ${publishedAt},
          ${publishedAt}, ${publishedAt}, ${entry.readTime})
        ON CONFLICT (slug) DO NOTHING
        RETURNING slug`;

  console.log(rows.length ? `seeded  ${entry.id}` : `skipped ${entry.id} (exists)`);
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM posts`;
console.log(`posts in database: ${count}`);
