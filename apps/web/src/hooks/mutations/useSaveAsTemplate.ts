"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SaveAsTemplateInput, TemplateDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useSaveAsTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã lưu làm template" },
    mutationFn: ({ projectId, input }: { projectId: string; input: SaveAsTemplateInput }) =>
      api.post<TemplateDto>(`/templates/from-project/${projectId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
