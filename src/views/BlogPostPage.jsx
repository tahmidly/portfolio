import CoverImage, { CoverFallback, placeholderFor } from "../components/CoverImage";
import { formatPostDate } from "../lib/blog";
import "./BlogPostPage.css";

function PostNavCard({ post, direction }) {
  const isNext = direction === "next";
  return (
    <a
      href={`/blogs/${post.slug}`}
      className={`post-nav-card ${isNext ? "is-next" : "is-previous"}`}
      rel={isNext ? "next" : "prev"}
    >
      <div className={`post-nav-thumb ${placeholderFor(post.slug)}`}>
        {post.coverUrl ? (
          <CoverImage
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            className="placeholder-img"
            width={168}
            height={168}
            sizes="84px"
          />
        ) : (
          <CoverFallback title={post.title} />
        )}
      </div>
      <div className="post-nav-text">
        <span className="post-nav-label">
          {isNext ? "Next →" : "← Previous"}
        </span>
        <span className="post-nav-title">{post.title}</span>
      </div>
    </a>
  );
}

// `children` is the rendered Markdown body (passed in from the .astro page).
export default function BlogPostPage({ post, previous = null, next = null, children }) {
  if (!post) return null;
  const hasDims = Boolean(post.coverWidth && post.coverHeight);

  return (
    <main className="post-page">
      <div className="post-glow" aria-hidden="true" />

      <article className="post-article">
        <header>
          <h1 className="post-title">{post.title || "Untitled post"}</h1>
          <div className="post-meta">
            <time dateTime={post.publishedAt || post.updatedAt}>
              {formatPostDate(post.publishedAt || post.updatedAt)}
            </time>
            <span className="post-dot" />
            <span>{post.readingTime}</span>
            <span className="post-dot" />
            <span>By Meer Tahmid</span>
          </div>
        </header>

        {post.coverUrl ? (
          <div
            className={`post-cover ${placeholderFor(post.slug)}${hasDims ? " has-ratio" : ""}`}
            style={hasDims ? { aspectRatio: `${post.coverWidth} / ${post.coverHeight}` } : undefined}
          >
            <CoverImage
              src={post.coverUrl}
              alt={post.coverAlt || post.title}
              className="placeholder-img"
              width={hasDims ? post.coverWidth : 1600}
              height={hasDims ? post.coverHeight : 900}
              sizes="(max-width: 960px) 100vw, 900px"
              eager
            />
          </div>
        ) : null}

        <div className="post-content">{children}</div>

        {previous || next ? (
          <nav className="post-nav" aria-label="More posts">
            {previous ? (
              <PostNavCard post={previous} direction="previous" />
            ) : (
              <span className="post-nav-spacer" aria-hidden="true" />
            )}
            {next ? (
              <PostNavCard post={next} direction="next" />
            ) : (
              <span className="post-nav-spacer" aria-hidden="true" />
            )}
          </nav>
        ) : null}
      </article>
    </main>
  );
}
