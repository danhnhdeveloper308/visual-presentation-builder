# PROGRESS.md — Tiến độ dự án

> Claude PHẢI đọc file này trước khi làm task, và PHẢI cập nhật lại sau khi hoàn thành task. Không xóa lịch sử cũ — chỉ chuyển mục đã xong xuống "Lịch sử hoàn thành" kèm ngày.

## Trạng thái hiện tại

**Phase đang làm:** Phase 2 mở rộng theo bộ yêu cầu mới 2026-07-08 (xem `docs/REQUIREMENTS.md`). Mục I (fix editor: sidebar, hover actions, 63 shapes, 400 icons, header/footer) ĐÃ XONG — còn II→VI.
**Cập nhật lần cuối:** 2026-07-08

## Roadmap tổng quan (cập nhật 2026-07-08 theo bộ yêu cầu mới — chi tiết từng mục ở `docs/REQUIREMENTS.md`)

- [x] **Phase 0 — Scaffold:** pnpm workspace, apps/web (Next 16) + apps/api (NestJS 11) + packages/shared, Prisma + docker-compose Postgres, script `dev`/`typecheck`/`lint`/`db:*` ở root. _(xong 2026-07-07)_
- [x] **Phase 0.5 — Auth & RBAC:** register/login (argon2), Google OAuth, refresh rotation + reuse detection, Origin-check guard (CSRF), RBAC guards + seed, proxy.ts, trang login/register. _(xong 2026-07-07)_
- [x] **Phase 1 — Core Editor:** Projects CRUD + revision 409, Assets R2, Dashboard, canvas DOM + dnd-kit, 4 element, undo/redo, lưu thủ công. _(xong 2026-07-07)_
- [x] **Phase 2a — Template & Theme nền tảng:** 15 templates, 8 themes, thumbnail pipeline. _(xong 2026-07-08)_
- [x] **Phase 2b — Hoàn thiện editor (REQUIREMENTS mục I):** sidebar scroll + hover actions + lock/hide slide, 63 shapes (gradient/shadow), 400 icons + IconPicker, Header/Footer. _(xong 2026-07-08)_
- [ ] **Phase 2c — Element Table/Chart:** Chart NHIỀU loại (bar/line/pie/donut/area, discriminated union), Table cơ bản.
- [ ] **Phase 2d — Template & Theme mở rộng (REQUIREMENTS II+III):** 60 system templates, My Templates (save-as/rename/favorite...), 20 system themes, My Themes (CRUD + export/import).
- [ ] **Phase 2e — Recycle Bin (REQUIREMENTS IV):** trang thùng rác, restore/xóa vĩnh viễn, cron 90 ngày.
- [ ] **Phase 2f — Layout System (REQUIREMENTS V):** 151 layout theo 18 nhóm — đợt 1 ~60 layout text/shape/icon; nhóm Statistics/Table/Media cần element Phase 2c.
- [ ] **Phase 3 — Trình diễn & Export:** trình chiếu fullscreen (bỏ qua slide `hidden`), transition, export PDF (Playwright) / PPTX (pptxgenjs) / PNG.
- [ ] **Phase 3.5 — Animation System (REQUIREMENTS VI):** schema `slide.animations`, 4 nhóm hiệu ứng, trigger/timing, Animation Pane, phát khi trình chiếu.
- [ ] **Phase 4 — AI Assistant (cuối cùng):** AI sinh JSON `Presentation` từ mô tả, gợi ý layout/màu/nội dung.

## Đang làm (In Progress)

- Phase 2c tiếp theo: element **Table/Chart** (Chart nhiều loại — xem "Yêu cầu đã chốt"), sau đó Phase 2d/2e theo roadmap.

## Yêu cầu đã chốt từ user (KHÔNG bỏ sót khi làm tiếp)

