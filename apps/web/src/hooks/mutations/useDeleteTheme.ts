"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDeleteTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã xóa theme" },
    mutationFn: (id: string) => api.delete<{ success: true }>(`/themes/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}
