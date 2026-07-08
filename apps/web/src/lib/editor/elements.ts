import type {
  IconElement,
  ImageElement,
  Position,
  ShapeElement,
  SlideElement,
  TextElement,
} from "@repo/shared";

function nextZIndex(elements: SlideElement[]): number {
  return elements.length === 0 ? 1 : Math.max(...elements.map((e) => e.zIndex)) + 1;
}

const CENTER: Position = { x: 490, y: 310 }; // gần tâm khung 1280×720

export function newTextElement(elements: SlideElement[], position = CENTER): TextElement {
  return {
    id: crypto.randomUUID(),
    type: "text",
    position,
    size: { width: 300, height: 60 },
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: {
      content: "Nhập nội dung...",
      fontFamily: "Inter, sans-serif",
      fontSize: 28,
      fontWeight: 400,
      color: "#111827",
      align: "left",
      lineHeight: 1.4,
    },
  };
}

export function newShapeElement(
  elements: SlideElement[],
  shape: ShapeElement["props"]["shape"],
  size: { width: number; height: number },
  position = CENTER,
): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    position,
    size,
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: {
      shape,
      fill: "#6366f1",
      borderRadius: shape === "rect" ? 8 : undefined,
    },
  };
}

/** Nhân bản element: id mới, lệch vị trí, nằm trên cùng. */
export function duplicateElement(element: SlideElement, elements: SlideElement[]): SlideElement {
  const clone = structuredClone(element);
  clone.id = crypto.randomUUID();
  clone.position = { x: element.position.x + 24, y: element.position.y + 24 };
  clone.zIndex = nextZIndex(elements);
  return clone;
}

export function newIconElement(
  elements: SlideElement[],
  name: string,
  position = CENTER,
): IconElement {
  return {
    id: crypto.randomUUID(),
    type: "icon",
    position,
    size: { width: 80, height: 80 },
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: { name, color: "#111827" },
  };
}

export function newImageElement(
  elements: SlideElement[],
  asset: { id: string; url: string; width?: number | null; height?: number | null },
  position = CENTER,
): ImageElement {
  // Scale ảnh về bề rộng tối đa 480 giữ tỉ lệ
  const w = asset.width ?? 480;
  const h = asset.height ?? 320;
  const scale = Math.min(1, 480 / w);
  return {
    id: crypto.randomUUID(),
    type: "image",
    position,
    size: { width: Math.round(w * scale), height: Math.round(h * scale) },
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: { assetId: asset.id, url: asset.url, objectFit: "cover" },
  };
}
