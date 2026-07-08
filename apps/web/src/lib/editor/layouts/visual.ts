import {
  C,
  L,
  MONO,
  SERIF,
  card,
  chip,
  heading,
  icon,
  imagePh,
  line,
  shape,
  slide,
  text,
  titleBlock,
  type LayoutDef,
} from "./helpers";

/* ============================== 4. Image (14) ============================== */

export const IMAGE_LAYOUTS: LayoutDef[] = [
  L("image-full-background", "Ảnh nền toàn màn", () =>
    slide(C.bg, [
      imagePh(0, 0, 1280, 720, { radius: 0 }),
      shape("rect", 0, 0, 1280, 720, { fill: "rgba(15,23,42,0.55)" }),
      heading(80, 480, 900, 90, "Tiêu đề trên ảnh nền", { fontSize: 56, color: C.white }),
      text(80, 586, 700, 40, "Phụ đề mô tả — đặt ảnh của bạn làm nền.", { fontSize: 22, color: "rgba(255,255,255,0.85)" }),
    ]),
  ),
  L("image-left", "Ảnh trái", () =>
    slide(C.bg, [
      imagePh(0, 0, 620, 720, { radius: 0 }),
      heading(700, 200, 500, 120, "Tiêu đề nội dung", { fontSize: 46 }),
      text(700, 350, 500, 220, "Nội dung mô tả đi kèm hình ảnh minh họa bên trái.", { fontSize: 20, lineHeight: 1.7 }),
    ]),
  ),
  L("image-right", "Ảnh phải", () =>
    slide(C.bg, [
      imagePh(660, 0, 620, 720, { radius: 0 }),
      heading(80, 200, 500, 120, "Tiêu đề nội dung", { fontSize: 46 }),
      text(80, 350, 500, 220, "Nội dung mô tả đi kèm hình ảnh minh họa bên phải.", { fontSize: 20, lineHeight: 1.7 }),
    ]),
  ),
  L("image-top", "Ảnh trên", () =>
    slide(C.bg, [
      imagePh(0, 0, 1280, 340, { radius: 0 }),
      heading(80, 396, 1120, 70, "Tiêu đề bên dưới ảnh", { fontSize: 44 }),
      text(80, 490, 1120, 160, "Nội dung mô tả cho banner ảnh phía trên.", { fontSize: 20, lineHeight: 1.7 }),
    ]),
  ),
  L("image-bottom", "Ảnh dưới", () =>
    slide(C.bg, [
      heading(80, 70, 1120, 70, "Tiêu đề phía trên", { fontSize: 44 }),
      text(80, 165, 1120, 150, "Nội dung mô tả trước khi vào ảnh minh họa lớn bên dưới.", { fontSize: 20, lineHeight: 1.7 }),
      imagePh(0, 370, 1280, 350, { radius: 0 }),
    ]),
  ),
  L("image-grid-2", "Lưới 2 ảnh", () =>
    slide(C.bg, [
      titleBlock("Hình ảnh"),
      ...[0, 1].flatMap((i) => [
        imagePh(80 + i * 580, 190, 540, 350, { radius: 16 }),
        text(80 + i * 580, 556, 540, 30, `Chú thích ảnh ${i + 1}`, { fontSize: 16, color: C.muted, align: "center" }),
      ]),
    ]),
  ),
  L("image-grid-3", "Lưới 3 ảnh", () =>
    slide(C.bg, [
      titleBlock("Hình ảnh"),
      ...[0, 1, 2].flatMap((i) => [
        imagePh(80 + i * 386, 190, 346, 300, { radius: 16 }),
        text(80 + i * 386, 506, 346, 30, `Chú thích ${i + 1}`, { fontSize: 15, color: C.muted, align: "center" }),
      ]),
    ]),
  ),
  L("image-grid-4", "Lưới 4 ảnh", () =>
    slide(C.bg, [
      titleBlock("Hình ảnh"),
      ...[0, 1, 2, 3].map((i) =>
        imagePh(80 + (i % 2) * 580, 184 + Math.floor(i / 2) * 230, 540, 210, { radius: 14 }),
      ),
    ]),
  ),
  L("image-masonry", "Masonry", () =>
    slide(C.bg, [
      imagePh(80, 80, 346, 320, { radius: 14 }),
      imagePh(80, 420, 346, 220, { radius: 14 }),
      imagePh(446, 80, 346, 200, { radius: 14 }),
      imagePh(446, 300, 346, 340, { radius: 14 }),
      imagePh(812, 80, 388, 260, { radius: 14 }),
      imagePh(812, 360, 388, 280, { radius: 14 }),
    ]),
  ),
  L("image-carousel", "Carousel", () =>
    slide(C.bg, [
      imagePh(60, 200, 240, 300, { radius: 16, opacity: 0.45 }),
      imagePh(980, 200, 240, 300, { radius: 16, opacity: 0.45 }),
      imagePh(340, 150, 600, 380, { radius: 20 }),
      ...[0, 1, 2].map((i) =>
        shape("circle", 604 + i * 28, 570, 12, 12, { fill: i === 0 ? C.accent : C.border }),
      ),
      text(340, 610, 600, 32, "Chú thích ảnh hiện tại", { fontSize: 17, color: C.muted, align: "center" }),
    ]),
  ),
  L("image-before-after", "Ảnh Trước / Sau", () =>
    slide(C.bg, [
      titleBlock("Trước & Sau"),
      imagePh(80, 200, 500, 340, { radius: 16 }),
      ...chip(100, 220, 100, 34, "Trước", { fill: "rgba(15,23,42,0.75)", color: C.white, fontSize: 14 }),
      icon("arrow-right", 604, 340, 72, C.accent),
      imagePh(700, 200, 500, 340, { radius: 16 }),
      ...chip(720, 220, 100, 34, "Sau", { fill: C.accent, color: C.white, fontSize: 14 }),
    ]),
  ),
  L("image-circle-focus", "Ảnh tròn nhấn mạnh", () =>
    slide(C.bg, [
      imagePh(140, 170, 380, 380, { circle: true }),
      heading(600, 220, 600, 110, "Tiêu đề đi kèm", { fontSize: 44 }),
      text(600, 360, 600, 180, "Ảnh bo tròn tạo điểm nhấn thị giác — phù hợp chân dung hoặc chi tiết sản phẩm.", {
        fontSize: 20,
        lineHeight: 1.7,
      }),
    ]),
  ),
  L("image-collage", "Collage", () =>
    slide(C.card, [
      imagePh(120, 140, 360, 260, { radius: 14, rotation: -5, noIcon: true }),
      imagePh(360, 320, 380, 270, { radius: 14, rotation: 4, noIcon: true }),
      imagePh(700, 130, 360, 250, { radius: 14, rotation: 6, noIcon: true }),
      imagePh(820, 360, 340, 240, { radius: 14, rotation: -4, noIcon: true }),
      imagePh(470, 110, 340, 240, { radius: 14 }),
      text(80, 630, 1120, 40, "Bộ sưu tập khoảnh khắc", { fontSize: 22, fontWeight: 700, color: C.heading, align: "center" }),
    ]),
  ),
  L("image-hero-banner", "Hero banner", () =>
    slide(C.bg, [
      imagePh(80, 120, 1120, 380, { radius: 24 }),
      heading(80, 540, 800, 60, "Tiêu đề hero", { fontSize: 42 }),
      text(80, 616, 900, 36, "Mô tả ngắn bên dưới banner lớn.", { fontSize: 19, color: C.muted }),
    ]),
  ),
];

