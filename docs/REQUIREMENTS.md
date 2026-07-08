# REQUIREMENTS.md — Yêu cầu hệ thống (cập nhật 2026-07-08)

> Bản chốt yêu cầu đầy đủ từ user (2026-07-08). Đây là NGUỒN THAM CHIẾU khi làm các phase tiếp theo — PROGRESS.md ghi tiến độ, file này ghi "phải đạt cái gì". Trạng thái: ✅ đã xong / 🔶 một phần / ⬜ chưa làm.

**Mục tiêu tổng:** đạt mức tương đương PowerPoint / Google Slides / Canva / Pitch / Gamma ở các tính năng cốt lõi: quản lý slide, thư viện layout, template, theme, animation, tùy biến, UX. Kiến trúc module hóa, hiệu năng cao, hỗ trợ presentation lớn (100–300 slide), sẵn sàng cho AI + realtime collaboration về sau.

---

## I. Sửa lỗi & tính năng editor (✅ xong 2026-07-08, còn 2 ý phụ)

### I.1 Sidebar Slide ✅
- [x] Vertical scroll (bug gốc: item flex bị co (`flex-shrink`) thay vì tràn → không có scrollbar; fix `shrink-0`).
- [x] Min-height cho preview (`min-h-16` + `aspect-video`), không co nhỏ quá mức.
- [x] Cuộn mượt (`scroll-smooth`).
- [x] Ảo hóa khi nhiều slide: CSS `content-visibility: auto` + `contain-intrinsic-size` — browser bỏ render item ngoài viewport. Nếu sau này >300 slide vẫn chậm → nâng cấp windowing thật (virtualizer) sau.

### I.2 Slide Preview Actions ✅
- [x] Hover hiện đủ action: Duplicate / Delete / Move Up / Move Down / Lock / Hide — chỉ hiện khi hover, có tooltip (title).
- [x] Lock slide: chặn mọi chỉnh sửa element trên canvas (pointer-events + guard `addElement` trong store) + banner nhắc; badge 🔒 trên preview.
- [x] Hide slide: cờ `hidden` trong schema (dùng khi trình chiếu Phase 3 — slide ẩn bị bỏ qua); preview mờ + badge con mắt.
- [x] Duplicate slide: sinh lại id slide + toàn bộ id element.

### I.3 Shape Library ✅ (63 loại)
- [x] ≥60 shape, nhóm: Cơ bản (19) / Mũi tên (10) / Sao & băng rôn (9) / Hội thoại (2) / Biểu tượng (15) / Flowchart (8). Danh sách trong `shapeKindSchema` (shared) — CHỈ append, không đổi tên/xóa (content cũ tham chiếu).
- [x] Hình học sinh bằng helper (`polygon/arc/star/gear/heart/cloud`) tại `apps/web/src/lib/editor/shapes.ts`; menu chèn nhóm theo category, preview vẽ bằng chính clip-path (`ShapeThumb`).
- [x] Mọi shape: resize/rotate (đã có), recolor, opacity, **gradient** (fill nhận CSS gradient string + 8 preset), **shadow** (prop `shadow`, render drop-shadow ở wrapper ngoài clip-path), corner radius (rect/rounded-rect), border (chỉ shape KHÔNG dùng clip-path — hạn chế kỹ thuật CSS: border không áp được lên clip-path; muốn stroke mọi shape phải chuyển render SVG — để mở khi cần).
- [ ] 🔶 UML/Wireframe shapes chuyên sâu: chưa làm (cần render composite, không phải 1 clip-path) — bổ sung khi có nhu cầu thật.

### I.4 Icon Library ✅ (400 icon lucide)
- [x] 400 icon import tường minh (tree-shake), 12 category, sinh bằng script validate với exports lucide-react. File: `lib/editor/icon-map.ts`. Thêm icon = thêm key mới, KHÔNG xóa key cũ.
- [x] IconPicker (toolbar): search realtime, tab category, **Favorite** (localStorage `vpb:icon-favorites`), **Recently Used** (`vpb:icon-recent`, cap 24), click/double-click chèn, **drag & drop** vào canvas (HTML5 drag, MIME `application/x-lucide-icon`, toạ độ chia zoom).
- [x] Inspector: search + grid chọn lại icon cho element đang chọn.

### I.5 Header / Footer ✅
- [x] Cấu hình giống PowerPoint: Header, Footer, Slide Number, Date & Time (ngày cố định hoặc tự động), lưu ở `presentation.headerFooter` (schema shared, optional — content cũ không vỡ).
- [x] Apply All Slides / Apply Current Slide (slide khác bị ẩn qua cờ `hideHeaderFooter` per-slide) / Hide on Title Slide.
- [x] Render đồng nhất: canvas + sidebar preview + thumbnail (`HeaderFooterLayer`, bố cục PP: ngày trái — footer giữa — số trang phải, header trên giữa).

---

## II. Template System ⬜

