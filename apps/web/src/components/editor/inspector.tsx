"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";
import type {
  IconElement,
  ImageElement,
  ShapeElement,
  SlideElement,
  TextElement,
} from "@repo/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SLIDE_ICONS } from "@/lib/editor/icon-map";
import {
  SHAPE_OPTIONS,
  shapeSupportsBorder,
  shapeSupportsRadius,
} from "@/lib/editor/shapes";
import { duplicateElement } from "@/lib/editor/elements";
import { useThemes } from "@/hooks/queries/useThemes";
import { ShapeThumb } from "./toolbar";
import { useEditorStore } from "@/stores/useEditorStore";

const BG_PRESETS = ["#ffffff", "#f8fafc", "#fef3c7", "#dbeafe", "#dcfce7", "#111827"];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #f97316, #ef4444)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f43f5e, #fb923c)",
  "linear-gradient(135deg, #0f172a, #475569)",
  "radial-gradient(circle, #fde047, #f97316)",
  "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      {children}
    </div>
  );
}

/** pushHistory 1 lần khi bắt đầu tương tác với input (focus/pointerdown). */
function useHistoryOnStart() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return { onFocus: () => pushHistory(), onPointerDown: () => pushHistory() };
}

function TextInspector({ element, slideId }: { element: TextElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();

  function patch(props: Partial<TextElement["props"]>) {
    updateElement(slideId, element.id, (el) =>
      el.type === "text" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  return (
    <>
      <Field label="Cỡ chữ">
        <Input
          type="number"
          min={8}
          max={300}
          value={element.props.fontSize}
          onFocus={history.onFocus}
          onChange={(e) => patch({ fontSize: Number(e.target.value) || 8 })}
        />
      </Field>
      <Field label="Độ đậm">
        <select
          className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm"
          value={element.props.fontWeight}
          onFocus={history.onFocus}
          onChange={(e) => patch({ fontWeight: Number(e.target.value) })}
        >
          {[300, 400, 500, 600, 700, 800].map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Màu chữ">
        <Input
          type="color"
          value={element.props.color}
          onFocus={history.onFocus}
          onChange={(e) => patch({ color: e.target.value })}
          className="h-9 p-1"
        />
      </Field>
      <Field label="Căn lề">
        <div className="flex gap-1">
          {(
            [
              ["left", AlignLeft],
              ["center", AlignCenter],
              ["right", AlignRight],
            ] as const
          ).map(([align, Icon]) => (
            <Button
              key={align}
              variant={element.props.align === align ? "secondary" : "ghost"}
              size="icon"
              onClick={() => {
                pushHistory();
                patch({ align });
              }}
              aria-label={`Căn ${align}`}
            >
              <Icon />
            </Button>
          ))}
        </div>
      </Field>
      <Field label="Giãn dòng">
        <Input
          type="number"
          step={0.1}
          min={0.8}
          max={3}
          value={element.props.lineHeight}
          onFocus={history.onFocus}
          onChange={(e) => patch({ lineHeight: Number(e.target.value) || 1 })}
        />
      </Field>
    </>
  );
}

function ShapeInspector({ element, slideId }: { element: ShapeElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();

  function patch(props: Partial<ShapeElement["props"]>) {
    updateElement(slideId, element.id, (el) =>
      el.type === "shape" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  const isGradient = element.props.fill.includes("gradient(");
  const kind = element.props.shape;

  return (
    <>
      <Field label="Loại hình">
        <div className="grid max-h-40 grid-cols-5 gap-1 overflow-y-auto">
          {SHAPE_OPTIONS.map(({ kind: k, label }) => (
            <button
              key={k}
              type="button"
              title={label}
              onClick={() => {
                pushHistory();
                patch({ shape: k });
              }}
              className={cn(
                "hover:bg-accent flex aspect-square items-center justify-center rounded-md border",
                kind === k && "border-primary bg-accent",
              )}
            >
              <ShapeThumb kind={k} className="size-4" />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Màu nền">
        <Input
          type="color"
          value={isGradient ? "#6366f1" : element.props.fill}
          onFocus={history.onFocus}
          onChange={(e) => patch({ fill: e.target.value })}
          className="h-9 p-1"
        />
      </Field>
      <Field label="Gradient">
        <div className="flex flex-wrap gap-1.5">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                pushHistory();
                patch({ fill: g });
              }}
              className={cn(
                "size-7 rounded-md border",
                element.props.fill === g && "ring-primary ring-2",
              )}
              style={{ backgroundImage: g }}
              aria-label="Gradient preset"
            />
          ))}
        </div>
      </Field>
      {shapeSupportsBorder(kind) && kind !== "line" && (
        <Field label="Viền">
          <div className="flex gap-1.5">
            <Input
              type="color"
              value={element.props.stroke ?? "#111827"}
              onFocus={history.onFocus}
              onChange={(e) => patch({ stroke: e.target.value })}
              className="h-9 w-14 p-1"
            />
            <Input
              type="number"
              min={0}
              max={40}
              value={element.props.strokeWidth ?? 0}
              onFocus={history.onFocus}
              onChange={(e) => {
                const strokeWidth = Number(e.target.value) || 0;
                patch(
                  strokeWidth === 0
                    ? { stroke: undefined, strokeWidth: undefined }
                    : { strokeWidth, stroke: element.props.stroke ?? "#111827" },
                );
              }}
            />
          </div>
        </Field>
      )}
      {shapeSupportsRadius(kind) && (
        <Field label="Bo góc">
          <Input
            type="number"
            min={0}
            max={200}
            value={element.props.borderRadius ?? (kind === "rounded-rect" ? 24 : 0)}
            onFocus={history.onFocus}
            onChange={(e) => patch({ borderRadius: Number(e.target.value) || 0 })}
          />
        </Field>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={element.props.shadow ?? false}
          onChange={(e) => {
            pushHistory();
            patch({ shadow: e.target.checked || undefined });
          }}
          className="accent-primary size-4"
        />
        Đổ bóng
      </label>
    </>
  );
}

function IconInspector({ element, slideId }: { element: IconElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();
  const [iconQuery, setIconQuery] = useState("");

  function patch(props: Partial<IconElement["props"]>) {
    updateElement(slideId, element.id, (el) =>
      el.type === "icon" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  return (
    <>
      <Field label="Màu icon">
        <Input
          type="color"
          value={element.props.color}
          onFocus={history.onFocus}
          onChange={(e) => patch({ color: e.target.value })}
          className="h-9 p-1"
        />
      </Field>
      <Field label="Icon">
        <Input
          placeholder="Tìm icon..."
          value={iconQuery}
          onChange={(e) => setIconQuery(e.target.value)}
        />
        <div className="grid max-h-48 grid-cols-5 gap-1 overflow-y-auto">
          {Object.entries(SLIDE_ICONS)
            .filter(([name]) => name.includes(iconQuery.trim().toLowerCase()))
            .map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  pushHistory();
                  patch({ name });
                }}
                className={cn(
                  "hover:bg-accent flex aspect-square items-center justify-center rounded-md border",
                  element.props.name === name && "border-primary bg-accent",
                )}
                aria-label={name}
              >
                <Icon className="size-4" />
              </button>
            ))}
        </div>
      </Field>
    </>
  );
}

function ImageInspector({ element, slideId }: { element: ImageElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();

  function patch(props: Partial<ImageElement["props"]>) {
    updateElement(slideId, element.id, (el) =>
      el.type === "image" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  return (
    <>
      <Field label="Hiển thị">
        <div className="flex gap-1">
          {(["cover", "contain"] as const).map((fit) => (
            <Button
              key={fit}
              variant={element.props.objectFit === fit ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                pushHistory();
                patch({ objectFit: fit });
              }}
            >
              {fit === "cover" ? "Phủ kín" : "Vừa khung"}
            </Button>
          ))}
        </div>
      </Field>
      <Field label="Bo góc">
        <Input
          type="number"
          min={0}
          max={400}
          value={element.props.borderRadius ?? 0}
          onFocus={history.onFocus}
          onChange={(e) => patch({ borderRadius: Number(e.target.value) || 0 })}
        />
      </Field>
    </>
  );
}

function CommonInspector({ element, slideId }: { element: SlideElement; slideId: string }) {
  const store = useEditorStore();
  const slide = store.presentation?.slides.find((s) => s.id === slideId);
  const history = useHistoryOnStart();

  function setLayer(direction: "front" | "back") {
    if (!slide) return;
    const zs = slide.elements.map((e) => e.zIndex);
    const target = direction === "front" ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
    store.pushHistory();
    store.updateElement(slideId, element.id, (el) => ({ ...el, zIndex: target }));
  }

  return (
    <>
      <Field label={`Độ mờ — ${Math.round((element.opacity ?? 1) * 100)}%`}>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={element.opacity ?? 1}
          onPointerDown={history.onPointerDown}
          onChange={(e) =>
            store.updateElement(slideId, element.id, (el) => ({
              ...el,
              opacity: Number(e.target.value),
            }))
          }
          className="accent-primary"
        />
      </Field>
      <Field label="Lớp (layer)">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setLayer("front")}>
            <ChevronsUp /> Lên trên
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLayer("back")}>
            <ChevronsDown /> Xuống dưới
          </Button>
        </div>
      </Field>
      <div className="flex flex-wrap gap-1 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!slide) return;
            store.addElement(slideId, duplicateElement(element, slide.elements));
          }}
        >
          <Copy /> Nhân bản
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            store.pushHistory();
            store.updateElement(slideId, element.id, (el) => ({ ...el, locked: !el.locked }));
          }}
        >
          {element.locked ? <LockOpen /> : <Lock />}
          {element.locked ? "Mở khóa" : "Khóa"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => store.removeElement(slideId, element.id)}
        >
          <Trash2 /> Xóa
        </Button>
      </div>
    </>
  );
}

function ThemePicker() {
  const themes = useThemes();
  const applyTheme = useEditorStore((s) => s.applyTheme);
  const currentThemeId = useEditorStore((s) => s.presentation?.themeId ?? null);

  if (!themes.data?.length) return null;

  return (
    <Field label="Theme (áp cho toàn bộ slide)">
      <div className="flex flex-col gap-1.5">
        {themes.data.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => applyTheme(theme.id, theme.config)}
            className={cn(
              "hover:bg-accent/50 flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left",
              currentThemeId === theme.id && "border-primary",
            )}
          >
            <span className="truncate text-xs font-medium">{theme.name}</span>
            <span className="flex shrink-0 gap-1">
              {[
                theme.config.colors.background,
                theme.config.colors.heading,
                theme.config.colors.body,
                theme.config.colors.accent,
              ].map((color, i) => (
                <span
                  key={i}
                  className="size-4 rounded-full border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>
    </Field>
  );
}

function SlideInspector({ slideId }: { slideId: string }) {
  const store = useEditorStore();
  const history = useHistoryOnStart();
  const slide = store.presentation?.slides.find((s) => s.id === slideId);
  if (!slide) return null;

  function setBackground(value: string, withHistory = false) {
    if (withHistory) store.pushHistory();
    store.updateSlide(slideId, (s) => ({
      ...s,
      background: { type: "color", value },
    }));
  }

  return (
    <>
      <p className="text-sm font-medium">Slide</p>
      <Field label="Màu nền">
        <Input
          type="color"
          value={slide.background.type === "color" ? slide.background.value : "#ffffff"}
          onFocus={history.onFocus}
          onChange={(e) => setBackground(e.target.value)}
          className="h-9 p-1"
        />
      </Field>
      <Field label="Màu gợi ý">
        <div className="flex flex-wrap gap-1.5">
          {BG_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBackground(color, true)}
              className="size-7 rounded-md border"
              style={{ backgroundColor: color }}
              aria-label={`Nền ${color}`}
            />
          ))}
        </div>
      </Field>
      {store.presentation?.headerFooter && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={slide.hideHeaderFooter ?? false}
            onChange={(e) => {
              store.pushHistory();
              store.updateSlide(slideId, (s) => ({
                ...s,
                hideHeaderFooter: e.target.checked || undefined,
              }));
            }}
            className="accent-primary size-4"
          />
          Ẩn header/footer ở slide này
        </label>
      )}
      <div className="border-t pt-3" />
      <ThemePicker />
    </>
  );
}

export function Inspector() {
  const presentation = useEditorStore((s) => s.presentation);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);

  const slide = presentation?.slides.find((s) => s.id === activeSlideId);
  const element = slide?.elements.find((e) => e.id === selectedElementId);

  if (!slide) return null;

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4">
      {element ? (
        <>
          <p className="text-sm font-medium capitalize">{element.type}</p>
          {element.type === "text" && <TextInspector element={element} slideId={slide.id} />}
          {element.type === "shape" && <ShapeInspector element={element} slideId={slide.id} />}
          {element.type === "icon" && <IconInspector element={element} slideId={slide.id} />}
          {element.type === "image" && <ImageInspector element={element} slideId={slide.id} />}
          <div className="border-t pt-3" />
          <CommonInspector element={element} slideId={slide.id} />
        </>
      ) : (
        <SlideInspector slideId={slide.id} />
      )}
    </aside>
  );
}
