/**
 * Test element media (chạy: pnpm --filter web exec jiti scripts/test-media.ts):
 * schema mediaElementSchema (hợp lệ/không hợp lệ), factory newMediaElement,
 * và chuẩn hoá URL nhúng toEmbedUrl (YouTube/Vimeo mọi dạng).
 */
import { mediaElementSchema, presentationSchema, slideElementSchema } from "@repo/shared";
import { toEmbedUrl, youtubeThumbnailUrl, youtubeVideoId } from "../src/lib/editor/media";
import { newMediaElement } from "../src/lib/editor/elements";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error(`✗ ${name}:`, e instanceof Error ? e.message : e);
  }
}

function assert(cond: boolean, msg = "assert failed") {
  if (!cond) throw new Error(msg);
}

function eq<T>(actual: T, expected: T, msg?: string) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg ?? "eq"}: ${a} !== ${b}`);
}

const base = {
  id: "el1",
  position: { x: 0, y: 0 },
  size: { width: 640, height: 360 },
  rotation: 0,
  zIndex: 1,
};

/* ---------- schema ---------- */

test("media video hợp lệ parse OK", () => {
  mediaElementSchema.parse({
    ...base,
    type: "media",
    props: { kind: "video", url: "https://cdn.example.com/clip.mp4", controls: true, muted: true },
  });
});

test("media url rỗng (placeholder) hợp lệ", () => {
  mediaElementSchema.parse({ ...base, type: "media", props: { kind: "embed", url: "" } });
});

test("media kind lạ bị từ chối", () => {
  const r = mediaElementSchema.safeParse({
    ...base,
    type: "media",
    props: { kind: "gif", url: "" },
  });
  assert(!r.success, "kind lạ phải fail");
});

test("media url không phải URL bị từ chối", () => {
  const r = mediaElementSchema.safeParse({
    ...base,
    type: "media",
    props: { kind: "video", url: "not-a-url" },
  });
  assert(!r.success, "url rác phải fail");
});

test("slideElementSchema nhận diện media qua discriminated union", () => {
  const el = slideElementSchema.parse({
    ...base,
    type: "media",
    props: { kind: "audio", url: "https://cdn.example.com/song.mp3" },
  });
  assert(el.type === "media");
});

test("presentation chứa media parse OK (content cũ không vỡ)", () => {
  presentationSchema.parse({
    schemaVersion: 1,
    themeId: null,
    slides: [
      {
        id: "s1",
        background: { type: "color", value: "#ffffff" },
        elements: [
          { ...base, type: "media", props: { kind: "video", url: "", loop: true } },
        ],
      },
    ],
  });
});

/* ---------- factory ---------- */

test("newMediaElement: video 16:9, audio thanh ngang, url rỗng + controls", () => {
  const video = newMediaElement([], "video");
  const audio = newMediaElement([video], "audio");
  eq(video.size, { width: 640, height: 360 });
  eq(audio.size, { width: 560, height: 72 });
  eq(video.props.url, "");
  assert(video.props.controls === true);
  assert(audio.zIndex > video.zIndex, "zIndex nối tiếp");
  assert(video.id !== audio.id);
  mediaElementSchema.parse(video);
  mediaElementSchema.parse(audio);
});

/* ---------- toEmbedUrl ---------- */

test("youtube watch → embed", () => {
  eq(
    toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("youtube watch có tham số thừa vẫn lấy đúng id", () => {
  eq(
    toEmbedUrl("https://www.youtube.com/watch?v=abc123XYZ_-&t=42s&list=PL1"),
    "https://www.youtube.com/embed/abc123XYZ_-",
  );
});

test("youtu.be short link → embed", () => {
  eq(toEmbedUrl("https://youtu.be/dQw4w9WgXcQ?si=xxx"), "https://www.youtube.com/embed/dQw4w9WgXcQ");
});

test("youtube shorts → embed", () => {
  eq(
    toEmbedUrl("https://www.youtube.com/shorts/abcdef12345"),
    "https://www.youtube.com/embed/abcdef12345",
  );
});

test("youtube m. (mobile) → embed", () => {
  eq(
    toEmbedUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("youtube embed sẵn giữ nguyên dạng embed", () => {
  eq(
    toEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
});

test("vimeo → player.vimeo.com", () => {
  eq(toEmbedUrl("https://vimeo.com/123456789"), "https://player.vimeo.com/video/123456789");
});

test("player.vimeo.com giữ nguyên", () => {
  eq(
    toEmbedUrl("https://player.vimeo.com/video/123456789"),
    "https://player.vimeo.com/video/123456789",
  );
});

test("URL provider lạ giữ nguyên", () => {
  eq(toEmbedUrl("https://example.com/embed/xyz"), "https://example.com/embed/xyz");
});

test("chuỗi không phải URL giữ nguyên (không crash)", () => {
  eq(toEmbedUrl("  hello world  "), "hello world");
});

/* ---------- youtube thumbnail (preview tĩnh sidebar/dashboard) ---------- */

test("youtubeVideoId từ URL embed đã chuẩn hoá", () => {
  eq(youtubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("youtubeVideoId từ URL watch thô", () => {
  eq(youtubeVideoId("https://www.youtube.com/watch?v=abc123"), "abc123");
  eq(youtubeVideoId("https://youtu.be/abc123"), "abc123");
});

test("youtubeThumbnailUrl trả ảnh i.ytimg.com", () => {
  eq(
    youtubeThumbnailUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  );
});

test("youtubeThumbnailUrl với URL không phải YouTube → null", () => {
  eq(youtubeThumbnailUrl("https://player.vimeo.com/video/123"), null);
  eq(youtubeThumbnailUrl("not a url"), null);
});

console.log(`\n${passed}/${passed + failed} pass`);
if (failed > 0) process.exit(1);