- **2026-07-08 (bộ yêu cầu lớn):** toàn bộ spec I→VI + mục tiêu "ngang PowerPoint/Canva/Gamma" đã ghi đầy đủ tại **`docs/REQUIREMENTS.md`** — đọc file đó trước khi làm Phase 2c→3.5. Điểm nhấn: 60 templates + My Templates, 20 themes + My Themes (export/import), Recycle Bin + cron 90 ngày, **151 layouts (18 nhóm)**, **Animation system per-element kiểu PowerPoint** (entrance/emphasis/exit/motion-path, trigger on-click/with-previous/after-previous, Animation Pane, default animation).
- **Shape**: đã lên 63 loại; muốn thêm nữa: extend `shapeKindSchema` (shared, CHỈ append) + hình học vào `SHAPE_CLIP_PATHS` (có helper polygon/arc/star/gear) + 1 dòng `SHAPE_OPTIONS` (`apps/web/src/lib/editor/shapes.ts`).
- **Chart: khi làm element Chart phải hỗ trợ NHIỀU loại** — tối thiểu bar/line/pie/donut/area, props theo discriminated union để mở rộng dần.

## Đã hoàn thành

- **2026-07-08 — Cập nhật bộ yêu cầu hệ thống + REQUIREMENTS mục I (fix editor) — typecheck/lint/build pass:**
  - **Docs**: viết `docs/REQUIREMENTS.md` — chốt toàn bộ spec mới I→VI (fix editor / 60 templates + My Templates / 20 themes + My Themes / Recycle Bin 90 ngày / 151 layouts 18 nhóm / Animation system) kèm trạng thái + thiết kế đề xuất cho từng phần; roadmap PROGRESS tách Phase 2b→2f + 3.5.
  - **I.1 Fix sidebar không scroll**: nguyên nhân item flex-col bị `flex-shrink` nén thay vì tràn → thêm `shrink-0` + `min-h-16`; `scroll-smooth`; ảo hóa bằng CSS `content-visibility: auto` + `contain-intrinsic-size` cho danh sách slide dài (100–300 slide).
  - **I.2 Hover actions trên slide** (`slide-panel.tsx`, item đổi button→div role=button vì chứa button con): Nhân bản / Xóa / Lên / Xuống / Khóa / Ẩn — chỉ hiện khi hover, tooltip title, badge 🔒/👁 thường trực; sidebar w-44→w-48. Store thêm `duplicateSlide` (sinh lại id slide + element), `moveSlideBy`, `toggleSlideLocked` (kèm bỏ chọn element), `toggleSlideHidden`. **Slide khóa**: guard trong `addElement` + pointer-events none trên canvas + banner nhắc; **slide ẩn**: cờ `hidden` (trình chiếu Phase 3 sẽ bỏ qua), preview mờ.
  - **I.3 Shape 7 → 63 loại** (`shapeKindSchema` append-only; `shapes.ts` viết lại): hình học sinh bằng helper `polygon/arc/regularPolygon/starPolygon/gearPolygon/heart/cloud`; 6 category (cơ bản 19, mũi tên 10, sao & băng rôn 9, hội thoại 2, biểu tượng 15, flowchart 8); frame/ring/gear đục lỗ bằng subpath ngược chiều (nonzero fill); menu toolbar nhóm theo category + preview `ShapeThumb` vẽ bằng chính clip-path; Inspector: selector 63 hình scroll, **gradient fill** (fill nhận CSS gradient + 8 preset), **viền** (chỉ shape không clip-path — CSS không border được clip-path), **đổ bóng** (prop `shadow`, render `drop-shadow` ở wrapper NGOÀI div bị clip, cả editor + preview), bo góc rect/rounded-rect.
  - **I.4 Icon 20 → 400** (`icon-map.ts` sinh bằng script validate exports lucide-react, giữ key cũ, import tường minh tree-shake, 12 category): **IconPicker** ở toolbar — search realtime, tab category, Favorite (localStorage `vpb:icon-favorites`), Gần đây (`vpb:icon-recent` cap 24), click/double-click chèn, **drag & drop vào canvas** (MIME `application/x-lucide-icon`, toạ độ chia zoom); Inspector icon có search.
  - **I.5 Header/Footer kiểu PowerPoint**: schema shared thêm `presentation.headerFooter` + `slide.hideHeaderFooter` (đều optional, content cũ không vỡ); dialog cấu hình (header/footer/số trang/ngày cố định-hoặc-tự-động/ẩn slide đầu) với 2 nút **Áp dụng tất cả** / **Chỉ slide này** (store `setHeaderFooter(config, scope)`); render đồng nhất qua `HeaderFooterLayer` (canvas + sidebar preview + thumbnail); SlideInspector có toggle ẩn per-slide.
  - Chưa verify tay bằng browser (chỉ typecheck/lint/build) — cần test theo mục "Việc tiếp theo".

