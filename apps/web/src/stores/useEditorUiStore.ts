"use client";

import { create } from "zustand";
import type { Animation, SlideElement } from "@repo/shared";

/**
 * Trạng thái kéo hiện tại: offset đã-snap (toạ độ logic) áp cho các element đang kéo,
 * + các đường guide căn chỉnh cần vẽ. Dùng chung cho kéo 1 element lẫn kéo nhóm.
 */
export type DragGuides = {
  ids: string[];
  dx: number;
  dy: number;
  vertical: number[];
  horizontal: number[];
};

/** UI state của editor tách khỏi dữ liệu presentation — panel đang mở, v.v. */
type EditorUiState = {
  layoutPanelOpen: boolean;
  toggleLayoutPanel: () => void;
  setLayoutPanelOpen: (open: boolean) => void;

  animationPanelOpen: boolean;
  toggleAnimationPanel: () => void;

  /** Clipboard animation cho copy/paste sang element khác. */
  animationClipboard: Animation | null;
  setAnimationClipboard: (anim: Animation | null) => void;

  /** Clipboard element nội bộ (Ctrl+C/X/V) — dán được sang slide khác. */
  elementClipboard: SlideElement[] | null;
  setElementClipboard: (elements: SlideElement[] | null) => void;

  dragGuides: DragGuides | null;
  setDragGuides: (drag: DragGuides | null) => void;

  /** Đang trình chiếu fullscreen (Phase 3) — editor tắt phím tắt khi bật. */
  presenting: boolean;
  setPresenting: (presenting: boolean) => void;

  /** Vùng ô đang chọn trong bảng (khi sửa bảng) — anchor→focus, kéo hướng nào cũng được. */
  tableSelection: {
    elementId: string;
    anchor: { r: number; c: number };
    focus: { r: number; c: number };
  } | null;
  setTableSelection: (sel: EditorUiState["tableSelection"]) => void;
};

export const useEditorUiStore = create<EditorUiState>((set) => ({
  layoutPanelOpen: false,
  toggleLayoutPanel: () =>
    set((s) => ({ layoutPanelOpen: !s.layoutPanelOpen, animationPanelOpen: false })),
  setLayoutPanelOpen: (layoutPanelOpen) => set({ layoutPanelOpen }),

  animationPanelOpen: false,
  toggleAnimationPanel: () =>
    set((s) => ({ animationPanelOpen: !s.animationPanelOpen, layoutPanelOpen: false })),

  animationClipboard: null,
  setAnimationClipboard: (animationClipboard) => set({ animationClipboard }),

  elementClipboard: null,
  setElementClipboard: (elementClipboard) => set({ elementClipboard }),

  dragGuides: null,
  setDragGuides: (dragGuides) => set({ dragGuides }),

  presenting: false,
  setPresenting: (presenting) => set({ presenting }),

  tableSelection: null,
  setTableSelection: (tableSelection) => set({ tableSelection }),
}));
