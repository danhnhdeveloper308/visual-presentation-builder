"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePermanentDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã xóa vĩnh viễn project" },
    mutationFn: (projectId: string) =>
      api.delete<{ success: true }>(`/projects/${projectId}/permanent`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
