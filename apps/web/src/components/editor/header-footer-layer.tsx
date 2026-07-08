import type { HeaderFooterConfig, Slide } from "@repo/shared";

/**
 * Lớp header/footer vẽ đè lên slide (toạ độ logic 1280×720) — dùng chung
 * canvas editor, SlidePreview (sidebar/template) và bản chụp thumbnail.
 * Bố cục theo PowerPoint: header trên giữa; dưới: ngày (trái) — footer (giữa) — số trang (phải).
 */
export function HeaderFooterLayer({
  config,
  slide,
  slideIndex,
}: {
  config: HeaderFooterConfig | undefined | null;
  slide: Slide;
  slideIndex: number;
}) {
  if (!config || slide.hideHeaderFooter) return null;
  if (slideIndex === 0 && config.hideOnFirstSlide) return null;

  const date = config.showDate
    ? config.dateText?.trim() || new Date().toLocaleDateString("vi-VN")
    : null;
  const hasBottom = date || config.footer || config.showSlideNumber;
  if (!config.header && !hasBottom) return null;

  const textStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    color: "#6b7280",
    lineHeight: 1,
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 select-none"
      style={{ zIndex: 9999 }}
      aria-hidden
    >
      {config.header && (
        <div className="absolute top-0 right-0 left-0 flex justify-center px-16 pt-5">
          <span style={textStyle} className="truncate">
            {config.header}
          </span>
        </div>
      )}
      {hasBottom && (
        <div className="absolute right-0 bottom-0 left-0 grid grid-cols-3 items-end px-10 pb-5">
          <span style={textStyle} className="truncate text-left">
            {date}
          </span>
          <span style={textStyle} className="truncate text-center">
            {config.footer}
          </span>
          <span style={textStyle} className="text-right tabular-nums">
            {config.showSlideNumber ? slideIndex + 1 : null}
          </span>
        </div>
      )}
    </div>
  );
}
