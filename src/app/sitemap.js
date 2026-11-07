import { journalEntries } from "../data/portfolio";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...journalEntries.map((entry) => ({
      url: `${baseUrl}/blogs/${entry.id}`,
      lastModified: new Date(entry.date),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
