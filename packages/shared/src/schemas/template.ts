import { z } from "zod";
import { presentationSchema } from "./presentation";

export const TEMPLATE_CATEGORIES = ["business", "education", "creative", "minimal"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export type TemplateDto = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  content: z.infer<typeof presentationSchema>;
};
