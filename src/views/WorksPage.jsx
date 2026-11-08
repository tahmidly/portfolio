import BackCircle from "../components/BackCircle";
import { formatPostDate } from "../lib/format";
import "./BlogsPage.css";
import "./WorksPage.css";

// All published projects as a list, in the same style as the blogs page.
export default function WorksPage({ works = [] }) {
  return (
    <main className="blogs-page works-page">
      <div className="page-glow" aria-hidden="true" />

      <BackCircle to="/" label="Back to portfolio" />

      <section className="blogs-hero">
        <div className="blogs-hero-content">
          <div className="section-eyebrow blogs-hero-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Selected Work</span>
            <div className="eyebrow-line" />
          </div>
          <h1 className="blogs-hero-title">
            All <em>projects</em>
          </h1>
          <p className="blogs-hero-sub">
            A selection of projects I&apos;ve worked on, from concept to
            launch.
          </p>
        </div>
      </section>

      <section className="blogs-list-section">
        <div className="blogs-inner">
          {works.length === 0 ? (
            <p className="blogs-empty">New projects are on the way.</p>
          ) : (
            <div className="blogs-list">
              {works.map((work, index) => {
                const external = /^https?:\/\//i.test(work.url);
                const Card = work.url ? "a" : "div";
                return (
                  <Card
                    key={work.id}
                    id={work.slug}
                    className="blog-card work-row"
                    {...(work.url
                      ? {
                          href: work.url,
                          ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
                          "aria-label": `${work.title} — open project`,
                        }
                      : {})}
                  >
                    <div className={`work-row-thumb ${work.placeholder}`}>
                      {work.image ? (
                        <img
                          src={work.image}
                          alt={work.alt}
                          className="placeholder-img"
                          loading={index < 3 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      ) : null}
                    </div>
                    <div className="blog-content">
                      <div className="blog-meta">
                        {work.tag ? <span>{work.tag}</span> : null}
                        {work.tag ? <span className="blog-dot" /> : null}
                        <time dateTime={work.date}>{formatPostDate(work.date)}</time>
                      </div>
                      <h2 className="blog-title">{work.title}</h2>
                      <p className="blog-excerpt">{work.description}</p>
                    </div>
                    {work.url ? (
                      <span className="blog-arrow" aria-hidden="true">
                        ↗
                      </span>
                    ) : null}
                  </Card>
                );
              })}
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
