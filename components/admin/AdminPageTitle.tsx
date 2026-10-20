import Link from "next/link";
import { ArrowRightIcon } from "@/components/lucide/ArrowRightIcon";

type AdminPageTitleProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
};

export function AdminPageTitle({
  title,
  backHref = "/admin",
  backLabel = "بازگشت به لیست پست‌ها",
}: AdminPageTitleProps) {
  return (
    <div className="admin-page-title">
      <Link
        href={backHref}
        className="admin-back-link"
        aria-label={backLabel}
      >
        <ArrowRightIcon size={22} strokeWidth={1.75} aria-hidden />
      </Link>
      <h1>{title}</h1>
    </div>
  );
}
