import type { Metadata } from "next";
import Link from "next/link";
import { AdminPostsList } from "@/components/admin/AdminPostsList";
import { getPostSummaries } from "@/lib/posts";

export const metadata: Metadata = {
  title: "پنل ادمین",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function plainBodyText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-=+[\](){}|!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(markdown: string): number {
  const text = plainBodyText(markdown);
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function countChars(markdown: string): number {
  return plainBodyText(markdown).replace(/\s/g, "").length;
}

export default async function AdminDashboardPage() {
  const posts = await getPostSummaries({
    includeDrafts: true,
    includeBody: true,
  });
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    categories: post.categories ?? [],
    tags: post.tags ?? [],
    wordCount: countWords(post.body ?? ""),
    charCount: countChars(post.body ?? ""),
    published: post.published,
  }));

  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <h1>پست‌ها</h1>
        <Link href="/admin/new" className="admin-text-btn admin-text-btn-primary">
          پست جدید
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="admin-muted">هنوز پستی نیست. یکی بساز.</p>
      ) : (
        <AdminPostsList posts={items} />
      )}
    </section>
  );
}
