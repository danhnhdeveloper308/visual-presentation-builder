import type { ChartProps } from "@repo/shared";
import {
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
  areaPath,
  axisDomain,
  chartColor,
  chartLegendItems,
  formatChartValue,
  linePath,
  niceTicks,
  pieSlices,
  seriesValue,
  type ChartPoint,
} from "@/lib/editor/charts";

/**
 * Render chart bằng SVG thuần (không lib ngoài) — dùng CHUNG cho canvas editor
 * lẫn SlidePreview/thumbnail. `width`/`height` là kích thước LOGIC của element;
 * svg co giãn 100% theo wrapper nên zoom không ảnh hưởng.
 */

const FONT = "Inter, sans-serif";
const LEGEND_H = 30;

export function ChartContent({
  props,
  width,
  height,
}: {
  props: ChartProps;
  width: number;
  height: number;
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <ChartBody props={props} width={width} height={height} />
    </svg>
  );
}

function ChartBody({ props, width, height }: { props: ChartProps; width: number; height: number }) {
  const legendItems = props.showLegend ? chartLegendItems(props) : [];
  const bodyH = height - (legendItems.length > 0 ? LEGEND_H : 0);

  return (
    <>
      {props.chartType === "pie" || props.chartType === "donut" ? (
        <PieBody props={props} width={width} height={bodyH} />
      ) : (
        <AxisBody props={props} width={width} height={bodyH} />
      )}
      {legendItems.length > 0 && <Legend items={legendItems} width={width} y={height - LEGEND_H / 2} textColor={pickTextColor(props)} />}
    </>
  );
}

function pickTextColor(props: ChartProps): string {
  return props.textColor ?? CHART_TEXT_COLOR;
}

