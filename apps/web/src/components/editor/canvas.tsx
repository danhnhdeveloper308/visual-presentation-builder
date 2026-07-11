"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { Lock } from "lucide-react";
import { SLIDE_HEIGHT, SLIDE_WIDTH, type Slide } from "@repo/shared";
import { newIconElement } from "@/lib/editor/elements";
import { computeAlignment, unionBox } from "@/lib/editor/alignment";
import { buildLayoutSlide } from "@/lib/editor/layouts";
import { ICON_DRAG_MIME, recordRecentIcon } from "./icon-picker";
import { LAYOUT_DRAG_MIME } from "./layout-panel";
import { HeaderFooterLayer } from "./header-footer-layer";
import { ElementView } from "./element-view";
import { useEditorStore } from "@/stores/useEditorStore";
import { useEditorUiStore } from "@/stores/useEditorUiStore";

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

type MarqueeBox = { x: number; y: number; w: number; h: number };

/**
 * Vẽ đường căn chỉnh (nét đứt) khi kéo. Tách thành component riêng để chỉ nó
 * re-render theo `dragGuides` — Canvas và các ElementView khác không bị kéo re-render.
 */
function AlignmentGuides({ zoom }: { zoom: number }) {
  const guides = useEditorUiStore((s) => s.dragGuides);
  if (!guides || (guides.vertical.length === 0 && guides.horizontal.length === 0)) return null;
  // Giữ độ dày ~1.5px màn hình ở mọi mức zoom (đường nằm trong khung đã scale theo zoom)
  const thickness = 1.5 / zoom;
  const color = "#ec4899"; // hồng — phân biệt với ring chọn (primary)
  return (
    <>
      {guides.vertical.map((x) => (
        <div
          key={`v${x}`}
          className="pointer-events-none absolute top-0 z-40"
          style={{ left: x, height: SLIDE_HEIGHT, borderLeft: `${thickness}px dashed ${color}` }}
        />
      ))}
      {guides.horizontal.map((y) => (
        <div
          key={`h${y}`}
          className="pointer-events-none absolute left-0 z-40"
          style={{ top: y, width: SLIDE_WIDTH, borderTop: `${thickness}px dashed ${color}` }}
        />
      ))}
    </>
  );
}

