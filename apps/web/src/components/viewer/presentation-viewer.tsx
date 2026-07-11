"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Presentation as PresentationIcon } from "lucide-react";
import type { Presentation } from "@repo/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SlidePreview } from "@/components/template/slide-preview";
import { Presenter } from "@/components/editor/presenter";

/**
 * Trang xem read-only (dùng cho cả link public `/p/<token>` lẫn collaborator viewer `/view/<id>`):
 * slide lớn + dải thumbnail + nút Trình chiếu fullscreen. `includeHidden` = false với public
 * (tôn trọng slide tác giả đã ẩn); collaborator viewer thấy đủ kèm badge "ẩn".
 */
export function PresentationViewer({
  title,
  presentation,
  subtitle,
  includeHidden = false,
  editHref,
}: {
  title: string;
  presentation: Presentation;
  subtitle?: string;
  includeHidden?: boolean;
  /** Có quyền sửa (owner/editor mở từ /view) → nút "Mở trong editor". */
  editHref?: string;
}) {
  const slides = useMemo(
    () =>
      presentation.slides
        .map((slide, originalIndex) => ({ slide, originalIndex }))
        .filter((s) => includeHidden || !s.slide.hidden),
    [presentation, includeHidden],
  );
  const [idx, setIdx] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const current = slides[Math.min(idx, slides.length - 1)];

  // Điều hướng bằng phím khi KHÔNG trình chiếu (Presenter tự xử lý khi bật)
  useEffect(() => {
    if (presenting) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
        setIdx((i) => Math.min(i + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        setIdx((i) => Math.max(i - 1, 0));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [presenting, slides.length]);

  if (!current) {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center text-sm">
        Presentation này chưa có slide nào để xem.
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-white">
        <PresentationIcon className="text-primary size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/50">{subtitle}</p>}
        </div>
        <span className="text-xs text-white/60 tabular-nums">
          {idx + 1} / {slides.length}
        </span>
        {editHref && (
          <Link href={editHref} className="text-primary text-xs hover:underline">
            Mở trong editor →
          </Link>
        )}
        <Button size="sm" onClick={() => setPresenting(true)}>
          <Play /> Trình chiếu
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="relative w-full max-w-5xl">
          <SlidePreview
            slide={current.slide}
            headerFooter={presentation.headerFooter}
            slideIndex={current.originalIndex}
            className="rounded-lg shadow-2xl"
            interactiveMedia
          />
          <button
            type="button"
            aria-label="Slide trước"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(i - 1, 0))}
            className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow disabled:opacity-30"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Slide sau"
            disabled={idx >= slides.length - 1}
            onClick={() => setIdx((i) => Math.min(i + 1, slides.length - 1))}
            className="absolute top-1/2 -right-4 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow disabled:opacity-30"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </main>

      <footer className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
        {slides.map((s, i) => (
          <button
            key={s.slide.id}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "relative w-32 shrink-0 overflow-hidden rounded border-2",
              i === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <SlidePreview slide={s.slide} headerFooter={presentation.headerFooter} slideIndex={s.originalIndex} />
            {s.slide.hidden && (
              <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-[10px] text-white">ẩn</span>
            )}
          </button>
        ))}
      </footer>

      {presenting && (
        <Presenter
          presentation={presentation}
          startSlideId={current.slide.id}
          onExit={() => setPresenting(false)}
        />
      )}
    </div>
  );
}
