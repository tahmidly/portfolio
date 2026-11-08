// Plain <img>: covers are already resized/cropped in the studio.
export default function CoverImage({ src, alt, className, sizes, width, height, eager }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
    />
  );
}

const PLACEHOLDERS = ["ph-1", "ph-3", "ph-5", "ph-2", "ph-4"];

/** Stable gradient behind each cover while it loads. */
export function placeholderFor(slug = "") {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PLACEHOLDERS[hash % PLACEHOLDERS.length];
}

/** Shown when a post has no cover: themed gradient + the title's first letter. */
export function CoverFallback({ title = "" }) {
  const letter = title.trim().charAt(0).toUpperCase() || "•";
  return (
    <span className="cover-fallback" aria-hidden="true">
      {letter}
    </span>
  );
}
