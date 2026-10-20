import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="not-found">
        <h1>صفحه پیدا نشد</h1>
        <pre aria-hidden>{`404`}</pre>
        <p>این آدرس وجود ندارد یا جابه‌جا شده است.</p>
        <p>
          <Link href="/">بازگشت به خانه</Link>
        </p>
      </div>
    </SiteShell>
  );
}
