import AdminPage from "../../views/AdminPage";
import { requireAdminPage } from "../../lib/auth";
import { getAllPosts } from "../../lib/posts";

export const metadata = {
  title: "Studio",
};

export default async function Page() {
  await requireAdminPage();

  let posts = [];
  let loadError = null;
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error("[admin] failed to load posts", error);
    loadError = "Couldn’t load posts from the database.";
  }

  return <AdminPage initialPosts={posts} loadError={loadError} />;
}
