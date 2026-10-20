import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div
      className="home-shahin route-loading-shell"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="home-shahin-shell">
        <div className="home-shahin-topbar route-loading-topbar">
          <Skeleton className="route-skel-avatar" />
          <div className="route-skel-nav" aria-hidden>
            <Skeleton className="route-skel-nav-item" />
            <Skeleton className="route-skel-nav-item" />
            <Skeleton className="route-skel-nav-item" />
            <Skeleton className="route-skel-nav-item short" />
          </div>
        </div>
      </div>
      <div className="home-shahin-shell home-shahin-shell--body route-loading-body">
        <Skeleton className="route-skel-title" />
        <Skeleton className="route-skel-line" />
        <Skeleton className="route-skel-line" />
        <Skeleton className="route-skel-line short" />
        <Skeleton className="route-skel-block" />
        <Skeleton className="route-skel-line" />
        <Skeleton className="route-skel-line mid" />
      </div>
      <span className="sr-only">در حال بارگذاری…</span>
    </div>
  );
}
