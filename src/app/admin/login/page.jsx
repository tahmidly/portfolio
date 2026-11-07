import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { isAdmin } from "../../../lib/auth";
import "../../../views/AdminPage.css";

export const metadata = { title: "Sign in" };

export default async function Page({ searchParams }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="admin-login">
      <LoginForm error={typeof error === "string" ? error : undefined} />
    </main>
  );
}
