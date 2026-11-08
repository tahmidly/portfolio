import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pencil,
  Plus,
  Redo2,
  Strikethrough,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import CoverCropper from "../components/CoverCropper";
import {
  HIGHLIGHTS,
  estimateReadingTime,
  formatPostDate,
  highlightKey,
  slugify,
} from "../lib/studio";
import {
  createPostAction,
  deletePostAction,
  getPostAction,
  listPostsAction,
  publishPostAction,
  savePostAction,
  unpublishPostAction,
} from "../lib/adminActions";
import { confirmDanger, promptLink, showError, showToast } from "../lib/dialogs";
import "./AdminPage.css";

const THEME_KEY = "admin-theme";
// Originals can be large; the cropper resizes and compresses below the 4 MB upload limit.
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TextSize = Mark.create({
  name: "textSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-size"),
        renderHTML: (attributes) =>
          attributes.size ? { "data-size": attributes.size } : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-size]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
  // Markdown has no font sizes, so keep them as inline HTML in the .md body.
  renderMarkdown(node, helpers) {
    const size = node.attrs?.size;
    const inner = helpers.renderChildren(node);
    if (!size || size === "md") return inner;
    return `<span data-size="${size}" class="post-size-${size}">${inner}</span>`;
  },
});

// Highlight colors as inline HTML too (Markdown `==text==` has no color).
const ColorHighlight = Highlight.extend({
  renderMarkdown(node, helpers) {
    const color = node.attrs?.color || HIGHLIGHTS[0].color;
    return `<mark data-color="${color}" class="post-mark post-mark-${highlightKey(color)}">${helpers.renderChildren(node)}</mark>`;
  },
});

// No autosave: changes are written only when you press Save / Publish.
function saveLabel(state) {
  if (state === "saving") return "Saving…";
  if (state === "saved") return "Saved";
  if (state === "error") return "Save failed";
  if (state === "dirty") return "Unsaved changes";
  return "No changes";
}

