import Link from "next/link";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { isAdminAuthenticated } from "@/lib/auth";
import { countPendingComments } from "@/lib/comments";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  const pendingComments = authed ? await countPendingComments() : 0;

  return (
    <div className="admin-root">
      <header className="admin-header">
        <Link href="/admin" className="admin-brand">
          پنل مدیریت
        </Link>
        <AdminNav authed={authed} />
      </header>
      {authed ? <AdminSubNav pendingComments={pendingComments} /> : null}
      <div className="admin-main">{children}</div>
      {authed ? <AdminBottomNav pendingComments={pendingComments} /> : null}
    </div>
  );
}
