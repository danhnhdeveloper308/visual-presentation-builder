"use client";

import { useQuery } from "@tanstack/react-query";
import type { SharedProjectSummary } from "@repo/shared";
import { api } from "@/lib/api";

/** Project người khác share cho tôi — mục "Được chia sẻ" ở dashboard. */
export function useSharedProjects() {
  return useQuery({
    queryKey: ["projects", "shared-with-me"],
    queryFn: () => api.get<SharedProjectSummary[]>("/projects/shared-with-me"),
  });
}
