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
  // <ClientRouter /> turns on prefetchAll. "viewport": every link on screen
  // (the navbar included) is fetched in the background once the page is idle,
  // so a click (or a tap on phones, which have no hover) opens it instantly.
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  // Keep whitespace between inline elements exactly as written.
  compressHTML: true,
  vite: {
    plugins: [
      tailwindcss(),
      // Velox's own website is plain HTML in public/velox/. The live host
      // serves it at /velox/; this makes `astro dev` do the same.
      {
        name: "velox-dev-index",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url === "/velox" || req.url === "/velox/") req.url = "/velox/index.html";
            next();
          });
        },
      },
    ],
  },
});
