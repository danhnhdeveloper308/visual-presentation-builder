"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã chuyển project vào thùng rác" },
    mutationFn: (projectId: string) => api.delete<{ success: true }>(`/projects/${projectId}`),
    onSuccess: (_data, projectId) => {
      queryClient.removeQueries({ queryKey: ["project", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
