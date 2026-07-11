"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã xóa template" },
    mutationFn: (id: string) => api.delete<{ success: true }>(`/templates/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
