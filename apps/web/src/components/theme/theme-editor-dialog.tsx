"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ThemeConfig, ThemeDto } from "@repo/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FONT_STACK_OPTIONS, GRADIENT_PRESETS } from "@/lib/editor/gradients";
import { useCreateTheme } from "@/hooks/mutations/useCreateTheme";
import { useUpdateTheme } from "@/hooks/mutations/useUpdateTheme";

/** Dialog tạo/sửa theme riêng (My Themes) — đủ field theo themeConfigSchema. */
export function ThemeEditorDialog({
  initial,
  onClose,
}: {
  /** Truyền vào khi sửa; để trống = tạo mới. */
  initial?: ThemeDto;
  onClose: () => void;
}) {
  const createTheme = useCreateTheme();
  const updateTheme = useUpdateTheme();
  const pending = createTheme.isPending || updateTheme.isPending;

  const [name, setName] = useState(initial?.name ?? "Theme của tôi");
  const [fontHeading, setFontHeading] = useState(
    initial?.config.fontHeading ?? FONT_STACK_OPTIONS[0]!.value,
  );
  const [fontBody, setFontBody] = useState(initial?.config.fontBody ?? FONT_STACK_OPTIONS[0]!.value);
  const [background, setBackground] = useState(initial?.config.colors.background ?? "#ffffff");
  const [heading, setHeading] = useState(initial?.config.colors.heading ?? "#111827");
  const [body, setBody] = useState(initial?.config.colors.body ?? "#4b5563");
  const [accent, setAccent] = useState(initial?.config.colors.accent ?? "#6366f1");
  const [hasAccent2, setHasAccent2] = useState(initial?.config.colors.accent2 != null);
  const [accent2, setAccent2] = useState(initial?.config.colors.accent2 ?? "#ec4899");
  const [shadow, setShadow] = useState(initial?.config.shadow ?? false);
  const [hasBorderRadius, setHasBorderRadius] = useState(initial?.config.borderRadius != null);
  const [borderRadius, setBorderRadius] = useState(initial?.config.borderRadius ?? 12);

  const isGradientBg = background.includes("gradient(");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const config: ThemeConfig = {
      fontHeading,
      fontBody,
      colors: { background, heading, body, accent, accent2: hasAccent2 ? accent2 : undefined },
      shadow: shadow || undefined,
      borderRadius: hasBorderRadius ? borderRadius : undefined,
    };
    if (initial) {
      await updateTheme.mutateAsync({ id: initial.id, input: { name, config } });
    } else {
      await createTheme.mutateAsync({ name, config });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div role="none" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="bg-background relative flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border p-5 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{initial ? "Sửa theme" : "Tạo theme mới"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="hover:bg-accent rounded p-1"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Tên theme</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Font tiêu đề</Label>
            <select
              className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-2 text-sm"
              value={fontHeading}
              onChange={(e) => setFontHeading(e.target.value)}
            >
              {FONT_STACK_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Font nội dung</Label>
            <select
              className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-2 text-sm"
              value={fontBody}
              onChange={(e) => setFontBody(e.target.value)}
            >
              {FONT_STACK_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Nền (màu hoặc gradient)</Label>
          <div className="flex gap-1.5">
            <Input
              type="color"
              value={isGradientBg ? "#ffffff" : background}
              onChange={(e) => setBackground(e.target.value)}
              className="h-9 w-14 p-1"
            />
            <Input
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="flex-1 font-mono text-xs"
              placeholder="#ffffff hoặc linear-gradient(...)"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setBackground(g)}
                className={cn("size-7 rounded-md border", background === g && "ring-primary ring-2")}
                style={{ backgroundImage: g }}
                aria-label="Gradient preset"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Màu tiêu đề</Label>
            <Input type="color" value={heading} onChange={(e) => setHeading(e.target.value)} className="h-9 p-1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Màu nội dung</Label>
            <Input type="color" value={body} onChange={(e) => setBody(e.target.value)} className="h-9 p-1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Màu nhấn (shape)</Label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-9 p-1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={hasAccent2}
                onChange={(e) => setHasAccent2(e.target.checked)}
                className="accent-primary size-4"
              />
              Màu nhấn phụ (icon)
            </label>
            {hasAccent2 && (
              <Input type="color" value={accent2} onChange={(e) => setAccent2(e.target.value)} className="h-9 p-1" />
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={shadow}
            onChange={(e) => setShadow(e.target.checked)}
            className="accent-primary size-4"
          />
          Đổ bóng mặc định cho shape/ảnh
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasBorderRadius}
              onChange={(e) => setHasBorderRadius(e.target.checked)}
              className="accent-primary size-4"
            />
            Bo góc mặc định cho shape/ảnh
          </label>
          {hasBorderRadius && (
            <Input
              type="number"
              min={0}
              max={200}
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value) || 0)}
            />
          )}
        </div>

        <div className="flex items-center gap-2 rounded-md border p-3" style={{ background }}>
          <span className="rounded px-2 py-1 text-sm font-bold" style={{ color: heading, fontFamily: fontHeading }}>
            Aa
          </span>
          <span className="text-xs" style={{ color: body, fontFamily: fontBody }}>
            Xem trước màu chữ
          </span>
          <span className="ml-auto flex gap-1.5">
            <span className="size-5 rounded-full border" style={{ backgroundColor: accent }} />
            {hasAccent2 && <span className="size-5 rounded-full border" style={{ backgroundColor: accent2 }} />}
          </span>
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Tạo theme"}
          </Button>
        </div>
      </form>
    </div>
  );
}
