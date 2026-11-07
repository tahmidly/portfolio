import Link from "next/link";
import BackCircle from "../components/BackCircle";
import "../views/BlogPostPage.css";

// A real 404 (status 404), not a redirect — redirecting missing pages to the
// home page is treated as a "soft 404" by Google.
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="post-page">
      <div className="post-glow" aria-hidden="true" />
      <BackCircle to="/" label="Back home" />
      <article className="post-article">
        <h1 className="post-title">This page doesn’t exist.</h1>
        <p className="post-p">
          The link may be old, or the post may have been unpublished.
        </p>
        <footer className="post-footer">
          <Link href="/blogs">← All thoughts</Link>
          <Link href="/">Back home</Link>
        </footer>
      </article>
    </main>
  );
}
