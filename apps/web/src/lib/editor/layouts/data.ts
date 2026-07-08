import {
  C,
  L,
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

/* ============================== 9. Statistics (9) ==============================
 * LƯU Ý: chart ở đây là PLACEHOLDER dựng từ shape — khi element Chart (Phase 2c)
 * hoàn thành sẽ có layout dùng chart thật; các layout này vẫn giữ làm mockup nhanh. */

const BAR_HEIGHTS = [150, 220, 120, 280, 190, 320];

export const STATISTICS_LAYOUTS: LayoutDef[] = [
  L("stats-kpi-dashboard", "KPI dashboard", () =>
    slide(C.bg, [
      titleBlock("Chỉ số chính"),
      ...["12.4K", "86%", "+24%", "4.8★"].flatMap((v, i) => {
        const x = 80 + i * 290;
        return [
          card(x, 170, 250, 120, { fill: C.card }),
          text(x + 24, 192, 202, 44, v, { fontSize: 32, fontWeight: 800, color: C.heading }),
          text(x + 24, 244, 202, 26, `Chỉ số ${i + 1}`, { fontSize: 13, color: C.muted }),
        ];
      }),
      card(80, 320, 1120, 320, { fill: C.card }),
      ...BAR_HEIGHTS.map((h, i) =>
        shape("rect", 170 + i * 170, 600 - h * 0.75, 90, h * 0.75, { fill: i === 3 ? C.accent : "#c7d2fe", borderRadius: 8 }),
      ),
    ]),
  ),
  L("stats-big-number", "Con số lớn", () =>
    slide(C.bg, [
      text(240, 180, 800, 200, "87%", { fontSize: 170, fontWeight: 800, color: C.accent, align: "center" }),
      text(340, 420, 600, 40, "Khách hàng quay lại sử dụng", { fontSize: 26, fontWeight: 600, color: C.heading, align: "center" }),
      icon("trending-up", 560, 500, 36, C.green),
      text(610, 504, 200, 32, "+12% so với quý trước", { fontSize: 17, color: C.green }),
    ]),
  ),
  L("stats-metrics-grid", "Lưới chỉ số", () =>
    slide(C.bg, [
      titleBlock("Tổng quan số liệu"),
      ...["1.2M", "38K", "97%", "4.9", "12s", "×3"].flatMap((v, i) => {
        const x = 80 + (i % 3) * 386;
        const y = 180 + Math.floor(i / 3) * 220;
        return [
          card(x, y, 346, 196, { fill: C.card }),
          text(x + 32, y + 34, 282, 56, v, { fontSize: 42, fontWeight: 800, color: i === 2 ? C.accent : C.heading }),
          text(x + 32, y + 106, 282, 30, `Mô tả chỉ số ${i + 1}`, { fontSize: 15, color: C.muted }),
        ];
      }),
    ]),
  ),
  L("stats-progress-bars", "Thanh tiến độ", () =>
    slide(C.bg, [
      titleBlock("Tiến độ theo hạng mục"),
      ...[82, 64, 45, 91].flatMap((pct, i) => {
        const y = 210 + i * 100;
        return [
          text(80, y - 10, 230, 32, `Hạng mục ${i + 1}`, { fontSize: 18, fontWeight: 600, color: C.heading }),
          shape("pill", 330, y, 720, 22, { fill: C.border }),
          shape("pill", 330, y, Math.round((720 * pct) / 100), 22, { fill: C.accent }),
          text(1080, y - 6, 120, 32, `${pct}%`, { fontSize: 19, fontWeight: 800, color: C.accent, align: "right" }),
        ];
      }),
    ]),
  ),
  L("stats-pie-summary", "Tóm tắt tỉ lệ (pie)", () =>
    slide(C.bg, [
      titleBlock("Cơ cấu tỉ lệ"),
      shape("circle", 160, 220, 340, 340, { fill: "#c7d2fe" }),
      shape("quarter-circle", 330, 220, 170, 170, { fill: C.accent }),
      ...[
        { c: C.accent, l: "Nhóm A — 25%" },
        { c: "#c7d2fe", l: "Nhóm B — 55%" },
        { c: C.border, l: "Khác — 20%" },
      ].flatMap(({ c, l }, i) => [
        shape("circle", 640, 280 + i * 70, 22, 22, { fill: c }),
        text(684, 276 + i * 70, 420, 34, l, { fontSize: 19, color: C.body }),
      ]),
    ]),
  ),
  L("stats-line-chart", "Biểu đồ đường", () =>
    slide(C.bg, [
      titleBlock("Xu hướng theo thời gian"),
      line(140, 590, 1000, 3, C.border),
      line(140, 210, 3, 383, C.border),
      ...([[140, 520], [370, 430], [600, 470], [830, 330], [1060, 250]] as const).flatMap((p, i, arr) => {
        const next = arr[i + 1];
        return [
          ...(next ? [connector(p[0], p[1], next[0], next[1], C.accent, 5)] : []),
          shape("circle", p[0] - 10, p[1] - 10, 20, 20, { fill: C.accent }),
        ];
      }),
      ...["T1", "T2", "T3", "T4", "T5"].map((l, i) =>
        text(110 + i * 230, 606, 60, 26, l, { fontSize: 14, color: C.muted, align: "center" }),
      ),
    ]),
  ),
  L("stats-bar-chart", "Biểu đồ cột", () =>
    slide(C.bg, [
      titleBlock("So sánh theo nhóm"),
      line(140, 590, 1000, 3, C.border),
      ...BAR_HEIGHTS.flatMap((h, i) => [
        shape("rect", 180 + i * 165, 590 - h, 100, h, { fill: i === 3 ? C.accent : "#c7d2fe", borderRadius: 10 }),
        text(180 + i * 165, 606, 100, 26, `N${i + 1}`, { fontSize: 14, color: C.muted, align: "center" }),
      ]),
    ]),
  ),
  L("stats-area-chart", "Biểu đồ vùng", () =>
    slide(C.bg, [
      titleBlock("Tăng trưởng tích lũy"),
      line(140, 590, 1000, 3, C.border),
      ...[120, 150, 135, 190, 230, 210, 280, 330, 310, 370, 420, 460].flatMap((h, i) => [
        shape("rect", 145 + i * 83, 590 - h, 83, h, { fill: C.accent }, { opacity: 0.35 }),
      ]),
      ...([[145, 470], [394, 440], [643, 330], [892, 270], [1141, 130]] as const).flatMap((p, i, arr) => {
        const next = arr[i + 1];
        return next ? [connector(p[0], p[1], next[0], next[1], C.accent, 5)] : [];
      }),
    ]),
  ),
  L("stats-donut-chart", "Biểu đồ donut", () =>
    slide(C.bg, [
      titleBlock("Tỉ trọng"),
      shape("ring", 170, 210, 340, 340, { fill: C.accent }),
      text(270, 350, 140, 60, "68%", { fontSize: 44, fontWeight: 800, color: C.heading, align: "center" }),
      ...[
        { c: C.accent, l: "Hoàn thành", v: "68%" },
        { c: "#c7d2fe", l: "Đang làm", v: "22%" },
        { c: C.border, l: "Chưa bắt đầu", v: "10%" },
      ].flatMap(({ c, l, v }, i) => [
        shape("circle", 640, 280 + i * 70, 22, 22, { fill: c }),
        text(684, 276 + i * 70, 320, 34, l, { fontSize: 19, color: C.body }),
        text(1020, 276 + i * 70, 120, 34, v, { fontSize: 19, fontWeight: 700, color: C.heading, align: "right" }),
      ]),
    ]),
  ),
];

/* ============================== 11. Table (6) ==============================
 * Bảng dựng từ shape/text — khi element Table (Phase 2c) hoàn thành sẽ thay bằng bảng thật. */

const COLS_4 = [112, 400, 688, 976];

export const TABLE_LAYOUTS: LayoutDef[] = [
  L("table-simple", "Bảng đơn giản", () =>
    slide(C.bg, [
      titleBlock("Bảng dữ liệu"),
      card(80, 176, 1120, 56, { fill: C.accentSoft, borderRadius: 10 }),
      ...COLS_4.map((x, c) => text(x, 190, 256, 30, `Cột ${c + 1}`, { fontSize: 17, fontWeight: 700, color: C.heading })),
      ...[0, 1, 2, 3].flatMap((r) => [
        ...COLS_4.map((x) => text(x, 262 + r * 88, 256, 32, "Dữ liệu", { fontSize: 16, color: C.body })),
        line(80, 316 + r * 88, 1120, 2, C.border),
      ]),
    ]),
  ),
  L("table-zebra", "Bảng kẻ sọc (zebra)", () =>
    slide(C.bg, [
      titleBlock("Bảng dữ liệu"),
      card(80, 176, 1120, 56, { fill: C.accent, borderRadius: 10 }),
      ...COLS_4.map((x, c) => text(x, 190, 256, 30, `Cột ${c + 1}`, { fontSize: 17, fontWeight: 700, color: C.white })),
      ...[0, 1, 2, 3].flatMap((r) => [
        ...(r % 2 === 0 ? [card(80, 248 + r * 84, 1120, 76, { fill: C.card, borderRadius: 8 })] : []),
        ...COLS_4.map((x) => text(x, 270 + r * 84, 256, 32, "Dữ liệu", { fontSize: 16, color: C.body })),
      ]),
    ]),
  ),
  L("table-comparison", "Bảng so sánh", () =>
    slide(C.bg, [
      titleBlock("So sánh chi tiết"),
      card(500, 176, 340, 448, { fill: C.accentSoft, borderRadius: 14 }),
      text(112, 196, 360, 30, "Tiêu chí", { fontSize: 17, fontWeight: 700, color: C.muted }),
      text(500, 196, 340, 30, "Gói Pro", { fontSize: 17, fontWeight: 800, color: C.accent, align: "center" }),
      text(880, 196, 300, 30, "Gói Thường", { fontSize: 17, fontWeight: 700, color: C.muted, align: "center" }),
      ...[0, 1, 2, 3].flatMap((r) => {
        const y = 268 + r * 90;
        return [
          text(112, y, 360, 32, `Tiêu chí ${r + 1}`, { fontSize: 17, fontWeight: 600, color: C.heading }),
          icon("circle-check", 655, y - 4, 30, C.accent),
          icon(r < 2 ? "circle-check" : "circle-x", 1015, y - 4, 30, r < 2 ? C.green : C.muted),
          line(80, y + 52, 1120, 2, C.border),
        ];
      }),
    ]),
  ),
  L("table-pricing", "Bảng giá dạng bảng", () =>
    slide(C.bg, [
      titleBlock("Bảng giá"),
      ...["Miễn phí", "Pro", "Doanh nghiệp"].flatMap((name, c) => {
        const x = 420 + c * 270;
        const hot = c === 1;
        return [
          card(x, 176, 250, 66, { fill: hot ? C.accent : C.card, borderRadius: 12 }),
          text(x, 196, 250, 30, name, { fontSize: 17, fontWeight: 800, color: hot ? C.white : C.heading, align: "center" }),
        ];
      }),
      ...[0, 1, 2].flatMap((r) => {
        const y = 274 + r * 76;
        return [
          text(96, y, 300, 32, `Hạng mục ${r + 1}`, { fontSize: 16, fontWeight: 600, color: C.heading }),
          ...[0, 1, 2].map((c) =>
            icon(c >= r ? "check" : "x", 530 + c * 270, y - 2, 26, c >= r ? C.green : C.muted),
          ),
          line(80, y + 46, 1120, 2, C.border),
        ];
      }),
      ...["0đ", "199K", "Liên hệ"].map((v, c) =>
        text(420 + c * 270, 520, 250, 40, v, { fontSize: 24, fontWeight: 800, color: c === 1 ? C.accent : C.heading, align: "center" }),
      ),
    ]),
  ),
  L("table-schedule", "Lịch trình", () =>
    slide(C.bg, [
      titleBlock("Lịch trình"),
      ...["Thứ 2", "Thứ 3", "Thứ 4"].map((d, c) =>
        text(360 + c * 290, 186, 250, 30, d, { fontSize: 17, fontWeight: 700, color: C.heading, align: "center" }),
      ),
      ...["08:00", "10:00", "14:00", "16:00"].flatMap((t, r) => {
        const y = 246 + r * 96;
        return [text(96, y + 22, 180, 30, t, { fontSize: 16, fontWeight: 600, color: C.muted }), line(80, y, 1120, 2, C.border)];
      }),
      ...chip(360, 262, 250, 60, "Họp nhóm", { fill: C.accentSoft, color: C.accent }),
      ...chip(650, 358, 250, 60, "Review", { fill: C.greenSoft, color: "#15803d" }),
      ...chip(940, 454, 250, 60, "Demo", { fill: C.amberSoft, color: "#b45309" }),
    ]),
  ),
  L("table-calendar", "Lịch tháng", () =>
    slide(C.bg, [
      titleBlock("Tháng 7 · 2026"),
      ...["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, c) =>
        text(80 + c * 160, 168, 156, 26, d, { fontSize: 14, fontWeight: 700, color: C.muted, align: "center" }),
      ),
      ...Array.from({ length: 28 }, (_, i) => {
        const x = 80 + (i % 7) * 160;
        const y = 204 + Math.floor(i / 7) * 106;
        return [
          card(x, y, 152, 98, { fill: i === 9 ? C.accentSoft : C.card, borderRadius: 10 }),
          text(x + 12, y + 8, 60, 24, String(i + 1), { fontSize: 14, fontWeight: 700, color: i === 9 ? C.accent : C.body }),
        ];
      }),
      ...chip(1046, 240, 120, 26, "Sự kiện", { fill: C.accent, color: C.white, fontSize: 11 }),
    ]),
  ),
];
