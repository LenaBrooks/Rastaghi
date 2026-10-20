import Link from "next/link";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="admin-root">
      <header className="admin-header">
        <Link href="/admin" className="admin-brand">
          پنل مدیریت
        </Link>
        <AdminNav authed={authed} />
      </header>
      {authed ? <AdminSubNav /> : null}
      <div className="admin-main">{children}</div>
      {authed ? <AdminBottomNav /> : null}
    </div>
  );
}
