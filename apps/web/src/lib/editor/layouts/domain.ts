import {
  C,
  L,
  badge,
  card,
  chip,
  heading,
  icon,
  line,
  shape,
  slide,
  text,
  titleBlock,
  type LayoutDef,
} from "./helpers";

/* ============================== 17. Business (10) ============================== */

export const BUSINESS_LAYOUTS: LayoutDef[] = [
  L("business-agenda", "Chương trình (agenda)", () =>
    slide(C.bg, [
      titleBlock("Chương trình"),
      ...[0, 1, 2, 3, 4].flatMap((i) => {
        const y = 194 + i * 82;
        return [
          text(80, y, 90, 44, `0${i + 1}`, { fontSize: 32, fontWeight: 800, color: C.accent }),
          text(190, y + 4, 800, 40, `Nội dung phần ${i + 1}`, { fontSize: 22, fontWeight: 600, color: C.heading }),
          text(1020, y + 8, 180, 32, `${10 + i * 15} phút`, { fontSize: 16, color: C.muted, align: "right" }),
          line(80, y + 66, 1120, 2, C.border),
        ];
      }),
    ]),
  ),
  L("business-executive-summary", "Tóm tắt điều hành", () =>
    slide(C.bg, [
      titleBlock("Tóm tắt điều hành"),
      card(80, 190, 700, 430, { fill: C.card }),
      text(116, 220, 640, 40, "Tổng quan", { fontSize: 22, fontWeight: 700, color: C.heading }),
      text(116, 272, 640, 320, "Đoạn tóm tắt các điểm quan trọng nhất của bài trình bày dành cho lãnh đạo — ngắn gọn, tập trung vào kết quả và đề xuất.", {
        fontSize: 18,
        lineHeight: 1.8,
      }),
      ...["12.4K", "+24%", "86%"].flatMap((v, i) => {
        const y = 190 + i * 146;
        return [
          card(820, y, 380, 130, { fill: C.accentSoft }),
          text(852, y + 24, 316, 50, v, { fontSize: 38, fontWeight: 800, color: C.accent }),
          text(852, y + 82, 316, 28, `Chỉ số quan trọng ${i + 1}`, { fontSize: 14, color: C.body }),
        ];
      }),
    ]),
  ),
  L("business-objectives", "Mục tiêu", () =>
    slide(C.bg, [
      titleBlock("Mục tiêu"),
      ...["target", "trending-up", "users"].flatMap((n, i) => {
        const x = 80 + i * 386;
        return [
          card(x, 200, 346, 320, { fill: C.white, shadow: true }),
          shape("circle", x + 36, 236, 72, 72, { fill: C.accentSoft }),
          icon(n, x + 56, 256, 32, C.accent),
          text(x + 36, 336, 274, 34, `Mục tiêu ${i + 1}`, { fontSize: 21, fontWeight: 700, color: C.heading }),
          text(x + 36, 380, 274, 120, "Mô tả mục tiêu cụ thể, đo lường được và có thời hạn.", {
            fontSize: 15,
            color: C.body,
            lineHeight: 1.6,
          }),
        ];
      }),
    ]),
  ),
  L("business-vision-mission", "Tầm nhìn & sứ mệnh", () =>
    slide(C.bg, [
      card(0, 0, 640, 720, { fill: C.accent, borderRadius: 0 }),
      icon("eye", 80, 150, 48, C.white),
      heading(80, 224, 480, 60, "Tầm nhìn", { fontSize: 40, color: C.white }),
      text(80, 300, 480, 200, "Điều chúng tôi khát vọng đạt được trong dài hạn — bức tranh tương lai mong muốn.", {
        fontSize: 19,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 1.8,
      }),
      icon("rocket", 720, 150, 48, C.accent),
      heading(720, 224, 480, 60, "Sứ mệnh", { fontSize: 40 }),
      text(720, 300, 480, 200, "Lý do chúng tôi tồn tại và giá trị mang lại cho khách hàng mỗi ngày.", {
        fontSize: 19,
        color: C.body,
        lineHeight: 1.8,
      }),
    ]),
  ),
  L("business-model-canvas", "Business Model Canvas", () =>
    slide(C.bg, [
      titleBlock("Business Model Canvas"),
      ...[
        { x: 80, y: 176, w: 210, h: 300, l: "Đối tác chính" },
        { x: 298, y: 176, w: 210, h: 146, l: "Hoạt động chính" },
        { x: 298, y: 330, w: 210, h: 146, l: "Nguồn lực chính" },
        { x: 516, y: 176, w: 248, h: 300, l: "Giá trị đề xuất" },
        { x: 772, y: 176, w: 210, h: 146, l: "Quan hệ KH" },
        { x: 772, y: 330, w: 210, h: 146, l: "Kênh phân phối" },
        { x: 990, y: 176, w: 210, h: 300, l: "Phân khúc KH" },
        { x: 80, y: 484, w: 550, h: 136, l: "Cơ cấu chi phí" },
        { x: 640, y: 484, w: 560, h: 136, l: "Dòng doanh thu" },
      ].flatMap(({ x, y, w, h, l }) => [
        card(x, y, w, h, { fill: C.card, stroke: C.border, strokeWidth: 1 }),
        text(x + 14, y + 12, w - 28, 40, l, { fontSize: 14, fontWeight: 700, color: C.accent }),
      ]),
    ]),
  ),
  L("business-market-analysis", "Phân tích thị trường", () =>
    slide(C.bg, [
      titleBlock("Phân tích thị trường"),
      shape("ring", 120, 220, 300, 300, { fill: C.accent }),
      text(190, 340, 160, 60, "$4.2B", { fontSize: 38, fontWeight: 800, color: C.heading, align: "center" }),
      text(150, 540, 240, 30, "Quy mô thị trường", { fontSize: 15, color: C.muted, align: "center" }),
      ...[
        { l: "TAM — Tổng thị trường", v: "$4.2B" },
        { l: "SAM — Thị trường khả dụng", v: "$1.1B" },
        { l: "SOM — Thị phần mục tiêu", v: "$120M" },
      ].flatMap(({ l, v }, i) => {
        const y = 230 + i * 110;
        return [
          card(560, y, 640, 88, { fill: C.card }),
          text(592, y + 16, 440, 30, l, { fontSize: 18, fontWeight: 600, color: C.heading }),
          text(592, y + 48, 440, 28, "Mô tả ngắn phân khúc", { fontSize: 13, color: C.muted }),
          text(1000, y + 24, 168, 40, v, { fontSize: 26, fontWeight: 800, color: C.accent, align: "right" }),
        ];
      }),
    ]),
  ),
  L("business-competitor-analysis", "Phân tích đối thủ", () =>
    slide(C.bg, [
      titleBlock("Phân tích đối thủ"),
      card(80, 176, 1120, 54, { fill: C.accentSoft, borderRadius: 10 }),
      ...["Đối thủ", "Điểm mạnh", "Điểm yếu", "Thị phần"].map((h, c) =>
        text(112 + c * 285, 190, 260, 30, h, { fontSize: 16, fontWeight: 700, color: C.heading }),
      ),
      ...[0, 1, 2, 3].flatMap((r) => {
        const y = 256 + r * 88;
        return [
          text(112, y, 260, 32, `Công ty ${String.fromCharCode(65 + r)}`, { fontSize: 17, fontWeight: 700, color: C.accent }),
          text(397, y, 260, 32, "Ưu điểm chính", { fontSize: 15, color: C.body }),
          text(682, y, 260, 32, "Hạn chế", { fontSize: 15, color: C.body }),
          text(967, y, 200, 32, `${30 - r * 6}%`, { fontSize: 17, fontWeight: 700, color: C.heading }),
          line(80, y + 54, 1120, 2, C.border),
        ];
      }),
    ]),
  ),
  L("business-financial-summary", "Tóm tắt tài chính", () =>
    slide(C.bg, [
      titleBlock("Tóm tắt tài chính"),
      ...[
        { l: "Doanh thu", v: "$2.4M", n: "trending-up", c: C.green },
        { l: "Chi phí", v: "$1.1M", n: "trending-down", c: C.red },
        { l: "Lợi nhuận", v: "$1.3M", n: "banknote", c: C.accent },
      ].flatMap(({ l, v, n, c }, i) => {
        const x = 80 + i * 386;
        return [
          card(x, 176, 346, 150, { fill: C.card }),
          icon(n, x + 28, 204, 30, c),
          text(x + 28, 250, 290, 48, v, { fontSize: 34, fontWeight: 800, color: C.heading }),
          text(x + 200, 210, 118, 26, l, { fontSize: 14, color: C.muted, align: "right" }),
        ];
      }),
      card(80, 356, 1120, 264, { fill: C.card }),
      ...[180, 240, 300, 260, 360, 420].map((h, i) =>
        shape("rect", 180 + i * 165, 588 - h / 2, 90, h / 2, { fill: i === 5 ? C.accent : "#c7d2fe", borderRadius: 8 }),
      ),
    ]),
  ),
  L("business-risks", "Rủi ro & giảm thiểu", () =>
    slide(C.bg, [
      titleBlock("Rủi ro & giảm thiểu"),
      card(80, 176, 1120, 54, { fill: C.redSoft, borderRadius: 10 }),
      text(112, 190, 400, 30, "Rủi ro", { fontSize: 16, fontWeight: 700, color: "#b91c1c" }),
      text(560, 190, 200, 30, "Mức độ", { fontSize: 16, fontWeight: 700, color: "#b91c1c" }),
      text(780, 190, 400, 30, "Biện pháp giảm thiểu", { fontSize: 16, fontWeight: 700, color: "#b91c1c" }),
      ...[
        { risk: "Rủi ro thị trường", level: "Cao", c: C.red },
        { risk: "Rủi ro vận hành", level: "Trung bình", c: C.amber },
        { risk: "Rủi ro tài chính", level: "Thấp", c: C.green },
      ].flatMap(({ risk, level, c }, r) => {
        const y = 262 + r * 108;
        return [
          text(112, y + 12, 420, 32, risk, { fontSize: 18, fontWeight: 600, color: C.heading }),
          ...chip(560, y + 8, 150, 40, level, { fill: `${c}22`, color: c, fontSize: 14 }),
          text(780, y + 12, 400, 60, "Kế hoạch ứng phó cụ thể.", { fontSize: 15, color: C.body }),
          line(80, y + 88, 1120, 2, C.border),
        ];
      }),
    ]),
  ),
  L("business-next-steps", "Bước tiếp theo", () =>
    slide(C.bg, [
      titleBlock("Bước tiếp theo"),
      ...[0, 1, 2].flatMap((i) => {
        const y = 200 + i * 130;
        return [
          card(80, y, 1120, 108, { fill: i === 0 ? C.accentSoft : C.card }),
          ...badge(112, y + 26, 56, String(i + 1), { fontSize: 24 }),
          text(200, y + 22, 700, 34, `Hành động ${i + 1}`, { fontSize: 21, fontWeight: 700, color: C.heading }),
          text(200, y + 60, 700, 30, "Ai phụ trách và kết quả mong đợi.", { fontSize: 15, color: C.muted }),
          ...chip(1000, y + 34, 170, 40, ["Tuần này", "Tháng này", "Quý sau"][i]!, { fill: C.white, color: C.accent, fontSize: 14 }),
        ];
      }),
    ]),
  ),
];

