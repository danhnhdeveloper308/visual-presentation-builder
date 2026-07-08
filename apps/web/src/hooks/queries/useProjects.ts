"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProjectSummary } from "@repo/shared";
import { api } from "@/lib/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<ProjectSummary[]>("/projects"),
  });
}
