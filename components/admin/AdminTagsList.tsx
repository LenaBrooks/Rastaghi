"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTagAction } from "@/app/admin/actions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { TagForm } from "@/components/admin/TagForm";
import { IconTooltip } from "@/components/IconTooltip";
import { PencilIcon } from "@/components/lucide/PencilIcon";
import { TrashIcon } from "@/components/lucide/TrashIcon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toPersianDigits } from "@/lib/persian";
import { formatTagLabel } from "@/lib/tags";

const LONG_PRESS_MS = 480;
const PAGE_SIZES = [10, 15, 30] as const;

type PageSize = (typeof PAGE_SIZES)[number];
type SortMode = "name-asc" | "name-desc" | "count";

export type AdminTagItem = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

type AdminTagsListProps = {
  tags: AdminTagItem[];
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "name-asc", label: "نام (الف تا ی)" },
  { value: "name-desc", label: "نام (ی تا الف)" },
  { value: "count", label: "بیشترین استفاده" },
];

function sortTags(items: AdminTagItem[], mode: SortMode): AdminTagItem[] {
  const list = [...items];
  if (mode === "name-desc") {
    return list.sort(
      (a, b) => b.name.localeCompare(a.name, "fa") || a.id - b.id,
    );
  }
  if (mode === "count") {
    return list.sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, "fa"),
    );
  }
  return list.sort(
    (a, b) => a.name.localeCompare(b.name, "fa") || a.id - b.id,
  );
}

