"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdminUserSummary } from "@repo/shared";
import { api } from "@/lib/api";

/** Danh sách user cho trang quản trị (chỉ admin gọi được — BE check user:manage). */
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<AdminUserSummary[]>("/admin/users"),
  });
}
