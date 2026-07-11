"use client";

import { useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { AssetDto, SlideElement } from "@repo/shared";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SLIDE_ICONS } from "@/lib/editor/icon-map";
import { shapeStyle, shapeWrapperStyle } from "@/lib/editor/shapes";
import { iconBoxStyle, iconHasBox, imageContentStyle } from "@/lib/editor/element-style";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useEditorStore } from "@/stores/useEditorStore";
import { useEditorUiStore } from "@/stores/useEditorUiStore";
import { ChartContent } from "./chart-content";
import { MediaContent } from "./media-content";
import { TableContent } from "./table-content";
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
      const iconNode = (
        <Icon
          className="h-full w-full"
          style={{ color: element.props.color }}
          strokeWidth={element.props.strokeWidth ?? 2}
        />
      );
      if (!iconHasBox(element.props)) return iconNode;
      return (
        <div className="flex h-full w-full items-center justify-center" style={iconBoxStyle(element.props)}>
          {iconNode}
        </div>
      );
    }
    case "image":
      return <ImageContent element={element} slideId={slideId} />;
    case "table":
      return <EditableTable element={element} slideId={slideId} editing={editing} />;
    case "chart":
      return <ChartContent props={element.props} width={element.size.width} height={element.size.height} />;
    case "media":
      return <MediaContent props={element.props} mode="editor" />;
  }
}

/** Bảng trong editor: sửa ô + chọn ô/vùng (click/kéo) — selection nằm ở useEditorUiStore cho Inspector đọc. */
function EditableTable({
  element,
  slideId,
  editing,
}: {
  element: Extract<SlideElement, { type: "table" }>;
  slideId: string;
  editing: boolean;
}) {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const updateElement = useEditorStore((s) => s.updateElement);
  const selection = useEditorUiStore((s) =>
    s.tableSelection?.elementId === element.id ? s.tableSelection : null,
  );
  const setTableSelection = useEditorUiStore((s) => s.setTableSelection);

  // Thoát chế độ sửa (bỏ chọn element) → dọn vùng chọn ô
  useEffect(() => {
    if (!editing) {
      const cur = useEditorUiStore.getState().tableSelection;
      if (cur?.elementId === element.id) setTableSelection(null);
    }
  }, [editing, element.id, setTableSelection]);

  return (
    <TableContent
      props={element.props}
      editing={editing}
      selection={selection}
      onSelectCell={(pos, extend) => {
        if (extend) {
          const cur = useEditorUiStore.getState().tableSelection;
          if (cur?.elementId !== element.id) return;
          if (cur.focus.r === pos.r && cur.focus.c === pos.c) return;
          setTableSelection({ ...cur, focus: pos });
          // kéo sang ô khác = chọn vùng — bỏ bôi đen text đang dở
          window.getSelection()?.removeAllRanges();
        } else {
          setTableSelection({ elementId: element.id, anchor: pos, focus: pos });
        }
      }}
      onCommitCell={(row, col, value) => {
        pushHistory();
        updateElement(slideId, element.id, (el) => {
          if (el.type !== "table") return el;
          const rows = el.props.rows.map((r, ri) =>
            ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r,
          );
          return { ...el, props: { ...el.props, rows } };
        });
      }}
    />
  );
}

