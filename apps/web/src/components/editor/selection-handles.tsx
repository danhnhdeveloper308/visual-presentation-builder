"use client";

import { useRef } from "react";
import type { SlideElement } from "@repo/shared";
import { useEditorStore } from "@/stores/useEditorStore";

type HandleDir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: { dir: HandleDir; x: number; y: number; cursor: string }[] = [
  { dir: "nw", x: 0, y: 0, cursor: "nwse-resize" },
  { dir: "n", x: 0.5, y: 0, cursor: "ns-resize" },
  { dir: "ne", x: 1, y: 0, cursor: "nesw-resize" },
  { dir: "e", x: 1, y: 0.5, cursor: "ew-resize" },
  { dir: "se", x: 1, y: 1, cursor: "nwse-resize" },
  { dir: "s", x: 0.5, y: 1, cursor: "ns-resize" },
  { dir: "sw", x: 0, y: 1, cursor: "nesw-resize" },
  { dir: "w", x: 0, y: 0.5, cursor: "ew-resize" },
];

const MIN_SIZE = 6; // đủ nhỏ cho line mỏng vẫn resize được

type ResizeStart = {
  pointerX: number;
  pointerY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pushed: boolean;
};

export function SelectionHandles({
  element,
  slideId,
}: {
  element: SlideElement;
  slideId: string;
}) {
  const zoom = useEditorStore((s) => s.zoom);
  const start = useRef<ResizeStart | null>(null);
  const rotateStart = useRef<{ centerX: number; centerY: number; pushed: boolean } | null>(null);

  // pushHistory đúng 1 lần cho cả thao tác — gọi TRƯỚC lần mutate đầu tiên
  function historyOnce(flagHolder: { pushed: boolean }) {
    if (!flagHolder.pushed) {
      useEditorStore.getState().pushHistory();
      flagHolder.pushed = true;
    }
  }

  function beginResize(e: React.PointerEvent, dir: HandleDir) {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    start.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      x: element.position.x,
      y: element.position.y,
      width: element.size.width,
      height: element.size.height,
      pushed: false,
    };

    const onMove = (ev: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      // px màn hình → toạ độ logic của khung 1280×720
      const dx = (ev.clientX - s.pointerX) / zoom;
      const dy = (ev.clientY - s.pointerY) / zoom;

      let { x, y, width, height } = s;
      if (dir.includes("e")) width = Math.max(MIN_SIZE, s.width + dx);
      if (dir.includes("s")) height = Math.max(MIN_SIZE, s.height + dy);
      if (dir.includes("w")) {
        width = Math.max(MIN_SIZE, s.width - dx);
        x = s.x + (s.width - width);
      }
      if (dir.includes("n")) {
        height = Math.max(MIN_SIZE, s.height - dy);
        y = s.y + (s.height - height);
      }

      // Kéo GÓC: ảnh khóa tỉ lệ mặc định (Shift = tự do); element khác giữ Shift = khóa tỉ lệ
      const corner = dir.length === 2;
      const lockRatio = corner && (element.type === "image" ? !ev.shiftKey : ev.shiftKey);
      if (lockRatio && s.width > 0 && s.height > 0) {
        const ratio = s.width / s.height;
        if (width / s.width >= height / s.height) height = Math.max(MIN_SIZE, width / ratio);
        else width = Math.max(MIN_SIZE, height * ratio);
        // neo lại cạnh đối diện sau khi chỉnh kích thước theo tỉ lệ
        if (dir.includes("w")) x = s.x + (s.width - width);
        if (dir.includes("n")) y = s.y + (s.height - height);
      }

      historyOnce(s);
      useEditorStore.getState().updateElement(slideId, element.id, (el) => ({
        ...el,
        position: { x, y },
        size: { width, height },
      }));
    };

    const onUp = () => {
      start.current = null;
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
  }

  function beginRotate(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const host = target.closest("[data-element-root]");
    if (!host) return;
    const rect = host.getBoundingClientRect();
    rotateStart.current = {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      pushed: false,
    };

    const onMove = (ev: PointerEvent) => {
      const s = rotateStart.current;
      if (!s) return;
      let angle =
        (Math.atan2(ev.clientY - s.centerY, ev.clientX - s.centerX) * 180) / Math.PI + 90;
      if (ev.shiftKey) angle = Math.round(angle / 15) * 15;
      angle = Math.round(((angle % 360) + 360) % 360);

      historyOnce(s);
      useEditorStore.getState().updateElement(slideId, element.id, (el) => ({
        ...el,
        rotation: angle,
      }));
    };

    const onUp = () => {
      rotateStart.current = null;
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
  }

  // Handle giữ kích thước cố định trên màn hình bất kể zoom
  const size = 10 / zoom;
  const border = 1.5 / zoom;

  return (
    <>
      {HANDLES.map((h) => (
        <span
          key={h.dir}
          onPointerDown={(e) => beginResize(e, h.dir)}
          className="border-primary absolute z-10 rounded-[2px] bg-white"
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: size,
            height: size,
            borderWidth: border,
            borderStyle: "solid",
            transform: "translate(-50%, -50%)",
            cursor: h.cursor,
          }}
        />
      ))}
      <span
        onPointerDown={beginRotate}
        className="border-primary absolute z-10 rounded-full bg-white"
        style={{
          left: "50%",
          top: -28 / zoom,
          width: size + 2 / zoom,
          height: size + 2 / zoom,
          borderWidth: border,
          borderStyle: "solid",
          transform: "translate(-50%, -50%)",
          cursor: "grab",
        }}
        aria-label="Xoay"
      />
    </>
  );
}