/* ============================== 18. Education (6) ============================== */

export const EDUCATION_LAYOUTS: LayoutDef[] = [
  L("education-lesson-overview", "Tổng quan bài học", () =>
    slide(C.bg, [
      card(0, 0, 420, 720, { fill: "linear-gradient(160deg, #6366f1, #a855f7)", borderRadius: 0 }),
      icon("book-open", 64, 110, 52, C.white),
      heading(64, 200, 300, 120, "Bài 1: Tên bài học", { fontSize: 36, color: C.white }),
      text(64, 360, 300, 200, "Giới thiệu ngắn gọn về chủ đề và những gì học viên sẽ khám phá.", {
        fontSize: 17,
        color: "rgba(255,255,255,0.9)",
        lineHeight: 1.7,
      }),
      text(480, 90, 720, 40, "Nội dung chính", { fontSize: 24, fontWeight: 700, color: C.heading }),
      ...[0, 1, 2, 3].flatMap((i) => [
        card(480, 160 + i * 118, 720, 96, { fill: C.card }),
        ...badge(508, 184 + i * 118, 48, String(i + 1), { fontSize: 20 }),
        text(580, 182 + i * 118, 580, 34, `Phần ${i + 1}`, { fontSize: 19, fontWeight: 700, color: C.heading }),
        text(580, 216 + i * 118, 580, 28, "Mô tả ngắn nội dung phần này.", { fontSize: 14, color: C.muted }),
      ]),
    ]),
  ),
  L("education-objectives", "Mục tiêu học tập", () =>
    slide(C.bg, [
      titleBlock("Mục tiêu học tập"),
      text(80, 150, 900, 40, "Sau bài học này, học viên có thể:", { fontSize: 20, color: C.muted }),
      ...[0, 1, 2, 3].flatMap((i) => {
        const y = 230 + i * 96;
        return [
          card(80, y, 1120, 80, { fill: C.accentSoft }),
          icon("circle-check", 112, y + 22, 36, C.accent),
          text(172, y + 22, 1000, 36, `Đạt được năng lực số ${i + 1} một cách rõ ràng.`, {
            fontSize: 20,
            fontWeight: 500,
            color: C.heading,
          }),
        ];
      }),
    ]),
  ),
  L("education-exercise", "Bài tập", () =>
    slide(C.bg, [
      ...chip(80, 70, 160, 44, "Bài tập", { fill: C.amber, color: C.white, fontSize: 17 }),
      heading(80, 130, 1120, 60, "Đề bài luyện tập", { fontSize: 40 }),
      card(80, 220, 1120, 200, { fill: C.card }),
      icon("pencil", 116, 252, 34, C.accent),
      text(170, 254, 1000, 150, "Nội dung đề bài: mô tả yêu cầu, dữ kiện và điều kiện cần giải quyết. Học viên vận dụng kiến thức vừa học để hoàn thành.", {
        fontSize: 19,
        lineHeight: 1.7,
      }),
      icon("clock", 80, 456, 28, C.muted),
      text(122, 458, 400, 30, "Thời gian: 15 phút", { fontSize: 16, color: C.muted }),
      icon("users", 500, 456, 28, C.muted),
      text(542, 458, 400, 30, "Hình thức: nhóm 2 người", { fontSize: 16, color: C.muted }),
    ]),
  ),
  L("education-quiz", "Câu hỏi trắc nghiệm", () =>
    slide(C.bg, [
      ...chip(80, 66, 130, 42, "Quiz", { fill: C.accent, color: C.white, fontSize: 16 }),
      heading(80, 122, 1120, 90, "Câu hỏi: Đâu là đáp án đúng?", { fontSize: 38 }),
      ...["A", "B", "C", "D"].flatMap((opt, i) => {
        const x = 80 + (i % 2) * 580;
        const y = 250 + Math.floor(i / 2) * 170;
        const correct = i === 1;
        return [
          card(x, y, 540, 140, correct ? { fill: C.greenSoft, stroke: C.green, strokeWidth: 2 } : { fill: C.card }),
          shape("circle", x + 32, y + 46, 48, 48, { fill: correct ? C.green : C.white, stroke: C.border, strokeWidth: correct ? 0 : 1 }),
          text(x + 32, y + 58, 48, 30, opt, { fontSize: 20, fontWeight: 800, color: correct ? C.white : C.heading, align: "center" }),
          text(x + 100, y + 50, 410, 44, `Phương án ${opt}`, { fontSize: 19, color: C.heading }),
        ];
      }),
    ]),
  ),
  L("education-summary", "Tóm tắt bài học", () =>
    slide(C.bg, [
      titleBlock("Tóm tắt bài học"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 386;
        return [
          card(x, 200, 346, 320, { fill: C.card }),
          text(x + 28, 232, 60, 60, String(i + 1), { fontSize: 48, fontWeight: 800, color: C.accent }),
          line(x + 28, 306, 40, 4, C.accent),
          text(x + 28, 326, 290, 34, `Ý chính ${i + 1}`, { fontSize: 20, fontWeight: 700, color: C.heading }),
          text(x + 28, 368, 290, 130, "Điểm mấu chốt cần ghi nhớ từ phần này của bài học.", {
            fontSize: 15,
            color: C.body,
            lineHeight: 1.6,
          }),
        ];
      }),
    ]),
  ),
  L("education-key-takeaways", "Điều cần ghi nhớ", () =>
    slide("linear-gradient(135deg, #0f172a, #312e81)", [
      icon("lightbulb", 80, 70, 48, C.amber),
      heading(80, 140, 1000, 60, "Điều cần ghi nhớ", { fontSize: 42, color: C.white }),
      ...[0, 1, 2].flatMap((i) => {
        const y = 250 + i * 130;
        return [
          card(80, y, 1120, 108, { fill: "rgba(255,255,255,0.08)", borderRadius: 16 }),
          icon("star", 116, y + 34, 36, C.amber),
          text(180, y + 22, 980, 34, `Điểm ghi nhớ quan trọng số ${i + 1}`, { fontSize: 22, fontWeight: 700, color: C.white }),
          text(180, y + 62, 980, 30, "Giải thích ngắn gọn để củng cố kiến thức.", { fontSize: 15, color: "rgba(255,255,255,0.7)" }),
        ];
      }),
    ]),
  ),
];
