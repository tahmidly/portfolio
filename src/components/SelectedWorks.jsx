import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import { works } from "../data/portfolio";
import "./SelectedWorks.css";

export default function SelectedWorks() {
  return (
    <section className="works" id="works">
      <div className="works-inner">
        <SectionHeader
          eyebrow="Selected Work"
          title={
            <>
              Featured <em>projects</em>
            </>
          }
          subtitle="A selection of projects I've worked on, from concept to launch."
          action="View all work →"
          actionVariant="shimmer"
        />

        <div className="bento-grid">
          {works.map((work) => (
            <Reveal
              as="a"
              key={work.id}
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`work-card ${work.span}`}
              aria-label={`${work.title} — open project`}
            >
              <div className={`work-card-img ${work.placeholder}`}>
                <img
                  src={work.image}
                  alt={work.alt}
                  className="placeholder-img"
                  loading="lazy"
                />
              </div>
              <div className="work-card-halftone" />
              <div className="work-card-hover">
                <div className="work-card-label">
                  View — <em>{work.title}</em>
                </div>
              </div>
              <div className="work-card-meta">
                <span className="work-card-tag">{work.tag}</span>
                <div className="work-card-title">{work.title}</div>
                <p className="work-card-desc">{work.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
