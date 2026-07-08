import type {
  IconElement,
  ShapeElement,
  ShapeKind,
  Slide,
  SlideElement,
  TextElement,
} from "@repo/shared";

/**
 * DSL dựng layout — mỗi layout là factory `build(): Slide` trả về slide placeholder
 * (toạ độ logic 1280×720). id element/slide gán MỚI mỗi lần build (áp nhiều lần không trùng id),
 * zIndex = thứ tự trong mảng. Element trả về từ helper có id rỗng — `slide()` gán lại toàn bộ.
 */

export type LayoutDef = {
  /** id ổn định dạng `<group>-<name>` — dùng cho drag & drop + key UI. */
  id: string;
  label: string;
  build: () => Slide;
};

export function L(id: string, label: string, build: () => Slide): LayoutDef {
  return { id, label, build };
}

/** Bảng màu placeholder trung tính — áp theme sau sẽ ghi đè màu chữ/accent theo quy tắc theme. */
export const C = {
  bg: "#ffffff",
  heading: "#111827",
  body: "#4b5563",
  muted: "#9ca3af",
  accent: "#6366f1",
  accentSoft: "#eef2ff",
  card: "#f8fafc",
  border: "#e5e7eb",
  ph: "#e2e8f0", // nền placeholder ảnh
  darkBg: "#0f172a",
  darkCard: "#1e293b",
  darkHeading: "#f8fafc",
  darkBody: "#cbd5e1",
  white: "#ffffff",
  green: "#22c55e",
  greenSoft: "#dcfce7",
  red: "#ef4444",
  redSoft: "#fee2e2",
  amber: "#f59e0b",
  amberSoft: "#fef3c7",
  blueSoft: "#dbeafe",
  pink: "#ec4899",
} as const;

export const FONT = "Inter, sans-serif";
export const SERIF = "Georgia, 'Times New Roman', serif";
export const MONO = "ui-monospace, SFMono-Regular, monospace";

/** Thuộc tính element-level tùy chọn (xoay/mờ). */
type El = { rotation?: number; opacity?: number };

export function text(
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  props: Partial<TextElement["props"]> = {},
  el: El = {},
): TextElement {
  return {
    id: "",
    type: "text",
    position: { x, y },
    size: { width: w, height: h },
    rotation: el.rotation ?? 0,
    zIndex: 0,
    opacity: el.opacity,
    props: {
      content,
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 400,
      color: C.body,
      align: "left",
      lineHeight: 1.4,
      ...props,
    },
  };
}

/** Text cỡ heading (fontSize ≥ 40 để applyTheme nhận diện là heading). */
export function heading(
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  props: Partial<TextElement["props"]> = {},
  el: El = {},
): TextElement {
  return text(x, y, w, h, content, { fontSize: 56, fontWeight: 700, color: C.heading, ...props }, el);
}

export function shape(
  kind: ShapeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  props: Partial<ShapeElement["props"]> = {},
  el: El = {},
): ShapeElement {
  return {
    id: "",
    type: "shape",
    position: { x, y },
    size: { width: w, height: h },
    rotation: el.rotation ?? 0,
    zIndex: 0,
    opacity: el.opacity,
    props: { shape: kind, fill: C.accent, ...props },
  };
}

/** Card bo góc nền nhạt — khối nền phổ biến nhất trong layout. */
export function card(
  x: number,
  y: number,
  w: number,
  h: number,
  props: Partial<ShapeElement["props"]> = {},
  el: El = {},
): ShapeElement {
  return shape("rounded-rect", x, y, w, h, { fill: C.card, borderRadius: 16, ...props }, el);
}

/** Đường kẻ ngang/dọc (shape line = rect mỏng). */
export function line(x: number, y: number, w: number, h: number, fill: string = C.border): ShapeElement {
  return shape("line", x, y, w, h, { fill });
}

