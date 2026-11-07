"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "../lib/gsap";
import { navLinks } from "../data/portfolio";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      router.push(sectionId === "hero" ? "/" : `/#${sectionId}`);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`navbar${
        pathname.startsWith("/blogs") ? " navbar--static" : ""
      }`}
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
        <Link
          href="/blogs"
          className={`nav-link${
            pathname.startsWith("/blogs") ? " active" : ""
          }`}
        >
          Blogs
        </Link>
        <div className="nav-divider" />
        <div className="nav-sayhi">
          <div className="nav-sayhi-bg" />
          <div className="nav-sayhi-inner">Say hi ↗</div>
        </div>
      </div>
    </nav>
  );
}
