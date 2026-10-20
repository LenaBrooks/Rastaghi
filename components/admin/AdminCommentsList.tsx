"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  approveCommentAction,
  deleteCommentAction,
} from "@/app/comments/actions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { IconTooltip } from "@/components/IconTooltip";
import { JalaliDate } from "@/components/JalaliDate";
import { CheckIcon } from "@/components/lucide/CheckIcon";
import { ExternalLinkIcon } from "@/components/lucide/ExternalLinkIcon";
import { PendingButton } from "@/components/PendingButton";
import type { AdminCommentItem } from "@/lib/comments";
import { toPersianDigits } from "@/lib/persian";

type AdminCommentsListProps = {
  comments: AdminCommentItem[];
};

export function AdminCommentsList({ comments }: AdminCommentsListProps) {
  const router = useRouter();
  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  if (comments.length === 0) {
    return <p className="admin-muted">هنوز نظری ثبت نشده.</p>;
  }

  return (
    <div className="admin-comments">
      {pending.length > 0 ? (
        <section
          className="admin-comments-section"
          aria-labelledby="pending-comments-heading"
        >
          <h2 id="pending-comments-heading" className="admin-comments-heading">
            در انتظار تأیید
            <span className="admin-count-badge" aria-hidden>
              {toPersianDigits(pending.length)}
            </span>
          </h2>
          <ul className="admin-comments-list">
            {pending.map((item) => (
              <CommentRow
                key={item.id}
                item={item}
                onDone={() => router.refresh()}
              />
            ))}
          </ul>
        </section>
      ) : (
        <p className="admin-muted">نظر معلقی نیست.</p>
      )}

      {approved.length > 0 ? (
        <section
          className="admin-comments-section"
          aria-labelledby="approved-comments-heading"
        >
          <h2 id="approved-comments-heading" className="admin-comments-heading">
            تأییدشده‌ها
          </h2>
          <ul className="admin-comments-list">
            {approved.map((item) => (
              <CommentRow
                key={item.id}
                item={item}
                onDone={() => router.refresh()}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CommentRow({
  item,
  onDone,
}: {
  item: AdminCommentItem;
  onDone: () => void;
}) {
  const postLabel = item.postTitle ?? item.postSlug;

  return (
    <li
      className={
        item.approved ? "admin-comment-card" : "admin-comment-card is-pending"
      }
    >
      <div className="admin-comment-main">
        <div className="admin-comment-text">
          <strong className="admin-comment-author">{item.authorName}</strong>
          <p className="admin-comment-body">{item.body}</p>
        </div>
        <div className="admin-comment-side">
          <div className="admin-comment-actions">
            {!item.approved ? (
              <form
                action={async (fd) => {
                  await approveCommentAction(fd);
                  onDone();
                }}
                className="admin-comment-approve-form"
              >
                <input type="hidden" name="id" value={item.id} />
                <PendingButton
                  className="admin-icon-btn admin-comment-approve"
                  aria-label="تأیید"
                >
                  <CheckIcon size={18} strokeWidth={2} />
                </PendingButton>
              </form>
            ) : null}
            <IconTooltip
              label={`مشاهده در «${postLabel}»`}
              render={
                <Link
                  href={`/${item.postSlug}#comment-${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-icon-btn"
                  aria-label={`مشاهده در ${postLabel}`}
                />
              }
            >
              <ExternalLinkIcon size={17} strokeWidth={1.75} />
            </IconTooltip>
            <ConfirmDelete
              title="حذف این نظر؟"
              description={`نظر «${item.authorName}» و پاسخ‌های زیرش حذف می‌شود.`}
              action={async (fd) => {
                await deleteCommentAction(fd);
                onDone();
              }}
              hiddenFields={{ id: item.id }}
            />
          </div>
          <span className="admin-comment-date">
            <JalaliDate date={item.createdAt} format="%d %b %Y - %H:%M" />
          </span>
        </div>
      </div>
    </li>
  );
}
