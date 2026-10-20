"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

type SearchHit = {
  slug: string;
  title: string;
  excerpt: string | null;
};

export function HomeSearch() {
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const focusInput = useEffectEvent(() => {
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (open) focusInput();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent | PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!open) return;
    if (q.length < 1) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("fail");
        const data = (await res.json()) as { results?: SearchHit[] };
        setResults(data.results ?? []);
        setSearched(true);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  function toggle() {
    setOpen((v) => {
      if (v) {
        setQuery("");
        setResults([]);
        setSearched(false);
      }
      return !v;
    });
  }

  return (
    <div className="home-shahin-search" ref={rootRef}>
      <button
        type="button"
        className="home-shahin-search-toggle"
        aria-label={open ? "بستن جستجو" : "جستجو"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        {open ? (
          <XIcon size={22} strokeWidth={1.75} aria-hidden />
        ) : (
          <SearchIcon size={22} strokeWidth={1.75} aria-hidden />
        )}
      </button>

      {open ? (
        <div id={panelId} className="home-shahin-search-panel" role="search">
          <label className="sr-only" htmlFor={`${panelId}-input`}>
            جستجو در نوشته‌ها
          </label>
          <input
            ref={inputRef}
            id={`${panelId}-input`}
            type="search"
            className="home-shahin-search-input"
            placeholder="جستجو…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />

          {loading ? (
            <p className="home-shahin-search-status">در حال جستجو…</p>
          ) : null}

          {!loading && searched && results.length === 0 ? (
            <p className="home-shahin-search-status">نتیجه‌ای پیدا نشد.</p>
          ) : null}

          {results.length > 0 ? (
            <ul className="home-shahin-search-results" role="listbox">
              {results.map((hit) => (
                <li key={hit.slug}>
                  <Link
                    href={`/${hit.slug}`}
                    className="home-shahin-search-hit"
                    onClick={() => setOpen(false)}
                  >
                    <span className="home-shahin-search-hit-title">
                      {hit.title}
                    </span>
                    {hit.excerpt ? (
                      <span className="home-shahin-search-hit-excerpt">
                        {hit.excerpt}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
