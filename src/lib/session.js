// Session token helpers (Web Crypto only), shared by the middleware and the
// login endpoint so both verify the same cookie.
import { getEnv } from "./env";

export const SESSION_COOKIE = "mt_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getKey() {
  const secret = getEnv("AUTH_SECRET");
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_MAX_AGE;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    encoder.encode(`admin.${expires}`),
  );
  return `${expires}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token) {
  if (typeof token !== "string") return false;
  const [expires, signature, extra] = token.split(".");
  if (!expires || !signature || extra !== undefined) return false;
  if (!/^\d+$/.test(expires)) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  try {
    // crypto.subtle.verify is constant-time.
    return await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(`admin.${expires}`),
    );
  } catch {
    return false;
  }
}
