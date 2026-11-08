import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { BACKGROUND_VIDEO } from "../lib/videos";
import NoisyShimmerButton from "./ui/NoisyShimmerButton";
import { socialLinks } from "../data/portfolio";
import "./Contact.css";

export default function Contact() {
  const trackRef = useRef(null);

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
          className="footer-video"
          src={BACKGROUND_VIDEO}
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
          <div className="footer-email-wrap">
            <NoisyShimmerButton
              type="button"
              aria-label="Email redfoxtahmid@gmail.com"
              onClick={() => {
                window.location.href = "mailto:redfoxtahmid@gmail.com";
              }}
            >
              <span className="text-sm font-medium tracking-tight text-white">
                redfoxtahmid@gmail.com ↗
              </span>
            </NoisyShimmerButton>
          </div>
        </div>

        <div className="footer-bar">
          <div className="social-links">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                className="social-link"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
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
