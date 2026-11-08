import BackCircle from "../components/BackCircle";
import { WorkCardContent, workLinkProps } from "../components/WorkCard";
import "./BlogsPage.css";
import "./WorksPage.css";

// Same layout as the blogs page.
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
        <div className="works-page-inner">
          {works.length === 0 ? (
            <p className="blogs-empty">New projects are on the way.</p>
          ) : (
            <div className="bento-grid">
              {works.map((work, index) => (
                <a key={work.id} id={work.id} {...workLinkProps(work)}>
                  <WorkCardContent work={work} eager={index < 2} />
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
