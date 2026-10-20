import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShahinShell } from "@/components/home/ShahinShell";
import { JalaliDate } from "@/components/JalaliDate";
import { CalendarIcon } from "@/components/lucide/CalendarIcon";
import { MessageCircleIcon } from "@/components/lucide/MessageCircleIcon";
import { TagsIcon } from "@/components/lucide/TagsIcon";
import { UserIcon } from "@/components/lucide/UserIcon";
import { isAdminAuthenticated } from "@/lib/auth";
import { categoryUrl } from "@/lib/categories";
import {
  buildCommentTree,
  getCommentsForPost,
} from "@/lib/comments";
import { getHomeNavItems } from "@/lib/home-data";
import {
  getPostBySlug,
  getPosts,
  getRelatedPosts,
  postUrl,
  slugifyTitle,
  tagUrl,
} from "@/lib/posts";
import { site } from "@/lib/site";
import { peekVisitorId } from "@/lib/visitor";

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

  const html = post.html;
  const [related, visitorId, navItems] = await Promise.all([
    getRelatedPosts(post),
    peekVisitorId(),
    getHomeNavItems(),
  ]);
  const isAdmin = await isAdminAuthenticated();
  const flatComments = await getCommentsForPost(slug, visitorId, {
    includeUnapproved: isAdmin,
  });
  const commentTree = buildCommentTree(flatComments);
  const commentCount = flatComments.filter((c) => c.approved).length;
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
            <span className="shahin-post-meta-sep" aria-hidden>
              |
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
            {categoryName ? (
              <>
                <span className="shahin-post-meta-sep" aria-hidden>
                  |
                </span>
                <span className="shahin-post-meta-item">
                  <TagsIcon
                    size={15}
                    strokeWidth={1.7}
                    className="shahin-post-meta-icon"
                    aria-hidden
                  />
                  <Link href={categoryUrl(slugifyTitle(categoryName))}>
                    {categoryName}
                  </Link>
                </span>
              </>
            ) : null}
            <span className="shahin-post-meta-sep" aria-hidden>
              |
            </span>
            <a href="#comments" className="shahin-post-meta-item">
              <MessageCircleIcon
                size={15}
                strokeWidth={1.7}
                className="shahin-post-meta-icon"
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

        <div
          className="shahin-post-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags.length > 0 ? (
          <footer className="shahin-post-tags">
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
          <CommentsSection
            postSlug={slug}
            tree={commentTree}
            totalCount={commentCount}
            isAdmin={isAdmin}
          />
        </div>
      </article>
    </ShahinShell>
  );
}
