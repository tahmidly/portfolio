// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

// .env files are not loaded into astro.config automatically.
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");

export default defineConfig({
  site: PUBLIC_SITE_URL || "http://localhost:4321",
  // Every page reads the database, so render on request (Cloudflare Workers).
  output: "server",
  adapter: cloudflare({
    // Covers are plain <img> tags; no Cloudflare Images binding needed.
    imageService: "passthrough",
  }),
  integrations: [react()],
  // Edge-cache the public pages (the Next.js ISR equivalent). Publishing,
  // editing or deleting a post purges the "posts" tag (src/pages/api/admin/
  // posts.js), so changes are live immediately. Disabled in `astro dev`.
  cache: { provider: cacheCloudflare() },
  routeRules: {
    "/": { maxAge: 300, swr: 86400, tags: ["posts"] },
    "/blogs": { maxAge: 300, swr: 86400, tags: ["posts"] },
    "/blogs/[slug]": { maxAge: 300, swr: 86400, tags: ["posts"] },
    "/blogs/rss.xml": { maxAge: 300, swr: 86400, tags: ["posts"] },
    "/sitemap.xml": { maxAge: 300, swr: 86400, tags: ["posts"] },
  },
  // <ClientRouter /> turns on prefetchAll; hover is the default strategy.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  // Keep whitespace between inline elements exactly as written.
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