/* ============================== 15. Media (6) ============================== */

export const MEDIA_LAYOUTS: LayoutDef[] = [
  L("media-video-hero", "Video toàn màn", () =>
    slide(C.darkBg, [
      shape("circle", 576, 264, 128, 128, { fill: "rgba(255,255,255,0.15)" }),
      icon("play", 616, 304, 52, C.white),
      heading(240, 460, 800, 60, "Tiêu đề video", { fontSize: 42, color: C.white, align: "center" }),
      text(340, 536, 600, 32, "Nhấn để phát — thay bằng video của bạn", { fontSize: 18, color: C.darkBody, align: "center" }),
    ]),
  ),
  L("media-video-notes", "Video + ghi chú", () =>
    slide(C.bg, [
      card(80, 150, 640, 400, { fill: C.darkBg, borderRadius: 16 }),
      shape("circle", 352, 302, 96, 96, { fill: "rgba(255,255,255,0.15)" }),
      icon("play", 382, 332, 40, C.white),
      text(770, 160, 430, 36, "Ghi chú", { fontSize: 26, fontWeight: 700, color: C.heading }),
      ...[0, 1, 2].flatMap((j) => [
        card(786, 230 + j * 96 + 8, 12, 12, { fill: C.accent, borderRadius: 6 }),
        text(818, 224 + j * 96, 382, 70, `Điểm chính ${j + 1} rút ra từ video.`, { fontSize: 17, lineHeight: 1.5 }),
      ]),
    ]),
  ),
  L("media-audio", "Audio", () =>
    slide(C.bg, [
      titleBlock("Âm thanh"),
      card(240, 240, 800, 280, { fill: C.white, shadow: true, borderRadius: 24 }),
      shape("circle", 300, 320, 88, 88, { fill: C.accent }),
      icon("play", 328, 348, 34, C.white),
      ...Array.from({ length: 22 }, (_, i) =>
        shape("line", 430 + i * 26, 364 - Math.round(28 * Math.abs(Math.sin(i * 0.9))) / 2 - 8, 8, 16 + Math.round(28 * Math.abs(Math.sin(i * 0.9))), {
          fill: i < 9 ? C.accent : C.border,
        }),
      ),
      text(300, 448, 300, 28, "Tên bản ghi âm", { fontSize: 17, fontWeight: 700, color: C.heading }),
      text(840, 448, 160, 28, "03:24", { fontSize: 15, color: C.muted, align: "right" }),
    ]),
  ),
  L("media-code", "Đoạn mã (code)", () =>
    slide(C.bg, [
      titleBlock("Ví dụ mã nguồn"),
      card(160, 170, 960, 440, { fill: "#1e293b", borderRadius: 14 }),
      ...["#ef4444", "#f59e0b", "#22c55e"].map((fill, i) => shape("circle", 196 + i * 26, 200, 13, 13, { fill })),
      ...[
        { s: "function tinhTong(a, b) {", c: "#93c5fd" },
        { s: "  // trả về tổng hai số", c: "#64748b" },
        { s: "  return a + b;", c: "#e2e8f0" },
        { s: "}", c: "#93c5fd" },
        { s: "console.log(tinhTong(2, 3));", c: "#86efac" },
      ].map(({ s, c }, i) =>
        text(208, 244 + i * 44, 860, 34, s, { fontSize: 19, fontFamily: MONO, color: c }),
      ),
    ]),
  ),
  L("media-website", "Xem trước website", () =>
    slide(C.card, [
      card(160, 110, 960, 500, { fill: C.white, shadow: true, borderRadius: 14 }),
      card(160, 110, 960, 52, { fill: "#e2e8f0", borderRadius: 14 }),
      ...["#ef4444", "#f59e0b", "#22c55e"].map((fill, i) => shape("circle", 192 + i * 24, 128, 14, 14, { fill })),
      ...chip(300, 122, 560, 28, "https://trang-web-cua-ban.com", { fill: C.white, color: C.muted, fontSize: 13, fontWeight: 400 }),
      imagePh(180, 182, 920, 408, { radius: 8 }),
    ]),
  ),
  L("media-device", "Mockup điện thoại", () =>
    slide(C.bg, [
      heading(100, 220, 400, 160, "Ứng dụng của bạn", { fontSize: 44 }),
      text(100, 400, 400, 140, "Giới thiệu giao diện app trong khung điện thoại.", { fontSize: 19, lineHeight: 1.7 }),
      shape("rounded-rect", 560, 90, 260, 540, { fill: "#0f172a", borderRadius: 40 }),
      imagePh(578, 130, 224, 462, { radius: 20 }),
      shape("pill", 630, 102, 120, 18, { fill: "#1e293b" }),
      ...[0, 1, 2].flatMap((j) => [
        icon("circle-check", 900, 220 + j * 90, 30, C.green),
        text(948, 218 + j * 90, 260, 60, `Điểm nổi bật ${j + 1}`, { fontSize: 17, fontWeight: 600, color: C.heading }),
      ]),
    ]),
  ),
];

