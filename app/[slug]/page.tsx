import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CommentsSkeleton } from "@/components/comments/CommentsSkeleton";
import { PostComments } from "@/components/comments/PostComments";
import { ShahinShell } from "@/components/home/ShahinShell";
import { JalaliDate } from "@/components/JalaliDate";
import { CalendarIcon } from "@/components/lucide/CalendarIcon";
import { MessageCircleIcon } from "@/components/lucide/MessageCircleIcon";
import { UserIcon } from "@/components/lucide/UserIcon";
import { categoryUrl } from "@/lib/categories";
import { getHomeNavItems } from "@/lib/home-data";
import {
  getPostBySlug,
  getPostSummaries,
  getRelatedPosts,
  postUrl,
  slugifyTitle,
  tagUrl,
} from "@/lib/posts";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const RESERVED = new Set([
  "all",
  "tags",
  "categories",
  "category",
  "projects",
  "contact",
  "tag",
  "page",
  "feed.xml",
  "api",
  "admin",
]);

export async function generateStaticParams() {
  const posts = await getPostSummaries();
  return posts
    .filter((p) => !RESERVED.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      publishedTime: post.date,
      title: post.title,
      description: post.excerpt,
      authors: [site.author],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = post.html;
  const [related, navItems] = await Promise.all([
    getRelatedPosts(post),
    getHomeNavItems(),
  ]);
  const categoryName = post.categories?.[0] ?? null;
  const author = site.author || site.title;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: { "@type": "Person", name: author },
    datePublished: post.date,
    dateModified: post.date,
    description: post.excerpt,
    headline: post.title,
    url: `${site.url}${postUrl(post.slug)}`,
  };

  return (
    <ShahinShell navItems={navItems}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="shahin-post">
        <header className="shahin-post-header">
          <h1 className="shahin-post-title">{post.title}</h1>
          <div
            className="shahin-post-meta"
            role="group"
            aria-label="اطلاعات مطلب"
          >
            <span className="shahin-post-meta-item">
              <CalendarIcon
                size={15}
                strokeWidth={1.7}
                className="shahin-post-meta-icon"
                aria-hidden
              />
              <JalaliDate date={post.date} format="%d %b %Y" plain />
            </span>
            <span className="shahin-post-meta-item">
              <UserIcon
                size={15}
                strokeWidth={1.7}
                className="shahin-post-meta-icon"
                aria-hidden
              />
              <span>{author}</span>
            </span>
            <a href="#comments" className="shahin-post-meta-item">
              <MessageCircleIcon
                size={15}
                strokeWidth={1.7}
                className="shahin-post-meta-icon"
                aria-hidden
              />
              <span>نظرات</span>
            </a>
          </div>
        </header>

        <div
          className="shahin-post-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {categoryName || post.tags.length > 0 ? (
          <footer className="shahin-post-tags">
            {categoryName ? (
              <Link
                className="shahin-post-category"
                href={categoryUrl(slugifyTitle(categoryName))}
              >
                {categoryName}
              </Link>
            ) : null}
            {post.tags.map((tag) => (
              <Link key={tag} rel="tag" href={tagUrl(tag)}>
                #{tag}
              </Link>
            ))}
          </footer>
        ) : null}

        {related.length > 0 ? (
          <aside id="related-posts" className="shahin-post-related">
            <h2 className="shahin-post-related-title">همچنین بخوانید:</h2>
            <ul className="shahin-post-related-list">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={postUrl(r.slug)}>{r.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <div className="shahin-post-comments">
          <Suspense fallback={<CommentsSkeleton />}>
            <PostComments postSlug={slug} />
          </Suspense>
        </div>
      </article>
    </ShahinShell>
  );
}
