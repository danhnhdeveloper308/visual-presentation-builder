import {
  C,
  L,
  card,
  chart,
  icon,
  shape,
  slide,
  table,
  text,
  titleBlock,
  type LayoutDef,
} from "./helpers";

/* ============================== 9. Statistics (9) ==============================
 * Phase 2c: dùng element Chart THẬT (bar/line/pie/donut/area) — áp layout xong
 * chỉnh dữ liệu ngay trong Inspector. */

const CHART_SOFT = "#c7d2fe";

export const STATISTICS_LAYOUTS: LayoutDef[] = [
  L("stats-kpi-dashboard", "KPI dashboard", () =>
    slide(C.bg, [
      titleBlock("Chỉ số chính"),
      ...["12.4K", "86%", "+24%", "4.8★"].flatMap((v, i) => {
        const x = 80 + i * 290;
        return [
          card(x, 170, 250, 110, { fill: C.card }),
          text(x + 24, 188, 202, 44, v, { fontSize: 32, fontWeight: 800, color: C.heading }),
          text(x + 24, 238, 202, 26, `Chỉ số ${i + 1}`, { fontSize: 13, color: C.muted }),
        ];
      }),
      chart(80, 306, 1120, 350, {
        chartType: "bar",
        labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
        series: [
          { name: "Doanh thu", color: C.accent, values: [42, 61, 34, 78, 53, 90] },
          { name: "Chi phí", color: CHART_SOFT, values: [28, 35, 26, 44, 38, 52] },
        ],
        showLegend: true,
      }),
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
      chart(120, 190, 440, 440, {
        chartType: "pie",
        slices: [
          { label: "Nhóm A", value: 25, color: C.accent },
          { label: "Nhóm B", value: 55, color: CHART_SOFT },
          { label: "Khác", value: 20, color: C.border },
        ],
        showValues: true,
      }),
      ...[
        { c: C.accent, l: "Nhóm A — 25%" },
        { c: CHART_SOFT, l: "Nhóm B — 55%" },
        { c: C.border, l: "Khác — 20%" },
      ].flatMap(({ c, l }, i) => [
        shape("circle", 660, 290 + i * 70, 22, 22, { fill: c }),
        text(704, 286 + i * 70, 420, 34, l, { fontSize: 19, color: C.body }),
      ]),
    ]),
  ),
  L("stats-line-chart", "Biểu đồ đường", () =>
    slide(C.bg, [
      titleBlock("Xu hướng theo thời gian"),
      chart(100, 190, 1080, 450, {
        chartType: "line",
        labels: ["T1", "T2", "T3", "T4", "T5"],
        series: [{ name: "Xu hướng", color: C.accent, values: [24, 46, 38, 71, 92] }],
        smooth: true,
        showDots: true,
      }),
    ]),
  ),
  L("stats-bar-chart", "Biểu đồ cột", () =>
    slide(C.bg, [
      titleBlock("So sánh theo nhóm"),
      chart(100, 190, 1080, 450, {
        chartType: "bar",
        labels: ["N1", "N2", "N3", "N4", "N5", "N6"],
        series: [{ name: "Giá trị", color: C.accent, values: [50, 73, 40, 93, 63, 107] }],
        showValues: true,
      }),
    ]),
  ),
  L("stats-area-chart", "Biểu đồ vùng", () =>
    slide(C.bg, [
      titleBlock("Tăng trưởng tích lũy"),
      chart(100, 190, 1080, 450, {
        chartType: "area",
        labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
        series: [{ name: "Tăng trưởng", color: C.accent, values: [12, 19, 16, 27, 36, 46] }],
        smooth: true,
      }),
    ]),
  ),
  L("stats-donut-chart", "Biểu đồ donut", () =>
    slide(C.bg, [
      titleBlock("Tỉ trọng"),
      chart(120, 190, 440, 440, {
        chartType: "donut",
        slices: [
          { label: "Hoàn thành", value: 68, color: C.accent },
          { label: "Đang làm", value: 22, color: CHART_SOFT },
          { label: "Chưa bắt đầu", value: 10, color: C.border },
        ],
        showValues: true,
        innerRadiusRatio: 0.62,
      }),
      ...[
        { c: C.accent, l: "Hoàn thành", v: "68%" },
        { c: CHART_SOFT, l: "Đang làm", v: "22%" },
        { c: C.border, l: "Chưa bắt đầu", v: "10%" },
      ].flatMap(({ c, l, v }, i) => [
        shape("circle", 660, 290 + i * 70, 22, 22, { fill: c }),
        text(704, 286 + i * 70, 320, 34, l, { fontSize: 19, color: C.body }),
        text(1040, 286 + i * 70, 120, 34, v, { fontSize: 19, fontWeight: 700, color: C.heading, align: "right" }),
      ]),
    ]),
  ),
];

