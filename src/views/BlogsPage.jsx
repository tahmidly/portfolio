import BackCircle from "../components/BackCircle";
import CoverImage, { CoverFallback, placeholderFor } from "../components/CoverImage";
import { formatPostDate } from "../lib/blog";
import "./BlogsPage.css";

export default function BlogsPage({ posts = [] }) {
  return (
    <main className="blogs-page">
      <div className="page-glow" aria-hidden="true" />

      <BackCircle to="/" label="Back to portfolio" />

      <section className="blogs-hero">
        <div className="blogs-hero-content">
          <div className="section-eyebrow blogs-hero-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Journal</span>
            <div className="eyebrow-line" />
          </div>
          <h1 className="blogs-hero-title">
            Recent <em>thoughts</em>
          </h1>
          <p className="blogs-hero-sub">
            Perspectives on design, technology, and the craft of building
            things.
          </p>
        </div>
      </section>

      <section className="blogs-list-section">
        <div className="blogs-inner">
          {posts.length === 0 ? (
            <p className="blogs-empty">
              Nothing published yet — new writing is on the way.
            </p>
          ) : (
            <div className="blogs-list">
              {posts.map((post, index) => (
                <a
                  key={post.id}
                  id={post.slug}
                  href={`/blogs/${post.slug}`}
                  className="blog-card"
                >
                  <div className={`blog-thumb ${placeholderFor(post.slug)}`}>
                    {post.coverUrl ? (
                      <CoverImage
                        src={post.coverUrl}
                        alt={post.coverAlt || post.title}
                        className="placeholder-img rounded-full"
                        width={144}
                        height={144}
                        sizes="72px"
                        eager={index < 2}
                      />
                    ) : (
                      <CoverFallback title={post.title} />
                    )}
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <time dateTime={post.publishedAt}>
                        {formatPostDate(post.publishedAt)}
                      </time>
                      <span className="blog-dot" />
                      <span>{post.readingTime}</span>
                    </div>
                    <h2 className="blog-title">{post.title}</h2>
                    <p className="blog-excerpt">{post.excerpt}</p>
                  </div>
                  <span className="blog-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          )}

          <footer className="blogs-footer">
            <a href="/" className="blogs-footer-link">
              ← Back home
            </a>
            <span>© {new Date().getFullYear()} Meer Tahmid</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
