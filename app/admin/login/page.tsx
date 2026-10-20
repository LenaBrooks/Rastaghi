import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ورود ادمین",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/admin") ? params.next : "/admin";

  return (
    <section className="admin-card">
      <h1>ورود</h1>
      <p className="admin-muted">برای مدیریت پست‌ها وارد شوید.</p>
      <LoginForm nextPath={nextPath} />
    </section>
  );
}
