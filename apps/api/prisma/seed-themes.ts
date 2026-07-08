import { themeConfigSchema, type ThemeConfig } from '@repo/shared';

const INTER = 'Inter, sans-serif';

function theme(
  name: string,
  colors: ThemeConfig['colors'],
  fonts?: { heading?: string; body?: string },
): { name: string; config: ThemeConfig } {
  const config: ThemeConfig = {
    fontHeading: fonts?.heading ?? INTER,
    fontBody: fonts?.body ?? INTER,
    colors,
  };
  return { name, config: themeConfigSchema.parse(config) }; // fail-fast nếu sai schema
}

export const SEED_THEMES = [
  theme('Indigo sáng', {
    background: '#ffffff',
    heading: '#0f172a',
    body: '#475569',
    accent: '#6366f1',
  }),
  theme('Dark Slate', {
    background: '#0f172a',
    heading: '#f8fafc',
    body: '#94a3b8',
    accent: '#818cf8',
  }),
  theme('Emerald', {
    background: '#f0fdf4',
    heading: '#064e3b',
    body: '#374151',
    accent: '#059669',
  }),
  theme('Sunset', {
    background: '#fff7ed',
    heading: '#7c2d12',
    body: '#57534e',
    accent: '#ea580c',
  }),
  theme('Ocean', {
    background: '#f0f9ff',
    heading: '#0c4a6e',
    body: '#334155',
    accent: '#0284c7',
  }),
  theme('Neon Dark', {
    background: '#09090b',
    heading: '#f4f4f5',
    body: '#a1a1aa',
    accent: '#22d3ee',
  }),
  theme('Rose', {
    background: '#fff1f2',
    heading: '#881337',
    body: '#44403c',
    accent: '#e11d48',
  }),
  theme('Mono', {
    background: '#ffffff',
    heading: '#111827',
    body: '#4b5563',
    accent: '#111827',
  }),
];
