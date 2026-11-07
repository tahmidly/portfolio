import { useEffect, useLayoutEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { journalEntries } from "../data/portfolio";
import { journalContent } from "../data/journalContent";
import BackCircle from "../components/BackCircle";
import ThemeToggle from "../components/ThemeToggle";
import "./BlogPostPage.css";

function getInitialTheme() {
  try {
    return localStorage.getItem("blog-theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const entry = journalEntries.find((item) => item.id === slug);
  const article = entry ? journalContent[entry.id] : null;
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("blog-theme", theme);
    } catch {
      // ignore storage failures
    }
    return () => root.classList.remove("light");
  }, [theme]);

  useEffect(() => {
    if (!entry) return undefined;
    const previousTitle = document.title;
    document.title = `${entry.title} — Meer Tahmid`;
    return () => {
      document.title = previousTitle;
    };
  }, [entry]);

  if (!entry || !article) {
    return <Navigate to="/blogs" replace />;
  }

  return (
    <main className="post-page">
      <div className="post-glow" aria-hidden="true" />

      <BackCircle to="/blogs" label="Back to blogs" />
      <ThemeToggle
        theme={theme}
        onToggle={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      <article className="post-article">
        <header>
          <h1 className="post-title">{entry.title}</h1>
          <div className="post-meta">
            <span>{entry.date}</span>
            <span className="post-dot" />
            <span>{entry.readTime}</span>
            <span className="post-dot" />
            <span>By Meer Tahmid</span>
          </div>
        </header>

        <div className={`post-cover ${entry.placeholder}`}>
          <img
            src={entry.image}
            alt={entry.alt}
            className="placeholder-img"
          />
        </div>

        <div className="post-content">
          {article.content.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2 key={index} className="post-h2">
                  {block.text}
                </h2>
              );
            }
            return (
              <p key={index} className="post-p">
                {block.text}
              </p>
            );
          })}
        </div>

        <footer className="post-footer">
          <Link to="/blogs">← All thoughts</Link>
          <Link to="/">Back home</Link>
        </footer>
      </article>
    </main>
  );
}
