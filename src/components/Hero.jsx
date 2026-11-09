import "./Hero.css";

// ─── Edit these to make the hero yours ───
const NAME = "Meer Tahmid";
// Big image on the left (from /public). CSS shows it as a matte black &
// white photo (see Hero.css).
const IMAGE = {
  src: "/me.png",
  alt: "Portrait of Meer Tahmid",
};
// Short intro under the headline.
const INTRO =
  "I'm from Bangladesh, where rainy afternoons, strong tea and long conversations shaped who I am. I love slow mornings, wandering new streets and noticing the little things most people walk past. This is my personal space — a place for my stories, my thoughts and the small moments I don't want to forget.";
// Buttons under the intro. Put your resume in /public with this name.
const RESUME_URL = "/resume.pdf";
const STORY_URL = "/about";
// "Moments": placeholder photos for now — swap in your own.
const MOMENTS = [
  {
    title: "Morning coffee",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=160&h=160&q=80&auto=format&fit=crop",
  },
  {
    title: "By the sea",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=160&h=160&q=80&auto=format&fit=crop",
  },
  {
    title: "Up in the hills",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=160&h=160&q=80&auto=format&fit=crop",
  },
  {
    title: "Reading list",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=160&h=160&q=80&auto=format&fit=crop",
  },
];
// Where the "…" button leads (a full moments page, later).
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
            <p className="hero-intro-text">{INTRO}</p>
            <div className="hero-actions">
              <a className="hero-btn hero-btn--primary" href={RESUME_URL} download>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4v11" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 20h14" />
                </svg>
                Resume
              </a>
              <a className="hero-btn hero-btn--outline" href={STORY_URL}>
                Read my story
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          <p className="hero-dock-label">Moments</p>
          <div className="hero-dock" role="list" aria-label="Moments">
            {MOMENTS.map((moment) => (
              <span
                key={moment.title}
                role="listitem"
                className="hero-dock-item"
                data-label={moment.title}
                tabIndex={0}
              >
                <img
                  src={moment.image}
                  alt={moment.title}
                  width="52"
                  height="52"
                  decoding="async"
                />
              </span>
            ))}
            <span className="hero-dock-sep" aria-hidden="true" />
            <a
              className="hero-dock-item hero-dock-more"
              href={MORE_MOMENTS_URL}
              data-label="More moments"
              aria-label="More moments"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="5" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
