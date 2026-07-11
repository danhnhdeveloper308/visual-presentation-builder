"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUser, ChangePasswordInput, UpdateProfileInput } from "@repo/shared";
import { api } from "@/lib/api";

/** Các mutation của trang tài khoản — gom 1 file vì luôn dùng cùng nhau. */

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<AuthUser>("/users/me", input),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silentError: true }, // trang tài khoản hiển thị lỗi inline (sai mật khẩu hiện tại...)
    mutationFn: (input: ChangePasswordInput) =>
      api.post<{ revokedOtherSessions: number }>("/users/me/password", input),
    onSuccess: () => {
      // đổi mật khẩu thu hồi mọi phiên khác → refresh danh sách + cờ hasPassword
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.delete<{ success: true }>(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ revoked: number }>("/auth/sessions/revoke-others"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
