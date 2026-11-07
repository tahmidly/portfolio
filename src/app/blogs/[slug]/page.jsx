import { notFound, permanentRedirect } from "next/navigation";
import BlogPostPage from "../../../views/BlogPostPage";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
  getRedirectedSlug,
} from "../../../lib/posts";
import { AUTHOR, SITE_URL, absoluteUrl } from "../../../lib/site";

// ISR: published posts are prerendered at build; newly published slugs render
// on first request (dynamicParams) and are cached. Publishing, editing or
// deleting calls revalidatePath for the affected slugs.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { robots: { index: false, follow: false } };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const images = post.coverUrl
    ? [
        {
          url: absoluteUrl(post.coverUrl),
          alt: post.coverAlt || post.title,
          ...(post.coverWidth && post.coverHeight
            ? { width: post.coverWidth, height: post.coverHeight }
            : {}),
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blogs/${post.slug}` },
    authors: [{ name: AUTHOR, url: SITE_URL }],
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blogs/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [AUTHOR],
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    const current = await getRedirectedSlug(slug);
    if (current) permanentRedirect(`/blogs/${current}`);
    notFound();
  }

  // Published posts are newest-first: "previous" = older, "next" = newer.
  const all = await getPublishedPosts();
  const index = all.findIndex((item) => item.id === post.id);
  const previous = index >= 0 ? all[index + 1] || null : null;
  const next = index > 0 ? all[index - 1] : null;

  const url = `${SITE_URL}/blogs/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      image: post.coverUrl ? [absoluteUrl(post.coverUrl)] : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { "@type": "Person", name: AUTHOR, url: SITE_URL },
      publisher: { "@type": "Person", name: AUTHOR, url: SITE_URL },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blogs", item: `${SITE_URL}/blogs` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // Escape "<" so post text can never close the script tag.
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BlogPostPage post={post} previous={previous} next={next} />
    </>
  );
}
