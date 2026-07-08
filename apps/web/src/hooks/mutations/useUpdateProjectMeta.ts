"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectDetail, ProjectSummary, UpdateProjectMetaInput } from "@repo/shared";
import { api } from "@/lib/api";

export function useUpdateProjectMeta(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectMetaInput) =>
      api.patch<ProjectSummary>(`/projects/${projectId}`, input),
    onSuccess: (summary) => {
      queryClient.setQueryData<ProjectDetail>(["project", projectId], (old) =>
        old
          ? {
              ...old,
              title: summary.title,
              status: summary.status,
              thumbnailUrl: summary.thumbnailUrl,
              updatedAt: summary.updatedAt,
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
