"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectInput, ProjectDetail } from "@repo/shared";
import { api } from "@/lib/api";

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => api.post<ProjectDetail>("/projects", input),
    onSuccess: (project) => {
      queryClient.setQueryData(["project", project.id], project);
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
