// Local writing studio. Only active during `astro dev`:
//   /admin             the studio UI (src/studio/admin.astro)
//   /api/studio        { action, args } → read/write src/content/blog/*.md
//   /api/studio/upload multipart image upload → public/blog|works/<uuid>.<ext>
//                      (?folder=works for project images)
//
// The API runs as Vite middleware inside the Node dev process (Astro's
// Cloudflare dev runtime can't write to disk). Production builds contain
// neither the page nor the API: write locally, commit, deploy.

import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { StudioError, createPostStore, saveCover } from "./posts-store.mjs";
import { createWorksStore } from "./works-store.mjs";

// action name → [store, method, response key]
function actionTable(posts, works) {
  const table = {};
  for (const name of ["list", "get", "create", "save", "publish", "unpublish", "delete"]) {
    const key = name === "list" ? "posts" : name === "delete" ? null : "post";
    table[name] = [posts, name, key];
    table[`works.${name}`] = [works, name, name === "list" ? "works" : name === "delete" ? null : "work"];
  }
  table["featured.get"] = [works, "getFeatured", "featured"];
  table["featured.save"] = [works, "saveFeatured", "featured"];
  return table;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function toWebRequest(req) {
  return new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: Readable.toWeb(req),
    duplex: "half",
  });
}

function studioApi(root) {
  const actions = actionTable(createPostStore(root), createWorksStore(root));

  return {
    name: "local-studio-api",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/api/studio" && url !== "/api/studio/upload") return next();

        // Only same-page requests: the custom header forces a CORS preflight,
        // which this server never approves, so other websites can't post here.
        if (req.method !== "POST" || req.headers["x-studio"] !== "1") {
          return sendJson(res, 403, { ok: false, error: "Forbidden." });
        }

        if (url === "/api/studio/upload") {
          try {
            const form = await toWebRequest(req).formData();
            const file = form.get("file");
            if (!file || typeof file === "string") {
              return sendJson(res, 400, { error: "No file received." });
            }
            const folder = new URL(req.url, "http://localhost").searchParams.get("folder") || "blog";
            const result = await saveCover(root, new Uint8Array(await file.arrayBuffer()), folder);
            return sendJson(res, 201, result);
          } catch (error) {
            if (error instanceof StudioError) return sendJson(res, error.status, { error: error.message });
            console.error("[studio upload]", error);
            return sendJson(res, 500, { error: "Upload failed. Check the terminal." });
          }
        }

        try {
          const body = await toWebRequest(req).json();
          const entry = Object.hasOwn(actions, body?.action) ? actions[body.action] : null;
          if (!entry) {
            return sendJson(res, 400, { ok: false, error: "Unknown action." });
          }
          const [store, method, key] = entry;
          const args = Array.isArray(body.args) ? body.args : [];
          const result = await store[method](...args);
          const payload = key ? { ok: true, [key]: result } : { ok: true };
          return sendJson(res, 200, payload);
        } catch (error) {
          if (error instanceof StudioError) {
            // { ok: false } keeps the studio's "Save failed" / publish checks working.
            return sendJson(res, error.status === 404 ? 404 : 200, {
              ok: false,
              error: error.message,
              errors: error.errors,
            });
          }
          console.error("[studio]", error);
          return sendJson(res, 500, { ok: false, error: "Something went wrong. Check the terminal." });
        }
      });
    },
  };
}

export default function localStudio() {
  return {
    name: "local-studio",
    hooks: {
      "astro:config:setup": ({ command, config, injectRoute, updateConfig, logger }) => {
        if (command !== "dev") return;
        const root = fileURLToPath(config.root);
        injectRoute({ pattern: "/admin", entrypoint: "./src/studio/admin.astro" });
        updateConfig({ vite: { plugins: [studioApi(root)] } });
        logger.info("Studio at /admin (local only, saves to src/content/blog)");
      },
    },
  };
}
