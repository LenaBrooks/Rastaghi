import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-live="polite">
      <div className="admin-card admin-loading-card">
        <div className="admin-toolbar">
          <Skeleton className="admin-skel-title" />
          <Skeleton className="admin-skel-btn" />
        </div>
        <div className="admin-skel-stack">
          <Skeleton className="admin-skel-line" />
          <Skeleton className="admin-skel-line" />
          <Skeleton className="admin-skel-line short" />
          <Skeleton className="admin-skel-block" />
        </div>
        <span className="sr-only">در حال بارگذاری پنل…</span>
      </div>
    </div>
  );
}
