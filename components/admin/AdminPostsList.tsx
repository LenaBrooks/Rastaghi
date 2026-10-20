"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRightIcon, ExternalLinkIcon, InfoIcon } from "lucide-react";
import {
  deletePostAction,
  setPostPublishedAction,
} from "@/app/admin/actions";
import { AdminIconLink } from "@/components/admin/AdminIconLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { IconTooltip } from "@/components/IconTooltip";
import { JalaliDate } from "@/components/JalaliDate";
import { EyeIcon } from "@/components/lucide/EyeIcon";
import { EyeOffIcon } from "@/components/lucide/EyeOffIcon";
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
type SortMode = "newest" | "oldest" | "category";
type StatusFilter = "all" | "draft" | "published";
type SheetView = "actions" | "details";

export type AdminPostItem = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  wordCount: number;
  charCount: number;
  published: boolean;
};

type AdminPostsListProps = {
  posts: AdminPostItem[];
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "newest", label: "جدید به قدیم" },
  { value: "oldest", label: "قدیم به جدید" },
  { value: "category", label: "موضوعی" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس‌ها" },
  { value: "published", label: "منتشرشده‌ها" },
];

function filterByStatus(
  posts: AdminPostItem[],
  status: StatusFilter,
): AdminPostItem[] {
  if (status === "draft") return posts.filter((p) => !p.published);
  if (status === "published") return posts.filter((p) => p.published);
  return posts;
}

function dateSortKey(value: string): string {
  // Normalize so date-only and datetime sort correctly together.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;
  return value.slice(0, 16);
}

function compareByDateDesc(a: AdminPostItem, b: AdminPostItem): number {
  return (
    dateSortKey(b.date).localeCompare(dateSortKey(a.date)) ||
    a.slug.localeCompare(b.slug)
  );
}

function compareByDateAsc(a: AdminPostItem, b: AdminPostItem): number {
  return (
    dateSortKey(a.date).localeCompare(dateSortKey(b.date)) ||
    a.slug.localeCompare(b.slug)
  );
}

function sortPosts(posts: AdminPostItem[], mode: SortMode): AdminPostItem[] {
  const list = [...posts];
  if (mode === "newest") return list.sort(compareByDateDesc);
  if (mode === "oldest") return list.sort(compareByDateAsc);
  return list.sort((a, b) => {
    const catA = a.categories[0] ?? "\uffff";
    const catB = b.categories[0] ?? "\uffff";
    return catA.localeCompare(catB, "fa") || compareByDateDesc(a, b);
  });
}

