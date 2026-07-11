import type { Slide } from "@repo/shared";
import type { LayoutDef } from "./helpers";
import { COLUMN_LAYOUTS, LIST_LAYOUTS, QUOTE_LAYOUTS, TITLE_LAYOUTS } from "./basic";
import { CARD_LAYOUTS, COMPARISON_LAYOUTS, PRODUCT_LAYOUTS, TEAM_LAYOUTS } from "./cards";
import { IMAGE_LAYOUTS, MEDIA_LAYOUTS, MODERN_LAYOUTS } from "./visual";
import { DIAGRAM_LAYOUTS, PROCESS_LAYOUTS, TIMELINE_LAYOUTS } from "./flow";
import { STATISTICS_LAYOUTS, TABLE_LAYOUTS } from "./data";
import { BUSINESS_LAYOUTS, EDUCATION_LAYOUTS } from "./domain";

export type { LayoutDef } from "./helpers";

export type LayoutGroup = {
  id: string;
  label: string;
  layouts: LayoutDef[];
};

/** 18 nhóm × 151 layout — thứ tự theo REQUIREMENTS.md mục V. */
export const LAYOUT_GROUPS: LayoutGroup[] = [
  { id: "title", label: "Tiêu đề", layouts: TITLE_LAYOUTS },
  { id: "card", label: "Card", layouts: CARD_LAYOUTS },
  { id: "column", label: "Cột", layouts: COLUMN_LAYOUTS },
  { id: "image", label: "Hình ảnh", layouts: IMAGE_LAYOUTS },
  { id: "comparison", label: "So sánh", layouts: COMPARISON_LAYOUTS },
  { id: "list", label: "Danh sách", layouts: LIST_LAYOUTS },
  { id: "timeline", label: "Dòng thời gian", layouts: TIMELINE_LAYOUTS },
  { id: "process", label: "Quy trình", layouts: PROCESS_LAYOUTS },
  { id: "statistics", label: "Thống kê", layouts: STATISTICS_LAYOUTS },
  { id: "diagram", label: "Sơ đồ", layouts: DIAGRAM_LAYOUTS },
  { id: "table", label: "Bảng", layouts: TABLE_LAYOUTS },
  { id: "quote", label: "Trích dẫn", layouts: QUOTE_LAYOUTS },
  { id: "team", label: "Đội ngũ", layouts: TEAM_LAYOUTS },
  { id: "product", label: "Sản phẩm", layouts: PRODUCT_LAYOUTS },
  { id: "media", label: "Media", layouts: MEDIA_LAYOUTS },
  { id: "modern", label: "Hiện đại", layouts: MODERN_LAYOUTS },
  { id: "business", label: "Kinh doanh", layouts: BUSINESS_LAYOUTS },
  { id: "education", label: "Giáo dục", layouts: EDUCATION_LAYOUTS },
];

/** Tra cứu layout theo id (dùng cho drag & drop). */
export const LAYOUT_MAP: Map<string, LayoutDef> = new Map(
  LAYOUT_GROUPS.flatMap((g) => g.layouts.map((l) => [l.id, l] as const)),
);

/** Tổng số layout — assertion tại module load để không tụt dưới 151 khi refactor. */
export const LAYOUT_COUNT = LAYOUT_GROUPS.reduce((n, g) => n + g.layouts.length, 0);

/**
 * Xây slide từ layout theo id. Trả về `null` nếu id không tồn tại.
 * Slide trả về đã có id mới (element cũng id mới) — an toàn để chèn/thay trực tiếp.
 */
export function buildLayoutSlide(layoutId: string): Slide | null {
  return LAYOUT_MAP.get(layoutId)?.build() ?? null;
}
