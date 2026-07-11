import type {
  Animation as AnimationDef,
  AnimationEffect,
  AnimationGroup,
  SlideElement,
} from "@repo/shared";

/* ============================================================
 * Metadata hiệu ứng
 * ============================================================ */

export type EffectMeta = {
  id: AnimationEffect;
  label: string;
  group: AnimationGroup;
  /** Có tuỳ chọn hướng (fly/wipe/split/float/motion). */
  direction?: boolean;
};

export const ANIMATION_EFFECTS: EffectMeta[] = [
  // entrance
  { id: "fade-in", label: "Mờ dần vào (Fade)", group: "entrance" },
  { id: "appear", label: "Xuất hiện (Appear)", group: "entrance" },
  { id: "fly-in", label: "Bay vào (Fly In)", group: "entrance", direction: true },
  { id: "zoom-in", label: "Phóng vào (Zoom)", group: "entrance" },
  { id: "grow-in", label: "Lớn dần vào (Grow)", group: "entrance" },
  { id: "wipe-in", label: "Quét vào (Wipe)", group: "entrance", direction: true },
  { id: "split-in", label: "Tách vào (Split)", group: "entrance", direction: true },
  { id: "float-in", label: "Trôi vào (Float In)", group: "entrance", direction: true },
  { id: "bounce-in", label: "Nảy vào (Bounce)", group: "entrance" },
  { id: "spin-in", label: "Xoay vào (Spin In)", group: "entrance" },
  { id: "drop-in", label: "Rơi xuống (Drop)", group: "entrance" },
  { id: "flip-in", label: "Lật vào (Flip)", group: "entrance" },
  { id: "swivel-in", label: "Xoay lắc vào (Swivel)", group: "entrance" },
  { id: "stretch-in", label: "Kéo giãn vào (Stretch)", group: "entrance" },
  { id: "shape-in", label: "Mở tròn (Shape)", group: "entrance" },
  { id: "grow-turn-in", label: "Lớn & xoay (Grow & Turn)", group: "entrance" },
  // emphasis
  { id: "pulse", label: "Nhịp đập (Pulse)", group: "emphasis" },
  { id: "spin", label: "Xoay (Spin)", group: "emphasis" },
  { id: "flash", label: "Chớp nháy (Flash)", group: "emphasis" },
  { id: "shake", label: "Rung lắc (Shake)", group: "emphasis" },
  { id: "grow-shrink", label: "Phồng/co (Grow/Shrink)", group: "emphasis" },
  { id: "teeter", label: "Lắc lư (Teeter)", group: "emphasis" },
  { id: "color-pulse", label: "Nháy màu (Color Pulse)", group: "emphasis" },
  { id: "desaturate", label: "Xám dần (Desaturate)", group: "emphasis" },
  { id: "darken", label: "Tối đi (Darken)", group: "emphasis" },
  { id: "lighten", label: "Sáng lên (Lighten)", group: "emphasis" },
  { id: "transparency", label: "Trong mờ (Transparency)", group: "emphasis" },
  // exit
  { id: "fade-out", label: "Mờ dần ra (Fade)", group: "exit" },
  { id: "fly-out", label: "Bay ra (Fly Out)", group: "exit", direction: true },
  { id: "zoom-out", label: "Thu nhỏ ra (Zoom)", group: "exit" },
  { id: "shrink-out", label: "Co lại ra (Shrink)", group: "exit" },
  { id: "wipe-out", label: "Quét ra (Wipe)", group: "exit", direction: true },
  { id: "disappear", label: "Biến mất (Disappear)", group: "exit" },
  { id: "float-out", label: "Trôi ra (Float Out)", group: "exit", direction: true },
  { id: "split-out", label: "Khép vào giữa (Split)", group: "exit", direction: true },
  { id: "bounce-out", label: "Nảy ra (Bounce)", group: "exit" },
  { id: "spin-out", label: "Xoay ra (Spin Out)", group: "exit" },
  { id: "stretch-out", label: "Bẹp về tâm (Stretch)", group: "exit" },
  { id: "shape-out", label: "Khép tròn (Shape)", group: "exit" },
  { id: "flip-out", label: "Lật ra (Flip)", group: "exit" },
  // motion
  { id: "motion-line", label: "Đường thẳng (Lines)", group: "motion", direction: true },
  { id: "motion-arc", label: "Cung cong (Arcs)", group: "motion", direction: true },
  { id: "motion-turn", label: "Gấp khúc (Turns)", group: "motion", direction: true },
  { id: "motion-circle", label: "Vòng tròn (Shapes)", group: "motion" },
];

