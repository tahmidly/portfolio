import { useEffect, useRef } from "react";
import { gsap, refreshScrollTriggers } from "../lib/gsap";
import { galleryItems } from "../data/portfolio";
import "./Explorations.css";

export default function Explorations() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    // Phones use a compact static grid (Explorations.css): no parallax.
    if (window.matchMedia("(max-width: 640px)").matches) return undefined;

    const context = gsap.context(() => {
      const items = gsap.utils.toArray(".gallery-item");
      const columnOne = items.slice(0, 3);
      const columnTwo = items.slice(3);

      columnOne.forEach((item) => {
        gsap.fromTo(
          item,
          { y: 0 },
          {
            y: -120,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });

      columnTwo.forEach((item) => {
        gsap.fromTo(
          item,
          { y: 0 },
          {
            y: 100,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          },
        );
      });
    }, sectionRef);

    refreshScrollTriggers();
    return () => context.revert();
  }, []);

  return (
    <section className="explorations" id="explorations" ref={sectionRef}>
      <div className="explorations-sticky">
        <div className="explorations-content">
          <div className="section-eyebrow explorations-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Photography</span>
            <div className="eyebrow-line" />
          </div>
          <h2 className="explorations-heading">
            Through <em>my lens</em>
          </h2>
          <p className="explorations-sub">
            A personal collection of places, light and small moments I've
            captured.
          </p>
          <button type="button" className="dribbble-btn">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
            </svg>
            View gallery
          </button>
        </div>
      </div>

      <div className="explorations-gallery">
        <div className="gallery-cols">
          <div className="gallery-col">
            {galleryItems.slice(0, 3).map((item) => (
              <div key={item.id} className="gallery-item" id={item.id}>
                <img
                  src={item.image}
                  alt={item.alt}
                  className="placeholder-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="gallery-col gallery-col--offset">
            {galleryItems.slice(3).map((item) => (
              <div key={item.id} className="gallery-item" id={item.id}>
                <img
                  src={item.image}
                  alt={item.alt}
                  className="placeholder-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
