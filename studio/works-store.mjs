// Project storage for the local studio (Node only, inside `astro dev`).
// Every project is src/content/works/<slug>.md (frontmatter only):
//
//   ---
//   title: …   tag: …   description: …
//   image: /works/….webp (or https URL)   imageAlt: …
//   url: https://…   date: 2026-11-08   draft: true|false   studioId: …
//   ---
//
// The home page picks are src/data/featured.json:
//   { "layout": "feature-left", "works": ["slug-a", "slug-b", "slug-c"] }

import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { slugify } from "../src/lib/format.js";
import { FEATURED_LAYOUTS } from "../src/lib/featuredLayouts.js";
import { StudioError } from "./posts-store.mjs";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const FIELD_ORDER = ["title", "tag", "description", "image", "imageAlt", "url", "date", "draft", "studioId"];
const today = () => new Date().toISOString().slice(0, 10);
const iso = (value) => (value ? new Date(value).toISOString() : null);
const IMAGE_PATTERN = /^\/works\/[a-z0-9-]+\.(jpg|png|webp)$/;

export function createWorksStore(root) {
  const dir = path.join(root, "src", "content", "works");
  const featuredFile = path.join(root, "src", "data", "featured.json");
  const fileFor = (slug) => path.join(dir, `${slug}.md`);

  async function readWork(file) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const match = raw.match(FRONTMATTER);
    const data = (match && parseYaml(match[1])) || {};
    const body = (match ? match[2] : "").trim();
    const { mtime } = await stat(path.join(dir, file));
    return { slug: file.replace(/\.md$/, ""), data, body, mtime };
  }

  async function readAll() {
    await mkdir(dir, { recursive: true });
    const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
    return Promise.all(files.map(readWork));
  }

  function toWork({ slug, data, mtime }) {
    return {
      id: data.studioId || slug,
      slug,
      title: data.title ?? "",
      tag: data.tag ?? "",
      description: data.description ?? "",
      image: data.image ?? "",
      imageAlt: data.imageAlt ?? "",
      url: data.url ?? "",
      date: iso(data.date),
      status: data.draft === true ? "draft" : "published",
      updatedAt: mtime.toISOString(),
    };
  }

  async function find(id) {
    const all = await readAll();
    return all.find((work) => (work.data.studioId || work.slug) === id) || null;
  }

  async function uniqueSlug(base, currentSlug) {
    const rootSlug = slugify(base) || "untitled-project";
    const taken = new Set((await readAll()).map((work) => work.slug));
    taken.delete(currentSlug);
    if (!taken.has(rootSlug)) return rootSlug;
    for (let n = 2; n < 1000; n += 1) {
      if (!taken.has(`${rootSlug}-${n}`)) return `${rootSlug}-${n}`;
    }
    return `${rootSlug}-${Date.now()}`;
  }

  async function write(slug, data, body = "") {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    clean.title ??= "";
    clean.description ??= "";
    const rank = (key) => (FIELD_ORDER.includes(key) ? FIELD_ORDER.indexOf(key) : FIELD_ORDER.length);
    const ordered = Object.fromEntries(Object.entries(clean).sort(([a], [b]) => rank(a) - rank(b)));
    const yaml = stringifyYaml(ordered, { lineWidth: 0 }).trimEnd();
    await writeFile(fileFor(slug), `---\n${yaml}\n---\n${body ? `\n${body}\n` : ""}`, "utf8");
  }

  // ─── Featured (home page) ───
  async function readFeatured() {
    try {
      const parsed = JSON.parse(await readFile(featuredFile, "utf8"));
      return {
        layout: FEATURED_LAYOUTS.some((l) => l.key === parsed.layout) ? parsed.layout : FEATURED_LAYOUTS[0].key,
        works: Array.isArray(parsed.works) ? parsed.works.filter((s) => typeof s === "string").slice(0, 3) : [],
      };
    } catch {
      return { layout: FEATURED_LAYOUTS[0].key, works: [] };
    }
  }

  async function writeFeatured(featured) {
    await mkdir(path.dirname(featuredFile), { recursive: true });
    await writeFile(featuredFile, `${JSON.stringify(featured, null, 2)}\n`, "utf8");
  }

  /** Keep featured.json pointing at the right file after a rename/delete. */
  async function updateFeaturedSlug(oldSlug, newSlug) {
    const featured = await readFeatured();
    if (!featured.works.includes(oldSlug)) return;
    featured.works = newSlug
      ? featured.works.map((slug) => (slug === oldSlug ? newSlug : slug))
      : featured.works.filter((slug) => slug !== oldSlug);
    await writeFeatured(featured);
  }

  return {
    async list() {
      return (await readAll())
        .map(toWork)
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    },

    async get(id) {
      const work = await find(id);
      if (!work) throw new StudioError("Project not found.", 404);
      return toWork(work);
    },

    async create() {
      const slug = await uniqueSlug(`untitled-project-${Date.now().toString(36)}`);
      await write(slug, { title: "", description: "", date: today(), draft: true, studioId: randomUUID() });
      return toWork(await readWork(`${slug}.md`));
    },

    async save(id, input = {}) {
      const current = await find(id);
      if (!current) throw new StudioError("Project not found.", 404);

      const title = String(input.title ?? "").slice(0, 200);
      const requested = slugify(input.slug) || slugify(title) || current.slug;
      const slug = requested === current.slug ? current.slug : await uniqueSlug(requested, current.slug);

      const image = String(input.image ?? "").trim();
      if (image && !IMAGE_PATTERN.test(image) && !/^https:\/\/\S+$/.test(image)) {
        throw new StudioError("Image must be an uploaded image or an https URL.");
      }
      const url = String(input.url ?? "").trim();
      if (url && !/^https?:\/\/\S+$/.test(url)) {
        throw new StudioError("Project link must start with https://");
      }
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(input.date ?? "")) ? input.date : current.data.date;

      const data = {
        ...current.data,
        title,
        tag: String(input.tag ?? "").slice(0, 120),
        description: String(input.description ?? "").slice(0, 600),
        image: image || undefined,
        imageAlt: image ? String(input.imageAlt ?? "").slice(0, 200) || undefined : undefined,
        url: url || undefined,
        date,
        studioId: current.data.studioId || randomUUID(),
      };
      await write(slug, data, current.body);
      if (slug !== current.slug) {
        await rm(fileFor(current.slug), { force: true });
        await updateFeaturedSlug(current.slug, slug);
      }
      return toWork(await readWork(`${slug}.md`));
    },

    async publish(id) {
      const current = await find(id);
      if (!current) throw new StudioError("Project not found.", 404);
      const errors = [];
      if (!String(current.data.title ?? "").trim()) errors.push("Add a title.");
      if (!String(current.data.description ?? "").trim()) errors.push("Add a description.");
      if (!current.data.image) errors.push("Add an image.");
      if (errors.length) throw new StudioError(errors.join(" "), 400, { errors });
      await write(current.slug, { ...current.data, draft: false }, current.body);
      return toWork(await readWork(`${current.slug}.md`));
    },

    async unpublish(id) {
      const current = await find(id);
      if (!current) throw new StudioError("Project not found.", 404);
      await write(current.slug, { ...current.data, draft: true }, current.body);
      return toWork(await readWork(`${current.slug}.md`));
    },

    async delete(id) {
      const current = await find(id);
      if (!current) throw new StudioError("Project not found.", 404);
      await rm(fileFor(current.slug), { force: true });
      await updateFeaturedSlug(current.slug, null);
      return { slug: current.slug };
    },

    async getFeatured() {
      return readFeatured();
    },

    async saveFeatured(input = {}) {
      const layout = FEATURED_LAYOUTS.some((l) => l.key === input.layout) ? input.layout : FEATURED_LAYOUTS[0].key;
      const published = new Set(
        (await readAll()).filter((work) => work.data.draft !== true).map((work) => work.slug),
      );
      const picks = Array.isArray(input.works) ? input.works.slice(0, 3) : [];
      for (const slug of picks) {
        if (!published.has(slug)) throw new StudioError("Only published projects can be featured.");
      }
      if (new Set(picks).size !== picks.length) throw new StudioError("Pick 3 different projects.");
      const featured = { layout, works: picks };
      await writeFeatured(featured);
      return featured;
    },
  };
}
