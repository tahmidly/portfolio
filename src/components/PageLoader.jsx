"use client";

import { useEffect, useRef, useState } from "react";
import "./PageLoader.css";

/**
 * Full-screen intro loader. Rendered in the server HTML so it covers the
 * page before hydration, then fades out once `done` flips true.
 * `progress` is a 0–100 target; the counter eases toward it.
 */
export default function PageLoader({ progress, done, onExited }) {
  const [shown, setShown] = useState(0);
  const [exiting, setExiting] = useState(false);
  const shownRef = useRef(0);

  // Ease the visible counter toward the target.
  useEffect(() => {
    const target = done ? 100 : progress;
    let frame;
    const tick = () => {
      const current = shownRef.current;
      const next = current + (target - current) * (done ? 0.35 : 0.12);
      shownRef.current = Math.abs(target - next) < 0.5 ? target : next;
      setShown(shownRef.current);
      if (shownRef.current !== target) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress, done]);

  // Once the bar is full, play the exit and notify the parent.
  useEffect(() => {
    if (!done || shown < 100) return undefined;
    setExiting(true);
    const timer = setTimeout(() => onExited?.(), 650);
    return () => clearTimeout(timer);
  }, [done, shown, onExited]);

  // Lock scrolling while the loader is up.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  const value = Math.round(shown);

  return (
    <div
      className={`page-loader${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={exiting ? "Loaded" : "Loading"}
    >
      <div className="page-loader-inner">
        <div className="page-loader-mark" aria-hidden="true">
          <span className="page-loader-ring" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            width={256}
            height={256}
            className="page-loader-logo"
            fetchPriority="high"
            decoding="sync"
          />
        </div>

        <div className="page-loader-track" aria-hidden="true">
          <span
            className="page-loader-bar"
            style={{ transform: `scaleX(${shown / 100})` }}
          />
        </div>

        <div className="page-loader-meta" aria-hidden="true">
          <span>Loading</span>
          <span className="page-loader-count">
            {String(value).padStart(3, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
