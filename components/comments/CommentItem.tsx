"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteCommentAction,
  setCommentLikeAction,
} from "@/app/comments/actions";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { CommentForm } from "@/components/comments/CommentForm";
import { IconTooltip } from "@/components/IconTooltip";
import { JalaliDate } from "@/components/JalaliDate";
import { HeartIcon } from "@/components/lucide/HeartIcon";
import { ReplyIcon } from "@/components/lucide/ReplyIcon";
import { TrashIcon } from "@/components/lucide/TrashIcon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CommentNode } from "@/lib/comments";
import { toPersianDigits } from "@/lib/persian";

const LONG_PRESS_MS = 480;
const LIKE_SYNC_MS = 280;
const AVATAR_HUES = [350, 208, 160, 28, 280, 45, 190, 320] as const;

function avatarStyle(name: string): { background: string; color: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % 997;
  }
  const hue = AVATAR_HUES[hash % AVATAR_HUES.length]!;
  return {
    background: `hsl(${hue} 35% 88%)`,
    color: `hsl(${hue} 40% 32%)`,
  };
}

function avatarLetter(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0]! : "؟";
}

type CommentItemProps = {
  comment: CommentNode;
  postSlug: string;
  isAdmin: boolean;
  onChanged: () => void;
};

export function CommentItem({
  comment,
  postSlug,
  isAdmin,
  onChanged,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [likes, setLikes] = useState(comment.likesCount);
  const [liked, setLiked] = useState(comment.likedByVisitor);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const longPressFired = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const likeSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const likedRef = useRef(comment.likedByVisitor);
  const syncedLikedRef = useRef(comment.likedByVisitor);
  const likesBaseRef = useRef(comment.likesCount);
  const syncGen = useRef(0);

  useEffect(() => {
    return () => {
      if (likeSyncTimer.current != null) clearTimeout(likeSyncTimer.current);
    };
  }, []);

  function clearLongPressTimer() {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function startLongPress(event: React.PointerEvent) {
    if (!isAdmin || event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, label")) return;

    longPressFired.current = false;
    clearLongPressTimer();
    timerRef.current = setTimeout(() => {
      longPressFired.current = true;
      setSheetOpen(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12);
      }
    }, LONG_PRESS_MS);
  }

  function flushLikeSync() {
    const desired = likedRef.current;
    if (desired === syncedLikedRef.current) return;

    const gen = ++syncGen.current;
    const desiredAtSend = desired;

    void (async () => {
      const result = await setCommentLikeAction(comment.id, desiredAtSend);
      if (gen !== syncGen.current) return;

      if ("error" in result) {
        likedRef.current = syncedLikedRef.current;
        setLiked(syncedLikedRef.current);
        setLikes(likesBaseRef.current);
        return;
      }

      syncedLikedRef.current = result.liked;
      likesBaseRef.current = result.likesCount;
      likedRef.current = result.liked;
      setLiked(result.liked);
      setLikes(result.likesCount);

      if (likedRef.current !== syncedLikedRef.current) {
        flushLikeSync();
      }
    })();
  }

  function onLike() {
    const nextLiked = !likedRef.current;
    likedRef.current = nextLiked;
    setLiked(nextLiked);
    setLikes(
      Math.max(
        0,
        likesBaseRef.current +
          (nextLiked === syncedLikedRef.current
            ? 0
            : nextLiked
              ? 1
              : -1),
      ),
    );

    if (likeSyncTimer.current != null) clearTimeout(likeSyncTimer.current);
    likeSyncTimer.current = setTimeout(() => {
      likeSyncTimer.current = null;
      flushLikeSync();
    }, LIKE_SYNC_MS);
  }

  return (
    <li
      className="comment-item"
      data-depth={comment.depth}
      id={`comment-${comment.id}`}
    >
      <article
        className={
          isAdmin ? "comment-card comment-card-admin" : "comment-card"
        }
        onPointerDown={startLongPress}
        onPointerUp={clearLongPressTimer}
        onPointerLeave={clearLongPressTimer}
        onPointerCancel={clearLongPressTimer}
        onContextMenu={(event) => {
          if (isAdmin) event.preventDefault();
        }}
        onClick={() => {
          if (longPressFired.current) {
            longPressFired.current = false;
          }
        }}
      >
        <header className="comment-meta">
          <span
            className="comment-avatar"
            style={avatarStyle(comment.authorName)}
            aria-hidden
          >
            {avatarLetter(comment.authorName)}
          </span>
          <div className="comment-meta-text">
            <strong className="comment-author">{comment.authorName}</strong>
          </div>
          <div className="comment-meta-side">
            {comment.replyToName ? (
              <span className="comment-reply-to">
                در پاسخ به {comment.replyToName}
              </span>
            ) : null}
            <div className="comment-actions">
              <IconTooltip
                label={liked ? "برداشتن پسند" : "پسندیدن"}
                render={
                  <button
                    type="button"
                    className={
                      liked ? "comment-like is-liked" : "comment-like"
                    }
                    onClick={onLike}
                    aria-pressed={liked}
                    aria-label={liked ? "برداشتن پسند" : "پسندیدن"}
                  />
                }
              >
                <HeartIcon size={15} strokeWidth={1.75} aria-hidden />
                <span>{toPersianDigits(likes)}</span>
              </IconTooltip>

              <IconTooltip
                label="پاسخ"
                render={
                  <button
                    type="button"
                    className="comment-reply-btn"
                    onClick={() => setReplying((v) => !v)}
                    aria-label="پاسخ"
                    aria-pressed={replying}
                  />
                }
              >
                <ReplyIcon size={15} strokeWidth={1.75} aria-hidden />
              </IconTooltip>
            </div>
          </div>
        </header>

        <p className="comment-body">{comment.body}</p>

        <footer className="comment-footer">
          <span className="comment-date">
            <JalaliDate date={comment.createdAt} format="%d %b %Y" />
          </span>
        </footer>

        {replying ? (
          <CommentForm
            postSlug={postSlug}
            parentId={comment.id}
            replyToName={comment.authorName}
            compact
            onCancelReply={() => setReplying(false)}
            onSuccess={() => {
              setReplying(false);
              onChanged();
            }}
          />
        ) : null}
      </article>

      {isAdmin ? (
        <>
          <Sheet
            open={sheetOpen}
            onOpenChange={(open) => {
              if (!open) setSheetOpen(false);
            }}
          >
            <SheetContent
              side="bottom"
              showCloseButton={false}
              className="admin-posts-sheet border-0 shadow-none"
            >
              <SheetHeader className="admin-posts-sheet-header">
                <SheetTitle className="admin-posts-sheet-title">
                  نظر {comment.authorName}
                </SheetTitle>
              </SheetHeader>
              <div className="admin-posts-sheet-actions">
                <button
                  type="button"
                  className="admin-posts-sheet-btn"
                  onClick={() => {
                    setSheetOpen(false);
                    setReplying(true);
                  }}
                >
                  <ReplyIcon size={18} strokeWidth={1.75} />
                  پاسخ دادن
                </button>
                <button
                  type="button"
                  className="admin-posts-sheet-btn admin-posts-sheet-btn-danger"
                  onClick={() => {
                    setSheetOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  <TrashIcon size={18} strokeWidth={1.75} />
                  حذف
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <ConfirmDelete
            open={deleteOpen}
            onOpenChange={(open) => {
              if (!open) setDeleteOpen(false);
            }}
            hideTrigger
            title="حذف این نظر؟"
            description={`نظر «${comment.authorName}» و پاسخ‌های زیرش حذف می‌شود.`}
            action={async (formData) => {
              await deleteCommentAction(formData);
              onChanged();
            }}
            hiddenFields={{ id: comment.id }}
          />
        </>
      ) : null}

      {comment.children.length > 0 ? (
        <ul className="comment-children">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              postSlug={postSlug}
              isAdmin={isAdmin}
              onChanged={onChanged}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
