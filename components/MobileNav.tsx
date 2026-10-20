"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeControls";
import { MenuIcon } from "@/components/lucide/MenuIcon";
import { TagsIcon } from "@/components/lucide/TagsIcon";
import { XIcon } from "@/components/lucide/XIcon";

export function MobileNav() {
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

  return (
    <>
      <button
        type="button"
        className="site-menu-toggle"
        aria-label={open ? "بستن منو" : "باز کردن منو"}
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <XIcon size={22} strokeWidth={1.75} aria-hidden />
        ) : (
          <MenuIcon size={22} strokeWidth={1.75} aria-hidden />
        )}
      </button>

      <nav className="site-nav-desktop" aria-label="منوی اصلی">
        <ThemeToggle />
        <Link href="/categories">موضوعات</Link>
      </nav>

      {open ? (
        <div
          className="site-nav-backdrop"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav
        id="site-mobile-nav"
        className={open ? "site-nav-mobile is-open" : "site-nav-mobile"}
        aria-label="منوی موبایل"
      >
        <ThemeToggle variant="menu" />
        <Link
          href="/categories"
          className="site-nav-item"
          onClick={() => setOpen(false)}
        >
          <TagsIcon size={18} strokeWidth={1.75} aria-hidden />
          موضوعات
        </Link>
      </nav>
    </>
  );
}
