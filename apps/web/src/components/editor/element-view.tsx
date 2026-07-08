"use client";

import { useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { SlideElement } from "@repo/shared";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SLIDE_ICONS } from "@/lib/editor/icon-map";
import { shapeStyle, shapeWrapperStyle } from "@/lib/editor/shapes";
import { useEditorStore } from "@/stores/useEditorStore";
import { SelectionHandles } from "./selection-handles";

function ElementContent({
  element,
  slideId,
  editing,
  onDoneEditing,
}: {
  element: SlideElement;
  slideId: string;
  editing: boolean;
  onDoneEditing: () => void;
}) {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const updateElement = useEditorStore((s) => s.updateElement);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  switch (element.type) {
    case "text": {
      const p = element.props;
      return (
        <div
          ref={textRef}
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={(e) => {
            const content = e.currentTarget.textContent ?? "";
            if (content !== p.content) {
              pushHistory();
              updateElement(slideId, element.id, (el) =>
                el.type === "text" ? { ...el, props: { ...el.props, content } } : el,
              );
            }
            onDoneEditing();
          }}
          className={cn("h-full w-full outline-none", editing && "cursor-text")}
          style={{
            fontFamily: p.fontFamily,
            fontSize: p.fontSize,
            fontWeight: p.fontWeight,
            color: p.color,
            textAlign: p.align,
            lineHeight: p.lineHeight,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {p.content}
        </div>
      );
    }
    case "shape":
      // wrapper ngoài giữ drop-shadow — đặt cùng div bị clip-path thì bóng bị cắt
      return (
        <div className="h-full w-full" style={shapeWrapperStyle(element.props)}>
          <div className="h-full w-full" style={shapeStyle(element.props)} />
        </div>
      );
    case "icon": {
      const Icon = SLIDE_ICONS[element.props.name] ?? Sparkles;
      return (
        <Icon
          className="h-full w-full"
          style={{ color: element.props.color }}
          strokeWidth={element.props.strokeWidth ?? 2}
        />
      );
    }
    case "image": {
      const p = element.props;
      return (
        <img
          src={p.url}
          alt=""
          draggable={false}
          className="h-full w-full select-none"
          style={{ objectFit: p.objectFit, borderRadius: p.borderRadius }}
        />
      );
    }
  }
}

export function ElementView({ element, slideId }: { element: SlideElement; slideId: string }) {
  const zoom = useEditorStore((s) => s.zoom);
  const selected = useEditorStore((s) => s.selectedElementId === element.id);
  const selectElement = useEditorStore((s) => s.selectElement);
  const [editing, setEditing] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    disabled: element.locked || editing,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-element-root
      role="none"
      onPointerDown={(e) => {
        e.stopPropagation();
        selectElement(element.id);
        listeners?.onPointerDown?.(e);
      }}
      onDoubleClick={() => {
        if (element.type === "text" && !element.locked) setEditing(true);
      }}
      className={cn(
        "absolute",
        !editing && "cursor-grab",
        isDragging && "cursor-grabbing opacity-90",
        selected && "ring-primary ring-2 ring-offset-1",
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
        opacity: element.opacity,
        // Delta của dnd-kit là px màn hình — chia zoom để khớp toạ độ logic trong khung đã scale
        transform: `translate(${(transform?.x ?? 0) / zoom}px, ${(transform?.y ?? 0) / zoom}px) rotate(${element.rotation}deg)`,
      }}
    >
      <ElementContent
        element={element}
        slideId={slideId}
        editing={editing}
        onDoneEditing={() => setEditing(false)}
      />
      {selected && !editing && !isDragging && !element.locked && (
        <SelectionHandles element={element} slideId={slideId} />
      )}
    </div>
  );
}
