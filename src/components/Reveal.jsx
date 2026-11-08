import { useEffect, useRef } from "react";
import { gsap, refreshScrollTriggers } from "../lib/gsap";

/**
 * Fades and lifts its children into view once they enter the viewport.
 * Mirrors the original `.reveal-up` GSAP scroll reveal.
 */
export default function Reveal({
  as: Tag = "div",
  className = "",
  start = "top 88%",
  children,
  ...rest
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const animation = gsap.fromTo(
      element,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
        },
      },
    );
    // Re-measure once all sections have mounted (see lib/gsap.js).
    refreshScrollTriggers();

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [start]);

  return (
    <Tag ref={elementRef} className={`reveal-up ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