/** Đoạn nối giữa 2 điểm bất kỳ (line xoay theo góc) — dùng cho diagram/chart. */
export function connector(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  fill: string = C.border,
  thickness = 4,
): ShapeElement {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return shape(
    "line",
    (x1 + x2) / 2 - len / 2,
    (y1 + y2) / 2 - thickness / 2,
    len,
    thickness,
    { fill },
    { rotation: Math.round(angle * 100) / 100 },
  );
}

export function icon(
  name: string,
  x: number,
  y: number,
  size: number,
  color: string = C.accent,
  el: El = {},
): IconElement {
  return {
    id: "",
    type: "icon",
    position: { x, y },
    size: { width: size, height: size },
    rotation: el.rotation ?? 0,
    zIndex: 0,
    opacity: el.opacity,
    props: { name, color },
  };
}

/** Placeholder ảnh: khối xám bo góc + icon ảnh ở giữa (thay bằng ảnh thật sau khi áp). */
export function imagePh(
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { radius?: number; circle?: boolean; noIcon?: boolean; fill?: string } & El = {},
): SlideElement[] {
  const el = { rotation: opts.rotation, opacity: opts.opacity };
  const box = opts.circle
    ? shape("circle", x, y, w, h, { fill: opts.fill ?? C.ph }, el)
    : shape("rounded-rect", x, y, w, h, { fill: opts.fill ?? C.ph, borderRadius: opts.radius ?? 12 }, el);
  if (opts.noIcon) return [box];
  const s = Math.round(Math.min(w, h) * 0.28);
  return [box, icon("image", x + (w - s) / 2, y + (h - s) / 2, s, C.muted, el)];
}

/** Pill nhỏ có chữ căn giữa (chip/tag/nút giả). */
export function chip(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  opts: { fill?: string; color?: string; fontSize?: number; fontWeight?: number } = {},
): SlideElement[] {
  const fontSize = opts.fontSize ?? 16;
  return [
    shape("pill", x, y, w, h, { fill: opts.fill ?? C.accentSoft }),
    text(x, y + (h - fontSize * 1.4) / 2, w, fontSize * 1.4 + 4, label, {
      fontSize,
      fontWeight: opts.fontWeight ?? 600,
      color: opts.color ?? C.accent,
      align: "center",
    }),
  ];
}

/** Vòng tròn số thứ tự (badge 1/2/3...). */
export function badge(
  x: number,
  y: number,
  size: number,
  label: string,
  opts: { fill?: string; color?: string; fontSize?: number } = {},
): SlideElement[] {
  const fontSize = opts.fontSize ?? Math.round(size * 0.42);
  return [
    shape("circle", x, y, size, size, { fill: opts.fill ?? C.accent }),
    text(x, y + (size - fontSize * 1.4) / 2, size, fontSize * 1.4 + 4, label, {
      fontSize,
      fontWeight: 700,
      color: opts.color ?? C.white,
      align: "center",
    }),
  ];
}

/** Tiêu đề trang chuẩn (trên cùng) + gạch accent. */
export function titleBlock(title = "Tiêu đề", sub?: string): SlideElement[] {
  const els: SlideElement[] = [
    heading(80, 52, 1120, 62, title, { fontSize: 44 }),
    line(80, 124, 64, 6, C.accent),
  ];
  if (sub) els.push(text(80, 140, 1120, 32, sub, { fontSize: 18, color: C.muted }));
  return els;
}

/** Gom element (chấp nhận mảng lồng), gán id mới + zIndex theo thứ tự, tạo Slide. */
export function slide(bg: string, parts: (SlideElement | SlideElement[])[]): Slide {
  const elements = parts.flat().map((el, i) => ({
    ...el,
    id: crypto.randomUUID(),
    zIndex: i + 1,
  }));
  return {
    id: crypto.randomUUID(),
    background: bg.includes("gradient(")
      ? { type: "gradient", value: bg }
      : { type: "color", value: bg },
    elements,
  };
}
