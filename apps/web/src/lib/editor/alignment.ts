import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@repo/shared";

/**
 * Tính toán căn chỉnh (smart guides) khi kéo element — hàm THUẦN, không phụ thuộc React,
 * để dễ kiểm thử độc lập. Toạ độ đầu vào/ra đều là toạ độ logic trên khung 1280×720.
 *
 * Ý tưởng (giống PowerPoint/Canva/Figma):
 *  - Mỗi element có 3 "mốc" trên mỗi trục: cạnh đầu, tâm, cạnh cuối.
 *  - So mốc của element đang kéo với mốc của các element khác + của slide (0 / giữa / hết).
 *  - Nếu lệch <= ngưỡng (tính theo px MÀN HÌNH để cảm giác đều ở mọi mức zoom) → bám (snap)
 *    và trả về các đường guide cần vẽ.
 */

export type Box = { x: number; y: number; w: number; h: number };

export type AlignmentResult = {
  /** Lượng cần cộng THÊM vào delta thô để bám vào guide (0 nếu không bám). */
  adjustX: number;
  adjustY: number;
  /** Vị trí (logic) các đường guide dọc / ngang cần vẽ. */
  vertical: number[];
  horizontal: number[];
};

/** Ngưỡng bám tính theo px màn hình (chia zoom để ra ngưỡng theo toạ độ logic). */
export const SNAP_SCREEN_PX = 6;
/** Sai số coi như "trùng" khi thu thập đường guide sau khi đã bám. */
const EPS = 0.5;

function axisTargets(targets: Box[], axis: "x" | "y"): number[] {
  const set = new Set<number>();
  if (axis === "x") {
    set.add(0);
    set.add(SLIDE_WIDTH / 2);
    set.add(SLIDE_WIDTH);
    for (const t of targets) {
      set.add(t.x);
      set.add(t.x + t.w / 2);
      set.add(t.x + t.w);
    }
  } else {
    set.add(0);
    set.add(SLIDE_HEIGHT / 2);
    set.add(SLIDE_HEIGHT);
    for (const t of targets) {
      set.add(t.y);
      set.add(t.y + t.h / 2);
      set.add(t.y + t.h);
    }
  }
  return [...set];
}

function snapAxis(
  handles: number[],
  targets: number[],
  threshold: number,
): { adjust: number; lines: number[] } {
  let adjust = 0;
  let best = Infinity;
  for (const h of handles) {
    for (const t of targets) {
      const diff = t - h;
      const abs = Math.abs(diff);
      if (abs <= threshold && abs < best) {
        best = abs;
        adjust = diff;
      }
    }
  }
  if (best === Infinity) return { adjust: 0, lines: [] };
  // Sau khi bám, mọi target mà 1 mốc bất kỳ trùng khít đều là 1 đường guide cần vẽ
  const lines: number[] = [];
  for (const t of targets) {
    if (handles.some((h) => Math.abs(h + adjust - t) < EPS)) lines.push(t);
  }
  return { adjust, lines };
}

/**
 * @param box   Hộp bao (đã cộng delta thô) của element/nhóm đang kéo.
 * @param targets  Các element KHÔNG bị kéo (để căn theo).
 * @param zoom  Mức zoom hiện tại (để quy đổi ngưỡng px màn hình → logic).
 */
export function computeAlignment(box: Box, targets: Box[], zoom: number): AlignmentResult {
  const threshold = SNAP_SCREEN_PX / Math.max(zoom, 0.0001);

  const xHandles = [box.x, box.x + box.w / 2, box.x + box.w];
  const yHandles = [box.y, box.y + box.h / 2, box.y + box.h];

  const x = snapAxis(xHandles, axisTargets(targets, "x"), threshold);
  const y = snapAxis(yHandles, axisTargets(targets, "y"), threshold);

  return { adjustX: x.adjust, adjustY: y.adjust, vertical: x.lines, horizontal: y.lines };
}

/** Hộp bao chung của nhiều element (dùng khi kéo nhóm). */
export function unionBox(boxes: Box[]): Box | null {
  if (boxes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const b of boxes) {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.w);
    maxY = Math.max(maxY, b.y + b.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
