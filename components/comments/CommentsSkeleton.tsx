import { Skeleton } from "@/components/ui/skeleton";

export function CommentsSkeleton() {
  return (
    <section
      id="comments"
      className="comments-section comments-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="comments-skel-heading" />
      <div className="comments-skel-stack">
        <Skeleton className="comments-skel-line" />
        <Skeleton className="comments-skel-line" />
        <Skeleton className="comments-skel-line short" />
        <Skeleton className="comments-skel-block" />
      </div>
      <span className="sr-only">در حال بارگذاری نظرات…</span>
    </section>
  );
}
