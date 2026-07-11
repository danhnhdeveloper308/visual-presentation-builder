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
  /**
   * Nhóm: các element cùng `groupId` được chọn/di chuyển cùng nhau (như Canva).
   * Bỏ nhóm = xoá field này. Additive optional — content cũ không vỡ.
   */
  groupId: z.string().optional(),
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

/** Bo góc riêng từng góc ảnh (px). Thiếu góc nào = 0. */
export const cornerRadiusSchema = z.object({
  topLeft: z.number().min(0).optional(),
  topRight: z.number().min(0).optional(),
  bottomLeft: z.number().min(0).optional(),
  bottomRight: z.number().min(0).optional(),
});

export const shadowDirectionSchema = z.enum(["top", "bottom", "left", "right"]);

/** Đổ bóng ảnh: chọn 1+ hướng; offset suy ra từ hướng, có blur/màu tùy chỉnh. */
export const imageShadowSchema = z.object({
  directions: z.array(shadowDirectionSchema).min(1),
  blur: z.number().min(0).optional(),
  spread: z.number().optional(),
  color: z.string().optional(),
});

export const imageElementSchema = elementBaseSchema.extend({
  type: z.literal("image"),
  props: z.object({
    assetId: z.string(),
    // Cho phép "" = placeholder chưa upload (layout dựng sẵn) — render khung tải ảnh.
    url: z.union([z.string().url(), z.literal("")]),
    objectFit: z.enum(["cover", "contain"]),
    /** Bo góc đồng đều (giữ để tương thích content cũ). `cornerRadius` nếu có sẽ ưu tiên. */
    borderRadius: z.number().min(0).optional(),
    cornerRadius: cornerRadiusSchema.optional(),
    shadow: imageShadowSchema.optional(),
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
    /** Màu nét icon (stroke). */
    color: z.string(),
    strokeWidth: z.number().positive().optional(),
    /** Nền phía sau icon (khung bo góc). Thiếu = không có nền. */
    backgroundColor: z.string().optional(),
    /** Bo góc khung nền icon (px). */
    backgroundRadius: z.number().min(0).optional(),
    /** Màu viền khung icon; thiếu = không viền (checkbox none/color ở UI). */
    borderColor: z.string().optional(),
    borderWidth: z.number().min(0).optional(),
  }),
});

/* ========================= Table (Phase 2c) ========================= */

/** Style bảng — mọi field optional, renderer có default. */
export const tableStyleSchema = z.object({
  /** Nền hàng header (khi headerRow). */
  headerBg: z.string().optional(),
  headerColor: z.string().optional(),
  /** Nền ô dữ liệu; thiếu = trong suốt. */
  cellBg: z.string().optional(),
  /** Nền hàng xen kẽ (zebra); thiếu = không kẻ sọc. */
  zebraBg: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  fontSize: z.number().positive().optional(),
});

/** Định dạng riêng 1 ô (đè lên style chung/zebra/header). */
export const tableCellStyleSchema = z.object({
  bg: z.string().optional(),
  color: z.string().optional(),
});

export const tableElementSchema = elementBaseSchema.extend({
  type: z.literal("table"),
  props: z
    .object({
      /** Ma trận ô `rows[hàng][cột]` — rows[0] là header khi headerRow=true. */
      rows: z
        .array(z.array(z.string().max(LIMITS.TABLE_CELL_MAX)).min(1).max(LIMITS.TABLE_COLS_MAX))
        .min(1)
        .max(LIMITS.TABLE_ROWS_MAX),
      /** Hàng đầu là header (mặc định renderer coi là true). */
      headerRow: z.boolean().optional(),
      /** Tỉ lệ bề rộng cột (đơn vị tương đối); thiếu = chia đều. */
      columnWidths: z.array(z.number().positive()).optional(),
      style: tableStyleSchema.optional(),
      /**
       * Định dạng từng ô, ma trận song song với `rows` (null = không định dạng riêng).
       * Additive optional — renderer index an toàn nếu lệch kích thước.
       */
      cellStyles: z.array(z.array(tableCellStyleSchema.nullable())).optional(),
    })
    .refine((p) => p.rows.every((r) => r.length === (p.rows[0]?.length ?? 0)), {
      message: "Mọi hàng của bảng phải có cùng số cột",
    }),
});

/* ========================= Chart (Phase 2c) ========================= */

/** 1 chuỗi dữ liệu (bar/line/area). `color` thiếu = màu tự động theo thứ tự. */
export const chartSeriesSchema = z.object({
  name: z.string().max(LIMITS.CHART_NAME_MAX),
  color: z.string().optional(),
  values: z.array(z.number()).min(1).max(LIMITS.CHART_CATEGORIES_MAX),
});

