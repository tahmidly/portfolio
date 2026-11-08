// Markdown post storage for the local studio (Node only, runs inside the
// `astro dev` process). Every post is src/content/blog/<slug>.md:
//
//   ---
//   title: …            excerpt: …          date: 2026-11-08
//   cover: /blog/….jpg  (or an https URL)   coverAlt / coverWidth / coverHeight
//   readingTime: …      draft: true|false
//   studioId: …         (stable id, so renaming the slug keeps the post)
//   studioPublished: true  (was published at least once → keeps its date)
//   ---
//   Markdown body…

import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { estimateReadingTime, markdownToText, slugify } from "../src/lib/format.js";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Readable field order: content fields first, studio bookkeeping last.
const FIELD_ORDER = [
  "title", "excerpt", "date", "updated", "cover", "coverAlt", "coverWidth",
  "coverHeight", "readingTime", "draft", "studioId", "studioPublished",
];

export class StudioError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

const iso = (value) => (value ? new Date(value).toISOString() : null);
const today = () => new Date().toISOString().slice(0, 10);

export function createPostStore(root) {
  const dir = path.join(root, "src", "content", "blog");
  const fileFor = (slug) => path.join(dir, `${slug}.md`);

  async function readPost(file) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const match = raw.match(FRONTMATTER);
    const data = (match && parseYaml(match[1])) || {};
    const body = (match ? match[2] : raw).replace(/^\s*\n/, "").trimEnd();
    const { mtime } = await stat(path.join(dir, file));
    const slug = file.replace(/\.md$/, "");
    return { slug, data, body, mtime };
  }

  async function readAll() {
    await mkdir(dir, { recursive: true });
    const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
    return Promise.all(files.map(readPost));
  }

  function toPost({ slug, data, body, mtime }) {
    const draft = data.draft === true;
    return {
      id: data.studioId || slug,
      slug,
      title: data.title ?? "",
      excerpt: data.excerpt ?? "",
      content: body,
      coverUrl: data.cover || data.coverUrl || "",
      coverAlt: data.coverAlt ?? "",
      coverWidth: data.coverWidth ?? null,
      coverHeight: data.coverHeight ?? null,
      readingTime: data.readingTime || estimateReadingTime(body),
      status: draft ? "draft" : "published",
      publishedAt: !draft || data.studioPublished ? iso(data.date) : null,
      updatedAt: iso(data.updated) || mtime.toISOString(),
      createdAt: iso(data.date),
    };
  }

  async function find(id) {
    const all = await readAll();
    return all.find((post) => (post.data.studioId || post.slug) === id) || null;
  }

  async function uniqueSlug(base, currentSlug) {
    const root = slugify(base) || "untitled";
    const taken = new Set((await readAll()).map((post) => post.slug));
    taken.delete(currentSlug);
    if (!taken.has(root)) return root;
    for (let n = 2; n < 1000; n += 1) {
      if (!taken.has(`${root}-${n}`)) return `${root}-${n}`;
    }
    return `${root}-${Date.now()}`;
  }

  async function write(slug, data, body) {
    // Drop empty optional fields so hand-editing the file stays pleasant.
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    // Required by the content schema even when empty.
    clean.title ??= "";
    clean.excerpt ??= "";
    const rank = (key) => (FIELD_ORDER.includes(key) ? FIELD_ORDER.indexOf(key) : FIELD_ORDER.length);
    const ordered = Object.fromEntries(
      Object.entries(clean).sort(([a], [b]) => rank(a) - rank(b)),
    );
    const yaml = stringifyYaml(ordered, { lineWidth: 0 }).trimEnd();
    await writeFile(fileFor(slug), `---\n${yaml}\n---\n\n${body.trim()}\n`, "utf8");
  }

  return {
    async list() {
      const all = await readAll();
      return all
        .map(toPost)
        .map(({ content: _content, ...summary }) => summary)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    async get(id) {
      const post = await find(id);
      if (!post) throw new StudioError("Post not found.", 404);
      return toPost(post);
    },

    async create() {
      const slug = await uniqueSlug(`untitled-${Date.now().toString(36)}`);
      const data = { title: "", excerpt: "", date: today(), draft: true, studioId: randomUUID() };
      await write(slug, data, "");
      return toPost(await readPost(`${slug}.md`));
    },

    async save(id, input = {}) {
      const current = await find(id);
      if (!current) throw new StudioError("Post not found.", 404);

      const title = String(input.title ?? "").slice(0, 300);
      const excerpt = String(input.excerpt ?? "").slice(0, 1000);
      const body = String(input.content ?? "");
      const requested = slugify(input.slug) || slugify(title) || current.slug;
      const slug = requested === current.slug ? current.slug : await uniqueSlug(requested, current.slug);

      const coverUrl = String(input.coverUrl ?? "").trim();
      if (coverUrl && !/^\/blog\/[a-z0-9-]+\.(jpg|png|webp)$/.test(coverUrl) && !/^https:\/\/\S+$/.test(coverUrl)) {
        throw new StudioError("Cover must be an uploaded image or an https URL.");
      }
      const readingTime = String(input.readingTime ?? "").trim().slice(0, 40);
      const published = current.data.draft !== true;

      const { coverUrl: _legacyCoverUrl, ...rest } = current.data;
      const data = {
        ...rest,
        title,
        excerpt,
        cover: coverUrl || undefined,
        coverAlt: coverUrl ? current.data.coverAlt || title.slice(0, 200) || undefined : undefined,
        coverWidth: coverUrl ? input.coverWidth ?? undefined : undefined,
        coverHeight: coverUrl ? input.coverHeight ?? undefined : undefined,
        // Blank = auto (calculated from the body by the site).
        readingTime: readingTime && readingTime !== estimateReadingTime(body) ? readingTime : undefined,
        updated: published ? today() : current.data.updated,
        studioId: current.data.studioId || randomUUID(),
      };

      await write(slug, data, body);
      if (slug !== current.slug) await rm(fileFor(current.slug), { force: true });
      return toPost(await readPost(`${slug}.md`));
    },

    async publish(id) {
      const current = await find(id);
      if (!current) throw new StudioError("Post not found.", 404);
      const errors = [];
      if (!String(current.data.title ?? "").trim()) errors.push("Add a title.");
      if (!String(current.data.excerpt ?? "").trim()) errors.push("Add an excerpt.");
      if (!markdownToText(current.body)) errors.push("Write some body content.");
      if (errors.length) throw new StudioError(errors.join(" "), 400, { errors });

      const data = {
        ...current.data,
        // First publish gets today's date; re-publishing keeps the original.
        date: current.data.studioPublished || current.data.draft !== true ? current.data.date : today(),
        draft: false,
        studioPublished: true,
      };
      await write(current.slug, data, current.body);
      return toPost(await readPost(`${current.slug}.md`));
    },

    async unpublish(id) {
      const current = await find(id);
      if (!current) throw new StudioError("Post not found.", 404);
      // The date is kept, so publishing again restores it.
      await write(current.slug, { ...current.data, draft: true, studioPublished: true }, current.body);
      return toPost(await readPost(`${current.slug}.md`));
    },

    async delete(id) {
      const current = await find(id);
      if (!current) throw new StudioError("Post not found.", 404);
      await rm(fileFor(current.slug), { force: true });
      return { slug: current.slug };
    },
  };
}

// ─── Cover uploads → public/blog/<uuid>.<ext> ────────────────────────────────

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const EXT_BY_TYPE = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function sniffImageType(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (
    b.length >= 12 &&
    String.fromCharCode(...b.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.subarray(8, 12)) === "WEBP"
  ) return "image/webp";
  return null;
}

export async function saveCover(root, bytes) {
  if (bytes.length > MAX_UPLOAD_BYTES) throw new StudioError("Image is larger than 4 MB.", 413);
  const type = sniffImageType(bytes);
  if (!type) throw new StudioError("Only JPEG, PNG or WebP images are allowed.", 415);
  const name = `${randomUUID()}.${EXT_BY_TYPE[type]}`;
  const dir = path.join(root, "public", "blog");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { url: `/blog/${name}` };
}
