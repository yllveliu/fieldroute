interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--fr-border)] rounded ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--fr-surface-elevated)] border border-[var(--fr-border)] rounded-xl p-5 mb-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-48 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-9 w-36 rounded-lg" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[var(--fr-border)]">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export function PageSkeleton({ variant = "cards", count = 3 }: { variant?: "cards" | "list"; count?: number }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-6" />
      {Array.from({ length: count }).map((_, i) =>
        variant === "list" ? (
          <SkeletonListItem key={i} />
        ) : (
          <SkeletonCard key={i} />
        )
      )}
    </div>
  );
}
