"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toPersianDigits } from "@/lib/persian";

const LINKS = [
  { href: "/admin", label: "پست‌ها", match: (p: string) => p === "/admin" },
  {
    href: "/admin/new",
    label: "پست جدید",
    match: (p: string) => p === "/admin/new",
  },
  {
    href: "/admin/categories",
    label: "دسته‌بندی‌ها",
    match: (p: string) => p.startsWith("/admin/categories"),
  },
  {
    href: "/admin/tags",
    label: "برچسب‌ها",
    match: (p: string) => p.startsWith("/admin/tags"),
  },
  {
    href: "/admin/comments",
    label: "نظرات",
    match: (p: string) => p.startsWith("/admin/comments"),
    badgeKey: "comments" as const,
  },
  {
    href: "/admin/media",
    label: "فایل‌ها",
    match: (p: string) => p.startsWith("/admin/media"),
  },
  {
    href: "/admin/settings",
    label: "تنظیمات",
    match: (p: string) => p.startsWith("/admin/settings"),
  },
] as const;

type AdminSubNavProps = {
  pendingComments?: number;
};

export function AdminSubNav({ pendingComments = 0 }: AdminSubNavProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="admin-subnav" aria-label="میانبرهای مدیریت">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        const showBadge =
          "badgeKey" in link &&
          link.badgeKey === "comments" &&
          pendingComments > 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active ? "admin-subnav-link is-active" : "admin-subnav-link"
            }
            aria-current={active ? "page" : undefined}
          >
            {link.label}
            {showBadge ? (
              <span className="admin-count-badge" aria-label={`${pendingComments} نظر در انتظار`}>
                {toPersianDigits(pendingComments)}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
