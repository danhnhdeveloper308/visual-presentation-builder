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

### I.6 Icon: nền + viền ✅ (2026-07-09)
- [x] IconElement props thêm (đều optional, additive): `backgroundColor` (checkbox "Nền phía sau icon") + `backgroundRadius`, `borderColor` (checkbox "Viền none/màu") + `borderWidth`. Render khung nền/viền ở `element-style.ts` (`iconHasBox`/`iconBoxStyle`) dùng chung editor + preview. Inspector icon có toggle bật/tắt từng phần.

### I.7 Ảnh: upload thật + bo góc từng góc + shadow theo hướng ✅ (2026-07-09)
- [x] **Layout có ảnh giờ là image element THẬT** (url rỗng = placeholder) thay vì icon: trên canvas hiện khung "Nhấn đúp để tải ảnh" → upload R2 thật (hook `useUploadImage` dùng chung toolbar + placeholder + Inspector "Thay ảnh"). Schema `image.url` nhận `""`.
- [x] **Bo góc từng góc** (`cornerRadius: {topLeft,topRight,bottomLeft,bottomRight}`) — Inspector 4 ô; giữ `borderRadius` đồng đều cho content cũ.
- [x] **Shadow chọn nhiều hướng** (`shadow: { directions: (top|bottom|left|right)[], blur }`) — offset suy từ hướng (`imageBoxShadow`), Inspector chọn hướng + chỉnh blur.

### I.8 Nhóm (group) + đa chọn kiểu Canva ✅ (2026-07-09)
- [x] **Ctrl/Cmd+click** chọn nhiều element; ElementBase thêm `groupId?` (additive).
- [x] **Kéo vùng (marquee)** trên nền slide để chọn mọi element GIAO với vùng (bỏ qua element khoá; chạm element có group → chọn cả nhóm). Vẽ overlay `border-primary`, toạ độ logic chia zoom, kéo <4px = click bỏ chọn. Store `setSelection(ids)`.
- [x] **Nhóm/Bỏ nhóm** (nút Inspector khi ≥2 chọn + phím `Ctrl+G` / `Ctrl+Shift+G`). Chọn 1 element trong nhóm → chọn cả nhóm; **kéo di chuyển cả nhóm cùng lúc** (live qua `groupDrag` offset, không đợi thả).
- [x] **Nhấn đúp vào element trong nhóm** → "vào" nhóm (`activeGroupId`) sửa riêng element con (resize/recolor/text) mà không cần bỏ nhóm; click nền thoát.
- [x] Store: `selectedElementIds` (thay `selectedElementId`), `setSelection`, `moveElements`, `duplicateSelected` (giữ liên kết nhóm bằng groupId mới), `removeSelected`; nudge/Delete/Ctrl+D áp cho toàn bộ selection. Handle resize/rotate chỉ hiện khi chọn đúng 1 element.
- [x] **Fix**: selector zustand không được trả object mới mỗi render (gây "getSnapshot should be cached" → lặp vô hạn) — chọn primitive/reference ổn định, tính dẫn xuất ngoài selector.

### I.9 Smart alignment guides (căn chỉnh khi kéo) ✅ (2026-07-09)
- [x] Khi kéo element (1 hoặc nhóm) hiện **đường nét đứt dọc/ngang** khi cạnh/tâm element bám vào cạnh/tâm của element khác hoặc của slide (0 / giữa / hết) và **tự bám (snap)** vào đúng vị trí.
- [x] Logic tách hàm THUẦN `apps/web/src/lib/editor/alignment.ts` (`computeAlignment`) — so 3 mốc mỗi trục (cạnh đầu/tâm/cạnh cuối) với mốc target + slide, chọn lệch nhỏ nhất trong ngưỡng; ngưỡng theo **px màn hình** (chia zoom) để đều ở mọi mức zoom. **Có test độc lập 14/14 pass** (chạy bằng jiti).
- [x] Hình ảnh khi kéo và vị trí lưu KHỚP nhau: cùng dùng `resolveDrag` (offset đã-snap) cho `onDragMove` (vẽ guide) lẫn `onDragEnd` (commit) — không nhảy khi thả. Guide (component `AlignmentGuides`) và element đang kéo subscribe `dragGuides` riêng nên chỉ chúng re-render mỗi frame.

