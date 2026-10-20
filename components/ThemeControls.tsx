"use client";

import { useEffect, useState } from "react";
import { IconTooltip } from "@/components/IconTooltip";
import { MoonIcon } from "@/components/lucide/MoonIcon";
import { SunIcon } from "@/components/lucide/SunIcon";
import {
  applyThemePref,
  nextThemePref,
  readThemePref,
  resolveDark,
  syncBrowserThemeColor,
  themePrefLabel,
  type ThemePref,
} from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
  /** Menu row with label, like other hamburger items */
  variant?: "icon" | "menu" | "settings";
};

export function ThemeToggle({
  className,
  variant = "icon",
}: ThemeToggleProps) {
  const [pref, setPref] = useState<ThemePref>("system");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function sync() {
      const nextPref = readThemePref();
      setPref(nextPref);
      setDark(resolveDark(nextPref));
      syncBrowserThemeColor();
    }

    sync();

    function onPostTitle(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".post-title")) return;
      const next = nextThemePref(readThemePref());
      applyThemePref(next);
    }
    document.addEventListener("click", onPostTitle);

    function onScheme() {
      if (readThemePref() === "system") {
        applyThemePref("system");
      } else {
        sync();
      }
    }
    darkQuery.addEventListener("change", onScheme);
    window.addEventListener("themechange", sync);

    return () => {
      document.removeEventListener("click", onPostTitle);
      darkQuery.removeEventListener("change", onScheme);
      window.removeEventListener("themechange", sync);
    };
  }, []);

  function onToggle() {
    applyThemePref(nextThemePref(readThemePref()));
  }

  const prefLabel = themePrefLabel(pref);
  const actionLabel =
    variant === "settings"
      ? `تم برنامه: ${prefLabel}`
      : dark
        ? "حالت روشن"
        : "حالت تاریک";
  const classes = [
    "theme-toggle",
    variant === "menu" ? "theme-toggle-menu" : null,
    variant === "settings" ? "theme-toggle-settings" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = variant === "icon" ? 22 : 18;
  const icon = dark ? (
    <SunIcon size={iconSize} strokeWidth={1.75} aria-hidden />
  ) : (
    <MoonIcon size={iconSize} strokeWidth={1.75} aria-hidden />
  );

  if (variant === "menu") {
    return (
      <button
        type="button"
        className={classes}
        aria-label={actionLabel}
        onClick={onToggle}
      >
        {icon}
        <span>{actionLabel}</span>
      </button>
    );
  }

  if (variant === "settings") {
    return (
      <button
        type="button"
        className={classes}
        aria-label={actionLabel}
        onClick={onToggle}
      >
        <span className="theme-toggle-settings-text">
          <span className="theme-toggle-settings-title">تم برنامه</span>
          <span className="theme-toggle-settings-value">{prefLabel}</span>
        </span>
        {icon}
      </button>
    );
  }

  return (
    <IconTooltip
      label={actionLabel}
      render={
        <button
          type="button"
          className={classes}
          aria-label={actionLabel}
          onClick={onToggle}
        />
      }
    >
      {icon}
    </IconTooltip>
  );
}

export function HueSlider() {
  useEffect(() => {
    const hueSlider = document.getElementById(
      "hue-slider",
    ) as HTMLInputElement | null;
    if (!hueSlider) return;

    hueSlider.value = getComputedStyle(document.documentElement)
      .getPropertyValue("--hue")
      .trim();

    function onInput(e: Event) {
      const value = (e.target as HTMLInputElement).value;
      document.documentElement.style.setProperty("--hue", value);
      syncBrowserThemeColor();
    }

    syncBrowserThemeColor();
    hueSlider.addEventListener("input", onInput);

    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "`") {
        e.preventDefault();
        hueSlider?.classList.toggle("visible");
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      hueSlider.removeEventListener("input", onInput);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <input
      type="range"
      id="hue-slider"
      min={0}
      max={360}
      defaultValue={350}
      aria-label="Adjust theme hue"
    />
  );
}

export function PaginationKeys() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const nav = document.querySelector(".pagination");
      if (!nav) return;
      if (e.key === "j" || e.key === "ت") {
        (nav.querySelector('a[title="j"]') as HTMLAnchorElement | null)?.click();
      }
      if (e.key === "k" || e.key === "ن") {
        (nav.querySelector('a[title="k"]') as HTMLAnchorElement | null)?.click();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
