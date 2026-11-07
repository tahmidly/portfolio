import BlogsPage from "../../views/BlogsPage";
import { getPublishedPosts } from "../../lib/posts";

// ISR: served as static HTML; refreshed on publish via revalidatePath and at
// most every 60s as a safety net.
export const revalidate = 60;

export const metadata = {
  title: "Blogs",
  description:
    "Perspectives on design, technology, and the craft of building things.",
  alternates: {
    canonical: "/blogs",
    types: { "application/rss+xml": "/blogs/rss.xml" },
  },
  openGraph: {
    title: "Blogs — Meer Tahmid",
    description:
      "Perspectives on design, technology, and the craft of building things.",
    url: "/blogs",
    type: "website",
  },
};

export default async function Page() {
  const posts = await getPublishedPosts();
  return <BlogsPage posts={posts} />;
}