export const EFFECT_META: Record<AnimationEffect, EffectMeta> = Object.fromEntries(
  ANIMATION_EFFECTS.map((e) => [e.id, e]),
) as Record<AnimationEffect, EffectMeta>;

export const ANIMATION_GROUP_LABELS: Record<AnimationGroup, string> = {
  entrance: "Xuất hiện",
  emphasis: "Nhấn mạnh",
  exit: "Biến mất",
  motion: "Chuyển động",
};

export const ANIMATION_GROUP_COLORS: Record<AnimationGroup, string> = {
  entrance: "#22c55e",
  emphasis: "#f59e0b",
  exit: "#ef4444",
  motion: "#3b82f6",
};

const DEFAULT_DURATION_MS: Record<AnimationGroup, number> = {
  entrance: 500,
  emphasis: 600,
  exit: 500,
  motion: 800,
};

/** Tạo animation mới với tham số mặc định hợp lý theo hiệu ứng. */
export function createAnimation(elementId: string, effect: AnimationEffect): AnimationDef {
  const meta = EFFECT_META[effect];
  return {
    id: crypto.randomUUID(),
    elementId,
    group: meta.group,
    effect,
    trigger: "on-click",
    durationMs: DEFAULT_DURATION_MS[meta.group],
    delayMs: 0,
    ...(meta.direction ? { direction: "left" as const } : {}),
  };
}

/* ============================================================
 * Keyframes cho Web Animations API
 * ============================================================ */

const FLY = 640; // khoảng cách bay vào/ra (px logic)
const MOTION = 240;

/** Ghép rotation cố định vào transform để không mất góc xoay khi animate. */
function withRot(deg: number, transform: string): string {
  return deg ? `${transform} rotate(${deg}deg)` : transform;
}

function dirTranslate(dir: "left" | "right" | "top" | "bottom", dist: number): string {
  switch (dir) {
    case "left":
      return `translateX(-${dist}px)`;
    case "right":
      return `translateX(${dist}px)`;
    case "top":
      return `translateY(-${dist}px)`;
    case "bottom":
      return `translateY(${dist}px)`;
  }
}

const WIPE_FROM: Record<"left" | "right" | "top" | "bottom", string> = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  top: "inset(0 0 100% 0)",
  bottom: "inset(100% 0 0 0)",
};

type Dir = "left" | "right" | "top" | "bottom";

/** Vector đơn vị theo hướng. */
function dirVector(dir: Dir): { x: number; y: number } {
  switch (dir) {
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    case "top":
      return { x: 0, y: -1 };
    case "bottom":
      return { x: 0, y: 1 };
  }
}

/** Lấy mẫu đường cong tham số t∈[0,1] thành keyframes translate (giữ rotation). */
function samplePath(
  fn: (t: number) => { x: number; y: number },
  rotation: number,
  samples = 13,
): Keyframe[] {
  return Array.from({ length: samples }, (_, i) => {
    const t = i / (samples - 1);
    const { x, y } = fn(t);
    return {
      offset: t,
      transform: withRot(rotation, `translate(${Math.round(x * 10) / 10}px, ${Math.round(y * 10) / 10}px)`),
    };
  });
}

