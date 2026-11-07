"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";
import { journalEntries } from "../data/portfolio";
import "./Journal.css";

export default function Journal() {
  const router = useRouter();

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
          actionOnClick={() => router.push("/blogs")}
        />

        <div className="journal-list">
          {journalEntries.map((entry) => (
            <Reveal
              as={Link}
              key={entry.id}
              href={`/blogs/${entry.id}`}
              className="journal-entry"
              aria-label={entry.title}
            >
              <div className={`journal-thumb ${entry.placeholder}`}>
                <img
                  src={entry.image}
                  alt={entry.alt}
                  className="placeholder-img rounded-full"
                  loading="lazy"
                />
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
