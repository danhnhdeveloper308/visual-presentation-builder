"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CloudAlert,
  Image as ImageIcon,
  Loader2,
  Minus,
  PanelBottom,
  Plus,
  Redo2,
  Save,
  Shapes,
  Sparkles,
  Type,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AssetDto, PresignAssetResult, ShapeKind } from "@repo/shared";
import { api } from "@/lib/api";
import { useUpdateProjectMeta } from "@/hooks/mutations/useUpdateProjectMeta";
import {
  newIconElement,
  newImageElement,
  newShapeElement,
  newTextElement,
} from "@/lib/editor/elements";
import { SHAPE_CATEGORIES, SHAPE_OPTIONS, shapeStyle } from "@/lib/editor/shapes";
import { Button } from "@/components/ui/button";
import { IconPicker, recordRecentIcon } from "./icon-picker";
import { HeaderFooterDialog } from "./header-footer-dialog";
import { useEditorStore, type SaveState } from "@/stores/useEditorStore";

/** Preview thu nhỏ của 1 shape — vẽ bằng chính clip-path/borderRadius của shape đó. */
export function ShapeThumb({ kind, className }: { kind: ShapeKind; className?: string }) {
  if (kind === "line") return <div className="h-0.5 w-5 rounded bg-current" />;
  return (
    <div
      className={className ?? "size-5"}
      style={shapeStyle({ shape: kind, fill: "currentColor" })}
    />
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  switch (state) {
    case "saved":
      return (
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Check className="size-3.5" /> Đã lưu
        </span>
      );
    case "dirty":
      return (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <span className="size-1.5 rounded-full bg-amber-500" /> Chưa lưu
        </span>
      );
    case "saving":
      return (
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Loader2 className="size-3.5 animate-spin" /> Đang lưu...
        </span>
      );
    case "error":
      return (
        <span className="text-destructive flex items-center gap-1 text-xs">
          <CloudAlert className="size-3.5" /> Lưu thất bại
        </span>
      );
    case "conflict":
      return null; // banner riêng xử lý
  }
}

async function loadImageSize(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Không đọc được ảnh"));
      img.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Toolbar({
  projectId,
  title,
  onSave,
}: {
  projectId: string;
  title: string;
  onSave: () => void;
}) {
  const store = useEditorStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const [headerFooterOpen, setHeaderFooterOpen] = useState(false);
  const updateMeta = useUpdateProjectMeta(projectId);

  function handleBack(e: React.MouseEvent) {
    if (store.saveState === "dirty" || store.saveState === "saving" || store.saveState === "error") {
      e.preventDefault();
      if (window.confirm("Có thay đổi chưa lưu — rời đi sẽ mất. Vẫn quay về?")) {
        router.push("/dashboard");
      }
    }
  }

  function commitTitle(value: string) {
    const next = value.trim();
    setEditingTitle(false);
    if (next && next !== title) updateMeta.mutate({ title: next });
  }

  const slide = store.presentation?.slides.find((s) => s.id === store.activeSlideId);
  const canUndo = store.history.past.length > 0;
  const canRedo = store.history.future.length > 0;

  function addToSlide(factory: (elements: NonNullable<typeof slide>["elements"]) => Parameters<typeof store.addElement>[1]) {
    if (!slide) return;
    store.addElement(slide.id, factory(slide.elements));
  }

  async function handleFile(file: File) {
    if (!slide) return;
    setUploading(true);
    try {
      const { width, height } = await loadImageSize(file);
      const presign = await api.post<PresignAssetResult>("/assets/presign", {
        mimeType: file.type,
        sizeBytes: file.size,
      });
      // PUT thẳng lên R2 — fetch thô vì đây là URL ngoài, không qua wrapper API
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) throw new Error("Upload thất bại");
      const asset = await api.post<AssetDto>("/assets/confirm", {
        key: presign.key,
        width,
        height,
      });
      store.addElement(slide.id, newImageElement(slide.elements, asset));
    } catch {
      window.alert("Upload ảnh thất bại — thử lại.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <header className="flex items-center gap-2 border-b px-3 py-2">
      <Link
        href="/dashboard"
        onClick={handleBack}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
      </Link>
      {editingTitle ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={(e) => commitTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setEditingTitle(false);
          }}
          className="border-input max-w-56 rounded-md border bg-transparent px-2 py-0.5 text-sm font-medium outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingTitle(true)}
          className="hover:bg-accent max-w-48 truncate rounded px-1 text-sm font-medium"
          title="Click để đổi tên"
        >
          {title}
        </button>
      )}
      <SaveIndicator state={store.saveState} />
      <Button
        size="sm"
        onClick={onSave}
        disabled={store.saveState !== "dirty" && store.saveState !== "error"}
      >
        {store.saveState === "saving" ? <Loader2 className="animate-spin" /> : <Save />}
        Lưu
      </Button>

      <div className="mx-2 h-5 w-px bg-border" />

      <Button variant="ghost" size="sm" onClick={() => addToSlide((els) => newTextElement(els))}>
        <Type /> Text
      </Button>
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setShapeMenuOpen((o) => !o)}>
          <Shapes /> Hình khối
        </Button>
        {shapeMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              role="none"
              onClick={() => setShapeMenuOpen(false)}
            />
            <div className="bg-popover absolute top-full left-0 z-50 mt-1 flex max-h-96 w-80 flex-col gap-2 overflow-y-auto rounded-md border p-3 shadow-md">
              {SHAPE_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <p className="text-muted-foreground mb-1 text-[11px] font-medium">{cat.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {SHAPE_OPTIONS.filter((o) => o.category === cat.id).map(
                      ({ kind, label, size }) => (
                        <button
                          key={kind}
                          type="button"
                          title={label}
                          onClick={() => {
                            addToSlide((els) => newShapeElement(els, kind, size));
                            setShapeMenuOpen(false);
                          }}
                          className="hover:bg-accent flex aspect-square items-center justify-center rounded-md"
                        >
                          <ShapeThumb kind={kind} />
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setIconMenuOpen((o) => !o)}>
          <Sparkles /> Icon
        </Button>
        {iconMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              role="none"
              onClick={() => setIconMenuOpen(false)}
            />
            <div className="bg-popover absolute top-full left-0 z-50 mt-1 rounded-md border p-3 shadow-md">
              <IconPicker
                onPick={(name) => {
                  addToSlide((els) => newIconElement(els, name));
                  recordRecentIcon(name);
                  setIconMenuOpen(false);
                }}
              />
            </div>
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon />} Ảnh
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <Button variant="ghost" size="sm" onClick={() => setHeaderFooterOpen(true)}>
        <PanelBottom /> Header/Footer
      </Button>
      {headerFooterOpen && <HeaderFooterDialog onClose={() => setHeaderFooterOpen(false)} />}

      <div className="flex-1" />

      <Button variant="ghost" size="icon" disabled={!canUndo} onClick={store.undo} aria-label="Hoàn tác">
        <Undo2 />
      </Button>
      <Button variant="ghost" size="icon" disabled={!canRedo} onClick={store.redo} aria-label="Làm lại">
        <Redo2 />
      </Button>

      <div className="mx-2 h-5 w-px bg-border" />

      <Button variant="ghost" size="icon" onClick={() => store.setZoom(store.zoom - 0.1)} aria-label="Thu nhỏ">
        <Minus />
      </Button>
      <span className="text-muted-foreground w-12 text-center text-xs tabular-nums">
        {Math.round(store.zoom * 100)}%
      </span>
      <Button variant="ghost" size="icon" onClick={() => store.setZoom(store.zoom + 0.1)} aria-label="Phóng to">
        <Plus />
      </Button>
    </header>
  );
}