- **2026-07-08 — Hoàn thiện editor theo feedback user (trước khi làm Table/Chart):**
  - **Fix sidebar slide list**: trước chỉ hiện ô màu nền trống → giờ render **preview thật thu nhỏ** của slide (tái dùng `SlidePreview`, tự scale theo ResizeObserver), badge số thứ tự nền mờ.
  - **Mở rộng shape 4 → 7 loại**: thêm triangle, diamond, star, arrow (render bằng CSS clip-path — `lib/editor/shapes.ts` dùng chung editor + preview); toolbar đổi 2 nút Khối/Tròn thành **menu "Hình khối"** 7 lựa chọn; Inspector thêm **selector đổi loại hình** cho shape đang chọn; line giờ thêm được từ toolbar.
  - **UX editor**: **Ctrl+D nhân bản** element (+ nút Nhân bản trong Inspector), **mũi tên nudge** 1px (Shift=10px, gộp 1 bước undo cho chuỗi nhấn <800ms), **Escape bỏ chọn**, **auto-fit zoom** theo kích thước màn hình khi mở editor, min-size resize hạ 20 → 6px (line mỏng resize được).
  - Typecheck + lint + build pass.

- **2026-07-08 — Phase 2 đợt 2: Theme system + 15 templates + thumbnail (đã verify API):**
  - **Theme system**: shared `themeConfigSchema` (fontHeading/fontBody + colors background/heading/body/accent, ngưỡng heading = fontSize ≥ 40); BE module `themes/` (GET /themes, THEME_READ); **seed 8 system themes** (Indigo sáng, Dark Slate, Emerald, Sunset, Ocean, Neon Dark, Rose, Mono — validate schema lúc seed, idempotent theo name); store action **`applyTheme`** (đổi themeId + background mọi slide + màu/font text theo heading/body + accent cho shape/icon, image giữ nguyên, undo được); **ThemePicker** trong Inspector (khi không chọn element) hiện swatch 4 màu.
  - **Templates 6 → 15**: thêm Kế hoạch dự án, Giới thiệu công ty, OKR & Mục tiêu (business), Ôn tập trắc nghiệm, Khoa học trực quan (education), Portfolio cá nhân, Mood board (creative), Typography đậm, Timeline đơn giản (minimal).
  - **Thumbnail project**: sau khi Lưu thành công → chụp slide đầu từ bản render ẩn (`SlidePreview` 480px + `html-to-image`) → PUT lên R2 **key cố định** `{userId}/thumbnails/{projectId}.png` (ghi đè, không rác asset; confirm upsert theo key) → PATCH `thumbnailUrl` kèm `?v=` bust cache. Fail im lặng, không chặn luồng lưu. Presign có `purpose: "thumbnail"` (bắt buộc projectId + PNG, thiếu → 400).
  - Verified curl: 8 themes, 15 templates, presign thumbnail trả đúng key cố định, thiếu projectId → 400; typecheck + lint + build pass. **Lưu ý**: capture thumbnail phía browser chưa test tay (cần chạy thật); nếu ảnh R2 trong slide bị CORS khi capture thì thumbnail bỏ qua (silent).