/** Field chung cho chart có trục (bar/line/area). */
const axisChartBase = {
  labels: z.array(z.string().max(LIMITS.CHART_NAME_MAX)).min(1).max(LIMITS.CHART_CATEGORIES_MAX),
  series: z.array(chartSeriesSchema).min(1).max(LIMITS.CHART_SERIES_MAX),
  showLegend: z.boolean().optional(),
  /** Hiện giá trị trên cột/điểm. */
  showValues: z.boolean().optional(),
  textColor: z.string().optional(),
  gridColor: z.string().optional(),
};

export const barChartPropsSchema = z.object({
  chartType: z.literal("bar"),
  ...axisChartBase,
  /** Cột chồng (stacked) thay vì đứng cạnh nhau. */
  stacked: z.boolean().optional(),
  /** Cột nằm ngang. */
  horizontal: z.boolean().optional(),
});

export const lineChartPropsSchema = z.object({
  chartType: z.literal("line"),
  ...axisChartBase,
  /** Đường cong mượt (bezier) thay vì gấp khúc. */
  smooth: z.boolean().optional(),
  showDots: z.boolean().optional(),
});

export const areaChartPropsSchema = z.object({
  chartType: z.literal("area"),
  ...axisChartBase,
  smooth: z.boolean().optional(),
});

/** 1 lát pie/donut. */
export const chartSliceSchema = z.object({
  label: z.string().max(LIMITS.CHART_NAME_MAX),
  value: z.number().min(0),
  color: z.string().optional(),
});

const pieChartBase = {
  slices: z.array(chartSliceSchema).min(1).max(LIMITS.CHART_SLICES_MAX),
  showLegend: z.boolean().optional(),
  /** Hiện % trên lát. */
  showValues: z.boolean().optional(),
  textColor: z.string().optional(),
};

export const pieChartPropsSchema = z.object({
  chartType: z.literal("pie"),
  ...pieChartBase,
});

export const donutChartPropsSchema = z.object({
  chartType: z.literal("donut"),
  ...pieChartBase,
  /** Tỉ lệ lỗ giữa (0.2–0.9), mặc định 0.6. */
  innerRadiusRatio: z.number().min(0.2).max(0.9).optional(),
});

/** Props chart = discriminated union theo `chartType` — mở rộng loại mới chỉ được append. */
export const chartPropsSchema = z.discriminatedUnion("chartType", [
  barChartPropsSchema,
  lineChartPropsSchema,
  areaChartPropsSchema,
  pieChartPropsSchema,
  donutChartPropsSchema,
]);

export const chartElementSchema = elementBaseSchema.extend({
  type: z.literal("chart"),
  props: chartPropsSchema,
});

/* ========================= Media (video/audio/embed) ========================= */

export const mediaKindSchema = z.enum(["video", "audio", "embed"]);

/**
 * Element media: video/audio (URL trực tiếp hoặc file upload R2) và embed
 * (iframe YouTube/Vimeo — FE chuẩn hoá URL watch → URL embed trước khi lưu).
 * Additive — content cũ không vỡ.
 */
export const mediaElementSchema = elementBaseSchema.extend({
  type: z.literal("media"),
  props: z.object({
    kind: mediaKindSchema,
    // Cho phép "" = placeholder chưa chọn nguồn (chèn từ toolbar rồi cấu hình ở Inspector).
    url: z.union([z.string().url(), z.literal("")]),
    /** Asset R2 nếu nguồn là file upload (để dọn dẹp/tra cứu). */
    assetId: z.string().optional(),
    /** Ảnh poster hiển thị trước khi phát (video). */
    posterUrl: z.string().url().optional(),
    autoplay: z.boolean().optional(),
    loop: z.boolean().optional(),
    muted: z.boolean().optional(),
    /** Hiện thanh điều khiển khi trình chiếu (mặc định true). */
    controls: z.boolean().optional(),
    borderRadius: z.number().min(0).optional(),
  }),
});

export const slideElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  imageElementSchema,
  shapeElementSchema,
  iconElementSchema,
  tableElementSchema,
  chartElementSchema,
  mediaElementSchema,
]);

export const backgroundConfigSchema = z.object({
  type: z.enum(["color", "gradient", "image"]),
  value: z.string(),
});

export const transitionTypeSchema = z.enum(["fade", "slide", "zoom"]);

/* ========================= Animation (VI) ========================= */

export const animationGroupSchema = z.enum(["entrance", "emphasis", "exit", "motion"]);

