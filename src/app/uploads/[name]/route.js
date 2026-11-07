import { readImage } from "../../../lib/storage";

// Serves locally stored cover uploads. Files are content-addressed by a random
// UUID and never change, so they can be cached forever.
export async function GET(_request, { params }) {
  const { name } = await params;
  const image = await readImage(name);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
