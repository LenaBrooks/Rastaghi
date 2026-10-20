"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 150;

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function resolveInternalHref(anchor: HTMLAnchorElement): string | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }
  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    const next = `${url.pathname}${url.search}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next === current) return null;
    return next;
  } catch {
    return null;
  }
}

/** Thin top bar after 150ms on internal navigations; no flash on fast routes. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeLink = useRef<HTMLAnchorElement | null>(null);

  function clearPending() {
    if (showTimer.current != null) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    setVisible(false);
    document.documentElement.removeAttribute("data-nav-pending");
    activeLink.current?.classList.remove("is-navigating");
    activeLink.current = null;
  }

  useEffect(() => {
    clearPending();
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (isModifiedClick(event)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!resolveInternalHref(anchor)) return;

      clearPending();
      activeLink.current = anchor;
      anchor.classList.add("is-navigating");
      document.documentElement.setAttribute("data-nav-pending", "");

      showTimer.current = setTimeout(() => {
        setVisible(true);
      }, SHOW_DELAY_MS);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearPending();
    };
  }, []);

  return (
    <div
      className={`nav-progress${visible ? " is-visible" : ""}`}
      role="presentation"
      aria-hidden={visible ? undefined : true}
    />
  );
}
