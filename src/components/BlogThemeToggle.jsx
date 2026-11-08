import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const THEME_KEY = "blog-theme";

// The inline head script in BaseLayout applies html.light before paint (and
// after every client-side swap); this island only takes over once hydrated.
export default function BlogThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("light") ? "light" : "dark",
    );
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore storage failures
    }
  }, [theme]);

  return (
    <ThemeToggle
      theme={theme ?? "dark"}
      onToggle={() =>
        setTheme((current) => (current === "light" ? "dark" : "light"))
      }
    />
  );
}
