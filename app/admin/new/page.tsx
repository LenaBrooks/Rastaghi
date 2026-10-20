import type { Metadata } from "next";
import { PostForm } from "@/components/admin/PostForm";
import { getCategories } from "@/lib/categories";
import { getPostSlugs } from "@/lib/posts";

export const metadata: Metadata = {
  title: "پست جدید",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewPostPage() {
  const [categories, existingSlugs] = await Promise.all([
    getCategories(),
    getPostSlugs(),
  ]);

  return (
    <section className="admin-card">
      <PostForm
        pageTitle="پست جدید"
        categories={categories}
        existingSlugs={existingSlugs}
      />
    </section>
  );
}
