import { useEffect } from "react";
import { navigate } from "astro:transitions/client";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import { WorkCardContent, workLinkProps } from "./WorkCard";
import { works } from "../data/portfolio";
import "./SelectedWorks.css";

export default function SelectedWorks() {
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
            <Reveal as="a" key={work.id} {...workLinkProps(work)}>
              <WorkCardContent work={work} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
