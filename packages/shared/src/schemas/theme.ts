import { z } from "zod";

/**
 * ThemeConfig — preset font/màu áp lên presentation.
 * Áp theme = đổi background slide + màu chữ (heading/body theo cỡ chữ) + màu accent
 * cho shape/icon. Element image không bị ảnh hưởng.
 */
export const themeConfigSchema = z.object({
  fontHeading: z.string(),
  fontBody: z.string(),
  colors: z.object({
    background: z.string(),
    heading: z.string(),
    body: z.string(),
    accent: z.string(),
  }),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export type ThemeDto = {
  id: string;
  name: string;
  config: ThemeConfig;
  isSystemTheme: boolean;
};

/** Text có fontSize >= ngưỡng này được coi là heading khi áp theme. */
export const THEME_HEADING_MIN_FONT_SIZE = 40;
