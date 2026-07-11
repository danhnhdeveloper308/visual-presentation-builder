import { SLIDE_HEIGHT, SLIDE_WIDTH, type SlideElement } from "@repo/shared";

/**
 * Căn hàng / phân bố đều element (hàm THUẦN, có test jiti):
 * - 1 element → căn theo SLIDE (1280×720); nhiều element → căn theo bounding box của selection.
 * - Phân bố đều: giữ phần tử ngoài cùng, chia đều KHOẢNG HỞ giữa các phần tử (như PowerPoint).
 */

export type AlignMode = "left" | "center-x" | "right" | "top" | "center-y" | "bottom";

type Box = { id: string; x: number; y: number; w: number; h: number };
type Bounds = { x: number; y: number; w: number; h: number };

export function elementBox(el: SlideElement): Box {
  return { id: el.id, x: el.position.x, y: el.position.y, w: el.size.width, h: el.size.height };
}

export const SLIDE_BOUNDS: Bounds = { x: 0, y: 0, w: SLIDE_WIDTH, h: SLIDE_HEIGHT };

/** Bounding box bao quanh nhiều box. */
export function unionBounds(boxes: Box[]): Bounds {
  const x1 = Math.min(...boxes.map((b) => b.x));
  const y1 = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.w));
  const y2 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/** Vị trí mới của từng box sau khi căn theo `bounds` — chỉ trả các box CÓ thay đổi. */
export function alignBoxes(
  boxes: Box[],
  mode: AlignMode,
  bounds: Bounds,
): Map<string, { x: number; y: number }> {
  const out = new Map<string, { x: number; y: number }>();
  for (const b of boxes) {
    let x = b.x;
    let y = b.y;
    switch (mode) {
      case "left":
        x = bounds.x;
        break;
      case "center-x":
        x = bounds.x + (bounds.w - b.w) / 2;
        break;
      case "right":
        x = bounds.x + bounds.w - b.w;
        break;
      case "top":
        y = bounds.y;
        break;
      case "center-y":
        y = bounds.y + (bounds.h - b.h) / 2;
        break;
      case "bottom":
        y = bounds.y + bounds.h - b.h;
        break;
    }
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;
    if (x !== b.x || y !== b.y) out.set(b.id, { x, y });
  }
  return out;
}

/**
 * Phân bố đều theo trục (cần ≥3): sắp theo toạ độ, giữ phần tử đầu/cuối,
 * chia đều khoảng hở giữa các phần tử ở giữa.
 */
export function distributeBoxes(
  boxes: Box[],
  axis: "x" | "y",
): Map<string, { x: number; y: number }> {
  const out = new Map<string, { x: number; y: number }>();
  if (boxes.length < 3) return out;

  const pos = (b: Box) => (axis === "x" ? b.x : b.y);
  const size = (b: Box) => (axis === "x" ? b.w : b.h);
  const sorted = [...boxes].sort((a, b) => pos(a) - pos(b));

  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const span = pos(last) + size(last) - pos(first);
  const totalSize = sorted.reduce((sum, b) => sum + size(b), 0);
  const gap = (span - totalSize) / (sorted.length - 1);

  let cursor = pos(first);
  for (const b of sorted) {
    const next = Math.round(cursor * 100) / 100;
    if (next !== pos(b)) {
      out.set(b.id, axis === "x" ? { x: next, y: b.y } : { x: b.x, y: next });
    }
    cursor += size(b) + gap;
  }
  return out;
}

/**
 * Nhân bản element cho PASTE (clipboard nội bộ): id mới, giữ liên kết nhóm bằng
 * groupId remap, lệch +24, zIndex nối tiếp trên cùng của slide đích.
 */
export function cloneElementsForPaste(
  elements: SlideElement[],
  targetElements: SlideElement[],
): SlideElement[] {
  const baseZ = Math.max(0, ...targetElements.map((e) => e.zIndex));
  const groupRemap = new Map<string, string>();
  return elements.map((el, i) => {
    const clone = structuredClone(el);
    clone.id = crypto.randomUUID();
    clone.position = { x: el.position.x + 24, y: el.position.y + 24 };
    clone.zIndex = baseZ + i + 1;
    if (el.groupId) {
      if (!groupRemap.has(el.groupId)) groupRemap.set(el.groupId, crypto.randomUUID());
      clone.groupId = groupRemap.get(el.groupId);
    }
    return clone;
  });
}
