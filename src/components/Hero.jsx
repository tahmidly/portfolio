import "./Hero.css";
import { moments } from "../data/moments";

// ─── Edit these to make the hero yours ───
const NAME = "Meer Tahmid";
// Big image on the left (from /public). CSS shows it as a matte black &
// white photo (see Hero.css).
const IMAGE = {
  src: "/me.png",
  alt: "Portrait of Meer Tahmid",
};
// Where I work now and before (shown as links in the intro).
const WORK_NOW = { name: "Ideeza", url: "https://www.ideeza.com/" };
const WORK_BEFORE = {
  name: "Visiontillion",
  url: "https://www.visiontillion.com/en",
};
// Buttons under the intro. Put your resume in /public with this name.
const RESUME_URL = "/resume.pdf";
const STORY_URL = "/about";
// "Moments": the 4 newest moments from the Photobook (src/data/moments.js).
// Hidden until there are some. Small square crops for Unsplash images.
const thumb = (src) =>
  src.includes("images.unsplash.com")
    ? src.replace(/([?&])w=d+/, "$1w=160&h=160")
    : src;
const MOMENTS = moments.slice(0, 4).map((m) => ({
  title: m.title,
  image: thumb(m.image),
  href: `/photobook/${m.slug}/`,
}));
// Where the "…" button leads.
const MORE_MOMENTS_URL = "/photobook";

// Two columns: image on the left, text on the right (stacked on phones).
export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-grid">
        <div className="hero-media">
          <img
            src={IMAGE.src}
            alt={IMAGE.alt}
            width="1088"
            height="1445"
            fetchPriority="high"
          />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Hello, I&rsquo;m
            <br />
            {NAME}.
          </h1>

          <div className="hero-intro">
            {/* Short intro under the headline. */}
            <p className="hero-intro-text">
              I&rsquo;m a software engineer from Bangladesh. At{" "}
              <a href={WORK_NOW.url} target="_blank" rel="noopener noreferrer">
                {WORK_NOW.name}
              </a>
              , I work on browser-based CAD software, including 2D and 3D
              editors and a PCB board builder, that helps people turn hardware
              ideas into real prototypes without writing code. Before that, I
              was at{" "}
              <a
                href={WORK_BEFORE.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {WORK_BEFORE.name}
              </a>
              , a 3D marketplace, where I built the platform&rsquo;s foundation
              from the ground up.
            </p>
            <div className="hero-actions">
              <a
                className="hero-btn hero-btn--primary"
                href={RESUME_URL}
                download
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 4v11" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 20h14" />
                </svg>
                Resume
              </a>
              <a className="hero-btn hero-btn--outline" href={STORY_URL}>
                Read my story
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          {MOMENTS.length > 0 && (
            <>
              <p className="hero-dock-label">Moments</p>
              <div className="hero-dock" role="list" aria-label="Moments">
                {MOMENTS.map((moment) => (
                  <a
                    key={moment.href}
                    href={moment.href}
                    role="listitem"
                    className="hero-dock-item"
                    data-label={moment.title}
                  >
                    <img
                      src={moment.image}
                      alt={moment.title}
                      width="52"
                      height="52"
                      decoding="async"
                    />
                  </a>
                ))}
                <span className="hero-dock-sep" aria-hidden="true" />
                <a
                  className="hero-dock-item hero-dock-more"
                  href={MORE_MOMENTS_URL}
                  data-label="More moments"
                  aria-label="More moments"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    aria-hidden="true"
                  >
                    <circle cx="5" cy="12" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="19" cy="12" r="1.6" />
                  </svg>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