### II.1 System Templates (hiện có 15 → cần ≥60)
- ⬜ Bổ sung template seed đến tối thiểu **60**, chia category: Business, Startup, Education, Portfolio, Product, Marketing, Pitch Deck, Medical, Timeline, Finance, Resume, Technology, Creative, Minimal (mở rộng enum category hiện tại).
- Cách làm: viết thêm vào `apps/api/prisma/seed-templates.ts` (idempotent theo title, validate `presentationSchema.parse` lúc seed). Trang `/templates` đã render preview thật theo category — chỉ cần data.

### II.2 User Templates (My Templates) ⬜
- ⬜ **Save as Template** từ editor (copy content hiện tại → bảng `Template` với `createdBy = userId`, `isPublic = false`).
- ⬜ Trang quản lý template của tôi: Duplicate / Rename / Delete / Preview / Favorite; thumbnail (tái dùng pipeline chụp `SlidePreview` + R2 key cố định như project).
- ⬜ Phân tách rõ UI: "System Templates" / "My Templates".
- BE: bảng `Template` đã có `createdBy`, `isPublic` — cần thêm endpoints CRUD (ownership check như projects), field `favorite` nên là bảng nối `TemplateFavorite(userId, templateId)` (không đặt cột bool trên Template vì favorite là per-user).

## III. Theme System 🔶

### III.1 System Themes (hiện có 8 → cần 20)
- ⬜ Seed đủ **20** theme: Light, Dark, Corporate, Ocean, Forest, Purple, Orange, Sunset, Pastel, Modern, Material, Minimal, Apple, Google, Gradient, Neon, Elegant, Luxury, Flat, Professional (map/đổi tên 8 theme hiện có cho khớp bộ này, giữ id cũ nếu project đang tham chiếu).

### III.2 User Themes ⬜
- ⬜ Mở rộng `themeConfigSchema`: thêm `accent2?`, `shadow?`, `borderRadius?`, background gradient — CHỈ thêm optional field.
- ⬜ Tạo/sửa theme riêng (font pair heading/body, palette, accent, background, shadow, border radius); trang quản lý System Themes / My Themes; Clone / Rename / Delete / **Export/Import JSON** (validate `themeConfigSchema` khi import).
- BE: bảng `Theme` đã có `createdBy`, `isSystemTheme` — cần endpoints CRUD + ownership.

## IV. Soft Delete — Recycle Bin ⬜
- Hiện trạng: `Project.deletedAt` đã soft delete, nhưng CHƯA có UI thùng rác.
- ⬜ Trang **Recycle Bin**: list project đã xóa, Restore, Delete Permanently (xóa record + thumbnail/asset R2), hiển thị **số ngày còn lại** (90 − số ngày từ `deletedAt`), search + filter.
- ⬜ **Cron tự xóa sau 90 ngày**: dùng `@nestjs/schedule` (`@Cron` daily) trong module `projects` — xóa vĩnh viễn record có `deletedAt < now − 90d`.
- BE endpoints: `GET /projects/trash`, `POST /projects/:id/restore`, `DELETE /projects/:id/permanent` (ownership check đủ cả 3).

## V. Layout System — 151 System Layout ⬜ (phần quan trọng nhất)

Layout = bộ khung element dựng sẵn (placeholder text/image/shape ở toạ độ 1280×720) áp vào **1 slide** hoặc **toàn bộ presentation**; áp xong vẫn chỉnh sửa tự do như element thường.

**Thiết kế đề xuất (chốt khi implement):**
- Mỗi layout là 1 factory `(theme?) => Slide` đặt ở FE (`lib/editor/layouts/…`, thuần data — không cần DB), có `id`, `label`, `group`, thumbnail render bằng `SlidePreview` (không cần ảnh tĩnh).
- Panel "Layout" trong editor: gallery nhóm theo 18 nhóm, click/drag để áp: **áp cho slide hiện tại** (thay elements bằng placeholder, giữ background nếu layout không định nghĩa) hoặc **thêm slide mới theo layout**; "áp toàn presentation" = chọn bộ layout cho từng loại slide (title/content/closing) — làm đợt 2.
- Layout dùng element hiện có (text/shape/icon/image); các nhóm cần Table/Chart/Media chỉ làm được SAU khi có element tương ứng (đánh dấu ⛔ phụ thuộc bên dưới).

