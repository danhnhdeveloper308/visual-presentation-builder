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
      className="group cursor-pointer gap-0 overflow-hidden border-2 border-gray-200 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
      onClick={() => router.push(`/editor/${project.id}`)}
    >
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex aspect-video items-center justify-center relative overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Presentation className="text-gray-400 size-12" />
            <span className="text-xs text-gray-400">Slide</span>
          </div>
        )}
      </div>
      <CardContent className="flex items-center justify-between gap-3 px-5 py-4 bg-white">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground text-sm">{project.title}</p>
          <p className="text-gray-500 text-xs mt-1">{formatDate(project.updatedAt)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:bg-red-50"
          onClick={handleDelete}
          disabled={deleteProject.isPending}
          aria-label="Xóa project"
        >
          {deleteProject.isPending ? (
            <Loader2 className="animate-spin size-5" />
          ) : (
            <Trash2 className="size-5" />
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
      <div className="flex justify-center py-20">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Các Project của bạn</h2>
          <p className="text-gray-600 mt-1">{projects.data?.length || 0} project</p>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <Link href="/templates" className={buttonVariants({ variant: "outline" })}>
            <LayoutTemplate size={18} className="mr-2" />
            Từ template
          </Link>
          <Button 
            onClick={handleCreate} 
            disabled={createProject.isPending}
            className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {createProject.isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
            Tạo mới
          </Button>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.data?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 py-20 bg-white/50">
          <div className="p-3 bg-gray-100 rounded-full">
            <Presentation className="text-gray-400 size-8" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-1">Chưa có project nào</p>
            <p className="text-gray-500 text-sm mb-4">Bắt đầu bằng cách tạo một project mới hoặc chọn từ template</p>
            <Button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-primary to-secondary text-white"
            >
              <Plus size={18} className="mr-2" />
              Tạo Project Đầu Tiên
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {projects.data?.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
