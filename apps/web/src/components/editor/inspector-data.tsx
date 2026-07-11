"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import {
  LIMITS,
  type ChartElement,
  type ChartProps,
  type ChartSeries,
  type ChartType,
  type TableElement,
} from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { chartColor, convertChartType, seriesValue } from "@/lib/editor/charts";
import {
  clampPos,
  clearCellStyles,
  insertCol,
  insertRow,
  normalizeRange,
  patchCellStyles,
  removeCols,
  removeRows,
  type TableProps,
} from "@/lib/editor/table";
import { TABLE_DEFAULTS } from "./table-content";
import { useEditorStore } from "@/stores/useEditorStore";
import { useEditorUiStore } from "@/stores/useEditorUiStore";

/** Inspector cho element Table + Chart (Phase 2c) — tách file để inspector.tsx không phình. */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function useHistoryOnStart() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return { onFocus: () => pushHistory(), onPointerDown: () => pushHistory() };
}

/* ============================== Table ============================== */

export function TableInspector({ element, slideId }: { element: TableElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();
  const selection = useEditorUiStore((s) =>
    s.tableSelection?.elementId === element.id ? s.tableSelection : null,
  );
  const setTableSelection = useEditorUiStore((s) => s.setTableSelection);
  const p = element.props;
  const colCount = p.rows[0]?.length ?? 1;
  const style = p.style ?? {};
  const range = selection ? normalizeRange(selection.anchor, selection.focus) : null;
  const anchorStyle = selection ? p.cellStyles?.[selection.anchor.r]?.[selection.anchor.c] : null;

  function patch(props: Partial<TableElement["props"]>) {
    updateElement(slideId, element.id, (el) =>
      el.type === "table" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  /** Thay TOÀN BỘ props (kết quả từ lib table) + kẹp lại vùng chọn theo kích thước mới. */
  function setProps(next: TableProps, keepSelection = true) {
    updateElement(slideId, element.id, (el) =>
      el.type === "table" ? { ...el, props: next } : el,
    );
    if (selection) {
      if (!keepSelection) setTableSelection(null);
      else
        setTableSelection({
          elementId: element.id,
          anchor: clampPos(next, selection.anchor),
          focus: clampPos(next, selection.focus),
        });
    }
  }

  function patchStyle(next: Partial<NonNullable<TableElement["props"]["style"]>>) {
    patch({ style: { ...style, ...next } });
  }

  // Vị trí thao tác: có vùng chọn → theo vùng; không → cuối bảng (hành vi cũ)
  function addRow() {
    if (p.rows.length >= LIMITS.TABLE_ROWS_MAX) return;
    pushHistory();
    setProps(insertRow(p, range ? range.r2 + 1 : p.rows.length));
  }

  function removeRow() {
    if (p.rows.length <= 1) return;
    pushHistory();
    setProps(
      range ? removeRows(p, range.r1, range.r2) : removeRows(p, p.rows.length - 1, p.rows.length - 1),
    );
  }

  function addCol() {
    if (colCount >= LIMITS.TABLE_COLS_MAX) return;
    pushHistory();
    setProps(insertCol(p, range ? range.c2 + 1 : colCount));
  }

  function removeCol() {
    if (colCount <= 1) return;
    pushHistory();
    setProps(range ? removeCols(p, range.c1, range.c2) : removeCols(p, colCount - 1, colCount - 1));
  }

  const rowLabel = range ? (range.r1 === range.r2 ? `hàng ${range.r1 + 1}` : `hàng ${range.r1 + 1}–${range.r2 + 1}`) : "hàng cuối";
  const colLabel = range ? (range.c1 === range.c2 ? `cột ${range.c1 + 1}` : `cột ${range.c1 + 1}–${range.c2 + 1}`) : "cột cuối";

  return (
    <>
      <p className="text-muted-foreground text-xs">
        Nhấn đúp vào bảng để sửa ô; click/kéo chuột qua các ô để chọn vùng — thêm/xóa và tô màu áp
        vào đúng vùng đang chọn.
      </p>
      <Field
        label={
          range
            ? `Đang chọn: ${rowLabel}, ${colLabel}`
            : `Kích thước: ${p.rows.length} hàng × ${colCount} cột`
        }
      >
        <div className="grid grid-cols-2 gap-1">
          <Button variant="outline" size="sm" onClick={addRow} title={range ? `Chèn hàng dưới ${rowLabel}` : "Thêm hàng cuối"}>
            <Plus /> Hàng
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={removeRow}
            disabled={p.rows.length <= 1 || (range != null && range.r2 - range.r1 + 1 >= p.rows.length)}
            title={`Xóa ${rowLabel}`}
          >
            <Minus /> Hàng
          </Button>
          <Button variant="outline" size="sm" onClick={addCol} title={range ? `Chèn cột phải ${colLabel}` : "Thêm cột cuối"}>
            <Plus /> Cột
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={removeCol}
            disabled={colCount <= 1 || (range != null && range.c2 - range.c1 + 1 >= colCount)}
            title={`Xóa ${colLabel}`}
          >
            <Minus /> Cột
          </Button>
        </div>
      </Field>
      {range && (
        <Field label="Định dạng ô đang chọn">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nền ô">
              <Input
                type="color"
                value={anchorStyle?.bg ?? "#ffffff"}
                onFocus={history.onFocus}
                onChange={(e) => setProps(patchCellStyles(p, range, { bg: e.target.value }))}
                className="h-9 p-1"
              />
            </Field>
            <Field label="Chữ ô">
              <Input
                type="color"
                value={anchorStyle?.color ?? style.textColor ?? TABLE_DEFAULTS.textColor}
                onFocus={history.onFocus}
                onChange={(e) => setProps(patchCellStyles(p, range, { color: e.target.value }))}
                className="h-9 p-1"
              />
            </Field>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1"
            onClick={() => {
              pushHistory();
              setProps(clearCellStyles(p, range));
            }}
          >
            Xóa định dạng vùng chọn
          </Button>
        </Field>
      )}
      <Check
        label="Hàng đầu là header"
        checked={p.headerRow !== false}
        onChange={(v) => {
          pushHistory();
          patch({ headerRow: v });
        }}
      />
      <Check
        label="Kẻ sọc xen kẽ (zebra)"
        checked={style.zebraBg != null}
        onChange={(v) => {
          pushHistory();
          patchStyle({ zebraBg: v ? "#f1f5f9" : undefined });
        }}
      />
      {p.headerRow !== false && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Nền header">
            <Input
              type="color"
              value={style.headerBg ?? TABLE_DEFAULTS.headerBg}
              onFocus={history.onFocus}
              onChange={(e) => patchStyle({ headerBg: e.target.value })}
              className="h-9 p-1"
            />
          </Field>
          <Field label="Chữ header">
            <Input
              type="color"
              value={style.headerColor ?? TABLE_DEFAULTS.headerColor}
              onFocus={history.onFocus}
              onChange={(e) => patchStyle({ headerColor: e.target.value })}
              className="h-9 p-1"
            />
          </Field>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Màu chữ">
          <Input
            type="color"
            value={style.textColor ?? TABLE_DEFAULTS.textColor}
            onFocus={history.onFocus}
            onChange={(e) => patchStyle({ textColor: e.target.value })}
            className="h-9 p-1"
          />
        </Field>
        <Field label="Màu kẻ">
          <Input
            type="color"
            value={style.borderColor ?? TABLE_DEFAULTS.borderColor}
            onFocus={history.onFocus}
            onChange={(e) => patchStyle({ borderColor: e.target.value })}
            className="h-9 p-1"
          />
        </Field>
      </div>
      <Field label="Cỡ chữ">
        <Input
          type="number"
          min={8}
          max={60}
          value={style.fontSize ?? TABLE_DEFAULTS.fontSize}
          onFocus={history.onFocus}
          onChange={(e) => patchStyle({ fontSize: Number(e.target.value) || TABLE_DEFAULTS.fontSize })}
        />
      </Field>
    </>
  );
}

/* ============================== Chart ============================== */

const CHART_TYPE_OPTIONS: { type: ChartType; label: string }[] = [
  { type: "bar", label: "Cột" },
  { type: "line", label: "Đường" },
  { type: "area", label: "Vùng" },
  { type: "pie", label: "Tròn" },
  { type: "donut", label: "Donut" },
];

export function ChartInspector({ element, slideId }: { element: ChartElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const p = element.props;

  function setProps(next: ChartProps) {
    updateElement(slideId, element.id, (el) => (el.type === "chart" ? { ...el, props: next } : el));
  }

  /** patch các field chung tồn tại trên mọi biến thể. */
  function patchCommon(next: Partial<Pick<ChartProps, "showLegend" | "showValues" | "textColor">>) {
    setProps({ ...p, ...next });
  }

  return (
    <>
      <Field label="Loại biểu đồ">
        <select
          className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm"
          value={p.chartType}
          onChange={(e) => {
            pushHistory();
            setProps(convertChartType(p, e.target.value as ChartType));
          }}
        >
          {CHART_TYPE_OPTIONS.map((o) => (
            <option key={o.type} value={o.type}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-col gap-1.5">
        <Check
          label="Hiện chú giải (legend)"
          checked={p.showLegend === true}
          onChange={(v) => {
            pushHistory();
            patchCommon({ showLegend: v });
          }}
        />
        <Check
          label={p.chartType === "pie" || p.chartType === "donut" ? "Hiện % trên lát" : "Hiện giá trị"}
          checked={p.showValues === true}
          onChange={(v) => {
            pushHistory();
            patchCommon({ showValues: v });
          }}
        />
        {p.chartType === "bar" && (
          <>
            <Check
              label="Cột chồng (stacked)"
              checked={p.stacked === true}
              onChange={(v) => {
                pushHistory();
                setProps({ ...p, stacked: v });
              }}
            />
            <Check
              label="Cột ngang"
              checked={p.horizontal === true}
              onChange={(v) => {
                pushHistory();
                setProps({ ...p, horizontal: v });
              }}
            />
          </>
        )}
        {(p.chartType === "line" || p.chartType === "area") && (
          <Check
            label="Đường cong mượt"
            checked={p.smooth === true}
            onChange={(v) => {
              pushHistory();
              setProps({ ...p, smooth: v });
            }}
          />
        )}
        {p.chartType === "line" && (
          <Check
            label="Hiện điểm (dot)"
            checked={p.showDots !== false}
            onChange={(v) => {
              pushHistory();
              setProps({ ...p, showDots: v });
            }}
          />
        )}
      </div>

      {p.chartType === "donut" && (
        <Field label={`Lỗ giữa: ${Math.round((p.innerRadiusRatio ?? 0.6) * 100)}%`}>
          <input
            type="range"
            min={0.2}
            max={0.9}
            step={0.05}
            value={p.innerRadiusRatio ?? 0.6}
            onPointerDown={() => pushHistory()}
            onChange={(e) => setProps({ ...p, innerRadiusRatio: Number(e.target.value) })}
          />
        </Field>
      )}

      {p.chartType === "pie" || p.chartType === "donut" ? (
        <SliceEditor props={p} setProps={setProps} />
      ) : (
        <SeriesEditor props={p} setProps={setProps} />
      )}
    </>
  );
}

/** Sửa dữ liệu pie/donut: mỗi lát 1 hàng (nhãn / giá trị / màu / xoá). */
function SliceEditor({
  props,
  setProps,
}: {
  props: Extract<ChartProps, { chartType: "pie" | "donut" }>;
  setProps: (p: ChartProps) => void;
}) {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();

  function patchSlice(i: number, next: Partial<(typeof props.slices)[number]>) {
    setProps({
      ...props,
      slices: props.slices.map((s, si) => (si === i ? { ...s, ...next } : s)),
    });
  }

  return (
    <Field label="Dữ liệu (lát)">
      <div className="flex flex-col gap-1">
        {props.slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-1">
            <Input
              value={slice.label}
              onFocus={history.onFocus}
              onChange={(e) => patchSlice(i, { label: e.target.value })}
              className="h-7 flex-1 px-1.5 text-xs"
            />
            <Input
              type="number"
              min={0}
              value={slice.value}
              onFocus={history.onFocus}
              onChange={(e) => patchSlice(i, { value: Math.max(0, Number(e.target.value) || 0) })}
              className="h-7 w-14 px-1.5 text-xs"
            />
            <Input
              type="color"
              value={chartColor(slice.color, i)}
              onFocus={history.onFocus}
              onChange={(e) => patchSlice(i, { color: e.target.value })}
              className="h-7 w-8 shrink-0 p-0.5"
            />
            <button
              type="button"
              aria-label="Xóa lát"
              disabled={props.slices.length <= 1}
              onClick={() => {
                pushHistory();
                setProps({ ...props, slices: props.slices.filter((_, si) => si !== i) });
              }}
              className="text-muted-foreground hover:text-destructive disabled:opacity-30"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={props.slices.length >= LIMITS.CHART_SLICES_MAX}
          onClick={() => {
            pushHistory();
            setProps({
              ...props,
              slices: [...props.slices, { label: `Nhóm ${props.slices.length + 1}`, value: 10 }],
            });
          }}
        >
          <Plus /> Thêm lát
        </Button>
      </div>
    </Field>
  );
}

/** Sửa dữ liệu bar/line/area: bảng nhóm (labels) × chuỗi (series). */
function SeriesEditor({
  props,
  setProps,
}: {
  props: Extract<ChartProps, { chartType: "bar" | "line" | "area" }>;
  setProps: (p: ChartProps) => void;
}) {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();

  function patchSeries(i: number, next: Partial<ChartSeries>) {
    setProps({
      ...props,
      series: props.series.map((s, si) => (si === i ? { ...s, ...next } : s)),
    });
  }

  function setValue(sIdx: number, cat: number, value: number) {
    const series = props.series[sIdx]!;
    const values = props.labels.map((_, i) => (i === cat ? value : seriesValue(series, i)));
    patchSeries(sIdx, { values });
  }

  return (
    <>
      <Field label="Chuỗi dữ liệu">
        <div className="flex flex-col gap-1">
          {props.series.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                value={s.name}
                onFocus={history.onFocus}
                onChange={(e) => patchSeries(i, { name: e.target.value })}
                className="h-7 flex-1 px-1.5 text-xs"
              />
              <Input
                type="color"
                value={chartColor(s.color, i)}
                onFocus={history.onFocus}
                onChange={(e) => patchSeries(i, { color: e.target.value })}
                className="h-7 w-8 shrink-0 p-0.5"
              />
              <button
                type="button"
                aria-label="Xóa chuỗi"
                disabled={props.series.length <= 1}
                onClick={() => {
                  pushHistory();
                  setProps({ ...props, series: props.series.filter((_, si) => si !== i) });
                }}
                className="text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={props.series.length >= LIMITS.CHART_SERIES_MAX}
            onClick={() => {
              pushHistory();
              setProps({
                ...props,
                series: [
                  ...props.series,
                  { name: `Chuỗi ${props.series.length + 1}`, values: props.labels.map(() => 0) },
                ],
              });
            }}
          >
            <Plus /> Thêm chuỗi
          </Button>
        </div>
      </Field>

      <Field label="Giá trị theo nhóm">
        <div className="flex flex-col gap-1">
          {props.labels.map((label, cat) => (
            <div key={cat} className="flex items-center gap-1">
              <Input
                value={label}
                onFocus={history.onFocus}
                onChange={(e) =>
                  setProps({
                    ...props,
                    labels: props.labels.map((l, li) => (li === cat ? e.target.value : l)),
                  })
                }
                className="h-7 w-16 shrink-0 px-1.5 text-xs"
              />
              {props.series.map((s, sIdx) => (
                <Input
                  key={sIdx}
                  type="number"
                  value={seriesValue(s, cat)}
                  onFocus={history.onFocus}
                  onChange={(e) => setValue(sIdx, cat, Number(e.target.value) || 0)}
                  className="h-7 min-w-0 flex-1 px-1.5 text-xs"
                  title={s.name}
                />
              ))}
              <button
                type="button"
                aria-label="Xóa nhóm"
                disabled={props.labels.length <= 1}
                onClick={() => {
                  pushHistory();
                  setProps({
                    ...props,
                    labels: props.labels.filter((_, li) => li !== cat),
                    series: props.series.map((s) => ({
                      ...s,
                      values: props.labels.map((_, i) => seriesValue(s, i)).filter((_, li) => li !== cat),
                    })),
                  });
                }}
                className="text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={props.labels.length >= LIMITS.CHART_CATEGORIES_MAX}
            onClick={() => {
              pushHistory();
              setProps({
                ...props,
                labels: [...props.labels, `N${props.labels.length + 1}`],
                series: props.series.map((s) => ({
                  ...s,
                  values: [...props.labels.map((_, i) => seriesValue(s, i)), 0],
                })),
              });
            }}
          >
            <Plus /> Thêm nhóm
          </Button>
        </div>
      </Field>
    </>
  );
}
