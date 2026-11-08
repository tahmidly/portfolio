import { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
import { ScrollTrigger } from "../lib/gsap";
import { navLinks, socialLinks } from "../data/portfolio";
import "./Navbar.css";

/** Fallback for the back button: a post → its list, a list → home. */
function parentPath(pathname) {
  if (pathname.startsWith("/blogs/")) return "/blogs";
  return "/";
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

// Persisted across client-side navigations (transition:persist in
// BaseLayout); `pathname` is re-passed by each page.
// Desktop: the pill. Phones (≤ 640px):
//   [back]   [Home · Works · Blogs]   [logo]
// (The ☰ button + right-side drawer are commented out for now.)
export default function Navbar({ pathname = "/" }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(pathname !== "/");
  const visitsRef = useRef(0);
  const onHome = pathname === "/";
  const onBlogs = pathname.startsWith("/blogs");
  const onWorks = pathname === "/works";
  // Blog post reading page: the navbar scrolls away (not sticky); the page's
  // own back button and theme toggle stay pinned instead.
  const reading = pathname.startsWith("/blogs/");

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

  // Back is possible after moving between pages here, or when the visitor
  // arrived from another page of this site. Off home there's always a parent.
  useEffect(() => {
    visitsRef.current += 1;
    let fromHere = false;
    try {
      fromHere = Boolean(document.referrer) && new URL(document.referrer).origin === location.origin;
    } catch {
      fromHere = false;
    }
    setCanGoBack(!onHome || visitsRef.current > 1 || fromHere);
  }, [pathname, onHome]);

  // Drawer: close on page change and Escape; lock page scroll while open.
  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const goBack = () => {
    if (visitsRef.current > 1 && window.history.length > 1) {
      window.history.back();
    } else {
      navigate(parentPath(pathname));
    }
  };

  const handleNavClick = (sectionId) => {
    setActive(sectionId);
    setDrawerOpen(false);
    if (pathname !== "/") {
      navigate(sectionId === "hero" ? "/" : `/#${sectionId}`);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const sayHi = () => {
    setDrawerOpen(false);
    if (onHome) {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#contact");
    }
  };

  const goHomeTop = (event) => {
    if (onHome) {
      event.preventDefault();
      handleNavClick("hero");
    }
  };

  return (
    <nav
      className={`navbar${reading ? " navbar--static" : ""}`}
      id="navbar"
    >
      {/* ─── Desktop / tablet pill ─── */}
      <div className={`nav-pill nav-desktop${scrolled ? " scrolled" : ""}`}>
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
              onHome && active === link.id ? " active" : ""
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
        <button type="button" className="nav-sayhi" onClick={sayHi}>
          <div className="nav-sayhi-bg" />
          <div className="nav-sayhi-inner">Say hi ↗</div>
        </button>
      </div>

      {/* ─── Phone bar ─── */}
      <div className="nav-mobile">
        {canGoBack && !reading ? (
          <button type="button" className="nav-round" aria-label="Go back" onClick={goBack}>
            <BackIcon />
          </button>
        ) : (
          <span className="nav-round nav-round-spacer" aria-hidden="true" />
        )}

        <div className={`nav-mobile-links${scrolled ? " scrolled" : ""}`}>
          <a href="/" className={`nav-link${onHome ? " active" : ""}`} onClick={goHomeTop}>
            Home
          </a>
          <a href="/works" className={`nav-link${onWorks ? " active" : ""}`}>
            Works
          </a>
          <a href="/blogs" className={`nav-link${onBlogs ? " active" : ""}`}>
            Blogs
          </a>
        </div>

        <div className="nav-mobile-right">
          <a href="/" className="nav-mobile-logo" aria-label="Meer Tahmid — home" onClick={goHomeTop}>
            <img src="/logo-mark.png" alt="" width={40} height={40} className="nav-logo-img" />
          </a>
          {/* Hamburger menu disabled for now (drawer below is commented out too).
          <button
            type="button"
            className="nav-round"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="nav-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </button>
          */}
        </div>
      </div>

      {/* ─── Phone drawer (slides in from the right) — disabled for now.
      <div
        className={`nav-drawer-backdrop${drawerOpen ? " is-open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="nav-drawer"
        className={`nav-drawer${drawerOpen ? " is-open" : ""}`}
        aria-label="Menu"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="nav-drawer-head">
          <a href="/" className="nav-mobile-logo" aria-label="Meer Tahmid — home" onClick={goHomeTop}>
            <img src="/logo-mark.png" alt="" width={40} height={40} className="nav-logo-img" />
          </a>
          <button type="button" className="nav-round" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="nav-drawer-links">
          <button
            type="button"
            className={`nav-drawer-link${onHome ? " active" : ""}`}
            onClick={() => handleNavClick("hero")}
          >
            Home
          </button>
          <a href="/works" className={`nav-drawer-link${onWorks ? " active" : ""}`}>
            Works
          </a>
          <a href="/blogs" className={`nav-drawer-link${onBlogs ? " active" : ""}`}>
            Blogs
          </a>
        </div>

        <button type="button" className="nav-drawer-cta" onClick={sayHi}>
          Say hi ↗
        </button>

        <div className="nav-drawer-social">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </aside>
      */}
    </nav>
  );
}
