import type { CSSProperties } from "react";
import type { ShapeElement, ShapeKind } from "@repo/shared";

/* ============================================================
 * Sinh hình học clip-path (toạ độ %, gốc trên-trái, y hướng xuống)
 * ============================================================ */

type Pt = [number, number];

const fmt = (n: number) => `${Math.round(n * 100) / 100}%`;

function polygon(points: Pt[]): string {
  return `polygon(${points.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(", ")})`;
}

/** Điểm trên cung ellipse tâm (cx,cy) — góc tính bằng độ, 0° = phải, 90° = xuống (toạ độ màn hình). */
function arc(cx: number, cy: number, rx: number, ry: number, fromDeg: number, toDeg: number, steps = 16): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

function regularPolygon(n: number, startDeg = -90): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((startDeg + (i * 360) / n) * Math.PI) / 180;
    pts.push([50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)]);
  }
  return pts;
}

function starPolygon(spikes: number, innerRatio: number, startDeg = -90): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 50 : 50 * innerRatio;
    const a = ((startDeg + (i * 180) / spikes) * Math.PI) / 180;
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  return pts;
}

/** Bánh răng: răng phẳng xen kẽ 2 bán kính + lỗ trục ở giữa (subpath ngược chiều). */
function gearPolygon(teeth = 8, inner = 0.72, hole = 0.28): Pt[] {
  const seg = 360 / teeth;
  const pts: Pt[] = [];
  for (let i = 0; i < teeth; i++) {
    const base = -90 + i * seg;
    const at = (deg: number, ratio: number): Pt => {
      const a = (deg * Math.PI) / 180;
      return [50 + 50 * ratio * Math.cos(a), 50 + 50 * ratio * Math.sin(a)];
    };
    pts.push(at(base, inner), at(base + seg * 0.32, inner), at(base + seg * 0.42, 1), at(base + seg * 0.78, 1));
  }
  pts.push(pts[0]!);
  // lỗ trục: đi ngược chiều kim đồng hồ → nonzero fill rule tạo lỗ
  pts.push(...arc(50, 50, 50 * hole, 50 * hole, 270, -90, 20));
  return pts;
}

/** Trái tim: đường cong tham số cổ điển, lấy mẫu 40 điểm, ép vào khung 0–100. */
function heartPolygon(): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([((x + 16) / 32) * 100, (1 - (y + 17) / 30) * 100]);
  }
  return pts;
}

/** Đám mây: 3 vòm cung nối nhau trên đáy phẳng. */
function cloudPolygon(): Pt[] {
  return [
    [8, 82],
    ...arc(22, 66, 16, 16, 120, 262, 10),
    ...arc(50, 48, 24, 24, 195, 345, 12),
    ...arc(78, 66, 16, 16, 280, 60, 10),
    [92, 82],
  ];
}

