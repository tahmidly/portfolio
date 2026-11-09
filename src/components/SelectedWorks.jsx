import { useEffect } from "react";
import { navigate } from "astro:transitions/client";
import SectionHeader from "./SectionHeader";
import { WorkCardContent, workLinkProps } from "./WorkCard";
import "./SelectedWorks.css";

// `works`: the 3 projects picked in the studio ("Home featured"), each with
// its grid width (`span`). Passed in by src/pages/index.astro.
export default function SelectedWorks({ works = [] }) {
  // "View all work" is a button, not a link, so it isn't prefetched on hover.
  // astro:prefetch is browser-only, so load it lazily (not during SSR).
  useEffect(() => {
    import("astro:prefetch").then(({ prefetch }) => prefetch("/works"));
  }, []);

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
          actionOnClick={() => navigate("/works")}
        />

        <div className="bento-grid">
          {works.map((work) => (
            <a key={work.id} {...workLinkProps(work)}>
              <WorkCardContent work={work} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
