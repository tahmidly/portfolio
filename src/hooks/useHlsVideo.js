import { useEffect } from "react";
import Hls from "hls.js";

const VIDEO_SRC =
  "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

/**
 * Attaches the shared HLS background video source to a <video> ref,
 * falling back to native HLS playback on Safari.
 */
export default function useHlsVideo(videoRef) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true });
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = VIDEO_SRC;
      const playOnLoad = () => video.play().catch(() => {});
      video.addEventListener("loadedmetadata", playOnLoad);
      return () => video.removeEventListener("loadedmetadata", playOnLoad);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [videoRef]);
}
