import type { Metadata } from "next";
import { AdminCommentsList } from "@/components/admin/AdminCommentsList";
import { listAdminComments } from "@/lib/comments";

export const metadata: Metadata = {
  title: "نظرات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const comments = await listAdminComments({ limit: 150 });

  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <h1>نظرات</h1>
      </div>
      <AdminCommentsList comments={comments} />
    </section>
  );
}
