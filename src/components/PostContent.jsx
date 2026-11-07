import { Fragment } from "react";
import { highlightKey, isSafeHref, sanitizeDoc, TEXT_SIZES } from "../lib/content";

// Server renderer for the studio's Tiptap JSON. Produces React elements (no
// HTML strings), re-sanitizes on read, and only emits post-* classes — never
// inline font or color styles — so the fixed public typography always wins.

function isExternal(href) {
  return /^https?:/i.test(href);
}

function renderMarks(text, marks = [], key) {
  // Apply inner-most marks first so links wrap formatted text.
  const order = ["textSize", "highlight", "code", "strike", "underline", "italic", "bold", "link"];
  const sorted = [...marks].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  return sorted.reduce((child, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{child}</strong>;
      case "italic":
        return <em>{child}</em>;
      case "underline":
        return <u>{child}</u>;
      case "strike":
        return <s>{child}</s>;
      case "code":
        return <code className="post-code">{child}</code>;
      case "highlight": {
        const tone = highlightKey(mark.attrs?.color);
        return tone ? <mark className={`post-mark post-mark-${tone}`}>{child}</mark> : child;
      }
      case "textSize": {
        const size = mark.attrs?.size;
        if (!TEXT_SIZES.includes(size) || size === "md") return child;
        return <span className={`post-size-${size}`}>{child}</span>;
      }
      case "link": {
        const href = mark.attrs?.href;
        if (!isSafeHref(href)) return child;
        return isExternal(href) ? (
          <a className="post-link" href={href} target="_blank" rel="noopener noreferrer">
            {child}
          </a>
        ) : (
          <a className="post-link" href={href}>
            {child}
          </a>
        );
      }
      default:
        return child;
    }
  }, <Fragment key={key}>{text}</Fragment>);
}

function renderInline(nodes = []) {
  return nodes.map((node, index) => {
    if (node.type === "hardBreak") return <br key={index} />;
    return <Fragment key={index}>{renderMarks(node.text, node.marks, index)}</Fragment>;
  });
}

function renderBlock(node, key, inList = false) {
  switch (node.type) {
    case "paragraph":
      if (!node.content?.length) return null;
      return (
        <p key={key} className={inList ? "post-p post-li-p" : "post-p"}>
          {renderInline(node.content)}
        </p>
      );
    case "heading": {
      if (!node.content?.length) return null;
      return node.attrs?.level === 3 ? (
        <h3 key={key} className="post-h3">
          {renderInline(node.content)}
        </h3>
      ) : (
        <h2 key={key} className="post-h2">
          {renderInline(node.content)}
        </h2>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="post-ul">
          {node.content.map((item, i) => (
            <li key={i}>{renderBlocks(item.content, true)}</li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="post-ol" start={node.attrs?.start}>
          {node.content.map((item, i) => (
            <li key={i}>{renderBlocks(item.content, true)}</li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote key={key} className="post-quote">
          {renderBlocks(node.content)}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre key={key} className="post-pre">
          <code>{node.content?.[0]?.text || ""}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} className="post-hr" />;
    default:
      return null;
  }
}

function renderBlocks(nodes = [], inList = false) {
  return nodes.map((node, index) => renderBlock(node, index, inList));
}

export default function PostContent({ doc }) {
  const safe = sanitizeDoc(doc);
  return <div className="post-content">{renderBlocks(safe.content)}</div>;
}
