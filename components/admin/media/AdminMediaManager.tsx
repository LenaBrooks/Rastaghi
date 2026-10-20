"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  deleteMediaAction,
  listMediaAction,
  loadMediaUsageAction,
  type CloudinaryMediaItem,
  type CloudinaryUsageSummary,
  type MediaKind,
} from "@/app/admin/media/actions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { MediaKindIcon } from "@/components/admin/media/MediaKindIcon";
import { UsageChart } from "@/components/admin/media/UsageChart";
import { JalaliDate } from "@/components/JalaliDate";
import { DownloadIcon } from "@/components/lucide/DownloadIcon";
import { EyeIcon } from "@/components/lucide/EyeIcon";
import { TrashIcon } from "@/components/lucide/TrashIcon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBytesFa, toPersianDigits } from "@/lib/persian";

function cloudinaryDownloadUrl(url: string): string {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}

const LONG_PRESS_MS = 480;

const TABS: { kind: MediaKind; label: string }[] = [
  { kind: "image", label: "عکس" },
  { kind: "video", label: "ویدیو" },
  { kind: "audio", label: "صدا" },
];

type AdminMediaManagerProps = {
  initialUsage: CloudinaryUsageSummary | null;
  initialKind: MediaKind;
  initialItems: CloudinaryMediaItem[];
  initialNextCursor: string | null;
  initialError?: string | null;
  configured: boolean;
};

function itemKey(item: CloudinaryMediaItem): string {
  return `${item.resourceType}:${item.publicId}`;
}

