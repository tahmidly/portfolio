// Client-side wrappers for the studio. Same names and return shape as the old
// Next.js server actions, backed by POST /api/admin/posts.

async function call(action, ...args) {
  try {
    const response = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, args }),
    });
    if (response.status === 401) {
      return { ok: false, error: "Your session expired. Sign in again.", unauthorized: true };
    }
    return await response.json();
  } catch {
    return { ok: false, error: "Network error. Check your connection." };
  }
}

export const listPostsAction = () => call("list");
export const getPostAction = (id) => call("get", id);
export const createPostAction = () => call("create");
export const savePostAction = (id, input) => call("save", id, input);
export const publishPostAction = (id) => call("publish", id);
export const unpublishPostAction = (id) => call("unpublish", id);
export const deletePostAction = (id) => call("delete", id);
