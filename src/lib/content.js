// Shared, dependency-free helpers for post content. Safe to import from the
// server, the browser and Node scripts (seed).

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
  return HIGHLIGHT_KEY_BY_COLOR.get(String(color).replace(/\s+/g, "")) || null;
}

export const TEXT_SIZES = ["sm", "md", "lg"];

export const EMPTY_DOC = Object.freeze({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function isSafeHref(href) {
  if (typeof href !== "string") return false;
  const value = href.trim();
  if (!value || value.length > 2048) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.startsWith("#")) return true;
  return /^(https?:|mailto:)/i.test(value);
}

// ─── Sanitizer ───────────────────────────────────────────────────────────────
// Whitelists the exact node/mark/attr set the studio editor can produce.
// Anything else (style attrs, font/color marks, unknown nodes) is dropped.

const BLOCK_CHILDREN = new Set([
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "horizontalRule",
]);
const INLINE = new Set(["text", "hardBreak"]);

function sanitizeMarks(marks) {
  if (!Array.isArray(marks)) return undefined;
  const out = [];
  const seen = new Set();
  for (const mark of marks) {
    if (!mark || typeof mark.type !== "string" || seen.has(mark.type)) continue;
    switch (mark.type) {
      case "bold":
      case "italic":
      case "underline":
      case "strike":
      case "code":
        out.push({ type: mark.type });
        break;
      case "link": {
        const href = mark.attrs?.href;
        if (!isSafeHref(href)) continue;
        out.push({ type: "link", attrs: { href: href.trim() } });
        break;
      }
      case "highlight": {
        const key = highlightKey(mark.attrs?.color);
        if (!key) continue;
        const color = HIGHLIGHTS.find((item) => item.key === key).color;
        out.push({ type: "highlight", attrs: { color } });
        break;
      }
      case "textSize": {
        const size = mark.attrs?.size;
        if (!TEXT_SIZES.includes(size)) continue;
        out.push({ type: "textSize", attrs: { size } });
        break;
      }
      default:
        continue;
    }
    seen.add(mark.type);
  }
  return out.length ? out : undefined;
}

function sanitizeInline(nodes) {
  if (!Array.isArray(nodes)) return [];
  const out = [];
  for (const node of nodes) {
    if (!node || !INLINE.has(node.type)) continue;
    if (node.type === "hardBreak") {
      out.push({ type: "hardBreak" });
      continue;
    }
    if (typeof node.text !== "string" || node.text.length === 0) continue;
    const text = { type: "text", text: node.text.slice(0, 20000) };
    const marks = sanitizeMarks(node.marks);
    if (marks) text.marks = marks;
    out.push(text);
  }
  return out;
}

function withContent(node, content) {
  return content.length ? { ...node, content } : node;
}

function sanitizeBlock(node, depth) {
  if (!node || typeof node.type !== "string" || depth > 12) return null;
  switch (node.type) {
    case "paragraph":
      return withContent({ type: "paragraph" }, sanitizeInline(node.content));
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      return withContent(
        { type: "heading", attrs: { level } },
        sanitizeInline(node.content),
      );
    }
    case "codeBlock": {
      const text = (node.content || [])
        .filter((child) => child?.type === "text" && typeof child.text === "string")
        .map((child) => child.text)
        .join("");
      return withContent(
        { type: "codeBlock" },
        text ? [{ type: "text", text: text.slice(0, 50000) }] : [],
      );
    }
    case "horizontalRule":
      return { type: "horizontalRule" };
    case "blockquote":
      return withContent(
        { type: "blockquote" },
        sanitizeBlocks(node.content, depth + 1),
      );
    case "bulletList":
    case "orderedList": {
      const items = (node.content || [])
        .filter((child) => child?.type === "listItem")
        .map((child) => {
          const content = sanitizeBlocks(child.content, depth + 1);
          return {
            type: "listItem",
            content: content.length ? content : [{ type: "paragraph" }],
          };
        });
      if (!items.length) return null;
      const list = { type: node.type, content: items };
      if (node.type === "orderedList") {
        const start = Number.parseInt(node.attrs?.start, 10);
        if (Number.isFinite(start) && start > 1 && start < 100000) {
          list.attrs = { start };
        }
      }
      return list;
    }
    default:
      return null;
  }
}

function sanitizeBlocks(nodes, depth = 0) {
  if (!Array.isArray(nodes)) return [];
  return nodes
    .filter((node) => BLOCK_CHILDREN.has(node?.type))
    .map((node) => sanitizeBlock(node, depth))
    .filter(Boolean);
}

export function sanitizeDoc(doc) {
  if (!doc || doc.type !== "doc") return { ...EMPTY_DOC, content: [{ type: "paragraph" }] };
  const content = sanitizeBlocks(doc.content).slice(0, 5000);
  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}

// ─── Text helpers ────────────────────────────────────────────────────────────

export function docToPlainText(node) {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (node.type === "hardBreak") return "\n";
  const children = (node.content || []).map(docToPlainText);
  const isBlock = node.type !== "doc" && node.type !== "text";
  return children.join(isBlock ? "" : "\n") + (isBlock ? "\n" : "");
}

export function hasBodyText(doc) {
  return docToPlainText(doc).trim().length > 0;
}

export function estimateReadingTime(doc) {
  const words = docToPlainText(doc).trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

// Legacy `{ type: 'h2' | 'p' | 'quote', text }` blocks → Tiptap JSON.
export function blocksToDoc(blocks = []) {
  const text = (value) => (value ? [{ type: "text", text: value }] : []);
  const content = blocks.map((block) =>
    block.type === "h2"
      ? { type: "heading", attrs: { level: 2 }, content: text(block.text) }
      : { type: "paragraph", content: text(block.text) },
  );
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export function formatPostDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
