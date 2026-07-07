/** Giới hạn dùng chung FE (validate form/editor) và BE (validate payload). */
export const LIMITS = {
  TITLE_MAX: 200,
  TEXT_CONTENT_MAX: 10_000,
  SLIDES_PER_PROJECT_MAX: 200,
  ELEMENTS_PER_SLIDE_MAX: 100,
  /** Giới hạn body JSON khi save project (bytes) — đồng bộ với body limit của API. */
  PROJECT_CONTENT_MAX_BYTES: 2 * 1024 * 1024,
  /** Upload asset (ảnh) tối đa. */
  ASSET_MAX_BYTES: 10 * 1024 * 1024,
  ASSET_ALLOWED_MIME: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"],
} as const;
