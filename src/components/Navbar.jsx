import { useEffect, useState } from "react";
import { navigate } from "astro:transitions/client";
import { ScrollTrigger } from "../lib/gsap";
import { navLinks } from "../data/portfolio";
import "./Navbar.css";

// Persisted across client-side navigations (transition:persist in
// BaseLayout); `pathname` is re-passed by each page.
export default function Navbar({ pathname = "/" }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const onBlogs = pathname.startsWith("/blogs");
  const onWorks = pathname === "/works";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const worksSection = document.querySelector("#works");
    const journalSection = document.querySelector("#journal");

    const worksTrigger = worksSection
      ? ScrollTrigger.create({
          trigger: worksSection,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActive("works"),
          onLeaveBack: () => setActive("hero"),
        })
      : null;

    const journalTrigger = journalSection
      ? ScrollTrigger.create({
          trigger: journalSection,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActive("journal"),
          onLeaveBack: () => setActive("works"),
        })
      : null;

    return () => {
      worksTrigger?.kill();
      journalTrigger?.kill();
    };
  }, [pathname]);

  const handleNavClick = (sectionId) => {
    setActive(sectionId);
    if (pathname !== "/") {
      navigate(sectionId === "hero" ? "/" : `/#${sectionId}`);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`navbar${onBlogs || onWorks ? " navbar--static" : ""}`}
      id="navbar"
    >
      <div className={`nav-pill${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo" aria-label="Meer Tahmid">
          <img
            src="/logo-mark.png"
            alt="Meer Tahmid logo"
            className="nav-logo-img"
          />
        </div>
        <div className="nav-divider" />
        {navLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            className={`nav-link${
              pathname === "/" && active === link.id ? " active" : ""
            }`}
            data-section={link.id}
            onClick={() => handleNavClick(link.id)}
          >
            {link.label}
          </button>
        ))}
        <a href="/works" className={`nav-link${onWorks ? " active" : ""}`}>
          Works
        </a>
        <a href="/blogs" className={`nav-link${onBlogs ? " active" : ""}`}>
          Blogs
        </a>
        <div className="nav-divider" />
        <div className="nav-sayhi">
          <div className="nav-sayhi-bg" />
          <div className="nav-sayhi-inner">Say hi ↗</div>
        </div>
      </div>
    </nav>
  );
}
