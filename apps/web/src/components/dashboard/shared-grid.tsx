"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Users } from "lucide-react";
import type { SharedProjectSummary } from "@repo/shared";
import { useSharedProjects } from "@/hooks/queries/useSharedProjects";
import { ProjectCardPreview } from "./project-card-preview";

function SharedCard({ project }: { project: SharedProjectSummary }) {
  const [hovering, setHovering] = useState(false);
  return (
    <Link
      href={project.role === "editor" ? `/editor/${project.id}` : `/view/${project.id}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group hover:border-primary/60 hover:shadow-primary/10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative">
        <ProjectCardPreview project={project} hovering={hovering} />
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
          {project.role === "editor" ? <Pencil className="size-3" /> : <Eye className="size-3" />}
          {project.role === "editor" ? "Chỉnh sửa" : "Chỉ xem"}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="truncate text-sm font-semibold text-gray-900">{project.title}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          Chia sẻ bởi {project.owner.name} ({project.owner.email})
        </p>
      </div>
    </Link>
  );
}

/** Mục "Được chia sẻ với tôi" ở dashboard — editor mở editor, viewer mở trang xem. */
export function SharedGrid() {
  const shared = useSharedProjects();
  const projects = shared.data ?? [];
  if (shared.isPending || projects.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-baseline gap-2">
        <Users className="text-primary size-5 self-center" />
        <h3 className="text-xl font-bold text-gray-900">Được chia sẻ với tôi</h3>
        <span className="text-sm text-gray-500">{projects.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {projects.map((p) => (
          <SharedCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
