"use client";

import { useActionState, useEffect, useEffectEvent, useRef } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions";
import { PendingButton } from "@/components/PendingButton";
import type { HomeItemMode } from "@/lib/categories";

type CategoryFormProps = {
  category?: {
    id: number;
    name: string;
    showOnHome?: boolean;
    showInHeader?: boolean;
    homeItemMode?: HomeItemMode;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const isEdit = category != null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateCategoryAction : createCategoryAction,
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
    if (inputRef.current && category) {
      inputRef.current.value = category.name;
    }
  }, [category]);

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
        {isEdit ? <input type="hidden" name="id" value={category.id} /> : null}
        <label>
          {isEdit ? "نام دسته" : "نام دستهٔ جدید"}
          <input
            ref={inputRef}
            name="name"
            required
            defaultValue={category?.name}
            placeholder="مثلاً توسعه"
          />
        </label>
        <label className="admin-featured-check">
          <input
            type="checkbox"
            name="show_on_home"
            defaultChecked={category?.showOnHome === true}
          />
          <span>نمایش در صفحه اصلی</span>
        </label>
        <label className="admin-featured-check">
          <input
            type="checkbox"
            name="show_in_header"
            defaultChecked={category?.showInHeader === true}
          />
          <span>لینک در هدر</span>
        </label>
        <label>
          نمایش آیتم در صفحه اصلی
          <select
            name="home_item_mode"
            defaultValue={category?.homeItemMode ?? "title"}
          >
            <option value="title">عنوان پست</option>
            <option value="body">متن پست</option>
          </select>
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
