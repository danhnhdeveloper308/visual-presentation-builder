"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clipboard,
  Copy,
  Pause,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { Animation, AnimationEffect, SlideElement } from "@repo/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ANIMATION_EFFECTS,
  ANIMATION_GROUP_COLORS,
  ANIMATION_GROUP_LABELS,
  EFFECT_META,
  createAnimation,
  getDefaultAnimations,
  playSlideAnimations,
  setDefaultAnimation,
  type AnimationPlayer,
} from "@/lib/editor/animations";
import { useEditorStore } from "@/stores/useEditorStore";
import { useEditorUiStore } from "@/stores/useEditorUiStore";

const GROUPS = ["entrance", "emphasis", "exit", "motion"] as const;
const ELEMENT_TYPES: { type: SlideElement["type"]; label: string }[] = [
  { type: "text", label: "Văn bản" },
  { type: "shape", label: "Hình khối" },
  { type: "image", label: "Ảnh" },
  { type: "icon", label: "Icon" },
  { type: "table", label: "Bảng" },
  { type: "chart", label: "Biểu đồ" },
  { type: "media", label: "Media" },
];

function elementLabel(el: SlideElement | undefined): string {
  if (!el) return "(đã xoá)";
  switch (el.type) {
    case "text":
      return `Văn bản: ${el.props.content.slice(0, 18).trim() || "…"}`;
    case "shape":
      return `Hình: ${el.props.shape}`;
    case "image":
      return "Ảnh";
    case "icon":
      return `Icon: ${el.props.name}`;
    case "table":
      return `Bảng ${el.props.rows.length}×${el.props.rows[0]?.length ?? 0}`;
    case "chart":
      return `Biểu đồ: ${el.props.chartType}`;
    case "media":
      return `Media: ${el.props.kind}`;
  }
}

function findFrame(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-slide-frame]");
}

