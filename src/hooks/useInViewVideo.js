import { useEffect } from "react";

/**
 * Plays a muted background video only while it is on (or near) the screen,
 * and pauses it otherwise, so off-screen videos don't use CPU/battery.
 *
 * With `lazySrc`, the video has no `src` until it first gets close to the
 * viewport, so it isn't downloaded at all for visitors who never scroll there.
 */
export default function useInViewVideo(videoRef, { lazySrc = null, rootMargin = "200px" } = {}) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      if (lazySrc && !video.src) video.src = lazySrc;
      video.play().catch(() => {});
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (lazySrc && !video.getAttribute("src")) video.src = lazySrc;
          video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef, lazySrc, rootMargin]);
}
