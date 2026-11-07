import Hero from "../components/Hero";
import SelectedWorks from "../components/SelectedWorks";
import Journal from "../components/Journal";
import Explorations from "../components/Explorations";
import TechStack from "../components/TechStack";
import Stats from "../components/Stats";
import Contact from "../components/Contact";
import { placeholderFor } from "../components/CoverImage";
import { formatPostDate } from "../lib/content";
import { getPublishedPosts } from "../lib/posts";

// Journal section reads published posts; refreshed on publish.
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const entries = posts.slice(0, 4).map((post) => ({
    id: post.slug,
    title: post.title,
    readTime: post.readingTime,
    date: formatPostDate(post.publishedAt),
    image: post.coverUrl,
    alt: post.coverAlt || post.title,
    placeholder: placeholderFor(post.slug),
  }));

  return (
    <main>
      <Hero />
      <SelectedWorks />
      <Journal entries={entries} />
      <Explorations />
      <TechStack />
      <Stats />
      <Contact />
    </main>
  );
}
