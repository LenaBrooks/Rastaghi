"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLinkIcon } from "@/components/lucide/ExternalLinkIcon";
import { FoldersIcon } from "@/components/lucide/FoldersIcon";
import { ListIcon } from "@/components/lucide/ListIcon";
import { PlusIcon } from "@/components/lucide/PlusIcon";
import { SettingsIcon } from "@/components/lucide/SettingsIcon";
import { TagsIcon } from "@/components/lucide/TagsIcon";

const LINKS = [
  {
    href: "/admin",
    label: "پست‌ها",
    match: (p: string) =>
      p === "/admin" || /^\/admin\/[^/]+\/edit$/.test(p),
    icon: ListIcon,
  },
  {
    href: "/admin/new",
    label: "پست جدید",
    match: (p: string) => p === "/admin/new",
    icon: PlusIcon,
  },
  {
    href: "/admin/categories",
    label: "دسته‌ها",
    match: (p: string) => p.startsWith("/admin/categories"),
    icon: FoldersIcon,
  },
  {
    href: "/admin/tags",
    label: "برچسب‌ها",
    match: (p: string) => p.startsWith("/admin/tags"),
    icon: TagsIcon,
  },
  {
    href: "/admin/settings",
    label: "تنظیمات",
    match: (p: string) => p.startsWith("/admin/settings"),
    icon: SettingsIcon,
  },
  {
    href: "/",
    label: "سایت",
    match: () => false,
    icon: ExternalLinkIcon,
    external: true,
  },
] as const;

export function AdminBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="admin-bottom-nav" aria-label="میانبر مدیریت">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        const Icon = link.icon;
        const className = active
          ? "admin-bottom-nav-link is-active"
          : "admin-bottom-nav-link";

        if ("external" in link && link.external) {
          return (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              <Icon size={22} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">{link.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={className}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.75} aria-hidden />
            {active ? (
              <span className="admin-bottom-nav-label">{link.label}</span>
            ) : (
              <span className="sr-only">{link.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
