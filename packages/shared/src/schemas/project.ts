import { z } from "zod";
import { LIMITS } from "../constants/limits";
import { presentationSchema } from "./presentation";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Tên project không được để trống").max(LIMITS.TITLE_MAX),
  /** Tạo từ template: copy content của template public làm điểm xuất phát. */
  templateId: z.string().optional(),
});

/**
 * Save project: gửi kèm `revision` hiện tại — server so khớp, lệch trả 409
 * (optimistic concurrency, xem docs/ARCHITECTURE.md mục 5).
 */
export const saveProjectSchema = z.object({
  content: presentationSchema,
  revision: z.number().int().min(0),
});

export const updateProjectMetaSchema = z.object({
  title: z.string().min(1).max(LIMITS.TITLE_MAX).optional(),
  status: z.enum(["draft", "published"]).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type SaveProjectInput = z.infer<typeof saveProjectSchema>;
export type UpdateProjectMetaInput = z.infer<typeof updateProjectMetaSchema>;

/** Response types (Date serialize thành string qua JSON). */
export type ProjectSummary = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  status: "draft" | "published";
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = ProjectSummary & {
  content: z.infer<typeof presentationSchema>;
};

export type SaveProjectResult = { revision: number };
