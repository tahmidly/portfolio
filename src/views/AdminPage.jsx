"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  ArrowLeft,
  Bold,
  Code,
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
import { journalEntries } from "../data/portfolio";
import { journalContent } from "../data/journalContent";
import ThemeToggle from "../components/ThemeToggle";
import "./AdminPage.css";

const STORAGE_KEY = "mt_admin_posts_v1";
const THEME_KEY = "admin-theme";

const HIGHLIGHTS = [
  { name: "Cyan", color: "rgba(27, 204, 254, 0.25)" },
  { name: "Yellow", color: "rgba(250, 204, 21, 0.28)" },
  { name: "Pink", color: "rgba(244, 114, 182, 0.26)" },
  { name: "Gray", color: "rgba(163, 163, 163, 0.22)" },
];

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
});

function textNode(text) {
  return text ? [{ type: "text", text }] : [];
}

function blocksToDoc(blocks = []) {
  const content = blocks.map((block) => {
    if (block.type === "h2") {
      return {
        type: "heading",
        attrs: { level: 2 },
        content: textNode(block.text),
      };
    }
    return {
      type: "paragraph",
      content: textNode(block.text),
    };
  });

  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}

function makeSeedPosts() {
  return journalEntries.map((entry) => ({
    id: entry.id,
    slug: entry.id,
    title: entry.title,
    excerpt: journalContent[entry.id]?.excerpt || "",
    cover: entry.image,
    alt: entry.alt,
    placeholder: entry.placeholder,
    content: blocksToDoc(journalContent[entry.id]?.content),
    status: "published",
    date: entry.date,
    readTime: entry.readTime,
  }));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function saveLabel(state) {
  if (state === "saving") return "Saving…";
  if (state === "saved") return "Saved locally";
  if (state === "error") return "Save failed";
  return "Local draft";
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

function Dashboard({ posts, loaded, onCreate, onEdit, onDelete }) {
  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">Content studio</p>
          <h1>Blog posts</h1>
          <p className="admin-sub">
            Create, edit and remove posts. Typography stays locked to the site.
          </p>
        </div>
        <button type="button" className="admin-primary" onClick={onCreate}>
          <Plus size={16} />
          New post
        </button>
      </header>

      {!loaded ? (
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
                <div className={`admin-post-thumb ${post.placeholder || ""}`}>
                  {post.cover ? (
                    <img src={post.cover} alt={post.alt || ""} />
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
                <span>{post.date}</span>
                <small>{post.readTime}</small>
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
                  onClick={() => onDelete(post.id)}
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
        Edits are saved in this browser for now. Publishing to the live site is
        the next phase.
      </p>
    </div>
  );
}

function PostEditor({ post, onChange, onDelete, onBack, saveState }) {
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
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Start writing. Select text to format it…",
      }),
      TextSize,
    ],
    content:
      post.content || {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    editorProps: {
      attributes: {
        class: "admin-tiptap",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange({ content: currentEditor.getJSON() });
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
    const nextSlug =
      !post.slug || post.slug === "untitled"
        ? slugify(value) || "untitled"
        : post.slug;
    onChange({ title: value, slug: nextSlug });
  };

  const handleCoverFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Keep the cover under 2 MB while drafts are stored locally.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ cover: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href || "https://";
    const url = window.prompt("Link URL", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  if (!editor) {
    return <div className="admin-loading">Loading editor…</div>;
  }

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
            className="admin-select"
            value={post.status}
            onChange={(event) => onChange({ status: event.target.value })}
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
            onChange={(event) => onChange({ slug: slugify(event.target.value) })}
            placeholder="post-slug"
          />
        </label>
        <label className="admin-field">
          <span>Read time</span>
          <input
            className="admin-input"
            value={post.readTime}
            onChange={(event) => onChange({ readTime: event.target.value })}
            placeholder="6 min read"
          />
        </label>
      </div>

      <div className="admin-cover">
        <label
          className={`admin-cover-preview${
            post.placeholder ? ` ${post.placeholder}` : ""
          }`}
          title={post.cover ? "Change cover image" : "Add a cover image"}
        >
          {post.cover ? (
            <img src={post.cover} alt={post.alt || "Post cover"} />
          ) : (
            <div className="admin-cover-empty">
              <ImageIcon size={22} />
              <span>Add a cover image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="admin-cover-input"
            onChange={(event) => {
              handleCoverFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {post.cover ? (
          <button
            type="button"
            className="admin-cover-clear"
            onClick={() => onChange({ cover: "" })}
          >
            Remove cover
          </button>
        ) : null}
      </div>

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

        <EditorContent editor={editor} className="admin-editor" />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [saveState, setSaveState] = useState("idle");

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPosts(Array.isArray(parsed) ? parsed : makeSeedPosts());
      } else {
        setPosts(makeSeedPosts());
      }
    } catch {
      setPosts(makeSeedPosts());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return undefined;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [posts, loaded]);

  const selectedPost = posts.find((post) => post.id === selectedId) || null;

  const updatePost = (id, patch) => {
    setPosts((current) =>
      current.map((post) => (post.id === id ? { ...post, ...patch } : post)),
    );
  };

  const createPost = () => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `post-${Date.now()}`;
    const post = {
      id,
      slug: "untitled",
      title: "",
      excerpt: "",
      cover: "",
      alt: "",
      placeholder: "",
      content: { type: "doc", content: [{ type: "paragraph" }] },
      status: "draft",
      date: todayLabel(),
      readTime: "1 min read",
    };
    setPosts((current) => [post, ...current]);
    setSelectedId(id);
  };

  const deletePost = (id) => {
    const post = posts.find((item) => item.id === id);
    if (!post) return;
    if (!window.confirm(`Delete “${post.title || "Untitled post"}”?`)) return;
    setPosts((current) => current.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  };

  return (
    <main className={`admin-page${selectedPost ? " admin-page-editing" : ""}`}>
      {!selectedPost ? (
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <NextLink href="/" className="admin-brand-link">
              ← Meer Tahmid
            </NextLink>
            <span className="admin-brand-sub">Studio</span>
          </div>

          <button type="button" className="admin-primary admin-new" onClick={createPost}>
            <Plus size={16} />
            New post
          </button>

          <div className="admin-sidebar-label">Overview</div>

          <div className="admin-sidebar-stats">
            <div>
              <span>All posts</span>
              <strong>{posts.length}</strong>
            </div>
            <div>
              <span>Published</span>
              <strong>
                {posts.filter((post) => post.status === "published").length}
              </strong>
            </div>
            <div>
              <span>Drafts</span>
              <strong>
                {posts.filter((post) => post.status === "draft").length}
              </strong>
            </div>
          </div>

          <div className="admin-sidebar-label">Quick links</div>

          <div className="admin-sidebar-links">
            <NextLink href="/blogs">
              <span>View blog</span>
              <span aria-hidden="true">↗</span>
            </NextLink>
            <NextLink href="/">
              <span>Portfolio</span>
              <span aria-hidden="true">↗</span>
            </NextLink>
          </div>

          <div className="admin-sidebar-rule">
            <span>Studio rules</span>
            <p>
              Fixed fonts and colors. Sizes, highlights and inline formatting are
              allowed.
            </p>
          </div>

          <div className="admin-sidebar-foot">
            <span className={`admin-save-state ${saveState}`}>
              {saveLabel(saveState)}
            </span>
            <p>Local drafts. Backend publishing comes next.</p>
          </div>
        </aside>
      ) : null}

      <section className="admin-main">
        {selectedPost ? (
          <PostEditor
            key={selectedPost.id}
            post={selectedPost}
            onChange={(patch) => updatePost(selectedPost.id, patch)}
            onDelete={() => deletePost(selectedPost.id)}
            onBack={() => setSelectedId(null)}
            saveState={saveState}
          />
        ) : (
          <Dashboard
            posts={posts}
            loaded={loaded}
            onCreate={createPost}
            onEdit={setSelectedId}
            onDelete={deletePost}
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