/** A new post that exists only in the studio until its first save. */
function blankPost() {
  return {
    id: null,
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    coverAlt: "",
    coverWidth: null,
    coverHeight: null,
    readingTime: "",
    status: "draft",
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

// The studio runs locally (no sign-in); kept so callers stay unchanged.
function goToLogin() {
  window.location.reload();
}

/** Editable fields sent on every autosave (full state, not patches). */
function editableFields(post) {
  return {
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    // Markdown body of the .md file.
    content: post.content || "",
    coverUrl: post.coverUrl,
    coverWidth: post.coverWidth ?? null,
    coverHeight: post.coverHeight ?? null,
    readingTime: post.readingTime,
  };
}

/** Blank read time = "auto" (server estimates it from the body). */
function toEditable(post) {
  const content = post.content || "";
  return {
    ...post,
    content,
    readingTime:
      post.readingTime === estimateReadingTime(content) ? "" : post.readingTime,
  };
}

function summaryOf(post) {
  const { content: _content, ...rest } = post;
  return rest;
}

function ToolButton({ active = false, onClick, label, children, disabled }) {
  return (
    <button
      type="button"
      className={`admin-tool${active ? " is-active" : ""}`}
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message, list, onDismiss }) {
  if (!message && !list?.length) return null;
  return (
    <div className="admin-error-banner" role="alert">
      <div>
        {message}
        {list?.length ? (
          <ul>
            {list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </div>
  );
}

function Dashboard({ posts, loading, error, onRetry, onCreate, onEdit, onDelete, creating }) {
  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">Content studio</p>
          <h1>Blog posts</h1>
          <p className="admin-sub">
            Create, edit and publish posts. Typography stays locked to the site.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary"
          onClick={onCreate}
          disabled={creating}
        >
          <Plus size={16} />
          {creating ? "Creating…" : "New post"}
        </button>
      </header>

      {error ? (
        <div className="admin-empty">
          <p>{error}</p>
          <button type="button" className="admin-secondary" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="admin-loading">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="admin-empty">
          <p>No posts yet.</p>
          <button type="button" className="admin-primary" onClick={onCreate}>
            Create your first post
          </button>
        </div>
      ) : (
        <div className="admin-post-list">
          <div className="admin-post-list-head" aria-hidden="true">
            <span>Post</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {posts.map((post) => (
            <article className="admin-post-row" key={post.id}>
              <div className="admin-post-main">
                <div className="admin-post-thumb">
                  {post.coverUrl ? (
                    <img src={post.coverUrl} alt={post.coverAlt || ""} />
                  ) : (
                    <div className="admin-post-thumb-empty">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>
                <div className="admin-post-info">
                  <button
                    type="button"
                    className="admin-post-title"
                    onClick={() => onEdit(post.id)}
                  >
                    {post.title || "Untitled post"}
                  </button>
                  <p>{post.excerpt || "No excerpt yet."}</p>
                </div>
              </div>

              <div className="admin-post-status">
                <span className={`admin-status ${post.status}`}>
                  {post.status}
                </span>
              </div>

              <div className="admin-post-date">
                <span>{formatPostDate(post.publishedAt || post.updatedAt)}</span>
                <small>{post.readingTime}</small>
              </div>

              <div className="admin-post-actions">
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={() => onEdit(post.id)}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-danger"
                  onClick={() => onDelete(post)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="admin-note">
        Posts are saved as Markdown files in src/content/blog. Commit and deploy
        to publish them on the live site.
      </p>
    </div>
  );
}

function PostEditor({
  post,
  onChange,
  onDelete,
  onBack,
  onCommit,
  saveState,
  publishing,
  error,
  errorList,
  onDismissError,
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      ColorHighlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Start writing. Select text to format it…",
      }),
      TextSize,
      Markdown,
    ],
    content: post.content || "",
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "admin-tiptap",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange({ content: currentEditor.getMarkdown() });
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;
      return {
        p: currentEditor.isActive("paragraph"),
        h2: currentEditor.isActive("heading", { level: 2 }),
        h3: currentEditor.isActive("heading", { level: 3 }),
        bold: currentEditor.isActive("bold"),
        italic: currentEditor.isActive("italic"),
        underline: currentEditor.isActive("underline"),
        strike: currentEditor.isActive("strike"),
        code: currentEditor.isActive("code"),
        bullet: currentEditor.isActive("bulletList"),
        ordered: currentEditor.isActive("orderedList"),
        link: currentEditor.isActive("link"),
        highlight: currentEditor.isActive("highlight"),
        sm: currentEditor.isActive("textSize", { size: "sm" }),
        md: currentEditor.isActive("textSize", { size: "md" }),
        lg: currentEditor.isActive("textSize", { size: "lg" }),
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
      };
    },
  });

  const titleRef = useRef(null);
  const excerptRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  // Status field = what the action button will do; follows the saved status.
  const [targetStatus, setTargetStatus] = useState(post.status);
  useEffect(() => {
    setTargetStatus(post.status);
  }, [post.status]);
  const [uploadError, setUploadError] = useState("");
  const [cropSource, setCropSource] = useState(null);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return undefined;

    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    resize();
    const frame = requestAnimationFrame(resize);
    if (document.fonts) {
      document.fonts.ready.then(resize).catch(() => {});
    }
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [post.title, editor]);

  useEffect(() => {
    const element = excerptRef.current;
    if (!element) return undefined;

    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    resize();
    const frame = requestAnimationFrame(resize);
    if (document.fonts) {
      document.fonts.ready.then(resize).catch(() => {});
    }
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [post.excerpt, editor]);

  const handleTitle = (value) => {
    // Auto-derive the slug until the post has ever been public, as long as the
    // slug still looks auto-generated.
    const autoSlug =
      !post.publishedAt &&
      (!post.slug ||
        post.slug.startsWith("untitled") ||
        post.slug === slugify(post.title));
    onChange({
      title: value,
      slug: autoSlug ? slugify(value) || post.slug : post.slug,
    });
  };

  // Picking a file opens the cropper; the cropped, resized result is uploaded.
  const handleCoverFile = (file) => {
    if (!file) return;
    setUploadError("");
    if (!UPLOAD_TYPES.includes(file.type)) {
      setUploadError("Only JPEG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setUploadError("Image is larger than 20 MB.");
      return;
    }
    setCropSource({ file });
  };

  const uploadCover = async ({ blob, width, height }) => {
    setUploading(true);
    setUploadError("");
    try {
      const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
      const body = new FormData();
      body.append("file", new File([blob], `cover.${ext}`, { type: blob.type }));
      const response = await fetch("/api/studio/upload", {
        method: "POST",
        // Custom header = CORS preflight, so other sites can't post here.
        headers: { "X-Studio": "1" },
        body,
      });
      if (response.status === 401) return goToLogin();
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      onChange({ coverUrl: result.url, coverWidth: width, coverHeight: height });
      setCropSource(null);
    } catch (uploadErr) {
      // Surface the error inside the cropper so the user can retry.
      throw new Error(uploadErr.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const setLink = async () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href || "";
    const url = await promptLink(previous);
    if (url === null) {
      editor.commands.focus();
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return <div className="admin-loading">Loading editor…</div>;
  }

  const isPublished = post.status === "published";
  const wantsPublished = targetStatus === "published";
  const primaryLabel = publishing
    ? wantsPublished
      ? isPublished
        ? "Updating…"
        : "Publishing…"
      : "Saving…"
    : wantsPublished
      ? isPublished
        ? "Update post"
        : "Publish"
      : isPublished
        ? "Unpublish & save draft"
        : "Save draft";
  const statusHint = wantsPublished
    ? isPublished
      ? "Live on /blogs — updates go out when you press Update."
      : "Not live yet — press Publish to put it on /blogs."
    : isPublished
      ? "Currently live — saving as draft will take it off /blogs."
      : "Draft — only you can see it.";

  return (
    <div className="admin-editor-page">
      <header className="admin-editor-head">
        <button type="button" className="admin-back" onClick={onBack}>
          <ArrowLeft size={15} />
          Posts
        </button>
        <div className="admin-editor-head-actions">
          <span className={`admin-save-state ${saveState}`}>
            {saveLabel(saveState)}
          </span>
          <button type="button" className="admin-danger" onClick={onDelete}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </header>

      <ErrorBanner message={error} list={errorList} onDismiss={onDismissError} />

      <textarea
        ref={titleRef}
        className="admin-title-input"
        value={post.title}
        onChange={(event) => handleTitle(event.target.value)}
        placeholder="Untitled post"
        rows={1}
        aria-label="Post title"
      />

      <textarea
        ref={excerptRef}
        className="admin-excerpt-input"
        value={post.excerpt}
        onChange={(event) => onChange({ excerpt: event.target.value })}
        placeholder="Add a short excerpt for the listing…"
        rows={1}
        aria-label="Post excerpt"
      />

      <div className="admin-meta-row">
        <label className="admin-field">
          <span>Status</span>
          <select
            className={`admin-select admin-status-select ${targetStatus}`}
            value={targetStatus}
            onChange={(event) => setTargetStatus(event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Slug</span>
          <input
            className="admin-input"
            value={post.slug}
            onChange={(event) =>
              onChange({ slug: slugify(event.target.value) })
            }
            placeholder="post-slug"
          />
        </label>
        <label className="admin-field">
          <span>Read time</span>
          <input
            className="admin-input"
            value={post.readingTime}
            onChange={(event) => onChange({ readingTime: event.target.value })}
            placeholder={`Auto · ${estimateReadingTime(post.content)}`}
          />
        </label>
      </div>

      <div className="admin-cover">
        <label
          className={`admin-cover-preview${uploading ? " admin-cover-uploading" : ""}`}
          style={
            post.coverUrl && post.coverWidth && post.coverHeight
              ? { aspectRatio: `${post.coverWidth} / ${post.coverHeight}` }
              : undefined
          }
          title={post.coverUrl ? "Change cover image" : "Add a cover image"}
        >
          {post.coverUrl ? (
            <img
              src={post.coverUrl}
              alt={post.coverAlt || "Post cover"}
              onLoad={(event) => {
                // Backfill size for covers uploaded before dimensions were stored.
                const { naturalWidth, naturalHeight } = event.currentTarget;
                if (!post.coverWidth && naturalWidth && naturalHeight) {
                  onChange({ coverWidth: naturalWidth, coverHeight: naturalHeight });
                }
              }}
            />
          ) : (
            <div className="admin-cover-empty">
              <ImageIcon size={22} />
              <span>{uploading ? "Uploading…" : "Add a cover image"}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="admin-cover-input"
            onChange={(event) => {
              handleCoverFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {uploadError ? (
          <p className="admin-login-error" role="alert">
            {uploadError}
          </p>
        ) : (
          <p className="admin-cover-hint">
            {uploading ? "Uploading…" : "Optional · JPEG, PNG or WebP · you can crop after choosing"}
          </p>
        )}
        {post.coverUrl ? (
          <div className="admin-cover-links">
            <button
              type="button"
              className="admin-cover-clear"
              onClick={() =>
                setCropSource({
                  src: post.coverUrl,
                  ratio:
                    post.coverWidth && post.coverHeight
                      ? post.coverWidth / post.coverHeight
                      : null,
                })
              }
            >
              Adjust crop
            </button>
            <button
              type="button"
              className="admin-cover-clear"
              onClick={() => onChange({ coverUrl: "", coverWidth: null, coverHeight: null })}
            >
              Remove cover
            </button>
          </div>
        ) : null}
      </div>

      {cropSource ? (
        <CoverCropper
          file={cropSource.file}
          src={cropSource.src}
          initialRatio={cropSource.ratio ?? null}
          onCancel={() => setCropSource(null)}
          onDone={uploadCover}
        />
      ) : null}

      <div className="admin-editor-card">
        <div
          className="admin-toolbar"
          role="toolbar"
          aria-label="Text formatting"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div className="admin-toolgroup">
            <ToolButton
              active={state?.p}
              label="Paragraph"
              onClick={() =>
                editor.chain().focus().setParagraph().run()
              }
            >
              P
            </ToolButton>
            <ToolButton
              active={state?.h2}
              label="Heading 2"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </ToolButton>
            <ToolButton
              active={state?.h3}
              label="Heading 3"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              H3
            </ToolButton>
          </div>

          <div className="admin-toolgroup">
            <ToolButton
              active={state?.bold}
              label="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold size={15} />
            </ToolButton>
            <ToolButton
              active={state?.italic}
              label="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic size={15} />
            </ToolButton>
            <ToolButton
              active={state?.underline}
              label="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon size={15} />
            </ToolButton>
            <ToolButton
              active={state?.strike}
              label="Strikethrough"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough size={15} />
            </ToolButton>
            <ToolButton
              active={state?.code}
              label="Inline code"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code size={15} />
            </ToolButton>
          </div>

          <div className="admin-toolgroup">
            <ToolButton
              active={state?.bullet}
              label="Bullet list"
              onClick={() =>
                editor.chain().focus().toggleBulletList().run()
              }
            >
              <List size={15} />
            </ToolButton>
            <ToolButton
              active={state?.ordered}
              label="Numbered list"
              onClick={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered size={15} />
            </ToolButton>
            <ToolButton
              active={state?.link}
              label="Link"
              onClick={setLink}
            >
              <LinkIcon size={15} />
            </ToolButton>
            <ToolButton
              label="Divider"
              onClick={() =>
                editor.chain().focus().setHorizontalRule().run()
              }
            >
              —
            </ToolButton>
          </div>

          <div className="admin-toolgroup">
            <ToolButton
              active={state?.sm}
              label="Small text"
              onClick={() =>
                editor.chain().focus().setMark("textSize", { size: "sm" }).run()
              }
            >
              S
            </ToolButton>
            <ToolButton
              active={state?.md}
              label="Normal text"
              onClick={() =>
                editor.chain().focus().setMark("textSize", { size: "md" }).run()
              }
            >
              M
            </ToolButton>
            <ToolButton
              active={state?.lg}
              label="Large text"
              onClick={() =>
                editor.chain().focus().setMark("textSize", { size: "lg" }).run()
              }
            >
              L
            </ToolButton>
          </div>

          <div className="admin-toolgroup admin-highlights">
            {HIGHLIGHTS.map((item) => (
              <button
                key={item.name}
                type="button"
                className="admin-swatch"
                style={{ background: item.color }}
                title={`Highlight ${item.name}`}
                aria-label={`Highlight ${item.name}`}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: item.color })
                    .run()
                }
              />
            ))}
            <button
              type="button"
              className="admin-tool admin-tool-clear"
              title="Clear highlight"
              aria-label="Clear highlight"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              ×
            </button>
          </div>

          <div className="admin-toolgroup admin-toolgroup-end">
            <ToolButton
              label="Undo"
              disabled={!state?.canUndo}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 size={15} />
            </ToolButton>
            <ToolButton
              label="Redo"
              disabled={!state?.canRedo}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 size={15} />
            </ToolButton>
          </div>
        </div>

        <BubbleMenu
          editor={editor}
          className="admin-bubble"
          appendTo={() => document.body}
          options={{
            strategy: "fixed",
            placement: "bottom",
            offset: 10,
            inline: true,
            flip: { padding: { bottom: 96 } },
            shift: { padding: 12 },
          }}
          shouldShow={({ editor: current, state: editorState }) =>
            current.isEditable &&
            !editorState.selection.empty &&
            !current.isActive("codeBlock")
          }
        >
          <div
            className="admin-bubble-inner"
            role="toolbar"
            aria-label="Selection formatting"
            onMouseDown={(event) => event.preventDefault()}
          >
            <div className="admin-bubble-group">
              <ToolButton active={state?.p} label="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}>P</ToolButton>
              <ToolButton active={state?.h2} label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolButton>
              <ToolButton active={state?.h3} label="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolButton>
            </div>
            <div className="admin-bubble-group">
              <ToolButton active={state?.bold} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolButton>
              <ToolButton active={state?.italic} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolButton>
              <ToolButton active={state?.underline} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></ToolButton>
              <ToolButton active={state?.strike} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></ToolButton>
              <ToolButton active={state?.code} label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}><Code size={15} /></ToolButton>
              <ToolButton active={state?.link} label="Link" onClick={setLink}><LinkIcon size={15} /></ToolButton>
            </div>
            <div className="admin-bubble-group">
              <ToolButton active={state?.sm} label="Small text" onClick={() => editor.chain().focus().setMark("textSize", { size: "sm" }).run()}>S</ToolButton>
              <ToolButton active={state?.md} label="Normal text" onClick={() => editor.chain().focus().setMark("textSize", { size: "md" }).run()}>M</ToolButton>
              <ToolButton active={state?.lg} label="Large text" onClick={() => editor.chain().focus().setMark("textSize", { size: "lg" }).run()}>L</ToolButton>
            </div>
            <div className="admin-bubble-group admin-highlights">
              {HIGHLIGHTS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="admin-swatch"
                  style={{ background: item.color }}
                  title={`Highlight ${item.name}`}
                  aria-label={`Highlight ${item.name}`}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: item.color }).run()}
                />
              ))}
              <button
                type="button"
                className="admin-tool admin-tool-clear"
                title="Clear highlight"
                aria-label="Clear highlight"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                ×
              </button>
            </div>
          </div>
        </BubbleMenu>

        <EditorContent editor={editor} className="admin-editor" />
      </div>

      <div className="admin-action-bar" role="region" aria-label="Save and publish">
        <div className="admin-action-info">
          <span className={`admin-status ${post.status}`}>{post.status}</span>
          <span className="admin-action-hint">{statusHint}</span>
        </div>
        <div className="admin-action-buttons">
          {isPublished ? (
            <a
              className="admin-secondary"
              href={`/blogs/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye size={14} />
              View post
            </a>
          ) : null}
          <button
            type="button"
            className={wantsPublished ? "admin-primary" : "admin-secondary admin-save-draft"}
            onClick={() => onCommit(targetStatus)}
            disabled={publishing}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ initialPosts = [], loadError = null }) {
  const [posts, setPosts] = useState(initialPosts);
  const [listError, setListError] = useState(loadError);
  const [listLoading, setListLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [saveState, setSaveState] = useState("idle");
  const [publishing, setPublishing] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [editorErrorList, setEditorErrorList] = useState([]);

  // Autosave bookkeeping: `version` bumps on every local edit; a save only
  // applies server-normalized fields if nothing changed while it was in flight.
  const versionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const editingRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());
  editingRef.current = editing;

  // ─── Theme (per-browser preference only) ───
  useEffect(() => {
    try {
      setTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
    } catch {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore storage failures
    }
    return () => root.classList.remove("light");
  }, [theme]);

  // ─── List ───
  const refreshList = useCallback(async () => {
    setListLoading(true);
    const result = await listPostsAction();
    setListLoading(false);
    if (result.unauthorized) return goToLogin();
    if (!result.ok) {
      setListError(result.error);
      return;
    }
    setListError(null);
    setPosts(result.posts);
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const upsertSummary = useCallback((post) => {
    setPosts((current) => {
      const summary = summaryOf(post);
      const exists = current.some((item) => item.id === post.id);
      return exists
        ? current.map((item) => (item.id === post.id ? { ...item, ...summary } : item))
        : [summary, ...current];
    });
  }, []);

  // ─── Saving ───
  const flushSave = useCallback(() => {
    saveChainRef.current = saveChainRef.current.then(async () => {
      const post = editingRef.current;
      const version = versionRef.current;
      if (!post || version === savedVersionRef.current) return;

      setSaveState("saving");
      const sent = editableFields(post);

      // New post: create its .md file now (first explicit save).
      let id = post.id;
      if (!id) {
        const created = await createPostAction();
        if (!created.ok) {
          setSaveState("error");
          setEditorError(created.error);
          return;
        }
        id = created.post.id;
        editingRef.current = { ...editingRef.current, id };
        setEditing((current) => (current && !current.id ? { ...current, id } : current));
        setUrlPost(id);
      }

      const result = await savePostAction(id, sent);
      if (result.unauthorized) return goToLogin();
      if (!result.ok) {
        setSaveState("error");
        setEditorError(result.error);
        return;
      }

      savedVersionRef.current = Math.max(savedVersionRef.current, version);
      setEditorError("");
      upsertSummary(result.post);
      setEditing((current) => {
        if (!current || (current.id && current.id !== result.post.id)) return current;
        const next = {
          ...current,
          id: result.post.id,
          status: result.post.status,
          publishedAt: result.post.publishedAt,
          updatedAt: result.post.updatedAt,
        };
        // Server may have de-duplicated the slug (e.g. "-2").
        if (current.slug === sent.slug) next.slug = result.post.slug;
        return next;
      });
      setSaveState(versionRef.current === savedVersionRef.current ? "saved" : "saving");
    });
    return saveChainRef.current;
  }, [upsertSummary]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (versionRef.current !== savedVersionRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const updateEditing = (patch) => {
    versionRef.current += 1;
    setSaveState("dirty");
    setEditing((current) => (current ? { ...current, ...patch } : current));
  };

  // ─── Open / close ───
  const setUrlPost = (id) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("post", id);
    else url.searchParams.delete("post");
    window.history.replaceState(null, "", url);
  };

  const openPost = useCallback(async (id) => {
    setOpeningId(id);
    setEditorError("");
    setEditorErrorList([]);
    const result = await getPostAction(id);
    setOpeningId(null);
    if (result.unauthorized) return goToLogin();
    if (!result.ok) {
      setListError(null);
      setEditorError("");
      setUrlPost(null);
      showError(result.error, "Couldn’t open post");
      return;
    }
    versionRef.current = 0;
    savedVersionRef.current = 0;
    setSaveState("idle");
    setEditing(toEditable(result.post));
    setUrlPost(id);
  }, []);

  // Re-open the post that was being edited before a refresh.
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("post");
    if (id) openPost(id);
  }, [openPost]);

  const closeEditor = async () => {
    if (versionRef.current !== savedVersionRef.current) {
      const discard = await confirmDanger({
        title: "Discard unsaved changes?",
        text: "You have changes that aren’t saved. Press Save draft / Update post to keep them.",
        confirmText: "Discard changes",
      });
      if (!discard) return;
      versionRef.current = savedVersionRef.current;
    }
    setSaveState("idle");
    setEditing(null);
    setEditorError("");
    setEditorErrorList([]);
    setUrlPost(null);
  };

  // The .md file is only created when the new post is saved the first time.
  const createPost = () => {
    versionRef.current = 0;
    savedVersionRef.current = 0;
    setSaveState("idle");
    setEditorError("");
    setEditorErrorList([]);
    setEditing(blankPost());
    setUrlPost(null);
  };

  const removePost = async (post) => {
    const confirmed = await confirmDanger({
      title: "Delete this post?",
      text: `“${post.title || "Untitled post"}” will be removed${
        post.status === "published" ? " from the live blog" : ""
      }. This can’t be undone.`,
      confirmText: "Delete post",
    });
    if (!confirmed) return;
    if (!post.id) {
      versionRef.current = savedVersionRef.current;
      backToList();
      return;
    }
    const result = await deletePostAction(post.id);
    if (result.unauthorized) return goToLogin();
    if (!result.ok) {
      showError(result.error, "Couldn’t delete post");
      return;
    }
    showToast("Post deleted");
    setPosts((current) => current.filter((item) => item.id !== post.id));
    if (editingRef.current?.id === post.id) {
      versionRef.current = savedVersionRef.current;
      setEditing(null);
      setUrlPost(null);
    }
  };

  // ─── Save / publish (bottom action bar) ───
  // target = the status chosen in the Status field.
  const commit = async (target) => {
    if (!editing) return;
    const wasPublished = editing.status === "published";
    setPublishing(true);
    setEditorError("");
    setEditorErrorList([]);
    await flushSave();
    // After a flush, any remaining unsaved version means the save failed.
    if (versionRef.current !== savedVersionRef.current) {
      setPublishing(false);
      showError("Your latest changes couldn’t be saved. Check the message above and try again.", "Save failed");
      return;
    }

    const id = editingRef.current?.id;
    let result;
    if (target === "published") {
      result = await publishPostAction(id);
    } else if (wasPublished) {
      result = await unpublishPostAction(id);
    } else {
      setPublishing(false);
      showToast("Draft saved");
      backToList();
      return;
    }
    setPublishing(false);

    if (result.unauthorized) return goToLogin();
    if (!result.ok) {
      // Stay in the editor so the problems can be fixed.
      setEditorError(result.errors?.length ? "Can’t publish yet:" : result.error);
      setEditorErrorList(result.errors || []);
      return;
    }

    showToast(
      target === "published"
        ? wasPublished
          ? "Post updated — changes are live"
          : "Published — live on /blogs"
        : "Moved back to drafts",
    );
    upsertSummary(result.post);
    backToList();
  };

  // After a successful save/publish, return to the posts list.
  const backToList = () => {
    setEditing(null);
    setEditorError("");
    setEditorErrorList([]);
    setSaveState("idle");
    setUrlPost(null);
  };

  const publishedCount = posts.filter((post) => post.status === "published").length;

  return (
    <main className={`admin-page${editing ? " admin-page-editing" : ""}`}>
      {!editing ? (
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <a href="/" className="admin-brand-link">
              ← Meer Tahmid
            </a>
            <span className="admin-brand-sub">Studio</span>
          </div>

          <button
            type="button"
            className="admin-primary admin-new"
            onClick={createPost}
            disabled={creating}
          >
            <Plus size={16} />
            {creating ? "Creating…" : "New post"}
          </button>

          <div className="admin-sidebar-label">Overview</div>

          <div className="admin-sidebar-stats">
            <div>
              <span>All posts</span>
              <strong>{posts.length}</strong>
            </div>
            <div>
              <span>Published</span>
              <strong>{publishedCount}</strong>
            </div>
            <div>
              <span>Drafts</span>
              <strong>{posts.length - publishedCount}</strong>
            </div>
          </div>

          <div className="admin-sidebar-label">Quick links</div>

          <div className="admin-sidebar-links">
            <a href="/blogs">
              <span>View blog</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a href="/">
              <span>Portfolio</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="admin-sidebar-rule">
            <span>Studio rules</span>
            <p>
              Fixed fonts and colors. Sizes, highlights and inline formatting are
              allowed.
            </p>
          </div>

          <div className="admin-sidebar-foot">
            <span className="admin-save-state saved">Local</span>
            <p>Posts are Markdown files in src/content/blog. Commit and deploy to publish.</p>
          </div>
        </aside>
      ) : null}

      <section className="admin-main">
        {editing ? (
          <PostEditor
            key={editing.id}
            post={editing}
            onChange={updateEditing}
            onDelete={() => removePost(editing)}
            onBack={closeEditor}
            onCommit={commit}
            saveState={saveState}
            publishing={publishing}
            error={editorError}
            errorList={editorErrorList}
            onDismissError={() => {
              setEditorError("");
              setEditorErrorList([]);
            }}
          />
        ) : openingId ? (
          <div className="admin-loading">Opening post…</div>
        ) : (
          <Dashboard
            posts={posts}
            loading={listLoading}
            error={listError}
            onRetry={refreshList}
            onCreate={createPost}
            onEdit={openPost}
            onDelete={removePost}
            creating={creating}
          />
        )}
      </section>

      <ThemeToggle
        theme={theme}
        onToggle={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />
    </main>
  );
}
