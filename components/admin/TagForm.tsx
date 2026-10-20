"use client";

import { useActionState, useEffect, useEffectEvent, useRef } from "react";
import { createTagAction, updateTagAction } from "@/app/admin/actions";
import { PendingButton } from "@/components/PendingButton";

type TagFormProps = {
  tag?: { id: number; name: string };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
  const isEdit = tag != null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateTagAction : createTagAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSuccess = useEffectEvent(() => {
    if (!isEdit) formRef.current?.reset();
    onSuccess?.();
  });

  useEffect(() => {
    inputRef.current?.focus();
    if (inputRef.current && tag) {
      inputRef.current.value = tag.name;
    }
  }, [tag]);

  useEffect(() => {
    if (!state?.ok) return;
    handleSuccess();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="admin-form admin-inline-form"
      aria-busy={pending}
    >
      <fieldset disabled={pending} className="admin-fieldset">
        {isEdit ? <input type="hidden" name="id" value={tag.id} /> : null}
        <label>
          {isEdit ? "نام برچسب" : "برچسب جدید"}
          <div className="admin-tag-name-row">
            <span className="admin-tag-hash" aria-hidden>
              #
            </span>
            <input
              ref={inputRef}
              name="name"
              required
              defaultValue={tag?.name}
              placeholder="نوشتن"
              dir="rtl"
            />
          </div>
        </label>
        {state?.error ? <p className="admin-error">{state.error}</p> : null}
        <div className="admin-category-form-actions">
          {onCancel ? (
            <button
              type="button"
              className="admin-link-btn admin-category-cancel"
              onClick={onCancel}
            >
              انصراف
            </button>
          ) : null}
          <PendingButton
            pendingLabel={isEdit ? "در حال ذخیره…" : "در حال افزودن…"}
          >
            {isEdit ? "ذخیره" : "افزودن"}
          </PendingButton>
        </div>
      </fieldset>
    </form>
  );
}
