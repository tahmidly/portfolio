// Studio-only constants (browser). Highlights and text sizes are stored in
// the Markdown body as small inline HTML tags, which Markdown allows:
//   <mark data-color="…" class="post-mark post-mark-cyan">text</mark>
//   <span data-size="lg" class="post-size-lg">text</span>
// The editor reads them back via data-color / data-size; the public post page
// styles them via the classes (src/views/BlogPostPage.css).

export const HIGHLIGHTS = [
  { name: "Cyan", key: "cyan", color: "rgba(27, 204, 254, 0.25)" },
  { name: "Yellow", key: "yellow", color: "rgba(250, 204, 21, 0.28)" },
  { name: "Pink", key: "pink", color: "rgba(244, 114, 182, 0.26)" },
  { name: "Gray", key: "gray", color: "rgba(163, 163, 163, 0.22)" },
];

const HIGHLIGHT_KEY_BY_COLOR = new Map(
  HIGHLIGHTS.map((item) => [item.color.replace(/\s+/g, ""), item.key]),
);

export function highlightKey(color) {
  if (!color) return HIGHLIGHTS[0].key;
  return HIGHLIGHT_KEY_BY_COLOR.get(String(color).replace(/\s+/g, "")) || HIGHLIGHTS[0].key;
}

export const TEXT_SIZES = ["sm", "md", "lg"];

export { estimateReadingTime, formatPostDate, slugify } from "./format";
