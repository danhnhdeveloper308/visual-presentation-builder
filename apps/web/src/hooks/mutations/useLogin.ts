"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUser, LoginInput } from "@repo/shared";
import { api } from "@/lib/api";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silentError: true },
    mutationFn: (input: LoginInput) => api.post<AuthUser>("/auth/login", input),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });
}
