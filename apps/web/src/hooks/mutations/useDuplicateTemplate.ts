"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã nhân bản template" },
    mutationFn: (id: string) => api.post<TemplateDto>(`/templates/${id}/duplicate`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
