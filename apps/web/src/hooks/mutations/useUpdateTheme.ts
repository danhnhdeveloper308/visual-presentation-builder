"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ThemeDto, UpdateThemeInput } from "@repo/shared";
import { api } from "@/lib/api";

export function useUpdateTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã lưu theme" },
    mutationFn: ({ id, input }: { id: string; input: UpdateThemeInput }) =>
      api.patch<ThemeDto>(`/themes/${id}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}
