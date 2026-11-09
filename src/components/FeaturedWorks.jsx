import "./FeaturedWorks.css";

/** "E-commerce · SaaS" → "E-commerce" (the first category reads cleanest). */
function shortTag(tag) {
  return tag.split("·")[0].trim();
}

// Classic, text-first project list (like a table of contents).
// `works`: the featured projects from the studio, passed in by
// src/pages/index.astro.
export default function FeaturedWorks({ works = [] }) {
  if (works.length === 0) return null;

  return (
    <section className="fw" id="works">
      <div className="fw-inner">
        <header className="fw-header">
          <div>
            <p className="fw-label">Selected work</p>
            <h2 className="fw-title">Featured projects</h2>
            <p className="fw-sub">A few things I&rsquo;ve built and cared about.</p>
          </div>
          <a className="fw-btn" href="/works">
            View all
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
        </header>

        {/* The whole row opens the project page; the category and ↗ open
            the live site (they sit above the row link). */}
        <ul className="fw-list">
          {works.map((work) => (
            <li key={work.id} className="fw-row">
              <span className="fw-year">{new Date(work.date).getFullYear()}</span>
              <a className="fw-main" href={`/projects/${work.slug}/`}>
                <span className="fw-name">{work.title}</span>
                <span className="fw-desc">{work.description}</span>
              </a>
              {work.url ? (
                <>
                  <a
                    className="fw-tag"
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortTag(work.tag)}
                  </a>
                  <a
                    className="fw-arrow"
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${work.title} — open the live site`}
                  >
                    <svg
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
                      <path d="M7 17 17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  </a>
                </>
              ) : (
                <>
                  <span className="fw-tag">{shortTag(work.tag)}</span>
                  <span />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
