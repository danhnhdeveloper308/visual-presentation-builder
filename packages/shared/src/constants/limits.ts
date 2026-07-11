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
  /** Upload media (video/audio) tối đa — lớn hơn ảnh, giới hạn riêng. */
  MEDIA_MAX_BYTES: 100 * 1024 * 1024,
  MEDIA_ALLOWED_MIME: ["video/mp4", "video/webm", "audio/mpeg", "audio/wav", "audio/ogg"],
  /** Quota lưu trữ asset mặc định mỗi user (500MB) — admin chỉnh từng user được. */
  USER_STORAGE_QUOTA_DEFAULT_BYTES: 500 * 1024 * 1024,
  /** Trần quota admin đặt được cho 1 user (chống gõ nhầm số). */
  USER_STORAGE_QUOTA_MAX_BYTES: 10 * 1024 * 1024 * 1024,
  /** Recycle Bin: project xóa mềm bị xóa vĩnh viễn sau số ngày này (cron BE). */
  TRASH_RETENTION_DAYS: 90,
  THEME_NAME_MAX: 100,
  /** Element Table (Phase 2c). */
  TABLE_ROWS_MAX: 30,
  TABLE_COLS_MAX: 10,
  TABLE_CELL_MAX: 500,
  /** Element Chart (Phase 2c). */
  CHART_CATEGORIES_MAX: 24,
  CHART_SERIES_MAX: 6,
  CHART_SLICES_MAX: 12,
  CHART_NAME_MAX: 100,
} as const;
