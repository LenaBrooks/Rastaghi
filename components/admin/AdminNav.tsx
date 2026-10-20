"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/ThemeControls";
import { EyeIcon } from "@/components/lucide/EyeIcon";
import { ImageIcon } from "@/components/lucide/ImageIcon";
import { LogOutIcon } from "@/components/lucide/LogOutIcon";
import { MenuIcon } from "@/components/lucide/MenuIcon";
import { TagsIcon } from "@/components/lucide/TagsIcon";
import { XIcon } from "@/components/lucide/XIcon";

/** Links not already on the bottom nav — keep hamburger for overflow. */
const HAMBURGER_LINKS = [
  {
    href: "/admin/tags",
    label: "برچسب‌ها",
    match: (p: string) => p.startsWith("/admin/tags"),
    icon: TagsIcon,
  },
  {
    href: "/admin/media",
    label: "فایل‌ها",
    match: (p: string) => p.startsWith("/admin/media"),
    icon: ImageIcon,
  },
] as const;

type AdminNavProps = {
  authed: boolean;
};

export function AdminNav({ authed }: AdminNavProps) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 769px)").matches) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!authed) return null;

  return (
    <div className="admin-nav-wrap">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="admin-site-eye"
        aria-label="مشاهده سایت"
      >
        <EyeIcon size={22} strokeWidth={1.75} aria-hidden />
      </Link>
      <button
        type="button"
        className="admin-menu-toggle"
        aria-label={open ? "بستن منو" : "باز کردن منو"}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <XIcon size={22} strokeWidth={1.75} aria-hidden />
        ) : (
          <MenuIcon size={22} strokeWidth={1.75} aria-hidden />
        )}
      </button>

      <nav className="admin-nav admin-nav-desktop" aria-label="منوی ادمین">
        <ThemeToggle />
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-link-btn"
        >
          مشاهده سایت
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="admin-link-btn">
            خروج
          </button>
        </form>
      </nav>

      {open ? (
        <div
          className="admin-nav-backdrop"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav
        id="admin-mobile-nav"
        className={open ? "admin-nav-mobile is-open" : "admin-nav-mobile"}
        aria-label="منوی موبایل ادمین"
      >
        {HAMBURGER_LINKS.map((link) => {
          const Icon = link.icon;
          const active = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "admin-link-btn admin-nav-item is-active"
                  : "admin-link-btn admin-nav-item"
              }
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
              {link.label}
            </Link>
          );
        })}
        <form action={logoutAction}>
          <button
            type="submit"
            className="admin-link-btn admin-nav-item admin-nav-item-logout"
          >
            <LogOutIcon size={18} strokeWidth={1.75} aria-hidden />
            خروج
          </button>
        </form>
      </nav>
    </div>
  );
}
