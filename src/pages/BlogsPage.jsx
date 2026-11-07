import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useHlsVideo from "../hooks/useHlsVideo";
import { journalEntries } from "../data/portfolio";
import { journalContent } from "../data/journalContent";
import BackCircle from "../components/BackCircle";
import "./BlogsPage.css";

export default function BlogsPage() {
  const videoRef = useRef(null);
  useHlsVideo(videoRef);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Blogs — Meer Tahmid";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="blogs-page">
      <div className="blogs-video-bg" aria-hidden="true">
        <video
          ref={videoRef}
          className="blogs-video"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="blogs-video-overlay" />
      </div>

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
          <div className="blogs-list">
            {journalEntries.map((entry) => (
              <Link
                key={entry.id}
                id={entry.id}
                to={`/blogs/${entry.id}`}
                className="blog-card"
              >
                <div className={`blog-thumb ${entry.placeholder}`}>
                  <img
                    src={entry.image}
                    alt={entry.alt}
                    className="placeholder-img rounded-full"
                    loading="lazy"
                  />
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span>{entry.date}</span>
                    <span className="blog-dot" />
                    <span>{entry.readTime}</span>
                  </div>
                  <h2 className="blog-title">{entry.title}</h2>
                  <p className="blog-excerpt">
                    {journalContent[entry.id]?.excerpt}
                  </p>
                </div>
                <span className="blog-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>

          <footer className="blogs-footer">
            <Link to="/" className="blogs-footer-link">
              ← Back home
            </Link>
            <span>© 2026 Meer Tahmid</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
