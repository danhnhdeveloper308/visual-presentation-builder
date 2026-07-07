"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ success: true }>("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
