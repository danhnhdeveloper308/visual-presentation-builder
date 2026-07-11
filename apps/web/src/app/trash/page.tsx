"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, RotateCcw, Search, Trash2, X } from "lucide-react";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { LIMITS, type TrashProjectSummary } from "@repo/shared";
import { useTrashProjects } from "@/hooks/queries/useTrashProjects";
import { useRestoreProject } from "@/hooks/mutations/useRestoreProject";
import { usePermanentDeleteProject } from "@/hooks/mutations/usePermanentDeleteProject";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FilterId = "all" | "expiring";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function remainingDays(deletedAt: string): number {
  const elapsed = Math.floor((Date.now() - new Date(deletedAt).getTime()) / MS_PER_DAY);
  return Math.max(0, LIMITS.TRASH_RETENTION_DAYS - elapsed);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function TrashCard({ project }: { project: TrashProjectSummary }) {
  const restore = useRestoreProject();
  const permanentDelete = usePermanentDeleteProject();
  const days = remainingDays(project.deletedAt);
  const urgent = days <= 7;

  const confirm = useConfirm();

  async function handleDeletePermanent() {
    const ok = await confirm({
      title: `Xóa vĩnh viễn "${project.title}"?`,
      description: "Hành động này KHÔNG THỂ hoàn tác — toàn bộ nội dung sẽ mất.",
      destructive: true,
      confirmText: "Xóa vĩnh viễn",
    });
    if (ok) permanentDelete.mutate(project.id);
  }

  return (
    <Card className="gap-0 overflow-hidden border-2 border-gray-200">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 relative flex aspect-video items-center justify-center overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover opacity-70 grayscale-[30%]"
          />
        ) : (
          <Trash2 className="size-10 text-gray-400" />
        )}
        <span
          className={
            "absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm " +
            (urgent ? "bg-red-100 text-red-700" : "bg-white/90 text-gray-700")
          }
        >
          Còn {days} ngày
        </span>
      </div>
      <CardContent className="flex flex-col gap-3 bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{project.title}</p>
          <p className="mt-1 text-xs text-gray-500">Đã xóa lúc {formatDate(project.deletedAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={restore.isPending}
            onClick={() => restore.mutate(project.id)}
          >
            {restore.isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            Khôi phục
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-red-50"
            disabled={permanentDelete.isPending}
            onClick={handleDeletePermanent}
            aria-label="Xóa vĩnh viễn"
          >
            {permanentDelete.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrashPage() {
  const trash = useTrashProjects();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = useMemo(() => {
    let list = trash.data ?? [];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q));
    if (filter === "expiring") list = list.filter((p) => remainingDays(p.deletedAt) <= 7);
    return list;
  }, [trash.data, query, filter]);

  return (
    <main className="min-h-dvh bg-linear-to-br from-white via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5 lg:px-8">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </Link>
          <div>
            <h1 className="text-xl font-bold">Thùng rác</h1>
            <p className="text-xs text-gray-600">
              Project đã xóa tự động biến mất vĩnh viễn sau {LIMITS.TRASH_RETENTION_DAYS} ngày.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              placeholder="Tìm theo tên project..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                aria-label="Xóa tìm kiếm"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {(
              [
                { id: "all", label: "Tất cả" },
                { id: "expiring", label: "Sắp hết hạn (≤7 ngày)" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={
                  "rounded-full border px-3 py-1 text-sm " +
                  (filter === f.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400")
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {trash.isPending ? (
          <SkeletonCardGrid count={8} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 py-20">
            <div className="rounded-full bg-gray-100 p-3">
              <Trash2 className="size-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="mb-1 font-medium text-gray-700">
                {trash.data?.length === 0 ? "Thùng rác trống" : "Không tìm thấy project phù hợp"}
              </p>
              <p className="text-sm text-gray-500">
                {trash.data?.length === 0
                  ? "Project đã xóa từ Dashboard sẽ xuất hiện ở đây."
                  : "Thử đổi từ khóa tìm kiếm hoặc bộ lọc."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((p) => (
              <TrashCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
