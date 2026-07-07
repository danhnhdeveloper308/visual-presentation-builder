# BACKEND.md — NestJS Conventions, Auth, RBAC, Security

> Chỉ đọc file này khi task liên quan NestJS, authentication, authorization, hoặc bảo mật.

## 1. Authentication — Cookie-based

- Không dùng JWT lưu ở localStorage/sessionStorage. Toàn bộ session dùng **cookie httpOnly + secure + sameSite=lax**.
  - **Vì sao `lax` chứ KHÔNG phải `strict`:** `strict` làm cookie KHÔNG được gửi khi user điều hướng từ site ngoài vào (click link từ email/Google Docs → vào `/dashboard` bị đá về login dù đang đăng nhập), và gây trục trặc với OAuth redirect callback. `lax` vẫn chặn cookie trên mọi request cross-site POST/PUT/DELETE — đủ tầng 1 chống CSRF, kết hợp tầng 2 ở mục 1.1.
- Access token: JWT sống ngắn (15 phút), lưu trong cookie httpOnly `access_token`.
- Refresh token: sống 30 ngày, cookie httpOnly riêng (`refresh_token`, path giới hạn `/auth/refresh`), **hash (SHA-256) trước khi lưu DB** (bảng `Session`), rotate mỗi lần dùng.
- **Reuse detection (bắt buộc):** khi một refresh token ĐÃ rotate (có `replacedByHash`) bị dùng lại → coi là token bị đánh cắp → revoke toàn bộ session chain của user đó + yêu cầu login lại.
- Logout: xóa cookie + set `revokedAt` cho record trong bảng `Session`.

### 1.1 CSRF

- **KHÔNG có package chính thức `@nestjs/csrf`; `csurf` đã deprecated — không dùng.**
- Chốt cách làm: **guard toàn cục check `Origin` header** cho mọi request có side-effect (POST/PUT/PATCH/DELETE) — so với whitelist domain frontend, thiếu hoặc sai → 403. Kết hợp sameSite=lax là đủ cho SPA gọi API bằng fetch.
- Fetch wrapper phía FE luôn gửi `credentials: 'include'`; trình duyệt tự đính `Origin` cho mọi request cross-origin và mọi POST — không cần token thủ công.

## 2. Google OAuth (login/register)

- Dùng `passport-google-oauth20` qua `@nestjs/passport`.
- Flow: `/auth/google` → redirect Google → `/auth/google/callback` → tạo hoặc tìm `User` theo `googleId`/`email` → tạo `Session` → set cookie → redirect về frontend.
- Nếu email đã tồn tại (đăng ký bằng password trước đó) → merge tài khoản theo email, gắn thêm `googleId`, KHÔNG tạo user trùng.
- Đăng ký thường (email/password): hash password bằng **argon2** (đã chốt — không dùng bcrypt để khỏi phân vân giữa 2 lựa chọn).
- Quên mật khẩu: Phase sau — khi làm cần bảng `PasswordResetToken` (hash + expiresAt), chưa tạo vội.

## 3. RBAC — Role-Permission-Guard pattern

- **Role**: chỉ 2 role hệ thống — `admin`, `user`. Quyền theo từng project (owner/editor/viewer) KHÔNG nằm ở đây (xem dưới).
- **Permission**: hành động cụ thể, string convention `resource:action` (`project:create`, `template:publish`, `theme:manage`...). Quan hệ Role↔Permission là **many-to-many qua bảng `RolePermission`** — danh sách mặc định đặt tại `packages/shared/src/constants/permissions.ts`, seed bằng script (`pnpm db:seed`, idempotent — chạy lại không tạo trùng).
- **Guard**: `AuthGuard` (đọc access token từ cookie) + `PermissionsGuard` (đọc metadata từ decorator).
- **Decorator**: `@RequirePermission('project:delete')` gắn trên controller method.
- **Resource-level (quan trọng, RBAC role chung KHÔNG đủ):** chỉ owner (hoặc collaborator đủ quyền) mới đọc/sửa/xóa được project của mình — check ownership trong service layer trên MỌI endpoint projects/assets, kể cả GET. Quên check ownership ở GET = lộ dữ liệu người khác (IDOR).

```ts
@UseGuards(AuthGuard, PermissionsGuard)
@RequirePermission('project:delete')
@Delete(':id')
deleteProject(@Param('id') id: string, @CurrentUser() user: User) {
  // service: findOwned(id, user.id) → NotFoundException nếu không phải owner
}
```

## 4. Security checklist (bắt buộc áp dụng)

- `helmet` middleware cho toàn app.
- Rate limiting (`@nestjs/throttler`): chặt cho route auth (login/register/refresh — chống brute-force), mức rộng hơn cho toàn app.
- Validation: DTO đơn giản dùng `class-validator` + `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` toàn cục; payload dùng chung với FE (content JSON, auth form) validate bằng **zod schema từ `@repo/shared`** — một nguồn rule duy nhất.
- **Validate `content` JSON của project bằng zod trước khi lưu + giới hạn body size 2MB** — không tin dữ liệu editor gửi lên.
- CORS: chỉ allow đúng origin frontend (đọc từ env), `credentials: true`.
- Sanitize text content trong slide bằng thư viện (ví dụ `sanitize-html`) ở BE trước khi lưu — chống stored XSS khi render lại.
- Không log thông tin nhạy cảm (password, token, cookie) ra console/log file; production không trả stack trace trong response lỗi.
- Secrets chỉ ở `.env` (có `.env.example` đủ key, không có value thật) — không hardcode, không commit.

## 5. Asset storage — Cloudflare R2

- Bucket R2 (S3-compatible), credentials trong `apps/api/.env` (`CLOUDFLARE_R2_*` — đã validate trong `env.validation.ts`, thiếu là API không boot).
- SDK: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, endpoint = `CLOUDFLARE_R2_S3_URL`, region `auto`.
- **Flow upload (presigned PUT — file KHÔNG đi qua API server):**
  1. FE gọi `POST /assets/presign` (kèm mimeType + sizeBytes) → BE check quyền + LIMITS (`ASSET_MAX_BYTES`, `ASSET_ALLOWED_MIME` từ @repo/shared) → trả presigned PUT URL + object key.
  2. FE PUT file thẳng lên R2 bằng URL đó.
  3. FE gọi `POST /assets/confirm` với key → BE tạo record `Asset` (url = `CLOUDFLARE_R2_PUBLIC_URL/key`).
- Object key convention: `{userId}/{cuid}.{ext}` — xoá asset thì xoá cả object trên R2 lẫn record DB.

## 6. Cấu trúc module chuẩn NestJS 11

Mỗi module gồm: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, tuân theo pattern của NestJS CLI (`nest g module/controller/service`). Không tự sáng tạo cấu trúc khác. Prisma dùng qua `PrismaService` global module.
