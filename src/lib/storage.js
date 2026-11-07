import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Cover image storage. Today: local disk, served by src/app/uploads/[name]/route.js.
// To move to Cloudflare R2 (or S3) later, replace saveImage/readImage only —
// callers just get back a public URL to store in posts.cover_url.

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB
export const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MIME_BY_EXT = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const UPLOAD_NAME = /^[a-z0-9-]+\.(jpg|png|webp)$/;

function uploadsDir() {
  // Statically scoped so the bundler only traces this folder.
  return path.join(process.cwd(), "storage", "uploads");
}

/** Detects the real image type from magic bytes (never trust the browser). */
export function sniffImageType(bytes) {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) return "image/png";
  if (
    b.length >= 12 &&
    String.fromCharCode(...b.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.subarray(8, 12)) === "WEBP"
  ) return "image/webp";
  return null;
}

export async function saveImage(bytes, type) {
  const ext = ALLOWED_TYPES[type];
  if (!ext) throw new Error("Unsupported image type.");
  const name = `${randomUUID()}.${ext}`;
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { url: `/uploads/${name}` };
}

export async function readImage(name) {
  if (!UPLOAD_NAME.test(name)) return null;
  try {
    const bytes = await readFile(path.join(uploadsDir(), name));
    return { bytes, type: MIME_BY_EXT[name.split(".").pop()] };
  } catch {
    return null;
  }
}
