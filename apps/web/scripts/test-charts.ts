/**
 * Test Phase 2c (chạy: pnpm --filter web exec jiti scripts/test-charts.ts):
 * schema Table/Chart, toán dựng chart (niceTicks/linePath/pieSlices/axisDomain/convert),
 * factory element mặc định, và 151 layout (gồm Statistics/Table mới) parse schema OK.
 */
import {
  chartPropsSchema,
  presentationSchema,
  slideElementSchema,
  tableElementSchema,
  type ChartProps,
} from "@repo/shared";
import {
  axisDomain,
  chartColor,
  convertChartType,
  formatChartValue,
  linePath,
  areaPath,
  niceTicks,
  pieSlices,
} from "../src/lib/editor/charts";
import { defaultChartProps, newChartElement, newTableElement } from "../src/lib/editor/elements";
import { LAYOUT_GROUPS, LAYOUT_COUNT, buildLayoutSlide, LAYOUT_MAP } from "../src/lib/editor/layouts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error(`✗ ${name}:`, e instanceof Error ? e.message : e);
  }
}

function assert(cond: boolean, msg = "assert failed") {
  if (!cond) throw new Error(msg);
}

function eq<T>(actual: T, expected: T, msg?: string) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg ?? "eq"}: ${a} !== ${b}`);
}

const base = {
  id: "el1",
  position: { x: 0, y: 0 },
  size: { width: 400, height: 300 },
  rotation: 0,
  zIndex: 1,
};

/* ---------- schema ---------- */

test("table hợp lệ parse OK", () => {
  tableElementSchema.parse({
    ...base,
    type: "table",
    props: { rows: [["a", "b"], ["1", "2"]], headerRow: true },
  });
});

test("table hàng lệch số cột → fail", () => {
  const r = tableElementSchema.safeParse({
    ...base,
    type: "table",
    props: { rows: [["a", "b"], ["1"]] },
  });
  assert(!r.success);
});

test("table quá 10 cột → fail", () => {
  const r = tableElementSchema.safeParse({
    ...base,
    type: "table",
    props: { rows: [Array(11).fill("x")] },
  });
  assert(!r.success);
});

for (const t of ["bar", "line", "area", "pie", "donut"] as const) {
  test(`chart ${t} mặc định parse OK`, () => {
    chartPropsSchema.parse(defaultChartProps(t));
    slideElementSchema.parse(newChartElement([], t));
  });
}

test("chartType lạ → fail", () => {
  const r = chartPropsSchema.safeParse({ chartType: "radar", labels: ["a"], series: [] });
  assert(!r.success);
});

test("donut innerRadiusRatio ngoài khoảng → fail", () => {
  const r = chartPropsSchema.safeParse({
    chartType: "donut",
    slices: [{ label: "a", value: 1 }],
    innerRadiusRatio: 0.95,
  });
  assert(!r.success);
});

test("newTableElement parse slideElementSchema", () => {
  slideElementSchema.parse(newTableElement([]));
});

/* ---------- niceTicks / format ---------- */

test("niceTicks 0..100 chứa 0 và phủ max", () => {
  const t = niceTicks(0, 100);
  assert(t.includes(0), "chứa 0");
  assert(t[t.length - 1]! >= 100, "tick cuối >= max");
});

test("niceTicks miền âm-dương chứa 0, phủ cả 2 đầu", () => {
  const t = niceTicks(-30, 80);
  assert(t.includes(0));
  assert(t[0]! <= -30 && t[t.length - 1]! >= 80);
});

test("niceTicks toàn 0 → [0,1]", () => eq(niceTicks(0, 0), [0, 1]));

test("formatChartValue", () => {
  eq(formatChartValue(45), "45");
  eq(formatChartValue(1200), "1.2K");
  eq(formatChartValue(3_500_000), "3.5M");
  eq(formatChartValue(-2500), "-2.5K");
});

/* ---------- path ---------- */

test("linePath thẳng dùng L, smooth dùng C", () => {
  const pts = [
    { x: 0, y: 10 },
    { x: 50, y: 20 },
    { x: 100, y: 5 },
  ];
  const straight = linePath(pts);
  assert(straight.startsWith("M 0 10") && straight.includes(" L 50 20"), straight);
  const smooth = linePath(pts, true);
  assert(smooth.includes(" C "), smooth);
  assert(!smooth.includes(" L "), "smooth không có L");
});

test("areaPath đóng về baseline + Z", () => {
  const d = areaPath([{ x: 0, y: 10 }, { x: 100, y: 5 }], 200);
  assert(d.includes("L 100 200") && d.includes("L 0 200") && d.trimEnd().endsWith("Z"), d);
});

/* ---------- pie ---------- */

test("pieSlices 50/50 → ratio 0.5, đủ 2 lát", () => {
  const g = pieSlices(
    [
      { label: "a", value: 5 },
      { label: "b", value: 5 },
    ],
    100,
    100,
    80,
  );
  eq(g.length, 2);
  assert(Math.abs(g[0]!.ratio - 0.5) < 1e-9);
  // lát 1 từ 12h → 6h (chiều kim đồng hồ) nằm bên phải tâm
  assert(g[0]!.labelX > 100, "label lát 1 bên phải");
  assert(g[1]!.labelX < 100, "label lát 2 bên trái");
});

test("pieSlices tổng 0 → rỗng", () => {
  eq(pieSlices([{ label: "a", value: 0 }], 0, 0, 50).length, 0);
});

test("donut path có 2 cung (arc ngoài + trong)", () => {
  const g = pieSlices([{ label: "a", value: 1 }, { label: "b", value: 1 }], 0, 0, 100, 0.5);
  const arcs = g[0]!.d.match(/A /g) ?? [];
  eq(arcs.length, 2, "2 arc");
});

test("pie 1 lát 100% không NaN", () => {
  const g = pieSlices([{ label: "a", value: 7 }], 50, 50, 40);
  assert(!g[0]!.d.includes("NaN"), g[0]!.d);
  assert(Math.abs(g[0]!.ratio - 1) < 1e-9);
});

/* ---------- domain / convert ---------- */

test("axisDomain line lấy min/max mọi series", () => {
  const d = axisDomain({
    chartType: "line",
    labels: ["a", "b"],
    series: [
      { name: "s1", values: [-5, 10] },
      { name: "s2", values: [3, 20] },
    ],
  });
  eq(d, { min: -5, max: 20 });
});

test("axisDomain bar stacked cộng dồn theo dấu", () => {
  const d = axisDomain({
    chartType: "bar",
    stacked: true,
    labels: ["a"],
    series: [
      { name: "s1", values: [10] },
      { name: "s2", values: [-4] },
      { name: "s3", values: [7] },
    ],
  });
  eq(d, { min: -4, max: 17 });
});

test("series thiếu giá trị tính 0 trong domain", () => {
  const d = axisDomain({
    chartType: "bar",
    labels: ["a", "b", "c"],
    series: [{ name: "s", values: [5] }],
  });
  eq(d, { min: 0, max: 5 });
});

test("convert bar→pie lấy series đầu", () => {
  const bar = defaultChartProps("bar");
  const pie = convertChartType(bar, "pie");
  assert(pie.chartType === "pie");
  if (pie.chartType === "pie" && bar.chartType === "bar") {
    eq(pie.slices.map((s) => s.label), bar.labels);
    eq(pie.slices.map((s) => s.value), bar.series[0]!.values);
  }
  chartPropsSchema.parse(pie);
});

test("convert pie→line giữ nhãn + giá trị", () => {
  const pie = defaultChartProps("pie");
  const line = convertChartType(pie, "line");
  assert(line.chartType === "line");
  if (line.chartType === "line" && pie.chartType === "pie") {
    eq(line.labels, pie.slices.map((s) => s.label));
    eq(line.series[0]!.values, pie.slices.map((s) => s.value));
  }
  chartPropsSchema.parse(line);
});

test("convert giữa mọi cặp loại đều parse schema", () => {
  const types = ["bar", "line", "area", "pie", "donut"] as const;
  for (const from of types) {
    for (const to of types) {
      const out = convertChartType(defaultChartProps(from) as ChartProps, to);
      chartPropsSchema.parse(out);
      eq(out.chartType, to, `${from}→${to}`);
    }
  }
});

test("chartColor fallback theo index, ưu tiên explicit", () => {
  eq(chartColor("#123456", 3), "#123456");
  assert(chartColor(undefined, 0) !== chartColor(undefined, 1));
});

/* ---------- layouts ---------- */

test(`đủ ${LAYOUT_COUNT} layout parse presentationSchema`, () => {
  let count = 0;
  for (const group of LAYOUT_GROUPS) {
    for (const def of group.layouts) {
      const slide = buildLayoutSlide(def.id);
      assert(slide != null, `build ${def.id}`);
      presentationSchema.parse({ schemaVersion: 1, themeId: null, slides: [slide!] });
      count++;
    }
  }
  eq(count, LAYOUT_COUNT, "tổng layout");
});

test("layout Statistics dùng chart THẬT (trừ big-number/metrics/progress)", () => {
  for (const id of ["stats-kpi-dashboard", "stats-pie-summary", "stats-line-chart", "stats-bar-chart", "stats-area-chart", "stats-donut-chart"]) {
    const s = buildLayoutSlide(id)!;
    assert(s.elements.some((e) => e.type === "chart"), `${id} có chart`);
  }
});

test("layout Table dùng bảng THẬT", () => {
  for (const id of ["table-simple", "table-zebra", "table-comparison", "table-pricing", "table-schedule", "table-calendar"]) {
    const s = buildLayoutSlide(id)!;
    assert(s.elements.some((e) => e.type === "table"), `${id} có table`);
  }
});

test("áp layout 2 lần sinh id khác nhau", () => {
  const a = LAYOUT_MAP.get("stats-bar-chart")!.build();
  const b = LAYOUT_MAP.get("stats-bar-chart")!.build();
  assert(a.id !== b.id && a.elements[0]!.id !== b.elements[0]!.id);
});

console.log(`\n${passed}/${passed + failed} pass${failed ? ` — ${failed} FAIL` : ""}`);
if (failed > 0) process.exit(1);