export function Canvas({ slide }: { slide: Slide }) {
  const zoom = useEditorStore((s) => s.zoom);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const moveElement = useEditorStore((s) => s.moveElement);
  const headerFooter = useEditorStore((s) => s.presentation?.headerFooter);
  const slideIndex = useEditorStore(
    (s) => s.presentation?.slides.findIndex((sl) => sl.id === slide.id) ?? 0,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Marquee (kéo vùng chọn): toạ độ logic 1280×720. start giữ ở ref để pointerup không đọc state cũ.
  const [marquee, setMarquee] = useState<MarqueeBox | null>(null);
  const marqueeStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);

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

  /**
   * Tính offset đã-snap + guide cho lần kéo hiện tại. Dùng chung cho onDragMove (vẽ guide)
   * và onDragEnd (commit) để hình ảnh khi kéo và vị trí lưu KHỚP nhau (không nhảy khi thả).
   */
  function resolveDrag(
    event: DragMoveEvent | DragEndEvent,
  ): { ids: string[]; dx: number; dy: number; vertical: number[]; horizontal: number[] } | null {
    const activeId = String(event.active.id);
    const rawDx = event.delta.x / zoom;
    const rawDy = event.delta.y / zoom;
    const { selectedElementIds } = useEditorStore.getState();
    const ids =
      selectedElementIds.length > 1 && selectedElementIds.includes(activeId)
        ? selectedElementIds
        : [activeId];
    const dragged = slide.elements.filter((el) => ids.includes(el.id));
    if (dragged.length === 0) return null;

    // Hộp bao chung của phần đang kéo, đã cộng delta thô
    const base = unionBox(
      dragged.map((el) => ({ x: el.position.x, y: el.position.y, w: el.size.width, h: el.size.height })),
    );
    if (!base) return null;
    const box = { x: base.x + rawDx, y: base.y + rawDy, w: base.w, h: base.h };

    const targets = slide.elements
      .filter((el) => !ids.includes(el.id))
      .map((el) => ({ x: el.position.x, y: el.position.y, w: el.size.width, h: el.size.height }));

    const { adjustX, adjustY, vertical, horizontal } = computeAlignment(box, targets, zoom);
    return { ids, dx: rawDx + adjustX, dy: rawDy + adjustY, vertical, horizontal };
  }

  function handleDragMove(event: DragMoveEvent) {
    const r = resolveDrag(event);
    if (r) {
      useEditorUiStore.getState().setDragGuides({
        ids: r.ids,
        dx: r.dx,
        dy: r.dy,
        vertical: r.vertical,
        horizontal: r.horizontal,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const r = resolveDrag(event);
    if (!r || (event.delta.x === 0 && event.delta.y === 0)) {
      useEditorUiStore.getState().setDragGuides(null);
      return;
    }
    pushHistory(); // snapshot TRƯỚC khi commit — 1 bước undo cho cả thao tác drag
    if (r.ids.length > 1) {
      useEditorStore.getState().moveElements(slide.id, r.ids, r.dx, r.dy);
    } else {
      moveElement(slide.id, r.ids[0]!, r.dx, r.dy);
    }
    // Xoá guide SAU khi commit vị trí → không nhấp nháy
    useEditorUiStore.getState().setDragGuides(null);
  }

  /** Toạ độ chuột → toạ độ logic (kẹp trong khung slide). */
  function toLogic(e: React.PointerEvent<HTMLDivElement>, rect: DOMRect): { x: number; y: number } {
    return {
      x: Math.max(0, Math.min(SLIDE_WIDTH, (e.clientX - rect.left) / zoom)),
      y: Math.max(0, Math.min(SLIDE_HEIGHT, (e.clientY - rect.top) / zoom)),
    };
  }

  // Bấm nền slide (không trúng element — element đã stopPropagation) → bắt đầu marquee
  function handleFramePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const p = toLogic(e, e.currentTarget.getBoundingClientRect());
    marqueeStart.current = { x: p.x, y: p.y, pointerId: e.pointerId };
    setMarquee({ x: p.x, y: p.y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleFramePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = marqueeStart.current;
    if (!s) return;
    const p = toLogic(e, e.currentTarget.getBoundingClientRect());
    setMarquee({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    });
  }

  function handleFramePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const s = marqueeStart.current;
    marqueeStart.current = null;
    setMarquee(null);
    if (!s) return;
    try {
      e.currentTarget.releasePointerCapture(s.pointerId);
    } catch {
      // pointer đã nhả
    }
    const p = toLogic(e, e.currentTarget.getBoundingClientRect());
    const box: MarqueeBox = {
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    };
    const store = useEditorStore.getState();
    // Di chuyển < 4px logic = coi như click nền → bỏ chọn
    if (box.w < 4 && box.h < 4) {
      store.selectElement(null);
      return;
    }
    if (slide.locked) return;
    // Chọn element có bounding box GIAO với vùng marquee (bỏ qua element khoá)
    const ids = slide.elements
      .filter(
        (el) =>
          !el.locked &&
          el.position.x < box.x + box.w &&
          el.position.x + el.size.width > box.x &&
          el.position.y < box.y + box.h &&
          el.position.y + el.size.height > box.y,
      )
      .map((el) => el.id);
    if (ids.length > 0) store.setSelection(ids);
    else store.selectElement(null);
  }

  /** Thả icon/layout kéo từ panel. */
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (slide.locked) return;
    const store = useEditorStore.getState();

    const layoutId = e.dataTransfer.getData(LAYOUT_DRAG_MIME);
    if (layoutId) {
      const layoutSlide = buildLayoutSlide(layoutId);
      if (layoutSlide) {
        e.preventDefault();
        store.applyLayoutToSlide(slide.id, layoutSlide);
      }
      return;
    }

    const name = e.dataTransfer.getData(ICON_DRAG_MIME);
    if (name) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: Math.round((e.clientX - rect.left) / zoom) - 40,
        y: Math.round((e.clientY - rect.top) / zoom) - 40,
      };
      store.addElement(slide.id, newIconElement(slide.elements, name, position));
      recordRecentIcon(name);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-auto p-8">
      <div
        className="mx-auto"
        style={{ width: SLIDE_WIDTH * zoom, height: SLIDE_HEIGHT * zoom }}
      >
        <DndContext
          sensors={sensors}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={() => useEditorUiStore.getState().setDragGuides(null)}
        >
          <div
            role="none"
            data-slide-frame
            onPointerDown={handleFramePointerDown}
            onPointerMove={handleFramePointerMove}
            onPointerUp={handleFramePointerUp}
            onDragOver={(e) => {
              if (
                e.dataTransfer.types.includes(ICON_DRAG_MIME) ||
                e.dataTransfer.types.includes(LAYOUT_DRAG_MIME)
              )
                e.preventDefault();
            }}
            onDrop={handleDrop}
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
            {marquee && (
              <div
                className="border-primary bg-primary/10 pointer-events-none absolute z-50 border-2"
                style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h }}
              />
            )}
            <AlignmentGuides zoom={zoom} />
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