/** Ảnh: nếu chưa có url = placeholder có nút tải ảnh; ngược lại render ảnh + radius/shadow. */
function ImageContent({
  element,
  slideId,
}: {
  element: Extract<SlideElement, { type: "image" }>;
  slideId: string;
}) {
  const p = element.props;
  const { uploading, uploadFile } = useUploadImage();
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const updateElement = useEditorStore((s) => s.updateElement);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const res = await uploadFile(file);
    if (!res) return;
    setImageAsset(slideId, element.id, res.asset, pushHistory, updateElement);
  }

  if (p.url) {
    return (
      <img
        src={p.url}
        alt=""
        draggable={false}
        className="h-full w-full select-none"
        style={imageContentStyle(p)}
      />
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={(e) => {
        e.stopPropagation();
        inputRef.current?.click();
      }}
      className="text-muted-foreground hover:border-primary hover:text-primary flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 bg-gray-50/80 text-xs"
      style={{ borderRadius: imageContentStyle(p).borderRadius }}
    >
      {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
      <span>{uploading ? "Đang tải..." : "Nhấn đúp để tải ảnh"}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}

/** Gán asset thật vào 1 image element (dùng khi upload từ placeholder hoặc Inspector). */
export function setImageAsset(
  slideId: string,
  elementId: string,
  asset: AssetDto,
  pushHistory: () => void,
  updateElement: ReturnType<typeof useEditorStore.getState>["updateElement"],
) {
  pushHistory();
  updateElement(slideId, elementId, (el) =>
    el.type === "image"
      ? { ...el, props: { ...el.props, assetId: asset.id, url: asset.url } }
      : el,
  );
}

export function ElementView({ element, slideId }: { element: SlideElement; slideId: string }) {
  const zoom = useEditorStore((s) => s.zoom);
  const selected = useEditorStore((s) => s.selectedElementIds.includes(element.id));
  const selectionCount = useEditorStore((s) => s.selectedElementIds.length);
  const inActiveGroup = useEditorStore(
    (s) => element.groupId != null && s.activeGroupId === element.groupId,
  );
  const selectElement = useEditorStore((s) => s.selectElement);
  const enterGroupElement = useEditorStore((s) => s.enterGroupElement);
  const [editing, setEditing] = useState(false);

  // Offset đã-snap khi kéo (từ Canvas tính ra guide). Chọn PRIMITIVE (number|null) trong
  // selector — không tạo object mới → tránh lỗi "getSnapshot cached"; đồng thời element
  // KHÔNG bị kéo luôn nhận null nên không re-render mỗi frame kéo.
  const dragDx = useEditorUiStore((s) =>
    s.dragGuides && s.dragGuides.ids.includes(element.id) ? s.dragGuides.dx : null,
  );
  const dragDy = useEditorUiStore((s) =>
    s.dragGuides && s.dragGuides.ids.includes(element.id) ? s.dragGuides.dy : null,
  );
  const dragMoving = dragDx !== null;

  // Badge số thứ tự animation (hiện khi mở Animation Pane) — primitive để tránh re-render thừa
  const animPanelOpen = useEditorUiStore((s) => s.animationPanelOpen);
  const animOrder = useEditorStore((s) => {
    const slide = s.presentation?.slides.find((sl) => sl.id === slideId);
    const idx = slide?.animations?.findIndex((a) => a.elementId === element.id) ?? -1;
    return idx >= 0 ? idx + 1 : null;
  });

  // Chỉ hiện handle resize/rotate khi chọn ĐÚNG 1 element (đa chọn thì chỉ di chuyển)
  const soleSelected = selected && selectionCount === 1;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    disabled: element.locked || editing,
  });

  // Khi đang kéo: dùng offset đã-snap (Canvas quản lý cho cả element active lẫn thành viên nhóm).
  // Ngược lại dùng transform thô của dnd-kit (chia zoom về toạ độ logic).
  const tx = dragMoving ? (dragDx as number) : (transform?.x ?? 0) / zoom;
  const ty = dragMoving ? (dragDy as number) : (transform?.y ?? 0) / zoom;

  function handleDoubleClick(e: React.MouseEvent) {
    // Trong group nhưng chưa "vào" → vào group để sửa element con này
    if (element.groupId && !inActiveGroup) {
      enterGroupElement(element.id);
      return;
    }
    if (element.locked) return;
    if (element.type === "text") setEditing(true);
    if (element.type === "table") {
      setEditing(true);
      // chọn luôn ô dưới con trỏ để Inspector thao tác đúng vị trí ngay
      const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-cell]");
      if (cell) {
        const pos = { r: Number(cell.dataset.r), c: Number(cell.dataset.c) };
        useEditorUiStore
          .getState()
          .setTableSelection({ elementId: element.id, anchor: pos, focus: pos });
      }
    }
  }

  // Bảng: nhiều ô contentEditable — thoát chế độ sửa khi bỏ chọn element
  useEffect(() => {
    if (!selected && editing) setEditing(false);
  }, [selected, editing]);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-element-root
      data-el-id={element.id}
      role="none"
      onPointerDown={(e) => {
        e.stopPropagation();
        const additive = e.ctrlKey || e.metaKey;
        // Nếu đã nằm trong selection và không giữ Ctrl → giữ nguyên (cho kéo cả nhóm)
        if (additive) selectElement(element.id, { additive: true });
        else if (!selected) selectElement(element.id);
        listeners?.onPointerDown?.(e);
      }}
      onDoubleClick={handleDoubleClick}
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
        transform: `translate(${tx}px, ${ty}px) rotate(${element.rotation}deg)`,
      }}
    >
      <ElementContent
        element={element}
        slideId={slideId}
        editing={editing}
        onDoneEditing={() => setEditing(false)}
      />
      {soleSelected && !editing && !isDragging && !element.locked && (
        <SelectionHandles element={element} slideId={slideId} />
      )}
      {animPanelOpen && animOrder != null && (
        <span
          className="pointer-events-none absolute -top-2 -left-2 z-20 flex min-w-4 items-center justify-center rounded bg-amber-500 px-1 text-[11px] font-bold text-white shadow"
          aria-hidden
        >
          {animOrder}
        </span>
      )}
    </div>
  );
}
