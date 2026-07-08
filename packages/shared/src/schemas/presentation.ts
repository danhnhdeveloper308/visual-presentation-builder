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

/**
 * Danh sách shape hỗ trợ (63 loại) — thêm loại mới CHỈ ĐƯỢC append (additive),
 * không đổi tên/xóa giá trị cũ để content đã lưu không vỡ.
 * Hình học render tại `apps/web/src/lib/editor/shapes.ts` (SHAPE_CLIP_PATHS).
 */
export const shapeKindSchema = z.enum([
  // cơ bản
  "rect",
  "ellipse",
  "line",
  "arrow",
  "triangle",
  "diamond",
  "star",
  "rounded-rect",
  "pill",
  "circle",
  "semicircle",
  "quarter-circle",
  "right-triangle",
  "pentagon",
  "hexagon",
  "heptagon",
  "octagon",
  "parallelogram",
  "trapezoid",
  // mũi tên
  "arrow-left",
  "arrow-up",
  "arrow-down",
  "double-arrow",
  "double-arrow-vertical",
  "chevron",
  "chevron-left",
  "corner-arrow",
  "signpost",
  // sao & huy hiệu
  "star-4",
  "star-6",
  "star-8",
  "star-12",
  "seal",
  "ribbon",
  "bookmark",
  "banner",
  // callout
  "speech-bubble",
  "speech-bubble-left",
  // biểu tượng
  "heart",
  "lightning",
  "cloud",
  "sun",
  "drop",
  "gear",
  "plus",
  "check",
  "x-mark",
  "home",
  "flag",
  "pin",
  "tag",
  "shield",
  "kite",
  // flowchart
  "flow-document",
  "flow-database",
  "flow-manual-input",
  "flow-preparation",
  "flow-delay",
  "flow-display",
  "flow-stored-data",
  "flow-merge",
  // khung
  "frame",
  "ring",
]);

export const shapeElementSchema = elementBaseSchema.extend({
  type: z.literal("shape"),
  props: z.object({
    shape: shapeKindSchema,
    /** Màu đặc (#hex) hoặc CSS gradient (`linear-gradient(...)`, `radial-gradient(...)`). */
    fill: z.string(),
    stroke: z.string().optional(),
    strokeWidth: z.number().min(0).optional(),
    borderRadius: z.number().min(0).optional(),
    /** Đổ bóng (drop-shadow) quanh hình — áp cả shape clip-path. */
    shadow: z.boolean().optional(),
  }),
});

export type ShapeKind = z.infer<typeof shapeKindSchema>;

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
  /** Khóa slide: không chỉnh sửa được element trên canvas cho tới khi mở khóa. */
  locked: z.boolean().optional(),
  /** Ẩn slide: bỏ qua khi trình chiếu (Phase 3); vẫn sửa được trong editor. */
  hidden: z.boolean().optional(),
  /** Ẩn header/footer riêng cho slide này (override cấu hình chung). */
  hideHeaderFooter: z.boolean().optional(),
});

/** Cấu hình Header/Footer chung của presentation (giống PowerPoint Insert → Header & Footer). */
export const headerFooterSchema = z.object({
  header: z.string().max(200).optional(),
  footer: z.string().max(200).optional(),
  showSlideNumber: z.boolean().optional(),
  showDate: z.boolean().optional(),
  /** Text ngày cố định; để trống + showDate → hiển thị ngày hiện tại lúc render. */
  dateText: z.string().max(100).optional(),
  /** Không hiển thị header/footer trên slide đầu (title slide). */
  hideOnFirstSlide: z.boolean().optional(),
});

// KHÔNG có `title` trong JSON — title là cột `Project.title`, một nguồn sự thật duy nhất.
export const presentationSchema = z.object({
  schemaVersion: z.literal(1),
  themeId: z.string().nullable(),
  slides: z.array(slideSchema).min(1).max(LIMITS.SLIDES_PER_PROJECT_MAX),
  headerFooter: headerFooterSchema.optional(),
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
export type HeaderFooterConfig = z.infer<typeof headerFooterSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type Presentation = z.infer<typeof presentationSchema>;

/** Slide trống mặc định. */
export function createEmptySlide(): Slide {
  return {
    id: crypto.randomUUID(),
    background: { type: "color", value: "#ffffff" },
    elements: [],
  };
}

/** Presentation mặc định khi tạo project mới. */
export function createEmptyPresentation(): Presentation {
  return {
    schemaVersion: 1,
    themeId: null,
    slides: [createEmptySlide()],
  };
}
