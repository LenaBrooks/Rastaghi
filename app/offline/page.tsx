import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { site } from "@/lib/site";

export const metadata = {
  title: "آفلاین",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <SiteShell>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">آفلاین هستید</h1>
        <p className="text-muted-foreground leading-relaxed">
          اتصال اینترنت برقرار نیست. پس از وصل شدن دوباره، صفحه را تازه‌سازی
          کنید یا به {site.title} برگردید.
        </p>
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          بازگشت به خانه
        </Link>
      </div>
    </SiteShell>
  );
}
