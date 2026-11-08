// Studio → local API (studio/integration.mjs, `astro dev` only).
// Same names and { ok, ... } shape the studio has always used.

async function call(action, ...args) {
  try {
    const response = await fetch("/api/studio", {
      method: "POST",
      // Custom header = CORS preflight, so other sites can't post here.
      headers: { "Content-Type": "application/json", "X-Studio": "1" },
      body: JSON.stringify({ action, args }),
    });
    return await response.json();
  } catch {
    return { ok: false, error: "The studio only works while `npm run dev` is running." };
  }
}

export const listPostsAction = () => call("list");
export const getPostAction = (id) => call("get", id);
export const createPostAction = () => call("create");
export const savePostAction = (id, input) => call("save", id, input);
export const publishPostAction = (id) => call("publish", id);
export const unpublishPostAction = (id) => call("unpublish", id);
export const deletePostAction = (id) => call("delete", id);
