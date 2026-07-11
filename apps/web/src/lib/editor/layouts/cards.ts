import {
  C,
  L,
  card,
  chip,
  connector,
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

/* ============================== 2. Card (15) ============================== */

/** Card đơn ở giữa slide + tiêu đề/nội dung bên trong. */
function centerCard(extra: Parameters<typeof card>[4] = {}) {
  return {
    box: card(390, 200, 500, 320, { fill: C.white, ...extra }),
    title: (color: string = C.heading) =>
      text(438, 248, 404, 40, "Tiêu đề card", { fontSize: 28, fontWeight: 700, color }),
    body: (color: string = C.body) =>
      text(438, 306, 404, 160, "Nội dung mô tả bên trong card — thay bằng thông tin của bạn.", {
        fontSize: 18,
        color,
        lineHeight: 1.6,
      }),
  };
}

export const CARD_LAYOUTS: LayoutDef[] = [
  L("card-accent-left", "Card viền trái", () => {
    const c = centerCard({ shadow: true });
    return slide(C.card, [c.box, shape("rect", 390, 200, 10, 320, { fill: C.accent }), c.title(), c.body()]);
  }),
  L("card-accent-right", "Card viền phải", () => {
    const c = centerCard({ shadow: true });
    return slide(C.card, [c.box, shape("rect", 880, 200, 10, 320, { fill: C.accent }), c.title(), c.body()]);
  }),
  L("card-accent-top", "Card viền trên", () => {
    const c = centerCard({ shadow: true });
    return slide(C.card, [c.box, shape("rect", 390, 200, 500, 10, { fill: C.accent }), c.title(), c.body()]);
  }),
  L("card-accent-bottom", "Card viền dưới", () => {
    const c = centerCard({ shadow: true });
    return slide(C.card, [c.box, shape("rect", 390, 510, 500, 10, { fill: C.accent }), c.title(), c.body()]);
  }),
  L("card-border", "Card viền khung", () => {
    const c = centerCard({ stroke: C.accent, strokeWidth: 2 });
    return slide(C.bg, [c.box, c.title(), c.body()]);
  }),
  L("card-elevated", "Card nổi (đổ bóng)", () => {
    const c = centerCard({ shadow: true, borderRadius: 20 });
    return slide(C.bg, [c.box, c.title(), c.body()]);
  }),
  L("card-glass", "Card kính (glassmorphism)", () => {
    const c = centerCard({ fill: "rgba(255,255,255,0.55)", shadow: true, borderRadius: 24 });
    return slide("linear-gradient(135deg, #818cf8, #c084fc)", [c.box, c.title(), c.body("#334155")]);
  }),
  L("card-filled", "Card nền màu", () => {
    const c = centerCard({ fill: C.accentSoft });
    return slide(C.bg, [c.box, c.title(C.accent), c.body()]);
  }),
  L("card-gradient", "Card gradient", () => {
    const c = centerCard({ fill: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 24 });
    return slide(C.bg, [c.box, c.title(C.white), c.body("rgba(255,255,255,0.85)")]);
  }),
  L("card-icon", "Card icon", () =>
    slide(C.bg, [
      card(390, 170, 500, 380, { fill: C.white, shadow: true, borderRadius: 20 }),
      shape("circle", 590, 220, 100, 100, { fill: C.accentSoft }),
      icon("zap", 616, 246, 48, C.accent),
      text(438, 356, 404, 38, "Tiêu đề card", { fontSize: 26, fontWeight: 700, color: C.heading, align: "center" }),
      text(454, 408, 372, 110, "Mô tả ngắn cho card có icon nhấn mạnh phía trên.", {
        fontSize: 17,
        color: C.body,
        align: "center",
        lineHeight: 1.6,
      }),
    ]),
  ),
  L("card-statistic", "Card số liệu", () =>
    slide(C.bg, [
      titleBlock("Số liệu nổi bật"),
      ...[
        { v: "1.2K", l: "Khách hàng", n: "trending-up" },
        { v: "98%", l: "Hài lòng", n: "heart" },
        { v: "24/7", l: "Hỗ trợ", n: "clock" },
      ].flatMap(({ v, l, n }, i) => {
        const x = 80 + i * 386;
        return [
          card(x, 220, 346, 260, { fill: C.white, shadow: true }),
          icon(n, x + 36, 258, 32, C.accent),
          text(x + 36, 312, 274, 66, v, { fontSize: 52, fontWeight: 800, color: C.heading }),
          text(x + 36, 392, 274, 32, l, { fontSize: 18, color: C.muted }),
        ];
      }),
    ]),
  ),
  L("card-pricing", "Card bảng giá", () =>
    slide(C.bg, [
      titleBlock("Bảng giá"),
      ...[
        { name: "Cơ bản", price: "0đ", hot: false },
        { name: "Chuyên nghiệp", price: "199K", hot: true },
        { name: "Doanh nghiệp", price: "499K", hot: false },
      ].flatMap(({ name, price, hot }, i) => {
        const x = 80 + i * 386;
        const fg = hot ? C.white : C.heading;
        return [
          card(x, 180, 346, 430, hot ? { fill: C.accent, shadow: true } : { fill: C.white, stroke: C.border, strokeWidth: 1 }),
          ...(hot ? chip(x + 108, 200, 130, 30, "Phổ biến", { fill: "rgba(255,255,255,0.25)", color: C.white, fontSize: 13 }) : []),
          text(x + 36, 248, 274, 32, name, { fontSize: 20, fontWeight: 600, color: fg }),
          text(x + 36, 292, 274, 62, price, { fontSize: 46, fontWeight: 800, color: fg }),
          ...[0, 1, 2].flatMap((j) => [
            icon("check", x + 36, 382 + j * 44, 22, hot ? C.white : C.green),
            text(x + 70, 380 + j * 44, 240, 30, `Quyền lợi ${j + 1}`, { fontSize: 15, color: hot ? "rgba(255,255,255,0.9)" : C.body }),
          ]),
          ...chip(x + 36, 536, 274, 44, "Chọn gói", hot ? { fill: C.white, color: C.accent } : { fill: C.accentSoft, color: C.accent }),
        ];
      }),
    ]),
  ),
  L("card-feature", "Card tính năng 2×2", () =>
    slide(C.bg, [
      titleBlock("Tính năng"),
      ...["zap", "shield", "users", "rocket"].flatMap((n, i) => {
        const x = 80 + (i % 2) * 580;
        const y = 184 + Math.floor(i / 2) * 226;
        return [
          card(x, y, 540, 200, { fill: C.card }),
          card(x + 32, y + 32, 56, 56, { fill: C.accentSoft, borderRadius: 14 }),
          icon(n, x + 46, y + 46, 28, C.accent),
          text(x + 112, y + 32, 400, 32, `Tính năng ${i + 1}`, { fontSize: 21, fontWeight: 700, color: C.heading }),
          text(x + 112, y + 72, 400, 100, "Mô tả ngắn gọn về giá trị của tính năng này.", {
            fontSize: 15,
            color: C.body,
            lineHeight: 1.6,
          }),
        ];
      }),
    ]),
  ),
  L("card-timeline", "Card dòng thời gian", () =>
    slide(C.bg, [
      titleBlock("Cột mốc"),
      line(100, 560, 1080, 6, C.border),
      ...["2024", "2025", "2026"].flatMap((year, i) => {
        const x = 100 + i * 380;
        return [
          card(x, 210, 320, 240, { fill: C.white, shadow: true }),
          text(x + 32, 244, 256, 30, `Cột mốc ${i + 1}`, { fontSize: 20, fontWeight: 700, color: C.heading }),
          text(x + 32, 284, 256, 130, "Sự kiện quan trọng diễn ra trong giai đoạn này.", {
            fontSize: 15,
            color: C.body,
            lineHeight: 1.6,
          }),
          shape("circle", x + 146, 550, 26, 26, { fill: C.accent }),
          text(x + 96, 596, 128, 30, year, { fontSize: 18, fontWeight: 700, color: C.heading, align: "center" }),
        ];
      }),
    ]),
  ),
  L("card-testimonial-duo", "Card cảm nhận (2)", () =>
    slide(C.card, [
      titleBlock("Khách hàng nói gì"),
      ...[0, 1].flatMap((i) => {
        const x = 80 + i * 580;
        return [
          card(x, 190, 540, 340, { fill: C.white, shadow: true, borderRadius: 20 }),
          icon("quote", x + 36, 226, 36, C.accent),
          text(x + 36, 282, 468, 130, "“Cảm nhận thực tế của khách hàng về sản phẩm hoặc dịch vụ.”", {
            fontSize: 18,
            lineHeight: 1.6,
          }),
          imagePh(x + 36, 434, 56, 56, { circle: true }),
          text(x + 108, 438, 300, 28, "Tên khách hàng", { fontSize: 16, fontWeight: 700, color: C.heading }),
          text(x + 108, 466, 300, 24, "Chức danh", { fontSize: 13, color: C.muted }),
        ];
      }),
    ]),
  ),
];

/* ============================== 5. Comparison (8) ============================== */

export const COMPARISON_LAYOUTS: LayoutDef[] = [
  L("compare-side-by-side", "So sánh cạnh nhau", () =>
    slide(C.bg, [
      titleBlock("So sánh"),
      ...[0, 1].flatMap((i) => {
        const x = 80 + i * 580;
        return [
          card(x, 190, 540, 420, { fill: i === 0 ? C.accentSoft : C.card }),
          text(x + 40, 230, 460, 38, `Phương án ${i === 0 ? "A" : "B"}`, { fontSize: 26, fontWeight: 700, color: C.heading }),
          ...[0, 1, 2].map((j) =>
            text(x + 40, 300 + j * 60, 460, 40, `Đặc điểm ${j + 1} của phương án.`, { fontSize: 18 }),
          ),
        ];
      }),
      shape("circle", 600, 360, 80, 80, { fill: C.accent, shadow: true }),
      text(600, 382, 80, 36, "VS", { fontSize: 26, fontWeight: 800, color: C.white, align: "center" }),
    ]),
  ),
  L("compare-pros-cons", "Ưu & nhược điểm", () =>
    slide(C.bg, [
      titleBlock("Ưu & nhược điểm"),
      card(80, 180, 540, 440, { fill: C.greenSoft }),
      text(120, 214, 460, 38, "Ưu điểm", { fontSize: 26, fontWeight: 700, color: "#15803d" }),
      ...[0, 1, 2].flatMap((j) => [
        icon("circle-check", 120, 286 + j * 70, 30, C.green),
        text(168, 286 + j * 70, 420, 44, `Ưu điểm số ${j + 1}.`, { fontSize: 18 }),
      ]),
      card(660, 180, 540, 440, { fill: C.redSoft }),
      text(700, 214, 460, 38, "Nhược điểm", { fontSize: 26, fontWeight: 700, color: "#b91c1c" }),
      ...[0, 1, 2].flatMap((j) => [
        icon("circle-x", 700, 286 + j * 70, 30, C.red),
        text(748, 286 + j * 70, 420, 44, `Nhược điểm số ${j + 1}.`, { fontSize: 18 }),
      ]),
    ]),
  ),
  L("compare-before-after", "Trước vs Sau", () =>
    slide(C.bg, [
      titleBlock("Trước và Sau"),
      card(80, 190, 500, 420, { fill: C.card }),
      ...chip(100, 210, 110, 34, "Trước", { fill: C.border, color: C.body }),
      ...[0, 1, 2].map((j) => text(120, 290 + j * 64, 420, 40, `Hiện trạng ${j + 1}.`, { fontSize: 18, color: C.muted })),
      icon("arrow-right", 604, 368, 72, C.accent),
      card(700, 190, 500, 420, { fill: C.accentSoft }),
      ...chip(720, 210, 110, 34, "Sau", { fill: C.accent, color: C.white }),
      ...[0, 1, 2].map((j) =>
        text(740, 290 + j * 64, 420, 40, `Kết quả cải thiện ${j + 1}.`, { fontSize: 18, fontWeight: 600, color: C.heading }),
      ),
    ]),
  ),
  L("compare-feature-table", "So sánh tính năng", () =>
    slide(C.bg, [
      titleBlock("So sánh tính năng"),
      card(80, 176, 1120, 56, { fill: C.accentSoft, borderRadius: 10 }),
      text(112, 190, 500, 30, "Tính năng", { fontSize: 18, fontWeight: 700, color: C.heading }),
      text(680, 190, 240, 30, "Chúng tôi", { fontSize: 18, fontWeight: 700, color: C.accent, align: "center" }),
      text(940, 190, 240, 30, "Đối thủ", { fontSize: 18, fontWeight: 700, color: C.muted, align: "center" }),
      ...[0, 1, 2, 3].flatMap((j) => {
        const y = 258 + j * 88;
        return [
          text(112, y, 520, 34, `Tính năng ${j + 1}`, { fontSize: 18 }),
          icon("circle-check", 785, y - 4, 30, C.green),
          icon(j < 2 ? "circle-check" : "circle-x", 1045, y - 4, 30, j < 2 ? C.green : C.red),
          line(80, y + 54, 1120, 2, C.border),
        ];
      }),
    ]),
  ),
  L("compare-pricing", "So sánh giá", () =>
    slide(C.bg, [
      titleBlock("So sánh gói dịch vụ"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 386;
        const hot = i === 1;
        return [
          card(x, 180, 346, 420, hot ? { fill: C.accent } : { fill: C.card }),
          text(x + 32, 212, 282, 30, `Gói ${i + 1}`, { fontSize: 19, fontWeight: 600, color: hot ? C.white : C.heading }),
          text(x + 32, 252, 282, 56, ["99K", "199K", "399K"][i]!, { fontSize: 42, fontWeight: 800, color: hot ? C.white : C.heading }),
          ...[0, 1, 2, 3].flatMap((j) => [
            icon(j <= i ? "check" : "x", x + 32, 336 + j * 46, 22, hot ? C.white : j <= i ? C.green : C.muted),
            text(x + 66, 334 + j * 46, 250, 30, `Hạng mục ${j + 1}`, { fontSize: 15, color: hot ? "rgba(255,255,255,0.9)" : C.body }),
          ]),
        ];
      }),
    ]),
  ),
  L("compare-product", "So sánh sản phẩm", () =>
    slide(C.bg, [
      titleBlock("So sánh sản phẩm"),
      ...[0, 1].flatMap((i) => {
        const x = 80 + i * 580;
        return [
          card(x, 180, 540, 440, { fill: C.white, stroke: C.border, strokeWidth: 1 }),
          imagePh(x + 40, 212, 460, 180),
          text(x + 40, 412, 460, 34, `Sản phẩm ${i === 0 ? "A" : "B"}`, { fontSize: 22, fontWeight: 700, color: C.heading }),
          ...[0, 1].map((j) => text(x + 40, 456 + j * 40, 460, 30, `Thông số ${j + 1}: giá trị`, { fontSize: 16, color: C.body })),
          text(x + 40, 548, 460, 40, ["499.000đ", "799.000đ"][i]!, { fontSize: 26, fontWeight: 800, color: C.accent }),
        ];
      }),
    ]),
  ),
  L("compare-swot", "SWOT", () =>
    slide(C.bg, [
      titleBlock("Phân tích SWOT"),
      ...[
        { k: "S", l: "Điểm mạnh", fill: C.greenSoft, fg: "#15803d" },
        { k: "W", l: "Điểm yếu", fill: C.redSoft, fg: "#b91c1c" },
        { k: "O", l: "Cơ hội", fill: C.blueSoft, fg: "#1d4ed8" },
        { k: "T", l: "Thách thức", fill: C.amberSoft, fg: "#b45309" },
      ].flatMap(({ k, l, fill, fg }, i) => {
        const x = 80 + (i % 2) * 580;
        const y = 180 + Math.floor(i / 2) * 226;
        return [
          card(x, y, 540, 206, { fill }),
          text(x + 32, y + 22, 80, 60, k, { fontSize: 44, fontWeight: 800, color: fg }),
          text(x + 120, y + 34, 380, 32, l, { fontSize: 21, fontWeight: 700, color: fg }),
          text(x + 32, y + 96, 476, 90, "Các ý chính cho mục này — liệt kê ngắn gọn.", { fontSize: 15, color: C.body, lineHeight: 1.55 }),
        ];
      }),
    ]),
  ),
  L("compare-matrix", "Ma trận 2×2", () =>
    slide(C.bg, [
      titleBlock("Ma trận đánh giá"),
      line(637, 180, 6, 440, C.border),
      line(160, 397, 960, 6, C.border),
      text(120, 150, 400, 28, "Cao ↑", { fontSize: 15, color: C.muted }),
      text(1130, 410, 120, 28, "→ Cao", { fontSize: 15, color: C.muted }),
      ...["Ưu tiên", "Cân nhắc", "Loại bỏ", "Theo dõi"].map((label, i) =>
        text(240 + (i % 2) * 580, 250 + Math.floor(i / 2) * 230, 300, 34, label, {
          fontSize: 22,
          fontWeight: 700,
          color: C.heading,
        }),
      ),
      shape("circle", 420, 260, 36, 36, { fill: C.accent }),
      shape("circle", 880, 300, 28, 28, { fill: C.pink }),
      shape("circle", 360, 500, 24, 24, { fill: C.amber }),
      shape("circle", 900, 480, 30, 30, { fill: C.green }),
    ]),
  ),
];

