"use client";

import { use } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useProject } from "@/hooks/queries/useProject";
import { PresentationViewer } from "@/components/viewer/presentation-viewer";

/** Trang xem project (đăng nhập): collaborator role viewer mở ở đây thay vì editor. */
export default function ViewProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useProject(id);

  if (project.isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  if (project.isError || !project.data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-gray-950 text-white">
        <p className="font-medium">Không tìm thấy project hoặc bạn không có quyền xem.</p>
        <Link href="/dashboard" className="text-primary text-sm hover:underline">
          Về dashboard →
        </Link>
      </div>
    );
  }

  const canEdit = project.data.myRole === "owner" || project.data.myRole === "editor";
  return (
    <PresentationViewer
      title={project.data.title}
      presentation={project.data.content}
      subtitle={project.data.myRole === "viewer" ? "Được chia sẻ — chỉ xem" : undefined}
      includeHidden
      editHref={canEdit ? `/editor/${id}` : undefined}
    />
  );
}