/** Cung cong bezier bậc 2 từ (0,0) tới điểm cuối theo hướng, vồng lên vuông góc. */
function arcPath(dir: Dir, rotation: number): Keyframe[] {
  const v = dirVector(dir);
  const dist = MOTION;
  const end = { x: v.x * dist, y: v.y * dist };
  // pháp tuyến (vuông góc) để tạo độ vồng — hướng ngang vồng lên, hướng dọc vồng phải
  const n = v.x !== 0 ? { x: 0, y: -1 } : { x: 1, y: 0 };
  const ctrl = { x: end.x / 2 + n.x * dist * 0.5, y: end.y / 2 + n.y * dist * 0.5 };
  return samplePath(
    (t) => ({
      x: (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrl.x + t * t * end.x,
      y: (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrl.y + t * t * end.y,
    }),
    rotation,
  );
}

/** Trả keyframes + options cho 1 animation. `rotation` = góc xoay hiện tại của element. */
export function buildAnimation(
  anim: AnimationDef,
  rotation: number,
): { keyframes: Keyframe[]; options: KeyframeAnimationOptions } {
  const dir = anim.direction ?? "left";
  const none = withRot(rotation, "translate(0,0)");
  let keyframes: Keyframe[];

  switch (anim.effect) {
    // ---- entrance ----
    case "fade-in":
      keyframes = [{ opacity: 0 }, { opacity: 1 }];
      break;
    case "appear":
      keyframes = [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.99 }, { opacity: 1, offset: 1 }];
      break;
    case "fly-in":
      keyframes = [
        { opacity: 1, transform: withRot(rotation, dirTranslate(dir, FLY)) },
        { opacity: 1, transform: none },
      ];
      break;
    case "zoom-in":
      keyframes = [
        { opacity: 0, transform: withRot(rotation, "scale(0.3)") },
        { opacity: 1, transform: withRot(rotation, "scale(1)") },
      ];
      break;
    case "grow-in":
      keyframes = [
        { opacity: 1, transform: withRot(rotation, "scale(0)") },
        { opacity: 1, transform: withRot(rotation, "scale(1)") },
      ];
      break;
    case "wipe-in":
      keyframes = [
        { opacity: 1, clipPath: WIPE_FROM[dir] },
        { opacity: 1, clipPath: "inset(0 0 0 0)" },
      ];
      break;
    case "split-in":
      keyframes = [
        { opacity: 1, clipPath: dir === "top" || dir === "bottom" ? "inset(50% 0 50% 0)" : "inset(0 50% 0 50%)" },
        { opacity: 1, clipPath: "inset(0 0 0 0)" },
      ];
      break;
    case "float-in":
      keyframes = [
        { opacity: 0, transform: withRot(rotation, dirTranslate(dir, 60)) },
        { opacity: 1, transform: none },
      ];
      break;
    case "bounce-in":
      keyframes = [
        { opacity: 0, transform: withRot(rotation, "translateY(-80px)"), offset: 0 },
        { opacity: 1, transform: withRot(rotation, "translateY(0)"), offset: 0.6 },
        { transform: withRot(rotation, "translateY(-16px)"), offset: 0.8 },
        { transform: none, offset: 1 },
      ];
      break;
    case "spin-in":
      keyframes = [
        { opacity: 0, transform: `scale(0.4) rotate(${rotation - 180}deg)` },
        { opacity: 1, transform: `scale(1) rotate(${rotation}deg)` },
      ];
      break;
    case "drop-in":
      // rơi từ trên xuống, chạm đất nảy nhẹ 1 nhịp
      keyframes = [
        { opacity: 1, transform: withRot(rotation, "translateY(-480px)"), offset: 0, easing: "ease-in" },
        { opacity: 1, transform: withRot(rotation, "translateY(0)"), offset: 0.65 },
        { transform: withRot(rotation, "translateY(-36px)"), offset: 0.82, easing: "ease-in" },
        { transform: none, offset: 1 },
      ];
      break;
    case "flip-in":
      keyframes = [
        { opacity: 0, transform: withRot(rotation, "perspective(900px) rotateY(90deg)") },
        { opacity: 1, transform: withRot(rotation, "perspective(900px) rotateY(0deg)") },
      ];
      break;
    case "swivel-in":
      // lắc quanh trục dọc rồi ổn định — mô phỏng Swivel của PowerPoint
      keyframes = [
        { opacity: 0, transform: withRot(rotation, "perspective(900px) rotateY(90deg)"), offset: 0 },
        { opacity: 1, transform: withRot(rotation, "perspective(900px) rotateY(-40deg)"), offset: 0.45 },
        { transform: withRot(rotation, "perspective(900px) rotateY(20deg)"), offset: 0.72 },
        { transform: withRot(rotation, "perspective(900px) rotateY(-8deg)"), offset: 0.88 },
        { opacity: 1, transform: withRot(rotation, "perspective(900px) rotateY(0deg)"), offset: 1 },
      ];
      break;
    case "stretch-in":
      keyframes = [
        { opacity: 0, transform: withRot(rotation, "scaleX(0)") },
        { opacity: 1, transform: withRot(rotation, "scaleX(1)") },
      ];
      break;
    case "shape-in":
      keyframes = [
        { opacity: 1, clipPath: "circle(0% at 50% 50%)" },
        { opacity: 1, clipPath: "circle(75% at 50% 50%)" },
      ];
      break;
    case "grow-turn-in":
      keyframes = [
        { opacity: 0, transform: `scale(0.1) rotate(${rotation - 90}deg)` },
        { opacity: 1, transform: `scale(1) rotate(${rotation}deg)` },
      ];
      break;
    // ---- emphasis ----
    case "pulse":
      keyframes = [
        { transform: withRot(rotation, "scale(1)") },
        { transform: withRot(rotation, "scale(1.12)") },
        { transform: withRot(rotation, "scale(1)") },
      ];
      break;
    case "spin":
      keyframes = [
        { transform: `rotate(${rotation}deg)` },
        { transform: `rotate(${rotation + 360}deg)` },
      ];
      break;
    case "flash":
      keyframes = [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }];
      break;
    case "shake":
      keyframes = [
        { transform: none, offset: 0 },
        { transform: withRot(rotation, "translateX(-10px)"), offset: 0.2 },
        { transform: withRot(rotation, "translateX(10px)"), offset: 0.4 },
        { transform: withRot(rotation, "translateX(-8px)"), offset: 0.6 },
        { transform: withRot(rotation, "translateX(8px)"), offset: 0.8 },
        { transform: none, offset: 1 },
      ];
      break;
    case "grow-shrink":
      keyframes = [
        { transform: withRot(rotation, "scale(1)") },
        { transform: withRot(rotation, "scale(1.3)") },
        { transform: withRot(rotation, "scale(1)") },
      ];
      break;
    case "teeter":
      keyframes = [
        { transform: `rotate(${rotation}deg)`, offset: 0 },
        { transform: `rotate(${rotation + 6}deg)`, offset: 0.2 },
        { transform: `rotate(${rotation - 6}deg)`, offset: 0.4 },
        { transform: `rotate(${rotation + 4}deg)`, offset: 0.6 },
        { transform: `rotate(${rotation - 4}deg)`, offset: 0.8 },
        { transform: `rotate(${rotation}deg)`, offset: 1 },
      ];
      break;
    case "color-pulse":
      keyframes = [
        { filter: "none" },
        { filter: "saturate(3) brightness(1.2) hue-rotate(20deg)" },
        { filter: "none" },
      ];
      break;
    // 4 hiệu ứng dưới GIỮ trạng thái cuối tới hết slide (fill forwards) — như PowerPoint
    case "desaturate":
      keyframes = [{ filter: "grayscale(0)" }, { filter: "grayscale(1)" }];
      break;
    case "darken":
      keyframes = [{ filter: "brightness(1)" }, { filter: "brightness(0.55)" }];
      break;
    case "lighten":
      keyframes = [{ filter: "brightness(1)" }, { filter: "brightness(1.6)" }];
      break;
    case "transparency":
      keyframes = [{ opacity: 1 }, { opacity: 0.4 }];
      break;
    // ---- exit ----
    case "fade-out":
      keyframes = [{ opacity: 1 }, { opacity: 0 }];
      break;
    case "fly-out":
      keyframes = [
        { opacity: 1, transform: none },
        { opacity: 1, transform: withRot(rotation, dirTranslate(dir, FLY)) },
      ];
      break;
    case "zoom-out":
      keyframes = [
        { opacity: 1, transform: withRot(rotation, "scale(1)") },
        { opacity: 0, transform: withRot(rotation, "scale(0.3)") },
      ];
      break;
    case "shrink-out":
      keyframes = [
        { opacity: 1, transform: withRot(rotation, "scale(1)") },
        { opacity: 1, transform: withRot(rotation, "scale(0)") },
      ];
      break;
    case "wipe-out":
      keyframes = [
        { opacity: 1, clipPath: "inset(0 0 0 0)" },
        { opacity: 1, clipPath: WIPE_FROM[dir] },
      ];
      break;
    case "disappear":
      keyframes = [
        { opacity: 1, offset: 0 },
        { opacity: 0, offset: 0.01 },
        { opacity: 0, offset: 1 },
      ];
      break;
    case "float-out":
      keyframes = [
        { opacity: 1, transform: none },
        { opacity: 0, transform: withRot(rotation, dirTranslate(dir, 60)) },
      ];
      break;
    case "split-out":
      keyframes = [
        { opacity: 1, clipPath: "inset(0 0 0 0)" },
        {
          opacity: 0,
          clipPath: dir === "top" || dir === "bottom" ? "inset(50% 0 50% 0)" : "inset(0 50% 0 50%)",
        },
      ];
      break;
    case "bounce-out":
      keyframes = [
        { opacity: 1, transform: none, offset: 0 },
        { transform: withRot(rotation, "translateY(-40px)"), offset: 0.3, easing: "ease-in" },
        { opacity: 0, transform: withRot(rotation, "translateY(420px)"), offset: 1 },
      ];
      break;
    case "spin-out":
      keyframes = [
        { opacity: 1, transform: `scale(1) rotate(${rotation}deg)` },
        { opacity: 0, transform: `scale(0.1) rotate(${rotation + 180}deg)` },
      ];
      break;
    case "stretch-out":
      keyframes = [
        { opacity: 1, transform: withRot(rotation, "scaleX(1)") },
        { opacity: 0, transform: withRot(rotation, "scaleX(0)") },
      ];
      break;
    case "shape-out":
      keyframes = [
        { opacity: 1, clipPath: "circle(75% at 50% 50%)" },
        { opacity: 1, clipPath: "circle(0% at 50% 50%)" },
      ];
      break;
    case "flip-out":
      keyframes = [
        { opacity: 1, transform: withRot(rotation, "perspective(900px) rotateY(0deg)") },
        { opacity: 0, transform: withRot(rotation, "perspective(900px) rotateY(90deg)") },
      ];
      break;
    // ---- motion ----
    case "motion-line":
      keyframes = [
        { transform: none },
        { transform: withRot(rotation, dirTranslate(dir, MOTION)) },
      ];
      break;
    case "motion-arc":
      keyframes = arcPath(dir, rotation);
      break;
    case "motion-turn": {
      // gấp khúc chữ L: đi theo hướng chọn rồi rẽ vuông góc (theo chiều kim đồng hồ)
      const v = dirVector(dir);
      const turn = { x: -v.y, y: v.x };
      const leg = MOTION * 0.7;
      keyframes = [
        { transform: none, offset: 0 },
        { transform: withRot(rotation, `translate(${v.x * leg}px, ${v.y * leg}px)`), offset: 0.5 },
        {
          transform: withRot(rotation, `translate(${v.x * leg + turn.x * leg}px, ${v.y * leg + turn.y * leg}px)`),
          offset: 1,
        },
      ];
      break;
    }
    case "motion-circle":
      // vòng tròn khép kín phía trên, quay về đúng chỗ cũ
      keyframes = samplePath(
        (t) => {
          const th = t * Math.PI * 2;
          const R = 90;
          return { x: R * Math.sin(th), y: -R * (1 - Math.cos(th)) };
        },
        rotation,
        17,
      );
      break;
  }

  const iterations = anim.autoReverse ? (anim.repeat ?? 1) * 2 : anim.repeat ?? 1;
  // emphasis thường trả về trạng thái gốc; riêng nhóm đổi-màu-giữ (desaturate/darken/
  // lighten/transparency) giữ tới hết slide như PowerPoint
  const persistEmphasis =
    anim.effect === "desaturate" ||
    anim.effect === "darken" ||
    anim.effect === "lighten" ||
    anim.effect === "transparency";
  const fill: FillMode =
    anim.group === "entrance" || anim.group === "exit" || persistEmphasis ? "forwards" : "none";
  return {
    keyframes,
    options: {
      duration: anim.durationMs,
      delay: anim.delayMs,
      easing: anim.easing ?? "ease",
      iterations,
      direction: anim.autoReverse ? "alternate" : "normal",
      fill,
    },
  };
}

