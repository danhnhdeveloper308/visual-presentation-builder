"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionDto } from "@repo/shared";
import { api } from "@/lib/api";

/** Phiên đăng nhập đang hoạt động của user (trang tài khoản). */
export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.get<SessionDto[]>("/auth/sessions"),
  });
}
