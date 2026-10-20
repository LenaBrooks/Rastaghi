import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getCategories } from "@/lib/categories";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, { includeDrafts: true });
  return {
    title: post ? `ویرایش: ${post.title}` : "ویرایش پست",
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, categories, existingSlugs] = await Promise.all([
    getPostBySlug(slug, { includeDrafts: true }),
    getCategories(),
    getPostSlugs(),
  ]);
  if (!post) notFound();

  return (
    <section className="admin-card">
      <PostForm
        pageTitle="ویرایش پست"
        post={post}
        categories={categories}
        existingSlugs={existingSlugs}
      />
    </section>
  );
}
