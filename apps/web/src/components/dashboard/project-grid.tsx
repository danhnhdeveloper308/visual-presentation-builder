"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownAZ,
  Clock,
  Copy,
  LayoutTemplate,
  Loader2,
  Pencil,
  Plus,
  Presentation,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ProjectSummary } from "@repo/shared";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/queries/useProjects";
import { useCreateProject } from "@/hooks/mutations/useCreateProject";
import { useDeleteProject } from "@/hooks/mutations/useDeleteProject";
import { useDuplicateProject } from "@/hooks/mutations/useDuplicateProject";
import { useUpdateProjectMeta } from "@/hooks/mutations/useUpdateProjectMeta";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ProjectCardPreview } from "./project-card-preview";

type SortMode = "updated" | "created" | "title";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "updated", label: "Sửa gần nhất" },
  { value: "created", label: "Mới tạo" },
  { value: "title", label: "Tên A→Z" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  const router = useRouter();
  const confirm = useConfirm();
  const deleteProject = useDeleteProject();
  const duplicateProject = useDuplicateProject();
  const updateMeta = useUpdateProjectMeta(project.id);
  const [hovering, setHovering] = useState(false);
  const [renaming, setRenaming] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const ok = await confirm({
      title: `Xóa "${project.title}"?`,
      description: "Project sẽ được chuyển vào Thùng rác và tự xóa vĩnh viễn sau 90 ngày.",
      destructive: true,
      confirmText: "Xóa",
    });
    if (ok) deleteProject.mutate(project.id);
  }

  function handleDuplicate(e: React.MouseEvent) {
    e.stopPropagation();
    duplicateProject.mutate(project.id);
  }

  function commitRename(value: string) {
    setRenaming(false);
    const next = value.trim();
    if (next && next !== project.title) updateMeta.mutate({ title: next });
  }

  const busy = deleteProject.isPending || duplicateProject.isPending;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!renaming) router.push(`/editor/${project.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !renaming) router.push(`/editor/${project.id}`);
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group hover:border-primary/60 hover:shadow-primary/10 cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <ProjectCardPreview project={project} hovering={hovering} />

      <div className="flex items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              autoFocus
              defaultValue={project.title}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => commitRename(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="border-input focus:border-primary w-full rounded-md border bg-transparent px-2 py-0.5 text-sm font-semibold outline-none"
            />
          ) : (
            <p className="truncate text-sm font-semibold text-gray-900">{project.title}</p>
          )}
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <Clock className="size-3" /> {formatDate(project.updatedAt)}
          </p>
        </div>

        {/* Hover actions: đổi tên nhanh / nhân bản / xóa */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 transition-opacity",
            hovering && !renaming ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-gray-500 hover:text-gray-900"
            title="Đổi tên"
            aria-label="Đổi tên project"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              setRenaming(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-gray-500 hover:text-gray-900"
            title="Nhân bản"
            aria-label="Nhân bản project"
            disabled={busy}
            onClick={handleDuplicate}
          >
            {duplicateProject.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive size-8 hover:bg-red-50"
            title="Xóa"
            aria-label="Xóa project"
            disabled={busy}
            onClick={handleDelete}
          >
            {deleteProject.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProjectGrid() {
  const router = useRouter();
  const projects = useProjects();
  const createProject = useCreateProject();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("updated");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (projects.data ?? []).filter(
      (p) => q === "" || p.title.toLowerCase().includes(q),
    );
    return [...list].sort((a, b) => {
      switch (sort) {
        case "updated":
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
        case "created":
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "title":
          return a.title.localeCompare(b.title, "vi");
      }
    });
  }, [projects.data, search, sort]);

  async function handleCreate() {
    const project = await createProject.mutateAsync({ title: "Presentation chưa đặt tên" });
    router.push(`/editor/${project.id}`);
  }

  if (projects.isPending) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  const total = projects.data?.length ?? 0;

  return (
    <section className="flex flex-col gap-5">
      {/* Thanh công cụ: tiêu đề + tìm kiếm + sắp xếp + tạo mới */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold text-gray-900">Project của bạn</h2>
          <span className="text-sm text-gray-500">{total}</span>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm project theo tên..."
              className="rounded-full bg-white pl-9"
            />
          </div>
          <div className="relative">
            <ArrowDownAZ className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="Sắp xếp project"
              className="border-input h-9 rounded-full border bg-white pr-3 pl-9 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleCreate}
            disabled={createProject.isPending}
            className="from-primary to-secondary hover:shadow-primary/30 rounded-full bg-linear-to-r transition-all hover:shadow-lg"
          >
            {createProject.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Tạo mới
          </Button>
        </div>
      </div>

      {/* Grid / empty state */}
      {total === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 py-20">
          <div className="rounded-full bg-gray-100 p-3">
            <Presentation className="size-8 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="mb-1 font-medium text-gray-700">Chưa có project nào</p>
            <p className="mb-4 text-sm text-gray-500">
              Bắt đầu bằng cách tạo một project mới hoặc chọn từ template
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={handleCreate}
                className="from-primary to-secondary bg-linear-to-r text-white"
              >
                <Plus size={18} /> Tạo Project Đầu Tiên
              </Button>
              <Link href="/templates" className={buttonVariants({ variant: "outline" })}>
                <LayoutTemplate size={18} /> Xem template
              </Link>
            </div>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 py-16">
          <Sparkles className="size-6 text-gray-400" />
          <p className="text-sm text-gray-600">
            Không tìm thấy project nào khớp “{search.trim()}”
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
