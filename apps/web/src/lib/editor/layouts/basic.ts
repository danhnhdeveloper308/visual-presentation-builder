import {
  C,
  L,
  badge,
  card,
  heading,
  icon,
  imagePh,
  line,
  slide,
  text,
  titleBlock,
  type LayoutDef,
} from "./helpers";

/* ============================== 1. Title (10) ============================== */

export const TITLE_LAYOUTS: LayoutDef[] = [
  L("title-only", "Chỉ tiêu đề", () =>
    slide(C.bg, [heading(140, 300, 1000, 120, "Tiêu đề thuyết trình", { fontSize: 72, align: "center" })]),
  ),
  L("title-subtitle", "Tiêu đề + phụ đề", () =>
    slide(C.bg, [
      heading(140, 250, 1000, 110, "Tiêu đề thuyết trình", { fontSize: 68, align: "center" }),
      text(240, 400, 800, 60, "Tiêu đề phụ — mô tả ngắn gọn nội dung", {
        fontSize: 26,
        color: C.muted,
        align: "center",
      }),
    ]),
  ),
  L("title-center-hero", "Hero căn giữa", () =>
    slide("linear-gradient(135deg, #6366f1, #a855f7)", [
      text(340, 210, 600, 32, "T H U Y Ế T   T R Ì N H", {
        fontSize: 18,
        fontWeight: 600,
        color: "rgba(255,255,255,0.8)",
        align: "center",
      }),
      heading(140, 270, 1000, 120, "Ý tưởng lớn của bạn", { fontSize: 76, color: C.white, align: "center" }),
      text(290, 430, 700, 40, "Phụ đề truyền cảm hứng cho phần mở đầu", {
        fontSize: 24,
        color: "rgba(255,255,255,0.85)",
        align: "center",
      }),
    ]),
  ),
  L("title-full-width", "Tiêu đề băng ngang", () =>
    slide(C.bg, [
      card(0, 250, 1280, 200, { fill: C.accent, borderRadius: 0 }),
      heading(80, 310, 1120, 90, "Tiêu đề nổi bật", { fontSize: 64, color: C.white, align: "center" }),
      text(340, 490, 600, 32, "Mô tả ngắn bên dưới dải màu", { fontSize: 20, color: C.muted, align: "center" }),
    ]),
  ),
  L("title-left", "Tiêu đề căn trái", () =>
    slide(C.bg, [
      card(80, 285, 12, 150, { fill: C.accent, borderRadius: 6 }),
      heading(130, 280, 940, 160, "Tiêu đề trình bày căn trái", { fontSize: 64 }),
      text(130, 460, 800, 40, "Phụ đề bổ sung ngữ cảnh", { fontSize: 24, color: C.muted }),
    ]),
  ),
  L("title-right", "Tiêu đề căn phải", () =>
    slide(C.bg, [
      card(1188, 285, 12, 150, { fill: C.accent, borderRadius: 6 }),
      heading(210, 280, 940, 160, "Tiêu đề trình bày căn phải", { fontSize: 64, align: "right" }),
      text(350, 460, 800, 40, "Phụ đề bổ sung ngữ cảnh", { fontSize: 24, color: C.muted, align: "right" }),
    ]),
  ),
  L("title-caption", "Tiêu đề + chú thích", () =>
    slide(C.bg, [
      heading(140, 290, 1000, 110, "Tiêu đề thuyết trình", { fontSize: 68, align: "center" }),
      text(340, 620, 600, 32, "Người trình bày  •  07/2026", { fontSize: 18, color: C.muted, align: "center" }),
    ]),
  ),
  L("title-section-divider", "Ngắt chương", () =>
    slide(C.bg, [
      text(70, 140, 460, 320, "01", { fontSize: 220, fontWeight: 800, color: C.accent }, { opacity: 0.18 }),
      heading(80, 420, 1000, 90, "Tên chương mới", { fontSize: 60 }),
      line(84, 530, 100, 6, C.accent),
    ]),
  ),
  L("title-chapter-cover", "Bìa chương (tối)", () =>
    slide(C.darkBg, [
      text(80, 236, 400, 30, "CHƯƠNG 1", { fontSize: 18, fontWeight: 700, color: C.accent }),
      heading(80, 280, 1040, 150, "Tiêu đề chương trên nền tối", { fontSize: 66, color: C.darkHeading }),
      line(84, 470, 120, 6, C.accent),
      text(80, 510, 760, 60, "Mô tả ngắn về nội dung sẽ trình bày trong chương này.", {
        fontSize: 22,
        color: C.darkBody,
      }),
    ]),
  ),
  L("title-closing", "Kết thúc / Cảm ơn", () =>
    slide("linear-gradient(135deg, #0f172a, #312e81)", [
      icon("party-popper", 604, 170, 72, C.accent),
      heading(140, 280, 1000, 110, "Cảm ơn đã lắng nghe!", { fontSize: 64, color: C.white, align: "center" }),
      text(290, 430, 700, 36, "email@congty.com  •  +84 000 000 000", {
        fontSize: 22,
        color: C.darkBody,
        align: "center",
      }),
    ]),
  ),
];

