import { useRef, useState } from "react";
import "./FeaturedWorks.css";

/** "E-commerce · SaaS" → "E-commerce" (the first category reads cleanest). */
function shortTag(tag) {
  return tag.split("·")[0].trim();
}

// Classic, text-first project list (like a table of contents). On devices
// with a mouse, a small black & white thumbnail of the hovered project
// follows the cursor. `works`: the featured projects from the studio,
// passed in by src/pages/index.astro.
export default function FeaturedWorks({ works = [] }) {
  const [active, setActive] = useState(null);
  const previewRef = useRef(null);

  // Move the thumbnail with the cursor (transform only — no re-render).
  const handleMove = (event) => {
    const preview = previewRef.current;
    if (!preview) return;
    preview.style.transform = `translate3d(${event.clientX + 24}px, ${event.clientY - 70}px, 0)`;
  };

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
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
        </header>

        <ul
          className="fw-list"
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(null)}
        >
          {works.map((work, index) => (
            <li key={work.id}>
              <a
                className="fw-row"
                href={work.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(null)}
              >
                <span className="fw-year">{new Date(work.date).getFullYear()}</span>
                <span className="fw-main">
                  <span className="fw-name">{work.title}</span>
                  <span className="fw-desc">{work.description}</span>
                </span>
                <span className="fw-tag">{shortTag(work.tag)}</span>
                <svg className="fw-arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Cursor thumbnail (desktop only; hidden on touch screens in CSS). */}
      <div
        ref={previewRef}
        className={`fw-preview${active !== null ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        {works.map((work, index) => (
          <img
            key={work.id}
            src={work.image}
            alt=""
            className={index === active ? "is-active" : ""}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
}
