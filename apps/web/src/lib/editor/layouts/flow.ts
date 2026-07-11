import {
  C,
  L,
  badge,
  card,
  chip,
  connector,
  icon,
  line,
  shape,
  slide,
  text,
  titleBlock,
  type LayoutDef,
} from "./helpers";

/* ============================== 7. Timeline (7) ============================== */

export const TIMELINE_LAYOUTS: LayoutDef[] = [
  L("timeline-horizontal", "Timeline ngang", () =>
    slide(C.bg, [
      titleBlock("Dòng thời gian"),
      line(100, 397, 1080, 6, C.border),
      ...[0, 1, 2, 3].flatMap((i) => {
        const x = 168 + i * 280;
        const up = i % 2 === 0;
        return [
          shape("circle", x, 386, 28, 28, { fill: C.accent }),
          text(x - 86, up ? 300 : 448, 200, 32, ["2023", "2024", "2025", "2026"][i]!, {
            fontSize: 22,
            fontWeight: 800,
            color: C.heading,
            align: "center",
          }),
          text(x - 86, up ? 336 : 484, 200, 56, "Sự kiện chính", { fontSize: 15, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("timeline-vertical", "Timeline dọc", () =>
    slide(C.bg, [
      titleBlock("Các mốc thời gian"),
      line(197, 190, 6, 420, C.border),
      ...[0, 1, 2, 3].flatMap((i) => {
        const y = 200 + i * 106;
        return [
          shape("circle", 186, y, 28, 28, { fill: C.accent }),
          text(250, y - 6, 140, 32, ["01/2026", "03/2026", "06/2026", "09/2026"][i]!, {
            fontSize: 18,
            fontWeight: 800,
            color: C.accent,
          }),
          text(420, y - 6, 740, 40, `Sự kiện ${i + 1} — mô tả ngắn gọn diễn biến.`, { fontSize: 18 }),
        ];
      }),
    ]),
  ),
  L("timeline-milestone", "Cột mốc quan trọng", () =>
    slide(C.bg, [
      titleBlock("Cột mốc"),
      line(100, 460, 1080, 6, C.border),
      ...[0, 1, 2].flatMap((i) => {
        const x = 220 + i * 380;
        return [
          connector(x + 14, 460, x + 14, 340, C.accent, 4),
          icon("flag", x, 296, 40, C.accent),
          shape("circle", x + 2, 450, 26, 26, { fill: C.accent }),
          text(x - 108, 500, 240, 32, `Cột mốc ${i + 1}`, { fontSize: 20, fontWeight: 700, color: C.heading, align: "center" }),
          text(x - 108, 536, 240, 52, "Thành tựu đạt được", { fontSize: 14, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("timeline-roadmap", "Roadmap 3 giai đoạn", () =>
    slide(C.bg, [
      titleBlock("Lộ trình"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 392;
        return [
          shape("chevron", x, 260, 380, 120, { fill: C.accent }, { opacity: 1 - i * 0.28 }),
          text(x + 60, 300, 240, 40, `Giai đoạn ${i + 1}`, { fontSize: 22, fontWeight: 800, color: C.white }),
          text(x + 24, 420, 340, 90, "Mục tiêu và kết quả chính của giai đoạn.", {
            fontSize: 16,
            color: C.body,
            lineHeight: 1.6,
          }),
        ];
      }),
    ]),
  ),
  L("timeline-sprint", "Sprint", () =>
    slide(C.bg, [
      titleBlock("Kế hoạch sprint"),
      ...[0, 1, 2, 3].flatMap((i) => {
        const x = 80 + i * 290;
        return [
          ...chip(x, 184, 130, 38, `Sprint ${i + 1}`, { fill: i === 0 ? C.accent : C.accentSoft, color: i === 0 ? C.white : C.accent }),
          card(x, 240, 250, 320, { fill: C.card }),
          ...[0, 1, 2].flatMap((j) => [
            card(x + 20, 268 + j * 96, 210, 76, { fill: C.white, shadow: true, borderRadius: 10 }),
            text(x + 36, 284 + j * 96, 178, 48, `Công việc ${j + 1}`, { fontSize: 14, color: C.body }),
          ]),
        ];
      }),
    ]),
  ),
  L("timeline-project", "Tiến độ dự án (Gantt)", () =>
    slide(C.bg, [
      titleBlock("Tiến độ dự án"),
      ...[0, 1, 2, 3].map((i) => line(340, 210 + i * 100 + 60, 860, 2, C.border)),
      ...[
        { label: "Khảo sát", x: 340, w: 240 },
        { label: "Thiết kế", x: 480, w: 300 },
        { label: "Phát triển", x: 640, w: 380 },
        { label: "Ra mắt", x: 920, w: 220 },
      ].flatMap(({ label, x, w }, i) => [
        text(80, 224 + i * 100, 230, 34, label, { fontSize: 18, fontWeight: 600, color: C.heading }),
        shape("rounded-rect", x, 210 + i * 100, w, 44, { fill: C.accent, borderRadius: 10 }, { opacity: 1 - i * 0.18 }),
      ]),
    ]),
  ),
  L("timeline-history", "Lịch sử (xen kẽ)", () =>
    slide(C.bg, [
      titleBlock("Lịch sử phát triển"),
      line(637, 180, 6, 440, C.border),
      ...[0, 1, 2, 3].flatMap((i) => {
        const y = 190 + i * 110;
        const left = i % 2 === 0;
        return [
          shape("circle", 626, y + 26, 28, 28, { fill: C.accent }),
          card(left ? 140 : 700, y, 440, 88, { fill: C.card }),
          text(left ? 168 : 728, y + 14, 384, 28, ["1990", "2005", "2015", "2026"][i]!, { fontSize: 17, fontWeight: 800, color: C.accent }),
          text(left ? 168 : 728, y + 46, 384, 32, "Dấu ấn của thời kỳ này.", { fontSize: 14, color: C.body }),
        ];
      }),
    ]),
  ),
];

/* ============================== 8. Process (8) ============================== */

export const PROCESS_LAYOUTS: LayoutDef[] = [
  L("process-3-step", "Quy trình 3 bước", () =>
    slide(C.bg, [
      titleBlock("Quy trình 3 bước"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 172 + i * 392;
        return [
          ...badge(x, 240, 104, String(i + 1), { fontSize: 40 }),
          ...(i < 2 ? [icon("arrow-right", x + 156, 272, 44, C.border)] : []),
          text(x - 78, 384, 260, 34, `Bước ${i + 1}`, { fontSize: 22, fontWeight: 700, color: C.heading, align: "center" }),
          text(x - 78, 424, 260, 90, "Mô tả ngắn gọn cho bước này.", { fontSize: 15, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("process-4-step", "Quy trình 4 bước", () =>
    slide(C.bg, [
      titleBlock("Quy trình 4 bước"),
      ...[0, 1, 2, 3].flatMap((i) => {
        const x = 80 + i * 288;
        return [
          shape("signpost", x, 280, 270, 110, { fill: C.accent }, { opacity: 1 - i * 0.2 }),
          text(x + 30, 306, 190, 60, `Bước ${i + 1}`, { fontSize: 21, fontWeight: 800, color: C.white }),
          text(x + 4, 420, 250, 80, "Mô tả cho bước.", { fontSize: 15, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("process-5-step", "Quy trình 5 bước", () =>
    slide(C.bg, [
      titleBlock("Quy trình 5 bước"),
      ...[0, 1, 2, 3, 4].flatMap((i) => {
        const x = 80 + i * 228;
        return [
          shape("chevron", x, 300, 240, 96, { fill: C.accent }, { opacity: 1 - i * 0.16 }),
          text(x + 56, 330, 120, 40, String(i + 1), { fontSize: 26, fontWeight: 800, color: C.white, align: "center" }),
          text(x + 8, 420, 210, 60, `Giai đoạn ${i + 1}`, { fontSize: 14, color: C.body, align: "center" }),
        ];
      }),
    ]),
  ),
  L("process-circular", "Quy trình vòng tròn", () =>
    slide(C.bg, [
      titleBlock("Chu trình"),
      shape("ring", 470, 210, 340, 340, { fill: C.accentSoft }),
      ...[
        { x: 604, y: 174, n: "1" },
        { x: 774, y: 344, n: "2" },
        { x: 604, y: 514, n: "3" },
        { x: 434, y: 344, n: "4" },
      ].flatMap(({ x, y, n }) => badge(x, y, 72, n, { fontSize: 28 })),
      ...[
        { x: 700, y: 150, l: "Lập kế hoạch" },
        { x: 870, y: 344, l: "Thực hiện" },
        { x: 700, y: 596, l: "Đánh giá" },
        { x: 160, y: 344, l: "Cải tiến" },
      ].map(({ x, y, l }) => text(x, y + 16, 260, 34, l, { fontSize: 18, fontWeight: 600, color: C.heading })),
    ]),
  ),
  L("process-zigzag", "Zigzag", () =>
    slide(C.bg, [
      titleBlock("Tiến trình zigzag"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 400;
        const y = 190 + i * 140;
        return [
          card(x, y, 340, 130, { fill: i === 2 ? C.accentSoft : C.card }),
          ...badge(x + 24, y + 24, 40, String(i + 1), { fontSize: 17 }),
          text(x + 84, y + 26, 240, 32, `Chặng ${i + 1}`, { fontSize: 19, fontWeight: 700, color: C.heading }),
          text(x + 84, y + 62, 240, 50, "Mô tả ngắn.", { fontSize: 14, color: C.muted }),
          ...(i < 2 ? [icon("corner-down-right", x + 360, y + 110, 44, C.border)] : []),
        ];
      }),
    ]),
  ),
  L("process-chevron", "Chuỗi chevron", () =>
    slide(C.bg, [
      titleBlock("Các giai đoạn"),
      ...[0, 1, 2, 3].flatMap((i) => {
        const x = 80 + i * 288;
        return [
          shape("chevron", x, 280, 300, 130, { fill: i % 2 === 0 ? C.accent : C.accentSoft }),
          text(x + 60, 322, 180, 44, `GĐ ${i + 1}`, { fontSize: 24, fontWeight: 800, color: i % 2 === 0 ? C.white : C.accent, align: "center" }),
          text(x + 20, 440, 260, 70, "Kết quả chính của giai đoạn.", { fontSize: 14, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("process-funnel", "Phễu (funnel)", () =>
    slide(C.bg, [
      titleBlock("Phễu chuyển đổi"),
      ...[
        { w: 820, label: "Tiếp cận — 10.000" },
        { w: 620, label: "Quan tâm — 3.200" },
        { w: 420, label: "Cân nhắc — 900" },
        { w: 240, label: "Chuyển đổi — 210" },
      ].flatMap(({ w, label }, i) => [
        shape("trapezoid", 640 - w / 2, 190 + i * 108, w, 92, { fill: C.accent }, { rotation: 180, opacity: 1 - i * 0.2 }),
        text(940, 216 + i * 108, 260, 40, label, { fontSize: 16, fontWeight: 600, color: C.heading }),
      ]),
    ]),
  ),
  L("process-workflow", "Workflow", () =>
    slide(C.bg, [
      titleBlock("Luồng xử lý"),
      shape("pill", 80, 320, 170, 64, { fill: C.green }),
      text(80, 338, 170, 30, "Bắt đầu", { fontSize: 17, fontWeight: 700, color: C.white, align: "center" }),
      icon("arrow-right", 268, 332, 40, C.border),
      card(326, 308, 210, 88, { fill: C.accentSoft, borderRadius: 12 }),
      text(326, 338, 210, 30, "Xử lý", { fontSize: 17, fontWeight: 700, color: C.accent, align: "center" }),
      icon("arrow-right", 554, 332, 40, C.border),
      shape("diamond", 612, 282, 150, 140, { fill: C.amberSoft }),
      text(612, 336, 150, 30, "Kiểm tra?", { fontSize: 15, fontWeight: 700, color: "#b45309", align: "center" }),
      icon("arrow-right", 780, 332, 40, C.border),
      text(782, 296, 60, 26, "Đạt", { fontSize: 13, color: C.green }),
      shape("pill", 838, 320, 190, 64, { fill: C.accent }),
      text(838, 338, 190, 30, "Hoàn thành", { fontSize: 17, fontWeight: 700, color: C.white, align: "center" }),
      connector(687, 422, 687, 500, C.border, 4),
      text(700, 440, 90, 26, "Chưa đạt", { fontSize: 13, color: C.red }),
      card(600, 500, 174, 60, { fill: C.redSoft, borderRadius: 12 }),
      text(600, 517, 174, 28, "Điều chỉnh", { fontSize: 15, fontWeight: 700, color: "#b91c1c", align: "center" }),
    ]),
  ),
];

/* ============================== 10. Diagram (10) ============================== */

/** Ô hộp nhỏ có chữ căn giữa — dùng cho sơ đồ. */
function node(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  fill: string = C.accentSoft,
  color: string = C.accent,
) {
  return [
    card(x, y, w, h, { fill, borderRadius: 10 }),
    text(x + 8, y + (h - 26) / 2, w - 16, 28, label, { fontSize: 15, fontWeight: 700, color, align: "center" }),
  ];
}

export const DIAGRAM_LAYOUTS: LayoutDef[] = [
  L("diagram-org-chart", "Sơ đồ tổ chức", () =>
    slide(C.bg, [
      titleBlock("Sơ đồ tổ chức"),
      connector(640, 260, 640, 310, C.border),
      connector(280, 310, 1000, 310, C.border),
      ...[280, 640, 1000].map((x) => connector(x, 310, x, 360, C.border)),
      ...node(530, 190, 220, 70, "Giám đốc", C.accent, C.white),
      ...[0, 1, 2].flatMap((i) => node(170 + i * 360, 360, 220, 64, `Phòng ban ${i + 1}`)),
      ...[0, 1, 2].flatMap((i) => [
        connector(280 + i * 360, 424, 280 + i * 360, 470, C.border),
        ...node(190 + i * 360, 470, 180, 56, `Nhóm ${i + 1}`, C.card, C.body),
      ]),
    ]),
  ),
  L("diagram-mind-map", "Sơ đồ tư duy", () =>
    slide(C.bg, [
      connector(640, 360, 300, 210, C.border),
      connector(640, 360, 980, 210, C.border),
      connector(640, 360, 300, 520, C.border),
      connector(640, 360, 980, 520, C.border),
      shape("ellipse", 490, 290, 300, 140, { fill: C.accent }),
      text(510, 340, 260, 40, "Chủ đề chính", { fontSize: 24, fontWeight: 800, color: C.white, align: "center" }),
      ...[
        { x: 170, y: 170 },
        { x: 850, y: 170 },
        { x: 170, y: 480 },
        { x: 850, y: 480 },
      ].flatMap(({ x, y }, i) => [
        shape("ellipse", x, y, 260, 90, { fill: C.accentSoft }),
        text(x + 20, y + 30, 220, 32, `Nhánh ${i + 1}`, { fontSize: 17, fontWeight: 700, color: C.accent, align: "center" }),
      ]),
    ]),
  ),
  L("diagram-tree", "Sơ đồ cây", () =>
    slide(C.bg, [
      titleBlock("Cấu trúc phân cấp"),
      connector(640, 250, 640, 300, C.border),
      connector(400, 300, 880, 300, C.border),
      connector(400, 300, 400, 350, C.border),
      connector(880, 300, 880, 350, C.border),
      ...node(540, 184, 200, 66, "Gốc", C.accent, C.white),
      ...node(300, 350, 200, 60, "Nhánh A"),
      ...node(780, 350, 200, 60, "Nhánh B"),
      ...[0, 1].flatMap((i) => [
        connector(340 + i * 120, 410, 340 + i * 120, 460, C.border),
        ...node(280 + i * 120 - 20, 460, 140, 52, `A${i + 1}`, C.card, C.body),
      ]),
      ...[0, 1].flatMap((i) => [
        connector(820 + i * 120, 410, 820 + i * 120, 460, C.border),
        ...node(760 + i * 120 - 20, 460, 140, 52, `B${i + 1}`, C.card, C.body),
      ]),
    ]),
  ),
  L("diagram-flowchart", "Flowchart", () =>
    slide(C.bg, [
      titleBlock("Sơ đồ luồng"),
      shape("pill", 555, 170, 170, 56, { fill: C.green }),
      text(555, 184, 170, 28, "Bắt đầu", { fontSize: 16, fontWeight: 700, color: C.white, align: "center" }),
      connector(640, 226, 640, 268, C.border),
      ...node(530, 268, 220, 64, "Xử lý dữ liệu"),
      connector(640, 332, 640, 374, C.border),
      shape("diamond", 555, 374, 170, 120, { fill: C.amberSoft }),
      text(565, 420, 150, 28, "Hợp lệ?", { fontSize: 15, fontWeight: 700, color: "#b45309", align: "center" }),
      connector(725, 434, 900, 434, C.border),
      text(760, 404, 80, 24, "Có", { fontSize: 13, color: C.green }),
      ...node(900, 402, 190, 64, "Lưu kết quả", C.accentSoft, C.accent),
      connector(555, 434, 380, 434, C.border),
      text(450, 404, 90, 24, "Không", { fontSize: 13, color: C.red }),
      ...node(190, 402, 190, 64, "Báo lỗi", C.redSoft, "#b91c1c"),
    ]),
  ),
  L("diagram-decision-tree", "Cây quyết định", () =>
    slide(C.bg, [
      titleBlock("Cây quyết định"),
      connector(340, 360, 620, 250, C.border),
      connector(340, 360, 620, 470, C.border),
      connector(810, 250, 1000, 200, C.border),
      connector(810, 250, 1000, 300, C.border),
      ...node(160, 326, 180, 68, "Câu hỏi?", C.accent, C.white),
      ...chip(430, 270, 76, 30, "Có", { fill: C.greenSoft, color: "#15803d", fontSize: 13 }),
      ...chip(430, 430, 90, 30, "Không", { fill: C.redSoft, color: "#b91c1c", fontSize: 13 }),
      ...node(620, 218, 190, 64, "Lựa chọn A"),
      ...node(620, 438, 190, 64, "Lựa chọn B"),
      ...node(1000, 170, 170, 56, "Kết quả 1", C.card, C.body),
      ...node(1000, 274, 170, 56, "Kết quả 2", C.card, C.body),
    ]),
  ),
  L("diagram-network", "Sơ đồ mạng lưới", () =>
    slide(C.bg, [
      titleBlock("Mạng lưới"),
      ...[
        [640, 380, 300, 250],
        [640, 380, 980, 250],
        [640, 380, 260, 520],
        [640, 380, 1020, 520],
        [640, 380, 640, 590],
      ].map(([x1, y1, x2, y2]) => connector(x1!, y1!, x2!, y2!, C.border, 3)),
      shape("circle", 585, 325, 110, 110, { fill: C.accent }),
      text(585, 366, 110, 30, "Trung tâm", { fontSize: 15, fontWeight: 700, color: C.white, align: "center" }),
      ...[
        { x: 260, y: 210 },
        { x: 940, y: 210 },
        { x: 220, y: 480 },
        { x: 980, y: 480 },
        { x: 600, y: 550 },
      ].flatMap(({ x, y }, i) => [
        shape("circle", x, y, 80, 80, { fill: C.accentSoft }),
        text(x, y + 28, 80, 26, `N${i + 1}`, { fontSize: 15, fontWeight: 700, color: C.accent, align: "center" }),
      ]),
    ]),
  ),
  L("diagram-pyramid", "Kim tự tháp", () =>
    slide(C.bg, [
      titleBlock("Tháp phân tầng"),
      shape("triangle", 540, 180, 200, 120, { fill: C.accent }),
      shape("trapezoid", 480, 312, 320, 110, { fill: C.accent }, { opacity: 0.75 }),
      shape("trapezoid", 400, 434, 480, 110, { fill: C.accent }, { opacity: 0.5 }),
      ...["Tầm nhìn", "Chiến lược", "Thực thi"].map((l, i) =>
        text(880, 220 + i * 122, 300, 40, l, { fontSize: 20, fontWeight: 700, color: C.heading }),
      ),
      ...[0, 1, 2].map((i) => connector(800, 238 + i * 122, 870, 238 + i * 122, C.border, 3)),
    ]),
  ),
  L("diagram-cycle", "Chu trình khép kín", () =>
    slide(C.bg, [
      titleBlock("Chu trình"),
      icon("arrow-right", 560, 200, 64, C.border),
      icon("arrow-down", 880, 330, 64, C.border),
      icon("arrow-left", 560, 480, 64, C.border),
      icon("arrow-up", 250, 330, 64, C.border),
      ...[
        { x: 360, y: 180, n: "1", l: "Thu thập" },
        { x: 760, y: 180, n: "2", l: "Phân tích" },
        { x: 760, y: 460, n: "3", l: "Hành động" },
        { x: 360, y: 460, n: "4", l: "Đo lường" },
      ].flatMap(({ x, y, n, l }) => [
        ...badge(x, y, 84, n, { fontSize: 30 }),
        text(x - 58, y + 96, 200, 30, l, { fontSize: 17, fontWeight: 600, color: C.heading, align: "center" }),
      ]),
    ]),
  ),
  L("diagram-venn", "Biểu đồ Venn", () =>
    slide(C.bg, [
      titleBlock("Giao thoa"),
      shape("circle", 340, 200, 360, 360, { fill: C.accent }, { opacity: 0.55 }),
      shape("circle", 580, 200, 360, 360, { fill: C.pink }, { opacity: 0.55 }),
      text(380, 360, 200, 34, "Tập A", { fontSize: 21, fontWeight: 800, color: C.white }),
      text(720, 360, 200, 34, "Tập B", { fontSize: 21, fontWeight: 800, color: C.white }),
      text(570, 364, 140, 30, "A ∩ B", { fontSize: 17, fontWeight: 800, color: C.white, align: "center" }),
    ]),
  ),
  L("diagram-fishbone", "Xương cá (Ishikawa)", () =>
    slide(C.bg, [
      titleBlock("Nguyên nhân & kết quả"),
      connector(140, 420, 1020, 420, C.heading, 5),
      shape("triangle", 1020, 380, 90, 80, { fill: C.accent }, { rotation: 90 }),
      text(1010, 480, 200, 30, "Vấn đề", { fontSize: 17, fontWeight: 700, color: C.heading }),
      ...[0, 1].flatMap((i) => [
        connector(330 + i * 300, 420, 430 + i * 300, 250, C.border, 4),
        text(360 + i * 300, 212, 200, 30, `Nhóm nguyên nhân ${i + 1}`, { fontSize: 15, fontWeight: 600, color: C.body }),
      ]),
      ...[0, 1].flatMap((i) => [
        connector(330 + i * 300, 420, 430 + i * 300, 590, C.border, 4),
        text(360 + i * 300, 600, 200, 30, `Nhóm nguyên nhân ${i + 3}`, { fontSize: 15, fontWeight: 600, color: C.body }),
      ]),
    ]),
  ),
];
