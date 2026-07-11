import { Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Loading toàn trang có thương hiệu — logo gradient nhấp nháy + vòng quay.
 * Dùng cho trạng thái `isPending` cấp trang (dashboard, account, admin...).
 */
export function PageLoader({
  label = "Đang tải...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center gap-5 bg-linear-to-br from-white via-blue-50 to-indigo-100",
        className,
      )}
    >
      <span className="relative flex size-16 items-center justify-center">
        <span className="border-primary/30 border-t-primary absolute inset-0 animate-spin rounded-2xl border-4" />
        <span className="from-primary to-secondary flex size-11 items-center justify-center rounded-xl bg-linear-to-br shadow-lg">
          <Presentation className="size-6 text-white" />
        </span>
      </span>
      <p className="text-muted-foreground animate-pulse text-sm font-medium">{label}</p>
    </div>
  );
}