export const SHAPE_CLIP_PATHS: Partial<Record<ShapeKind, string>> = {
  // cơ bản
  triangle: polygon([[50, 0], [100, 100], [0, 100]]),
  "right-triangle": polygon([[0, 0], [100, 100], [0, 100]]),
  diamond: polygon([[50, 0], [100, 50], [50, 100], [0, 50]]),
  pentagon: polygon(regularPolygon(5)),
  hexagon: polygon(regularPolygon(6)),
  heptagon: polygon(regularPolygon(7)),
  octagon: polygon(regularPolygon(8, -67.5)),
  parallelogram: polygon([[25, 0], [100, 0], [75, 100], [0, 100]]),
  trapezoid: polygon([[20, 0], [80, 0], [100, 100], [0, 100]]),
  semicircle: polygon(arc(50, 100, 50, 100, 180, 360, 24)),
  "quarter-circle": polygon([...arc(0, 100, 100, 100, 270, 360, 24), [0, 100]]),
  // mũi tên
  arrow: polygon([[0, 35], [60, 35], [60, 10], [100, 50], [60, 90], [60, 65], [0, 65]]),
  "arrow-left": polygon([[100, 35], [40, 35], [40, 10], [0, 50], [40, 90], [40, 65], [100, 65]]),
  "arrow-up": polygon([[35, 100], [35, 40], [10, 40], [50, 0], [90, 40], [65, 40], [65, 100]]),
  "arrow-down": polygon([[35, 0], [35, 60], [10, 60], [50, 100], [90, 60], [65, 60], [65, 0]]),
  "double-arrow": polygon([[0, 50], [22, 12], [22, 35], [78, 35], [78, 12], [100, 50], [78, 88], [78, 65], [22, 65], [22, 88]]),
  "double-arrow-vertical": polygon([[50, 0], [88, 22], [65, 22], [65, 78], [88, 78], [50, 100], [12, 78], [35, 78], [35, 22], [12, 22]]),
  chevron: polygon([[0, 0], [75, 0], [100, 50], [75, 100], [0, 100], [25, 50]]),
  "chevron-left": polygon([[25, 0], [100, 0], [75, 50], [100, 100], [25, 100], [0, 50]]),
  "corner-arrow": polygon([[0, 70], [55, 70], [55, 30], [40, 30], [70, 0], [100, 30], [85, 30], [85, 100], [0, 100]]),
  signpost: polygon([[0, 0], [75, 0], [100, 50], [75, 100], [0, 100]]),
  // sao & huy hiệu
  star: polygon(starPolygon(5, 0.4)),
  "star-4": polygon(starPolygon(4, 0.36)),
  "star-6": polygon(starPolygon(6, 0.55)),
  "star-8": polygon(starPolygon(8, 0.6)),
  "star-12": polygon(starPolygon(12, 0.72)),
  seal: polygon(starPolygon(16, 0.85)),
  ribbon: polygon([[0, 30], [100, 30], [88, 50], [100, 70], [0, 70]]),
  bookmark: polygon([[15, 0], [85, 0], [85, 100], [50, 78], [15, 100]]),
  banner: polygon([[0, 0], [100, 0], [88, 50], [100, 100], [0, 100], [12, 50]]),
  // callout
  "speech-bubble": polygon([[0, 0], [100, 0], [100, 75], [40, 75], [20, 100], [25, 75], [0, 75]]),
  "speech-bubble-left": polygon([[0, 0], [100, 0], [100, 75], [75, 75], [80, 100], [60, 75], [0, 75]]),
  // biểu tượng
  heart: polygon(heartPolygon()),
  lightning: polygon([[60, 0], [10, 55], [38, 55], [30, 100], [90, 40], [55, 40]]),
  cloud: polygon(cloudPolygon()),
  sun: polygon(starPolygon(12, 0.65)),
  drop: polygon([[50, 0], ...arc(50, 62, 38, 38, 300, 600, 24)]),
  gear: polygon(gearPolygon()),
  plus: polygon([[35, 0], [65, 0], [65, 35], [100, 35], [100, 65], [65, 65], [65, 100], [35, 100], [35, 65], [0, 65], [0, 35], [35, 35]]),
  check: polygon([[14, 52], [0, 66], [35, 100], [100, 28], [86, 14], [35, 72]]),
  "x-mark": polygon([[20, 0], [50, 30], [80, 0], [100, 20], [70, 50], [100, 80], [80, 100], [50, 70], [20, 100], [0, 80], [30, 50], [0, 20]]),
  home: polygon([[50, 0], [100, 45], [88, 45], [88, 100], [12, 100], [12, 45], [0, 45]]),
  flag: polygon([[0, 0], [100, 0], [80, 50], [100, 100], [0, 100]]),
  pin: polygon([[50, 100], ...arc(50, 38, 38, 38, 120, 420, 24)]),
  tag: polygon([[0, 0], [70, 0], [100, 50], [70, 100], [0, 100]]),
  shield: polygon([[50, 0], [100, 15], [98, 50], [85, 78], [50, 100], [15, 78], [2, 50], [0, 15]]),
  kite: polygon([[50, 0], [100, 35], [50, 100], [0, 35]]),
  // flowchart
  "flow-document": polygon([
    [0, 0],
    [100, 0],
    [100, 86],
    ...Array.from({ length: 11 }, (_, i): Pt => {
      const x = 100 - i * 10;
      return [x, 86 + 10 * Math.sin((x / 100) * Math.PI * 2 + Math.PI)];
    }),
  ]),
  "flow-database": polygon([
    ...arc(50, 12, 50, 12, 180, 360, 16),
    [100, 88],
    ...arc(50, 88, 50, 12, 0, 180, 16),
  ]),
  "flow-manual-input": polygon([[0, 25], [100, 0], [100, 100], [0, 100]]),
  "flow-preparation": polygon([[20, 0], [80, 0], [100, 50], [80, 100], [20, 100], [0, 50]]),
  "flow-delay": polygon([[0, 0], [60, 0], ...arc(60, 50, 40, 50, 270, 450, 16), [0, 100]]),
  "flow-display": polygon([[0, 50], [18, 0], [65, 0], ...arc(65, 50, 35, 50, 270, 450, 16), [18, 100]]),
  "flow-stored-data": polygon([
    [15, 0],
    [100, 0],
    ...arc(100, 50, 15, 50, 270, 90, 12),
    [15, 100],
    ...arc(15, 50, 15, 50, 90, 270, 12),
  ]),
  "flow-merge": polygon([[0, 0], [100, 0], [50, 100]]),
  // khung (đường viền rỗng ruột — subpath trong ngược chiều tạo lỗ)
  frame: polygon([[0, 0], [100, 0], [100, 100], [0, 100], [0, 0], [15, 15], [15, 85], [85, 85], [85, 15], [15, 15]]),
  ring: polygon([...arc(50, 50, 50, 50, 0, 360, 32), ...arc(50, 50, 32, 32, 360, 0, 32)]),
};

