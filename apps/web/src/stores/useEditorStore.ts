"use client";

import { create } from "zustand";
import {
  createEmptySlide,
  THEME_HEADING_MIN_FONT_SIZE,
  type Animation,
  type HeaderFooterConfig,
  type Presentation,
  type Slide,
  type SlideElement,
  type ThemeConfig,
} from "@repo/shared";
import { createAnimation, getDefaultAnimations } from "@/lib/editor/animations";
import {
  alignBoxes,
  cloneElementsForPaste,
  distributeBoxes,
  elementBox,
  unionBounds,
  SLIDE_BOUNDS,
  type AlignMode,
} from "@/lib/editor/arrange";
import { shapeSupportsRadius } from "@/lib/editor/shapes";

const HISTORY_LIMIT = 50;

export type SaveState = "saved" | "dirty" | "saving" | "error" | "conflict";

type EditorState = {
  projectId: string | null;
  presentation: Presentation | null;
  revision: number;
  activeSlideId: string | null;
  /** Danh sách element đang chọn (đa chọn). 1 phần tử = chọn đơn; nhiều = nhóm/đa chọn. */
  selectedElementIds: string[];
  /** Group đang "vào trong" (double-click) để sửa từng element con — null = chưa vào group nào. */
  activeGroupId: string | null;
  zoom: number;
  saveState: SaveState;
  history: { past: Presentation[]; future: Presentation[] };

  load: (projectId: string, presentation: Presentation, revision: number) => void;
  reset: () => void;
  setZoom: (zoom: number) => void;
  setActiveSlide: (slideId: string) => void;
  /**
   * Chọn element. Không truyền id = bỏ chọn tất cả.
   * - additive (Ctrl/Cmd+click): thêm/bớt element khỏi selection (đa chọn thủ công).
   * - thường: chọn element đó; nếu nó thuộc group (và chưa "vào" group) → chọn cả group.
   */
  selectElement: (elementId: string | null, opts?: { additive?: boolean }) => void;
  /** Đặt selection theo danh sách id (kéo vùng marquee); tự mở rộng ra cả nhóm nếu chạm element có group. */
  setSelection: (elementIds: string[]) => void;
  /** Double-click element trong group → "vào" group để sửa riêng element con đó. */
  enterGroupElement: (elementId: string) => void;
  /** Gán 1 groupId mới cho toàn bộ element đang chọn (cần ≥2). */
  groupSelected: () => void;
  /** Bỏ nhóm: xoá groupId của các element đang chọn. */
  ungroupSelected: () => void;

  /** Gọi TRƯỚC một thao tác hoàn chỉnh (kết thúc drag, thêm/xóa element...) — 1 snapshot/thao tác. */
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  updateElement: (
    slideId: string,
    elementId: string,
    updater: (el: SlideElement) => SlideElement,
  ) => void;
  updateSlide: (slideId: string, updater: (slide: Slide) => Slide) => void;
  /** Áp theme lên TOÀN BỘ presentation (undo được — pushHistory bên trong). */
  applyTheme: (themeId: string, config: ThemeConfig) => void;
  moveElement: (slideId: string, elementId: string, dx: number, dy: number) => void;
  /** Di chuyển nhiều element cùng lúc (di chuyển nhóm/đa chọn) trong 1 lần cập nhật. */
  moveElements: (slideId: string, elementIds: string[], dx: number, dy: number) => void;
  addElement: (slideId: string, element: SlideElement) => void;
  removeElement: (slideId: string, elementId: string) => void;
  /** Xoá tất cả element đang chọn. */
  removeSelected: (slideId: string) => void;
  /** Nhân bản tất cả element đang chọn (giữ liên kết nhóm bằng groupId mới), chọn bản sao. */
  duplicateSelected: (slideId: string) => void;
  /** Dán element từ clipboard nội bộ (Ctrl+V) — id mới, chọn các bản dán. */
  pasteElements: (slideId: string, elements: SlideElement[]) => void;
  /** Căn hàng selection: 1 element căn theo SLIDE, nhiều element căn theo khung bao selection. */
  arrangeSelected: (slideId: string, mode: AlignMode) => void;
  /** Phân bố đều khoảng cách theo trục (cần chọn ≥3 element). */
  distributeSelected: (slideId: string, axis: "x" | "y") => void;
  addSlide: () => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  /** Nhân bản slide (id slide + id toàn bộ element sinh lại), chèn ngay sau bản gốc. */
  duplicateSlide: (slideId: string) => void;
  /** Đổi vị trí slide lên/xuống 1 bậc. */
  moveSlideBy: (slideId: string, delta: -1 | 1) => void;
  toggleSlideLocked: (slideId: string) => void;
  toggleSlideHidden: (slideId: string) => void;
  /**
   * Lưu cấu hình header/footer. scope "all" = hiện trên mọi slide;
   * scope "current" = chỉ slide đang chọn hiện, các slide khác ẩn.
   */
  setHeaderFooter: (config: HeaderFooterConfig, scope: "all" | "current") => void;

  /* ----- Animation ----- */
  /** Thêm animation cho element vào cuối chuỗi của slide đang active. */
  addAnimation: (elementId: string, animation: Animation) => void;
  updateAnimation: (animationId: string, patch: Partial<Animation>) => void;
  removeAnimation: (animationId: string) => void;
  /** Đổi vị trí animation trong chuỗi (thứ tự phát). */
  moveAnimation: (animationId: string, delta: -1 | 1) => void;
  reorderAnimations: (fromIndex: number, toIndex: number) => void;

  /** Áp layout (thay background + elements) lên 1 slide, giữ nguyên id slide. */
  applyLayoutToSlide: (slideId: string, layoutSlide: Slide) => void;
  /** Thêm slide mới dựng từ layout, chèn ngay sau slide đang chọn. */
  addSlideFromLayout: (layoutSlide: Slide) => void;
  /** Áp layout lên MỌI slide (thay toàn bộ background + elements) — thao tác phá hủy, hỏi xác nhận ở UI. */
  applyLayoutToAll: (build: () => Slide) => void;

  markSaving: () => void;
  markSaved: (revision: number) => void;
  markError: () => void;
  markConflict: () => void;
};

