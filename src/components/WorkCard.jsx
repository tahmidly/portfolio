import "./SelectedWorks.css";

/** Link props shared by every work card (opens the live project). */
export function workLinkProps(work) {
  return {
    href: work.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: `work-card ${work.span}`,
    "aria-label": `${work.title} — open project`,
  };
}

/** Inside of a work card: image, halftone, hover label and meta. */
export function WorkCardContent({ work, eager = false }) {
  return (
    <>
      <div className={`work-card-img ${work.placeholder}`}>
        <img
          src={work.image}
          alt={work.alt}
          className="placeholder-img"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
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
    </>
  );
}