- **2026-07-07 — Fix logic lưu (feedback user) + Phase 2 đợt 1 Templates (đã verify):**
  - **Bỏ autosave → nút Lưu thủ công** + Ctrl+S; indicator "Chưa lưu" (chấm vàng)/"Đang lưu"/"Đã lưu"/"Lưu thất bại"; nút back hỏi confirm khi còn thay đổi chưa lưu; giữ banner 409 + beforeunload.
  - **Fix desync khi mở lại project**: `useProject` staleTime Infinity nhưng save chỉ invalidate list → mở lại editor load bản cache CŨ. Fix: `useSaveProject.onSuccess` **setQueryData `['project', id]`** với content + revision vừa lưu (logic tại `hooks/mutations/useSaveProject.ts`; orchestration lưu tại `hooks/useSavePresentation.ts`).
  - **BE `templates/`**: GET /templates + /templates/:id (isPublic, TEMPLATE_READ, trả kèm content để FE render preview); POST /projects nhận `templateId` → copy content + **sinh lại toàn bộ id slide/element**; templateId sai → 404.
  - **Seed 6 template** (`prisma/seed-templates.ts`, idempotent theo title, **validate `presentationSchema.parse` ngay lúc seed**): Pitch Deck tối giản, Báo cáo kinh doanh (business), Bài giảng sinh động (education), Gradient sáng tạo, Neon Dark (creative), Trắng tối giản (minimal).
  - **FE `/templates`**: gallery nhóm theo category, preview slide đầu render THẬT bằng `SlidePreview` (render tĩnh scale theo container qua ResizeObserver — không cần thumbnail), nút "Dùng" → tạo project → vào editor; dashboard thêm nút "Từ template"; proxy matcher thêm `/templates`.
  - Verified curl: list 6 templates đúng category/số slide; tạo từ template ra project 3 slides/18 elements; typecheck + lint + build pass.

- **2026-07-07 — Phase 1 (đợt 2): Resize/rotate, reorder slide, Inspector, rename:**
  - **Resize 8 hướng + rotate handle** (`selection-handles.tsx`): pointer events + `setPointerCapture`, toạ độ chia zoom, handle giữ kích thước cố định trên màn hình (`size/zoom`), min 20px, Shift khi xoay = snap 15°, **pushHistory đúng 1 lần trước lần mutate đầu** của mỗi thao tác.
  - **Reorder slide** bằng `@dnd-kit/sortable` (thêm dep `@dnd-kit/utilities`), activationConstraint 5px để click chọn không bị nuốt.
  - **Inspector panel** (phải, w-64): text (cỡ/đậm/màu/căn lề/giãn dòng), shape (fill/bo góc), icon (màu + grid đổi icon từ SLIDE_ICONS), image (cover-contain/bo góc); chung: opacity slider, lên trên/xuống dưới (zIndex), khóa/mở khóa, xóa. Không chọn element → chỉnh **màu nền slide** (color picker + 6 preset). History: input pushHistory khi focus/pointerdown (1 snapshot/phiên tương tác).
  - **Rename project từ toolbar**: click title → input → PATCH `/projects/:id` (đã verify curl: rename OK, title rỗng → 400), cache React Query cập nhật cả `['project', id]` lẫn `['projects']`.
  - Store thêm `updateSlide(slideId, updater)`. Typecheck + lint + build pass.

