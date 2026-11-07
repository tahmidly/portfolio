"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const THEME_KEY = "blog-theme";

export default function BlogThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    try {
      setTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
    } catch {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore storage failures
    }
    return () => root.classList.remove("light");
  }, [theme]);

  return (
    <ThemeToggle
      theme={theme}
      onToggle={() =>
        setTheme((current) => (current === "dark" ? "light" : "dark"))
      }
    />
  );
}
