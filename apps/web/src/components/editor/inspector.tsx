"use client";

import { useRef, useState } from "react";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Group,
  ImagePlus,
  Loader2,
  Lock,
  LockOpen,
  Trash2,
  Ungroup,
} from "lucide-react";
import type { AlignMode } from "@/lib/editor/arrange";
import type {
  IconElement,
  ImageElement,
  ShadowDirection,
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
import { GRADIENT_PRESETS } from "@/lib/editor/gradients";
import { useThemes } from "@/hooks/queries/useThemes";
import { useUploadImage } from "@/hooks/useUploadImage";
import { ShapeThumb } from "./toolbar";
import { setImageAsset } from "./element-view";
import { ChartInspector, TableInspector } from "./inspector-data";
import { MediaInspector } from "./inspector-media";
import { useEditorStore } from "@/stores/useEditorStore";

const BG_PRESETS = ["#ffffff", "#f8fafc", "#fef3c7", "#dbeafe", "#dcfce7", "#111827"];

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

  const hasBg = element.props.backgroundColor != null;
  const hasBorder = element.props.borderColor != null;

  return (
    <>
      <Field label="Màu nét icon">
        <Input
          type="color"
          value={element.props.color}
          onFocus={history.onFocus}
          onChange={(e) => patch({ color: e.target.value })}
          className="h-9 p-1"
        />
      </Field>

      <div className="flex flex-col gap-2 border-t pt-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasBg}
            onChange={(e) => {
              pushHistory();
              patch({ backgroundColor: e.target.checked ? "#eef2ff" : undefined });
            }}
            className="accent-primary size-4"
          />
          Nền phía sau icon
        </label>
        {hasBg && (
          <>
            <Field label="Màu nền">
              <Input
                type="color"
                value={element.props.backgroundColor ?? "#eef2ff"}
                onFocus={history.onFocus}
                onChange={(e) => patch({ backgroundColor: e.target.value })}
                className="h-9 p-1"
              />
            </Field>
            <Field label="Bo góc nền">
              <Input
                type="number"
                min={0}
                max={200}
                value={element.props.backgroundRadius ?? 12}
                onFocus={history.onFocus}
                onChange={(e) => patch({ backgroundRadius: Number(e.target.value) || 0 })}
              />
            </Field>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t pt-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasBorder}
            onChange={(e) => {
              pushHistory();
              patch(
                e.target.checked
                  ? { borderColor: "#111827", borderWidth: element.props.borderWidth ?? 2 }
                  : { borderColor: undefined, borderWidth: undefined },
              );
            }}
            className="accent-primary size-4"
          />
          Viền icon (none / màu)
        </label>
        {hasBorder && (
          <div className="flex gap-1.5">
            <Input
              type="color"
              value={element.props.borderColor ?? "#111827"}
              onFocus={history.onFocus}
              onChange={(e) => patch({ borderColor: e.target.value })}
              className="h-9 w-14 p-1"
            />
            <Input
              type="number"
              min={1}
              max={40}
              value={element.props.borderWidth ?? 2}
              onFocus={history.onFocus}
              onChange={(e) => patch({ borderWidth: Number(e.target.value) || 1 })}
            />
          </div>
        )}
      </div>

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

const SHADOW_DIRS: { dir: ShadowDirection; label: string }[] = [
  { dir: "top", label: "Trên" },
  { dir: "bottom", label: "Dưới" },
  { dir: "left", label: "Trái" },
  { dir: "right", label: "Phải" },
];

const CORNERS = [
  { key: "topLeft", label: "Trên trái" },
  { key: "topRight", label: "Trên phải" },
  { key: "bottomLeft", label: "Dưới trái" },
  { key: "bottomRight", label: "Dưới phải" },
] as const;

function ImageInspector({ element, slideId }: { element: ImageElement; slideId: string }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const history = useHistoryOnStart();
  const { uploading, uploadFile } = useUploadImage();
  const fileRef = useRef<HTMLInputElement>(null);

  function patch(props: Partial<ImageElement["props"]>) {
    updateElement(slideId, element.id, (el) =>
      el.type === "image" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  async function handleFile(file: File) {
    const res = await uploadFile(file);
    if (res) setImageAsset(slideId, element.id, res.asset, pushHistory, updateElement);
  }

  const corner = element.props.cornerRadius ?? {};
  const shadow = element.props.shadow;
  const shadowDirs = new Set(shadow?.directions ?? []);

  function toggleShadowDir(dir: ShadowDirection) {
    pushHistory();
    const next = new Set(shadowDirs);
    if (next.has(dir)) next.delete(dir);
    else next.add(dir);
    if (next.size === 0) patch({ shadow: undefined });
    else patch({ shadow: { ...shadow, directions: [...next] } });
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        {element.props.url ? "Thay ảnh" : "Tải ảnh lên"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

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

      <Field label="Bo góc từng góc (px)">
        <div className="grid grid-cols-2 gap-1.5">
          {CORNERS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px]">{label}</span>
              <Input
                type="number"
                min={0}
                max={400}
                value={corner[key] ?? element.props.borderRadius ?? 0}
                onFocus={history.onFocus}
                onChange={(e) =>
                  patch({
                    // chuyển sang cornerRadius, bỏ borderRadius đồng đều cũ
                    borderRadius: undefined,
                    cornerRadius: { ...corner, [key]: Number(e.target.value) || 0 },
                  })
                }
              />
            </div>
          ))}
        </div>
      </Field>

      <Field label="Đổ bóng (chọn hướng)">
        <div className="grid grid-cols-4 gap-1">
          {SHADOW_DIRS.map(({ dir, label }) => (
            <button
              key={dir}
              type="button"
              onClick={() => toggleShadowDir(dir)}
              className={cn(
                "rounded-md border px-1 py-1 text-xs",
                shadowDirs.has(dir) ? "border-primary bg-accent" : "hover:bg-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      {shadow && (
        <Field label="Độ mờ bóng (blur)">
          <Input
            type="number"
            min={0}
            max={100}
            value={shadow.blur ?? 24}
            onFocus={history.onFocus}
            onChange={(e) => patch({ shadow: { ...shadow, blur: Number(e.target.value) || 0 } })}
          />
        </Field>
      )}
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
      <AlignButtons slideId={slideId} count={1} />
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
        {element.groupId && (
          <Button variant="ghost" size="sm" onClick={() => store.ungroupSelected()}>
            <Ungroup /> Bỏ nhóm
          </Button>
        )}
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

const ALIGN_OPTIONS: { mode: AlignMode; label: string; Icon: typeof AlignStartVertical }[] = [
  { mode: "left", label: "Căn trái", Icon: AlignStartVertical },
  { mode: "center-x", label: "Căn giữa ngang", Icon: AlignCenterVertical },
  { mode: "right", label: "Căn phải", Icon: AlignEndVertical },
  { mode: "top", label: "Căn trên", Icon: AlignStartHorizontal },
  { mode: "center-y", label: "Căn giữa dọc", Icon: AlignCenterHorizontal },
  { mode: "bottom", label: "Căn dưới", Icon: AlignEndHorizontal },
];

/** Cụm nút căn hàng + phân bố đều — 1 element căn theo SLIDE, nhiều theo khung bao selection. */
function AlignButtons({ slideId, count }: { slideId: string; count: number }) {
  const arrangeSelected = useEditorStore((s) => s.arrangeSelected);
  const distributeSelected = useEditorStore((s) => s.distributeSelected);
  return (
    <Field label={count === 1 ? "Căn theo slide" : "Căn hàng (theo vùng chọn)"}>
      <div className="flex gap-1">
        {ALIGN_OPTIONS.map(({ mode, label, Icon }) => (
          <Button
            key={mode}
            variant="ghost"
            size="icon"
            className="size-8"
            title={label}
            aria-label={label}
            onClick={() => arrangeSelected(slideId, mode)}
          >
            <Icon />
          </Button>
        ))}
      </div>
      {count >= 3 && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Phân bố đều khoảng cách ngang"
            onClick={() => distributeSelected(slideId, "x")}
          >
            <AlignHorizontalSpaceBetween /> Đều ngang
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Phân bố đều khoảng cách dọc"
            onClick={() => distributeSelected(slideId, "y")}
          >
            <AlignVerticalSpaceBetween /> Đều dọc
          </Button>
        </div>
      )}
    </Field>
  );
}

/** Inspector khi chọn NHIỀU element (đa chọn/nhóm): nhóm/bỏ nhóm + nhân bản/xóa hàng loạt. */
function MultiSelectInspector({ slideId, count }: { slideId: string; count: number }) {
  const store = useEditorStore();
  const selectedIds = useEditorStore((s) => s.selectedElementIds);
  const slide = store.presentation?.slides.find((s) => s.id === slideId);
  const anyGrouped = slide?.elements.some((e) => selectedIds.includes(e.id) && e.groupId) ?? false;

  return (
    <>
      <p className="text-sm font-medium">Đã chọn {count} thành phần</p>
      <p className="text-muted-foreground text-xs">
        Nhóm để di chuyển cùng nhau. Nhấn đúp vào thành phần trong nhóm để sửa riêng.
      </p>
      <AlignButtons slideId={slideId} count={count} />
      <div className="flex flex-col gap-1.5">
        <Button size="sm" onClick={() => store.groupSelected()}>
          <Group /> Nhóm lại (Ctrl+G)
        </Button>
        {anyGrouped && (
          <Button variant="outline" size="sm" onClick={() => store.ungroupSelected()}>
            <Ungroup /> Bỏ nhóm (Ctrl+Shift+G)
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 border-t pt-3">
        <Button variant="ghost" size="sm" onClick={() => store.duplicateSelected(slideId)}>
          <Copy /> Nhân bản
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => store.removeSelected(slideId)}
        >
          <Trash2 /> Xóa tất cả
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
        {themes.data.map((theme) => {
          const isGradientBg = theme.config.colors.background.includes("gradient(");
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => applyTheme(theme.id, theme.config)}
              className={cn(
                "hover:bg-accent/50 flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left",
                currentThemeId === theme.id && "border-primary",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-xs font-medium">{theme.name}</span>
                {!theme.isSystemTheme && (
                  <span className="text-muted-foreground shrink-0 text-[10px]">· của tôi</span>
                )}
              </span>
              <span className="flex shrink-0 gap-1">
                <span
                  className="size-4 rounded-full border"
                  style={
                    isGradientBg
                      ? { backgroundImage: theme.config.colors.background }
                      : { backgroundColor: theme.config.colors.background }
                  }
                />
                {[theme.config.colors.heading, theme.config.colors.body, theme.config.colors.accent].map(
                  (color, i) => (
                    <span key={i} className="size-4 rounded-full border" style={{ backgroundColor: color }} />
                  ),
                )}
              </span>
            </button>
          );
        })}
      </div>
      <a href="/themes" target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline">
        Quản lý theme →
      </a>
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
      <Field label="Chuyển slide (khi trình chiếu)">
        <select
          className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm"
          value={slide.transition ?? ""}
          onChange={(e) => {
            store.pushHistory();
            const value = e.target.value as "" | "fade" | "slide" | "zoom";
            store.updateSlide(slideId, (s) => ({
              ...s,
              transition: value === "" ? undefined : value,
            }));
          }}
        >
          <option value="">Không</option>
          <option value="fade">Fade (mờ dần)</option>
          <option value="slide">Slide (trượt)</option>
          <option value="zoom">Zoom (phóng)</option>
        </select>
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
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);

  const slide = presentation?.slides.find((s) => s.id === activeSlideId);
  const element =
    selectedElementIds.length === 1
      ? slide?.elements.find((e) => e.id === selectedElementIds[0])
      : undefined;

  if (!slide) return null;

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4">
      {selectedElementIds.length > 1 ? (
        <MultiSelectInspector slideId={slide.id} count={selectedElementIds.length} />
      ) : element ? (
        <>
          <p className="text-sm font-medium capitalize">{element.type}</p>
          {element.type === "text" && <TextInspector element={element} slideId={slide.id} />}
          {element.type === "shape" && <ShapeInspector element={element} slideId={slide.id} />}
          {element.type === "icon" && <IconInspector element={element} slideId={slide.id} />}
          {element.type === "image" && <ImageInspector element={element} slideId={slide.id} />}
          {element.type === "table" && <TableInspector element={element} slideId={slide.id} />}
          {element.type === "chart" && <ChartInspector element={element} slideId={slide.id} />}
          {element.type === "media" && <MediaInspector element={element} slideId={slide.id} />}
          <div className="border-t pt-3" />
          <CommonInspector element={element} slideId={slide.id} />
        </>
      ) : (
        <SlideInspector slideId={slide.id} />
      )}
    </aside>
  );
}
