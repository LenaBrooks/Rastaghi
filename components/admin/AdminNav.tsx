"use client";

import { useEffect, useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/ThemeControls";
import { LogOutIcon } from "@/components/lucide/LogOutIcon";
import { MenuIcon } from "@/components/lucide/MenuIcon";
import { XIcon } from "@/components/lucide/XIcon";

type AdminNavProps = {
  authed: boolean;
};

export function AdminNav({ authed }: AdminNavProps) {
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

  if (!authed) return null;

  return (
    <div className="admin-nav-wrap">
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