/** Menu chọn hiệu ứng (nhóm entrance/emphasis/exit/motion). */
function EffectPicker({ onPick }: { onPick: (effect: AnimationEffect) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button size="sm" className="w-full" onClick={() => setOpen((o) => !o)}>
        <Plus /> Thêm hiệu ứng
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" role="none" onClick={() => setOpen(false)} />
          <div className="bg-popover absolute top-full left-0 z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-md border p-2 shadow-md">
            {GROUPS.map((g) => (
              <div key={g} className="mb-2">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold">
                  <span className="size-2 rounded-full" style={{ backgroundColor: ANIMATION_GROUP_COLORS[g] }} />
                  {ANIMATION_GROUP_LABELS[g]}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {ANIMATION_EFFECTS.filter((e) => e.group === g).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        onPick(e.id);
                        setOpen(false);
                      }}
                      className="hover:bg-accent rounded px-2 py-1 text-left text-xs"
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AnimationRow({
  anim,
  index,
  total,
  element,
  selected,
}: {
  anim: Animation;
  index: number;
  total: number;
  element: SlideElement | undefined;
  selected: boolean;
}) {
  const update = useEditorStore((s) => s.updateAnimation);
  const remove = useEditorStore((s) => s.removeAnimation);
  const move = useEditorStore((s) => s.moveAnimation);
  const setClipboard = useEditorUiStore((s) => s.setAnimationClipboard);
  const [expanded, setExpanded] = useState(false);
  const meta = EFFECT_META[anim.effect];

  function previewOne() {
    const frame = findFrame();
    if (frame && element) playSlideAnimations(frame, [anim], [element]);
  }

  return (
    <div
      className={cn(
        "rounded-md border p-2 text-xs",
        selected ? "border-primary bg-accent/40" : "border-border",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: ANIMATION_GROUP_COLORS[anim.group] }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{meta.label}</p>
          <p className="text-muted-foreground truncate text-[10px]">{elementLabel(element)}</p>
        </div>
        <button type="button" title="Xem thử" onClick={previewOne} className="hover:bg-accent rounded p-1">
          <Play className="size-3" />
        </button>
        <button
          type="button"
          title="Sao chép hiệu ứng"
          onClick={() => setClipboard(anim)}
          className="hover:bg-accent rounded p-1"
        >
          <Copy className="size-3" />
        </button>
        <button type="button" title="Xoá" onClick={() => remove(anim.id)} className="hover:bg-accent text-destructive rounded p-1">
          <Trash2 className="size-3" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <label className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[10px]">Bắt đầu</span>
          <select
            className="border-input h-7 rounded border bg-transparent px-1 text-[11px]"
            value={anim.trigger}
            onChange={(e) => update(anim.id, { trigger: e.target.value as Animation["trigger"] })}
          >
            <option value="on-click">Khi nhấn</option>
            <option value="with-previous">Cùng cái trước</option>
            <option value="after-previous">Sau cái trước</option>
          </select>
        </label>
        <div className="flex items-end gap-1">
          <button
            type="button"
            title="Lên"
            disabled={index === 0}
            onClick={() => move(anim.id, -1)}
            className="hover:bg-accent h-7 flex-1 rounded border disabled:opacity-30"
          >
            <ChevronUp className="mx-auto size-3.5" />
          </button>
          <button
            type="button"
            title="Xuống"
            disabled={index === total - 1}
            onClick={() => move(anim.id, 1)}
            className="hover:bg-accent h-7 flex-1 rounded border disabled:opacity-30"
          >
            <ChevronDown className="mx-auto size-3.5" />
          </button>
        </div>
        <label className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[10px]">Thời lượng (ms)</span>
          <Input
            type="number"
            min={50}
            max={20000}
            step={50}
            value={anim.durationMs}
            onChange={(e) => update(anim.id, { durationMs: Number(e.target.value) || 50 })}
            className="h-7 text-[11px]"
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[10px]">Trễ (ms)</span>
          <Input
            type="number"
            min={0}
            max={60000}
            step={50}
            value={anim.delayMs}
            onChange={(e) => update(anim.id, { delayMs: Number(e.target.value) || 0 })}
            className="h-7 text-[11px]"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-muted-foreground hover:text-foreground mt-1.5 flex items-center gap-1 text-[10px]"
      >
        <Settings2 className="size-3" /> Tuỳ chọn nâng cao
      </button>
      {expanded && (
        <div className="mt-1.5 flex flex-col gap-1.5">
          {meta.direction && (
            <label className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-[11px]">Hướng</span>
              <select
                className="border-input h-7 rounded border bg-transparent px-1 text-[11px]"
                value={anim.direction ?? "left"}
                onChange={(e) => update(anim.id, { direction: e.target.value as Animation["direction"] })}
              >
                <option value="left">Trái</option>
                <option value="right">Phải</option>
                <option value="top">Trên</option>
                <option value="bottom">Dưới</option>
              </select>
            </label>
          )}
          <label className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-[11px]">Lặp lại</span>
            <Input
              type="number"
              min={1}
              max={100}
              value={anim.repeat ?? 1}
              onChange={(e) => {
                const n = Number(e.target.value) || 1;
                update(anim.id, { repeat: n > 1 ? n : undefined });
              }}
              className="h-7 w-20 text-[11px]"
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-[11px]">Đảo chiều (auto reverse)</span>
            <input
              type="checkbox"
              checked={anim.autoReverse ?? false}
              onChange={(e) => update(anim.id, { autoReverse: e.target.checked || undefined })}
              className="accent-primary size-4"
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-[11px]">Tiết tấu</span>
            <select
              className="border-input h-7 rounded border bg-transparent px-1 text-[11px]"
              value={anim.easing ?? "ease"}
              onChange={(e) => update(anim.id, { easing: e.target.value as Animation["easing"] })}
            >
              <option value="ease">Mặc định</option>
              <option value="linear">Đều</option>
              <option value="ease-in">Mượt đầu</option>
              <option value="ease-out">Mượt cuối</option>
              <option value="ease-in-out">Mượt 2 đầu</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

function DefaultAnimationSettings() {
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState(() => getDefaultAnimations());

  function change(type: SlideElement["type"], effect: AnimationEffect | "") {
    setDefaultAnimation(type, effect || null);
    setDefaults(getDefaultAnimations());
  }

  return (
    <div className="border-t pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs"
      >
        <Settings2 className="size-3.5" /> Hiệu ứng mặc định khi thêm mới
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {ELEMENT_TYPES.map(({ type, label }) => (
            <label key={type} className="flex items-center justify-between gap-2">
              <span className="text-[11px]">{label}</span>
              <select
                className="border-input h-7 max-w-36 rounded border bg-transparent px-1 text-[11px]"
                value={defaults[type] ?? ""}
                onChange={(e) => change(type, e.target.value as AnimationEffect | "")}
              >
                <option value="">Không</option>
                {ANIMATION_EFFECTS.map((eff) => (
                  <option key={eff.id} value={eff.id}>
                    {eff.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnimationPanel() {
  const open = useEditorUiStore((s) => s.animationPanelOpen);
  const toggle = useEditorUiStore((s) => s.toggleAnimationPanel);
  const clipboard = useEditorUiStore((s) => s.animationClipboard);

  const presentation = useEditorStore((s) => s.presentation);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const selectedIds = useEditorStore((s) => s.selectedElementIds);
  const addAnimation = useEditorStore((s) => s.addAnimation);

  const slide = presentation?.slides.find((s) => s.id === activeSlideId);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedEl = slide?.elements.find((e) => e.id === selectedId);

  const playerRef = useRef<AnimationPlayer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => playerRef.current?.cancel(), []);
  // dừng preview khi đổi slide
  useEffect(() => {
    playerRef.current?.cancel();
    playerRef.current = null;
    setPlaying(false);
  }, [activeSlideId]);

  if (!open || !slide) return null;

  const animations = slide.animations ?? [];

  function playAll() {
    const frame = findFrame();
    if (!frame || !slide) return;
    playerRef.current?.cancel();
    setPlaying(true);
    playerRef.current = playSlideAnimations(frame, animations, slide.elements, () => setPlaying(false));
  }
  function stop() {
    playerRef.current?.cancel();
    playerRef.current = null;
    setPlaying(false);
  }

  return (
    <aside className="bg-muted/20 flex w-72 shrink-0 flex-col border-l">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="size-4" /> Hiệu ứng ({animations.length})
        </span>
        <button type="button" onClick={toggle} aria-label="Đóng" className="hover:bg-accent rounded p-1">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 border-b p-3">
        <Button size="sm" variant={playing ? "secondary" : "outline"} onClick={playing ? stop : playAll}>
          {playing ? <Pause /> : <Play />} {playing ? "Dừng" : "Phát thử slide"}
        </Button>
        {selectedEl ? (
          <>
            <EffectPicker onPick={(effect) => addAnimation(selectedEl.id, createAnimation(selectedEl.id, effect))} />
            {clipboard && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  addAnimation(selectedEl.id, { ...clipboard, id: crypto.randomUUID(), elementId: selectedEl.id })
                }
              >
                <Clipboard /> Dán hiệu ứng đã sao chép
              </Button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-center text-xs">Chọn 1 thành phần để thêm hiệu ứng.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {animations.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-xs">
            Chưa có hiệu ứng. Chọn thành phần rồi bấm “Thêm hiệu ứng”.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {animations.map((anim, i) => (
              <AnimationRow
                key={anim.id}
                anim={anim}
                index={i}
                total={animations.length}
                element={slide.elements.find((e) => e.id === anim.elementId)}
                selected={anim.elementId === selectedId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3">
        <DefaultAnimationSettings />
      </div>
    </aside>
  );
}
