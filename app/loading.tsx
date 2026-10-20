import { Spinner } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div className="route-loading route-loading--shahin" role="status" aria-live="polite">
      <Spinner className="route-loading-spinner" />
      <span>در حال بارگذاری…</span>
    </div>
  );
}
