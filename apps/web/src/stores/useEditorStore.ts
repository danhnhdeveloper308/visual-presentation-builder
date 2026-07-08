"use client";

import { create } from "zustand";
import {
  createEmptySlide,
  THEME_HEADING_MIN_FONT_SIZE,
  type HeaderFooterConfig,
  type Presentation,
  type Slide,
  type SlideElement,
  type ThemeConfig,
} from "@repo/shared";

const HISTORY_LIMIT = 50;

export type SaveState = "saved" | "dirty" | "saving" | "error" | "conflict";

type EditorState = {
  projectId: string | null;
  presentation: Presentation | null;
  revision: number;
  activeSlideId: string | null;
  selectedElementId: string | null;
  zoom: number;
  saveState: SaveState;
  history: { past: Presentation[]; future: Presentation[] };

  load: (projectId: string, presentation: Presentation, revision: number) => void;
  reset: () => void;
  setZoom: (zoom: number) => void;
  setActiveSlide: (slideId: string) => void;
  selectElement: (elementId: string | null) => void;

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
  addElement: (slideId: string, element: SlideElement) => void;
  removeElement: (slideId: string, elementId: string) => void;
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
  selectedElementId: null,
  zoom: 0.65,
  saveState: "saved",
  history: { past: [], future: [] },

  load: (projectId, presentation, revision) =>
    set({
      projectId,
      presentation,
      revision,
      activeSlideId: presentation.slides[0]?.id ?? null,
      selectedElementId: null,
      saveState: "saved",
      history: { past: [], future: [] },
    }),

  reset: () =>
    set({
      projectId: null,
      presentation: null,
      revision: 0,
      activeSlideId: null,
      selectedElementId: null,
      saveState: "saved",
      history: { past: [], future: [] },
    }),

  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),
  setActiveSlide: (slideId) => set({ activeSlideId: slideId, selectedElementId: null }),
  selectElement: (elementId) => set({ selectedElementId: elementId }),

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
      selectedElementId: null,
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
      selectedElementId: null,
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
          return { ...el, props: { ...el.props, fill: config.colors.accent } };
        case "icon":
          return { ...el, props: { ...el.props, color: config.colors.accent } };
        case "image":
          return el;
      }
    };

    set({
      presentation: {
        ...presentation,
        themeId,
        slides: presentation.slides.map((slide) => ({
          ...slide,
          background: { type: "color", value: config.colors.background },
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

  addElement: (slideId, element) => {
    const { presentation } = get();
    if (!presentation) return;
    if (presentation.slides.find((s) => s.id === slideId)?.locked) return;
    get().pushHistory();
    set({
      presentation: mapSlide(presentation, slideId, (slide) => ({
        ...slide,
        elements: [...slide.elements, element],
      })),
      selectedElementId: element.id,
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
      })),
      selectedElementId: null,
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
      selectedElementId: null,
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
      selectedElementId: null,
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
      selectedElementId: null,
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
    set({ selectedElementId: null });
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

  markSaving: () => set({ saveState: "saving" }),
  markSaved: (revision) => {
    // Chỉ về "saved" nếu không có edit mới phát sinh trong lúc đang save
    if (get().saveState === "saving") set({ revision, saveState: "saved" });
    else set({ revision });
  },
  markError: () => set({ saveState: "error" }),
  markConflict: () => set({ saveState: "conflict" }),
}));
