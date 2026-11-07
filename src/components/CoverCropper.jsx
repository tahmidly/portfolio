"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";

// Cover crop dialog: pick a ratio, drag to position, zoom, then export a
// resized WebP (JPEG fallback) that fits the 4 MB upload limit.

const RATIOS = [
  { key: "16:9", label: "16:9", value: 16 / 9, hint: "Recommended — matches the post cover" },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "3:2", label: "3:2", value: 3 / 2 },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "original", label: "Original", value: null },
];

const MAX_OUTPUT_WIDTH = 2000;
const MAX_BYTES = 4 * 1024 * 1024;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Couldn’t read this image."));
    image.src = src;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function exportCrop(src, area) {
  const image = await loadImage(src);
  const scale = Math.min(1, MAX_OUTPUT_WIDTH / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width * scale));
  canvas.height = Math.max(1, Math.round(area.height * scale));
  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  // Prefer WebP; step quality down (then JPEG) until it fits the limit.
  for (const [type, quality] of [
    ["image/webp", 0.9],
    ["image/webp", 0.8],
    ["image/jpeg", 0.85],
    ["image/jpeg", 0.72],
  ]) {
    const blob = await canvasToBlob(canvas, type, quality);
    if (blob && blob.type === type && blob.size <= MAX_BYTES) {
      return { blob, width: canvas.width, height: canvas.height };
    }
  }
  throw new Error("The cropped image is still larger than 4 MB. Try a smaller area.");
}

/** Preset whose ratio matches (within 1%), else "original". */
function presetFor(ratio) {
  if (!ratio) return "original";
  const match = RATIOS.find((item) => item.value && Math.abs(item.value - ratio) / item.value < 0.01);
  return match ? match.key : "original";
}

export default function CoverCropper({ file, src: srcProp, initialRatio = null, onCancel, onDone }) {
  // Object URL is created and revoked in the same effect so it survives
  // StrictMode's mount → unmount → mount cycle.
  const [fileUrl, setFileUrl] = useState(null);
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const src = file ? fileUrl : srcProp;

  // New files start at 16:9; "Adjust crop" reopens on the ratio the cover has.
  const [ratioKey, setRatioKey] = useState(() => (file ? "16:9" : presetFor(initialRatio)));
  const [naturalAspect, setNaturalAspect] = useState(initialRatio || 16 / 9);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ratio = RATIOS.find((item) => item.key === ratioKey);
  const aspect = ratio.value ?? naturalAspect;

  const onCropComplete = useCallback((_, pixels) => setArea(pixels), []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [busy, onCancel]);

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    setError("");
    try {
      await onDone(await exportCrop(src, area));
    } catch (cropError) {
      setError(cropError.message || "Couldn’t crop this image.");
      setBusy(false);
    }
  };

  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true" aria-label="Crop cover image">
      <div className="cropper-panel">
        <header className="cropper-head">
          <h2>Crop cover</h2>
          <p>{ratio.hint || "Drag to position, scroll or use the slider to zoom."}</p>
        </header>

        <div className="cropper-stage">
          {src ? (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            minZoom={1}
            maxZoom={4}
            showGrid
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={({ naturalWidth, naturalHeight }) =>
              setNaturalAspect(naturalWidth / naturalHeight)
            }
            mediaProps={{ crossOrigin: "anonymous" }}
          />
          ) : null}
        </div>

        <div className="cropper-controls">
          <div className="cropper-ratios" role="radiogroup" aria-label="Aspect ratio">
            {RATIOS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={item.key === ratioKey}
                className={`cropper-ratio${item.key === ratioKey ? " is-active" : ""}`}
                onClick={() => {
                  setRatioKey(item.key);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                }}
                disabled={busy}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="cropper-zoom">
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              disabled={busy}
              aria-label="Zoom"
            />
          </label>
        </div>

        {error ? (
          <p className="admin-login-error" role="alert">
            {error}
          </p>
        ) : null}

        <footer className="cropper-actions">
          <button type="button" className="admin-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="admin-primary" onClick={apply} disabled={busy || !area}>
            {busy ? "Uploading…" : "Crop & upload"}
          </button>
        </footer>
      </div>
    </div>
  );
}
