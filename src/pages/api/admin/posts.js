import { z } from "zod";
import { requireAdmin } from "../../../lib/auth";
import {
  createDraft,
  deletePost,
  getAllPosts,
  getPostById,
  publishPost,
  unpublishPost,
  updatePost,
} from "../../../lib/posts";

// Replaces the Next.js server actions. The studio posts { action, args } and
// always gets back { ok, ... } (never a thrown error), so it can show clear
// "Save failed" states. Auth is also enforced in the data layer.

const idSchema = z.uuid();

const ACTIONS = {
  async list() {
    return { ok: true, posts: await getAllPosts() };
  },
  async get(id) {
    const post = await getPostById(idSchema.parse(id));
    return post ? { ok: true, post } : { ok: false, error: "Post not found." };
  },
  async create() {
    return { ok: true, post: await createDraft() };
  },
  async save(id, input) {
    const result = await updatePost(idSchema.parse(id), input);
    if (!result) return { ok: false, error: "Post not found." };
    return { ok: true, post: result.post };
  },
  async publish(id) {
    const result = await publishPost(idSchema.parse(id));
    if (!result.ok) {
      return { ok: false, error: result.errors.join(" "), errors: result.errors };
    }
    return { ok: true, post: result.post };
  },
  async unpublish(id) {
    const post = await unpublishPost(idSchema.parse(id));
    if (!post) return { ok: false, error: "Post not found." };
    return { ok: true, post };
  },
  async delete(id) {
    const deleted = await deletePost(idSchema.parse(id));
    if (!deleted) return { ok: false, error: "Post not found." };
    return { ok: true };
  },
};

async function run(fn) {
  try {
    requireAdmin();
    return await fn();
  } catch (error) {
    if (error?.status === 401) {
      return { ok: false, error: "Your session expired. Sign in again.", unauthorized: true };
    }
    if (error?.status === 409) return { ok: false, error: error.message };
    if (error instanceof z.ZodError) {
      return { ok: false, error: error.issues[0]?.message || "Invalid input." };
    }
    console.error("[admin action]", error);
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

// Actions that can change what the public pages show.
const PUBLIC_CHANGES = new Set(["save", "publish", "unpublish", "delete"]);

export const POST = async ({ request, url, cache }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) {
    return Response.json({ ok: false, error: "Bad origin." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const handler = Object.hasOwn(ACTIONS, body?.action) ? ACTIONS[body.action] : null;
  if (!handler) {
    return Response.json({ ok: false, error: "Unknown action." }, { status: 400 });
  }

  const args = Array.isArray(body.args) ? body.args : [];
  const result = await run(() => handler(...args));

  // Purge cached /, /blogs, posts, RSS and sitemap (replaces revalidatePath).
  // Drafts aren't public, so only saves of published posts need a purge.
  const touchesPublic =
    result.ok &&
    PUBLIC_CHANGES.has(body.action) &&
    (body.action !== "save" || result.post?.status === "published");
  if (touchesPublic) {
    try {
      await cache.invalidate({ tags: "posts" });
    } catch (error) {
      console.error("[cache] purge failed", error);
    }
  }

  return Response.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
};
