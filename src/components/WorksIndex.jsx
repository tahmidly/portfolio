import "./WorksIndex.css";

// Full project catalogue for /works: one two-column block per project.
// Left: name, year, category and live link. Right: the description as a lead,
// the "What it does" bullets from the project's Markdown, and a link to the
// full project page. `works`: every published project, newest first.
export default function WorksIndex({ works = [] }) {
  return (
    <section className="wi">
      <div className="wi-inner">
        <header className="wi-header">
          <p className="wi-label">Work</p>
          <h1 className="wi-title">All projects</h1>
          <p className="wi-sub">Everything I&rsquo;ve built, newest first.</p>
        </header>

        <ol className="wi-list">
          {works.map((work) => (
            <li key={work.id} className="wi-item">
              <div className="wi-side">
                <h2 className="wi-name">
                  <a href={`/projects/${work.slug}/`}>{work.title}</a>
                </h2>
                <p className="wi-facts">
                  <span>{new Date(work.date).getFullYear()}</span>
                  {work.tag ? <span>{work.tag}</span> : null}
                </p>
                {work.url ? (
                  <a
                    className="wi-live"
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    live ↗
                  </a>
                ) : null}
              </div>

              <div className="wi-body">
                <p className="wi-lead">{work.description}</p>
                {work.highlights?.length ? (
                  <ul className="wi-points">
                    {work.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
                <a className="wi-more" href={`/projects/${work.slug}/`}>
                  Read the full story
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
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
