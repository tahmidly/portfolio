import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import useHlsVideo from "../hooks/useHlsVideo";
import { socialLinks } from "../data/portfolio";
import "./Contact.css";

export default function Contact() {
  const videoRef = useRef(null);
  const trackRef = useRef(null);

  useHlsVideo(videoRef);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    // Cancel the CSS fallback animation so GSAP drives the marquee alone.
    track.style.animation = "none";

    const tween = gsap.to(track, {
      xPercent: -50,
      ease: "none",
      duration: 40,
      repeat: -1,
    });

    return () => tween.kill();
  }, []);

  return (
    <section className="contact" id="contact">
      <div className="footer-video-wrap">
        <video
          ref={videoRef}
          className="footer-video"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="footer-overlay" />
      </div>

      <div className="footer-inner">
        <div className="marquee-wrap">
          <div className="marquee-track" ref={trackRef}>
            {Array.from({ length: 10 }).map((_, index) => (
              <span className="marquee-text" key={index}>
                BUILDING THE FUTURE •&nbsp;
              </span>
            ))}
          </div>
        </div>

        <div className="footer-cta">
          <div className="footer-cta-label">Get in touch</div>
          <div className="footer-cta-heading">
            Let's build
            <br />
            something great.
          </div>
          <a href="mailto:hello@alexsinyo.com" className="footer-email-btn">
            hello@alexsinyo.com ↗
          </a>
        </div>

        <div className="footer-bar">
          <div className="social-links">
            {socialLinks.map((label) => (
              <a key={label} className="social-link">
                {label}
              </a>
            ))}
          </div>
          <div className="available-badge">
            <div className="pulse-dot" />
            <a
              href="https://jasawebsite.id/templates/dark-modern-portfolio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Available for projects</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
