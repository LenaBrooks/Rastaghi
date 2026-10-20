import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettingDefs, getSettingsMap } from "@/lib/settings";

export const metadata: Metadata = {
  title: "تنظیمات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const defs = getSettingDefs();
  const values = await getSettingsMap();

  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <h1>تنظیمات</h1>
      </div>
      <SettingsForm defs={defs} values={values} />
    </section>
  );
}