/* ============================== 16. Modern (11) ============================== */

export const MODERN_LAYOUTS: LayoutDef[] = [
  L("modern-bento", "Bento grid", () =>
    slide(C.card, [
      card(80, 80, 560, 280, { fill: C.accentSoft, borderRadius: 24 }),
      text(116, 116, 480, 40, "Khối chính", { fontSize: 28, fontWeight: 800, color: C.heading }),
      text(116, 168, 480, 120, "Nội dung quan trọng nhất đặt ở ô lớn.", { fontSize: 17, color: C.body }),
      card(660, 80, 540, 130, { fill: C.white, shadow: true, borderRadius: 24 }),
      text(696, 118, 460, 60, "Ô phụ 1", { fontSize: 20, fontWeight: 700, color: C.heading }),
      card(660, 230, 260, 130, { fill: C.amberSoft, borderRadius: 24 }),
      text(692, 268, 200, 60, "Ô phụ 2", { fontSize: 18, fontWeight: 700, color: "#b45309" }),
      card(940, 230, 260, 130, { fill: C.greenSoft, borderRadius: 24 }),
      text(972, 268, 200, 60, "Ô phụ 3", { fontSize: 18, fontWeight: 700, color: "#15803d" }),
      card(80, 380, 346, 260, { fill: C.white, shadow: true, borderRadius: 24 }),
      text(116, 416, 280, 60, "Ô dọc", { fontSize: 20, fontWeight: 700, color: C.heading }),
      card(446, 380, 754, 260, { fill: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 24 }),
      text(490, 430, 660, 44, "Khối gradient nổi bật", { fontSize: 26, fontWeight: 800, color: C.white }),
      text(490, 486, 660, 80, "Điểm nhấn cuối slide theo phong cách bento.", { fontSize: 16, color: "rgba(255,255,255,0.85)" }),
    ]),
  ),
  L("modern-dashboard", "Dashboard", () =>
    slide(C.card, [
      card(0, 0, 220, 720, { fill: C.darkBg, borderRadius: 0 }),
      shape("circle", 36, 40, 36, 36, { fill: C.accent }),
      ...[0, 1, 2, 3].map((i) => shape("pill", 36, 130 + i * 54, 148, 14, { fill: i === 0 ? C.accent : "rgba(255,255,255,0.18)" })),
      text(270, 48, 600, 40, "Bảng điều khiển", { fontSize: 28, fontWeight: 800, color: C.heading }),
      ...[0, 1, 2].flatMap((i) => {
        const x = 270 + i * 330;
        return [
          card(x, 120, 300, 130, { fill: C.white, shadow: true }),
          text(x + 28, 148, 244, 44, ["12.4K", "86%", "+24%"][i]!, { fontSize: 34, fontWeight: 800, color: C.heading }),
          text(x + 28, 200, 244, 26, ["Lượt truy cập", "Giữ chân", "Tăng trưởng"][i]!, { fontSize: 14, color: C.muted }),
        ];
      }),
      card(270, 280, 960, 360, { fill: C.white, shadow: true }),
      ...[150, 220, 110, 280, 190, 320, 240].map((h, i) =>
        shape("rect", 330 + i * 128, 600 - h, 72, h, { fill: i === 5 ? C.accent : C.accentSoft, borderRadius: 8 }),
      ),
    ]),
  ),
  L("modern-magazine", "Tạp chí", () =>
    slide(C.bg, [
      heading(80, 80, 700, 170, "Tiêu đề kiểu tạp chí", { fontSize: 62, fontFamily: SERIF }),
      line(80, 280, 700, 3, C.heading),
      text(80, 306, 340, 300, "Cột văn bản thứ nhất — nội dung dạng bài viết với nhịp đọc chậm rãi, sang trọng.", {
        fontSize: 17,
        lineHeight: 1.8,
      }),
      text(440, 306, 340, 300, "Cột văn bản thứ hai tiếp nối mạch nội dung như một trang tạp chí in.", {
        fontSize: 17,
        lineHeight: 1.8,
      }),
      imagePh(820, 80, 380, 530, { radius: 0 }),
    ]),
  ),
  L("modern-editorial", "Editorial", () =>
    slide(C.bg, [
      heading(80, 110, 1120, 200, "Tiêu đề biên tập rất lớn.", { fontSize: 84, fontFamily: SERIF, lineHeight: 1.15 }),
      text(80, 350, 300, 30, "07 · 2026 — Số 12", { fontSize: 15, color: C.muted }),
      line(80, 400, 40, 4, C.heading),
      text(480, 380, 620, 240, "Phần mở đầu bài viết với một cột hẹp lệch phải — phong cách dàn trang biên tập hiện đại, nhiều khoảng trắng.", {
        fontSize: 20,
        lineHeight: 1.9,
      }),
    ]),
  ),
  L("modern-keynote", "Keynote tối giản", () =>
    slide("#000000", [
      heading(140, 290, 1000, 110, "Một điều tuyệt vời.", { fontSize: 72, color: C.white, align: "center" }),
      text(340, 430, 600, 36, "Nói ít. Đọng lại nhiều.", { fontSize: 24, color: "#9ca3af", align: "center" }),
    ]),
  ),
  L("modern-minimal", "Tối giản", () =>
    slide(C.bg, [
      heading(80, 300, 800, 70, "Tối giản là đủ.", { fontSize: 48, fontWeight: 600 }),
      line(84, 400, 56, 3, C.heading),
      text(84, 640, 400, 28, "01 / 10", { fontSize: 14, color: C.muted }),
    ]),
  ),
  L("modern-material", "Material", () =>
    slide("#f5f5f5", [
      card(0, 0, 1280, 88, { fill: C.accent, borderRadius: 0 }),
      text(80, 26, 600, 40, "Tiêu đề ứng dụng", { fontSize: 24, fontWeight: 600, color: C.white }),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 386;
        return [
          card(x, 150, 346, 380, { fill: C.white, shadow: true, borderRadius: 8 }),
          imagePh(x, 150, 346, 170, { radius: 8 }),
          text(x + 28, 344, 290, 32, `Thẻ Material ${i + 1}`, { fontSize: 19, fontWeight: 700, color: C.heading }),
          text(x + 28, 386, 290, 90, "Nội dung theo chuẩn Material Design.", { fontSize: 14, color: C.body, lineHeight: 1.6 }),
        ];
      }),
      shape("circle", 1140, 590, 72, 72, { fill: C.pink, shadow: true }),
      icon("plus", 1160, 610, 32, C.white),
    ]),
  ),
  L("modern-neumorphism", "Neumorphism", () =>
    slide("#e0e5ec", [
      text(80, 70, 1120, 50, "Giao diện mềm", { fontSize: 34, fontWeight: 800, color: "#334155", align: "center" }),
      ...[0, 1, 2].flatMap((i) => {
        const x = 140 + i * 350;
        return [
          card(x, 200, 300, 320, { fill: "#e0e5ec", shadow: true, borderRadius: 28 }),
          shape("circle", x + 110, 250, 80, 80, { fill: "#d1d9e6" }),
          icon(["zap", "heart", "star"][i]!, x + 132, 272, 36, "#64748b"),
          text(x + 30, 370, 240, 32, `Khối ${i + 1}`, { fontSize: 19, fontWeight: 700, color: "#334155", align: "center" }),
          text(x + 30, 410, 240, 70, "Bề mặt nổi mềm mại.", { fontSize: 14, color: "#64748b", align: "center" }),
        ];
      }),
    ]),
  ),
  L("modern-glassmorphism", "Glassmorphism", () =>
    slide("linear-gradient(120deg, #818cf8, #f472b6)", [
      shape("circle", 940, -80, 360, 360, { fill: "rgba(255,255,255,0.25)" }),
      shape("circle", -60, 480, 300, 300, { fill: "rgba(255,255,255,0.18)" }),
      heading(80, 90, 800, 60, "Hiệu ứng kính mờ", { fontSize: 42, color: C.white }),
      ...[0, 1].flatMap((i) => {
        const x = 80 + i * 580;
        return [
          card(x, 200, 540, 340, { fill: "rgba(255,255,255,0.4)", shadow: true, borderRadius: 28 }),
          text(x + 40, 244, 460, 40, `Tấm kính ${i + 1}`, { fontSize: 26, fontWeight: 800, color: "#1e1b4b" }),
          text(x + 40, 300, 460, 160, "Nội dung trên nền bán trong suốt, nổi trên gradient.", {
            fontSize: 18,
            color: "#312e81",
            lineHeight: 1.7,
          }),
        ];
      }),
    ]),
  ),
  L("modern-dark", "Dark mode", () =>
    slide(C.darkBg, [
      heading(80, 70, 900, 60, "Chủ đề tối", { fontSize: 42, color: C.darkHeading }),
      line(84, 148, 64, 5, C.accent),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 386;
        return [
          card(x, 210, 346, 340, { fill: C.darkCard, borderRadius: 18 }),
          card(x + 32, 246, 60, 60, { fill: "rgba(99,102,241,0.2)", borderRadius: 14 }),
          icon(["rocket", "shield", "sparkles"][i]!, x + 47, 261, 30, C.accent),
          text(x + 32, 336, 282, 34, `Nội dung ${i + 1}`, { fontSize: 21, fontWeight: 700, color: C.darkHeading }),
          text(x + 32, 380, 282, 120, "Mô tả trên nền tối — tương phản tốt, dịu mắt.", {
            fontSize: 15,
            color: C.darkBody,
            lineHeight: 1.7,
          }),
        ];
      }),
    ]),
  ),
  L("modern-gradient-mesh", "Gradient mesh", () =>
    slide("linear-gradient(135deg, #0f172a, #312e81)", [
      shape("ellipse", 700, -140, 640, 480, { fill: "radial-gradient(circle, #6366f1, transparent)" }, { opacity: 0.5 }),
      shape("ellipse", -180, 360, 560, 460, { fill: "radial-gradient(circle, #ec4899, transparent)" }, { opacity: 0.4 }),
      shape("ellipse", 420, 480, 520, 380, { fill: "radial-gradient(circle, #22d3ee, transparent)" }, { opacity: 0.35 }),
      heading(140, 270, 1000, 110, "Nền gradient nhiều lớp", { fontSize: 58, color: C.white, align: "center" }),
      text(290, 410, 700, 40, "Phong cách mesh hiện đại cho slide mở đầu.", { fontSize: 21, color: "rgba(255,255,255,0.75)", align: "center" }),
    ]),
  ),
];
