import { NextResponse } from "next/server";
import { checkPassword } from "../../../../lib/auth";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "../../../../lib/session";

// Plain HTML form POST → 303 redirect. No client-side transition involved, so
// sign-in works the same in every browser (and without JavaScript).
function back(request, path) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return back(request, "/admin/login?error=origin");
  }

  let password = "";
  try {
    password = String((await request.formData()).get("password") || "");
  } catch {
    return back(request, "/admin/login?error=wrong");
  }

  let ok = false;
  try {
    ok = password.length > 0 && checkPassword(password);
  } catch (error) {
    console.error("[login]", error.message);
    return back(request, "/admin/login?error=config");
  }

  if (!ok) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return back(request, "/admin/login?error=wrong");
  }

  const response = back(request, "/admin");
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