---

## II. Template System ✅ (2026-07-10) — verify runtime đầy đủ bằng curl + DB thật

### II.1 System Templates — đủ 60
- [x] 60 template (15 tay hand-crafted có sẵn + **45 SINH TỰ ĐỘNG** bằng cách ghép 4-6 layout/template từ kho **151 layout** đã có ở mục V — tận dụng lại code layout đã test kỹ thay vì viết tay từng slide). Đủ 14 category: Business (8), Startup (4), Education (5), Portfolio (3), Product (4), Marketing (4), Pitch Deck (4), Medical (3), Timeline (3), Finance (4), Resume (3), Technology (4), Creative (5), Minimal (5).
- [x] Script sinh (chạy 1 lần qua jiti, không phải phần app runtime): định nghĩa "recipe" `{title, category, layoutIds[]}` cho từng template mới → gọi `buildLayoutSlide(id)` từng layout → validate `presentationSchema.parse` → xuất `apps/api/prisma/seed-templates-generated.ts` (file dữ liệu tĩnh, có ghi chú "không hand-edit"). `seed.ts` gộp `[...SEED_TEMPLATES(15), ...SEED_TEMPLATES_GENERATED(45)]`, vẫn idempotent theo title.
- **Bài học vận hành**: lần seed đầu phát hiện 1 title trùng giữa bộ tay và bộ sinh ("Portfolio cá nhân") khiến chỉ ra 59/60 record (2 nguồn cùng title ghi đè lẫn nhau qua idempotent-by-title) — đổi tên bản sinh thành "Portfolio cá nhân đa năng", seed lại tự phục hồi đúng 60, không cần xóa tay. Verify seed 3 lần liên tiếp ổn định ở 60, không trùng title.

### II.2 User Templates (My Templates) — đủ
- [x] **Prisma**: bảng mới `TemplateFavorite(userId, templateId)` (`@@unique`, migration `add_template_favorite`) — favorite là per-user, không đặt cột bool trên `Template`.
- [x] **Permissions**: thêm `TEMPLATE_CREATE/UPDATE/DELETE` cho role `user` (giữ `TEMPLATE_MANAGE` riêng cho quản trị hệ thống, chưa dùng).
- [x] **BE `TemplatesService`/`TemplatesController`** (`ProjectsModule` export `ProjectsService` để tái dùng ownership-check có sẵn): `GET /templates` (system + của user, gộp danh sách, kèm `isFavorite`), `GET /templates/:id` (thấy được: public hoặc của mình), `POST /templates/from-project/:projectId` (**Save as Template** — đọc content qua `ProjectsService.get()`, tự enforce ownership project), `POST /templates/:id/duplicate` (nhân bản BẤT KỲ template thấy được thành bản riêng, sinh lại id slide/element), `PATCH /templates/:id` (rename/đổi category — chỉ chủ sở hữu, KHÔNG sửa được template hệ thống), `DELETE /templates/:id` (chỉ chủ sở hữu), `POST`/`DELETE /templates/:id/favorite` (đánh dấu/bỏ yêu thích — hoạt động trên mọi template thấy được).
- [x] Tạo project từ template: mở rộng `ProjectsService.create()` cho phép `templateId` là template **của chính mình** (trước đây chỉ nhận `isPublic`).
- [x] **FE**: trang `/templates` viết lại — tab "Hệ thống"/"Của tôi" + filter "Yêu thích", search theo tên/category, mỗi card có nút Dùng/Nhân bản/★Yêu thích + (bản riêng thêm Sửa/Xóa); `TemplateRenameDialog` (đổi tên + category); nút **"Lưu làm template"** trong Toolbar editor (`SaveAsTemplateDialog`) mở từ project đang chỉnh sửa. Preview vẫn render THẬT bằng `SlidePreview` slide đầu (không cần pipeline thumbnail riêng — nhất quán với thiết kế cũ).
- **Verify runtime** (curl + DB Postgres thật, dọn sạch dữ liệu test sau cùng): Save as Template từ project thật → xuất hiện đúng ở tab "Của tôi"; validate category sai enum → 400; rename + đổi category OK; favorite/unfavorite hoạt động cả trên template CỦA MÌNH lẫn template HỆ THỐNG; duplicate từ system template sinh lại đúng số slide + id mới; **tạo project từ template riêng của mình** thành công (trước đây chỉ tạo được từ public); **không sửa/xóa được template hệ thống** dù đã login (404); **IDOR đầy đủ**: user B không thấy template riêng của A trong list, không sửa/xóa được (404), không xem chi tiết được (404 qua `GET /:id`), không tạo project từ template private của A được (404).

