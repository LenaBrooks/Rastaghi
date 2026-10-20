"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    href: "/admin/settings",
    label: "تنظیمات",
    match: (p: string) => p.startsWith("/admin/settings"),
  },
  {
    href: "/",
    label: "مشاهده سایت",
    match: () => false,
    external: true,
  },
] as const;

export function AdminSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="admin-subnav" aria-label="میانبرهای مدیریت">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        if ("external" in link && link.external) {
          return (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-subnav-link"
            >
              {link.label}
            </Link>
          );
        }
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
          </Link>
        );
      })}
    </nav>
  );
}
