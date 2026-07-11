"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

/** Mutation trang quản trị: khóa/mở khóa user + chỉnh quota lưu trữ. */

export function useSetUserLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, locked }: { userId: string; locked: boolean }) =>
      api.patch<{ success: true }>(`/admin/users/${userId}/lock`, { locked }),
    onSuccess: (_data, { locked }) => {
      toast.success(locked ? "Đã khóa user — mọi phiên đăng nhập bị thu hồi" : "Đã mở khóa user");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useSetUserQuota() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã cập nhật quota" },
    mutationFn: ({ userId, storageQuotaBytes }: { userId: string; storageQuotaBytes: number }) =>
      api.patch<{ success: true }>(`/admin/users/${userId}/quota`, { storageQuotaBytes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
