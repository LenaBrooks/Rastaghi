"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

type PendingButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  type?: "submit" | "button";
  variant?: "default" | "danger" | "secondary";
  name?: string;
  value?: string;
};

export function PendingButton({
  children,
  pendingLabel,
  className,
  disabled = false,
  type = "submit",
  variant = "default",
  name,
  value,
}: PendingButtonProps) {
  const { pending, data } = useFormStatus();
  // When several submit buttons share a form, only the clicked one should spin.
  const isThisSubmit =
    !pending ||
    !name ||
    (data != null && String(data.get(name) ?? "") === String(value ?? ""));
  const showPending = pending && isThisSubmit;
  const isBusy = pending || disabled;

  const classes = [
    variant === "danger"
      ? "admin-danger pending-btn-danger"
      : variant === "secondary"
        ? "button admin-step-back"
        : "button",
    "pending-btn",
    showPending ? "is-pending" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      name={name}
      value={value}
      className={classes}
      disabled={isBusy}
      aria-busy={showPending || undefined}
      aria-label={showPending ? pendingLabel ?? "لطفاً صبر کنید…" : undefined}
    >
      <span className="pending-btn-label" aria-hidden={showPending || undefined}>
        {children}
      </span>
      {showPending ? (
        <span className="pending-btn-spinner" aria-hidden>
          <Spinner className="pending-spinner" />
        </span>
      ) : null}
    </button>
  );
}
