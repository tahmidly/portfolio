import { SESSION_COOKIE } from "../../../lib/session";

export const POST = ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return redirect("/admin/login", 303);
};
