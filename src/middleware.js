import { defineMiddleware } from "astro:middleware";
import { runWithAuth } from "./lib/auth";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

const isProtected = (pathname) =>
  pathname === "/admin" ||
  (pathname.startsWith("/admin/") && pathname !== "/admin/login") ||
  pathname.startsWith("/api/admin/");

// Verifies the session once per request, gates the studio, and makes the
// result available to the data layer via runWithAuth (see src/lib/auth.js).
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const needsSession =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin/");

  let admin = false;
  if (needsSession) {
    try {
      admin = await verifySessionToken(context.cookies.get(SESSION_COOKIE)?.value);
    } catch (error) {
      console.error("[auth]", error.message);
    }
  }
  context.locals.isAdmin = admin;

  if (isProtected(pathname) && !admin) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return context.redirect("/admin/login", 302);
  }

  const response = await runWithAuth({ isAdmin: admin }, next);

  // Every studio route (studio, login, preview) is noindex.
  if (pathname.startsWith("/admin")) {
    try {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    } catch {
      // Redirect responses have immutable headers; nothing to index there.
    }
  }
  return response;
});