function Legend({
  items,
  width,
  y,
  textColor,
}: {
  items: { label: string; color: string }[];
  width: number;
  y: number;
  textColor: string;
}) {
  // Ước lượng bề rộng từng item để căn giữa cả hàng (7px/ký tự + ô màu + khoảng cách)
  const widths = items.map((it) => 16 + Math.min(it.label.length, 24) * 7 + 14);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = Math.max(4, (width - total) / 2);
  return (
    <g>
      {items.map((it, i) => {
        const itemX = x;
        x += widths[i]!;
        return (
          <g key={i}>
            <rect x={itemX} y={y - 5} width={10} height={10} rx={2} fill={it.color} />
            <text x={itemX + 16} y={y + 4} fontSize={12} fontFamily={FONT} fill={textColor}>
              {it.label.length > 24 ? `${it.label.slice(0, 23)}…` : it.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ========================= Pie / Donut ========================= */

function PieBody({
  props,
  width,
  height,
}: {
  props: Extract<ChartProps, { chartType: "pie" | "donut" }>;
  width: number;
  height: number;
}) {
  const textColor = pickTextColor(props);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.max(10, Math.min(width, height) / 2 - 8);
  const innerRatio = props.chartType === "donut" ? (props.innerRadiusRatio ?? 0.6) : 0;
  const geoms = pieSlices(props.slices, cx, cy, r, innerRatio);

  if (geoms.length === 0) {
    return <EmptyNote width={width} height={height} textColor={textColor} />;
  }

  return (
    <g>
      {geoms.map((g, i) => (
        <path key={i} d={g.d} fill={g.color} stroke="#ffffff" strokeWidth={2} />
      ))}
      {props.showValues &&
        geoms
          .filter((g) => g.ratio >= 0.05)
          .map((g, i) => (
            <text
              key={i}
              x={g.labelX}
              y={g.labelY + 5}
              fontSize={14}
              fontWeight={700}
              fontFamily={FONT}
              fill="#ffffff"
              textAnchor="middle"
            >
              {`${Math.round(g.ratio * 100)}%`}
            </text>
          ))}
    </g>
  );
}

function EmptyNote({ width, height, textColor }: { width: number; height: number; textColor: string }) {
  return (
    <text
      x={width / 2}
      y={height / 2}
      fontSize={14}
      fontFamily={FONT}
      fill={textColor}
      textAnchor="middle"
    >
      Không có dữ liệu
    </text>
  );
}

/* ========================= Bar / Line / Area ========================= */

type AxisProps = Extract<ChartProps, { chartType: "bar" | "line" | "area" }>;

function AxisBody({ props, width, height }: { props: AxisProps; width: number; height: number }) {
  const textColor = pickTextColor(props);
  const gridColor = props.gridColor ?? CHART_GRID_COLOR;
  const horizontal = props.chartType === "bar" && props.horizontal === true;

  const domain = axisDomain(props);
  const ticks = niceTicks(domain.min, domain.max);
  const axisMin = ticks[0]!;
  const axisMax = ticks[ticks.length - 1]!;
  const span = axisMax - axisMin || 1;

  // Lề: trục giá trị cần chỗ cho nhãn số; trục category cần chỗ cho tên nhóm
  const margin = horizontal
    ? { left: 8 + maxLabelWidth(props.labels), right: 14, top: 8, bottom: 22 }
    : { left: 12 + maxTickWidth(ticks), right: 8, top: 10, bottom: 24 };
  const plotW = Math.max(10, width - margin.left - margin.right);
  const plotH = Math.max(10, height - margin.top - margin.bottom);
  const catCount = props.labels.length;

  // Toạ độ theo giá trị (dọc thường / ngang khi horizontal bar)
  const yOf = (v: number) => margin.top + plotH * (1 - (v - axisMin) / span);
  const xOf = (v: number) => margin.left + plotW * ((v - axisMin) / span);
  const catCenter = (i: number) =>
    horizontal
      ? margin.top + (plotH * (i + 0.5)) / catCount
      : margin.left + (plotW * (i + 0.5)) / catCount;

  return (
    <g>
      {/* Grid + nhãn mốc giá trị */}
      {ticks.map((t, i) =>
        horizontal ? (
          <g key={i}>
            <line x1={xOf(t)} y1={margin.top} x2={xOf(t)} y2={margin.top + plotH} stroke={gridColor} strokeWidth={1} />
            <text x={xOf(t)} y={margin.top + plotH + 16} fontSize={12} fontFamily={FONT} fill={textColor} textAnchor="middle">
              {formatChartValue(t)}
            </text>
          </g>
        ) : (
          <g key={i}>
            <line x1={margin.left} y1={yOf(t)} x2={margin.left + plotW} y2={yOf(t)} stroke={gridColor} strokeWidth={1} />
            <text x={margin.left - 6} y={yOf(t) + 4} fontSize={12} fontFamily={FONT} fill={textColor} textAnchor="end">
              {formatChartValue(t)}
            </text>
          </g>
        ),
      )}

      {/* Nhãn category */}
      {props.labels.map((label, i) =>
        horizontal ? (
          <text key={i} x={margin.left - 6} y={catCenter(i) + 4} fontSize={13} fontFamily={FONT} fill={textColor} textAnchor="end">
            {label}
          </text>
        ) : (
          <text key={i} x={catCenter(i)} y={margin.top + plotH + 17} fontSize={13} fontFamily={FONT} fill={textColor} textAnchor="middle">
            {label}
          </text>
        ),
      )}

      {props.chartType === "bar" ? (
        <Bars
          props={props}
          horizontal={horizontal}
          catCount={catCount}
          plot={{ left: margin.left, top: margin.top, w: plotW, h: plotH }}
          xOf={xOf}
          yOf={yOf}
          textColor={textColor}
        />
      ) : (
        <LinesOrAreas props={props} catCenter={catCenter} yOf={yOf} textColor={textColor} />
      )}
    </g>
  );
}

function maxTickWidth(ticks: number[]): number {
  return Math.max(...ticks.map((t) => formatChartValue(t).length)) * 7 + 8;
}

function maxLabelWidth(labels: string[]): number {
  return Math.min(120, Math.max(...labels.map((l) => l.length)) * 7 + 10);
}

function Bars({
  props,
  horizontal,
  catCount,
  plot,
  xOf,
  yOf,
  textColor,
}: {
  props: Extract<AxisProps, { chartType: "bar" }>;
  horizontal: boolean;
  catCount: number;
  plot: { left: number; top: number; w: number; h: number };
  xOf: (v: number) => number;
  yOf: (v: number) => number;
  textColor: string;
}) {
  const seriesCount = props.series.length;
  const stacked = props.stacked === true;
  const groupSize = (horizontal ? plot.h : plot.w) / catCount;
  const innerSize = groupSize * 0.72;
  const barSize = stacked ? innerSize : innerSize / seriesCount;

  const bars: React.ReactNode[] = [];
  for (let i = 0; i < catCount; i++) {
    let posAcc = 0;
    let negAcc = 0;
    for (let s = 0; s < seriesCount; s++) {
      const series = props.series[s]!;
      const v = seriesValue(series, i);
      const color = chartColor(series.color, s);
      // đầu/cuối thanh theo giá trị (cộng dồn khi stacked)
      let from = 0;
      let to = v;
      if (stacked) {
        if (v >= 0) {
          from = posAcc;
          to = posAcc + v;
          posAcc = to;
        } else {
          from = negAcc;
          to = negAcc + v;
          negAcc = to;
        }
      }
      const catStart =
        (horizontal ? plot.top : plot.left) +
        i * groupSize +
        (groupSize - innerSize) / 2 +
        (stacked ? 0 : s * barSize);

      if (horizontal) {
        const x0 = xOf(from);
        const x1 = xOf(to);
        bars.push(
          <rect
            key={`${i}-${s}`}
            x={Math.min(x0, x1)}
            y={catStart}
            width={Math.max(0.5, Math.abs(x1 - x0))}
            height={barSize}
            rx={2}
            fill={color}
          />,
        );
        if (props.showValues && !stacked) {
          bars.push(
            <text key={`v${i}-${s}`} x={Math.max(x0, x1) + 4} y={catStart + barSize / 2 + 4} fontSize={12} fontFamily={FONT} fill={textColor}>
              {formatChartValue(v)}
            </text>,
          );
        }
      } else {
        const y0 = yOf(from);
        const y1 = yOf(to);
        bars.push(
          <rect
            key={`${i}-${s}`}
            x={catStart}
            y={Math.min(y0, y1)}
            width={barSize}
            height={Math.max(0.5, Math.abs(y1 - y0))}
            rx={2}
            fill={color}
          />,
        );
        if (props.showValues && !stacked) {
          bars.push(
            <text key={`v${i}-${s}`} x={catStart + barSize / 2} y={Math.min(y0, y1) - 4} fontSize={12} fontFamily={FONT} fill={textColor} textAnchor="middle">
              {formatChartValue(v)}
            </text>,
          );
        }
      }
    }
  }
  return <g>{bars}</g>;
}

function LinesOrAreas({
  props,
  catCenter,
  yOf,
  textColor,
}: {
  props: Extract<AxisProps, { chartType: "line" | "area" }>;
  catCenter: (i: number) => number;
  yOf: (v: number) => number;
  textColor: string;
}) {
  const isArea = props.chartType === "area";
  const smooth = props.smooth === true;
  const showDots = props.chartType === "line" ? props.showDots !== false : false;
  const baselineY = yOf(0);

  return (
    <g>
      {props.series.map((series, s) => {
        const color = chartColor(series.color, s);
        const points: ChartPoint[] = props.labels.map((_, i) => ({
          x: catCenter(i),
          y: yOf(seriesValue(series, i)),
        }));
        return (
          <g key={s}>
            {isArea && <path d={areaPath(points, baselineY, smooth)} fill={color} opacity={0.22} />}
            <path d={linePath(points, smooth)} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
            {showDots &&
              points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#ffffff" stroke={color} strokeWidth={2.5} />
              ))}
            {props.showValues &&
              points.map((p, i) => (
                <text key={`v${i}`} x={p.x} y={p.y - 9} fontSize={12} fontFamily={FONT} fill={textColor} textAnchor="middle">
                  {formatChartValue(seriesValue(series, i))}
                </text>
              ))}
          </g>
        );
      })}
    </g>
  );
}
