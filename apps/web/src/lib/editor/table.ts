import type { TableCellStyle, TableElement } from "@repo/shared";

/**
 * Thao tác dữ liệu bảng (hàm THUẦN, có test jiti) — chèn/xóa hàng-cột theo VỊ TRÍ,
 * giữ ma trận `cellStyles` song song với `rows`, áp định dạng theo vùng chọn chữ nhật.
 */

export type TableProps = TableElement["props"];
export type CellPos = { r: number; c: number };
export type CellRange = { r1: number; c1: number; r2: number; c2: number };

/** Chuẩn hoá anchor/focus (kéo theo hướng bất kỳ) về vùng chữ nhật r1≤r2, c1≤c2. */
export function normalizeRange(anchor: CellPos, focus: CellPos): CellRange {
  return {
    r1: Math.min(anchor.r, focus.r),
    r2: Math.max(anchor.r, focus.r),
    c1: Math.min(anchor.c, focus.c),
    c2: Math.max(anchor.c, focus.c),
  };
}

export function inRange(r: number, c: number, range: CellRange): boolean {
  return r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2;
}

function colCount(props: TableProps): number {
  return props.rows[0]?.length ?? 0;
}

/** cellStyles đồng kích thước với rows (thiếu/lệch thì bù null) — dùng trước mọi phép sửa. */
function paddedStyles(props: TableProps): (TableCellStyle | null)[][] {
  const cols = colCount(props);
  return props.rows.map((_, r) =>
    Array.from({ length: cols }, (_, c) => props.cellStyles?.[r]?.[c] ?? null),
  );
}

/** Bỏ cellStyles nếu toàn null — giữ JSON gọn. */
function compactStyles(styles: (TableCellStyle | null)[][]): TableProps["cellStyles"] {
  return styles.some((row) => row.some((s) => s != null)) ? styles : undefined;
}

/** Chèn 1 hàng trống vào vị trí `at` (0..rows.length). */
export function insertRow(props: TableProps, at: number): TableProps {
  const cols = colCount(props);
  const i = Math.max(0, Math.min(at, props.rows.length));
  const styles = paddedStyles(props);
  const rows = [...props.rows.slice(0, i), Array<string>(cols).fill(""), ...props.rows.slice(i)];
  styles.splice(i, 0, Array<TableCellStyle | null>(cols).fill(null));
  return { ...props, rows, cellStyles: compactStyles(styles) };
}

/** Xóa các hàng [r1..r2] — luôn giữ lại ít nhất 1 hàng. */
export function removeRows(props: TableProps, r1: number, r2: number): TableProps {
  const keep = props.rows.filter((_, r) => r < r1 || r > r2);
  if (keep.length === 0) return props;
  const styles = paddedStyles(props).filter((_, r) => r < r1 || r > r2);
  return { ...props, rows: keep, cellStyles: compactStyles(styles) };
}

/** Chèn 1 cột trống vào vị trí `at` (0..cols). */
export function insertCol(props: TableProps, at: number): TableProps {
  const cols = colCount(props);
  const i = Math.max(0, Math.min(at, cols));
  const rows = props.rows.map((row) => [...row.slice(0, i), "", ...row.slice(i)]);
  const styles = paddedStyles(props).map((row) => [...row.slice(0, i), null, ...row.slice(i)]);
  // columnWidths lệch số cột sau khi chèn → reset chia đều
  return { ...props, rows, cellStyles: compactStyles(styles), columnWidths: undefined };
}

/** Xóa các cột [c1..c2] — luôn giữ lại ít nhất 1 cột. */
export function removeCols(props: TableProps, c1: number, c2: number): TableProps {
  const cols = colCount(props);
  const remaining = cols - (Math.min(c2, cols - 1) - Math.max(c1, 0) + 1);
  if (remaining <= 0) return props;
  const drop = (_: unknown, c: number) => c < c1 || c > c2;
  const rows = props.rows.map((row) => row.filter(drop));
  const styles = paddedStyles(props).map((row) => row.filter(drop));
  return { ...props, rows, cellStyles: compactStyles(styles), columnWidths: undefined };
}

/** Gộp patch định dạng vào mọi ô trong vùng (giữ field đã có, field mới đè). */
export function patchCellStyles(
  props: TableProps,
  range: CellRange,
  patch: Partial<TableCellStyle>,
): TableProps {
  const styles = paddedStyles(props).map((row, r) =>
    row.map((s, c) => (inRange(r, c, range) ? { ...s, ...patch } : s)),
  );
  return { ...props, cellStyles: compactStyles(styles) };
}

/** Xóa định dạng riêng của mọi ô trong vùng. */
export function clearCellStyles(props: TableProps, range: CellRange): TableProps {
  const styles = paddedStyles(props).map((row, r) =>
    row.map((s, c) => (inRange(r, c, range) ? null : s)),
  );
  return { ...props, cellStyles: compactStyles(styles) };
}

/** Kẹp vị trí ô vào kích thước bảng hiện tại (sau khi chèn/xóa). */
export function clampPos(props: TableProps, pos: CellPos): CellPos {
  return {
    r: Math.max(0, Math.min(pos.r, props.rows.length - 1)),
    c: Math.max(0, Math.min(pos.c, colCount(props) - 1)),
  };
}
