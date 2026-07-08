"use client";

import { useQuery } from "@tanstack/react-query";
import type { TemplateDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => api.get<TemplateDto[]>("/templates"),
    staleTime: 5 * 60_000, // template hệ thống ít thay đổi
  });
}
