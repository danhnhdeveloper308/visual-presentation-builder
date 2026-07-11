"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateThemeInput, ThemeDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useCreateTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã tạo theme" },
    mutationFn: (input: CreateThemeInput) => api.post<ThemeDto>("/themes", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}
