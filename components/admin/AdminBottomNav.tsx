"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FoldersIcon } from "@/components/lucide/FoldersIcon";
import { ListIcon } from "@/components/lucide/ListIcon";
import { MessageCircleIcon } from "@/components/lucide/MessageCircleIcon";
import { PlusIcon } from "@/components/lucide/PlusIcon";
import { SettingsIcon } from "@/components/lucide/SettingsIcon";
import { toPersianDigits } from "@/lib/persian";

const LINKS = [
  {
    href: "/admin",
    label: "پست‌ها",
    match: (p: string) =>
      p === "/admin" || /^\/admin\/[^/]+\/edit$/.test(p),
    icon: ListIcon,
  },
  {
    href: "/admin/categories",
    label: "دسته‌ها",
    match: (p: string) => p.startsWith("/admin/categories"),
    icon: FoldersIcon,
  },
  {
    href: "/admin/new",
    label: "پست جدید",
    match: (p: string) => p === "/admin/new",
    icon: PlusIcon,
  },
  {
    href: "/admin/comments",
    label: "نظرات",
    match: (p: string) => p.startsWith("/admin/comments"),
    icon: MessageCircleIcon,
    badgeKey: "comments" as const,
  },
  {
    href: "/admin/settings",
    label: "تنظیمات",
    match: (p: string) => p.startsWith("/admin/settings"),
    icon: SettingsIcon,
  },
] as const;

type AdminBottomNavProps = {
  pendingComments?: number;
};

export function AdminBottomNav({ pendingComments = 0 }: AdminBottomNavProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="admin-bottom-nav" aria-label="میانبر مدیریت">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        const Icon = link.icon;
        const className = active
          ? "admin-bottom-nav-link is-active"
          : "admin-bottom-nav-link";
        const showBadge =
          "badgeKey" in link &&
          link.badgeKey === "comments" &&
          pendingComments > 0;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={className}
            aria-current={active ? "page" : undefined}
          >
            <span className="admin-bottom-nav-icon-wrap">
              <Icon size={22} strokeWidth={active ? 2 : 1.75} aria-hidden />
              {showBadge ? (
                <span
                  className="admin-count-badge admin-count-badge--nav"
                  aria-label={`${pendingComments} نظر در انتظار`}
                >
                  {toPersianDigits(pendingComments)}
                </span>
              ) : null}
            </span>
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
