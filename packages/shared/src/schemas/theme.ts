import { z } from "zod";
import { LIMITS } from "../constants/limits";

/**
 * ThemeConfig — preset font/màu áp lên presentation.
 * Áp theme = đổi background slide + màu chữ (heading/body theo cỡ chữ) + màu accent
 * cho shape (accent)/icon (accent2 nếu có, không thì accent) + shadow/borderRadius mặc định
 * cho shape/image. Element image giữ nguyên ảnh, chỉ đổi shadow/bo góc nếu theme có cấu hình.
 *
 * `colors.background` có thể là màu đặc (#hex) HOẶC chuỗi CSS gradient
 * (`linear-gradient(...)`) — cùng convention với `ShapeElement.props.fill`
 * (xem `apps/web/src/lib/editor/shapes.ts`), FE tự nhận diện qua `includes("gradient(")`.
 */
export const themeConfigSchema = z.object({
  fontHeading: z.string(),
  fontBody: z.string(),
  colors: z.object({
    background: z.string(),
    heading: z.string(),
    body: z.string(),
    accent: z.string(),
    /** Màu nhấn phụ — dùng cho icon khi có, để phân biệt sắc độ với shape. */
    accent2: z.string().optional(),
  }),
  /** Áp đổ bóng mặc định cho shape/image khi áp theme. */
  shadow: z.boolean().optional(),
  /** Bo góc mặc định (px) cho shape dạng rect/rounded-rect và image khi áp theme. */
  borderRadius: z.number().min(0).optional(),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export type ThemeDto = {
  id: string;
  name: string;
  config: ThemeConfig;
  isSystemTheme: boolean;
  /** userId chủ sở hữu — null với theme hệ thống. FE dùng để phân tách "Theme của tôi". */
  createdBy: string | null;
};

/** Tạo theme riêng (My Themes). */
export const createThemeSchema = z.object({
  name: z.string().min(1, "Tên theme không được để trống").max(LIMITS.THEME_NAME_MAX),
  config: themeConfigSchema,
});

/** Sửa theme riêng — cả hai field đều optional (đổi tên hoặc đổi config, hoặc cả hai). */
export const updateThemeSchema = z.object({
  name: z.string().min(1).max(LIMITS.THEME_NAME_MAX).optional(),
  config: themeConfigSchema.optional(),
});

export type CreateThemeInput = z.infer<typeof createThemeSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;

/** Text có fontSize >= ngưỡng này được coi là heading khi áp theme. */
export const THEME_HEADING_MIN_FONT_SIZE = 40;