/* ============================================================
 * Player — phát chuỗi animation của 1 slide trong editor
 * ============================================================ */

export type AnimationPlayer = { cancel: () => void };

/**
 * Phát toàn bộ animation của slide theo thứ tự. `container` chứa các node có
 * `data-el-id`. Preview auto-advance: on-click/after-previous đợi bước trước xong,
 * with-previous phát cùng bước trước.
 */
export function playSlideAnimations(
  container: HTMLElement,
  animations: AnimationDef[],
  elements: SlideElement[],
  onEnd?: () => void,
): AnimationPlayer {
  const rotationOf = new Map(elements.map((e) => [e.id, e.rotation]));
  const node = (id: string) => container.querySelector<HTMLElement>(`[data-el-id="${id}"]`);

  // Gom thành các "bước": with-previous nối vào bước trước, còn lại mở bước mới
  const steps: AnimationDef[][] = [];
  for (const a of animations) {
    if (a.trigger === "with-previous" && steps.length > 0) steps[steps.length - 1]!.push(a);
    else steps.push([a]);
  }

  // Ẩn trước các element có hiệu ứng entrance (để chưa phát thì chưa hiện)
  const restore: { el: HTMLElement; opacity: string }[] = [];
  const hidden = new Set<string>();
  for (const a of animations) {
    if (a.group === "entrance" && !hidden.has(a.elementId)) {
      const n = node(a.elementId);
      if (n) {
        restore.push({ el: n, opacity: n.style.opacity });
        n.style.opacity = "0";
        hidden.add(a.elementId);
      }
    }
  }

  let cancelled = false;
  const running: Animation[] = [];

  function cleanup() {
    for (const w of running) {
      try {
        w.cancel();
      } catch {
        // animation đã kết thúc
      }
    }
    for (const r of restore) r.el.style.opacity = r.opacity;
    onEnd?.();
  }

  async function run() {
    for (const step of steps) {
      if (cancelled) return;
      const waits: Promise<unknown>[] = [];
      for (const a of step) {
        const n = node(a.elementId);
        if (!n) continue;
        const { keyframes, options } = buildAnimation(a, rotationOf.get(a.elementId) ?? 0);
        const wa = n.animate(keyframes, options);
        running.push(wa);
        waits.push(wa.finished.catch(() => undefined));
      }
      await Promise.all(waits);
    }
    if (!cancelled) cleanup();
  }

  void run();
  return {
    cancel: () => {
      if (cancelled) return;
      cancelled = true;
      cleanup();
    },
  };
}

