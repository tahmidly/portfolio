import { getEnv } from "./env";

// Cover image storage: Cloudflare R2 (binding `UPLOADS` in wrangler.jsonc),
// served by src/pages/uploads/[name].js. Locally, `astro dev` emulates the
// bucket on disk under .wrangler/state.

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB
export const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MIME_BY_EXT = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const UPLOAD_NAME = /^[a-z0-9-]+\.(jpg|png|webp)$/;

function bucket() {
  const binding = getEnv("UPLOADS");
  if (!binding) throw new Error("R2 binding UPLOADS is not configured.");
  return binding;
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
  const name = `${crypto.randomUUID()}.${ext}`;
  await bucket().put(name, bytes, { httpMetadata: { contentType: type } });
  return { url: `/uploads/${name}` };
}

export async function readImage(name) {
  if (!UPLOAD_NAME.test(name)) return null;
  const object = await bucket().get(name);
  if (!object) return null;
  return { body: object.body, type: MIME_BY_EXT[name.split(".").pop()] };
}
