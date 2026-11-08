import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, timingSafeEqual } from "node:crypto";
import { getEnv } from "./env";

// The middleware verifies the session cookie once per request and runs the
// rest of the request inside this store, so the data layer (src/lib/posts.js)
// can enforce auth without being handed the request.
const requestAuth = new AsyncLocalStorage();

export function runWithAuth(state, fn) {
  return requestAuth.run(state, fn);
}

export function isAdmin() {
  return requestAuth.getStore()?.isAdmin === true;
}

/** Use in endpoints / data layer: throws when signed out. */
export function requireAdmin() {
  if (!isAdmin()) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest();
}

export function checkPassword(candidate) {
  const expected = getEnv("ADMIN_PASSWORD");
  if (!expected || expected.length < 8) {
    throw new Error("ADMIN_PASSWORD must be set (8+ characters).");
  }
  return timingSafeEqual(digest(candidate), digest(expected));
}
