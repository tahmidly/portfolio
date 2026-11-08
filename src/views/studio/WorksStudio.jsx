import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  GripVertical,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import CoverCropper from "../../components/CoverCropper";
import {
  createWorkAction,
  deleteWorkAction,
  getFeaturedAction,
  getWorkAction,
  listWorksAction,
  publishWorkAction,
  saveFeaturedAction,
  saveWorkAction,
  unpublishWorkAction,
} from "../../lib/adminActions";
import { confirmDanger, showError, showToast } from "../../lib/dialogs";
import { FEATURED_LAYOUTS, layoutFor } from "../../lib/featuredLayouts";
import { formatPostDate, slugify } from "../../lib/format";
import "./WorksStudio.css";

// Studio sections for projects (src/content/works/*.md) and the home page
// "Selected work" picks (src/data/featured.json). Like posts: nothing is
// written until you press Save / Publish.

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];
const today = () => new Date().toISOString().slice(0, 10);

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

function blankWork() {
  return {
    id: null,
    slug: "",
    title: "",
    tag: "",
    description: "",
    image: "",
    imageAlt: "",
    url: "",
    date: today(),
    status: "draft",
  };
}

const toEditable = (work) => ({ ...work, date: (work.date || "").slice(0, 10) || today() });

// ─── Projects list ───────────────────────────────────────────────────────────

