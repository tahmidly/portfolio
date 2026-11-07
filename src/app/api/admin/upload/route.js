import { isAdmin } from "../../../../lib/auth";
import {
  ALLOWED_TYPES,
  MAX_UPLOAD_BYTES,
  saveImage,
  sniffImageType,
} from "../../../../lib/storage";

export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Same-origin only (the session cookie is SameSite=Lax as well).
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Bad origin." }, { status: 403 });
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) {
    return Response.json({ error: "Image is larger than 4 MB." }, { status: 413 });
  }

  let file;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file || typeof file === "string") {
    return Response.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "Image is larger than 4 MB." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type || !ALLOWED_TYPES[type]) {
    return Response.json(
      { error: "Only JPEG, PNG or WebP images are allowed." },
      { status: 415 },
    );
  }

  const { url } = await saveImage(bytes, type);
  return Response.json({ url }, { status: 201 });
}
