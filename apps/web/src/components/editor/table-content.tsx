import type { TableElement } from "@repo/shared";
import { inRange, normalizeRange, type CellPos, type CellRange } from "@/lib/editor/table";

/**
 * Render bảng — dùng CHUNG cho canvas editor lẫn SlidePreview/thumbnail.
 * Bảng lấp đầy element (grid: cột theo `columnWidths` fr, hàng chia đều).
 * Ở editor (`editing`):
 * - sửa ô bằng contentEditable;
 * - click chọn 1 ô, KÉO chuột chọn vùng ô (anchor→focus, báo lên qua `onSelectCell`)
 *   — vùng chọn dùng cho tô màu ô và thêm/xóa hàng-cột theo vị trí (Inspector).
 */

export const TABLE_DEFAULTS = {
  headerBg: "#6366f1",
  headerColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#e5e7eb",
  fontSize: 16,
} as const;

export function TableContent({
  props,
  editing = false,
  selection = null,
  onSelectCell,
  onCommitCell,
}: {
  props: TableElement["props"];
  editing?: boolean;
  /** Vùng ô đang chọn (anchor/focus) — chỉ dùng ở editor. */
  selection?: { anchor: CellPos; focus: CellPos } | null;
  /** Click = chọn ô mới (extend=false); kéo qua ô khác = mở rộng vùng (extend=true). */
  onSelectCell?: (pos: CellPos, extend: boolean) => void;
  onCommitCell?: (row: number, col: number, value: string) => void;
}) {
  const style = props.style ?? {};
  const headerRow = props.headerRow !== false;
  const colCount = props.rows[0]?.length ?? 1;
  const widths =
    props.columnWidths && props.columnWidths.length === colCount
      ? props.columnWidths
      : Array<number>(colCount).fill(1);

  const borderColor = style.borderColor ?? TABLE_DEFAULTS.borderColor;
  const fontSize = style.fontSize ?? TABLE_DEFAULTS.fontSize;

  const range: CellRange | null = selection ? normalizeRange(selection.anchor, selection.focus) : null;
  const multiSelect = range != null && (range.r1 !== range.r2 || range.c1 !== range.c2);

  function cellFromEvent(e: React.PointerEvent): CellPos | null {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-cell]");
    if (!cell) return null;
    return { r: Number(cell.dataset.r), c: Number(cell.dataset.c) };
  }

  return (
    <div
      onPointerMove={
        editing && onSelectCell
          ? (e) => {
              if ((e.buttons & 1) === 0) return;
              const pos = cellFromEvent(e);
              if (pos) onSelectCell(pos, true);
            }
          : undefined
      }
      style={{
        display: "grid",
        gridTemplateColumns: widths.map((w) => `${w}fr`).join(" "),
        gridTemplateRows: `repeat(${props.rows.length}, 1fr)`,
        width: "100%",
        height: "100%",
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        fontSize,
        lineHeight: 1.3,
        backgroundColor: "#ffffff",
        // kéo chọn nhiều ô: tắt bôi đen text để không lẫn với chọn vùng
        userSelect: multiSelect ? "none" : undefined,
      }}
    >
      {props.rows.map((row, r) => {
        const isHeader = headerRow && r === 0;
        // zebra tính trên hàng DỮ LIỆU (bỏ header) để sọc bắt đầu ổn định
        const dataIndex = headerRow ? r - 1 : r;
        const zebra = !isHeader && style.zebraBg && dataIndex % 2 === 1 ? style.zebraBg : undefined;
        return row.map((cell, c) => {
          const cellStyle = props.cellStyles?.[r]?.[c];
          const selected = range != null && inRange(r, c, range);
          const bg =
            cellStyle?.bg ??
            (isHeader ? (style.headerBg ?? TABLE_DEFAULTS.headerBg) : (zebra ?? style.cellBg ?? "transparent"));
          const color =
            cellStyle?.color ??
            (isHeader ? (style.headerColor ?? TABLE_DEFAULTS.headerColor) : (style.textColor ?? TABLE_DEFAULTS.textColor));
          return (
            <div
              key={`${r}-${c}`}
              data-cell
              data-r={r}
              data-c={c}
              contentEditable={editing && onCommitCell != null}
              suppressContentEditableWarning
              onPointerDown={
                editing && onSelectCell
                  ? () => onSelectCell({ r, c }, false)
                  : undefined
              }
              onBlur={
                editing && onCommitCell
                  ? (e) => {
                      const value = e.currentTarget.textContent ?? "";
                      if (value !== cell) onCommitCell(r, c, value);
                    }
                  : undefined
              }
              onKeyDown={
                editing
                  ? (e) => {
                      if (e.key === "Escape") (e.currentTarget as HTMLElement).blur();
                      e.stopPropagation(); // không cho phím tắt editor (Delete/Ctrl+Z…) nuốt khi gõ trong ô
                    }
                  : undefined
              }
              style={{
                display: "flex",
                alignItems: "center",
                padding: `${Math.round(fontSize * 0.4)}px ${Math.round(fontSize * 0.7)}px`,
                backgroundColor: bg,
                color,
                fontWeight: isHeader ? 700 : 400,
                borderRight: c < row.length - 1 ? `1px solid ${borderColor}` : undefined,
                borderBottom: r < props.rows.length - 1 ? `1px solid ${borderColor}` : undefined,
                overflow: "hidden",
                wordBreak: "break-word",
                outline: "none",
                cursor: editing ? "text" : undefined,
                // vùng chọn: viền + phủ tím nhạt (inset spread lớn = tô cả ô, không che chữ)
                boxShadow: selected
                  ? "inset 0 0 0 9999px rgba(99,102,241,0.14), inset 0 0 0 1.5px #6366f1"
                  : undefined,
              }}
            >
              {cell}
            </div>
          );
        });
      })}
    </div>
  );
}