- **2026-07-07 — Phase 1 (đợt 1): Projects + Assets API, Dashboard, Editor cơ bản (đã verify):**
  - **API `projects/`**: CRUD + soft delete; `PUT /projects/:id/content` validate bằng `presentationSchema` + **optimistic concurrency atomic** (`updateMany` có revision trong WHERE — lệch trả 409); ownership check mọi endpoint (verify IDOR: user B đọc/ghi project user A → 404).
  - **API `assets/`**: presign R2 (key `{userId}/{uuid}.{ext}`) → client PUT thẳng lên R2 → confirm (HeadObject verify tồn tại + size/mime thật, không tin client); list; delete (xóa cả object R2 + record). **Verified upload THẬT lên R2**: PUT 200 → public URL 200 → delete → 404.
  - **Web dashboard**: grid project (thumbnail placeholder, ngày sửa), tạo mới → vào editor, xóa (confirm), empty state.
  - **Web editor** (`/editor/[id]`): Zustand store working-copy (load 1 lần, undo/redo snapshot cap 50), canvas DOM 1280×720 scale theo zoom, render đủ 4 element (text/shape/icon/image), **drag bằng dnd-kit** (delta chia zoom, 1 snapshot history/thao tác), click chọn + ring, **double-click sửa text contentEditable**, toolbar (thêm text/khối/tròn/icon/ảnh-upload-R2, undo/redo, zoom, save indicator), **autosave debounce 1.5s kèm revision** → 409 hiện banner "Tải lại phiên bản mới nhất", lỗi mạng tự retry sau 5s, phím tắt Delete/Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y, cảnh báo beforeunload khi chưa lưu; slide panel thêm/xóa/chọn slide.
  - Verified: typecheck + lint + build pass; `/editor/[id]` không cookie → 307 về login, có cookie → 200.

- **2026-07-07 — Phase 0.5: Auth & RBAC (đã verify runtime từng kịch bản bằng curl):**
  - **API `auth/`:** register/login (argon2, lỗi generic chống enumeration), refresh token opaque (SHA-256 hash trong `Session`) **rotation + reuse detection** (dùng lại token cũ → revoke toàn bộ session của user), logout, `GET /auth/me`, Google OAuth (`passport-google-oauth20`, strategy chỉ đăng ký khi env đủ — `GoogleEnabledGuard` trả 404 khi thiếu; merge account theo email).
  - **Cookies:** `access_token` (path=/, JWT 15m nhưng cookie 30d để proxy.ts thấy session), `refresh_token` (path=/auth), httpOnly + sameSite=lax + secure ở prod.
  - **API `rbac/` + `common/`:** `AuthGuard` global (verify JWT + check session revoked trong DB → revoke có tác dụng NGAY), `PermissionsGuard` (cache permission theo role TTL 60s), `@Public()`/`@RequirePermission()`/`@CurrentUser()`, `OriginGuard` global (CSRF), `ZodValidationPipe` (dùng schema @repo/shared), `ThrottlerModule` (5/min register, 10/min login+refresh, 100/min mặc định).
  - **Web:** trang `/login` + `/register` (react-hook-form + zodResolver + schema shared, shadcn Card/Input/Label, nút Google), `/dashboard` (useMe + logout), hooks `useMe`/`useLogin`/`useRegister`/`useLogout`, components ui input/label/card.
  - **Verified bằng curl:** register→me OK; refresh rotate ra token khác; replay token cũ → 401 + toàn bộ session revoke (me bằng access token mới cũng 401 ngay); Origin lạ → 403; logout → me 401; sai mật khẩu → 401 generic; password yếu → 400 với message zod; `/auth/google` → 302 sang accounts.google.com (user đã điền client id/secret thật vào `.env`).

