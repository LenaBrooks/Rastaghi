"use client";

import { useRouter } from "next/navigation";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentItem } from "@/components/comments/CommentItem";
import { MessageCircleIcon } from "@/components/lucide/MessageCircleIcon";
import type { CommentNode } from "@/lib/comments";
import type { CommentMode } from "@/lib/settings";
import { toPersianDigits } from "@/lib/persian";

type CommentsSectionProps = {
  postSlug: string;
  tree: CommentNode[];
  totalCount: number;
  isAdmin: boolean;
  commentMode: CommentMode;
};

export function CommentsSection({
  postSlug,
  tree,
  totalCount,
  isAdmin,
  commentMode,
}: CommentsSectionProps) {
  const router = useRouter();
  const canComment = commentMode !== "closed" || isAdmin;

  function refresh() {
    router.refresh();
  }

  return (
    <section
      id="comments"
      className="comments-section"
      aria-labelledby="comments-heading"
    >
      <h2 id="comments-heading" className="comments-heading">
        <MessageCircleIcon size={20} strokeWidth={1.75} aria-hidden />
        نظرات
        {totalCount > 0 ? (
          <span className="comments-count">
            ({toPersianDigits(totalCount)})
          </span>
        ) : null}
      </h2>

      {commentMode === "closed" && !isAdmin ? (
        <p className="comments-closed" role="status">
          ثبت نظر در حال حاضر بسته است.
        </p>
      ) : (
        <CommentForm postSlug={postSlug} onSuccess={refresh} />
      )}

      {tree.length === 0 ? (
        <p className="comments-empty">
          {commentMode === "closed" && !isAdmin
            ? "نظری برای نمایش نیست."
            : isAdmin
              ? "هنوز نظری نیست."
              : "هنوز نظری ثبت نشده. اولین نفر باشید."}
        </p>
      ) : (
        <ul className="comment-list">
          {tree.map((node) => (
            <CommentItem
              key={node.id}
              comment={node}
              postSlug={postSlug}
              isAdmin={isAdmin}
              canReply={canComment}
              onChanged={refresh}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
