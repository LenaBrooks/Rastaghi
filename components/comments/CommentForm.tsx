"use client";

import { useActionState, useEffect, useEffectEvent, useRef, useState } from "react";
import {
  createCommentAction,
  type CommentActionState,
} from "@/app/comments/actions";
import { PendingButton } from "@/components/PendingButton";

const NAME_KEY = "comment-author-name";

type CommentFormProps = {
  postSlug: string;
  parentId?: number | null;
  replyToName?: string | null;
  onCancelReply?: () => void;
  onSuccess?: () => void;
  compact?: boolean;
};

export function CommentForm({
  postSlug,
  parentId = null,
  replyToName = null,
  onCancelReply,
  onSuccess,
  compact = false,
}: CommentFormProps) {
  const [name, setName] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (parentId != null) bodyRef.current?.focus();
  }, [parentId]);

  const handleSuccess = useEffectEvent(() => {
    formRef.current?.reset();
    try {
      if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* ignore */
    }
    onSuccess?.();
  });

  const [state, formAction] = useActionState(
    async (
      prev: CommentActionState | undefined,
      formData: FormData,
    ): Promise<CommentActionState> => {
      const result = await createCommentAction(prev, formData);
      return result;
    },
    undefined,
  );

  useEffect(() => {
    if (state?.ok) handleSuccess();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={compact ? "comment-form comment-form-compact" : "comment-form"}
    >
      <input type="hidden" name="postSlug" value={postSlug} />
      {parentId != null ? (
        <input type="hidden" name="parentId" value={parentId} />
      ) : null}

      {replyToName ? (
        <div className="comment-form-reply-bar">
          <span>پاسخ به {replyToName}</span>
          {onCancelReply ? (
            <button
              type="button"
              className="comment-form-cancel"
              onClick={onCancelReply}
            >
              انصراف
            </button>
          ) : null}
        </div>
      ) : null}

      <label className="comment-field">
        <span>نام</span>
        <input
          name="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام شما"
          autoComplete="nickname"
        />
      </label>

      <label className="comment-field">
        <span>نظر</span>
        <textarea
          ref={bodyRef}
          name="body"
          required
          maxLength={4000}
          rows={compact ? 3 : 4}
          placeholder="متن پیام…"
        />
      </label>

      {state?.error ? <p className="comment-error">{state.error}</p> : null}

      <div className="comment-form-actions">
        <PendingButton pendingLabel="در حال ارسال…">ارسال نظر</PendingButton>
      </div>
    </form>
  );
}