## III. Theme System ✅ (2026-07-10) — verify runtime đầy đủ bằng curl + DB thật

### III.1 System Themes — đủ 20
- [x] 20 theme: Light, Dark, Corporate, Ocean, Forest, Purple, Orange, Sunset, Pastel, Modern, Material, Minimal, Apple, Google, Gradient, Neon, Elegant, Luxury, Flat, Professional — `apps/api/prisma/seed-themes.ts`. 8 theme gốc **đổi tên tại chỗ, giữ nguyên id** qua cơ chế `legacyNames` trong `seed.ts` (tìm theo tên cũ trước khi tạo mới → update, không tạo record mồ côi) — verify: seed 2 lần liên tiếp vẫn đúng 20 record, không trùng tên, không còn tên cũ.

### III.2 User Themes (My Themes) — đủ
- [x] **Schema** (`themeConfigSchema`, additive optional): `colors.accent2`, `shadow` (boolean), `borderRadius` (number); `colors.background` chấp nhận cả màu đặc lẫn CSS gradient (cùng convention `includes("gradient(")` với `ShapeElement.fill`).
- [x] **`applyTheme` (store) dùng đủ field mới**: `accent2` tô icon (tách sắc độ khỏi shape dùng `accent`), `shadow` bật đổ bóng cho shape + hướng "bottom" cho ảnh, `borderRadius` áp cho shape rect/rounded-rect và `image.cornerRadius`, background gradient nhận diện tự động.
- [x] **BE CRUD** (`themes.controller.ts`/`.service.ts`, permission mới `THEME_CREATE/UPDATE/DELETE` cho role `user`, `THEME_MANAGE` giữ riêng cho quản trị hệ thống — chưa dùng): `GET /themes` (system + theme riêng của user, gộp 1 danh sách), `POST /themes` (tạo), `PATCH /themes/:id` (sửa — chỉ chủ sở hữu, KHÔNG sửa được theme hệ thống), `DELETE /themes/:id` (chỉ chủ sở hữu), `POST /themes/:id/clone` (nhân bản BẤT KỲ theme thấy được — hệ thống hoặc của mình — thành theme riêng mới).
- [x] **FE**: trang `/themes` (tab "Theme hệ thống" / "Theme của tôi", card swatch, nút Nhân bản/Sửa/Xóa/Xuất JSON, nút "Nhập JSON" + "Tạo theme"); `ThemeEditorDialog` (form đủ field: font pair, màu nền màu-hoặc-gradient + preset, heading/body/accent/accent2, shadow, borderRadius, preview trực tiếp); `ThemePicker` trong Inspector hiện badge "· của tôi" cho theme riêng + link "Quản lý theme →"; link "Theme" ở dashboard; `proxy.ts` thêm `/themes`.
- **Verify runtime** (curl + DB Postgres thật, dọn sạch dữ liệu test sau cùng): tạo/sửa/xóa theme riêng OK; **clone từ system theme** sao chép đúng toàn bộ config (kể cả gradient/shadow/borderRadius); **không sửa/xóa được theme hệ thống** dù đã đăng nhập (404); **IDOR**: user B không thấy/sửa/xóa được theme riêng của user A (404 + không lọt vào danh sách); validate body thiếu field bắt buộc → 400 đúng message zod.

## IV. Soft Delete — Recycle Bin ✅ (2026-07-10) — verify runtime đầy đủ bằng curl + DB

