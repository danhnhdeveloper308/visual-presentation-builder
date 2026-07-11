"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectDetail } from "@repo/shared";
import { api } from "@/lib/api";

export function useProject(projectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.get<ProjectDetail>(`/projects/${projectId}`),
    // Editor giữ working copy trong Zustand — không refetch ngầm đè lên.
    // Cache được đồng bộ thủ công trong useSaveProject.onSuccess (setQueryData).
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}
