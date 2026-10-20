export type ThemePref = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function readThemePref(): ThemePref {
  try {
    const stored = sessionStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "system";
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveDark(pref: ThemePref = readThemePref()): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  return systemPrefersDark();
}

/** Keep browser chrome (address bar / PWA title bar) in sync with --bg. */
export function syncBrowserThemeColor(): void {
  const root = document.documentElement;
  const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
  if (!bg) return;

  const metas = document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = bg;
    document.head.appendChild(meta);
    return;
  }

  for (const meta of metas) {
    meta.content = bg;
  }
}

export function applyThemePref(pref: ThemePref): void {
  const root = document.documentElement;
  if (pref === "system") {
    root.removeAttribute("data-theme");
    try {
      sessionStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  } else {
    root.setAttribute("data-theme", pref);
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      /* ignore */
    }
  }
  const dark = resolveDark(pref);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  syncBrowserThemeColor();
  window.dispatchEvent(new Event("themechange"));
}

export function nextThemePref(current: ThemePref): ThemePref {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}

export function themePrefLabel(pref: ThemePref): string {
  if (pref === "light") return "روشن";
  if (pref === "dark") return "تاریک";
  return "سیستم";
}
