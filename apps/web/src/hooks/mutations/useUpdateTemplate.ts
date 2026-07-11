"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateDto, UpdateTemplateInput } from "@repo/shared";
import { api } from "@/lib/api";

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã cập nhật template" },
    mutationFn: ({ id, input }: { id: string; input: UpdateTemplateInput }) =>
      api.patch<TemplateDto>(`/templates/${id}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
