"use client";

import { useQuery } from "@tanstack/react-query";
import type { StorageUsage } from "@repo/shared";
import { api } from "@/lib/api";

/** Dung lượng lưu trữ đã dùng / quota của user hiện tại (hiển thị ở menu profile). */
export function useStorageUsage() {
  return useQuery({
    queryKey: ["storage-usage"],
    queryFn: () => api.get<StorageUsage>("/assets/usage"),
    staleTime: 15_000,
  });
}