- **2026-07-07 — Phase 0: Scaffold monorepo (đã verify chạy thật):**
  - pnpm workspace: `apps/api`, `apps/web`, `packages/shared`; script root `dev`/`typecheck`/`lint`/`db:up`/`db:migrate`/`db:seed`/`db:studio`.
  - `packages/shared`: zod schemas (`presentation` — discriminated union đủ 4 element Phase 1, `auth`, `project`) + constants (`permissions`, `limits`), build ra `dist/` bằng tsc.
  - `apps/api` NestJS 11: ConfigModule validate env bằng zod (fail-fast), PrismaService global, helmet + cookie-parser + CORS(credentials) + body limit 2MB + ValidationPipe, `GET /health` check DB. **Migration `init` đã áp đủ 10 bảng** (User/Role/Permission/RolePermission/Session/Project/ProjectCollaborator/Asset/Theme/Template). **Seed roles+permissions đã chạy** (idempotent, đọc từ @repo/shared).
  - `apps/web` Next 16: Tailwind v4 + shadcn/ui (components.json, globals.css theme neutral, Button mẫu), lucide-react, React Query provider, **fetch wrapper `src/lib/api/`** (single-flight refresh 401, timeout AbortSignal, ApiError chuẩn hoá), `src/proxy.ts` chặn `/dashboard`+`/editor`.
  - Verified: `pnpm typecheck` + `pnpm lint` pass toàn repo; API `/health` trả `{status:ok,db:up}`; web build + render trang chủ; proxy redirect 307 `/dashboard` → `/login?next=/dashboard`.
- **2026-07-07 — Rà soát & sửa toàn bộ docs (trước khi code):**
  - Chuyển 4 file docs từ root vào `docs/` cho khớp cấu trúc khai báo trong CLAUDE.md.
  - Sửa các thiếu sót: xem Decision Log các dòng ngày 2026-07-07.

## Quyết định kỹ thuật đã chốt (Decision Log)

> Ghi lại mọi quyết định quan trọng để session sau không hỏi lại hoặc làm khác đi.

