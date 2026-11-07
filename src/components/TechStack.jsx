"use client";

import "./TechStack.css";

const techStack = [
  { name: "React", icon: "/tech/react.png" },
  { name: "Next.js", icon: "/tech/nextjs.png" },
  { name: "TypeScript", icon: "/tech/typescript.png" },
  { name: "JavaScript", icon: "/tech/javascript.png" },
  { name: "Tailwind CSS", icon: "/tech/tailwindcss.png" },
  { name: "Node.js", icon: "/tech/nodejs.png" },
  { name: "MongoDB", icon: "/tech/mongodb.png" },
  { name: "PostgreSQL", icon: "/tech/postgresql.png" },
  { name: "Git", icon: "/tech/git.png" },
  { name: "GitHub", icon: "/tech/github.png" },
  { name: "Docker", icon: "/tech/docker.png" },
  { name: "Figma", icon: "/tech/figma.png" },
  { name: "Vite", icon: "/tech/vitejs.png" },
  { name: "Python", icon: "/tech/python.png" },
];

const rowOne = techStack.slice(0, 7);
const rowTwo = techStack.slice(7);

function MarqueeRow({ items, direction }) {
  return (
    <div className={`tech-marquee tech-marquee--${direction}`}>
      <div className="tech-marquee__track">
        {[0, 1, 2].map((group) => (
          <div
            key={group}
            className="tech-marquee__group"
            aria-hidden={group === 0 ? undefined : "true"}
          >
            {items.map((tech) => (
              <div
                key={`${group}-${tech.name}`}
                className="tech-item"
                title={tech.name}
              >
                <img
                  src={tech.icon}
                  alt={group === 0 ? tech.name : ""}
                  width="46"
                  height="46"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TechStack() {
  return (
    <section className="tech-stack" aria-label="Tech stack">
      <div className="tech-stack-inner">
        <div className="section-eyebrow tech-stack-eyebrow">
          <div className="eyebrow-line" />
          <span className="eyebrow-text">Tech Stack</span>
          <div className="eyebrow-line" />
        </div>

        <h2 className="section-heading tech-stack-title">
          Tools I <em>build with</em>
        </h2>

        <p className="section-sub tech-stack-sub">
          Technologies I use to design, build and ship modern web experiences.
        </p>

        <div className="tech-marquee-stack">
          <MarqueeRow items={rowOne} direction="left" />
          <MarqueeRow items={rowTwo} direction="right" />
        </div>
      </div>
    </section>
  );
}
