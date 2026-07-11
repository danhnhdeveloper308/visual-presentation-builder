import { cn } from "@/lib/utils";

/** Khối skeleton cơ bản — nền muted + shimmer chạy ngang. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("skeleton-shimmer bg-muted/70 rounded-md", className)}
      aria-hidden
      {...props}
    />
  );
}

/** Vài dòng text giả — `lines` dòng, dòng cuối ngắn hơn cho tự nhiên. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Skeleton 1 card project/template: khung preview 16:9 + tiêu đề + meta. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-gray-200 bg-white", className)}>
      <Skeleton className="aspect-video rounded-none" />
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}

/** Lưới nhiều SkeletonCard — dùng cho trạng thái loading của grid project/template. */
export function SkeletonCardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
