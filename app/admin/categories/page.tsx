import type { Metadata } from "next";
import { AdminCategoriesList } from "@/components/admin/AdminCategoriesList";
import { getCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "دسته‌بندی‌ها",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="admin-card">
      <AdminCategoriesList categories={categories} />
    </section>
  );
}
