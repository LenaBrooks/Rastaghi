import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { JalaliDate } from "@/components/JalaliDate";
import { CalendarIcon } from "@/components/lucide/CalendarIcon";
import { MessageCircleIcon } from "@/components/lucide/MessageCircleIcon";
import { TagsIcon } from "@/components/lucide/TagsIcon";
import { UserIcon } from "@/components/lucide/UserIcon";
import { SiteShell } from "@/components/SiteShell";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  buildCommentTree,
  getCommentsForPost,
} from "@/lib/comments";
import {
  getPostBySlug,
  getPosts,
  getRelatedPosts,
  postUrl,
  tagUrl,
} from "@/lib/posts";
import { site } from "@/lib/site";
import { enhanceHtmlWithToc } from "@/lib/toc";
import { peekVisitorId } from "@/lib/visitor";

type Props = { params: Promise<{ slug: string }> };

const RESERVED = new Set([
  "all",
  "tags",
  "categories",
  "projects",
  "tag",
  "page",
  "feed.xml",
  "api",
  "admin",
]);

export async function generateStaticParams() {
  const posts = await getPosts();
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

  const { html } = enhanceHtmlWithToc(post.html);
  const related = await getRelatedPosts(post);
  const visitorId = await peekVisitorId();
  const [flatComments, isAdmin] = await Promise.all([
    getCommentsForPost(slug, visitorId),
    isAdminAuthenticated(),
  ]);
  const commentTree = buildCommentTree(flatComments);
  const commentCount = flatComments.length;
  const category = post.categories?.[0] ?? post.tags[0] ?? null;
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
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="post-content">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta-strip" role="group" aria-label="اطلاعات مطلب">
            <span className="post-meta-strip-item">
              <CalendarIcon
                size={14}
                strokeWidth={1.7}
                className="post-meta-icon"
                aria-hidden
              />
              <JalaliDate date={post.date} format="%d %b %Y" />
            </span>
            <span className="post-meta-strip-item">
              <UserIcon
                size={14}
                strokeWidth={1.7}
                className="post-meta-icon"
                aria-hidden
              />
              <span>{author}</span>
            </span>
            {category ? (
              <span className="post-meta-strip-item">
                <TagsIcon
                  size={14}
                  strokeWidth={1.7}
                  className="post-meta-icon"
                  aria-hidden
                />
                {post.categories?.[0] ? (
                  <Link href="/categories">{category}</Link>
                ) : (
                  <Link href={tagUrl(category)}>{category}</Link>
                )}
              </span>
            ) : null}
            <a href="#comments" className="post-meta-strip-item">
              <MessageCircleIcon
                size={14}
                strokeWidth={1.7}
                className="post-meta-icon"
                aria-hidden
              />
              <span>
                {commentCount === 0
                  ? "بدون نظر"
                  : `${commentCount.toLocaleString("fa-IR")} نظر`}
              </span>
            </a>
          </div>
        </header>
        <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      {post.tags.length > 0 ? (
        <footer className="post-meta post-tags">
          {post.tags.map((tag) => (
            <Link key={tag} rel="tag" href={tagUrl(tag)}>
              #{tag}
            </Link>
          ))}
        </footer>
      ) : null}

      <hr className="post-end-divider" />

      {related.length > 0 ? (
        <aside id="related-posts" className="related-posts">
          <h3 className="related-posts-title">همچنین بخوانید:</h3>
          <ul className="related-posts-list">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={postUrl(r.slug)}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <CommentsSection
        postSlug={slug}
        tree={commentTree}
        totalCount={commentCount}
        isAdmin={isAdmin}
      />
    </SiteShell>
  );
}
