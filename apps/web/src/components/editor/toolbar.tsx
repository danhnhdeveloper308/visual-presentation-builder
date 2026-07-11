"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartPie,
  Check,
  CloudAlert,
  Donut,
  Film,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Minus,
  MonitorPlay,
  Music,
  PanelBottom,
  Play,
  Plus,
  Redo2,
  Save,
  Shapes,
  Share2,
  Sparkles,
  Table,
  Type,
  Undo2,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChartType, MediaKind, ShapeKind } from "@repo/shared";
import { useUpdateProjectMeta } from "@/hooks/mutations/useUpdateProjectMeta";
import { useUploadImage } from "@/hooks/useUploadImage";
import {
  newChartElement,
  newIconElement,
  newImageElement,
  newMediaElement,
  newShapeElement,
  newTableElement,
  newTextElement,
} from "@/lib/editor/elements";
import { SHAPE_CATEGORIES, SHAPE_OPTIONS, shapeStyle } from "@/lib/editor/shapes";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { IconPicker, recordRecentIcon } from "./icon-picker";
import { HeaderFooterDialog } from "./header-footer-dialog";
import { SaveAsTemplateDialog } from "./save-as-template-dialog";
import { ExportMenu } from "./export-menu";
import { ShareDialog } from "./share-dialog";
import { useEditorStore, type SaveState } from "@/stores/useEditorStore";
import { useEditorUiStore } from "@/stores/useEditorUiStore";

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

export function Toolbar({
  projectId,
  title,
  role = "owner",
  onSave,
}: {
  projectId: string;
  title: string;
  /** Quyền của user hiện tại — nút Chia sẻ chỉ hiện cho owner. */
  role?: "owner" | "editor" | "viewer";
  onSave: () => void;
}) {
  const store = useEditorStore();
  const toggleLayoutPanel = useEditorUiStore((s) => s.toggleLayoutPanel);
  const layoutPanelOpen = useEditorUiStore((s) => s.layoutPanelOpen);
  const toggleAnimationPanel = useEditorUiStore((s) => s.toggleAnimationPanel);
  const animationPanelOpen = useEditorUiStore((s) => s.animationPanelOpen);
  const setPresenting = useEditorUiStore((s) => s.setPresenting);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile } = useUploadImage();
  const [editingTitle, setEditingTitle] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const [mediaMenuOpen, setMediaMenuOpen] = useState(false);
  const [headerFooterOpen, setHeaderFooterOpen] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const updateMeta = useUpdateProjectMeta(projectId);
  const confirm = useConfirm();

  function handleBack(e: React.MouseEvent) {
    if (store.saveState === "dirty" || store.saveState === "saving" || store.saveState === "error") {
      e.preventDefault();
      void confirm({
        title: "Có thay đổi chưa lưu",
        description: "Rời đi bây giờ sẽ mất các thay đổi chưa lưu. Vẫn quay về Dashboard?",
        destructive: true,
        confirmText: "Rời đi",
        cancelText: "Ở lại",
      }).then((ok) => {
        if (ok) router.push("/dashboard");
      });
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
    const res = await uploadFile(file);
    if (res) store.addElement(slide.id, newImageElement(slide.elements, res.asset));
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

      <Button
        variant={layoutPanelOpen ? "secondary" : "ghost"}
        size="sm"
        onClick={toggleLayoutPanel}
      >
        <LayoutTemplate /> Bố cục
      </Button>
      <Button
        variant={animationPanelOpen ? "secondary" : "ghost"}
        size="sm"
        onClick={toggleAnimationPanel}
      >
        <Wand2 /> Hiệu ứng
      </Button>
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
      <Button variant="ghost" size="sm" onClick={() => addToSlide((els) => newTableElement(els))}>
        <Table /> Bảng
      </Button>
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setChartMenuOpen((o) => !o)}>
          <ChartColumn /> Biểu đồ
        </Button>
        {chartMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              role="none"
              onClick={() => setChartMenuOpen(false)}
            />
            <div className="bg-popover absolute top-full left-0 z-50 mt-1 flex w-44 flex-col gap-0.5 rounded-md border p-1.5 shadow-md">
              {(
                [
                  { type: "bar", label: "Biểu đồ cột", Icon: ChartColumn },
                  { type: "line", label: "Biểu đồ đường", Icon: ChartLine },
                  { type: "area", label: "Biểu đồ vùng", Icon: ChartArea },
                  { type: "pie", label: "Biểu đồ tròn", Icon: ChartPie },
                  { type: "donut", label: "Biểu đồ donut", Icon: Donut },
                ] satisfies { type: ChartType; label: string; Icon: typeof ChartColumn }[]
              ).map(({ type, label, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    addToSlide((els) => newChartElement(els, type));
                    setChartMenuOpen(false);
                  }}
                  className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                >
                  <Icon className="text-muted-foreground size-4" /> {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setMediaMenuOpen((o) => !o)}>
          <Film /> Media
        </Button>
        {mediaMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              role="none"
              onClick={() => setMediaMenuOpen(false)}
            />
            <div className="bg-popover absolute top-full left-0 z-50 mt-1 flex w-52 flex-col gap-0.5 rounded-md border p-1.5 shadow-md">
              {(
                [
                  { kind: "video", label: "Video", Icon: Film },
                  { kind: "audio", label: "Âm thanh", Icon: Music },
                  { kind: "embed", label: "Nhúng YouTube/Vimeo", Icon: MonitorPlay },
                ] satisfies { kind: MediaKind; label: string; Icon: typeof Film }[]
              ).map(({ kind, label, Icon }) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    addToSlide((els) => newMediaElement(els, kind));
                    setMediaMenuOpen(false);
                  }}
                  className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                >
                  <Icon className="text-muted-foreground size-4" /> {label}
                </button>
              ))}
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
      <Button variant="ghost" size="sm" onClick={() => setSaveAsTemplateOpen(true)}>
        <LayoutTemplate /> Lưu làm template
      </Button>
      {saveAsTemplateOpen && (
        <SaveAsTemplateDialog
          projectId={projectId}
          defaultTitle={title}
          onClose={() => setSaveAsTemplateOpen(false)}
        />
      )}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        disabled={!store.presentation || store.presentation.slides.every((s) => s.hidden)}
        onClick={() => setPresenting(true)}
        title="Trình chiếu từ slide hiện tại (bỏ qua slide ẩn)"
      >
        <Play /> Trình chiếu
      </Button>
      <ExportMenu title={title} />
      {role === "owner" && (
        <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}>
          <Share2 /> Chia sẻ
        </Button>
      )}
      {shareOpen && <ShareDialog projectId={projectId} onClose={() => setShareOpen(false)} />}

      <div className="mx-2 h-5 w-px bg-border" />

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
