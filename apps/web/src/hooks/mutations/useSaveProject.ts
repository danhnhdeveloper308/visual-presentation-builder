"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectDetail, SaveProjectInput, SaveProjectResult } from "@repo/shared";
import { api } from "@/lib/api";

export function useSaveProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silentError: true }, // lỗi lưu hiển thị qua SaveIndicator/banner 409
    mutationFn: (input: SaveProjectInput) =>
      api.put<SaveProjectResult>(`/projects/${projectId}/content`, input),
    onSuccess: (result, variables) => {
      // QUAN TRỌNG: đồng bộ cache detail — useProject có staleTime Infinity,
      // không setQueryData thì mở lại editor sẽ load bản cũ từ lần fetch đầu.
      queryClient.setQueryData<ProjectDetail>(["project", projectId], (old) =>
        old
          ? {
              ...old,
              content: variables.content,
              revision: result.revision,
              updatedAt: new Date().toISOString(),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