/** Danh sách hiệu ứng — append-only để content cũ không vỡ. */
export const animationEffectSchema = z.enum([
  // entrance (xuất hiện)
  "fade-in",
  "appear",
  "fly-in",
  "zoom-in",
  "grow-in",
  "wipe-in",
  "split-in",
  "float-in",
  "bounce-in",
  "spin-in",
  // emphasis (nhấn mạnh)
  "pulse",
  "spin",
  "flash",
  "shake",
  "grow-shrink",
  // exit (biến mất)
  "fade-out",
  "fly-out",
  "zoom-out",
  "shrink-out",
  "wipe-out",
  // motion path (đường chuyển động)
  "motion-line",
  // ===== bổ sung 2026-07-10 cho khớp bộ hiệu ứng PowerPoint (append-only) =====
  // entrance
  "drop-in", // Drop: rơi xuống nảy nhẹ
  "flip-in", // Flip: lật 3D quanh trục dọc
  "swivel-in", // Swivel: xoay lắc quanh trục dọc
  "stretch-in", // Stretch: kéo giãn ngang từ tâm
  "shape-in", // Shape (Circle): mở tròn từ tâm
  "grow-turn-in", // Grow & Turn: lớn dần + xoay vào
  // emphasis
  "teeter", // Teeter: lắc lư quanh góc
  "color-pulse", // Color Pulse: nhấp nháy màu
  "desaturate", // Desaturate: xám dần (giữ đến hết slide)
  "darken", // Darken: tối đi (giữ)
  "lighten", // Lighten: sáng lên (giữ)
  "transparency", // Transparency: mờ 50% (giữ)
  // exit
  "disappear", // Disappear: biến mất tức thời
  "float-out", // Float Out: trôi ra + mờ
  "split-out", // Split: khép vào giữa
  "bounce-out", // Bounce: nảy rồi văng ra
  "spin-out", // Spin Out: xoay + thu nhỏ ra
  "stretch-out", // Stretch: bẹp ngang về tâm
  "shape-out", // Shape (Circle): khép tròn về tâm
  "flip-out", // Flip: lật 3D ra
  // motion path
  "motion-arc", // Arc: cung cong
  "motion-turn", // Turn: gấp khúc chữ L
  "motion-circle", // Shape (Circle): vòng tròn khép kín về chỗ cũ
]);

export const animationTriggerSchema = z.enum(["on-click", "with-previous", "after-previous"]);
export const animationDirectionSchema = z.enum(["left", "right", "top", "bottom"]);
export const animationEasingSchema = z.enum([
  "linear",
  "ease",
  "ease-in", // smooth start
  "ease-out", // smooth end
  "ease-in-out",
]);

export const animationSchema = z.object({
  id: z.string().min(1),
  elementId: z.string().min(1),
  group: animationGroupSchema,
  effect: animationEffectSchema,
  trigger: animationTriggerSchema,
  durationMs: z.number().int().min(50).max(20000),
  delayMs: z.number().int().min(0).max(60000),
  /** Số lần lặp (>=1). */
  repeat: z.number().int().min(1).max(100).optional(),
  autoReverse: z.boolean().optional(),
  easing: animationEasingSchema.optional(),
  /** Hướng cho fly/wipe/split/motion-line. */
  direction: animationDirectionSchema.optional(),
});

export const slideSchema = z.object({
  id: z.string().min(1),
  background: backgroundConfigSchema,
  elements: z.array(slideElementSchema).max(LIMITS.ELEMENTS_PER_SLIDE_MAX),
  transition: transitionTypeSchema.optional(),
  /** Chuỗi animation của slide — THỨ TỰ mảng = thứ tự phát. */
  animations: z.array(animationSchema).optional(),
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
export type TableElement = z.infer<typeof tableElementSchema>;
export type TableStyle = z.infer<typeof tableStyleSchema>;
export type TableCellStyle = z.infer<typeof tableCellStyleSchema>;
export type ChartElement = z.infer<typeof chartElementSchema>;
export type ChartProps = z.infer<typeof chartPropsSchema>;
export type ChartType = ChartProps["chartType"];
export type ChartSeries = z.infer<typeof chartSeriesSchema>;
export type ChartSlice = z.infer<typeof chartSliceSchema>;
export type MediaKind = z.infer<typeof mediaKindSchema>;
export type MediaElement = z.infer<typeof mediaElementSchema>;
export type SlideElement = z.infer<typeof slideElementSchema>;
export type BackgroundConfig = z.infer<typeof backgroundConfigSchema>;
export type TransitionType = z.infer<typeof transitionTypeSchema>;
export type HeaderFooterConfig = z.infer<typeof headerFooterSchema>;
export type CornerRadius = z.infer<typeof cornerRadiusSchema>;
export type ShadowDirection = z.infer<typeof shadowDirectionSchema>;
export type ImageShadow = z.infer<typeof imageShadowSchema>;
export type AnimationGroup = z.infer<typeof animationGroupSchema>;
export type AnimationEffect = z.infer<typeof animationEffectSchema>;
export type AnimationTrigger = z.infer<typeof animationTriggerSchema>;
export type AnimationDirection = z.infer<typeof animationDirectionSchema>;
export type AnimationEasing = z.infer<typeof animationEasingSchema>;
export type Animation = z.infer<typeof animationSchema>;
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
