"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ThemeDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useCloneTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã nhân bản theme" },
    mutationFn: (id: string) => api.post<ThemeDto>(`/themes/${id}/clone`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}
