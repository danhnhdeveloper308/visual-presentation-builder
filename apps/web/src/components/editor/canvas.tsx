"use client";

import { useEffect, useRef } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { Lock } from "lucide-react";
import { SLIDE_HEIGHT, SLIDE_WIDTH, type Slide } from "@repo/shared";
import { newIconElement } from "@/lib/editor/elements";
import { ICON_DRAG_MIME, recordRecentIcon } from "./icon-picker";
import { HeaderFooterLayer } from "./header-footer-layer";
import { ElementView } from "./element-view";
import { useEditorStore } from "@/stores/useEditorStore";

function slideBackground(slide: Slide): React.CSSProperties {
  switch (slide.background.type) {
    case "color":
      return { backgroundColor: slide.background.value };
    case "gradient":
      return { backgroundImage: slide.background.value };
    case "image":
      return {
        backgroundImage: `url(${slide.background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
  }
}

export function Canvas({ slide }: { slide: Slide }) {
  const zoom = useEditorStore((s) => s.zoom);
  const selectElement = useEditorStore((s) => s.selectElement);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const moveElement = useEditorStore((s) => s.moveElement);
  const headerFooter = useEditorStore((s) => s.presentation?.headerFooter);
  const slideIndex = useEditorStore(
    (s) => s.presentation?.slides.findIndex((sl) => sl.id === slide.id) ?? 0,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit zoom theo kích thước vùng canvas khi mở editor
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const fit = Math.min(
      (node.clientWidth - 64) / SLIDE_WIDTH,
      (node.clientHeight - 64) / SLIDE_HEIGHT,
    );
    if (fit > 0) useEditorStore.getState().setZoom(Math.min(1, fit));
  }, []);

  // distance 4px: click chọn element không bị nuốt bởi drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    if (delta.x === 0 && delta.y === 0) return;
    pushHistory(); // snapshot TRƯỚC khi commit — 1 bước undo cho cả thao tác drag
    moveElement(slide.id, String(active.id), delta.x / zoom, delta.y / zoom);
  }

  /** Thả icon kéo từ IconPicker — toạ độ logic = toạ độ chuột trong khung đã scale / zoom. */
  function handleIconDrop(e: React.DragEvent<HTMLDivElement>) {
    const name = e.dataTransfer.getData(ICON_DRAG_MIME);
    if (!name || slide.locked) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: Math.round((e.clientX - rect.left) / zoom) - 40,
      y: Math.round((e.clientY - rect.top) / zoom) - 40,
    };
    useEditorStore.getState().addElement(slide.id, newIconElement(slide.elements, name, position));
    recordRecentIcon(name);
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-auto p-8">
      <div
        className="mx-auto"
        style={{ width: SLIDE_WIDTH * zoom, height: SLIDE_HEIGHT * zoom }}
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            role="none"
            onPointerDown={() => selectElement(null)}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes(ICON_DRAG_MIME)) e.preventDefault();
            }}
            onDrop={handleIconDrop}
            className="relative overflow-hidden shadow-xl"
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              ...slideBackground(slide),
            }}
          >
            {/* Slide khóa: chặn mọi tương tác với element cho tới khi mở khóa */}
            <div className="contents" style={slide.locked ? { pointerEvents: "none" } : undefined}>
              {slide.elements.map((el) => (
                <ElementView key={el.id} element={el} slideId={slide.id} />
              ))}
            </div>
            <HeaderFooterLayer config={headerFooter} slide={slide} slideIndex={slideIndex} />
          </div>
        </DndContext>
      </div>

      {slide.locked && (
        <div className="bg-background/90 text-muted-foreground absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-3 py-1 text-xs shadow-sm">
          <Lock className="size-3.5" /> Slide đang khóa — mở khóa ở sidebar để chỉnh sửa
        </div>
      )}
    </div>
  );
}
