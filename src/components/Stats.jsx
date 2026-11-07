"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import Reveal from "./Reveal";
import { stats } from "../data/portfolio";
import "./Stats.css";

export default function Stats() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray(".stat-number").forEach((element) => {
        ScrollTrigger.create({
          trigger: element,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              element,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
            );
          },
        });
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="stats" id="stats" ref={sectionRef}>
      <div className="stats-inner">
        {stats.map((stat) => (
          <Reveal key={stat.label} className="stat-item">
            <div className="stat-number text-gradient">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
