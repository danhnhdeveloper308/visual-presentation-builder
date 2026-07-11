"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectDetail, ShareInfo } from "@repo/shared";
import { toast } from "sonner";
import { api } from "@/lib/api";

/** Bật/tắt share public — đồng bộ `shareToken` vào cache ['project', id] ngay. */
export function useShareLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enable: boolean) =>
      enable
        ? api.post<ShareInfo>(`/projects/${projectId}/share`)
        : api.delete<ShareInfo>(`/projects/${projectId}/share`),
    onSuccess: (info) => {
      queryClient.setQueryData<ProjectDetail>(["project", projectId], (old) =>
        old ? { ...old, shareToken: info.shareToken } : old,
      );
      toast.success(info.shareToken ? "Đã bật link chia sẻ" : "Đã tắt link chia sẻ");
    },
  });
}
