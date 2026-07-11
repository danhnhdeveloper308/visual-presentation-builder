import { themeConfigSchema, type ThemeConfig } from '@repo/shared';

const INTER = 'Inter, sans-serif';
const SERIF = 'Georgia, \'Times New Roman\', serif';

type SeedTheme = {
  name: string;
  config: ThemeConfig;
  /**
   * Tên cũ (nếu theme này là đổi tên từ 1 trong 8 theme gốc) — seed.ts tìm theo
   * tên cũ trước để RENAME TẠI CHỖ (giữ nguyên id, project đang tham chiếu không vỡ)
   * thay vì tạo record mới. Chỉ cần đúng 1 lần chạy đầu — các lần sau tên mới đã khớp thẳng.
   */
  legacyNames?: string[];
};

function theme(
  name: string,
  colors: ThemeConfig['colors'],
  opts: {
    fonts?: { heading?: string; body?: string };
    shadow?: boolean;
    borderRadius?: number;
    legacyNames?: string[];
  } = {},
): SeedTheme {
  const config: ThemeConfig = {
    fontHeading: opts.fonts?.heading ?? INTER,
    fontBody: opts.fonts?.body ?? INTER,
    colors,
    shadow: opts.shadow,
    borderRadius: opts.borderRadius,
  };
  return { name, config: themeConfigSchema.parse(config), legacyNames: opts.legacyNames }; // fail-fast nếu sai schema
}

/**
 * 20 system theme (REQUIREMENTS.md mục III.1). 8 theme gốc được ĐỔI TÊN (giữ id) qua
 * `legacyNames`; 12 theme còn lại là mới hoàn toàn.
 */
export const SEED_THEMES: SeedTheme[] = [
  theme(
    'Light',
    { background: '#ffffff', heading: '#18181b', body: '#52525b', accent: '#2563eb' },
    { borderRadius: 8 },
  ),
  theme(
    'Dark',
    { background: '#0f172a', heading: '#f8fafc', body: '#94a3b8', accent: '#818cf8' },
    { legacyNames: ['Dark Slate'] },
  ),
  theme(
    'Corporate',
    {
      background: '#f8fafc',
      heading: '#1e3a5f',
      body: '#475569',
      accent: '#1d4ed8',
      accent2: '#0f766e',
    },
    { fonts: { heading: SERIF }, borderRadius: 4 },
  ),
  theme('Ocean', {
    background: '#f0f9ff',
    heading: '#0c4a6e',
    body: '#334155',
    accent: '#0284c7',
  }),
  theme(
    'Forest',
    { background: '#f0fdf4', heading: '#064e3b', body: '#374151', accent: '#059669' },
    { legacyNames: ['Emerald'] },
  ),
  theme('Purple', {
    background: '#faf5ff',
    heading: '#581c87',
    body: '#44403c',
    accent: '#9333ea',
  }),
  theme('Orange', {
    background: '#fffbeb',
    heading: '#7c2d12',
    body: '#57534e',
    accent: '#f97316',
  }),
  theme('Sunset', {
    background: '#fff7ed',
    heading: '#7c2d12',
    body: '#57534e',
    accent: '#ea580c',
  }),
  theme(
    'Pastel',
    {
      background: '#fdf2f8',
      heading: '#831843',
      body: '#78716c',
      accent: '#f472b6',
      accent2: '#a78bfa',
    },
    { borderRadius: 20 },
  ),
  theme(
    'Modern',
    { background: '#ffffff', heading: '#0f172a', body: '#475569', accent: '#6366f1' },
    { legacyNames: ['Indigo sáng'], borderRadius: 16 },
  ),
  theme(
    'Material',
    {
      background: '#ffffff',
      heading: '#1c1b1f',
      body: '#49454f',
      accent: '#6750a4',
      accent2: '#00696d',
    },
    { shadow: true, borderRadius: 12 },
  ),
  theme('Minimal', {
    background: '#ffffff',
    heading: '#0a0a0a',
    body: '#404040',
    accent: '#0a0a0a',
  }),
  theme(
    'Apple',
    {
      background: '#f5f5f7',
      heading: '#1d1d1f',
      body: '#424245',
      accent: '#0071e3',
    },
    { borderRadius: 18, shadow: true },
  ),
  theme('Google', {
    background: '#ffffff',
    heading: '#202124',
    body: '#5f6368',
    accent: '#4285f4',
    accent2: '#ea4335',
  }),
  theme(
    'Gradient',
    {
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      heading: '#ffffff',
      body: '#e0e7ff',
      accent: '#facc15',
    },
    { shadow: true, borderRadius: 16 },
  ),
  theme(
    'Neon',
    { background: '#09090b', heading: '#f4f4f5', body: '#a1a1aa', accent: '#22d3ee' },
    { legacyNames: ['Neon Dark'] },
  ),
  theme(
    'Elegant',
    { background: '#fff1f2', heading: '#881337', body: '#57534e', accent: '#e11d48' },
    { legacyNames: ['Rose'], fonts: { heading: SERIF } },
  ),
  theme(
    'Luxury',
    { background: '#0c0a09', heading: '#d4af37', body: '#d6d3d1', accent: '#d4af37' },
    { fonts: { heading: SERIF }, shadow: true },
  ),
  theme(
    'Flat',
    { background: '#ffffff', heading: '#111827', body: '#4b5563', accent: '#111827' },
    { legacyNames: ['Mono'], borderRadius: 0 },
  ),
  theme(
    'Professional',
    { background: '#f9fafb', heading: '#1f2937', body: '#4b5563', accent: '#374151' },
    { fonts: { heading: SERIF } },
  ),
];
