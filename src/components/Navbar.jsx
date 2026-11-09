import { useEffect, useState } from "react";
import { navigate } from "astro:transitions/client";
import { socialLinks } from "../data/portfolio";
import "./Navbar.css";

/** A single blog post: "/blogs/<slug>" (not the "/blogs" list itself). */
function isBlogPost(pathname) {
  return pathname.startsWith("/blogs/") && pathname.length > "/blogs/".length;
}

/** Drop trailing slashes: hosts like Vercel serve "/blogs/" for "/blogs". */
function trimSlash(pathname) {
  let path = pathname;
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
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
// Desktop: logo left, links + "Say hello" right. Phones (≤ 640px):
//   [☰]   [logo]   [Say hello]   — ☰ opens a drawer with every link.
// Desktop links for a personal site. Works and Blog exist; the others are
// pages still to build. `extra` links hide on small tablets to save room.
const DESKTOP_LINKS = [
  { label: "About", href: "/about" },
  { label: "Works", href: "/works" },
  { label: "Blog", href: "/blogs" },
  { label: "Moments", href: "/moments" },
  { label: "Bookshelf", href: "/bookshelf", extra: true },
  { label: "Now", href: "/now", extra: true },
];
const CONTACT_EMAIL = "redfoxtahmid@gmail.com";

export default function Navbar({ pathname: rawPathname = "/" }) {
  const pathname = trimSlash(rawPathname);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onHome = pathname === "/";
  // Blog post reading page: the navbar scrolls away (not sticky); the page's
  // back button and theme toggle stay pinned instead.
  const reading = isBlogPost(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

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

  const handleNavClick = (sectionId) => {
    setDrawerOpen(false);
    if (pathname !== "/") {
      navigate(sectionId === "hero" ? "/" : `/#${sectionId}`);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
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
      {/* ─── Desktop / tablet: logo left, links + "Say hi" pill right ─── */}
      <div className="nav-bar nav-desktop">
        <div className="nav-bar-inner">
          <a href="/" className="nav-logo" aria-label="Meer Tahmid — home" onClick={goHomeTop}>
            <img src="/logom-small.png" alt="" width={33} height={36} className="nav-logo-img" />
          </a>
          <div className="nav-links">
            {DESKTOP_LINKS.map((link) => {
              const current =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`nav-link${link.extra ? " nav-link--extra" : ""}${current ? " active" : ""}`}
                  aria-current={current ? "page" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
            <a href={`mailto:${CONTACT_EMAIL}`} className="nav-cta">
              Say hello
            </a>
          </div>
        </div>
      </div>

      {/* ─── Phone bar: [☰]   [logo]   [Say hello] ─── */}
      <div className={`nav-mobile${scrolled ? " scrolled" : ""}`}>
        <button
          type="button"
          className="nav-menu-btn"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="nav-drawer"
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </button>

        <a href="/" className="nav-mobile-logo" aria-label="Meer Tahmid — home" onClick={goHomeTop}>
          <img src="/logom-small.png" alt="" width={33} height={36} className="nav-logo-img" />
        </a>

        <a href={`mailto:${CONTACT_EMAIL}`} className="nav-mobile-cta">
          Say hello
        </a>
      </div>

      {/* ─── Phone drawer (slides in from the left) ─── */}
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
            <img src="/logom-small.png" alt="" width={33} height={36} className="nav-logo-img" />
          </a>
          <button type="button" className="nav-menu-btn" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="nav-drawer-links">
          <a href="/" className={`nav-drawer-link${onHome ? " active" : ""}`} onClick={goHomeTop}>
            Home
          </a>
          {DESKTOP_LINKS.map((link) => {
            const current =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <a
                key={link.label}
                href={link.href}
                className={`nav-drawer-link${current ? " active" : ""}`}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <a href={`mailto:${CONTACT_EMAIL}`} className="nav-drawer-cta">
          Say hello
        </a>

        <div className="nav-drawer-social">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </aside>
    </nav>
  );
}
