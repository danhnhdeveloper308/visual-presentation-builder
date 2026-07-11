"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaElement } from "@repo/shared";
import { Film, Music, MonitorPlay, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDIA_KIND_LABEL, youtubeThumbnailUrl } from "@/lib/editor/media";

/**
 * Render element media, dùng chung 3 ngữ cảnh:
 * - "editor": canvas — xem thử NGAY không cần trình chiếu: video/audio có nút play/pause
 *   ở giữa (điều khiển programmatic, không vướng kéo/chọn), embed bấm play mới nạp iframe;
 * - "static": thumbnail/preview/export — video hiện frame đầu, embed YouTube hiện ảnh
 *   thumbnail thật + badge play (không nhúng iframe hàng loạt);
 * - "interactive": trình chiếu & trang xem — phát trực tiếp với controls đầy đủ.
 */
export type MediaRenderMode = "editor" | "static" | "interactive";

const KIND_ICON = { video: Film, audio: Music, embed: MonitorPlay } as const;

function PlaceholderBox({ props, hint }: { props: MediaElement["props"]; hint?: string }) {
  const Icon = KIND_ICON[props.kind];
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 bg-slate-900/90 text-slate-300"
      style={{ borderRadius: props.borderRadius }}
    >
      <Icon style={{ width: "22%", height: "22%", maxWidth: 48, maxHeight: 48 }} />
      <span className="px-2 text-center text-xs">{hint ?? MEDIA_KIND_LABEL[props.kind]}</span>
    </div>
  );
}

/** Badge play tĩnh (không tương tác) — báo hiệu media trong thumbnail nhỏ. */
function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex size-[22%] max-h-12 max-w-12 min-h-5 min-w-5 items-center justify-center rounded-full bg-black/55 text-white shadow">
        <Play className="h-1/2 w-1/2 translate-x-[6%]" fill="currentColor" />
      </span>
    </span>
  );
}

/** Nút play/pause ở giữa cho editor — nhận chuột dù khung media pointer-events-none. */
function PlayToggle({
  playing,
  onToggle,
  className,
}: {
  playing: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={playing ? "Dừng" : "Phát"}
      title={playing ? "Dừng" : "Phát thử ngay trong editor"}
      style={{ pointerEvents: "auto" }}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/75",
        playing && "opacity-40 hover:opacity-100",
        className,
      )}
    >
      {playing ? (
        <Pause className="size-5" fill="currentColor" />
      ) : (
        <Play className="size-5 translate-x-0.5" fill="currentColor" />
      )}
    </button>
  );
}

/** Video trong editor: hiện frame đầu, nút giữa phát/dừng tại chỗ. */
function EditorVideo({ props }: { props: MediaElement["props"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black"
      style={{ borderRadius: props.borderRadius, pointerEvents: "none" }}
    >
      <video
        ref={videoRef}
        src={props.url}
        poster={props.posterUrl}
        muted={!!props.muted}
        loop={props.loop}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <PlayToggle
        playing={playing}
        onToggle={() => {
          const v = videoRef.current;
          if (!v) return;
          if (v.paused) void v.play();
          else v.pause();
        }}
      />
    </div>
  );
}

/** Audio trong editor: thanh ngang + nút phát/dừng. */
function EditorAudio({ props }: { props: MediaElement["props"] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative flex h-full w-full items-center gap-3 overflow-hidden bg-slate-900 px-4 text-slate-200"
      style={{ borderRadius: props.borderRadius, pointerEvents: "none" }}
    >
      <Music className="size-6 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-xs opacity-80">
        {props.url.split("/").pop()}
      </span>
      <audio
        ref={audioRef}
        src={props.url}
        loop={props.loop}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <PlayToggle
        playing={playing}
        onToggle={() => {
          const a = audioRef.current;
          if (!a) return;
          if (a.paused) void a.play();
          else a.pause();
        }}
        className="static m-0 size-9 shrink-0"
      />
    </div>
  );
}

/**
 * Embed trong editor: mặc định hiện thumbnail (YouTube) + nút play; bấm play mới nạp
 * iframe (autoplay) và cho tương tác trực tiếp, nút ✕ để trở về (kéo/chọn lại bình thường).
 */
function EditorEmbed({ props }: { props: MediaElement["props"] }) {
  const [active, setActive] = useState(false);
  // Đổi nguồn → tắt iframe đang phát
  useEffect(() => setActive(false), [props.url]);

  const thumb = youtubeThumbnailUrl(props.url);

  if (active) {
    const sep = props.url.includes("?") ? "&" : "?";
    return (
      <div
        className="relative h-full w-full overflow-hidden bg-black"
        style={{ borderRadius: props.borderRadius, pointerEvents: "auto" }}
        role="none"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`${props.url}${sep}autoplay=1`}
          title="Nội dung nhúng"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
        <button
          type="button"
          aria-label="Đóng xem thử"
          title="Đóng xem thử (để kéo/chỉnh element)"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setActive(false);
          }}
          className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black"
      style={{ borderRadius: props.borderRadius, pointerEvents: "none" }}
    >
      {thumb ? (
        <img src={thumb} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-400">
          <MonitorPlay className="size-10" />
        </div>
      )}
      <PlayToggle playing={false} onToggle={() => setActive(true)} />
    </div>
  );
}

