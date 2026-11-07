"use client";

import Link from "next/link";
import "./BackCircle.css";

export default function BackCircle({ to, label }) {
  return (
    <Link href={to} className="back-circle" aria-label={label}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
