"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "../../lib/auth";
import {
  createDraft,
  deletePost,
  getAllPosts,
  getPostById,
  publishPost,
  unpublishPost,
  updatePost,
} from "../../lib/posts";

const idSchema = z.uuid();

// Every action returns { ok, ... } instead of throwing, so the studio can show
// clear "Save failed" states. Auth is still enforced in the data layer.
async function run(fn) {
  try {
    await requireAdmin();
    return await fn();
  } catch (error) {
    if (error?.status === 401) return { ok: false, error: "Your session expired. Sign in again.", unauthorized: true };
    if (error?.status === 409) return { ok: false, error: error.message };
    if (error instanceof z.ZodError) {
      return { ok: false, error: error.issues[0]?.message || "Invalid input." };
    }
    console.error("[admin action]", error);
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

function revalidatePublic(...slugs) {
  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/sitemap.xml");
  revalidatePath("/blogs/rss.xml");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/blogs/${slug}`);
  }
  // Neighbouring posts show this one in their previous/next links.
  revalidatePath("/blogs/[slug]", "page");
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function listPostsAction() {
  return run(async () => ({ ok: true, posts: await getAllPosts() }));
}

export async function getPostAction(id) {
  return run(async () => {
    const post = await getPostById(idSchema.parse(id));
    return post ? { ok: true, post } : { ok: false, error: "Post not found." };
  });
}

export async function createPostAction() {
  return run(async () => ({ ok: true, post: await createDraft() }));
}

export async function savePostAction(id, input) {
  return run(async () => {
    const result = await updatePost(idSchema.parse(id), input);
    if (!result) return { ok: false, error: "Post not found." };
    if (result.post.status === "published") {
      revalidatePublic(result.post.slug, result.previousSlug);
    }
    return { ok: true, post: result.post };
  });
}

export async function publishPostAction(id) {
  return run(async () => {
    const result = await publishPost(idSchema.parse(id));
    if (!result.ok) return { ok: false, error: result.errors.join(" "), errors: result.errors };
    revalidatePublic(result.post.slug);
    return { ok: true, post: result.post };
  });
}

export async function unpublishPostAction(id) {
  return run(async () => {
    const post = await unpublishPost(idSchema.parse(id));
    if (!post) return { ok: false, error: "Post not found." };
    revalidatePublic(post.slug);
    return { ok: true, post };
  });
}

export async function deletePostAction(id) {
  return run(async () => {
    const deleted = await deletePost(idSchema.parse(id));
    if (!deleted) return { ok: false, error: "Post not found." };
    revalidatePublic(deleted.slug);
    return { ok: true };
  });
}
