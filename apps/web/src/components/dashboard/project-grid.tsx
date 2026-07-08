"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Loader2, Plus, Presentation, Trash2 } from "lucide-react";
import type { ProjectSummary } from "@repo/shared";
import { useProjects } from "@/hooks/queries/useProjects";
import { useCreateProject } from "@/hooks/mutations/useCreateProject";
import { useDeleteProject } from "@/hooks/mutations/useDeleteProject";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  const router = useRouter();
  const deleteProject = useDeleteProject();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(`Xóa "${project.title}"?`)) {
      deleteProject.mutate(project.id);
    }
  }

  return (
    <Card
      className="group cursor-pointer gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg"
      onClick={() => router.push(`/editor/${project.id}`)}
    >
      <div className="bg-muted flex aspect-video items-center justify-center">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Presentation className="text-muted-foreground/40 size-10" />
        )}
      </div>
      <CardContent className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{project.title}</p>
          <p className="text-muted-foreground text-xs">{formatDate(project.updatedAt)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleDelete}
          disabled={deleteProject.isPending}
          aria-label="Xóa project"
        >
          {deleteProject.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Trash2 className="text-destructive" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ProjectGrid() {
  const router = useRouter();
  const projects = useProjects();
  const createProject = useCreateProject();

  async function handleCreate() {
    const project = await createProject.mutateAsync({ title: "Presentation chưa đặt tên" });
    router.push(`/editor/${project.id}`);
  }

  if (projects.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects của bạn</h2>
        <div className="flex gap-2">
          <Link href="/templates" className={buttonVariants({ variant: "outline" })}>
            <LayoutTemplate />
            Từ template
          </Link>
          <Button onClick={handleCreate} disabled={createProject.isPending}>
            {createProject.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Tạo mới
          </Button>
        </div>
      </div>

      {projects.data?.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
          <Presentation className="size-10 opacity-40" />
          <p className="text-sm">Chưa có project nào — bấm "Tạo mới" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.data?.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
