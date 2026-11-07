// Applies db/migrations/*.sql in order, once each. Run: npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local).");
  process.exit(1);
}

const sql = neon(url);
const dir = path.resolve("db/migrations");

await sql`CREATE TABLE IF NOT EXISTS _migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const applied = new Set(
  (await sql`SELECT name FROM _migrations`).map((row) => row.name),
);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

let count = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const text = await readFile(path.join(dir, file), "utf8");
  const statements = text
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  await sql.transaction([
    ...statements.map((statement) => sql.query(statement)),
    sql`INSERT INTO _migrations (name) VALUES (${file})`,
  ]);
  console.log(`applied ${file}`);
  count += 1;
}

console.log(count ? `${count} migration(s) applied.` : "Database is up to date.");
