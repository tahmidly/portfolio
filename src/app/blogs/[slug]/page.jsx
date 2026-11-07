import { notFound } from "next/navigation";
import BlogPostPage from "../../../views/BlogPostPage";
import { journalEntries } from "../../../data/portfolio";
import { journalContent } from "../../../data/journalContent";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const dynamicParams = false;

export function generateStaticParams() {
  return journalEntries.map((entry) => ({ slug: entry.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = journalEntries.find((item) => item.id === slug);
  if (!entry) return {};
  const article = journalContent[entry.id];

  return {
    title: entry.title,
    description: article?.excerpt,
    alternates: {
      canonical: `/blogs/${entry.id}`,
    },
    openGraph: {
      title: entry.title,
      description: article?.excerpt,
      type: "article",
      publishedTime: new Date(entry.date).toISOString(),
      images: [{ url: entry.image }],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const entry = journalEntries.find((item) => item.id === slug);
  if (!entry) notFound();
  const article = journalContent[entry.id];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: article?.excerpt,
    image: [entry.image],
    datePublished: new Date(entry.date).toISOString(),
    dateModified: new Date(entry.date).toISOString(),
    author: {
      "@type": "Person",
      name: "Meer Tahmid",
    },
    publisher: {
      "@type": "Person",
      name: "Meer Tahmid",
    },
    mainEntityOfPage: `${baseUrl}/blogs/${entry.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostPage slug={slug} />
    </>
  );
}
