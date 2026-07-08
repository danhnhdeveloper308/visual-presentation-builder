"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { Presentation, Slide } from "@repo/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SlidePreview } from "@/components/template/slide-preview";
import { useEditorStore } from "@/stores/useEditorStore";

function SlideAction({
  Icon,
  label,
  onClick,
  destructive,
  disabled,
}: {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "bg-background/90 hover:bg-background rounded p-1 shadow-sm disabled:opacity-30",
        destructive && "text-destructive",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function SortableSlide({
  slide,
  index,
  total,
  headerFooter,
}: {
  slide: Slide;
  index: number;
  total: number;
  headerFooter: Presentation["headerFooter"];
}) {
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const removeSlide = useEditorStore((s) => s.removeSlide);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const moveSlideBy = useEditorStore((s) => s.moveSlideBy);
  const toggleSlideLocked = useEditorStore((s) => s.toggleSlideLocked);
  const toggleSlideHidden = useEditorStore((s) => s.toggleSlideHidden);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => setActiveSlide(slide.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setActiveSlide(slide.id);
      }}
      // shrink-0: item flex-col KHÔNG được co lại khi nhiều slide — đây chính là
      // nguyên nhân sidebar "không scroll" (item bị nén thay vì tràn ra ngoài).
      // content-visibility: bỏ qua render item ngoài viewport → mượt với 100–300 slide.
      className={cn(
        "group relative aspect-video min-h-16 w-full shrink-0 cursor-pointer overflow-hidden rounded-md border-2 text-left transition-colors [content-visibility:auto]",
        slide.id === activeSlideId
          ? "border-primary"
          : "border-transparent hover:border-muted-foreground/30",
        isDragging && "z-10 opacity-80",
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        containIntrinsicSize: "auto 96px",
      }}
    >
      {/* Preview thật của slide (thu nhỏ) */}
      <SlidePreview
        slide={slide}
        headerFooter={headerFooter}
        slideIndex={index}
        className={cn("pointer-events-none rounded-lg", slide.hidden && "opacity-40")}
      />
      <span className="bg-background/70 text-foreground absolute bottom-1 left-1 rounded px-1 text-[10px] font-medium">
        {index + 1}
      </span>

      {/* Badge trạng thái (luôn hiện khi bật) */}
      <span className="absolute bottom-1 right-1 flex gap-1">
        {slide.locked && <Lock className="text-muted-foreground size-3" aria-label="Slide đang khóa" />}
        {slide.hidden && <EyeOff className="text-muted-foreground size-3" aria-label="Slide đang ẩn" />}
      </span>

      {/* Action chỉ hiện khi hover */}
      <div className="absolute inset-x-1 top-1 hidden flex-wrap justify-end gap-1 group-hover:flex">
        <SlideAction Icon={Copy} label="Nhân bản slide" onClick={() => duplicateSlide(slide.id)} />
        <SlideAction
          Icon={ChevronUp}
          label="Chuyển lên"
          disabled={index === 0}
          onClick={() => moveSlideBy(slide.id, -1)}
        />
        <SlideAction
          Icon={ChevronDown}
          label="Chuyển xuống"
          disabled={index === total - 1}
          onClick={() => moveSlideBy(slide.id, 1)}
        />
        <SlideAction
          Icon={slide.locked ? LockOpen : Lock}
          label={slide.locked ? "Mở khóa slide" : "Khóa slide"}
          onClick={() => toggleSlideLocked(slide.id)}
        />
        <SlideAction
          Icon={slide.hidden ? Eye : EyeOff}
          label={slide.hidden ? "Hiện slide khi trình chiếu" : "Ẩn slide khi trình chiếu"}
          onClick={() => toggleSlideHidden(slide.id)}
        />
        <SlideAction
          Icon={Trash2}
          label="Xóa slide"
          destructive
          disabled={total <= 1}
          onClick={() => removeSlide(slide.id)}
        />
      </div>
    </div>
  );
}

export function SlidePanel({ presentation }: { presentation: Presentation }) {
  const addSlide = useEditorStore((s) => s.addSlide);
  const reorderSlides = useEditorStore((s) => s.reorderSlides);

  // distance 5px: click chọn slide không bị nuốt bởi drag reorder
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = presentation.slides.map((s) => s.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) reorderSlides(from, to);
  }

  return (
    <aside className="bg-muted/30 flex w-48 shrink-0 flex-col gap-2 overflow-y-auto scroll-smooth border-r p-3">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={presentation.slides.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {presentation.slides.map((slide, index) => (
            <SortableSlide
              key={slide.id}
              slide={slide}
              index={index}
              total={presentation.slides.length}
              headerFooter={presentation.headerFooter}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" className="shrink-0" onClick={addSlide}>
        <Plus />
        Thêm slide
      </Button>
    </aside>
  );
}
