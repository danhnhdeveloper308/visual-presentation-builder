"use client";

import { useQuery } from "@tanstack/react-query";
import type { ThemeDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useThemes() {
  return useQuery({
    queryKey: ["themes"],
    queryFn: () => api.get<ThemeDto[]>("/themes"),
    staleTime: 5 * 60_000, // theme hệ thống ít thay đổi
  });
}
