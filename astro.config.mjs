// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import localStudio from "./studio/integration.mjs";

// .env files are not loaded into astro.config automatically.
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");

export default defineConfig({
  // The live domain. Used for canonical URLs, sitemap, RSS, Open Graph and
  // structured data (import.meta.env.SITE). PUBLIC_SITE_URL can override it.
  site: PUBLIC_SITE_URL || "https://meer.men",
  // Fully static site: every page is prerendered to plain HTML in dist/
  // (posts and projects come from Markdown files). No adapter needed, so it
  // deploys to any static host (Netlify: see netlify.toml).
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
