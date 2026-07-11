"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectDetail } from "@repo/shared";
import { api } from "@/lib/api";

/** Nhân bản project của chính mình (dashboard) — bản sao mở được ngay từ cache. */
export function useDuplicateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã nhân bản project" },
    mutationFn: (projectId: string) =>
      api.post<ProjectDetail>(`/projects/${projectId}/duplicate`),
    onSuccess: (project) => {
      queryClient.setQueryData(["project", project.id], project);
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
