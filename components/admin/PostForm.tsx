"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { savePostAction } from "@/app/admin/actions";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { TimeWheel } from "@/components/admin/TimeWheel";
import { IconTooltip } from "@/components/IconTooltip";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { PendingButton } from "@/components/PendingButton";
import { PencilIcon } from "@/components/lucide/PencilIcon";
import type { Category } from "@/lib/categories";
import type { Post } from "@/lib/posts/types";
import { nextNumericSlug } from "@/lib/posts/slug";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PostFormProps = {
  post?: Post;
  categories: Category[];
  existingSlugs?: string[];
  pageTitle: string;
};

type Step = 1 | 2 | 3;

type PostDraft = {
  title: string;
  slug: string;
  body: string;
  tags: string[] | string;
  category: string;
  date: string;
  featured: boolean;
  step: Step;
  savedAt: number;
  /** DB slug after first unload autosave (new posts). */
  dbSlug?: string;
};

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function draftKey(post?: Post) {
  return post?.slug
    ? `admin-post-draft:edit:${post.slug}`
    : "admin-post-draft:new";
}

function readDraft(key: string): PostDraft | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as PostDraft;
    if (!data || typeof data.savedAt !== "number") return null;
    if (Date.now() - data.savedAt > DRAFT_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeDraft(key: string, draft: PostDraft) {
  try {
    sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function parseIsoDate(iso: string): Date {
  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return new Date();
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    match[4] != null ? Number(match[4]) : 12,
    match[5] != null ? Number(match[5]) : 0,
    match[6] != null ? Number(match[6]) : 0,
  );
}

function toIsoDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function formatJalaliDate(date: Date): string {
  const weekday = date.toLocaleDateString("fa-IR", {
    calendar: "persian",
    weekday: "long",
  });
  const rest = date.toLocaleDateString("fa-IR", {
    calendar: "persian",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${weekday}، ${rest}`;
}

function formatJalaliTime(date: Date): string {
  return date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function hasExplicitTime(iso: string | undefined): boolean {
  return Boolean(iso && /T\d{2}:\d{2}/.test(iso));
}

export function PostForm({
  post,
  categories,
  existingSlugs = [],
  pageTitle,
}: PostFormProps) {
  const storageKey = draftKey(post);
  const [hydrated, setHydrated] = useState(false);

  const [step, setStep] = useState<Step>(1);
  const [stepError, setStepError] = useState("");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(() =>
    post?.slug ? post.slug : nextNumericSlug(existingSlugs),
  );
  const [body, setBody] = useState(post?.body ?? "");
  const [tags, setTags] = useState<string[]>(() => post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [slugEditing, setSlugEditing] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeSet, setTimeSet] = useState(() =>
    post?.date ? hasExplicitTime(post.date) : true,
  );
  const [category, setCategory] = useState(post?.categories?.[0] ?? "");
  const [featured, setFeatured] = useState(post?.featured === true);
  const slugInputRef = useRef<HTMLInputElement>(null);

  const initialDate = useMemo(
    () => (post?.date ? parseIsoDate(post.date) : new Date()),
    [post?.date],
  );
  const [date, setDate] = useState<Date | undefined>(initialDate);

  const isoDate = date ? toIsoDateTime(date) : "";
  const [origin, setOrigin] = useState("");
  const dbSlugRef = useRef<string | undefined>(post?.slug);
  const submittedRef = useRef(false);
  const draftSnapshot = useRef({
    title,
    slug,
    body,
    tags,
    category,
    date: isoDate,
    featured,
    step,
  });
  draftSnapshot.current = {
    title,
    slug,
    body,
    tags,
    category,
    date: isoDate,
    featured,
    step,
  };

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const draft = readDraft(storageKey);
    if (draft) {
      setTitle(draft.title);
      setSlug(draft.slug || nextNumericSlug(existingSlugs));
      setBody(draft.body);
      setTags(normalizeTags(draft.tags));
      setCategory(draft.category);
      setFeatured(draft.featured === true);
      if (draft.date) {
        setDate(parseIsoDate(draft.date));
        setTimeSet(hasExplicitTime(draft.date));
      }
      if (draft.step === 1 || draft.step === 2 || draft.step === 3) {
        setStep(draft.step);
      }
      if (draft.dbSlug) dbSlugRef.current = draft.dbSlug;
    }
    setHydrated(true);
  }, [storageKey, existingSlugs]);

  useEffect(() => {
    if (!hydrated) return;
    writeDraft(storageKey, {
      title,
      slug,
      body,
      tags,
      category,
      date: isoDate,
      featured,
      step,
      dbSlug: dbSlugRef.current,
      savedAt: Date.now(),
    });
  }, [
    hydrated,
    storageKey,
    title,
    slug,
    body,
    tags,
    category,
    isoDate,
    featured,
    step,
  ]);

  // Soft leave (e.g. پست‌ها): save DB draft, keep session so form restores.
  // Hard refresh / tab close: save DB draft and clear the form.
  useEffect(() => {
    if (!hydrated) return;

    let softNavigation = false;
    let didFlush = false;
    let softNavTimer: ReturnType<typeof setTimeout> | null = null;

    function markSoftNavigation() {
      softNavigation = true;
      if (softNavTimer) clearTimeout(softNavTimer);
      softNavTimer = setTimeout(() => {
        softNavigation = false;
        softNavTimer = null;
      }, 2500);
    }

    function onDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const el = (event.target as Element | null)?.closest?.("a[href]");
      if (!el) return;
      const anchor = el as HTMLAnchorElement;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin === window.location.origin) markSoftNavigation();
      } catch {
        /* ignore */
      }
    }

    function buildPayload() {
      const snap = draftSnapshot.current;
      const originalSlug = post?.slug || dbSlugRef.current || "";
      return {
        title: snap.title,
        slug: snap.slug,
        body: snap.body,
        date: snap.date,
        tags: snap.tags,
        category: snap.category,
        featured: snap.featured,
        originalSlug: originalSlug || undefined,
        keepPublished: Boolean(post),
      };
    }

    function flushToDatabaseDraft(clearLocal: boolean) {
      if (submittedRef.current || didFlush) return;
      const snap = draftSnapshot.current;
      const hasContent = Boolean(snap.title.trim() || snap.body.trim());
      if (!hasContent) {
        if (clearLocal) clearDraft(storageKey);
        return;
      }

      didFlush = true;
      const payload = buildPayload();
      const bodyJson = JSON.stringify(payload);

      if (clearLocal) {
        clearDraft(storageKey);
        try {
          const blob = new Blob([bodyJson], { type: "application/json" });
          if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/admin/autosave-draft", blob);
            return;
          }
        } catch {
          /* fall through */
        }
        void fetch("/api/admin/autosave-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: bodyJson,
          keepalive: true,
        });
        return;
      }

      // Soft leave: keep session, remember DB slug for later updates.
      void fetch("/api/admin/autosave-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyJson,
        keepalive: true,
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as { slug?: string };
          if (!data.slug) return;
          dbSlugRef.current = data.slug;
          writeDraft(storageKey, {
            title: snap.title,
            slug: snap.slug,
            body: snap.body,
            tags: snap.tags,
            category: snap.category,
            date: snap.date,
            featured: snap.featured,
            step: snap.step,
            dbSlug: data.slug,
            savedAt: Date.now(),
          });
        })
        .catch(() => {
          /* ignore */
        });
    }

    function onPageHide(event: PageTransitionEvent) {
      if (event.persisted) return;
      flushToDatabaseDraft(!softNavigation);
    }

    function onBeforeUnload() {
      if (softNavigation) return;
      flushToDatabaseDraft(true);
    }

    function onPopState() {
      markSoftNavigation();
    }

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (softNavTimer) clearTimeout(softNavTimer);
      // Soft nav may unmount before pagehide — still persist draft.
      if (softNavigation && !didFlush) {
        flushToDatabaseDraft(false);
      }
    };
  }, [hydrated, storageKey, post]);

  const [state, formAction, pending] = useActionState(
    async (
      prev: { error?: string } | undefined,
      formData: FormData,
    ): Promise<{ error?: string }> => {
      submittedRef.current = true;
      clearDraft(storageKey);
      const result = await savePostAction(prev, formData);
      if (result?.error) {
        submittedRef.current = false;
        writeDraft(storageKey, {
          ...draftSnapshot.current,
          dbSlug: dbSlugRef.current,
          savedAt: Date.now(),
        });
      }
      return result ?? {};
    },
    undefined,
  );

  const finalUrl = `${origin}/${slug || "…"}`;

  function openSlugEditor() {
    setSlugEditing(true);
    setTimeout(() => slugInputRef.current?.focus(), 0);
  }

  function goNext() {
    setStepError("");
    if (step === 1) {
      if (!title.trim()) {
        setStepError("عنوان را وارد کن.");
        return;
      }
      if (!slug.trim()) {
        setStepError("اسلاگ را وارد کن.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!body.trim()) {
        setStepError("متن پست را بنویس.");
        return;
      }
      setStep(3);
    }
  }

  function goBack() {
    setStepError("");
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }

  function addTag(raw: string) {
    const next = raw
      .split(/[,،]/)
      .map((s) => s.trim().replace(/^#+/u, "").trim())
      .filter(Boolean);
    if (next.length === 0) return;
    setTags((prev) => {
      const merged = [...prev];
      for (const t of next) {
        if (!merged.includes(t)) merged.push(t);
      }
      return merged;
    });
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <form
      action={formAction}
      noValidate
      className="admin-form"
      aria-busy={pending}
      onSubmit={(event) => {
        if (categories.length > 0 && !category.trim()) {
          event.preventDefault();
          setStepError("دسته‌بندی را انتخاب کن.");
          return;
        }
        setStepError("");
      }}
    >
      <div className="admin-toolbar">
        <AdminPageTitle title={pageTitle} />
      </div>

      <fieldset
        disabled={pending || categories.length === 0}
        className="admin-fieldset"
      >
        {post ? (
          <input type="hidden" name="originalSlug" value={post.slug} />
        ) : null}

        <div className="admin-step-panel" data-step="1" hidden={step !== 1}>
          <div className="admin-title-block">
            <label>
              عنوان
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <div className="admin-slug-path">
              <span
                className="admin-slug-path-url latin-digits"
                dir="ltr"
                lang="en"
                data-persian-digits="false"
              >
                {finalUrl}
              </span>
              <IconTooltip
                label="ویرایش اسلاگ"
                render={
                  <button
                    type="button"
                    className="admin-icon-btn admin-slug-edit-btn"
                    aria-label="ویرایش اسلاگ"
                    onClick={openSlugEditor}
                  />
                }
              >
                <PencilIcon size={12} strokeWidth={1.75} />
              </IconTooltip>
            </div>

            {slugEditing ? (
              <label>
                اسلاگ
                <input
                  ref={slugInputRef}
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onBlur={() => {
                    if (slug.trim()) setSlugEditing(false);
                  }}
                  dir="ltr"
                  lang="en"
                  data-persian-digits="false"
                  className="latin-digits"
                />
              </label>
            ) : (
              <input type="hidden" name="slug" value={slug} />
            )}

            {stepError && step === 1 ? (
              <p className="admin-error">{stepError}</p>
            ) : null}

            <button
              type="button"
              className="button admin-step1-next"
              onClick={goNext}
            >
              بعدی
            </button>
          </div>
        </div>

        <div className="admin-step-panel" data-step="2" hidden={step !== 2}>
          <MarkdownEditor value={body} onChange={setBody} />
        </div>

        <div className="admin-step-panel" data-step="3" hidden={step !== 3}>
              <input type="hidden" name="date" value={isoDate} />
          <div className="admin-meta-row admin-datetime-row">
            <label className="admin-date-field">
              تاریخ
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  render={
                    <button type="button" className="admin-date-trigger" />
                  }
                >
                  <CalendarIcon aria-hidden className="admin-date-icon" />
                  <span>
                    {date ? formatJalaliDate(date) : "انتخاب تاریخ"}
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  className="admin-calendar-popover w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (!d) return;
                      setDate((prev) => {
                        const next = new Date(d);
                        if (prev) {
                          next.setHours(
                            prev.getHours(),
                            prev.getMinutes(),
                            0,
                            0,
                          );
                        }
                        return next;
                      });
                      setDateOpen(false);
                    }}
                    className="admin-calendar"
                  />
                </PopoverContent>
              </Popover>
            </label>

            <label className="admin-date-field">
              ساعت
              <Popover
                open={timeOpen}
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    setDate((prev) => {
                      const base = new Date(prev ?? Date.now());
                      if (!timeSet) {
                        const now = new Date();
                        base.setHours(now.getHours(), now.getMinutes(), 0, 0);
                      }
                      return base;
                    });
                    if (!timeSet) setTimeSet(true);
                  }
                  setTimeOpen(nextOpen);
                }}
              >
                <PopoverTrigger
                  render={
                    <button type="button" className="admin-date-trigger" />
                  }
                >
                  <ClockIcon aria-hidden className="admin-date-icon" />
                  <span>
                    {date && timeSet
                      ? formatJalaliTime(date)
                      : "انتخاب ساعت"}
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  className="admin-calendar-popover admin-time-popover w-auto p-0"
                  align="start"
                >
                  {date ? (
                    <div className="admin-time-picker">
                      <TimeWheel
                        date={date}
                        onChange={(next) => {
                          setTimeSet(true);
                          setDate(next);
                        }}
                      />
                    </div>
                  ) : null}
                </PopoverContent>
              </Popover>
            </label>
          </div>

          <div className="admin-meta-row">
            <label className="admin-category-field">
              دسته‌بندی
              {categories.length === 0 ? (
                <p className="admin-muted">
                  هنوز دسته‌ای نیست. اول از{" "}
                  <Link href="/admin/categories">مدیریت دسته‌ها</Link> یکی بساز.
                </p>
              ) : (
                <>
                  <input type="hidden" name="category" value={category} />
                  <Select
                    items={categories.map((c) => ({
                      label: c.name,
                      value: c.name,
                    }))}
                    value={category || null}
                    onValueChange={(value) => {
                      setCategory(typeof value === "string" ? value : "");
                      setStepError("");
                    }}
                  >
                    <SelectTrigger className="admin-category-trigger w-full">
                      <SelectValue placeholder="انتخاب کنید…" />
                    </SelectTrigger>
                    <SelectContent
                      className="admin-category-content"
                      alignItemWithTrigger={false}
                    >
                      <SelectGroup>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </>
              )}
            </label>
          </div>

          <div className="admin-tags-field">
            <span className="admin-tags-label">برچسب‌ها</span>
            <input type="hidden" name="tags" value={tags.join("، ")} />
            <div className="admin-tag-input-row">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                  if (
                    e.key === "Backspace" &&
                    !tagInput &&
                    tags.length > 0
                  ) {
                    removeTag(tags[tags.length - 1]!);
                  }
                }}
              />
              <button
                type="button"
                className="button admin-tag-add"
                onClick={() => addTag(tagInput)}
              >
                افزودن
              </button>
            </div>
            {tags.length > 0 ? (
              <ul className="admin-tag-list">
                {tags.map((tag) => (
                  <li key={tag} className="admin-tag-chip">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      className="admin-tag-remove"
                      aria-label={`حذف #${tag}`}
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <label className="admin-featured-check">
            <input
              type="checkbox"
              name="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span>جزو برگزیده‌ها در صفحه اصلی</span>
          </label>
        </div>

        {stepError && step !== 1 ? (
          <p className="admin-error">{stepError}</p>
        ) : null}
        {state?.error ? <p className="admin-error">{state.error}</p> : null}

        {step > 1 ? (
          <div className="admin-step-actions">
            <button
              type="button"
              className="button admin-step-back"
              onClick={goBack}
            >
              قبلی
            </button>

            {step < 3 ? (
              <button type="button" className="button" onClick={goNext}>
                بعدی
              </button>
            ) : (
              <div className="admin-publish-actions">
                <PendingButton
                  name="intent"
                  value="draft"
                  variant="secondary"
                  pendingLabel="در حال ذخیره…"
                  disabled={categories.length === 0}
                >
                  پیش‌نویس
                </PendingButton>
                <PendingButton
                  name="intent"
                  value="publish"
                  pendingLabel="در حال انتشار…"
                  disabled={categories.length === 0}
                >
                  انتشار
                </PendingButton>
              </div>
            )}
          </div>
        ) : null}
      </fieldset>
    </form>
  );
}