/* ============================================================
 * Presentation player — phát theo TRIGGER khi trình chiếu (Phase 3)
 * ============================================================ */

export type PresentationPlayer = {
  /**
   * Người xem "click tới": phát bước on-click kế tiếp (kèm chuỗi after-previous
   * theo sau). Trả `true` nếu có bước để phát; `false` = hết hiệu ứng, caller
   * chuyển slide.
   */
  next: () => boolean;
  /**
   * "Click lùi": hoàn tác chuỗi hiệu ứng phát gần nhất (entrance ẩn lại, exit hiện lại
   * — như PowerPoint). Trả `false` nếu chưa phát gì → caller lùi slide.
   */
  prev: () => boolean;
  cancel: () => void;
};

/**
 * Player cho chế độ trình chiếu — khác preview (auto-advance toàn bộ):
 * with-previous gộp vào bước trước; after-previous tự phát nối sau bước trước;
 * on-click ĐỢI người xem click. Vào slide tự phát chuỗi mở đầu nếu bước đầu
 * không phải on-click. Entrance được ẩn trước khi phát (fill forwards giữ trạng thái cuối).
 *
 * `startAtEnd`: dùng khi LÙI về slide — dựng trạng thái đã build XONG bằng cách phát
 * toàn bộ chuỗi ở chế độ tức thời (WAAPI `finish()`), nên lịch sử `played` ĐẦY ĐỦ:
 * lùi tiếp sẽ gỡ đúng từng bước một (như PowerPoint), tiến lại thì replay hiệu ứng thật.
 *
 * Undo (`prev`) hoạt động nhờ WAAPI: hủy Animation của chuỗi → element quay về style
 * nền — entrance có inline `opacity: 0` pre-hide nên ẩn lại; exit về trạng thái hiện.
 */