| Ngày | Quyết định | Lý do |
|---|---|---|
| — | Dùng `proxy.ts` thay `middleware.ts` (Next.js 16) | Convention mới, middleware.ts đã deprecated |
| — | AI Assistant là tính năng làm SAU CÙNG | Ưu tiên trải nghiệm tạo slide + template trước |
| — | Không làm payment/thu phí ở giai đoạn hiện tại | Dự án cá nhân, chưa cần monetize |
| — | Auth dùng cookie httpOnly, không dùng localStorage | Bảo mật cao hơn, chống XSS đánh cắp token |
| 2026-07-07 | **pnpm workspace** monorepo + **packages/shared (@repo/shared)**, zod là source of truth cho type FE–BE | Docs cũ không chốt tooling; 2 bộ validation (zod FE / class-validator BE) sẽ lệch rule |
| 2026-07-07 | Cookie **sameSite=lax** (đổi từ strict) | strict làm mất session khi vào từ link ngoài + vướng OAuth redirect; lax + Origin-check guard vẫn chống CSRF |
| 2026-07-07 | CSRF = **Origin-check guard** tự viết (không csurf/@nestjs/csrf) | csurf deprecated, @nestjs/csrf không tồn tại chính thức |
| 2026-07-07 | Refresh rotation + **reuse detection** (dùng lại token cũ → revoke cả chain) | Rotation không có reuse detection là lỗ hổng phổ biến |
| 2026-07-07 | Permission ↔ Role là **M2M qua RolePermission** (bỏ `roleId` trong Permission) | Thiết kế cũ 1-N làm trùng lặp permission mỗi role |
| 2026-07-07 | Role hệ thống chỉ `admin`/`user`; owner/editor/viewer là **resource-level** check trong service | Trộn 2 tầng quyền vào Role toàn cục là sai mô hình |
| 2026-07-07 | Password hash chốt **argon2** | Bỏ tình trạng "argon2 hoặc bcrypt" nước đôi |
| 2026-07-07 | JSON `Presentation` thêm **`schemaVersion`**; bỏ `Slide.order` (thứ tự = vị trí mảng); `SlideElement` là **discriminated union** ngay từ đầu | Không có version thì sau không migrate được content cũ; order + mảng = 2 nguồn sự thật; props Record<string,unknown> phá strict-mode |
| 2026-07-07 | Project có **`revision`** → save so khớp, lệch trả 409 | Chống mất dữ liệu khi mở 2 tab (last-write-wins âm thầm) |
| 2026-07-07 | BE **validate `content` bằng zod shared + body limit 2MB** trước khi lưu | Không tin JSON từ client; chống payload rác/DoS |
| 2026-07-07 | Thêm bảng **`Asset`** + module `/assets` ngay Phase 1 | Image element cần upload; docs cũ hoàn toàn thiếu phần storage |
| 2026-07-07 | Canvas editor = **DOM-based** (absolute div + CSS transform), KHÔNG Konva/Fabric | Chốt câu hỏi tồn đọng cũ; Phase 1–2 DOM là đủ, text editing dễ hơn |
| 2026-07-07 | FE gọi API qua **fetch wrapper `lib/api/`** (không axios), tự refresh khi 401 | Docs cũ chưa định nghĩa tầng gọi API |
| 2026-07-07 | Storage Asset = **Cloudflare R2** (S3-compatible, cả dev lẫn prod) — credentials trong `apps/api/.env`; upload qua presigned URL | User cung cấp sẵn bucket + credentials; presigned để file không đi qua API server |
| 2026-07-07 | Icon = **lucide-react** (v1.x) | Chuẩn mặc định của shadcn/ui, phổ biến nhất hiện nay, style đồng nhất; `IconElement.props.name` = tên icon lucide |
| 2026-07-07 | UI = **shadcn/ui** (style new-york, base neutral) + **Tailwind CSS v4** | User chốt; component copy vào `src/components/ui/` |
| 2026-07-07 | pnpm 11: approve build scripts qua `allowBuilds` trong `pnpm-workspace.yaml` | pnpm ≥10 chặn postinstall mặc định (prisma, sharp, argon2...) |
| 2026-07-07 | **Bỏ `title` khỏi Presentation JSON** — title chỉ ở cột `Project.title` | Tránh 2 nguồn sự thật; rename không phải ghi lại cả content |
| 2026-07-07 | Icon trên slide: **subset ~20 icon lucide** trong `lib/editor/icon-map.ts`, KHÔNG import động cả bộ | Cả bộ ~1500 icon phình bundle; mở rộng map dần khi cần |
| 2026-07-07 | Upload asset: **presign → PUT thẳng R2 → confirm** (BE HeadObject verify size/mime thật) | File không đi qua API server; không tin metadata client gửi |
| 2026-07-07 | **Lưu THỦ CÔNG (nút Lưu + Ctrl+S), KHÔNG autosave** | User yêu cầu; kèm confirm khi rời trang chưa lưu |
| 2026-07-07 | Save xong phải **setQueryData `['project', id]`** (không chỉ invalidate list) | useProject staleTime Infinity — không sync cache là mở lại thấy bản cũ |
| 2026-07-07 | Tạo project từ template: **copy content + sinh lại id slide/element** | Hai project từ cùng template không được trùng id |
| 2026-07-07 | Preview template = **render tĩnh slide đầu** (`SlidePreview` + ResizeObserver) | Chưa cần pipeline thumbnail; preview luôn đúng 100% nội dung |
| 2026-07-08 | Áp theme = mutate toàn bộ presentation (background + màu/font text theo ngưỡng heading fontSize ≥ 40 + accent shape/icon) | Đơn giản, WYSIWYG, undo được; không làm hệ token phức tạp ở giai đoạn này |
| 2026-07-08 | Thumbnail: **key R2 cố định** `{userId}/thumbnails/{projectId}.png` + `?v=` bust cache | Ghi đè cùng object — không tích rác asset mỗi lần lưu |
| 2026-07-08 | Mọi field mới trong JSON content là **optional additive**, giữ `schemaVersion: 1` (`slide.locked/hidden/hideHeaderFooter`, `presentation.headerFooter`, `shape.shadow`, shape kinds mới append vào enum) | Content cũ parse được nguyên vẹn, không cần migrate |
| 2026-07-08 | Sidebar slide ảo hóa bằng **CSS `content-visibility: auto`** thay vì virtualizer JS | Đủ mượt cho 100–300 slide, không đụng dnd-kit sortable; nếu chưa đủ mới nâng cấp windowing |
| 2026-07-08 | Icon library: **sinh file bằng script validate với exports lucide-react** (400 icon, import tường minh) — KHÔNG import động cả bộ | Giữ tree-shake; tên icon sai bị loại lúc generate thay vì vỡ build |
| 2026-07-08 | Shape shadow render bằng `filter: drop-shadow` trên **wrapper ngoài** div bị clip-path | box-shadow/filter đặt cùng element bị clip sẽ mất bóng |
| 2026-07-08 | Border (stroke) chỉ hỗ trợ shape KHÔNG dùng clip-path | CSS border không áp được lên clip-path; muốn stroke mọi shape phải chuyển render SVG — để mở khi có nhu cầu |
| 2026-07-08 | Header/Footer: config ở `presentation.headerFooter` + cờ ẩn per-slide; scope "Chỉ slide này" = ẩn ở mọi slide khác | Mô hình 1 nguồn config + override đơn giản, khớp hành vi PowerPoint đủ dùng |

