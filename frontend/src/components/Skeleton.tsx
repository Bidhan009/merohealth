interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-[#e6e8ea] rounded-lg ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-32 h-8" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="px-6 py-5 flex items-start justify-between border-b border-border">
      <div className="flex gap-4 items-start flex-1">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-2/3 h-3" />
          <Skeleton className="w-1/4 h-3" />
        </div>
      </div>
      <Skeleton className="w-16 h-4" />
    </div>
  );
}