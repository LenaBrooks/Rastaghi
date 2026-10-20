"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { PendingButton } from "@/components/PendingButton";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form
      action={formAction}
      className="admin-form"
      aria-busy={pending}
    >
      <fieldset disabled={pending} className="admin-fieldset">
        <input type="hidden" name="next" value={nextPath} />
        <label>
          رمز عبور
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            autoFocus
          />
        </label>
        {state?.error ? <p className="admin-error">{state.error}</p> : null}
        <PendingButton pendingLabel="در حال ورود…">ورود</PendingButton>
      </fieldset>
    </form>
  );
}
