import "./RecentWriting.css";

// Classic list of blog posts (cover · title + excerpt · date and reading
// time), in the same style as the Featured projects list. Used for the
// homepage's Recent writing (latest 3 + "All posts") and the full /blogs page
// (every post, newest first, no button). Build `posts` with toListPost().
export default function RecentWriting({
  posts = [],
  id = "writing",
  label = "Writing",
  title = "Recent writing",
  sub = "Notes on life, things I’m learning and small moments.",
  headingAs: Heading = "h2",
  allHref = "/blogs",
}) {
  return (
    <section className="rw" id={id}>
      <div className="rw-inner">
        <header className="rw-header">
          <div>
            <p className="rw-label">{label}</p>
            <Heading className="rw-title">{title}</Heading>
            {sub ? <p className="rw-sub">{sub}</p> : null}
          </div>
          {allHref ? (
            <a className="rw-btn" href={allHref}>
              All posts
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
          ) : null}
        </header>

        {posts.length === 0 ? (
          <p className="rw-empty">
            Nothing published yet &mdash; the first notes are on the way.
          </p>
        ) : (
          <ul className="rw-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <a className="rw-row" href={`/blogs/${post.slug}`}>
                  <span className="rw-thumb">
                    {post.cover ? (
                      <img
                        src={post.cover}
                        alt={post.coverAlt}
                        width="240"
                        height="180"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </span>
                  <span className="rw-main">
                    <span className="rw-name">{post.title}</span>
                    {post.excerpt ? <span className="rw-excerpt">{post.excerpt}</span> : null}
                  </span>
                  <span className="rw-meta">
                    <time className="rw-date" dateTime={post.publishedAt}>
                      {post.date}
                    </time>
                    <span className="rw-time">{post.readingTime}</span>
                  </span>
                  <svg
                    className="rw-arrow"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