export function AdminTagsList({ tags }: AdminTagsListProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminTagItem | null>(null);
  const [sort, setSort] = useState<SortMode>("name-asc");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [sheetItem, setSheetItem] = useState<AdminTagItem | null>(null);
  const [sheetMode, setSheetMode] = useState<"actions" | "edit">("actions");
  const [deleteItem, setDeleteItem] = useState<AdminTagItem | null>(null);
  const longPressFired = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sorted = sortTags(tags, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function clearLongPressTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function changeSort(next: SortMode) {
    setSort(next);
    setPage(1);
  }

  function changePageSize(next: PageSize) {
    setPageSize(next);
    setPage(1);
  }

  function openSheet(item: AdminTagItem) {
    setSheetMode("actions");
    setSheetItem(item);
  }

  function startEdit(item: AdminTagItem) {
    setAdding(false);
    setSheetItem(null);
    setEditing(item);
  }

  function startLongPress(item: AdminTagItem) {
    longPressFired.current = false;
    clearLongPressTimer();
    timerRef.current = setTimeout(() => {
      longPressFired.current = true;
      openSheet(item);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12);
      }
    }, LONG_PRESS_MS);
  }

  function openDelete(item: AdminTagItem) {
    setSheetItem(null);
    setDeleteItem(item);
  }

  function rowNumber(index: number) {
    return toPersianDigits(String((currentPage - 1) * pageSize + index + 1));
  }

  return (
    <>
      <div className="admin-toolbar">
        <h1>برچسب‌ها</h1>
        <button
          type="button"
          className="admin-text-btn admin-text-btn-primary"
          aria-expanded={adding}
          onClick={() => {
            setEditing(null);
            setAdding((v) => !v);
          }}
        >
          {adding ? "بستن" : "برچسب جدید"}
        </button>
      </div>

      {adding ? (
        <div className="admin-categories-add">
          <TagForm
            onSuccess={() => {
              setAdding(false);
              router.refresh();
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : null}

      {editing ? (
        <div className="admin-categories-add">
          <TagForm
            tag={{ id: editing.id, name: editing.name }}
            onSuccess={() => {
              setEditing(null);
              router.refresh();
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : null}

      {tags.length === 0 ? (
        <p className="admin-muted">هنوز برچسبی ساخته نشده.</p>
      ) : (
        <>
          <div className="admin-posts-controls">
            <div className="admin-posts-controls-start">
              <Select
                items={SORT_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                value={sort}
                onValueChange={(value) => {
                  if (typeof value === "string") changeSort(value as SortMode);
                }}
              >
                <SelectTrigger
                  className="admin-posts-select-trigger"
                  aria-label="ترتیب"
                >
                  <SelectValue>ترتیب</SelectValue>
                </SelectTrigger>
                <SelectContent
                  className="admin-posts-select-content shadow-none ring-0"
                  alignItemWithTrigger={false}
                  align="start"
                  sideOffset={6}
                >
                  <SelectGroup>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="admin-posts-page-size">
              <span
                className="admin-posts-page-size-label"
                id="admin-tags-page-size-label"
              >
                تعداد
              </span>
              <Select
                items={PAGE_SIZES.map((size) => ({
                  label: toPersianDigits(String(size)),
                  value: String(size),
                }))}
                value={String(pageSize)}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    changePageSize(Number(value) as PageSize);
                  }
                }}
              >
                <SelectTrigger
                  className="admin-posts-select-trigger admin-posts-select-trigger-size"
                  aria-labelledby="admin-tags-page-size-label"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="admin-posts-select-content admin-posts-select-content-size shadow-none ring-0"
                  alignItemWithTrigger={false}
                  align="start"
                  sideOffset={6}
                >
                  <SelectGroup>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {toPersianDigits(String(size))}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ul className="admin-posts-mobile">
            {pageItems.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="admin-posts-mobile-item"
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    startLongPress(item);
                  }}
                  onPointerUp={clearLongPressTimer}
                  onPointerLeave={clearLongPressTimer}
                  onPointerCancel={clearLongPressTimer}
                  onContextMenu={(event) => event.preventDefault()}
                  onClick={() => {
                    if (longPressFired.current) {
                      longPressFired.current = false;
                      return;
                    }
                    openSheet(item);
                  }}
                >
                  <span className="admin-posts-mobile-num">
                    {rowNumber(index)}
                  </span>
                  <span className="admin-posts-mobile-title">
                    <span className="admin-posts-mobile-title-text">
                      {formatTagLabel(item.name)}
                    </span>
                  </span>
                  <span className="admin-posts-mobile-date">
                    {toPersianDigits(String(item.count))} پست
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <table className="admin-table admin-posts-desktop">
            <thead>
              <tr>
                <th className="admin-table-num">#</th>
                <th className="admin-table-title">برچسب</th>
                <th className="admin-table-home">پست‌ها</th>
                <th className="admin-table-actions">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="admin-table-num">{rowNumber(index)}</td>
                  <td className="admin-table-title">
                    <span className="admin-tag-label">
                      {formatTagLabel(item.name)}
                    </span>
                  </td>
                  <td className="admin-table-home">
                    {toPersianDigits(String(item.count))}
                  </td>
                  <td className="admin-table-actions admin-row-actions">
                    <IconTooltip
                      label="ویرایش"
                      render={
                        <button
                          type="button"
                          className="admin-icon-btn"
                          aria-label="ویرایش"
                          onClick={() => startEdit(item)}
                        />
                      }
                    >
                      <PencilIcon size={18} strokeWidth={1.75} />
                    </IconTooltip>
                    <ConfirmDelete
                      title="حذف این برچسب؟"
                      description={`برچسب «${formatTagLabel(item.name)}» حذف می‌شود و از پست‌های مرتبط برداشته خواهد شد.`}
                      action={deleteTagAction}
                      hiddenFields={{ id: item.id }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 ? (
            <nav className="admin-posts-pagination" aria-label="صفحه‌بندی">
              <button
                type="button"
                className="admin-posts-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </button>
              <span className="admin-posts-page-info">
                {toPersianDigits(String(currentPage))} از{" "}
                {toPersianDigits(String(totalPages))}
              </span>
              <button
                type="button"
                className="admin-posts-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                بعدی
              </button>
            </nav>
          ) : null}
        </>
      )}

      <Sheet
        open={sheetItem != null}
        onOpenChange={(open) => {
          if (!open) {
            setSheetItem(null);
            setSheetMode("actions");
          }
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="admin-posts-sheet border-0 shadow-none"
        >
          {sheetItem ? (
            sheetMode === "edit" ? (
              <>
                <SheetHeader className="admin-posts-sheet-header">
                  <SheetTitle className="admin-posts-sheet-title">
                    ویرایش برچسب
                  </SheetTitle>
                </SheetHeader>
                <div className="admin-posts-sheet-actions">
                  <TagForm
                    tag={{ id: sheetItem.id, name: sheetItem.name }}
                    onSuccess={() => {
                      setSheetItem(null);
                      setSheetMode("actions");
                      router.refresh();
                    }}
                    onCancel={() => setSheetMode("actions")}
                  />
                </div>
              </>
            ) : (
              <>
                <SheetHeader className="admin-posts-sheet-header">
                  <SheetTitle className="admin-posts-sheet-title">
                    {formatTagLabel(sheetItem.name)}
                  </SheetTitle>
                </SheetHeader>
                <div className="admin-posts-sheet-actions">
                  <button
                    type="button"
                    className="admin-posts-sheet-btn"
                    onClick={() => setSheetMode("edit")}
                  >
                    <PencilIcon size={18} strokeWidth={1.75} />
                    ویرایش
                  </button>
                  <button
                    type="button"
                    className="admin-posts-sheet-btn admin-posts-sheet-btn-danger"
                    onClick={() => openDelete(sheetItem)}
                  >
                    <TrashIcon size={18} strokeWidth={1.75} />
                    حذف
                  </button>
                </div>
              </>
            )
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={deleteItem != null}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
        hideTrigger
        title="حذف این برچسب؟"
        description={
          deleteItem
            ? `برچسب «${formatTagLabel(deleteItem.name)}» حذف می‌شود و از پست‌های مرتبط برداشته خواهد شد.`
            : ""
        }
        action={deleteTagAction}
        hiddenFields={deleteItem ? { id: deleteItem.id } : {}}
      />
    </>
  );
}
