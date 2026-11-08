// Background video disabled for now.
// import { BACKGROUND_VIDEO } from "../lib/videos";

export default function BlogsVideo() {
  return (
    <div className="blogs-video-bg" aria-hidden="true">
      {/* Background video disabled for now.
      <video
        className="blogs-video"
        src={BACKGROUND_VIDEO}
        autoPlay
        muted
        loop
        playsInline
      />
      */}
      <div className="blogs-video-overlay" />
    </div>
  );
}
