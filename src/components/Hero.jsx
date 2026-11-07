import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import useHlsVideo from "../hooks/useHlsVideo";
import NoisyShimmerButton from "./ui/NoisyShimmerButton";
import GitHubActivity from "./GitHubActivity";
import "./Hero.css";

export default function Hero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useHlsVideo(videoRef);

  useEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

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

    return () => context.revert();
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero-video-wrap">
        <video
          ref={videoRef}
          className="hero-video"
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
