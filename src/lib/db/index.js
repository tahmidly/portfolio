import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon's HTTP driver: stateless, one round-trip per query, no connection pool
// to exhaust in serverless functions. Ideal for this read-heavy blog.
let instance;

export function getDb() {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Add it to .env.local.");
    }
    instance = drizzle(neon(url), { schema });
  }
  return instance;
}

export { schema };