function mapSlide(
  presentation: Presentation,
  slideId: string,
  fn: (slide: Slide) => Slide,
): Presentation {
  return {
    ...presentation,
    slides: presentation.slides.map((s) => (s.id === slideId ? fn(s) : s)),
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  presentation: null,
  revision: 0,
  activeSlideId: null,
  selectedElementIds: [],
  activeGroupId: null,
  zoom: 0.65,
  saveState: "saved",
  history: { past: [], future: [] },

  load: (projectId, presentation, revision) =>
    set({
      projectId,
      presentation,
      revision,
      activeSlideId: presentation.slides[0]?.id ?? null,
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "saved",
      history: { past: [], future: [] },
    }),

  reset: () =>
    set({
      projectId: null,
      presentation: null,
      revision: 0,
      activeSlideId: null,
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "saved",
      history: { past: [], future: [] },
    }),

  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),
  setActiveSlide: (slideId) =>
    set({ activeSlideId: slideId, selectedElementIds: [], activeGroupId: null }),

  selectElement: (elementId, opts) => {
    if (!elementId) {
      set({ selectedElementIds: [], activeGroupId: null });
      return;
    }
    const { presentation, activeSlideId, selectedElementIds, activeGroupId } = get();
    const slide = presentation?.slides.find((s) => s.id === activeSlideId);
    const el = slide?.elements.find((e) => e.id === elementId);

    if (opts?.additive) {
      // Ctrl/Cmd+click: toggle element trong selection (đa chọn thủ công, thoát group edit)
      const next = selectedElementIds.includes(elementId)
        ? selectedElementIds.filter((id) => id !== elementId)
        : [...selectedElementIds, elementId];
      set({ selectedElementIds: next, activeGroupId: null });
      return;
    }

    // Thuộc group và chưa "vào" group đó → chọn cả group để di chuyển cùng nhau
    if (el?.groupId && el.groupId !== activeGroupId && slide) {
      const groupIds = slide.elements.filter((e) => e.groupId === el.groupId).map((e) => e.id);
      set({ selectedElementIds: groupIds, activeGroupId: null });
      return;
    }

    // element lẻ, hoặc đang ở trong group và chọn 1 con của group
    set({ selectedElementIds: [elementId] });
  },

  setSelection: (elementIds) => {
    const { presentation, activeSlideId } = get();
    const slide = presentation?.slides.find((s) => s.id === activeSlideId);
    if (!slide) {
      set({ selectedElementIds: elementIds, activeGroupId: null });
      return;
    }
    // Mở rộng: nếu chạm 1 element có group → chọn cả nhóm (như Canva)
    const picked = new Set(elementIds);
    const groups = new Set(
      slide.elements.filter((e) => picked.has(e.id) && e.groupId).map((e) => e.groupId),
    );
    if (groups.size > 0) {
      for (const e of slide.elements) if (e.groupId && groups.has(e.groupId)) picked.add(e.id);
    }
    set({ selectedElementIds: [...picked], activeGroupId: null });
  },

  enterGroupElement: (elementId) => {
    const { presentation, activeSlideId } = get();
    const slide = presentation?.slides.find((s) => s.id === activeSlideId);
    const el = slide?.elements.find((e) => e.id === elementId);
    if (el?.groupId) set({ activeGroupId: el.groupId, selectedElementIds: [elementId] });
    else set({ selectedElementIds: [elementId], activeGroupId: null });
  },

  groupSelected: () => {
    const { presentation, activeSlideId, selectedElementIds } = get();
    if (!presentation || !activeSlideId || selectedElementIds.length < 2) return;
    get().pushHistory();
    const groupId = crypto.randomUUID();
    set({
      presentation: mapSlide(presentation, activeSlideId, (slide) => ({
        ...slide,
        elements: slide.elements.map((el) =>
          selectedElementIds.includes(el.id) ? { ...el, groupId } : el,
        ),
      })),
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  ungroupSelected: () => {
    const { presentation, activeSlideId, selectedElementIds } = get();
    if (!presentation || !activeSlideId) return;
    const slide = presentation.slides.find((s) => s.id === activeSlideId);
    // group của các element đang chọn
    const groupIds = new Set(
      slide?.elements.filter((e) => selectedElementIds.includes(e.id) && e.groupId).map((e) => e.groupId),
    );
    if (groupIds.size === 0) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, activeSlideId, (s) => ({
        ...s,
        elements: s.elements.map((el) =>
          el.groupId && groupIds.has(el.groupId) ? { ...el, groupId: undefined } : el,
        ),
      })),
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  pushHistory: () => {
    const { presentation, history } = get();
    if (!presentation) return;
    set({
      history: {
        past: [...history.past.slice(-(HISTORY_LIMIT - 1)), structuredClone(presentation)],
        future: [],
      },
    });
  },

  undo: () => {
    const { presentation, history } = get();
    const previous = history.past.at(-1);
    if (!presentation || !previous) return;
    set({
      presentation: previous,
      saveState: "dirty",
      selectedElementIds: [],
      activeGroupId: null,
      history: {
        past: history.past.slice(0, -1),
        future: [structuredClone(presentation), ...history.future].slice(0, HISTORY_LIMIT),
      },
    });
  },

  redo: () => {
    const { presentation, history } = get();
    const next = history.future[0];
    if (!presentation || !next) return;
    set({
      presentation: next,
      saveState: "dirty",
      selectedElementIds: [],
      activeGroupId: null,
      history: {
        past: [...history.past.slice(-(HISTORY_LIMIT - 1)), structuredClone(presentation)],
        future: history.future.slice(1),
      },
    });
  },

  updateElement: (slideId, elementId, updater) => {
    const { presentation } = get();
    if (!presentation) return;
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        ...slide,
        elements: slide.elements.map((el) => (el.id === elementId ? updater(el) : el)),
      })),
      saveState: "dirty",
    });
  },

  updateSlide: (slideId, updater) => {
    const { presentation } = get();
    if (!presentation) return;
    set({ presentation: mapSlide(presentation, slideId, updater), saveState: "dirty" });
  },

  applyTheme: (themeId, config) => {
    const { presentation } = get();
    if (!presentation) return;
    get().pushHistory();

    const themed = (el: SlideElement): SlideElement => {
      switch (el.type) {
        case "text": {
          const isHeading = el.props.fontSize >= THEME_HEADING_MIN_FONT_SIZE;
          return {
            ...el,
            props: {
              ...el.props,
              color: isHeading ? config.colors.heading : config.colors.body,
              fontFamily: isHeading ? config.fontHeading : config.fontBody,
            },
          };
        }
        case "shape":
          return {
            ...el,
            props: {
              ...el.props,
              fill: config.colors.accent,
              shadow: config.shadow ?? el.props.shadow,
              borderRadius: shapeSupportsRadius(el.props.shape)
                ? (config.borderRadius ?? el.props.borderRadius)
                : el.props.borderRadius,
            },
          };
        case "icon":
          // accent2 nếu theme có khai báo — cho icon tách sắc độ khỏi shape (đều dùng accent)
          return { ...el, props: { ...el.props, color: config.colors.accent2 ?? config.colors.accent } };
        case "image":
          return {
            ...el,
            props: {
              ...el.props,
              cornerRadius: config.borderRadius != null ? undefined : el.props.cornerRadius,
              borderRadius: config.borderRadius ?? el.props.borderRadius,
              shadow: config.shadow ? { directions: ["bottom"], blur: 24 } : el.props.shadow,
            },
          };
        case "table":
          // header bảng ăn theo accent của theme; ô dữ liệu giữ nguyên
          return {
            ...el,
            props: {
              ...el.props,
              style: { ...el.props.style, headerBg: config.colors.accent, headerColor: "#ffffff" },
            },
          };
        case "chart":
          // KHÔNG đổi màu series/lát (dữ liệu người dùng chọn); chỉ chỉnh màu chữ theo body
          return { ...el, props: { ...el.props, textColor: config.colors.body } };
        case "media":
          // media không có màu theme-able — giữ nguyên
          return el;
      }
    };

    // colors.background có thể là gradient CSS (cùng convention với ShapeElement.fill)
    const isGradientBg = config.colors.background.includes("gradient(");

    set({
      presentation: {
        ...presentation,
        themeId,
        slides: presentation.slides.map((slide) => ({
          ...slide,
          background: {
            type: isGradientBg ? "gradient" : "color",
            value: config.colors.background,
          },
          elements: slide.elements.map(themed),
        })),
      },
      saveState: "dirty",
    });
  },

  moveElement: (slideId, elementId, dx, dy) => {
    get().updateElement(slideId, elementId, (el) => ({
      ...el,
      position: { x: el.position.x + dx, y: el.position.y + dy },
    }));
  },

  moveElements: (slideId, elementIds, dx, dy) => {
    const { presentation } = get();
    if (!presentation) return;
    const ids = new Set(elementIds);
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        ...slide,
        elements: slide.elements.map((el) =>
          ids.has(el.id)
            ? { ...el, position: { x: el.position.x + dx, y: el.position.y + dy } }
            : el,
        ),
      })),
      saveState: "dirty",
    });
  },

  addElement: (slideId, element) => {
    const { presentation } = get();
    if (!presentation) return;
    if (presentation.slides.find((s) => s.id === slideId)?.locked) return;
    get().pushHistory();
    // Hiệu ứng mặc định theo loại element (nếu user đã đặt trong Animation Pane)
    const defaultEffect = getDefaultAnimations()[element.type];
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        ...slide,
        elements: [...slide.elements, element],
        animations: defaultEffect
          ? [...(slide.animations ?? []), createAnimation(element.id, defaultEffect)]
          : slide.animations,
      })),
      selectedElementIds: [element.id],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  removeElement: (slideId, elementId) => {
    const { presentation } = get();
    if (!presentation) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        ...slide,
        elements: slide.elements.filter((el) => el.id !== elementId),
        // dọn animation trỏ tới element đã xoá
        animations: slide.animations?.filter((a) => a.elementId !== elementId),
      })),
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  removeSelected: (slideId) => {
    const { presentation, selectedElementIds } = get();
    if (!presentation || selectedElementIds.length === 0) return;
    get().pushHistory();
    const ids = new Set(selectedElementIds);
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        ...slide,
        elements: slide.elements.filter((el) => !ids.has(el.id)),
        animations: slide.animations?.filter((a) => !ids.has(a.elementId)),
      })),
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  duplicateSelected: (slideId) => {
    const { presentation, selectedElementIds } = get();
    if (!presentation || selectedElementIds.length === 0) return;
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide || slide.locked) return;
    get().pushHistory();
    const ids = new Set(selectedElementIds);
    const baseZ = Math.max(0, ...slide.elements.map((e) => e.zIndex));
    // groupId cũ → groupId mới (giữ liên kết nhóm giữa các bản sao)
    const groupRemap = new Map<string, string>();
    const clones: SlideElement[] = slide.elements
      .filter((el) => ids.has(el.id))
      .map((el, i) => {
        const clone = structuredClone(el);
        clone.id = crypto.randomUUID();
        clone.position = { x: el.position.x + 24, y: el.position.y + 24 };
        clone.zIndex = baseZ + i + 1;
        if (el.groupId) {
          if (!groupRemap.has(el.groupId)) groupRemap.set(el.groupId, crypto.randomUUID());
          clone.groupId = groupRemap.get(el.groupId);
        }
        return clone;
      });
    set({
      presentation: mapSlide(presentation, slideId, (s) => ({
        ...s,
        elements: [...s.elements, ...clones],
      })),
      selectedElementIds: clones.map((c) => c.id),
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  pasteElements: (slideId, elements) => {
    const { presentation } = get();
    if (!presentation || elements.length === 0) return;
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide || slide.locked) return;
    get().pushHistory();
    const clones = cloneElementsForPaste(elements, slide.elements);
    set({
      presentation: mapSlide(presentation, slideId, (s) => ({
        ...s,
        elements: [...s.elements, ...clones],
      })),
      selectedElementIds: clones.map((c) => c.id),
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  arrangeSelected: (slideId, mode) => {
    const { presentation, selectedElementIds } = get();
    if (!presentation || selectedElementIds.length === 0) return;
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide || slide.locked) return;
    const boxes = slide.elements.filter((e) => selectedElementIds.includes(e.id)).map(elementBox);
    if (boxes.length === 0) return;
    // 1 element → căn theo slide; nhiều → căn theo khung bao của selection
    const bounds = boxes.length === 1 ? SLIDE_BOUNDS : unionBounds(boxes);
    const moves = alignBoxes(boxes, mode, bounds);
    if (moves.size === 0) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, slideId, (s) => ({
        ...s,
        elements: s.elements.map((el) => {
          const next = moves.get(el.id);
          return next ? { ...el, position: next } : el;
        }),
      })),
      saveState: "dirty",
    });
  },

  distributeSelected: (slideId, axis) => {
    const { presentation, selectedElementIds } = get();
    if (!presentation || selectedElementIds.length < 3) return;
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide || slide.locked) return;
    const boxes = slide.elements.filter((e) => selectedElementIds.includes(e.id)).map(elementBox);
    const moves = distributeBoxes(boxes, axis);
    if (moves.size === 0) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, slideId, (s) => ({
        ...s,
        elements: s.elements.map((el) => {
          const next = moves.get(el.id);
          return next ? { ...el, position: next } : el;
        }),
      })),
      saveState: "dirty",
    });
  },

  addSlide: () => {
    const { presentation } = get();
    if (!presentation) return;
    get().pushHistory();
    const slide = createEmptySlide();
    set({
      presentation: { ...presentation, slides: [...presentation.slides, slide] },
      activeSlideId: slide.id,
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  removeSlide: (slideId) => {
    const { presentation, activeSlideId } = get();
    if (!presentation || presentation.slides.length <= 1) return;
    get().pushHistory();
    const slides = presentation.slides.filter((s) => s.id !== slideId);
    set({
      presentation: { ...presentation, slides },
      activeSlideId: activeSlideId === slideId ? (slides[0]?.id ?? null) : activeSlideId,
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  reorderSlides: (fromIndex, toIndex) => {
    const { presentation } = get();
    if (!presentation) return;
    get().pushHistory();
    const slides = [...presentation.slides];
    const [moved] = slides.splice(fromIndex, 1);
    if (!moved) return;
    slides.splice(toIndex, 0, moved);
    set({ presentation: { ...presentation, slides }, saveState: "dirty" });
  },

  duplicateSlide: (slideId) => {
    const { presentation } = get();
    if (!presentation) return;
    const index = presentation.slides.findIndex((s) => s.id === slideId);
    const source = presentation.slides[index];
    if (!source) return;
    get().pushHistory();
    const clone: Slide = structuredClone(source);
    clone.id = crypto.randomUUID();
    clone.elements = clone.elements.map((el) => ({ ...el, id: crypto.randomUUID() }));
    const slides = [...presentation.slides];
    slides.splice(index + 1, 0, clone);
    set({
      presentation: { ...presentation, slides },
      activeSlideId: clone.id,
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  moveSlideBy: (slideId, delta) => {
    const { presentation } = get();
    if (!presentation) return;
    const from = presentation.slides.findIndex((s) => s.id === slideId);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= presentation.slides.length) return;
    get().reorderSlides(from, to);
  },

  toggleSlideLocked: (slideId) => {
    get().pushHistory();
    get().updateSlide(slideId, (s) => ({ ...s, locked: !s.locked }));
    set({ selectedElementIds: [], activeGroupId: null });
  },

  toggleSlideHidden: (slideId) => {
    get().pushHistory();
    get().updateSlide(slideId, (s) => ({ ...s, hidden: !s.hidden }));
  },

  setHeaderFooter: (config, scope) => {
    const { presentation, activeSlideId } = get();
    if (!presentation) return;
    get().pushHistory();
    set({
      presentation: {
        ...presentation,
        headerFooter: config,
        slides: presentation.slides.map((slide) => ({
          ...slide,
          hideHeaderFooter: scope === "all" ? undefined : slide.id !== activeSlideId || undefined,
        })),
      },
      saveState: "dirty",
    });
  },

  /* ----- Animation (thao tác trên slide đang active) ----- */
  addAnimation: (elementId, animation) => {
    const { presentation, activeSlideId } = get();
    if (!presentation || !activeSlideId) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, activeSlideId, (slide) => ({
        ...slide,
        animations: [...(slide.animations ?? []), { ...animation, elementId }],
      })),
      saveState: "dirty",
    });
  },

  updateAnimation: (animationId, patch) => {
    const { presentation, activeSlideId } = get();
    if (!presentation || !activeSlideId) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, activeSlideId, (slide) => ({
        ...slide,
        animations: slide.animations?.map((a) => (a.id === animationId ? { ...a, ...patch } : a)),
      })),
      saveState: "dirty",
    });
  },

  removeAnimation: (animationId) => {
    const { presentation, activeSlideId } = get();
    if (!presentation || !activeSlideId) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, activeSlideId, (slide) => ({
        ...slide,
        animations: slide.animations?.filter((a) => a.id !== animationId),
      })),
      saveState: "dirty",
    });
  },

  moveAnimation: (animationId, delta) => {
    const { presentation, activeSlideId } = get();
    if (!presentation || !activeSlideId) return;
    const slide = presentation.slides.find((s) => s.id === activeSlideId);
    const list = slide?.animations ?? [];
    const from = list.findIndex((a) => a.id === animationId);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return;
    get().reorderAnimations(from, to);
  },

  reorderAnimations: (fromIndex, toIndex) => {
    const { presentation, activeSlideId } = get();
    if (!presentation || !activeSlideId) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, activeSlideId, (slide) => {
        const list = [...(slide.animations ?? [])];
        const [moved] = list.splice(fromIndex, 1);
        if (!moved) return slide;
        list.splice(toIndex, 0, moved);
        return { ...slide, animations: list };
      }),
      saveState: "dirty",
    });
  },

  applyLayoutToSlide: (slideId, layoutSlide) => {
    const { presentation } = get();
    if (!presentation) return;
    if (presentation.slides.find((s) => s.id === slideId)?.locked) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        // giữ id + cờ locked/hidden/hideHeaderFooter của slide; thay nội dung theo layout
        ...slide,
        background: layoutSlide.background,
        elements: layoutSlide.elements,
      })),
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  addSlideFromLayout: (layoutSlide) => {
    const { presentation, activeSlideId } = get();
    if (!presentation) return;
    get().pushHistory();
    const index = presentation.slides.findIndex((s) => s.id === activeSlideId);
    const slides = [...presentation.slides];
    slides.splice(index >= 0 ? index + 1 : slides.length, 0, layoutSlide);
    set({
      presentation: { ...presentation, slides },
      activeSlideId: layoutSlide.id,
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  applyLayoutToAll: (build) => {
    const { presentation } = get();
    if (!presentation) return;
    get().pushHistory();
    set({
      presentation: {
        ...presentation,
        slides: presentation.slides.map((slide) => {
          if (slide.locked) return slide;
          const fresh = build();
          return { ...slide, background: fresh.background, elements: fresh.elements };
        }),
      },
      selectedElementIds: [],
      activeGroupId: null,
      saveState: "dirty",
    });
  },

  markSaving: () => set({ saveState: "saving" }),
  markSaved: (revision) => {
    // Chỉ về "saved" nếu không có edit mới phát sinh trong lúc đang save
    if (get().saveState === "saving") set({ revision, saveState: "saved" });
    else set({ revision });
  },
  markError: () => set({ saveState: "error" }),
  markConflict: () => set({ saveState: "conflict" }),
}));