function ProjectsList({ works, loading, error, onRetry, onCreate, onEdit, onDelete }) {
  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">Content studio</p>
          <h1>Projects</h1>
          <p className="admin-sub">
            Everything listed on /works. Pick the 3 for the home page under Home featured.
          </p>
        </div>
        <button type="button" className="admin-primary" onClick={onCreate}>
          <Plus size={16} />
          New project
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
        <div className="admin-loading">Loading projects…</div>
      ) : works.length === 0 ? (
        <div className="admin-empty">
          <p>No projects yet.</p>
          <button type="button" className="admin-primary" onClick={onCreate}>
            Add your first project
          </button>
        </div>
      ) : (
        <div className="admin-post-list">
          <div className="admin-post-list-head" aria-hidden="true">
            <span>Project</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {works.map((work) => (
            <article className="admin-post-row" key={work.id}>
              <div className="admin-post-main">
                <div className="admin-post-thumb">
                  {work.image ? (
                    <img src={work.image} alt={work.imageAlt || ""} />
                  ) : (
                    <div className="admin-post-thumb-empty">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>
                <div className="admin-post-info">
                  <button type="button" className="admin-post-title" onClick={() => onEdit(work.id)}>
                    {work.title || "Untitled project"}
                  </button>
                  <p>{work.tag || work.description || "No description yet."}</p>
                </div>
              </div>
              <div className="admin-post-status">
                <span className={`admin-status ${work.status}`}>{work.status}</span>
              </div>
              <div className="admin-post-date">
                <span>{formatPostDate(work.date)}</span>
              </div>
              <div className="admin-post-actions">
                <button type="button" className="admin-secondary" onClick={() => onEdit(work.id)}>
                  <Pencil size={14} />
                  Edit
                </button>
                <button type="button" className="admin-danger" onClick={() => onDelete(work)}>
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="admin-note">
        Projects are saved as files in src/content/works. Commit and deploy to publish them.
      </p>
    </div>
  );
}

// ─── Project editor ──────────────────────────────────────────────────────────

function ProjectEditor({ work, dirty, saving, error, errorList, onChange, onBack, onDelete, onCommit, onDismissError }) {
  const [targetStatus, setTargetStatus] = useState(work.status);
  const [cropSource, setCropSource] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => setTargetStatus(work.status), [work.status]);

  const handleTitle = (value) => {
    const autoSlug = !work.slug || work.slug.startsWith("untitled") || work.slug === slugify(work.title);
    onChange({ title: value, slug: autoSlug ? slugify(value) : work.slug });
  };

  const handleFile = (file) => {
    if (!file) return;
    setUploadError("");
    if (!UPLOAD_TYPES.includes(file.type)) return setUploadError("Only JPEG, PNG or WebP images are allowed.");
    if (file.size > MAX_SOURCE_BYTES) return setUploadError("Image is larger than 20 MB.");
    setCropSource({ file });
  };

  const uploadImage = async ({ blob }) => {
    setUploading(true);
    try {
      const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
      const body = new FormData();
      body.append("file", new File([blob], `project.${ext}`, { type: blob.type }));
      const response = await fetch("/api/studio/upload?folder=works", {
        method: "POST",
        // Custom header = CORS preflight, so other sites can't post here.
        headers: { "X-Studio": "1" },
        body,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      onChange({ image: result.url });
      setCropSource(null);
    } catch (uploadErr) {
      throw new Error(uploadErr.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const isPublished = work.status === "published";
  const wantsPublished = targetStatus === "published";
  const primaryLabel = saving
    ? "Saving…"
    : wantsPublished
      ? isPublished ? "Update project" : "Publish"
      : isPublished ? "Unpublish & save draft" : "Save draft";

  return (
    <div className="admin-editor-page">
      <header className="admin-editor-head">
        <button type="button" className="admin-back" onClick={onBack}>
          <ArrowLeft size={15} />
          Projects
        </button>
        <div className="admin-editor-head-actions">
          <span className={`admin-save-state ${dirty ? "dirty" : "idle"}`}>
            {dirty ? "Unsaved changes" : "No changes"}
          </span>
          <button type="button" className="admin-danger" onClick={onDelete}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </header>

      <ErrorBanner message={error} list={errorList} onDismiss={onDismissError} />

      <input
        className="admin-title-input works-title-input"
        value={work.title}
        onChange={(event) => handleTitle(event.target.value)}
        placeholder="Project name"
        aria-label="Project name"
      />
      <textarea
        className="admin-excerpt-input works-description-input"
        value={work.description}
        onChange={(event) => onChange({ description: event.target.value })}
        placeholder="One or two sentences about the project…"
        rows={2}
        aria-label="Project description"
      />

      <div className="admin-meta-row works-meta-row">
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
          <span>Tag</span>
          <input
            className="admin-input"
            value={work.tag}
            onChange={(event) => onChange({ tag: event.target.value })}
            placeholder="E-commerce · SaaS"
          />
        </label>
        <label className="admin-field">
          <span>Date</span>
          <input
            type="date"
            className="admin-input"
            value={work.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </label>
      </div>

      <div className="admin-meta-row works-meta-row">
        <label className="admin-field works-field-wide">
          <span>Project link</span>
          <input
            className="admin-input"
            value={work.url}
            onChange={(event) => onChange({ url: event.target.value.trim() })}
            placeholder="https://…"
            inputMode="url"
          />
        </label>
        <label className="admin-field">
          <span>Slug</span>
          <input
            className="admin-input"
            value={work.slug}
            onChange={(event) => onChange({ slug: slugify(event.target.value) })}
            placeholder="project-slug"
          />
        </label>
      </div>

      <div className="admin-cover">
        <label
          className={`admin-cover-preview works-image-preview${uploading ? " admin-cover-uploading" : ""}`}
          title={work.image ? "Change image" : "Add an image"}
        >
          {work.image ? (
            <img src={work.image} alt={work.imageAlt || "Project image"} />
          ) : (
            <div className="admin-cover-empty">
              <ImageIcon size={22} />
              <span>{uploading ? "Uploading…" : "Add a project image"}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="admin-cover-input"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {uploadError ? (
          <p className="admin-login-error" role="alert">{uploadError}</p>
        ) : (
          <p className="admin-cover-hint">
            Required to publish · JPEG, PNG or WebP · or paste an image URL below
          </p>
        )}
        <div className="admin-meta-row works-meta-row">
          <label className="admin-field works-field-wide">
            <span>Image URL</span>
            <input
              className="admin-input"
              value={work.image}
              onChange={(event) => onChange({ image: event.target.value.trim() })}
              placeholder="/works/… or https://…"
            />
          </label>
          <label className="admin-field works-field-wide">
            <span>Image alt text</span>
            <input
              className="admin-input"
              value={work.imageAlt}
              onChange={(event) => onChange({ imageAlt: event.target.value })}
              placeholder="Describe the image"
            />
          </label>
        </div>
      </div>

      {cropSource ? (
        <CoverCropper
          file={cropSource.file}
          src={cropSource.src}
          initialRatio={null}
          onCancel={() => setCropSource(null)}
          onDone={uploadImage}
        />
      ) : null}

      <div className="admin-action-bar" role="region" aria-label="Save and publish">
        <div className="admin-action-info">
          <span className={`admin-status ${work.status}`}>{work.status}</span>
          <span className="admin-action-hint">
            {wantsPublished
              ? isPublished ? "Listed on /works." : "Not listed yet — press Publish."
              : "Draft — not shown on the site."}
          </span>
        </div>
        <div className="admin-action-buttons">
          {isPublished && work.url ? (
            <a className="admin-secondary" href={work.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              Open link
            </a>
          ) : null}
          <button
            type="button"
            className={wantsPublished ? "admin-primary" : "admin-secondary admin-save-draft"}
            onClick={() => onCommit(targetStatus)}
            disabled={saving}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Home featured (drag to arrange) ─────────────────────────────────────────

function FeaturedEditor({ works, loading }) {
  const published = works.filter((work) => work.status === "published");
  const bySlug = new Map(published.map((work) => [work.slug, work]));

  const [layout, setLayout] = useState(FEATURED_LAYOUTS[0].key);
  const [slots, setSlots] = useState([null, null, null]);
  const [saved, setSaved] = useState(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFeaturedAction().then((result) => {
      if (!result.ok) return setError(result.error);
      const picks = [0, 1, 2].map((i) => result.featured.works[i] || null);
      setLayout(result.featured.layout);
      setSlots(picks);
      setSaved(JSON.stringify({ layout: result.featured.layout, works: picks }));
    });
  }, []);

  const current = JSON.stringify({ layout, works: slots });
  const dirty = saved !== null && current !== saved;
  const { spans } = layoutFor(layout);

  const swap = (from, to) => {
    if (from === null || from === to) return;
    setSlots((list) => {
      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const pick = (index, slug) => {
    setSlots((list) => {
      const next = [...list];
      // Picking a project that is in another slot swaps the two.
      const other = next.indexOf(slug);
      if (slug && other !== -1 && other !== index) next[other] = next[index];
      next[index] = slug || null;
      return next;
    });
  };

  const save = async () => {
    const picks = slots.filter(Boolean);
    if (picks.length !== 3) {
      setError("Pick a project for all 3 slots.");
      return;
    }
    setSaving(true);
    setError("");
    const result = await saveFeaturedAction({ layout, works: slots });
    setSaving(false);
    if (!result.ok) return setError(result.error);
    setSaved(JSON.stringify({ layout: result.featured.layout, works: result.featured.works }));
    showToast("Home page projects saved");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">Home page</p>
          <h1>Selected work</h1>
          <p className="admin-sub">
            Pick 3 published projects and drag the cards to arrange the grid.
          </p>
        </div>
        <button type="button" className="admin-primary" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving…" : dirty ? "Save layout" : "Saved"}
        </button>
      </header>

      <ErrorBanner message={error} onDismiss={error ? () => setError("") : null} />

      <div className="featured-layouts" role="radiogroup" aria-label="Grid layout">
        {FEATURED_LAYOUTS.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={layout === option.key}
            className={`featured-layout-option${layout === option.key ? " is-active" : ""}`}
            onClick={() => setLayout(option.key)}
          >
            <span className="featured-layout-mini" aria-hidden="true">
              {option.spans.map((span, i) => (
                <span key={i} style={{ gridColumn: `span ${span}` }} />
              ))}
            </span>
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">Loading projects…</div>
      ) : published.length < 3 ? (
        <div className="admin-empty">
          <p>Publish at least 3 projects to feature them on the home page.</p>
        </div>
      ) : (
        <div className="featured-grid">
          {slots.map((slug, index) => {
            const work = slug ? bySlug.get(slug) : null;
            return (
              <div
                key={index}
                className={`featured-slot${dragOver === index ? " is-over" : ""}${dragFrom === index ? " is-dragging" : ""}`}
                style={{ "--span": spans[index] }}
                draggable={Boolean(work)}
                onDragStart={(event) => {
                  setDragFrom(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(index);
                }}
                onDragLeave={() => setDragOver((over) => (over === index ? null : over))}
                onDrop={(event) => {
                  event.preventDefault();
                  swap(Number(event.dataTransfer.getData("text/plain")), index);
                  setDragFrom(null);
                  setDragOver(null);
                }}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDragOver(null);
                }}
              >
                <div className="featured-slot-media">
                  {work?.image ? <img src={work.image} alt="" draggable={false} /> : null}
                </div>
                <div className="featured-slot-body">
                  <div className="featured-slot-top">
                    <span className="featured-slot-index">
                      <GripVertical size={14} aria-hidden="true" /> Slot {index + 1} · {spans[index]}/12
                    </span>
                  </div>
                  <select
                    className="admin-select featured-slot-select"
                    value={slug || ""}
                    onChange={(event) => pick(index, event.target.value)}
                    aria-label={`Project for slot ${index + 1}`}
                  >
                    <option value="">Choose a project…</option>
                    {published.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.title || option.slug}
                      </option>
                    ))}
                  </select>
                  {work ? <p className="featured-slot-tag">{work.tag}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="admin-note">
        Saved to src/data/featured.json. Commit and deploy to update the live home page.
      </p>
    </div>
  );
}

// ─── Section container ───────────────────────────────────────────────────────

export default function WorksStudio({ section, onEditingChange }) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [editing, setEditing] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errorList, setErrorList] = useState([]);
  const editingRef = useRef(null);
  editingRef.current = editing;

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await listWorksAction();
    setLoading(false);
    if (!result.ok) return setListError(result.error);
    setListError("");
    setWorks(result.works);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, section]);

  useEffect(() => {
    onEditingChange?.(Boolean(editing));
  }, [editing, onEditingChange]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const resetEditor = () => {
    setEditing(null);
    setDirty(false);
    setError("");
    setErrorList([]);
  };

  const openWork = async (id) => {
    const result = await getWorkAction(id);
    if (!result.ok) return showError(result.error, "Couldn’t open project");
    resetEditor();
    setEditing(toEditable(result.work));
  };

  const createWork = () => {
    resetEditor();
    setEditing(blankWork());
  };

  const closeEditor = async () => {
    if (dirty) {
      const discard = await confirmDanger({
        title: "Discard unsaved changes?",
        text: "You have changes that aren’t saved. Press Save draft / Update project to keep them.",
        confirmText: "Discard changes",
      });
      if (!discard) return;
    }
    resetEditor();
  };

  const removeWork = async (work) => {
    const confirmed = await confirmDanger({
      title: "Delete this project?",
      text: `“${work.title || "Untitled project"}” will be removed${
        work.status === "published" ? " from /works and the home page" : ""
      }. This can’t be undone.`,
      confirmText: "Delete project",
    });
    if (!confirmed) return;
    if (!work.id) return resetEditor();
    const result = await deleteWorkAction(work.id);
    if (!result.ok) return showError(result.error, "Couldn’t delete project");
    showToast("Project deleted");
    if (editingRef.current?.id === work.id) resetEditor();
    refresh();
  };

  // Save (creating the file on first save), then publish/unpublish if asked.
  const commit = async (target) => {
    const work = editingRef.current;
    if (!work) return;
    setSaving(true);
    setError("");
    setErrorList([]);

    let id = work.id;
    if (!id) {
      const created = await createWorkAction();
      if (!created.ok) {
        setSaving(false);
        return setError(created.error);
      }
      id = created.work.id;
      setEditing((current) => (current ? { ...current, id } : current));
    }

    const saved = await saveWorkAction(id, {
      title: work.title,
      slug: work.slug,
      tag: work.tag,
      description: work.description,
      image: work.image,
      imageAlt: work.imageAlt,
      url: work.url,
      date: work.date,
    });
    if (!saved.ok) {
      setSaving(false);
      return setError(saved.error);
    }
    setDirty(false);

    let result = saved;
    const wasPublished = work.status === "published";
    if (target === "published") result = await publishWorkAction(id);
    else if (wasPublished) result = await unpublishWorkAction(id);
    setSaving(false);

    if (!result.ok) {
      setEditing((current) => (current ? toEditable({ ...saved.work }) : current));
      setError(result.errors?.length ? "Can’t publish yet:" : result.error);
      setErrorList(result.errors || []);
      refresh();
      return;
    }

    showToast(
      target === "published"
        ? wasPublished ? "Project updated" : "Published — listed on /works"
        : wasPublished ? "Moved back to drafts" : "Draft saved",
    );
    resetEditor();
    refresh();
  };

  if (section === "featured") {
    return <FeaturedEditor works={works} loading={loading} />;
  }

  if (editing) {
    return (
      <ProjectEditor
        key={editing.id || "new"}
        work={editing}
        dirty={dirty}
        saving={saving}
        error={error}
        errorList={errorList}
        onChange={(patch) => {
          setDirty(true);
          setEditing((current) => (current ? { ...current, ...patch } : current));
        }}
        onBack={closeEditor}
        onDelete={() => removeWork(editing)}
        onCommit={commit}
        onDismissError={() => {
          setError("");
          setErrorList([]);
        }}
      />
    );
  }

  return (
    <ProjectsList
      works={works}
      loading={loading}
      error={listError}
      onRetry={refresh}
      onCreate={createWork}
      onEdit={openWork}
      onDelete={removeWork}
    />
  );
}
