"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SLIDE_HEIGHT, SLIDE_WIDTH, type Presentation } from "@repo/shared";
import { SlideStatic } from "@/components/template/slide-preview";
import { createPresentationPlayer, type PresentationPlayer } from "@/lib/editor/animations";

/**
 * Chế độ trình chiếu fullscreen (Phase 3):
 * - bỏ qua slide `hidden`; đánh số trang theo vị trí GỐC (như PowerPoint);
 * - click / Space / → / PageDown: phát bước animation on-click kế tiếp, hết thì sang slide;
 * - ← / PageUp / Backspace / chuột phải: LÙI 1 bước hiệu ứng (hoàn tác chuỗi vừa phát);
 *   hết bước thì về slide trước ở trạng thái ĐÃ build xong (như PowerPoint);
 * - transition (fade/slide/zoom) của slide đích chạy khi chuyển tới nó;
 * - fullscreen best-effort — bị chặn thì vẫn chạy dạng overlay, Escape vẫn thoát.
 *
 * LƯU Ý timing: đo viewport + tạo player đều bằng useLayoutEffect và GATE theo `ready`
 * (scale > 0) — render đầu tiên scale=0 nên SlideStatic CHƯA mount; tạo player lúc đó
 * sẽ query DOM rỗng → không pre-hide được entrance (bug "mở màn đã hiện hết").
 */
export function Presenter({
  presentation,
  startSlideId,
  onExit,
}: {
  presentation: Presentation;
  startSlideId: string | null;
  onExit: () => void;
}) {
  const slides = useMemo(
    () =>
      presentation.slides
        .map((slide, originalIndex) => ({ slide, originalIndex }))
        .filter((s) => !s.slide.hidden),
    [presentation],
  );

  const [idx, setIdx] = useState(() => {
    const found = slides.findIndex((s) => s.slide.id === startSlideId);
    return found >= 0 ? found : 0;
  });
  const current = slides[idx];

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PresentationPlayer | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const scale = Math.min(viewport.w / SLIDE_WIDTH, viewport.h / SLIDE_HEIGHT) || 0;
  const ready = scale > 0;
  /** Hướng điều hướng gần nhất — lùi về slide thì hiện trạng thái đã build xong. */
  const navDirRef = useRef<"forward" | "back">("forward");

  // Đo viewport TRƯỚC paint đầu tiên (layout effect) để SlideStatic mount ngay,
  // player pre-hide kịp trước khi user thấy gì.
  useLayoutEffect(() => {
    function measure() {
      const node = rootRef.current;
      if (node) setViewport({ w: node.clientWidth, h: node.clientHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Fullscreen best-effort; user thoát fullscreen (Esc của browser) → thoát trình chiếu
  useEffect(() => {
    const root = rootRef.current;
    root?.requestFullscreen?.().catch(() => undefined);
    function onFsChange() {
      if (!document.fullscreenElement) onExitRef.current();
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, []);

  // Mỗi lần đổi slide (và khi `ready` bật lần đầu): transition của slide đích + player theo trigger.
  // useLayoutEffect: pre-hide entrance TRƯỚC paint — tránh chớp element rồi mới ẩn.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || !current || !ready) return;
    const arrivedBack = navDirRef.current === "back";

    const t = current.slide.transition;
    if (t && !arrivedBack) {
      const keyframes =
        t === "fade"
          ? [{ opacity: 0 }, { opacity: 1 }]
          : t === "slide"
            ? [
                { opacity: 0, transform: "translateX(64px)" },
                { opacity: 1, transform: "translateX(0)" },
              ]
            : [
                { opacity: 0, transform: "scale(0.94)" },
                { opacity: 1, transform: "scale(1)" },
              ];
      frame.animate(keyframes, { duration: 350, easing: "ease-out" });
    }

    const anims = current.slide.animations;
    const player =
      anims && anims.length > 0
        ? createPresentationPlayer(frame, anims, current.slide.elements, {
            // lùi về slide → hiện trạng thái đã build đủ, không pre-hide/không tự phát
            startAtEnd: arrivedBack,
          })
        : null;
    playerRef.current = player;
    return () => {
      player?.cancel();
      playerRef.current = null;
    };
  }, [current, ready]);

  // Điều khiển: gộp 1 chỗ, dùng ref để listener ổn định
  useEffect(() => {
    function advance() {
      if (playerRef.current?.next()) return; // còn bước animation on-click
      if (idxRef.current < slides.length - 1) {
        navDirRef.current = "forward";
        setIdx(idxRef.current + 1);
      } else onExitRef.current(); // click sau slide cuối → kết thúc trình chiếu
    }
    function back() {
      if (playerRef.current?.prev()) return; // hoàn tác chuỗi hiệu ứng vừa phát
      if (idxRef.current > 0) {
        navDirRef.current = "back";
        setIdx(idxRef.current - 1);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
        case "Enter":
        case "PageDown":
          e.preventDefault();
          advance();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          back();
          break;
        case "Home":
          e.preventDefault();
          navDirRef.current = "forward";
          setIdx(0);
          break;
        case "End":
          e.preventDefault();
          navDirRef.current = "back"; // nhảy tới cuối = xem trạng thái đã build đủ
          setIdx(slides.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          onExitRef.current();
          break;
      }
    }
    function onClick() {
      advance();
    }
    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      back();
    }
    const root = rootRef.current;
    window.addEventListener("keydown", onKeyDown, true);
    root?.addEventListener("click", onClick);
    root?.addEventListener("contextmenu", onContextMenu);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      root?.removeEventListener("click", onClick);
      root?.removeEventListener("contextmenu", onContextMenu);
    };
  }, [slides.length]);

  // Không còn slide hiển thị được (tất cả bị ẩn) → thoát
  useEffect(() => {
    if (slides.length === 0) onExitRef.current();
  }, [slides.length]);

  if (!current) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-100 cursor-default bg-black select-none">
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={frameRef}
          key={current.slide.id}
          className="relative overflow-hidden"
          style={{ width: SLIDE_WIDTH * scale, height: SLIDE_HEIGHT * scale }}
        >
          {scale > 0 && (
            <SlideStatic
              slide={current.slide}
              scale={scale}
              headerFooter={presentation.headerFooter}
              slideIndex={current.originalIndex}
              interactiveMedia
            />
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute right-4 bottom-3 text-xs text-white/50 tabular-nums">
        {idx + 1} / {slides.length} · Esc để thoát
      </div>
    </div>
  );
}
