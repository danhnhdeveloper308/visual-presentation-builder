"use client";

import { useQuery } from "@tanstack/react-query";
import type { TrashProjectSummary } from "@repo/shared";
import { api } from "@/lib/api";

export function useTrashProjects() {
  return useQuery({
    queryKey: ["projects", "trash"],
    queryFn: () => api.get<TrashProjectSummary[]>("/projects/trash"),
  });
}
