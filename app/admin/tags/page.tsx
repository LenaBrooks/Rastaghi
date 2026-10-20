import type { Metadata } from "next";
import { AdminTagsList } from "@/components/admin/AdminTagsList";
import { getTagsWithCounts, syncTagsFromPosts } from "@/lib/tags";

export const metadata: Metadata = {
  title: "برچسب‌ها",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  await syncTagsFromPosts();
  const tags = await getTagsWithCounts();

  return (
    <section className="admin-card">
      <AdminTagsList tags={tags} />
    </section>
  );
}