/* ============================== 11. Table (6) ==============================
 * Phase 2c: dùng element Table THẬT — nhấn đúp vào ô để sửa nội dung. */

export const TABLE_LAYOUTS: LayoutDef[] = [
  L("table-simple", "Bảng đơn giản", () =>
    slide(C.bg, [
      titleBlock("Bảng dữ liệu"),
      table(
        80,
        180,
        1120,
        460,
        [
          ["Cột 1", "Cột 2", "Cột 3", "Cột 4"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
        ],
        { style: { headerBg: C.accentSoft, headerColor: C.heading, fontSize: 17 } },
      ),
    ]),
  ),
  L("table-zebra", "Bảng kẻ sọc (zebra)", () =>
    slide(C.bg, [
      titleBlock("Bảng dữ liệu"),
      table(
        80,
        180,
        1120,
        460,
        [
          ["Cột 1", "Cột 2", "Cột 3", "Cột 4"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
          ["Dữ liệu", "Dữ liệu", "Dữ liệu", "Dữ liệu"],
        ],
        { style: { headerBg: C.accent, headerColor: C.white, zebraBg: C.card, fontSize: 17 } },
      ),
    ]),
  ),
  L("table-comparison", "Bảng so sánh", () =>
    slide(C.bg, [
      titleBlock("So sánh chi tiết"),
      table(
        80,
        180,
        1120,
        440,
        [
          ["Tiêu chí", "Gói Pro", "Gói Thường"],
          ["Tiêu chí 1", "✓", "✓"],
          ["Tiêu chí 2", "✓", "✓"],
          ["Tiêu chí 3", "✓", "—"],
          ["Tiêu chí 4", "✓", "—"],
        ],
        {
          columnWidths: [2, 1, 1],
          style: { headerBg: C.accent, headerColor: C.white, zebraBg: C.card, fontSize: 18 },
        },
      ),
      text(80, 636, 1120, 28, "Gói Pro khuyến nghị cho nhóm từ 5 người", { fontSize: 15, color: C.muted }),
    ]),
  ),
  L("table-pricing", "Bảng giá dạng bảng", () =>
    slide(C.bg, [
      titleBlock("Bảng giá"),
      table(
        80,
        180,
        1120,
        460,
        [
          ["Hạng mục", "Miễn phí", "Pro", "Doanh nghiệp"],
          ["Số project", "3", "Không giới hạn", "Không giới hạn"],
          ["Template premium", "—", "✓", "✓"],
          ["Hỗ trợ ưu tiên", "—", "—", "✓"],
          ["Giá / tháng", "0đ", "199K", "Liên hệ"],
        ],
        {
          columnWidths: [2, 1, 1, 1],
          style: { headerBg: C.accent, headerColor: C.white, zebraBg: C.card, fontSize: 17 },
        },
      ),
    ]),
  ),
  L("table-schedule", "Lịch trình", () =>
    slide(C.bg, [
      titleBlock("Lịch trình"),
      table(
        80,
        180,
        1120,
        460,
        [
          ["Giờ", "Thứ 2", "Thứ 3", "Thứ 4"],
          ["08:00", "Họp nhóm", "", ""],
          ["10:00", "", "Review", ""],
          ["14:00", "", "", "Demo"],
          ["16:00", "Báo cáo", "", ""],
        ],
        {
          columnWidths: [1, 2, 2, 2],
          style: { headerBg: C.accentSoft, headerColor: C.heading, fontSize: 16 },
        },
      ),
    ]),
  ),
  L("table-calendar", "Lịch tháng", () =>
    slide(C.bg, [
      titleBlock("Tháng 7 · 2026"),
      table(
        80,
        170,
        1120,
        480,
        [
          ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
          ...Array.from({ length: 4 }, (_, w) =>
            Array.from({ length: 7 }, (_, d) => String(w * 7 + d + 1)),
          ),
        ],
        { style: { headerBg: C.accentSoft, headerColor: C.heading, zebraBg: C.card, fontSize: 15 } },
      ),
    ]),
  ),
];