export function AdminMediaManager({
  initialUsage,
  initialKind,
  initialItems,
  initialNextCursor,
  initialError = null,
  configured,
}: AdminMediaManagerProps) {
  const [kind, setKind] = useState<MediaKind>(initialKind);
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [usage, setUsage] = useState(initialUsage);
  const [error, setError] = useState<string | null>(initialError);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [sheetItem, setSheetItem] = useState<CloudinaryMediaItem | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<CloudinaryMediaItem[]>(
    [],
  );
  const [pending, startTransition] = useTransition();
  const [loadingMore, setLoadingMore] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelected(new Set());
  }, [kind]);

  function clearLongPressTimer() {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function startLongPress(item: CloudinaryMediaItem) {
    clearLongPressTimer();
    timerRef.current = setTimeout(() => {
      setSheetItem(item);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12);
      }
    }, LONG_PRESS_MS);
  }

  function switchKind(next: MediaKind) {
    if (next === kind) return;
    setKind(next);
    setError(null);
    startTransition(async () => {
      const result = await listMediaAction({ kind: next });
      if (result.error) {
        setError(result.error);
        setItems([]);
        setNextCursor(null);
        return;
      }
      setItems(result.items);
      setNextCursor(result.nextCursor);
    });
  }

  async function refreshUsage() {
    const result = await loadMediaUsageAction();
    if (result.ok) setUsage(result.usage);
  }

  function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    void (async () => {
      const result = await listMediaAction({ kind, nextCursor });
      setLoadingMore(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((prev) => {
        const seen = new Set(prev.map(itemKey));
        const merged = [...prev];
        for (const item of result.items) {
          const key = itemKey(item);
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        }
        return merged;
      });
      setNextCursor(result.nextCursor);
    })();
  }

  function toggleSelect(item: CloudinaryMediaItem) {
    const key = itemKey(item);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(items.map(itemKey)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function openBulkDelete() {
    const targets = items.filter((item) => selected.has(itemKey(item)));
    if (targets.length === 0) return;
    setSheetItem(null);
    setDeleteTargets(targets);
  }

  function openSingleDelete(item: CloudinaryMediaItem) {
    setSheetItem(null);
    setDeleteTargets([item]);
  }

  async function confirmDelete() {
    const targets = deleteTargets.map((t) => ({
      publicId: t.publicId,
      resourceType: t.resourceType,
    }));
    const result = await deleteMediaAction({ targets });
    const deletedSet = new Set(result.deleted);
    setItems((prev) =>
      prev.filter((item) => !deletedSet.has(item.publicId)),
    );
    setSelected((prev) => {
      const next = new Set<string>();
      for (const key of prev) {
        const publicId = key.slice(key.indexOf(":") + 1);
        if (!deletedSet.has(publicId)) next.add(key);
      }
      return next;
    });
    setDeleteTargets([]);
    if (result.error) setError(result.error);
    else setError(null);
    await refreshUsage();
  }

  if (!configured) {
    return (
      <p className="admin-muted" role="status">
        Cloudinary در محیط پیکربندی نشده است. متغیرهای{" "}
        <code dir="ltr">CLOUDINARY_*</code> را تنظیم کنید.
      </p>
    );
  }

  const selectedCount = selected.size;
  const deleteCount = deleteTargets.length;

  return (
    <div className="admin-media">
      {usage ? <UsageChart usage={usage} /> : null}

      <div className="admin-media-tabs" role="tablist" aria-label="نوع فایل">
        {TABS.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            role="tab"
            aria-selected={kind === tab.kind}
            className={
              kind === tab.kind
                ? "admin-media-tab is-active"
                : "admin-media-tab"
            }
            onClick={() => switchKind(tab.kind)}
            disabled={pending}
          >
            <MediaKindIcon kind={tab.kind} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-media-toolbar">
        <button
          type="button"
          className="admin-text-btn"
          onClick={selectAllVisible}
          disabled={items.length === 0}
        >
          انتخاب همه
        </button>
        {selectedCount > 0 ? (
          <>
            <button
              type="button"
              className="admin-text-btn"
              onClick={clearSelection}
            >
              لغو انتخاب ({toPersianDigits(selectedCount)})
            </button>
            <button
              type="button"
              className="admin-text-btn admin-text-btn-danger"
              onClick={openBulkDelete}
            >
              حذف انتخاب‌شده‌ها
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {pending && items.length === 0 ? (
        <p className="admin-muted">در حال بارگذاری…</p>
      ) : items.length === 0 ? (
        <p className="admin-muted">فایلی در این دسته نیست.</p>
      ) : (
        <ul className="admin-media-list">
          {items.map((item) => {
            const key = itemKey(item);
            const isSelected = selected.has(key);
            return (
              <li key={key}>
                <div
                  className={
                    isSelected
                      ? "admin-media-row is-selected"
                      : "admin-media-row"
                  }
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    if (
                      (e.target as HTMLElement).closest(
                        "button, a, input, label",
                      )
                    ) {
                      return;
                    }
                    startLongPress(item);
                  }}
                  onPointerUp={clearLongPressTimer}
                  onPointerLeave={clearLongPressTimer}
                  onPointerCancel={clearLongPressTimer}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSheetItem(item);
                  }}
                >
                  <label className="admin-media-check">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item)}
                      aria-label={`انتخاب ${item.displayName}`}
                    />
                  </label>

                  <span className="admin-media-icon" aria-hidden>
                    {item.kind === "image" && item.url ? (
                      <img src={item.url} alt="" className="admin-media-thumb" />
                    ) : (
                      <MediaKindIcon kind={item.kind} />
                    )}
                  </span>

                  <div className="admin-media-main">
                    <span className="admin-media-name" dir="ltr">
                      {item.displayName}
                    </span>
                    <span className="admin-media-meta">
                      {formatBytesFa(item.bytes)}
                      <span aria-hidden> · </span>
                      <JalaliDate
                        date={item.createdAt}
                        format="%d %b %Y"
                        plain
                      />
                      {item.width && item.height ? (
                        <span className="admin-media-dims">
                          <span aria-hidden> · </span>
                          <span dir="ltr">
                            {toPersianDigits(item.width)}×
                            {toPersianDigits(item.height)}
                          </span>
                        </span>
                      ) : null}
                      {item.duration ? (
                        <span className="admin-media-duration">
                          <span aria-hidden> · </span>
                          <span>
                            {toPersianDigits(Math.round(item.duration))} ثانیه
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-icon-btn admin-danger"
                    aria-label="حذف"
                    onClick={() => openSingleDelete(item)}
                  >
                    <TrashIcon size={18} strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {nextCursor ? (
        <div className="admin-media-more">
          <button
            type="button"
            className="admin-text-btn"
            disabled={loadingMore}
            onClick={loadMore}
          >
            {loadingMore ? "در حال بارگذاری…" : "موارد بیشتر"}
          </button>
        </div>
      ) : null}

      <Sheet
        open={sheetItem != null}
        onOpenChange={(open) => {
          if (!open) setSheetItem(null);
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="admin-media-sheet admin-posts-sheet border-0 shadow-none"
        >
          {sheetItem ? (
            <>
              <SheetHeader className="admin-posts-sheet-header">
                <SheetTitle className="admin-media-sheet-title" dir="ltr">
                  {sheetItem.displayName}
                </SheetTitle>
              </SheetHeader>
              <dl className="admin-media-details">
                <div>
                  <dt>حجم</dt>
                  <dd>{formatBytesFa(sheetItem.bytes)}</dd>
                </div>
                <div>
                  <dt>تاریخ آپلود</dt>
                  <dd>
                    <JalaliDate
                      date={sheetItem.createdAt}
                      format="%d %b %Y — %H:%M"
                      plain
                    />
                  </dd>
                </div>
                <div>
                  <dt>فرمت</dt>
                  <dd dir="ltr">{sheetItem.format || "—"}</dd>
                </div>
                {sheetItem.width && sheetItem.height ? (
                  <div>
                    <dt>ابعاد</dt>
                    <dd dir="ltr">
                      {toPersianDigits(sheetItem.width)}×
                      {toPersianDigits(sheetItem.height)}
                    </dd>
                  </div>
                ) : null}
                {sheetItem.duration ? (
                  <div>
                    <dt>مدت</dt>
                    <dd>
                      {toPersianDigits(Math.round(sheetItem.duration))} ثانیه
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="admin-posts-sheet-actions">
                {sheetItem.url ? (
                  <>
                    <a
                      href={sheetItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-posts-sheet-btn"
                      onClick={() => setSheetItem(null)}
                    >
                      <EyeIcon size={18} strokeWidth={1.75} aria-hidden />
                      مشاهده
                    </a>
                    <a
                      href={cloudinaryDownloadUrl(sheetItem.url)}
                      download={sheetItem.displayName}
                      className="admin-posts-sheet-btn"
                      onClick={() => setSheetItem(null)}
                    >
                      <DownloadIcon size={18} strokeWidth={1.75} aria-hidden />
                      دانلود
                    </a>
                  </>
                ) : null}
                <button
                  type="button"
                  className="admin-posts-sheet-btn admin-posts-sheet-btn-danger"
                  onClick={() => openSingleDelete(sheetItem)}
                >
                  <TrashIcon size={18} strokeWidth={1.75} aria-hidden />
                  حذف
                </button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={deleteTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setDeleteTargets([]);
        }}
        hideTrigger
        title={
          deleteCount > 1
            ? `حذف ${toPersianDigits(deleteCount)} فایل؟`
            : "حذف این فایل؟"
        }
        description={
          deleteCount > 1
            ? "فایل‌های انتخاب‌شده از Cloudinary حذف می‌شوند. لینک‌های داخل پست‌ها ممکن است بشکنند."
            : `«${deleteTargets[0]?.displayName ?? ""}» از Cloudinary حذف می‌شود. لینک داخل پست‌ها ممکن است بشکند.`
        }
        action={async () => {
          await confirmDelete();
        }}
        hiddenFields={{ _: "1" }}
      />
    </div>
  );
}
