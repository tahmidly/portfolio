import "./RecentWriting.css";

// Classic list of the latest blog posts (date · title + excerpt · reading
// time), in the same style as the Featured projects list. `posts`: the newest
// published posts, passed in by src/pages/index.astro.
export default function RecentWriting({ posts = [] }) {
  return (
    <section className="rw" id="writing">
      <div className="rw-inner">
        <header className="rw-header">
          <div>
            <p className="rw-label">Writing</p>
            <h2 className="rw-title">Recent writing</h2>
            <p className="rw-sub">Notes on life, things I&rsquo;m learning and small moments.</p>
          </div>
          <a className="rw-btn" href="/blogs">
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
                  <time className="rw-date" dateTime={post.publishedAt}>
                    {post.date}
                  </time>
                  <span className="rw-main">
                    <span className="rw-name">{post.title}</span>
                    {post.excerpt ? <span className="rw-excerpt">{post.excerpt}</span> : null}
                  </span>
                  <span className="rw-time">{post.readingTime}</span>
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
