import { BACKGROUND_VIDEO } from "../lib/videos";

export default function BlogsVideo() {
  return (
    <div className="blogs-video-bg" aria-hidden="true">
      <video
        className="blogs-video"
        src={BACKGROUND_VIDEO}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="blogs-video-overlay" />
    </div>
  );
}
