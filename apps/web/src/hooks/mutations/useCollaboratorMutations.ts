"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddCollaboratorInput, CollaboratorDto, CollaboratorRole } from "@repo/shared";
import { api } from "@/lib/api";

/** 3 mutation quản lý người được share 1 project (chỉ owner) — gom 1 file vì luôn dùng cùng nhau. */

export function useAddCollaborator(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    // lỗi (email lạ / tự thêm mình) hiển thị inline trong ShareDialog
    meta: { silentError: true, successMessage: "Đã thêm người được chia sẻ" },
    mutationFn: (input: AddCollaboratorInput) =>
      api.post<CollaboratorDto>(`/projects/${projectId}/collaborators`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collaborators", projectId] });
    },
  });
}

export function useUpdateCollaborator(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã đổi quyền" },
    mutationFn: ({ userId, role }: { userId: string; role: CollaboratorRole }) =>
      api.patch<{ success: true }>(`/projects/${projectId}/collaborators/${userId}`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collaborators", projectId] });
    },
  });
}

export function useRemoveCollaborator(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Đã gỡ quyền chia sẻ" },
    mutationFn: (userId: string) =>
      api.delete<{ success: true }>(`/projects/${projectId}/collaborators/${userId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collaborators", projectId] });
    },
  });
}
