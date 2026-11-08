import { readImage } from "../../lib/storage";

// Serves cover uploads from R2. Files are named by a random UUID and never
// change, so they can be cached forever.
export const GET = async ({ params }) => {
  const image = await readImage(params.name);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(image.body, {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
