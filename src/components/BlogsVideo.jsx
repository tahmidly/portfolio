"use client";

import { useRef } from "react";
import useHlsVideo from "../hooks/useHlsVideo";

export default function BlogsVideo() {
  const videoRef = useRef(null);
  useHlsVideo(videoRef);

  return (
    <div className="blogs-video-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="blogs-video"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="blogs-video-overlay" />
    </div>
  );
}
