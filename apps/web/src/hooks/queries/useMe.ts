"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@repo/shared";
import { api } from "@/lib/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<AuthUser>("/auth/me"),
    staleTime: 5 * 60_000,
    retry: false, // 401 đã được wrapper xử lý (refresh + redirect) — không retry thêm
  });
}