- [x] **BE endpoints** (`projects.controller.ts`, ownership check đủ cả 3 — IDOR verify bằng 2 user): `GET /projects/trash` (đặt TRƯỚC `:id` để không bị Nest match nhầm), `POST /projects/:id/restore`, `DELETE /projects/:id/permanent`.
- [x] **`ProjectsService`**: `listTrash` (project `deletedAt != null` của owner, mới xóa lên trước), `restore` (set `deletedAt: null`, 404 nếu không ở trong trash), `permanentDelete` (chỉ cho phép nếu ĐÃ ở trong trash — chặn xóa tắt khi chưa qua soft-delete), `purgeProject` dùng chung (xóa thumbnail R2 theo key cố định `{ownerId}/thumbnails/{projectId}.png` nếu có Asset record + xóa Asset + xóa row Project; lỗi R2 chỉ log warn, không chặn xóa DB).
- [x] **Cron 90 ngày**: `@nestjs/schedule` (`ScheduleModule.forRoot()` ở AppModule) + `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) purgeExpiredTrash()` trong `ProjectsService` — quét toàn bộ project `deletedAt < now − LIMITS.TRASH_RETENTION_DAYS ngày` (hằng số mới trong `@repo/shared`, mặc định 90) và purge từng cái.
- [x] **Trang `/trash`**: list dạng card (thumbnail mờ, tiêu đề, thời điểm xóa), badge **"Còn N ngày"** (đỏ khi ≤7 ngày), **search** theo tên, **filter** "Tất cả / Sắp hết hạn ≤7 ngày", nút **Khôi phục** + **Xóa vĩnh viễn** (confirm, cảnh báo không thể hoàn tác), empty state phân biệt "trống" vs "không khớp tìm kiếm". Link "Thùng rác" ở dashboard; `proxy.ts` matcher thêm `/trash`.
- **Verify runtime** (curl + script gọi thẳng `NestFactory.createApplicationContext`, trên DB Postgres local thật): soft-delete → biến mất khỏi list thường + xuất hiện trong trash kèm `deletedAt` đúng ⟶ restore → quay lại list thường, biến mất khỏi trash ⟶ xóa vĩnh viễn khi CHƯA vào trash → 404 ⟶ xóa vĩnh viễn hợp lệ → 200, gọi lần 2 → 404 (idempotent) ⟶ **IDOR**: user B không thấy/restore/xóa được project của user A (404 cả 3 endpoint) ⟶ **cron**: project xóa mềm 91 ngày trước bị purge, project xóa mềm 10 ngày trước KHÔNG bị đụng, project khác trong DB không bị ảnh hưởng ⟶ project có Asset thumbnail đính kèm: xóa vĩnh viễn xóa cả row Project lẫn row Asset, không crash dù object R2 không tồn tại thật.

## V. Layout System — 151 System Layout ✅ (xong 2026-07-09)

Layout = bộ khung element dựng sẵn (placeholder text/image/shape ở toạ độ 1280×720) áp vào **1 slide** hoặc **toàn bộ presentation**; áp xong vẫn chỉnh sửa tự do như element thường.

**Đã triển khai (đủ 151/151 — verify bằng script parse `presentationSchema` cả 151, pass):**
- DSL dựng layout ở `apps/web/src/lib/editor/layouts/helpers.ts` (`slide/text/heading/shape/card/line/connector/icon/imagePh/chip/badge/titleBlock` + bảng màu `C`). Mỗi layout là factory `build(): Slide` sinh id slide + element MỚI mỗi lần gọi (áp nhiều lần không trùng id). Thuần FE, không cần DB.
- 6 file nhóm: `basic.ts` (Title/Quote/List/Column), `cards.ts` (Card/Comparison/Team/Product), `visual.ts` (Image/Media/Modern), `flow.ts` (Timeline/Process/Diagram), `data.ts` (Statistics/Table), `domain.ts` (Business/Education). Registry `index.ts` gộp 18 nhóm + `LAYOUT_MAP` + `buildLayoutSlide(id)` + `LAYOUT_COUNT`.
- **LayoutPanel** (`components/editor/layout-panel.tsx`): drawer trái, bật/tắt bằng nút "Bố cục" ở toolbar (state ở `useEditorUiStore`); search realtime + filter 18 nhóm; mỗi ô là thumbnail render THẬT bằng `SlidePreview`. Mặc định hiện 1 nhóm (không render đồng thời 151 preview — giữ hiệu năng).
- **3 cách áp** (store: `applyLayoutToSlide` / `addSlideFromLayout` / `applyLayoutToAll`, đều undo được, tôn trọng slide `locked`): **click** = áp vào slide hiện tại (thay background + elements, giữ id slide + cờ locked/hidden); **nút +** trên ô = thêm slide mới từ layout; **kéo-thả** ô vào canvas = áp vào slide đang xem (MIME `application/x-layout-id`); **"Áp mọi slide"** (theo nhóm đang chọn, có confirm) = thay mọi slide bằng layout đầu nhóm.
- Áp xong → mọi element là text/shape/icon/image bình thường, chỉnh sửa/di chuyển/resize tự do.

