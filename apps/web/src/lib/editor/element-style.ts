import type { CSSProperties } from "react";
import type { IconElement, ImageElement } from "@repo/shared";

/**
 * Suy ra CSS dùng chung cho editor (element-view) và preview (slide-preview),
 * để 2 nơi render giống hệt nhau.
 */

/** border-radius theo thứ tự CSS: top-left, top-right, bottom-right, bottom-left. */
export function imageBorderRadius(p: ImageElement["props"]): string | number | undefined {
  const c = p.cornerRadius;
  if (c) {
    return `${c.topLeft ?? 0}px ${c.topRight ?? 0}px ${c.bottomRight ?? 0}px ${c.bottomLeft ?? 0}px`;
  }
  return p.borderRadius;
}

const SHADOW_OFFSET = 10;

/** box-shadow suy từ các hướng đã chọn (top/bottom/left/right kết hợp được). */
export function imageBoxShadow(p: ImageElement["props"]): string | undefined {
  const s = p.shadow;
  if (!s || s.directions.length === 0) return undefined;
  const off = SHADOW_OFFSET;
  let x = 0;
  let y = 0;
  if (s.directions.includes("right")) x += off;
  if (s.directions.includes("left")) x -= off;
  if (s.directions.includes("bottom")) y += off;
  if (s.directions.includes("top")) y -= off;
  const blur = s.blur ?? 24;
  const spread = s.spread ?? 0;
  const color = s.color ?? "rgba(0,0,0,0.28)";
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/** Style ảnh (không tính position/size — do element-view/preview tự đặt). */
export function imageContentStyle(p: ImageElement["props"]): CSSProperties {
  return {
    objectFit: p.objectFit,
    borderRadius: imageBorderRadius(p),
    boxShadow: imageBoxShadow(p),
  };
}

/** Icon có nền/viền → cần render trong khung có padding; trả style khung + có nền hay không. */
export function iconHasBox(p: IconElement["props"]): boolean {
  return Boolean(p.backgroundColor || (p.borderColor && (p.borderWidth ?? 0) > 0));
}

export function iconBoxStyle(p: IconElement["props"]): CSSProperties {
  return {
    backgroundColor: p.backgroundColor,
    borderRadius: p.backgroundRadius ?? 12,
    border:
      p.borderColor && (p.borderWidth ?? 0) > 0
        ? `${p.borderWidth}px solid ${p.borderColor}`
        : undefined,
    // padding tương đối để icon không dính sát mép khung
    padding: "12%",
  };
}
