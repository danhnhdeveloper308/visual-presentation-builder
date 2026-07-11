import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE = { sm: "size-4", md: "size-6", lg: "size-8", xl: "size-10" } as const;

/** Spinner loading dùng chung — thống nhất icon + màu primary toàn app. */
export function Spinner({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <Loader2 className={cn("text-primary animate-spin", SIZE[size], className)} aria-hidden />
  );
}