export function createPresentationPlayer(
  container: HTMLElement,
  animations: AnimationDef[],
  elements: SlideElement[],
  opts: { startAtEnd?: boolean } = {},
): PresentationPlayer {
  const rotationOf = new Map(elements.map((e) => [e.id, e.rotation]));
  const node = (id: string) => container.querySelector<HTMLElement>(`[data-el-id="${id}"]`);

  const steps: AnimationDef[][] = [];
  for (const a of animations) {
    if (a.trigger === "with-previous" && steps.length > 0) steps[steps.length - 1]!.push(a);
    else steps.push([a]);
  }

  // Ẩn trước element có entrance — chưa phát thì chưa hiện. Áp CẢ khi startAtEnd:
  // trạng thái "đã build" đến từ fill-forwards của animation đã finish; nhờ vậy khi
  // prev() hủy chuỗi, element entrance quay về đúng trạng thái ẩn.
  const restore: { el: HTMLElement; opacity: string }[] = [];
  const hidden = new Set<string>();
  for (const a of animations) {
    if (a.group === "entrance" && !hidden.has(a.elementId)) {
      const n = node(a.elementId);
      if (n) {
        restore.push({ el: n, opacity: n.style.opacity });
        n.style.opacity = "0";
        hidden.add(a.elementId);
      }
    }
  }

  let index = 0;
  let cancelled = false;
  /** Lịch sử theo CHUỖI đã phát: index bắt đầu + các Animation WAAPI tạo ra — để prev() hoàn tác. */
  const played: { startIndex: number; animations: Animation[]; aborted: boolean }[] = [];

  function playStep(step: AnimationDef[], bucket: Animation[]): Promise<void> {
    const waits: Promise<unknown>[] = [];
    for (const a of step) {
      const n = node(a.elementId);
      if (!n) continue;
      const { keyframes, options } = buildAnimation(a, rotationOf.get(a.elementId) ?? 0);
      const wa = n.animate(keyframes, options);
      bucket.push(wa);
      waits.push(wa.finished.catch(() => undefined));
    }
    return Promise.all(waits).then(() => undefined);
  }

  /** Phát step tại `index` + mọi step after-previous nối tiếp sau nó (1 "click" = 1 chuỗi). */
  async function playChain() {
    const chain = { startIndex: index, animations: [] as Animation[], aborted: false };
    played.push(chain);
    let first = true;
    // check `chain.aborted` mỗi vòng: prev() giữa chừng phải dừng chuỗi, không phát tiếp từ index đã reset
    while (index < steps.length && !cancelled && !chain.aborted) {
      const step = steps[index]!;
      // dừng TRƯỚC bước on-click kế tiếp (trừ bước đầu chuỗi — được click kích hoạt)
      if (!first && step[0]!.trigger === "on-click") return;
      first = false;
      index++;
      await playStep(step, chain.animations);
    }
  }

  function cancelAnimations(list: Animation[]) {
    for (const w of list) {
      try {
        w.cancel();
      } catch {
        // animation đã kết thúc
      }
    }
  }

  /** Phát 1 chuỗi TỨC THỜI (finish ngay) — dựng lịch sử khi vào slide bằng nút lùi. */
  function playChainInstant() {
    const chain = { startIndex: index, animations: [] as Animation[], aborted: false };
    played.push(chain);
    let first = true;
    while (index < steps.length) {
      const step = steps[index]!;
      if (!first && step[0]!.trigger === "on-click") return;
      first = false;
      index++;
      for (const a of step) {
        const n = node(a.elementId);
        if (!n) continue;
        const { keyframes, options } = buildAnimation(a, rotationOf.get(a.elementId) ?? 0);
        const wa = n.animate(keyframes, options);
        wa.finish(); // nhảy thẳng tới trạng thái cuối (fill forwards giữ nguyên)
        chain.animations.push(wa);
      }
    }
  }

  if (opts.startAtEnd) {
    // Lùi về slide: build đủ mọi bước NGAY nhưng theo đúng cấu trúc chuỗi —
    // prev() sau đó gỡ được từng bước một, next() replay hiệu ứng thật
    while (index < steps.length) playChainInstant();
  } else if (steps.length > 0 && steps[0]![0]!.trigger !== "on-click") {
    // Vào slide xuôi: tự phát chuỗi mở đầu nếu bước đầu không phải on-click
    void playChain();
  }

  return {
    next: () => {
      if (cancelled || index >= steps.length) return false;
      void playChain();
      return true;
    },
    prev: () => {
      if (cancelled) return false;
      const chain = played.pop();
      if (!chain) return false;
      chain.aborted = true; // chuỗi đang phát dở phải dừng vòng lặp của nó
      cancelAnimations(chain.animations); // hủy → element về style nền (entrance ẩn lại)
      index = chain.startIndex;
      return true;
    },
    cancel: () => {
      if (cancelled) return;
      cancelled = true;
      for (const chain of played) cancelAnimations(chain.animations);
      for (const r of restore) r.el.style.opacity = r.opacity;
    },
  };
}

/* ============================================================
 * Default animation (per element type) — lưu localStorage
 * ============================================================ */

const DEFAULT_ANIM_KEY = "vpb:default-animations";
type DefaultMap = Partial<Record<SlideElement["type"], AnimationEffect>>;

export function getDefaultAnimations(): DefaultMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEFAULT_ANIM_KEY);
    return raw ? (JSON.parse(raw) as DefaultMap) : {};
  } catch {
    return {};
  }
}

export function setDefaultAnimation(type: SlideElement["type"], effect: AnimationEffect | null) {
  const cur = getDefaultAnimations();
  if (effect) cur[type] = effect;
  else delete cur[type];
  try {
    window.localStorage.setItem(DEFAULT_ANIM_KEY, JSON.stringify(cur));
  } catch {
    // localStorage bị chặn — bỏ qua
  }
}
