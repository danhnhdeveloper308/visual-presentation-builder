"use client";

import { useEffect, useRef, useState } from "react";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
  type HeaderFooterConfig,
  type Slide,
  type SlideElement,
} from "@repo/shared";
import { Sparkles } from "lucide-react";
import { SLIDE_ICONS } from "@/lib/editor/icon-map";
import { shapeStyle, shapeWrapperStyle } from "@/lib/editor/shapes";
import { HeaderFooterLayer } from "@/components/editor/header-footer-layer";
import { cn } from "@/lib/utils";

function StaticElement({ element }: { element: SlideElement }) {
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

  switch (element.type) {
    case "text": {
      const p = element.props;
      return (
        <div
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
        <div style={{ ...base, ...shapeWrapperStyle(element.props) }}>
          <div className="h-full w-full" style={shapeStyle(element.props)} />
        </div>
      );
    case "icon": {
      const Icon = SLIDE_ICONS[element.props.name] ?? Sparkles;
      return (
        <Icon
          style={{ ...base, color: element.props.color }}
          strokeWidth={element.props.strokeWidth ?? 2}
        />
      );
    }
    case "image":
      return (
        <img
          src={element.props.url}
          alt=""
          style={{
            ...base,
            objectFit: element.props.objectFit,
            borderRadius: element.props.borderRadius,
          }}
        />
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

/** Render tĩnh 1 slide, scale vừa khít container (đo bằng ResizeObserver). */
export function SlidePreview({
  slide,
  className,
  headerFooter,
  slideIndex = 0,
}: {
  slide: Slide;
  className?: string;
  /** Cấu hình header/footer của presentation — truyền vào để preview khớp render thật. */
  headerFooter?: HeaderFooterConfig | null;
  slideIndex?: number;
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
            <StaticElement key={el.id} element={el} />
          ))}
          <HeaderFooterLayer config={headerFooter} slide={slide} slideIndex={slideIndex} />
        </div>
      )}
    </div>
  );
}
