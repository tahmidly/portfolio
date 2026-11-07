"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin ? <Navbar /> : null}
      {children}
    </>
  );
}