/* ============================== 13. Team (4) ============================== */

export const TEAM_LAYOUTS: LayoutDef[] = [
  L("team-members", "Thành viên đội ngũ", () =>
    slide(C.bg, [
      titleBlock("Đội ngũ"),
      ...[0, 1, 2, 3].flatMap((i) => {
        const x = 80 + i * 290;
        return [
          imagePh(x + 45, 200, 160, 160, { circle: true }),
          text(x, 384, 250, 30, `Thành viên ${i + 1}`, { fontSize: 19, fontWeight: 700, color: C.heading, align: "center" }),
          text(x, 418, 250, 26, "Vai trò", { fontSize: 15, color: C.accent, align: "center" }),
          text(x, 452, 250, 70, "Một dòng giới thiệu ngắn.", { fontSize: 13, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("team-speaker", "Diễn giả", () =>
    slide(C.bg, [
      imagePh(120, 180, 360, 360, { circle: true }),
      heading(560, 210, 620, 60, "Tên diễn giả", { fontSize: 44 }),
      text(560, 286, 620, 32, "Chức danh • Công ty", { fontSize: 20, fontWeight: 600, color: C.accent }),
      text(560, 340, 620, 130, "Tiểu sử ngắn: kinh nghiệm, chuyên môn và thành tựu nổi bật của diễn giả.", {
        fontSize: 18,
        lineHeight: 1.7,
      }),
      ...["mail", "globe", "phone"].map((n, i) => icon(n, 560 + i * 56, 490, 30, C.muted)),
    ]),
  ),
  L("team-contact", "Liên hệ", () =>
    slide(C.bg, [
      titleBlock("Liên hệ với chúng tôi"),
      ...[
        { n: "mail", l: "Email", v: "hello@congty.com" },
        { n: "phone", l: "Điện thoại", v: "+84 000 000 000" },
        { n: "map-pin", l: "Địa chỉ", v: "Số 1, Quận 1, TP.HCM" },
      ].flatMap(({ n, l, v }, i) => {
        const x = 80 + i * 386;
        return [
          card(x, 220, 346, 260, { fill: C.card }),
          card(x + 36, 256, 64, 64, { fill: C.accentSoft, borderRadius: 16 }),
          icon(n, x + 52, 272, 32, C.accent),
          text(x + 36, 348, 274, 28, l, { fontSize: 16, color: C.muted }),
          text(x + 36, 382, 274, 60, v, { fontSize: 19, fontWeight: 700, color: C.heading }),
        ];
      }),
    ]),
  ),
  L("team-leadership", "Ban lãnh đạo", () =>
    slide(C.bg, [
      titleBlock("Ban lãnh đạo"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 386;
        return [
          card(x, 180, 346, 430, { fill: C.white, shadow: true }),
          imagePh(x + 103, 216, 140, 140, { circle: true }),
          text(x + 32, 384, 282, 32, `Lãnh đạo ${i + 1}`, { fontSize: 21, fontWeight: 700, color: C.heading, align: "center" }),
          text(x + 32, 420, 282, 26, ["CEO", "CTO", "COO"][i]!, { fontSize: 15, fontWeight: 600, color: C.accent, align: "center" }),
          text(x + 32, 458, 282, 110, "Kinh nghiệm và định hướng lãnh đạo — mô tả ngắn.", {
            fontSize: 14,
            color: C.body,
            align: "center",
            lineHeight: 1.6,
          }),
        ];
      }),
    ]),
  ),
];

/* ============================== 14. Product (4) ============================== */

export const PRODUCT_LAYOUTS: LayoutDef[] = [
  L("product-showcase", "Giới thiệu sản phẩm", () =>
    slide(C.bg, [
      imagePh(390, 120, 500, 360, { radius: 24 }),
      heading(240, 520, 800, 60, "Tên sản phẩm", { fontSize: 44, align: "center" }),
      text(340, 596, 600, 36, "Tagline — giá trị cốt lõi trong một câu", { fontSize: 20, color: C.muted, align: "center" }),
    ]),
  ),
  L("product-features", "Tính năng sản phẩm", () =>
    slide(C.bg, [
      titleBlock("Tính năng sản phẩm"),
      imagePh(80, 190, 520, 420, { radius: 16 }),
      ...[0, 1, 2, 3].flatMap((j) => {
        const y = 200 + j * 106;
        return [
          icon("circle-check", 660, y, 32, C.green),
          text(712, y - 4, 480, 32, `Tính năng ${j + 1}`, { fontSize: 21, fontWeight: 700, color: C.heading }),
          text(712, y + 32, 480, 30, "Lợi ích mang lại cho người dùng.", { fontSize: 15, color: C.muted }),
        ];
      }),
    ]),
  ),
  L("product-gallery", "Bộ sưu tập sản phẩm", () =>
    slide(C.bg, [
      titleBlock("Sản phẩm"),
      ...[0, 1, 2].flatMap((i) => {
        const x = 80 + i * 386;
        return [
          imagePh(x, 190, 346, 300, { radius: 16 }),
          text(x, 508, 346, 30, `Sản phẩm ${i + 1}`, { fontSize: 19, fontWeight: 700, color: C.heading, align: "center" }),
          text(x, 542, 346, 26, "Mô tả một dòng", { fontSize: 14, color: C.muted, align: "center" }),
        ];
      }),
    ]),
  ),
  L("product-roadmap", "Lộ trình sản phẩm", () =>
    slide(C.bg, [
      titleBlock("Lộ trình sản phẩm"),
      connector(120, 240, 1160, 240, C.border, 4),
      ...["Q1", "Q2", "Q3", "Q4"].flatMap((q, i) => {
        const x = 80 + i * 290;
        return [
          ...chip(x + 70, 220, 110, 40, q, { fill: C.accent, color: C.white, fontSize: 17 }),
          card(x, 300, 250, 260, { fill: C.card }),
          ...[0, 1].flatMap((j) => [
            shape("circle", x + 24, 340 + j * 90 + 6, 10, 10, { fill: C.accent }),
            text(x + 48, 330 + j * 90, 180, 70, `Hạng mục ${j + 1} dự kiến`, { fontSize: 14, color: C.body, lineHeight: 1.5 }),
          ]),
        ];
      }),
    ]),
  ),
];
