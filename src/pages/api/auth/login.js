import { checkPassword } from "../../../lib/auth";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "../../../lib/session";

// Plain HTML form POST → 303 redirect, so sign-in works the same in every
// browser (and without JavaScript).
export const POST = async ({ request, url, cookies, redirect }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) {
    return redirect("/admin/login?error=origin", 303);
  }

  let password = "";
  try {
    password = String((await request.formData()).get("password") || "");
  } catch {
    return redirect("/admin/login?error=wrong", 303);
  }

  let ok = false;
  try {
    ok = password.length > 0 && checkPassword(password);
  } catch (error) {
    console.error("[login]", error.message);
    return redirect("/admin/login?error=config", 303);
  }

  if (!ok) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return redirect("/admin/login?error=wrong", 303);
  }

  cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return redirect("/admin", 303);
};
