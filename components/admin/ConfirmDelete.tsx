"use client";

import { IconTooltip } from "@/components/IconTooltip";
import { TrashIcon } from "@/components/lucide/TrashIcon";
import { PendingButton } from "@/components/PendingButton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmDeleteProps = {
  title: string;
  description?: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string | number>;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

export function ConfirmDelete({
  title,
  description,
  action,
  hiddenFields,
  triggerLabel = "حذف",
  open,
  onOpenChange,
  hideTrigger = false,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {hideTrigger ? null : (
        <IconTooltip
          label={triggerLabel}
          render={
            <AlertDialogTrigger
              render={
                <button
                  type="button"
                  className="admin-icon-btn admin-danger"
                  aria-label={triggerLabel}
                />
              }
            />
          }
        >
          <TrashIcon size={18} strokeWidth={1.75} />
        </IconTooltip>
      )}
      <AlertDialogContent size="sm" className="admin-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TrashIcon size={20} strokeWidth={1.75} />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost">انصراف</AlertDialogCancel>
          <form action={action} className="admin-confirm-delete-form">
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input
                key={name}
                type="hidden"
                name={name}
                value={String(value)}
              />
            ))}
            <PendingButton variant="danger" pendingLabel="در حال حذف…">
              حذف
            </PendingButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
