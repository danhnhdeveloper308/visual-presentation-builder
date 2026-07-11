import type { ChartProps, ChartSeries, ChartSlice } from "@repo/shared";

/**
 * Toán dựng chart (hàm THUẦN, có test riêng chạy jiti) — component SVG chỉ việc vẽ
 * theo kết quả tính ở đây. Toạ độ là toạ độ logic bên trong element (0,0 → w,h).
 */

/** Bảng màu series/lát mặc định khi không khai báo `color`. */
export const DEFAULT_CHART_COLORS = [
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#ef4444", // red
  "#84cc16", // lime
] as const;

export const CHART_TEXT_COLOR = "#64748b";
export const CHART_GRID_COLOR = "#e2e8f0";

export function chartColor(explicit: string | undefined, index: number): string {
  return explicit ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]!;
}

/** Giá trị của series tại category i — thiếu (values ngắn hơn labels) tính là 0. */
export function seriesValue(series: ChartSeries, i: number): number {
  return series.values[i] ?? 0;
}

/**
 * Tính "nice ticks" cho trục giá trị: trả về mảng mốc từ min→max (luôn chứa 0),
 * bước là số đẹp 1/2/5×10^n, tối đa ~5 mốc.
 */
export function niceTicks(minValue: number, maxValue: number, tickCount = 5): number[] {
  const lo = Math.min(0, minValue);
  const hi = Math.max(0, maxValue);
  if (lo === 0 && hi === 0) return [0, 1];
  const span = hi - lo || Math.abs(hi) || 1;
  const rawStep = span / Math.max(1, tickCount - 1);
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  // đi bằng số bước nguyên tránh sai số cộng dồn float
  const n = Math.round((end - start) / step);
  for (let i = 0; i <= n; i++) {
    const v = start + i * step;
    ticks.push(Math.abs(v) < step * 1e-6 ? 0 : Number(v.toPrecision(12)));
  }
  return ticks;
}

/** Format số gọn cho nhãn trục/giá trị: 1200 → "1.2K", 3500000 → "3.5M". */
export function formatChartValue(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${trimZero(v / 1_000_000)}M`;
  if (abs >= 1_000) return `${trimZero(v / 1_000)}K`;
  return trimZero(v);
}

function trimZero(v: number): string {
  return String(Number(v.toFixed(2)));
}

export type ChartPoint = { x: number; y: number };

/**
 * Path SVG nối các điểm; `smooth` dùng cubic bezier control point ở giữa 2 điểm
 * (tiếp tuyến ngang — kiểu "smoothstep" của các chart lib).
 */
export function linePath(points: ChartPoint[], smooth = false): string {
  if (points.length === 0) return "";
  const first = points[0]!;
  let d = `M ${round2(first.x)} ${round2(first.y)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    if (smooth) {
      const midX = round2((prev.x + curr.x) / 2);
      d += ` C ${midX} ${round2(prev.y)}, ${midX} ${round2(curr.y)}, ${round2(curr.x)} ${round2(curr.y)}`;
    } else {
      d += ` L ${round2(curr.x)} ${round2(curr.y)}`;
    }
  }
  return d;
}

