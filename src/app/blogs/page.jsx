import BlogsPage from "../../views/BlogsPage";

export const metadata = {
  title: "Blogs",
  description:
    "Perspectives on design, technology, and the craft of building things.",
  alternates: {
    canonical: "/blogs",
  },
};

export default function Page() {
  return <BlogsPage />;
}
