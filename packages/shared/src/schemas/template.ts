import { z } from "zod";
import { LIMITS } from "../constants/limits";
import { presentationSchema } from "./presentation";

/** 14 category — REQUIREMENTS.md mục II. Append-only, không đổi/xóa giá trị cũ. */
export const TEMPLATE_CATEGORIES = [
  "business",
  "startup",
  "education",
  "portfolio",
  "product",
  "marketing",
  "pitch-deck",
  "medical",
  "timeline",
  "finance",
  "resume",
  "technology",
  "creative",
  "minimal",
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export type TemplateDto = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  content: z.infer<typeof presentationSchema>;
  isPublic: boolean;
  /** userId chủ sở hữu — null với template hệ thống. FE dùng để phân tách "Template của tôi". */
  createdBy: string | null;
  /** Người dùng hiện tại đã đánh dấu yêu thích template này chưa. */
  isFavorite: boolean;
};

/** Lưu project hiện tại thành template riêng (My Templates). */
export const saveAsTemplateSchema = z.object({
  title: z.string().min(1, "Tên template không được để trống").max(LIMITS.TITLE_MAX),
  category: z.enum(TEMPLATE_CATEGORIES),
});

/** Sửa template riêng — đều optional (đổi tên và/hoặc đổi category). */
export const updateTemplateSchema = z.object({
  title: z.string().min(1).max(LIMITS.TITLE_MAX).optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
});

export type SaveAsTemplateInput = z.infer<typeof saveAsTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