/* ============================== 12. Quote (4) ============================== */

export const QUOTE_LAYOUTS: LayoutDef[] = [
  L("quote-large", "Trích dẫn lớn", () =>
    slide(C.bg, [
      text(70, 40, 300, 260, "“", { fontSize: 260, fontWeight: 800, color: C.accent }, { opacity: 0.25 }),
      heading(160, 240, 960, 180, "Câu trích dẫn truyền cảm hứng, ngắn gọn và đáng nhớ.", {
        fontSize: 42,
        fontWeight: 500,
        lineHeight: 1.5,
      }),
      text(160, 480, 600, 32, "— Tên tác giả, chức danh", { fontSize: 20, color: C.muted }),
    ]),
  ),
  L("quote-portrait", "Trích dẫn + chân dung", () =>
    slide(C.bg, [
      imagePh(140, 210, 300, 300, { circle: true }),
      heading(520, 230, 660, 180, "Trích dẫn kèm ảnh chân dung người nói ở bên trái.", {
        fontSize: 34,
        fontWeight: 500,
        lineHeight: 1.5,
      }),
      text(520, 450, 500, 30, "— Tên tác giả", { fontSize: 20, fontWeight: 600, color: C.heading }),
      text(520, 484, 500, 28, "Chức danh, công ty", { fontSize: 16, color: C.muted }),
    ]),
  ),
  L("quote-testimonial", "Cảm nhận khách hàng", () =>
    slide(C.card, [
      card(240, 150, 800, 420, { fill: C.white, shadow: true, borderRadius: 24 }),
      ...[0, 1, 2, 3, 4].map((i) => icon("star", 532 + i * 44, 210, 32, C.amber)),
      text(320, 280, 640, 140, "“Sản phẩm tuyệt vời — đội ngũ hỗ trợ nhanh và chuyên nghiệp. Chúng tôi tiết kiệm hàng giờ mỗi tuần.”", {
        fontSize: 24,
        align: "center",
        lineHeight: 1.6,
      }),
      text(320, 450, 640, 30, "Nguyễn Văn A", { fontSize: 18, fontWeight: 700, color: C.heading, align: "center" }),
      text(320, 482, 640, 26, "Giám đốc vận hành, Công ty B", { fontSize: 15, color: C.muted, align: "center" }),
    ]),
  ),
  L("quote-highlight", "Tuyên bố nổi bật", () =>
    slide(C.darkBg, [
      heading(120, 260, 1040, 160, "Tuyên bố quan trọng nhất của bài thuyết trình.", {
        fontSize: 54,
        color: C.darkHeading,
        align: "center",
        lineHeight: 1.4,
      }),
      line(540, 460, 200, 6, C.accent),
    ]),
  ),
];

