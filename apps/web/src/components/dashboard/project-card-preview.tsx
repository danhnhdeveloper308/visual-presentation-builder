"use client";

import { useEffect, useState } from "react";
import { Presentation } from "lucide-react";
import type { ProjectSummary } from "@repo/shared";
import { cn } from "@/lib/utils";
import { useProject } from "@/hooks/queries/useProject";
import { SlidePreview } from "@/components/template/slide-preview";

const CYCLE_MS = 1100;

/**
 * Preview của project card (dashboard):
 * - có thumbnail → hiển thị ảnh chụp lần lưu gần nhất (rẻ, không gọi API);
 * - KHÔNG có thumbnail (project chưa lưu lần nào từ khi có tính năng thumbnail,
 *   hoặc capture fail vì ảnh R2 thiếu CORS) → tự fetch content và render live
 *   slide đầu bằng SlidePreview — mọi project đều có preview;
 * - hover → fetch content (cache ['project', id] dùng lại được khi mở editor)
 *   và TỰ CHUYỂN qua toàn bộ slide như Canva, nhả hover thì về slide đầu.
 */
export function ProjectCardPreview({
  project,
  hovering,
}: {
  project: ProjectSummary;
  hovering: boolean;
}) {
  // Chỉ gọi API khi thật sự cần: hover (để chạy slideshow) hoặc thiếu thumbnail
  const needContent = hovering || !project.thumbnailUrl;
  const detail = useProject(project.id, { enabled: needContent });
  const slides = detail.data?.content.slides;

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!hovering || !slides || slides.length <= 1) {
      setIdx(0);
      return;
    }
    const timer = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [hovering, slides]);

  const cycling = hovering && !!slides;
  const slide = slides?.[cycling ? Math.min(idx, slides.length - 1) : 0];

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
      {cycling && slide ? (
        <SlidePreview
          key={slide.id}
          slide={slide}
          headerFooter={detail.data?.content.headerFooter}
          slideIndex={idx}
          className="animate-in fade-in duration-200"
        />
      ) : project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover"
        />
      ) : slide ? (
        <SlidePreview slide={slide} headerFooter={detail.data?.content.headerFooter} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Presentation className="size-10 text-gray-300" />
        </div>
      )}

      {/* Đếm trang + chấm tiến trình khi đang chạy slideshow hover */}
      {cycling && slides && slides.length > 1 && (
        <>
          <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
            {Math.min(idx + 1, slides.length)}/{slides.length}
          </span>
          {slides.length <= 12 && (
            <div className="absolute right-0 bottom-1.5 left-0 flex justify-center gap-1">
              {slides.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    i === idx ? "bg-white" : "bg-white/40",
                  )}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