Nhóm (tổng 151):
1. **Title (10):** Title Only, Title + Subtitle, Center Hero Title, Full Width Title, Left Aligned Title, Right Aligned Title, Title + Caption, Section Divider, Chapter Cover, Closing/Thank You
2. **Card (15):** Accent Left/Right/Top/Bottom Card, Border Card, Elevated Card, Glassmorphism Card, Filled Card, Gradient Card, Icon Card, Statistic Card, Pricing Card, Feature Card, Timeline Card, Testimonial Card
3. **Column (11):** One Column, Two Equal, 30/70, 70/30, Three Equal, Three Feature, Four, Five, Sidebar Left, Sidebar Right, Sticky Sidebar
4. **Image (14):** Full Background, Left/Right/Top/Bottom Image, Grid 2/3/4, Masonry, Carousel, Before After, Circle Focus, Collage, Hero Banner
5. **Comparison (8):** Side by Side, Pros & Cons, Before vs After, Feature/Pricing/Product Comparison, SWOT, Matrix
6. **List (8):** Bullet, Number, Checklist, Icon List, Step List, Horizontal/Vertical Stepper, Nested
7. **Timeline (7):** Horizontal, Vertical, Milestone, Roadmap, Sprint, Project, History
8. **Process (8):** 3/4/5 Step, Circular, Zigzag, Chevron, Funnel, Workflow
9. **Statistics (9):** KPI Dashboard, Big Number, Metrics Grid, Progress Bars, Pie Summary, Line/Bar/Area/Donut Chart ⛔ *cần element Chart*
10. **Diagram (10):** Org Chart, Mind Map, Tree, Flowchart, Decision Tree, Network, Pyramid, Cycle, Venn, Fishbone
11. **Table (6):** Simple, Zebra, Comparison, Pricing, Schedule, Calendar ⛔ *cần element Table*
12. **Quote (4):** Large Quote, Quote Portrait, Testimonial, Highlight Statement
13. **Team (4):** Team Members, Speaker, Contact, Leadership
14. **Product (4):** Showcase, Features, Gallery, Roadmap
15. **Media (6):** Video Hero, Video + Notes, Audio, Code Snippet, Website Preview, Device Mockup ⛔ *cần element Video/Audio/Embed*
16. **Modern (11):** Bento, Dashboard, Magazine, Editorial, Apple Keynote, Minimal, Material, Neumorphism, Glassmorphism, Dark, Gradient Mesh
17. **Business (10):** Agenda, Executive Summary, Objectives, Vision & Mission, Business Model Canvas, Market Analysis, Competitor Analysis, Financial Summary, Risks & Mitigation, Next Steps
18. **Education (6):** Lesson Overview, Learning Objectives, Exercise, Quiz, Summary, Key Takeaways

Thứ tự triển khai gợi ý: (đợt 1) Title + Column + List + Quote + Business + Education + Card ≈ 60 layout chỉ cần text/shape/icon → (đợt 2) Image/Team/Product/Modern/Comparison/Process/Timeline/Diagram → (đợt 3 sau khi có Table/Chart/Media) Statistics/Table/Media.

## VI. Animation System ⬜ (tính năng cốt lõi còn thiếu hoàn toàn)

Hệ thống animation per-element tương đương PowerPoint.

**Thiết kế đề xuất (chốt khi implement):**
- Schema (shared, additive): `slide.animations?: Animation[]` — thứ tự mảng = thứ tự phát.
  ```ts
  type Animation = {
    id: string;
    elementId: string;
    effect: "fade" | "appear" | "fly-in" | "zoom" | "grow" | "wipe" | "split" | "float"
          | "bounce" | "spin" | "pulse" | "fade-out" | "fly-out" | "zoom-out" | "motion-path";
    group: "entrance" | "emphasis" | "exit" | "motion";
    trigger: "on-click" | "with-previous" | "after-previous";
    durationMs: number; delayMs: number;
    repeat?: number; autoReverse?: boolean;
    easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"; // smooth start/end
    direction?: "left" | "right" | "top" | "bottom";                     // fly/wipe/split
    path?: { x: number; y: number }[];                                   // motion-path
  };
  ```
- Render: Web Animations API (element.animate) trên DOM element sẵn có — không cần lib ngoài; preview ngay trong editor.
- **Animation Pane** (panel phải, tab riêng): list animation của slide (thứ tự, loại, trigger, duration, delay), reorder (move up/down), sửa nhanh, xóa, copy/paste animation sang element khác; số thứ tự animation hiển thị trên element ở canvas (badge nhỏ như PP).
- Nút "Phát thử" chạy chuỗi animation của slide hiện tại.
- **Default animation**: cấu hình hiệu ứng mặc định khi thêm mới Shape/Text/Image (lưu localStorage hoặc user settings).
- Phase 3 trình chiếu: runtime phát animation theo trigger (click → next step thay vì next slide khi còn animation chưa phát).

---

## Ràng buộc kiến trúc (giữ nguyên, áp cho mọi phần trên)

- Mọi thay đổi JSON content: **additive optional fields**, giữ `schemaVersion: 1`; chỉ tăng version khi buộc phải breaking + viết migrate.
- Zod ở `@repo/shared` là source of truth; BE validate content trước khi lưu; body limit 2MB (theo dõi: 300 slide + animations có thể chạm trần — cân nhắc nâng limit hoặc nén khi tới Phase layout/animation).
- FE: fetch wrapper + React Query; editor state trong Zustand; mọi mutation qua save thủ công + revision 409.
- Hiệu năng 100–300 slide: sidebar đã dùng content-visibility; canvas chỉ render slide active; layout/animation không được phá điều này.