## Vấn đề tồn đọng / Cần quyết định thêm

- Google OAuth callback mới verify được redirect sang Google (302) — luồng callback đầy đủ cần test bằng browser thật khi chạy `pnpm dev`.
- Thumbnail capture (`html-to-image`) khi slide chứa ảnh từ R2: nếu bucket chưa bật CORS cho origin frontend thì canvas bị taint → thumbnail fail (silent). Nếu gặp: cấu hình CORS cho bucket `visual-presentation` trên Cloudflare dashboard (AllowedOrigins: domain FE, AllowedMethods: GET).
- User đã tự chỉnh style trang login/register/landing (gradient, palette tím/cam/xanh trong `globals.css`) + thêm trang `/privacy`, `/terms`, `/cookies` — GIỮ NGUYÊN style này, không revert về theme neutral.

## Ghi chú cho session tiếp theo

- **Việc tiếp theo**: (a) **test tay bằng browser đợt 2026-07-08**: sidebar scroll khi >10 slide + hover actions (nhân bản/xóa/lên/xuống/khóa/ẩn), menu 63 shapes (đặc biệt các hình sinh từ helper: gear/heart/cloud/ring/frame — kiểm tra hình dạng đúng), gradient + đổ bóng + viền trong Inspector, IconPicker (search/favorite/recent/kéo-thả vào canvas), Header/Footer (áp tất cả / chỉ slide này / ẩn slide đầu / số trang + ngày), áp theme, lưu → thumbnail (nếu slide có ảnh R2 mà thumbnail không ra → bật CORS bucket R2, xem Vấn đề tồn đọng); (b) **Phase 2c**: element **Table/Chart** — Chart PHẢI nhiều loại (bar/line/pie/donut/area); (c) tiếp theo làm theo roadmap 2d→2f + 3 + 3.5 — **đọc `docs/REQUIREMENTS.md` trước** (đã có thiết kế đề xuất cho templates/themes/recycle-bin/layouts/animation).
- **CẢNH BÁO thao tác shell**: cwd hay bị reset về repo HRM giữa các lệnh — LUÔN `cd /home/hoangdanhdev/Desktop/projects/core/visual-presentation-builder` (đường dẫn tuyệt đối) trong MỖI lệnh Bash, tránh build/seed nhầm repo khác.
- Test bằng browser: `pnpm db:up` → `pnpm dev` → login `test@example.com` / `matkhau123` (DB local có user test, vài project, 15 templates + 8 themes đã seed).
- Lưu ý: `apps/api/.env` đã đủ R2 + JWT secrets + Google OAuth keys (user đã điền thật) — đã gitignore. Repo đã `git init` nhưng CHƯA có commit nào.
