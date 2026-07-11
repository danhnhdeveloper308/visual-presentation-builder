"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUser, RegisterInput } from "@repo/shared";
import { api } from "@/lib/api";

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silentError: true },
    mutationFn: (input: RegisterInput) => api.post<AuthUser>("/auth/register", input),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });
}