export function AdminPostsList({ posts }: AdminPostsListProps) {
  const router = useRouter();
  const [sort, setSort] = useState<SortMode>("newest");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [sheetPost, setSheetPost] = useState<AdminPostItem | null>(null);
  const [sheetView, setSheetView] = useState<SheetView>("actions");
  const [deletePost, setDeletePost] = useState<AdminPostItem | null>(null);
  const longPressFired = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = filterByStatus(posts, status);
  const sorted = sortPosts(filtered, sort);
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

  function changeStatus(next: StatusFilter) {
    setStatus(next);
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

  function openSheet(post: AdminPostItem) {
    setSheetView("actions");
    setSheetPost(post);
  }

  function startLongPress(post: AdminPostItem) {
    longPressFired.current = false;
    clearLongPressTimer();
    timerRef.current = setTimeout(() => {
      longPressFired.current = true;
      openSheet(post);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12);
      }
    }, LONG_PRESS_MS);
  }

  function openDelete(post: AdminPostItem) {
    setSheetPost(null);
    setDeletePost(post);
  }

  function rowNumber(index: number) {
    return toPersianDigits(String((currentPage - 1) * pageSize + index + 1));
  }

  return (
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
              aria-label="مرتب‌سازی"
            >
              <SelectValue />
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

          <Select
            items={STATUS_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={status}
            onValueChange={(value) => {
              if (typeof value === "string") {
                changeStatus(value as StatusFilter);
              }
            }}
          >
            <SelectTrigger
              className="admin-posts-select-trigger"
              aria-label="وضعیت انتشار"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className="admin-posts-select-content shadow-none ring-0"
              alignItemWithTrigger={false}
              align="start"
              sideOffset={6}
            >
              <SelectGroup>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="admin-posts-page-size">
          <span className="admin-posts-page-size-label" id="admin-posts-page-size-label">
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
              aria-labelledby="admin-posts-page-size-label"
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
        {pageItems.map((post, index) => (
          <li key={post.slug}>
            <button
              type="button"
              className="admin-posts-mobile-item"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                startLongPress(post);
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
                router.push(`/admin/${post.slug}/edit`);
              }}
            >
              <span className="admin-posts-mobile-num">{rowNumber(index)}</span>
              <span className="admin-posts-mobile-title">
                <span className="admin-posts-mobile-title-text">{post.title}</span>
                {post.published ? (
                  <span className="admin-status-badge is-published">
                    منتشرشده
                  </span>
                ) : (
                  <span className="admin-status-badge is-draft">پیش‌نویس</span>
                )}
              </span>
              <span className="admin-posts-mobile-date">
                <JalaliDate date={post.date} format="%d %b %Y - %H:%M" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <table className="admin-table admin-posts-desktop">
        <thead>
          <tr>
            <th className="admin-table-num">#</th>
            <th className="admin-table-title">عنوان</th>
            <th className="admin-table-date">تاریخ و ساعت</th>
            <th className="admin-table-actions">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((post, index) => (
            <tr key={post.slug}>
              <td className="admin-table-num">{rowNumber(index)}</td>
              <td className="admin-table-title">
                <Link href={`/admin/${post.slug}/edit`}>{post.title}</Link>
                {post.published ? (
                  <span className="admin-status-badge is-published">
                    منتشرشده
                  </span>
                ) : (
                  <span className="admin-status-badge is-draft">پیش‌نویس</span>
                )}
              </td>
              <td className="admin-table-date">
                <JalaliDate date={post.date} format="%d %b %Y - %H:%M" />
              </td>
              <td className="admin-table-actions admin-row-actions">
                <AdminIconLink
                  href={`/admin/${post.slug}/edit`}
                  label="ویرایش"
                >
                  <PencilIcon size={18} strokeWidth={1.75} />
                </AdminIconLink>
                <form action={setPostPublishedAction}>
                  <input type="hidden" name="slug" value={post.slug} />
                  <input
                    type="hidden"
                    name="published"
                    value={post.published ? "false" : "true"}
                  />
                  <IconTooltip
                    label={post.published ? "تبدیل به پیش‌نویس" : "انتشار"}
                    render={
                      <button
                        type="submit"
                        className="admin-icon-btn"
                        aria-label={
                          post.published ? "تبدیل به پیش‌نویس" : "انتشار"
                        }
                      />
                    }
                  >
                    {post.published ? (
                      <EyeOffIcon size={18} strokeWidth={1.75} />
                    ) : (
                      <EyeIcon size={18} strokeWidth={1.75} />
                    )}
                  </IconTooltip>
                </form>
                <ConfirmDelete
                  title="حذف؟"
                  description={`«${post.title}»`}
                  action={deletePostAction}
                  hiddenFields={{ slug: post.slug }}
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

      <Sheet
        open={sheetPost != null}
        onOpenChange={(open) => {
          if (!open) {
            setSheetPost(null);
            setSheetView("actions");
          }
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="admin-posts-sheet border-0 shadow-none"
        >
          {sheetPost ? (
            sheetView === "details" ? (
              <>
                <SheetHeader className="admin-posts-sheet-header admin-posts-sheet-header--back">
                  <button
                    type="button"
                    className="admin-posts-sheet-back"
                    onClick={() => setSheetView("actions")}
                    aria-label="بازگشت"
                  >
                    <ArrowRightIcon size={20} strokeWidth={1.75} />
                  </button>
                  <SheetTitle className="admin-posts-sheet-title">
                    جزئیات
                  </SheetTitle>
                </SheetHeader>
                <dl className="admin-posts-sheet-details">
                  <div>
                    <dt>عنوان</dt>
                    <dd>{sheetPost.title}</dd>
                  </div>
                  <div>
                    <dt>تاریخ انتشار</dt>
                    <dd>
                      <JalaliDate
                        date={sheetPost.date}
                        format="%d %b %Y - %H:%M"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>موضوع</dt>
                    <dd>
                      {sheetPost.categories[0] ?? "بدون موضوع"}
                    </dd>
                  </div>
                  <div>
                    <dt>تعداد کلمه</dt>
                    <dd>
                      {toPersianDigits(sheetPost.wordCount)} کلمه
                    </dd>
                  </div>
                  <div>
                    <dt>تعداد حروف</dt>
                    <dd>
                      {toPersianDigits(sheetPost.charCount)} حرف
                    </dd>
                  </div>
                  {sheetPost.tags.length > 0 ? (
                    <div>
                      <dt>برچسب‌ها</dt>
                      <dd>
                        {sheetPost.tags.map((t) => `#${t}`).join("، ")}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </>
            ) : (
              <>
                <SheetHeader className="admin-posts-sheet-header">
                  <SheetTitle className="admin-posts-sheet-title">
                    {sheetPost.title}
                  </SheetTitle>
                </SheetHeader>
                <div className="admin-posts-sheet-actions">
                  <Link
                    href={`/admin/${sheetPost.slug}/edit`}
                    className="admin-posts-sheet-btn"
                    onClick={() => setSheetPost(null)}
                  >
                    <PencilIcon size={18} strokeWidth={1.75} />
                    ویرایش
                  </Link>
                  {sheetPost.published ? (
                    <Link
                      href={`/${sheetPost.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-posts-sheet-btn"
                      onClick={() => setSheetPost(null)}
                    >
                      <ExternalLinkIcon size={18} strokeWidth={1.75} />
                      مشاهده در سایت
                    </Link>
                  ) : null}
                  <form
                    action={setPostPublishedAction}
                    className="admin-posts-sheet-form"
                  >
                    <input type="hidden" name="slug" value={sheetPost.slug} />
                    <input
                      type="hidden"
                      name="published"
                      value={sheetPost.published ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="admin-posts-sheet-btn"
                      onClick={() => setSheetPost(null)}
                    >
                      {sheetPost.published ? (
                        <EyeOffIcon size={18} strokeWidth={1.75} />
                      ) : (
                        <EyeIcon size={18} strokeWidth={1.75} />
                      )}
                      {sheetPost.published
                        ? "تبدیل به پیش‌نویس"
                        : "انتشار"}
                    </button>
                  </form>
                  <button
                    type="button"
                    className="admin-posts-sheet-btn"
                    onClick={() => setSheetView("details")}
                  >
                    <InfoIcon size={18} strokeWidth={1.75} />
                    جزئیات
                  </button>
                  <button
                    type="button"
                    className="admin-posts-sheet-btn admin-posts-sheet-btn-danger"
                    onClick={() => openDelete(sheetPost)}
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
        open={deletePost != null}
        onOpenChange={(open) => {
          if (!open) setDeletePost(null);
        }}
        hideTrigger
        title="حذف؟"
        description={deletePost ? `«${deletePost.title}»` : undefined}
        action={deletePostAction}
        hiddenFields={deletePost ? { slug: deletePost.slug } : {}}
      />
    </>
  );
}