/* ============================== 6. List (8) ============================== */

const LIST_ROWS = [200, 292, 384, 476];

export const LIST_LAYOUTS: LayoutDef[] = [
  L("list-bullet", "Gạch đầu dòng", () =>
    slide(C.bg, [
      titleBlock("Nội dung chính"),
      ...LIST_ROWS.flatMap((y, i) => [
        card(96, y + 10, 12, 12, { fill: C.accent, borderRadius: 6 }),
        text(132, y, 1040, 44, `Điểm nội dung thứ ${i + 1} — mô tả ngắn gọn.`, { fontSize: 24 }),
      ]),
    ]),
  ),
  L("list-number", "Danh sách số", () =>
    slide(C.bg, [
      titleBlock("Các bước chính"),
      ...LIST_ROWS.flatMap((y, i) => [
        ...badge(88, y - 6, 44, String(i + 1)),
        text(156, y, 1010, 44, `Nội dung mục số ${i + 1} trong danh sách.`, { fontSize: 24 }),
      ]),
    ]),
  ),
  L("list-checklist", "Checklist", () =>
    slide(C.bg, [
      titleBlock("Danh sách kiểm tra"),
      ...LIST_ROWS.flatMap((y, i) => [
        icon("circle-check", 88, y - 2, 36, C.green),
        text(148, y, 1020, 44, `Hạng mục đã hoàn thành số ${i + 1}.`, { fontSize: 24 }),
      ]),
    ]),
  ),
  L("list-icon", "Danh sách icon", () =>
    slide(C.bg, [
      titleBlock("Điểm nổi bật"),
      ...["zap", "target", "users", "rocket"].flatMap((name, i) => {
        const y = 190 + i * 112;
        return [
          card(80, y - 8, 64, 64, { fill: C.accentSoft, borderRadius: 16 }),
          icon(name, 96, y + 8, 32, C.accent),
          text(172, y - 4, 950, 34, `Tiêu đề mục ${i + 1}`, { fontSize: 24, fontWeight: 700, color: C.heading }),
          text(172, y + 32, 950, 30, "Mô tả ngắn cho mục này.", { fontSize: 17, color: C.muted }),
        ];
      }),
    ]),
  ),
  L("list-step", "Danh sách bước (dọc)", () =>
    slide(C.bg, [
      titleBlock("Các bước thực hiện"),
      line(117, 210, 6, 370, C.border),
      ...[0, 1, 2, 3].flatMap((i) => {
        const y = 196 + i * 122;
        return [
          ...badge(96, y, 48, String(i + 1)),
          text(180, y - 2, 940, 34, `Bước ${i + 1}: tên bước`, { fontSize: 24, fontWeight: 700, color: C.heading }),
          text(180, y + 34, 940, 30, "Mô tả chi tiết cho bước này.", { fontSize: 17, color: C.muted }),
        ];
      }),
    ]),
  ),
  L("list-stepper-horizontal", "Stepper ngang", () =>
    slide(C.bg, [
      titleBlock("Quy trình 4 bước"),
      line(180, 356, 920, 6, C.border),
      ...[0, 1, 2, 3].flatMap((i) => {
        const x = 152 + i * 300;
        return [
          ...badge(x, 328, 62, String(i + 1), { fontSize: 24 }),
          text(x - 69, 420, 200, 34, `Bước ${i + 1}`, { fontSize: 22, fontWeight: 700, color: C.heading, align: "center" }),
          text(x - 69, 458, 200, 56, "Mô tả ngắn", { fontSize: 15, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("list-stepper-vertical", "Stepper dọc", () =>
    slide(C.bg, [
      titleBlock("Lộ trình"),
      line(637, 210, 6, 380, C.border),
      ...[0, 1, 2, 3].flatMap((i) => {
        const y = 200 + i * 108;
        const left = i % 2 === 0;
        return [
          ...badge(610, y, 60, String(i + 1), { fontSize: 24 }),
          text(left ? 120 : 700, y + 12, 460, 36, `Giai đoạn ${i + 1} — nội dung chính`, {
            fontSize: 20,
            fontWeight: 600,
            color: C.heading,
            align: left ? "right" : "left",
          }),
        ];
      }),
    ]),
  ),
  L("list-nested", "Danh sách lồng nhau", () =>
    slide(C.bg, [
      titleBlock("Cấu trúc nội dung"),
      ...[0, 1].flatMap((i) => {
        const y = 196 + i * 220;
        return [
          card(96, y + 10, 14, 14, { fill: C.accent, borderRadius: 7 }),
          text(132, y, 1040, 40, `Mục lớn ${i + 1}`, { fontSize: 26, fontWeight: 700, color: C.heading }),
          ...[0, 1].flatMap((j) => [
            card(172, y + 62 + j * 62, 10, 10, { fill: C.muted, borderRadius: 5 }),
            text(204, y + 50 + j * 62, 960, 36, `Mục con ${i + 1}.${j + 1} — chi tiết bổ sung.`, {
              fontSize: 20,
              color: C.body,
            }),
          ]),
        ];
      }),
    ]),
  ),
];

/* ============================== 3. Column (11) ============================== */

function columnBlock(x: number, w: number, title: string, lines = 3, fontSize = 18) {
  return [
    text(x, 190, w, 36, title, { fontSize: 24, fontWeight: 700, color: C.heading }),
    line(x, 236, 48, 5, C.accent),
    text(x, 264, w, 300, Array.from({ length: lines }, () => "Nội dung mô tả cho cột này.").join(" "), {
      fontSize,
      color: C.body,
      lineHeight: 1.6,
    }),
  ];
}

export const COLUMN_LAYOUTS: LayoutDef[] = [
  L("column-one", "Một cột", () =>
    slide(C.bg, [
      titleBlock(),
      text(80, 200, 1120, 420, "Đoạn văn bản chính. Viết nội dung của bạn ở đây — một cột rộng phù hợp cho phần trình bày chi tiết, định nghĩa, hoặc tóm tắt dài.", {
        fontSize: 26,
        lineHeight: 1.7,
      }),
    ]),
  ),
  L("column-two-equal", "Hai cột bằng nhau", () =>
    slide(C.bg, [titleBlock(), ...columnBlock(80, 540, "Cột thứ nhất"), ...columnBlock(660, 540, "Cột thứ hai")]),
  ),
  L("column-two-30-70", "Hai cột 30/70", () =>
    slide(C.bg, [titleBlock(), ...columnBlock(80, 320, "Tóm tắt", 2), ...columnBlock(440, 760, "Nội dung chính", 5)]),
  ),
  L("column-two-70-30", "Hai cột 70/30", () =>
    slide(C.bg, [titleBlock(), ...columnBlock(80, 760, "Nội dung chính", 5), ...columnBlock(880, 320, "Ghi chú", 2)]),
  ),
  L("column-three-equal", "Ba cột", () =>
    slide(C.bg, [
      titleBlock(),
      ...columnBlock(80, 346, "Cột 1"),
      ...columnBlock(466, 346, "Cột 2"),
      ...columnBlock(852, 346, "Cột 3"),
    ]),
  ),
  L("column-three-feature", "Ba cột tính năng", () =>
    slide(C.bg, [
      titleBlock("Tính năng nổi bật"),
      ...["zap", "shield", "heart"].flatMap((name, i) => {
        const x = 80 + i * 386;
        return [
          card(x, 190, 64, 64, { fill: C.accentSoft, borderRadius: 16 }),
          icon(name, x + 16, 206, 32, C.accent),
          text(x, 278, 346, 34, `Tính năng ${i + 1}`, { fontSize: 22, fontWeight: 700, color: C.heading }),
          text(x, 318, 346, 160, "Mô tả ngắn gọn về tính năng và giá trị mang lại cho người dùng.", {
            fontSize: 16,
            color: C.body,
            lineHeight: 1.6,
          }),
        ];
      }),
    ]),
  ),
  L("column-four", "Bốn cột", () =>
    slide(C.bg, [
      titleBlock(),
      ...[0, 1, 2, 3].flatMap((i) => columnBlock(80 + i * 290, 250, `Cột ${i + 1}`, 2, 15)),
    ]),
  ),
  L("column-five", "Năm cột", () =>
    slide(C.bg, [
      titleBlock(),
      ...[0, 1, 2, 3, 4].flatMap((i) => columnBlock(80 + i * 232, 192, `Cột ${i + 1}`, 2, 13)),
    ]),
  ),
  L("column-sidebar-left", "Sidebar trái", () =>
    slide(C.bg, [
      card(0, 0, 360, 720, { fill: C.accentSoft, borderRadius: 0 }),
      heading(56, 80, 260, 140, "Chủ đề chính", { fontSize: 40 }),
      ...[0, 1, 2].flatMap((i) => [
        line(56, 280 + i * 66, 24, 4, C.accent),
        text(96, 264 + i * 66, 220, 36, `Mục ${i + 1}`, { fontSize: 18, fontWeight: 600, color: C.heading }),
      ]),
      text(420, 80, 780, 40, "Tiêu đề nội dung", { fontSize: 30, fontWeight: 700, color: C.heading }),
      text(420, 150, 780, 460, "Nội dung chính đặt ở khu vực rộng bên phải. Sidebar bên trái giữ mục lục hoặc điểm nhấn.", {
        fontSize: 20,
        lineHeight: 1.7,
      }),
    ]),
  ),
  L("column-sidebar-right", "Sidebar phải", () =>
    slide(C.bg, [
      card(920, 0, 360, 720, { fill: C.accentSoft, borderRadius: 0 }),
      text(80, 80, 780, 40, "Tiêu đề nội dung", { fontSize: 30, fontWeight: 700, color: C.heading }),
      text(80, 150, 780, 460, "Nội dung chính đặt ở khu vực rộng bên trái. Sidebar bên phải dành cho ghi chú, số liệu hoặc hình ảnh phụ.", {
        fontSize: 20,
        lineHeight: 1.7,
      }),
      heading(976, 80, 260, 140, "Ghi chú", { fontSize: 40 }),
      ...[0, 1, 2].flatMap((i) => [
        line(976, 280 + i * 66, 24, 4, C.accent),
        text(1016, 264 + i * 66, 220, 36, `Điểm ${i + 1}`, { fontSize: 18, fontWeight: 600, color: C.heading }),
      ]),
    ]),
  ),
  L("column-sticky-sidebar", "Sidebar cố định + 2 khối", () =>
    slide(C.card, [
      card(60, 60, 300, 600, { fill: C.white, shadow: true }),
      text(96, 100, 228, 70, "Mục lục", { fontSize: 26, fontWeight: 700, color: C.heading }),
      ...[0, 1, 2, 3].flatMap((i) => [
        ...badge(96, 180 + i * 62, 28, String(i + 1), { fontSize: 13 }),
        text(140, 184 + i * 62, 180, 30, `Phần ${i + 1}`, { fontSize: 16, fontWeight: 600, color: C.body }),
      ]),
      ...[0, 1].flatMap((i) => [
        card(420, 60 + i * 312, 780, 288, { fill: C.white, shadow: true }),
        text(460, 96 + i * 312, 700, 36, `Phần nội dung ${i + 1}`, { fontSize: 22, fontWeight: 700, color: C.heading }),
        text(460, 144 + i * 312, 700, 170, "Nội dung chi tiết của phần này — sidebar trái luôn hiển thị mục lục.", {
          fontSize: 17,
          color: C.body,
          lineHeight: 1.6,
        }),
      ]),
    ]),
  ),
];
