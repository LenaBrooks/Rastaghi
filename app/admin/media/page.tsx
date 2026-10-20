import type { Metadata } from "next";
import Link from "next/link";
import { AdminMediaManager } from "@/components/admin/media";
import {
  getCloudinaryUsage,
  isCloudinaryConfigured,
  listCloudinaryMedia,
} from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "مدیریت فایل‌ها",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const configured = isCloudinaryConfigured();
  let usage = null;
  let items: Awaited<ReturnType<typeof listCloudinaryMedia>>["items"] = [];
  let nextCursor: string | null = null;
  let error: string | null = null;

  if (configured) {
    try {
      const [usageResult, listResult] = await Promise.all([
        getCloudinaryUsage(),
        listCloudinaryMedia({ kind: "image", maxResults: 40 }),
      ]);
      usage = usageResult;
      items = listResult.items;
      nextCursor = listResult.nextCursor;
    } catch (err) {
      console.error(err);
      error =
        err instanceof Error ? err.message : "بارگذاری فایل‌ها ناموفق بود.";
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <h1>مدیریت فایل‌ها</h1>
        <Link href="/admin/settings" className="admin-text-btn">
          تنظیمات
        </Link>
      </div>
      <AdminMediaManager
        configured={configured}
        initialUsage={usage}
        initialKind="image"
        initialItems={items}
        initialNextCursor={nextCursor}
        initialError={error}
      />
    </section>
  );
}
