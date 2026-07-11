"use client";

import { useEffect, useRef, useState } from "react";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
  type HeaderFooterConfig,
  type Slide,
  type SlideElement,
} from "@repo/shared";
import { ImageIcon, Sparkles } from "lucide-react";
import { SLIDE_ICONS } from "@/lib/editor/icon-map";
import { shapeStyle, shapeWrapperStyle } from "@/lib/editor/shapes";
import { iconBoxStyle, iconHasBox, imageBorderRadius, imageContentStyle } from "@/lib/editor/element-style";
import { ChartContent } from "@/components/editor/chart-content";
import { MediaContent } from "@/components/editor/media-content";
import { TableContent } from "@/components/editor/table-content";
import { HeaderFooterLayer } from "@/components/editor/header-footer-layer";
import { cn } from "@/lib/utils";

function StaticElement({
  element,
  interactiveMedia = false,
}: {
  element: SlideElement;
  /** true = media (video/audio/embed) phát được thật (trình chiếu/trang xem). */
  interactiveMedia?: boolean;
}) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    zIndex: element.zIndex,
    opacity: element.opacity,
    transform: `rotate(${element.rotation}deg)`,
  };
  // data-el-id để player animation (trình chiếu Phase 3) tìm được node theo element id
  const elId = { "data-el-id": element.id };

  switch (element.type) {
    case "text": {
      const p = element.props;
      return (
        <div
          {...elId}
          style={{
            ...base,
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
        <div {...elId} style={{ ...base, ...shapeWrapperStyle(element.props) }}>
          <div className="h-full w-full" style={shapeStyle(element.props)} />
        </div>
      );
    case "icon": {
      const Icon = SLIDE_ICONS[element.props.name] ?? Sparkles;
      if (iconHasBox(element.props)) {
        return (
          <div
            {...elId}
            style={{ ...base, ...iconBoxStyle(element.props) }}
            className="flex items-center justify-center"
          >
            <Icon
              className="h-full w-full"
              style={{ color: element.props.color }}
              strokeWidth={element.props.strokeWidth ?? 2}
            />
          </div>
        );
      }
      return (
        <Icon
          {...elId}
          style={{ ...base, color: element.props.color }}
          strokeWidth={element.props.strokeWidth ?? 2}
        />
      );
    }
    case "image": {
      const p = element.props;
      if (!p.url) {
        // placeholder chưa upload — khung xám + icon ảnh
        return (
          <div
            {...elId}
            style={{ ...base, borderRadius: imageBorderRadius(p), backgroundColor: "#e2e8f0" }}
            className="flex items-center justify-center"
          >
            <ImageIcon style={{ width: "28%", height: "28%", color: "#94a3b8" }} />
          </div>
        );
      }
      return <img {...elId} src={p.url} alt="" style={{ ...base, ...imageContentStyle(p) }} />;
    }
    case "table":
      return (
        <div {...elId} style={base}>
          <TableContent props={element.props} />
        </div>
      );
    case "chart":
      return (
        <div {...elId} style={base}>
          <ChartContent props={element.props} width={element.size.width} height={element.size.height} />
        </div>
      );
    case "media":
      return (
        <div {...elId} style={base}>
          <MediaContent props={element.props} mode={interactiveMedia ? "interactive" : "static"} />
        </div>
      );
  }
}

function slideBackground(slide: Slide): React.CSSProperties {
  switch (slide.background.type) {
    case "color":
      return { backgroundColor: slide.background.value };
    case "gradient":
      return { backgroundImage: slide.background.value };
    case "image":
      return {
        backgroundImage: `url(${slide.background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
  }
}

/** Khung 1280×720 render tĩnh toàn bộ element của slide, scale bằng CSS transform. */
export function SlideStatic({
  slide,
  scale,
  headerFooter,
  slideIndex = 0,
  interactiveMedia = false,
}: {
  slide: Slide;
  scale: number;
  headerFooter?: HeaderFooterConfig | null;
  slideIndex?: number;
  /** Media phát được thật (trình chiếu/trang xem) — mặc định placeholder tĩnh. */
  interactiveMedia?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 select-none"
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        ...slideBackground(slide),
      }}
    >
      {slide.elements.map((el) => (
        <StaticElement key={el.id} element={el} interactiveMedia={interactiveMedia} />
      ))}
      <HeaderFooterLayer config={headerFooter} slide={slide} slideIndex={slideIndex} />
    </div>
  );
}

/** Render tĩnh 1 slide, scale vừa khít container (đo bằng ResizeObserver). */
export function SlidePreview({
  slide,
  className,
  headerFooter,
  slideIndex = 0,
  interactiveMedia = false,
}: {
  slide: Slide;
  className?: string;
  /** Cấu hình header/footer của presentation — truyền vào để preview khớp render thật. */
  headerFooter?: HeaderFooterConfig | null;
  slideIndex?: number;
  /** Media phát được thật (trang xem slide lớn) — mặc định placeholder tĩnh. */
  interactiveMedia?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / SLIDE_WIDTH);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative aspect-video w-full overflow-hidden", className)}>
      {scale > 0 && (
        <SlideStatic
          slide={slide}
          scale={scale}
          headerFooter={headerFooter}
          slideIndex={slideIndex}
          interactiveMedia={interactiveMedia}
        />
      )}
    </div>
  );
}
