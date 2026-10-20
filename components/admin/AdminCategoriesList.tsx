"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
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

const LONG_PRESS_MS = 480;
const PAGE_SIZES = [10, 15, 30] as const;

type PageSize = (typeof PAGE_SIZES)[number];
type SortMode = "name-asc" | "name-desc";

export type AdminCategoryItem = {
  id: number;
  name: string;
  slug: string;
  showOnHome: boolean;
  homeItemMode: "title" | "body";
};

type AdminCategoriesListProps = {
  categories: AdminCategoryItem[];
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "name-asc", label: "نام (الف تا ی)" },
  { value: "name-desc", label: "نام (ی تا الف)" },
];

function sortCategories(
  items: AdminCategoryItem[],
  mode: SortMode,
): AdminCategoryItem[] {
  const list = [...items];
  if (mode === "name-desc") {
    return list.sort(
      (a, b) => b.name.localeCompare(a.name, "fa") || a.id - b.id,
    );
  }
  return list.sort(
    (a, b) => a.name.localeCompare(b.name, "fa") || a.id - b.id,
  );
}

export function AdminCategoriesList({ categories }: AdminCategoriesListProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryItem | null>(null);
  const [sort, setSort] = useState<SortMode>("name-asc");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [sheetItem, setSheetItem] = useState<AdminCategoryItem | null>(null);
  const [sheetMode, setSheetMode] = useState<"actions" | "edit">("actions");
  const [deleteItem, setDeleteItem] = useState<AdminCategoryItem | null>(null);
  const longPressFired = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sorted = sortCategories(categories, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function changeSort(next: SortMode) {
    setSort(next);
    setPage(1);
  }

  function changePageSize(next: PageSize) {
    setPageSize(next);
    setPage(1);
  }

  function clearLongPressTimer() {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openSheet(item: AdminCategoryItem) {
    setSheetMode("actions");
    setSheetItem(item);
  }

  function startEdit(item: AdminCategoryItem) {
    setAdding(false);
    setSheetItem(null);
    setEditing(item);
  }

  function startLongPress(item: AdminCategoryItem) {
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

  function openDelete(item: AdminCategoryItem) {
    setSheetItem(null);
    setDeleteItem(item);
  }

  function rowNumber(index: number) {
    return toPersianDigits(String((currentPage - 1) * pageSize + index + 1));
  }

  return (
    <>
      <div className="admin-toolbar">
        <h1>دسته‌بندی‌ها</h1>
        <button
          type="button"
          className="admin-text-btn admin-text-btn-primary"
          aria-expanded={adding}
          onClick={() => {
            setEditing(null);
            setAdding((v) => !v);
          }}
        >
          {adding ? "بستن" : "دسته جدید"}
        </button>
      </div>

      {adding ? (
        <div className="admin-categories-add">
          <CategoryForm
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
          <CategoryForm
            category={{ id: editing.id, name: editing.name }}
            onSuccess={() => {
              setEditing(null);
              router.refresh();
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : null}

      {categories.length === 0 ? (
        <p className="admin-muted">هنوز دسته‌ای ساخته نشده.</p>
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
                id="admin-categories-page-size-label"
              >
                تعداد
              </span>
              <Select
                items={PAGE_SIZES.map((size) => ({
                  label: toPersianDigits(size),
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
                  aria-labelledby="admin-categories-page-size-label"
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
                        {toPersianDigits(size)}
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
                    {item.name}
                    {item.showOnHome ? (
                      <span className="admin-cat-home-badge">
                        صفحه اصلی
                        {item.homeItemMode === "body" ? " · متن" : ""}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <table className="admin-table admin-posts-desktop">
            <thead>
              <tr>
                <th className="admin-table-num">#</th>
                <th className="admin-table-title">نام</th>
                <th className="admin-table-home">صفحه اصلی</th>
                <th className="admin-table-actions">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="admin-table-num">{rowNumber(index)}</td>
                  <td className="admin-table-title">{item.name}</td>
                  <td className="admin-table-home">
                    {item.showOnHome
                      ? item.homeItemMode === "body"
                        ? "بله · متن"
                        : "بله · عنوان"
                      : "—"}
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
                      title="حذف این دسته؟"
                      description={`دستهٔ «${item.name}» حذف می‌شود و از پست‌های مرتبط برداشته خواهد شد.`}
                      action={deleteCategoryAction}
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
                    ویرایش دسته
                  </SheetTitle>
                </SheetHeader>
                <div className="admin-posts-sheet-actions">
                  <CategoryForm
                    category={{ id: sheetItem.id, name: sheetItem.name }}
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
                    {sheetItem.name}
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
        title="حذف این دسته؟"
        description={
          deleteItem
            ? `دستهٔ «${deleteItem.name}» حذف می‌شود و از پست‌های مرتبط برداشته خواهد شد.`
            : ""
        }
        action={deleteCategoryAction}
        hiddenFields={deleteItem ? { id: deleteItem.id } : {}}
      />
    </>
  );
}
