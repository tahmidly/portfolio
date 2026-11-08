// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import localStudio from "./studio/integration.mjs";

// .env files are not loaded into astro.config automatically.
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");

export default defineConfig({
  site: PUBLIC_SITE_URL || "http://localhost:4321",
  // Every public page is prerendered to static HTML (posts come from
  // Markdown files in src/content/blog/). Cloudflare serves them as static
  // assets.
  adapter: cloudflare({
    // Covers are plain <img> tags; no Cloudflare Images binding needed.
    imageService: "passthrough",
  }),
  // localStudio: /admin writing studio, only during `astro dev` (saves .md files).
  integrations: [react(), localStudio()],
  // <ClientRouter /> turns on prefetchAll; hover is the default strategy.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  // Keep whitespace between inline elements exactly as written.
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
