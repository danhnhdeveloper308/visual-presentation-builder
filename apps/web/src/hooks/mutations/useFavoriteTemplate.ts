"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateDto } from "@repo/shared";
import { api } from "@/lib/api";

/** Toggle yêu thích — truyền `favorite: true|false` khi gọi mutate. Optimistic: sao đổi ngay, rollback nếu lỗi. */
export function useFavoriteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      favorite
        ? api.post<{ success: true }>(`/templates/${id}/favorite`)
        : api.delete<{ success: true }>(`/templates/${id}/favorite`),
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: ["templates"] });
      const previous = queryClient.getQueryData<TemplateDto[]>(["templates"]);
      queryClient.setQueryData<TemplateDto[]>(["templates"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, isFavorite: favorite } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["templates"], context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
