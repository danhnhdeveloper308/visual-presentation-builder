"use client";

import { useMutation } from "@tanstack/react-query";
import type { ForgotPasswordInput, ResetPasswordInput } from "@repo/shared";
import { api } from "@/lib/api";

/** Gửi email đặt lại mật khẩu — BE luôn trả success (chống dò email). */
export function useForgotPassword() {
  return useMutation({
    meta: { silentError: true },
    mutationFn: (input: ForgotPasswordInput) =>
      api.post<{ success: true }>("/auth/forgot-password", input),
  });
}

/** Đặt lại mật khẩu bằng token từ email — lỗi (token sai/hết hạn) hiển thị inline. */
export function useResetPassword() {
  return useMutation({
    meta: { silentError: true },
    mutationFn: (input: ResetPasswordInput) =>
      api.post<{ success: true }>("/auth/reset-password", input),
  });
}
