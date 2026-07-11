"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã khôi phục project" },
    mutationFn: (projectId: string) => api.post<{ success: true }>(`/projects/${projectId}/restore`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