/* ============================================================
 * Style render — dùng chung canvas editor + SlidePreview
 * ============================================================ */

const GRADIENT_RE = /^(linear|radial|conic)-gradient\(/;

function shapeBorderRadius(p: ShapeElement["props"]): CSSProperties["borderRadius"] {
  switch (p.shape) {
    case "ellipse":
    case "circle":
      return "50%";
    case "pill":
      return 9999;
    case "rounded-rect":
      return p.borderRadius ?? 24;
    default:
      return p.borderRadius;
  }
}

/** Style thân shape. Với shape clip-path: border/stroke không áp dụng được. */
export function shapeStyle(p: ShapeElement["props"]): CSSProperties {
  const clipPath = SHAPE_CLIP_PATHS[p.shape];
  const isGradient = GRADIENT_RE.test(p.fill);
  return {
    backgroundColor: isGradient ? undefined : p.fill,
    backgroundImage: isGradient ? p.fill : undefined,
    borderRadius: shapeBorderRadius(p),
    clipPath,
    border: !clipPath && p.stroke ? `${p.strokeWidth ?? 1}px solid ${p.stroke}` : undefined,
  };
}

/**
 * Style cho wrapper BÊN NGOÀI div bị clip — drop-shadow phải nằm ngoài clip-path,
 * nếu đặt cùng element thì bóng bị cắt mất theo hình.
 */
export function shapeWrapperStyle(p: ShapeElement["props"]): CSSProperties {
  return p.shadow ? { filter: "drop-shadow(0 6px 14px rgb(0 0 0 / 0.35))" } : {};
}

/** Shape này có dùng được border (stroke) không — chỉ shape không clip-path. */
export function shapeSupportsBorder(kind: ShapeKind): boolean {
  return !SHAPE_CLIP_PATHS[kind];
}

/** Shape này có chỉnh được bo góc không. */
export function shapeSupportsRadius(kind: ShapeKind): boolean {
  return kind === "rect" || kind === "rounded-rect";
}

/* ============================================================
 * Danh mục shape cho menu chèn + Inspector
 * ============================================================ */

export type ShapeCategoryId = "basic" | "arrow" | "star" | "callout" | "symbol" | "flowchart";

export const SHAPE_CATEGORIES: { id: ShapeCategoryId; label: string }[] = [
  { id: "basic", label: "Cơ bản" },
  { id: "arrow", label: "Mũi tên" },
  { id: "star", label: "Sao & băng rôn" },
  { id: "callout", label: "Hội thoại" },
  { id: "symbol", label: "Biểu tượng" },
  { id: "flowchart", label: "Flowchart" },
];

type ShapeOption = {
  kind: ShapeKind;
  label: string;
  category: ShapeCategoryId;
  size: { width: number; height: number };
};

const SQ = { width: 160, height: 160 };
const WIDE = { width: 220, height: 100 };
const RECT = { width: 200, height: 140 };

export const SHAPE_OPTIONS: ShapeOption[] = [
  // cơ bản
  { kind: "rect", label: "Chữ nhật", category: "basic", size: RECT },
  { kind: "rounded-rect", label: "Chữ nhật bo góc", category: "basic", size: RECT },
  { kind: "pill", label: "Viên thuốc", category: "basic", size: { width: 220, height: 90 } },
  { kind: "circle", label: "Tròn", category: "basic", size: SQ },
  { kind: "ellipse", label: "Elip", category: "basic", size: { width: 200, height: 140 } },
  { kind: "semicircle", label: "Bán nguyệt", category: "basic", size: { width: 200, height: 100 } },
  { kind: "quarter-circle", label: "Phần tư tròn", category: "basic", size: SQ },
  { kind: "triangle", label: "Tam giác", category: "basic", size: { width: 160, height: 140 } },
  { kind: "right-triangle", label: "Tam giác vuông", category: "basic", size: { width: 160, height: 140 } },
  { kind: "diamond", label: "Thoi", category: "basic", size: SQ },
  { kind: "pentagon", label: "Ngũ giác", category: "basic", size: SQ },
  { kind: "hexagon", label: "Lục giác", category: "basic", size: SQ },
  { kind: "heptagon", label: "Thất giác", category: "basic", size: SQ },
  { kind: "octagon", label: "Bát giác", category: "basic", size: SQ },
  { kind: "parallelogram", label: "Bình hành", category: "basic", size: RECT },
  { kind: "trapezoid", label: "Hình thang", category: "basic", size: RECT },
  { kind: "frame", label: "Khung", category: "basic", size: SQ },
  { kind: "ring", label: "Vòng tròn rỗng", category: "basic", size: SQ },
  { kind: "line", label: "Đường kẻ", category: "basic", size: { width: 240, height: 6 } },
  // mũi tên
  { kind: "arrow", label: "Mũi tên phải", category: "arrow", size: WIDE },
  { kind: "arrow-left", label: "Mũi tên trái", category: "arrow", size: WIDE },
  { kind: "arrow-up", label: "Mũi tên lên", category: "arrow", size: { width: 100, height: 220 } },
  { kind: "arrow-down", label: "Mũi tên xuống", category: "arrow", size: { width: 100, height: 220 } },
  { kind: "double-arrow", label: "Mũi tên 2 chiều", category: "arrow", size: WIDE },
  { kind: "double-arrow-vertical", label: "Mũi tên 2 chiều dọc", category: "arrow", size: { width: 100, height: 220 } },
  { kind: "chevron", label: "Chevron", category: "arrow", size: WIDE },
  { kind: "chevron-left", label: "Chevron trái", category: "arrow", size: WIDE },
  { kind: "corner-arrow", label: "Mũi tên gấp khúc", category: "arrow", size: SQ },
  { kind: "signpost", label: "Biển chỉ dẫn", category: "arrow", size: WIDE },
  // sao & băng rôn
  { kind: "star", label: "Sao 5 cánh", category: "star", size: SQ },
  { kind: "star-4", label: "Sao 4 cánh", category: "star", size: SQ },
  { kind: "star-6", label: "Sao 6 cánh", category: "star", size: SQ },
  { kind: "star-8", label: "Sao 8 cánh", category: "star", size: SQ },
  { kind: "star-12", label: "Sao 12 cánh", category: "star", size: SQ },
  { kind: "seal", label: "Con dấu", category: "star", size: SQ },
  { kind: "ribbon", label: "Ruy băng", category: "star", size: { width: 240, height: 80 } },
  { kind: "banner", label: "Băng rôn", category: "star", size: { width: 240, height: 90 } },
  { kind: "bookmark", label: "Đánh dấu trang", category: "star", size: { width: 110, height: 160 } },
  // hội thoại
  { kind: "speech-bubble", label: "Bong bóng thoại", category: "callout", size: { width: 220, height: 160 } },
  { kind: "speech-bubble-left", label: "Bong bóng thoại trái", category: "callout", size: { width: 220, height: 160 } },
  // biểu tượng
  { kind: "heart", label: "Trái tim", category: "symbol", size: SQ },
  { kind: "lightning", label: "Tia sét", category: "symbol", size: { width: 120, height: 160 } },
  { kind: "cloud", label: "Đám mây", category: "symbol", size: { width: 200, height: 130 } },
  { kind: "sun", label: "Mặt trời", category: "symbol", size: SQ },
  { kind: "drop", label: "Giọt nước", category: "symbol", size: { width: 130, height: 160 } },
  { kind: "gear", label: "Bánh răng", category: "symbol", size: SQ },
  { kind: "plus", label: "Dấu cộng", category: "symbol", size: SQ },
  { kind: "check", label: "Dấu tích", category: "symbol", size: { width: 170, height: 140 } },
  { kind: "x-mark", label: "Dấu X", category: "symbol", size: SQ },
  { kind: "home", label: "Ngôi nhà", category: "symbol", size: SQ },
  { kind: "flag", label: "Cờ hiệu", category: "symbol", size: { width: 200, height: 110 } },
  { kind: "pin", label: "Ghim vị trí", category: "symbol", size: { width: 120, height: 160 } },
  { kind: "tag", label: "Thẻ tag", category: "symbol", size: { width: 200, height: 110 } },
  { kind: "shield", label: "Khiên", category: "symbol", size: { width: 140, height: 160 } },
  { kind: "kite", label: "Cánh diều", category: "symbol", size: { width: 130, height: 160 } },
  // flowchart
  { kind: "flow-document", label: "Tài liệu", category: "flowchart", size: RECT },
  { kind: "flow-database", label: "Database", category: "flowchart", size: { width: 150, height: 180 } },
  { kind: "flow-manual-input", label: "Nhập tay", category: "flowchart", size: RECT },
  { kind: "flow-preparation", label: "Chuẩn bị", category: "flowchart", size: WIDE },
  { kind: "flow-delay", label: "Trì hoãn", category: "flowchart", size: WIDE },
  { kind: "flow-display", label: "Hiển thị", category: "flowchart", size: WIDE },
  { kind: "flow-stored-data", label: "Dữ liệu lưu trữ", category: "flowchart", size: RECT },
  { kind: "flow-merge", label: "Gộp (merge)", category: "flowchart", size: { width: 160, height: 130 } },
];
