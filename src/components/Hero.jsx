import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { BACKGROUND_VIDEO } from "../lib/videos";
import NoisyShimmerButton from "./ui/NoisyShimmerButton";
import GitHubActivity from "./GitHubActivity";
import PageLoader from "./PageLoader";
import useInViewVideo from "../hooks/useInViewVideo";
import "./Hero.css";

// Survives client-side navigation (Astro's <ClientRouter /> keeps the page's
// JS alive), so the loader only shows on a full page load. window.__mtBooted
// also lets the inline head script in BaseLayout hide the server-rendered
// loader (html.booted) before paint when navigating back home.
let hasBooted = false;

function markBooted() {
  hasBooted = true;
  window.__mtBooted = true;
  document.documentElement.classList.add("booted");
}

const MIN_LOADER_MS = 600;
const MAX_LOADER_MS = 3500;

export default function Hero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  // Always true on the first render so it matches the server HTML; dropped
  // right after hydration when the intro already ran in this tab.
  const [showLoader, setShowLoader] = useState(true);
  const [progress, setProgress] = useState(10);
  const [ready, setReady] = useState(false);
  // Coming back to Home in the same tab: show the hero at once (no loader,
  // no waiting for the video, no replayed intro).
  const revisitRef = useRef(false);
  // Pause the hero video once it is scrolled out of view.
  useInViewVideo(videoRef);

  // Wait for the display font and the first video frames (capped so a slow
  // stream never blocks the page), then release the intro.
  useEffect(() => {
    let cancelled = false;
    if (hasBooted) {
      revisitRef.current = true;
      setShowLoader(false);
      setReady(true);
      return undefined;
    }
    const bump = (amount) => {
      if (!cancelled) setProgress((value) => Math.min(95, value + amount));
    };

    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load('italic 400 1em "Instrument Serif"'),
          document.fonts.ready,
        ]).catch(() => {})
      : Promise.resolve();
    fonts.then(() => bump(35));

    const video = videoRef.current;
    const videoReady = new Promise((resolve) => {
      if (!video || video.readyState >= 3) return resolve();
      video.addEventListener("canplay", resolve, { once: true });
      video.addEventListener("error", resolve, { once: true });
    });
    videoReady.then(() => bump(50));

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    Promise.race([
      Promise.all([fonts, videoReady, wait(MIN_LOADER_MS)]),
      wait(MAX_LOADER_MS),
    ]).then(() => {
      if (cancelled) return;
      markBooted();
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Start the intro as the loader begins to fade, not after it is gone.
  useEffect(() => {
    if (ready) timelineRef.current?.play();
  }, [ready]);

  const handleLoaderExited = useCallback(() => setShowLoader(false), []);

  useEffect(() => {
    // Returning to Home: no intro at all. Building it would hide the text for
    // a frame (fromTo starts at opacity 0) and cause a visible blink.
    if (revisitRef.current) return undefined;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });
      timelineRef.current = timeline;

      timeline.fromTo(
        ".name-reveal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 },
      );

      timeline.fromTo(
        ".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
        "-=0.8",
      );
    }, sectionRef);

    return () => {
      timelineRef.current = null;
      context.revert();
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      {showLoader ? (
        <PageLoader
          progress={progress}
          done={ready}
          onExited={handleLoaderExited}
        />
      ) : null}

      <div className="hero-video-wrap">
        <video
          ref={videoRef}
          className="hero-video"
          src={BACKGROUND_VIDEO}
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-overlay" />
        <div className="hero-fade-bottom" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow blur-in">FRONTEND DEVELOPER / 2025</p>
        <h1 className="hero-name name-reveal">Meer Tahmid</h1>
        <p className="hero-desc blur-in">
          Frontend developer crafting responsive web applications with modern
          React and JavaScript technologies.
        </p>
        <div className="hero-ctas blur-in">
          <NoisyShimmerButton
            type="button"
            onClick={() =>
              document
                .getElementById("works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span className="text-sm font-medium tracking-tight text-white">
              See Works
            </span>
          </NoisyShimmerButton>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Reach out...
          </button>
        </div>
        <GitHubActivity />
      </div>

      <div className="scroll-indicator">
        <span className="scroll-label">Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
