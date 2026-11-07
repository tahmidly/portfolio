import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Use in admin pages: redirects to the login page when signed out. */
export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Use in server actions / route handlers / data layer: throws when signed out. */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest();
}

export function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 8) {
    throw new Error("ADMIN_PASSWORD must be set (8+ characters).");
  }
  return timingSafeEqual(digest(candidate), digest(expected));
}
