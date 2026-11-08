import { useEffect } from "react";
import { navigate } from "astro:transitions/client";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import { CoverFallback } from "./CoverImage";
import "./Journal.css";

export default function Journal({ entries = [] }) {
  // "View all" is a button, not a link, so it isn't prefetched on hover.
  // astro:prefetch is browser-only, so load it lazily (not during SSR).
  useEffect(() => {
    import("astro:prefetch").then(({ prefetch }) => prefetch("/blogs"));
  }, []);

  return (
    <section className="journal" id="journal">
      <div className="journal-inner">
        <SectionHeader
          eyebrow="Journal"
          title={
            <>
              Recent <em>thoughts</em>
            </>
          }
          subtitle="Perspectives on design, technology, and the craft of building things."
          action="View all →"
          actionVariant="shimmer"
          actionOnClick={() => navigate("/blogs")}
        />

        {entries.length === 0 ? (
          <Reveal className="journal-empty">
            <span className="journal-empty-dot" aria-hidden="true" />
            <div>
              <p className="journal-empty-title">First posts are on the way</p>
              <p className="journal-empty-sub">
                Notes on design, motion and building things will show up here
                soon.
              </p>
            </div>
          </Reveal>
        ) : null}

        <div className="journal-list">
          {entries.map((entry) => (
            <Reveal
              as="a"
              key={entry.id}
              href={`/blogs/${entry.id}`}
              className="journal-entry"
              aria-label={entry.title}
            >
              <div className={`journal-thumb ${entry.placeholder}`}>
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.alt}
                    className="placeholder-img rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <CoverFallback title={entry.title} />
                )}
              </div>
              <div className="journal-content">
                <div className="journal-title">{entry.title}</div>
                <div className="journal-meta">
                  <span>{entry.readTime}</span>
                  <span>{entry.date}</span>
                </div>
              </div>
              <div className="journal-arrow">↗</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
