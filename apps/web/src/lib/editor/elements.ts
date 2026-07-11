import type {
  ChartElement,
  ChartType,
  IconElement,
  ImageElement,
  MediaElement,
  MediaKind,
  Position,
  ShapeElement,
  SlideElement,
  TableElement,
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

export function newTableElement(elements: SlideElement[], position = { x: 240, y: 200 }): TableElement {
  return {
    id: crypto.randomUUID(),
    type: "table",
    position,
    size: { width: 720, height: 320 },
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: {
      rows: [
        ["Cột 1", "Cột 2", "Cột 3"],
        ["Dữ liệu", "Dữ liệu", "Dữ liệu"],
        ["Dữ liệu", "Dữ liệu", "Dữ liệu"],
        ["Dữ liệu", "Dữ liệu", "Dữ liệu"],
      ],
      headerRow: true,
    },
  };
}

/** Dữ liệu mẫu khi chèn chart mới — đổi trong Inspector. */
export function defaultChartProps(chartType: ChartType): ChartElement["props"] {
  const labels = ["T1", "T2", "T3", "T4"];
  switch (chartType) {
    case "bar":
      return {
        chartType,
        labels,
        series: [
          { name: "Chuỗi A", values: [42, 68, 55, 90] },
          { name: "Chuỗi B", values: [30, 45, 62, 58] },
        ],
        showLegend: true,
      };
    case "line":
      return {
        chartType,
        labels,
        series: [{ name: "Xu hướng", values: [24, 52, 41, 88] }],
        showLegend: false,
        smooth: true,
      };
    case "area":
      return {
        chartType,
        labels,
        series: [{ name: "Tăng trưởng", values: [18, 34, 56, 92] }],
        showLegend: false,
        smooth: true,
      };
    case "pie":
      return {
        chartType,
        slices: [
          { label: "Nhóm A", value: 45 },
          { label: "Nhóm B", value: 30 },
          { label: "Nhóm C", value: 25 },
        ],
        showLegend: true,
        showValues: true,
      };
    case "donut":
      return {
        chartType,
        slices: [
          { label: "Hoàn thành", value: 68 },
          { label: "Đang làm", value: 22 },
          { label: "Chưa bắt đầu", value: 10 },
        ],
        showLegend: true,
        showValues: true,
      };
  }
}

export function newChartElement(
  elements: SlideElement[],
  chartType: ChartType,
  position = { x: 320, y: 160 },
): ChartElement {
  return {
    id: crypto.randomUUID(),
    type: "chart",
    position,
    size: { width: 640, height: 400 },
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: defaultChartProps(chartType),
  };
}

/** Media placeholder — chọn nguồn (URL/upload) ở Inspector sau khi chèn. */
export function newMediaElement(
  elements: SlideElement[],
  kind: MediaKind,
  position = { x: 320, y: 180 },
): MediaElement {
  return {
    id: crypto.randomUUID(),
    type: "media",
    position,
    // 16:9 cho video/embed; audio là thanh ngang thấp
    size: kind === "audio" ? { width: 560, height: 72 } : { width: 640, height: 360 },
    rotation: 0,
    zIndex: nextZIndex(elements),
    props: { kind, url: "", controls: true },
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
