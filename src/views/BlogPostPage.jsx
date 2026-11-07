import Link from "next/link";
import { journalEntries } from "../data/portfolio";
import { journalContent } from "../data/journalContent";
import BackCircle from "../components/BackCircle";
import BlogThemeToggle from "../components/BlogThemeToggle";
import "./BlogPostPage.css";

export default function BlogPostPage({ slug }) {
  const entry = journalEntries.find((item) => item.id === slug);
  const article = entry ? journalContent[entry.id] : null;

  if (!entry || !article) {
    return null;
  }

  return (
    <main className="post-page">
      <div className="post-glow" aria-hidden="true" />

      <BackCircle to="/blogs" label="Back to blogs" />
      <BlogThemeToggle />

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
          <Link href="/blogs">← All thoughts</Link>
          <Link href="/">Back home</Link>
        </footer>
      </article>
    </main>
  );
}
