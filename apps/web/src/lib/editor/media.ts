import type { MediaKind } from "@repo/shared";

/**
 * Helper thuần cho element media — có test tại `scripts/test-media.ts`.
 */

function safeParseUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/**
 * Chuẩn hoá URL YouTube/Vimeo mọi dạng (watch/short link/shorts/live) về URL nhúng
 * cho iframe. URL không nhận diện được provider thì giữ nguyên (embed URL tùy ý).
 */
export function toEmbedUrl(raw: string): string {
  const url = safeParseUrl(raw.trim());
  if (!url) return raw.trim();
  const host = url.hostname.replace(/^(www\.|m\.)/, "");

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    const path = url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/);
    if (path?.[1]) return `https://www.youtube.com/embed/${path[1]}`;
    return url.toString();
  }
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? `https://www.youtube.com/embed/${id}` : url.toString();
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : url.toString();
  }
  if (host === "player.vimeo.com") return url.toString();
  return url.toString();
}

/** Lấy video id từ URL embed YouTube (URL đã chuẩn hoá qua toEmbedUrl, hoặc dạng watch). */
export function youtubeVideoId(url: string): string | null {
  const embed = url.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
  if (embed?.[1]) return embed[1];
  const parsed = safeParseUrl(url);
  if (!parsed) return null;
  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  if (host === "youtube.com") return parsed.searchParams.get("v");
  if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  return null;
}

/** Ảnh thumbnail YouTube cho preview tĩnh (sidebar/dashboard) — null nếu không phải YouTube. */
export function youtubeThumbnailUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export const MEDIA_KIND_LABEL: Record<MediaKind, string> = {
  video: "Video",
  audio: "Âm thanh",
  embed: "Nhúng (YouTube/Vimeo)",
};

/** Mime video/audio cho input file (đồng bộ LIMITS.MEDIA_ALLOWED_MIME). */
export const MEDIA_FILE_ACCEPT: Record<Exclude<MediaKind, "embed">, string> = {
  video: "video/mp4,video/webm",
  audio: "audio/mpeg,audio/wav,audio/ogg",
};
