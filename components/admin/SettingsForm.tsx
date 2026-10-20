"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "@/app/admin/actions";
import { PendingButton } from "@/components/PendingButton";
import { ThemeToggle } from "@/components/ThemeControls";
import { FoldersIcon } from "@/components/lucide/FoldersIcon";
import type { SettingDef } from "@/lib/settings";

type SettingsFormProps = {
  defs: SettingDef[];
  values: Record<string, string>;
};

export function SettingsForm({ defs, values }: SettingsFormProps) {
  const router = useRouter();
  const [state, action] = useActionState(saveSettingsAction, undefined);
  const okTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state?.ok) return;
    router.refresh();
    if (okTimer.current) clearTimeout(okTimer.current);
    okTimer.current = setTimeout(() => {
      /* toast is inline; no-op clear */
    }, 2500);
    return () => {
      if (okTimer.current) clearTimeout(okTimer.current);
    };
  }, [state?.ok, router]);

  const groups = new Map<string, SettingDef[]>();
  for (const def of defs) {
    const list = groups.get(def.group) ?? [];
    list.push(def);
    groups.set(def.group, list);
  }

  return (
    <form action={action} className="admin-settings-form">
      <div className="admin-settings-theme">
        <ThemeToggle variant="settings" />
      </div>
      <Link href="/admin/media" className="admin-settings-media-link">
        <FoldersIcon size={18} strokeWidth={1.75} aria-hidden />
        <span>
          <strong>مدیریت فایل‌ها</strong>
          <span className="admin-muted">حجم Cloudinary و حذف فایل‌ها</span>
        </span>
      </Link>
      {[...groups.entries()].map(([group, items]) => (
        <details key={group} className="admin-settings-group">
          <summary className="admin-settings-group-summary">{group}</summary>
          <div className="admin-settings-group-body">
            {items.map((def) => (
              <label key={def.key} className="admin-settings-field">
                <span className="admin-settings-label">{def.label}</span>
                {def.type === "select" ? (
                  <select
                    name={def.key}
                    defaultValue={values[def.key] ?? def.defaultValue}
                  >
                    {(def.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : def.type === "textarea" ? (
                  <textarea
                    name={def.key}
                    rows={8}
                    defaultValue={values[def.key] ?? def.defaultValue}
                    placeholder={def.defaultValue}
                    autoComplete="off"
                  />
                ) : (
                  <input
                    name={def.key}
                    type="text"
                    defaultValue={values[def.key] ?? def.defaultValue}
                    placeholder={def.defaultValue}
                    autoComplete="off"
                  />
                )}
              </label>
            ))}
          </div>
        </details>
      ))}

      {state?.error ? (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="admin-settings-ok" role="status">
          ذخیره شد.
        </p>
      ) : null}

      <div className="admin-settings-actions">
        <PendingButton pendingLabel="در حال ذخیره…">ذخیره تنظیمات</PendingButton>
      </div>
    </form>
  );
}