**Ghi chú giới hạn hiện tại (nâng cấp ở Phase 2c):** nhóm Statistics (9) và Table (6) đang dựng chart/bảng bằng PLACEHOLDER shape/text — khi có element Chart/Table thật sẽ thay bằng element động; nhóm Media (6) dùng khung mockup tĩnh (chưa có element video/audio/embed). "Áp toàn presentation theo bộ layout title/content/closing" (chọn layout riêng cho từng loại slide) để đợt 2 — hiện "Áp mọi slide" dùng chung 1 layout.

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

## VI. Animation System ✅ (2026-07-09) — per-element kiểu PowerPoint

- [x] **Schema** (shared, additive optional): `slide.animations?: Animation[]` (thứ tự mảng = thứ tự phát). `Animation = { id, elementId, group, effect, trigger, durationMs, delayMs, repeat?, autoReverse?, easing?, direction? }`.
- [x] **21 hiệu ứng / 4 nhóm**: Entrance (fade-in, appear, fly-in, zoom-in, grow-in, wipe-in, split-in, float-in, bounce-in, spin-in), Emphasis (pulse, spin, flash, shake, grow-shrink), Exit (fade-out, fly-out, zoom-out, shrink-out, wipe-out), Motion (motion-line). Đủ Fade/Appear/Fly/Zoom/Grow/Wipe/Split/Float/Bounce/Spin/Pulse/Fade Out/Fly Out/Motion Path theo yêu cầu.
- [x] **Trigger**: on-click / with-previous / after-previous. **Timing**: duration, delay, repeat, autoReverse (đảo chiều), easing (linear/ease/ease-in=smooth start/ease-out=smooth end/ease-in-out).
- [x] **Render**: Web Animations API (`element.animate`) — `apps/web/src/lib/editor/animations.ts` (`buildAnimation` sinh keyframes+options, giữ rotation; `playSlideAnimations` phát theo bước: with-previous cùng bước, on-click/after-previous đợi bước trước; pre-hide entrance; fill forwards cho entrance/exit; restore sau khi phát). **Có test 129/129** (schema + keyframes mọi hiệu ứng + iterations/direction).
- [x] **Animation Pane** (`animation-panel.tsx`, panel phải bật bằng nút "Hiệu ứng"): list theo thứ tự (badge số + màu theo nhóm, tên element, hiệu ứng), sửa nhanh trigger/duration/delay/direction/repeat/autoReverse/easing, **reorder** (lên/xuống), xoá, **copy/paste hiệu ứng sang element khác** (clipboard ở ui store), **xem thử từng hiệu ứng** + **"Phát thử slide"**. Badge số thứ tự hiện trên element ở canvas khi mở pane.
- [x] **Default animation** khi thêm mới theo loại (text/shape/image/icon) — lưu localStorage, tự thêm animation lúc `addElement`.
- [ ] Phase 3 trình chiếu: runtime phát theo trigger khi trình chiếu fullscreen (chưa có chế độ trình chiếu — làm ở Phase 3). Motion path hiện là đường thẳng theo hướng; curve/custom-draw để mở rộng sau.

---

## Ràng buộc kiến trúc (giữ nguyên, áp cho mọi phần trên)

- Mọi thay đổi JSON content: **additive optional fields**, giữ `schemaVersion: 1`; chỉ tăng version khi buộc phải breaking + viết migrate.
- Zod ở `@repo/shared` là source of truth; BE validate content trước khi lưu; body limit 2MB (theo dõi: 300 slide + animations có thể chạm trần — cân nhắc nâng limit hoặc nén khi tới Phase layout/animation).
- FE: fetch wrapper + React Query; editor state trong Zustand; mọi mutation qua save thủ công + revision 409.
- Hiệu năng 100–300 slide: sidebar đã dùng content-visibility; canvas chỉ render slide active; layout/animation không được phá điều này.