export function MediaContent({
  props,
  mode,
}: {
  props: MediaElement["props"];
  mode: MediaRenderMode;
}) {
  const radius = props.borderRadius;

  if (!props.url) {
    return (
      <PlaceholderBox
        props={props}
        hint={mode === "editor" ? "Chọn nguồn media ở bảng bên phải" : MEDIA_KIND_LABEL[props.kind]}
      />
    );
  }

  // Editor: xem thử tại chỗ, không cần trình chiếu
  if (mode === "editor") {
    switch (props.kind) {
      case "video":
        return <EditorVideo props={props} />;
      case "audio":
        return <EditorAudio props={props} />;
      case "embed":
        return <EditorEmbed props={props} />;
    }
  }

  // Thumbnail/preview/export: khung tĩnh phản ánh đúng nội dung (frame đầu / thumb YouTube)
  if (mode === "static") {
    switch (props.kind) {
      case "video":
        return (
          <div
            className="relative h-full w-full overflow-hidden bg-black"
            style={{ borderRadius: radius, pointerEvents: "none" }}
          >
            <video
              src={props.url}
              poster={props.posterUrl}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            />
            <PlayBadge />
          </div>
        );
      case "embed": {
        const thumb = youtubeThumbnailUrl(props.url);
        return (
          <div
            className="relative h-full w-full overflow-hidden bg-black"
            style={{ borderRadius: radius, pointerEvents: "none" }}
          >
            {thumb ? (
              <img src={thumb} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <MonitorPlay className="size-8" />
              </div>
            )}
            <PlayBadge />
          </div>
        );
      }
      case "audio":
        return (
          <div
            className="flex h-full w-full items-center gap-3 overflow-hidden bg-slate-900 px-4 text-slate-200"
            style={{ borderRadius: radius, pointerEvents: "none" }}
          >
            <Music className="size-6 shrink-0" />
            <span className="truncate text-xs opacity-80">{props.url.split("/").pop()}</span>
          </div>
        );
    }
  }

  // Trình chiếu & trang xem: phát trực tiếp. Khung SlideStatic là pointer-events-none —
  // bật lại cho media và chặn click lan ra ngoài (click media không được chuyển slide).
  const boxStyle: React.CSSProperties = { borderRadius: radius, pointerEvents: "auto" };
  const stopEvents = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onContextMenu: (e: React.MouseEvent) => e.stopPropagation(),
  };

  switch (props.kind) {
    case "video":
      return (
        <div className="h-full w-full overflow-hidden bg-black" style={boxStyle} {...stopEvents}>
          <video
            src={props.url}
            poster={props.posterUrl}
            controls={props.controls !== false}
            autoPlay={!!props.autoplay}
            loop={props.loop}
            muted={!!props.muted}
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        </div>
      );
    case "audio":
      return (
        <div
          className="flex h-full w-full items-center gap-3 overflow-hidden bg-slate-900 px-4 text-slate-200"
          style={boxStyle}
          {...stopEvents}
        >
          <Music className="size-6 shrink-0" />
          <audio
            src={props.url}
            controls={props.controls !== false}
            autoPlay={!!props.autoplay}
            loop={props.loop}
            className="min-w-0 flex-1"
          />
        </div>
      );
    case "embed":
      return (
        <div className="h-full w-full overflow-hidden bg-black" style={boxStyle} {...stopEvents}>
          <iframe
            src={props.url}
            title="Nội dung nhúng"
            className="h-full w-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            loading="lazy"
          />
        </div>
      );
  }
}
