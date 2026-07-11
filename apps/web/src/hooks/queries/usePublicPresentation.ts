"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicPresentationDto } from "@repo/shared";
import { api } from "@/lib/api";

/** Xem presentation qua link share public — không cần đăng nhập. */
export function usePublicPresentation(token: string) {
  return useQuery({
    queryKey: ["public-presentation", token],
    queryFn: () => api.get<PublicPresentationDto>(`/public/presentations/${token}`),
    retry: false, // token sai/đã tắt → 404, không cần thử lại
  });
}
