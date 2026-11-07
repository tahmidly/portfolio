import { notFound } from "next/navigation";
import BlogPostPage from "../../../../views/BlogPostPage";
import { requireAdminPage } from "../../../../lib/auth";
import { getPostById } from "../../../../lib/posts";

export const metadata = { title: "Preview" };

// Auth-protected draft preview: renders exactly like the public post page.
export default async function Page({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  return <BlogPostPage post={post} preview />;
}
