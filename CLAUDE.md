# CLAUDE.md — Project Instructions

> File này được Claude đọc đầu tiên trong MỌI conversation/session. Giữ file này NGẮN — chi tiết nằm ở `docs/*.md`, chỉ đọc khi cần để tiết kiệm token.

## 0. Quy tắc bắt buộc trước khi làm việc

1. **LUÔN đọc `docs/PROGRESS.md` trước khi bắt đầu bất kỳ task nào** để biết trạng thái hiện tại, không lặp lại việc đã xong, không phá vỡ quyết định đã chốt.
2. **Sau khi hoàn thành một task/feature**, PHẢI cập nhật `docs/PROGRESS.md` (mục "Đã hoàn thành", "Đang làm", "Quyết định kỹ thuật" nếu có thay đổi).
3. Không tự ý đổi tech stack, cấu trúc thư mục, hoặc convention đã chốt trong file này mà không hỏi lại người dùng.
4. Nếu task liên quan phần nào, CHỈ đọc file docs tương ứng — không đọc toàn bộ `docs/` mỗi lần để tiết kiệm token:
   - Việc liên quan **kiến trúc dữ liệu / Prisma schema / Project Model JSON / packages/shared** → đọc `docs/ARCHITECTURE.md`
   - Việc liên quan **NestJS / Auth / RBAC / Security** → đọc `docs/BACKEND.md`
   - Việc liên quan **Next.js / UI / State management / Form / Canvas / Drag-drop** → đọc `docs/FRONTEND.md`
5. Trước khi báo hoàn thành 1 task: chạy `pnpm typecheck` và `pnpm lint` cho phần đã sửa.

## 1. Tổng quan dự án

**Tên tạm thời:** Visual Presentation Builder — nền tảng tạo slide/presentation hiện đại, kéo-thả trực quan, kho template phong phú. AI Assistant là tính năng tích hợp **sau cùng**, không phải trọng tâm ban đầu.

**Trọng tâm ưu tiên hiện tại:** trải nghiệm tạo slide (canvas editor, drag & drop) + kho template/theme hiện đại. KHÔNG làm AI, KHÔNG làm thu phí/payment ở giai đoạn này.

**Người dùng:** dự án cá nhân (solo dev) nhưng phục vụ nhiều người dùng thật — không phải chỉ để học.

## 2. Tech Stack (CỐ ĐỊNH — không đổi trừ khi được yêu cầu rõ ràng)

### Monorepo
- **Chỉ dùng `pnpm`** (workspace). KHÔNG dùng npm/yarn. Cài deps: `pnpm --filter <api|web|@repo/shared> add <pkg>`.
- **`packages/shared` (@repo/shared):** zod schema + type + constants dùng chung FE–BE. **Zod là source of truth, infer type từ zod** — không viết type tay song song.

### Frontend
- **Next.js 16.x** — App Router. Dùng `proxy.ts` (KHÔNG dùng `middleware.ts` — đã deprecated từ Next 16). `proxy.ts` chạy trên Node.js runtime, export function tên `proxy`.
- **Gọi API:** custom fetch wrapper tại `apps/web/src/lib/api/` — KHÔNG dùng axios, KHÔNG fetch trực tiếp trong component.
- **@tanstack/react-query** — server state. **Zustand** — client/UI state của editor.
- **UI: shadcn/ui** (style new-york, base neutral) + **Tailwind CSS v4**; icon dùng **lucide-react**. Thêm component: `pnpm dlx shadcn@latest add <name>` (chạy trong `apps/web`).
- **@dnd-kit/core + @dnd-kit/sortable** — kéo-thả. Canvas render bằng **DOM thuần** (đã chốt, KHÔNG Konva/Fabric).
- **react-hook-form + zod** (`zodResolver`) — mọi form; schema lấy từ `@repo/shared`.

### Backend
- **NestJS 11.x**
- **Auth:** cookie-based (httpOnly, secure, **sameSite=lax**) — access 15m + refresh 30d rotation (hash trong bảng `Session`, có reuse detection). KHÔNG dùng localStorage/JWT header.
- **OAuth:** Google OAuth2 (`@nestjs/passport` + `passport-google-oauth20`). Password hash: **argon2**.
- **RBAC:** Role–Permission (M2M)–Guard; permission format `resource:action`. Quyền theo project (owner/collaborator) check resource-level trong service (chi tiết `docs/BACKEND.md`).
- Bảo mật: helmet, rate limiting, **Origin-check guard chống CSRF** (không csurf), validation nghiêm ngặt, validate content JSON bằng zod shared.

### Database & Storage
- Prisma ORM + PostgreSQL (docker-compose local). Schema chi tiết ở `docs/ARCHITECTURE.md`.
- **File/ảnh upload: Cloudflare R2** (S3-compatible) — env `CLOUDFLARE_R2_*` trong `apps/api/.env`, upload qua presigned URL.

## Lệnh thường dùng

| Việc | Lệnh (chạy ở root) |
|---|---|
| Chạy dev cả 2 app | `pnpm dev` (tự build shared trước) |
| Chỉ API / Web | `pnpm dev:api` / `pnpm dev:web` |
| Bật Postgres local | `pnpm db:up` |
| Migration mới | `pnpm db:migrate <ten_migration>` |
| Seed roles/permissions | `pnpm db:seed` |
| Typecheck / Lint toàn repo | `pnpm typecheck` / `pnpm lint` |

## 3. Cấu trúc thư mục

```
/apps
  /web              → Next.js 16
  /api              → NestJS 11
/packages
  /shared           → @repo/shared: zod schemas + types + constants
/docs
  PROGRESS.md  ARCHITECTURE.md  BACKEND.md  FRONTEND.md
/docker             → docker-compose.yml (Postgres local)
```

## 4. Nguyên tắc code chung

- TypeScript `strict: true` bắt buộc ở cả 2 phía. Không dùng `any` trừ khi bất khả kháng (kèm comment lý do).
- Secrets chỉ ở `.env` (kèm `.env.example`) — không hardcode, không commit.
- Không tạo file/module dư thừa ngoài phạm vi task được giao.
- Ưu tiên giải pháp đơn giản, đúng convention đã chốt hơn là "sáng tạo" thêm pattern mới.
- Mọi thay đổi ảnh hưởng đến schema, auth flow, hoặc cấu trúc thư mục PHẢI được ghi vào `docs/PROGRESS.md` mục "Quyết định kỹ thuật".