/** Path vùng kín cho area chart: đường line + đóng xuống baseline. */
export function areaPath(points: ChartPoint[], baselineY: number, smooth = false): string {
  if (points.length === 0) return "";
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return `${linePath(points, smooth)} L ${round2(last.x)} ${round2(baselineY)} L ${round2(first.x)} ${round2(baselineY)} Z`;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export type PieSliceGeom = {
  slice: ChartSlice;
  color: string;
  /** Path SVG của lát (kể cả lỗ donut). */
  d: string;
  /** Tỉ lệ 0–1. */
  ratio: number;
  /** Toạ độ đặt nhãn % (giữa lát). */
  labelX: number;
  labelY: number;
};

/**
 * Dựng hình học pie/donut: mỗi lát là path arc từ góc bắt đầu → kết thúc (bắt đầu từ 12h,
 * theo chiều kim đồng hồ). `innerRatio` 0 = pie đặc; >0 = donut.
 */
export function pieSlices(
  slices: ChartSlice[],
  cx: number,
  cy: number,
  r: number,
  innerRatio = 0,
): PieSliceGeom[] {
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  if (total <= 0) return [];
  const inner = r * innerRatio;
  let angle = -Math.PI / 2; // bắt đầu 12h
  return slices.map((slice, i) => {
    const ratio = Math.max(0, slice.value) / total;
    const start = angle;
    // chặn 0.9999 vòng: lát 100% vẽ full circle bằng 2 arc nửa vòng vẫn đúng nhờ largeArc
    const sweep = ratio * Math.PI * 2 * 0.99999;
    const end = start + sweep;
    angle = start + ratio * Math.PI * 2;

    const x0 = cx + r * Math.cos(start);
    const y0 = cy + r * Math.sin(start);
    const x1 = cx + r * Math.cos(end);
    const y1 = cy + r * Math.sin(end);
    const largeArc = sweep > Math.PI ? 1 : 0;

    let d: string;
    if (inner > 0) {
      const xi0 = cx + inner * Math.cos(end);
      const yi0 = cy + inner * Math.sin(end);
      const xi1 = cx + inner * Math.cos(start);
      const yi1 = cy + inner * Math.sin(start);
      d = [
        `M ${round2(x0)} ${round2(y0)}`,
        `A ${round2(r)} ${round2(r)} 0 ${largeArc} 1 ${round2(x1)} ${round2(y1)}`,
        `L ${round2(xi0)} ${round2(yi0)}`,
        `A ${round2(inner)} ${round2(inner)} 0 ${largeArc} 0 ${round2(xi1)} ${round2(yi1)}`,
        "Z",
      ].join(" ");
    } else {
      d = [
        `M ${round2(cx)} ${round2(cy)}`,
        `L ${round2(x0)} ${round2(y0)}`,
        `A ${round2(r)} ${round2(r)} 0 ${largeArc} 1 ${round2(x1)} ${round2(y1)}`,
        "Z",
      ].join(" ");
    }

    const mid = start + sweep / 2;
    const labelR = inner > 0 ? (r + inner) / 2 : r * 0.62;
    return {
      slice,
      color: chartColor(slice.color, i),
      d,
      ratio,
      labelX: round2(cx + labelR * Math.cos(mid)),
      labelY: round2(cy + labelR * Math.sin(mid)),
    };
  });
}

/** Miền giá trị [min, max] của chart có trục (gồm cả stacked bar). */
export function axisDomain(props: Extract<ChartProps, { labels: string[] }>): {
  min: number;
  max: number;
} {
  const catCount = props.labels.length;
  let min = 0;
  let max = 0;
  if (props.chartType === "bar" && props.stacked) {
    for (let i = 0; i < catCount; i++) {
      let pos = 0;
      let neg = 0;
      for (const s of props.series) {
        const v = seriesValue(s, i);
        if (v >= 0) pos += v;
        else neg += v;
      }
      max = Math.max(max, pos);
      min = Math.min(min, neg);
    }
  } else {
    for (const s of props.series) {
      for (let i = 0; i < catCount; i++) {
        const v = seriesValue(s, i);
        max = Math.max(max, v);
        min = Math.min(min, v);
      }
    }
  }
  return { min, max };
}

/** Nhãn legend của chart bất kỳ (series hoặc slices). */
export function chartLegendItems(props: ChartProps): { label: string; color: string }[] {
  if (props.chartType === "pie" || props.chartType === "donut") {
    return props.slices.map((s, i) => ({ label: s.label, color: chartColor(s.color, i) }));
  }
  return props.series.map((s, i) => ({ label: s.name, color: chartColor(s.color, i) }));
}

/**
 * Đổi loại chart GIỮ dữ liệu: trục↔trục giữ nguyên labels/series;
 * trục→pie/donut lấy series đầu làm lát; pie/donut→trục tách lát thành labels + 1 series.
 */
export function convertChartType(props: ChartProps, next: ChartProps["chartType"]): ChartProps {
  if (next === props.chartType) return props;
  const isPieLike = (t: ChartProps["chartType"]) => t === "pie" || t === "donut";

  const common = {
    showLegend: props.showLegend,
    showValues: props.showValues,
    textColor: props.textColor,
  };

  if (isPieLike(next)) {
    const slices: ChartSlice[] =
      props.chartType === "pie" || props.chartType === "donut"
        ? props.slices
        : props.labels.map((label, i) => ({
            label,
            value: Math.max(0, seriesValue(props.series[0]!, i)),
            color: undefined,
          }));
    return next === "donut"
      ? { chartType: "donut", slices, ...common, innerRadiusRatio: 0.6 }
      : { chartType: "pie", slices, ...common };
  }

  const axis: { labels: string[]; series: ChartSeries[] } =
    props.chartType === "pie" || props.chartType === "donut"
      ? {
          labels: props.slices.map((s) => s.label),
          series: [{ name: "Dữ liệu", values: props.slices.map((s) => s.value) }],
        }
      : { labels: props.labels, series: props.series };

  const gridColor = "gridColor" in props ? props.gridColor : undefined;
  switch (next) {
    case "bar":
      return { chartType: "bar", ...axis, ...common, gridColor };
    case "line":
      return { chartType: "line", ...axis, ...common, gridColor, smooth: true };
    case "area":
      return { chartType: "area", ...axis, ...common, gridColor, smooth: true };
  }
}
