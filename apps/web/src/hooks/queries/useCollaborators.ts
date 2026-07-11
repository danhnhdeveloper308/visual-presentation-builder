"use client";

import { useQuery } from "@tanstack/react-query";
import type { CollaboratorDto } from "@repo/shared";
import { api } from "@/lib/api";

export function useCollaborators(projectId: string, enabled = true) {
  return useQuery({
    queryKey: ["collaborators", projectId],
    queryFn: () => api.get<CollaboratorDto[]>(`/projects/${projectId}/collaborators`),
    enabled,
  });
}
