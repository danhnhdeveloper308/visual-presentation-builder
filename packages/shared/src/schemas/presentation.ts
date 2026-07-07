import { z } from "zod";
import { LIMITS } from "../constants/limits";

/**
 * Project Model (JSON) — nguồn sự thật của một presentation.
 * Xem docs/ARCHITECTURE.md mục 1. Toạ độ là toạ độ logic trên khung 1280×720.
 */

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const sizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

const elementBaseSchema = z.object({
  id: z.string().min(1),
  position: positionSchema,
  size: sizeSchema,
  rotation: z.number().default(0),
  zIndex: z.number().int().default(0),
  locked: z.boolean().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const textElementSchema = elementBaseSchema.extend({
  type: z.literal("text"),
  props: z.object({
    content: z.string().max(LIMITS.TEXT_CONTENT_MAX),
    fontFamily: z.string(),
    fontSize: z.number().positive(),
    fontWeight: z.number().int().min(100).max(900),
    color: z.string(),
    align: z.enum(["left", "center", "right"]),
    lineHeight: z.number().positive(),
  }),
});

export const imageElementSchema = elementBaseSchema.extend({
  type: z.literal("image"),
  props: z.object({
    assetId: z.string(),
    url: z.string().url(),
    objectFit: z.enum(["cover", "contain"]),
    borderRadius: z.number().min(0).optional(),
  }),
});

export const shapeElementSchema = elementBaseSchema.extend({
  type: z.literal("shape"),
  props: z.object({
    shape: z.enum(["rect", "ellipse", "line", "arrow"]),
    fill: z.string(),
    stroke: z.string().optional(),
    strokeWidth: z.number().min(0).optional(),
    borderRadius: z.number().min(0).optional(),
  }),
});

/** Icon lấy từ lucide (lucide-react) — `name` là tên icon kebab-case, vd "sparkles". */
export const iconElementSchema = elementBaseSchema.extend({
  type: z.literal("icon"),
  props: z.object({
    name: z.string().min(1),
    color: z.string(),
    strokeWidth: z.number().positive().optional(),
  }),
});

export const slideElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  imageElementSchema,
  shapeElementSchema,
  iconElementSchema,
  // Phase 2: tableElementSchema, chartElementSchema
]);

export const backgroundConfigSchema = z.object({
  type: z.enum(["color", "gradient", "image"]),
  value: z.string(),
});

export const transitionTypeSchema = z.enum(["fade", "slide", "zoom"]);

export const slideSchema = z.object({
  id: z.string().min(1),
  background: backgroundConfigSchema,
  elements: z.array(slideElementSchema).max(LIMITS.ELEMENTS_PER_SLIDE_MAX),
  transition: transitionTypeSchema.optional(),
});

export const presentationSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1).max(LIMITS.TITLE_MAX),
  themeId: z.string().nullable(),
  slides: z.array(slideSchema).min(1).max(LIMITS.SLIDES_PER_PROJECT_MAX),
});

export type Position = z.infer<typeof positionSchema>;
export type Size = z.infer<typeof sizeSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type ShapeElement = z.infer<typeof shapeElementSchema>;
export type IconElement = z.infer<typeof iconElementSchema>;
export type SlideElement = z.infer<typeof slideElementSchema>;
export type BackgroundConfig = z.infer<typeof backgroundConfigSchema>;
export type TransitionType = z.infer<typeof transitionTypeSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type Presentation = z.infer<typeof presentationSchema>;

/** Presentation mặc định khi tạo project mới. */
export function createEmptyPresentation(title: string): Presentation {
  return {
    schemaVersion: 1,
    title,
    themeId: null,
    slides: [
      {
        id: crypto.randomUUID(),
        background: { type: "color", value: "#ffffff" },
        elements: [],
      },
    ],
  };
}
