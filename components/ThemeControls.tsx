"use client";

import { useEffect, useState } from "react";
import { IconTooltip } from "@/components/IconTooltip";
import { MoonIcon } from "@/components/lucide/MoonIcon";
import { SunIcon } from "@/components/lucide/SunIcon";

type ThemeToggleProps = {
  className?: string;
  /** Menu row with label, like other hamburger items */
  variant?: "icon" | "menu";
};

export function ThemeToggle({
  className,
  variant = "icon",
}: ThemeToggleProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storageKey = "theme";

    function isDark() {
      const theme = document.documentElement.getAttribute("data-theme");
      return theme === "dark" || (!theme && darkQuery.matches);
    }

    function applyDarkClass(isDarkMode: boolean) {
      const root = document.documentElement;
      root.classList.toggle("dark", isDarkMode);
      root.style.colorScheme = isDarkMode ? "dark" : "light";
    }

    function sync() {
      const next = isDark();
      applyDarkClass(next);
      setDark(next);
    }

    sync();

    function applyTheme(next: "light" | "dark") {
      document.documentElement.setAttribute("data-theme", next);
      applyDarkClass(next === "dark");
      sessionStorage.setItem(storageKey, next);
      setDark(next === "dark");
      window.dispatchEvent(new Event("themechange"));
    }

    function onPostTitle(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".post-title")) return;
      applyTheme(isDark() ? "light" : "dark");
    }
    document.addEventListener("click", onPostTitle);

    function onScheme() {
      if (!sessionStorage.getItem(storageKey)) {
        document.documentElement.removeAttribute("data-theme");
      }
      sync();
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
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const theme = document.documentElement.getAttribute("data-theme");
    const isDarkNow = theme === "dark" || (!theme && darkQuery.matches);
    const next = isDarkNow ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme =
      next === "dark" ? "dark" : "light";
    sessionStorage.setItem("theme", next);
    setDark(next === "dark");
    window.dispatchEvent(new Event("themechange"));
  }

  const label = dark ? "حالت روشن" : "حالت تاریک";
  const classes = [
    "theme-toggle",
    variant === "menu" ? "theme-toggle-menu" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const icon = dark ? (
    <SunIcon
      size={variant === "menu" ? 18 : 22}
      strokeWidth={1.75}
      aria-hidden
    />
  ) : (
    <MoonIcon
      size={variant === "menu" ? 18 : 22}
      strokeWidth={1.75}
      aria-hidden
    />
  );

  if (variant === "menu") {
    return (
      <button
        type="button"
        className={classes}
        aria-label={label}
        onClick={onToggle}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <IconTooltip
      label={label}
      render={
        <button
          type="button"
          className={classes}
          aria-label={label}
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
    }
    hueSlider.addEventListener("input", onInput);

    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
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
