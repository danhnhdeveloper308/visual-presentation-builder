# PROGRESS.md — Tiến độ dự án

> Claude PHẢI đọc file này trước khi làm task, và PHẢI cập nhật lại sau khi hoàn thành task. Không xóa lịch sử cũ — chỉ chuyển mục đã xong xuống "Lịch sử hoàn thành" kèm ngày.

## Trạng thái hiện tại

**Phase đang làm:** Phase 0 ĐÃ XONG → tiếp theo là Phase 0.5 — Auth & RBAC
**Cập nhật lần cuối:** 2026-07-07

## Roadmap tổng quan (tham chiếu, không sửa trừ khi đổi kế hoạch)

- [x] **Phase 0 — Scaffold:** pnpm workspace, apps/web (Next 16) + apps/api (NestJS 11) + packages/shared, Prisma + docker-compose Postgres, script `dev`/`typecheck`/`lint`/`db:*` ở root. _(xong 2026-07-07)_
- [ ] **Phase 0.5 — Auth & RBAC (làm TRƯỚC editor, mọi thứ sau đều cần user):** schema.prisma đầy đủ, register/login (argon2), Google OAuth, refresh rotation + reuse detection, Origin-check guard (CSRF), RBAC guards + seed, proxy.ts, trang login/register.
- [ ] **Phase 1 — Core Editor:** zod schema `Presentation` trong shared, Projects CRUD (validate content + revision 409), Assets upload, Dashboard, Canvas editor (DOM + dnd-kit, resize/rotate handles), element Text/Image/Shape/Icon, undo/redo, autosave.
- [ ] **Phase 2 — Template & Theme:** 15–30 template hiện đại, Theme system (font/màu/background), component mở rộng (Table/Chart cơ bản).
- [ ] **Phase 3 — Trình diễn & Export:** chế độ trình chiếu fullscreen, transition cơ bản, export PDF (Playwright) / PPTX (pptxgenjs) / PNG.
- [ ] **Phase 4 — AI Assistant (cuối cùng):** AI sinh JSON `Presentation` từ mô tả, gợi ý layout/màu/nội dung.

## Đang làm (In Progress)

- _(chưa có — task tiếp theo: Phase 0.5 Auth & RBAC, xem "Ghi chú cho session tiếp theo")_

## Đã hoàn thành

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

## Vấn đề tồn đọng / Cần quyết định thêm

- Google OAuth: cần tạo OAuth Client trên Google Cloud Console và điền `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` vào `apps/api/.env` (đang để trống — code Phase 0.5 phải cho phép tắt tính năng khi thiếu key).

## Ghi chú cho session tiếp theo

- Bắt đầu **Phase 0.5 — Auth & RBAC**: module `auth/` (register/login argon2, refresh rotation + reuse detection, Origin-check guard, cookie lax theo `docs/BACKEND.md`), module `rbac/` (AuthGuard, PermissionsGuard, `@RequirePermission`, `@CurrentUser`), Google OAuth (bọc điều kiện env), FE trang `/login` + `/register` (shadcn form + `loginSchema`/`registerSchema` từ @repo/shared).
- Lệnh dev: `pnpm db:up` → `pnpm dev` (root — tự build shared trước). Migration: `pnpm db:migrate <ten>`. Seed: `pnpm db:seed`.
- Lưu ý: `apps/api/.env` đã có đủ R2 + JWT secrets (sinh sẵn); root `.env.local` là bản gốc R2 của user — cả hai đều đã gitignore.
