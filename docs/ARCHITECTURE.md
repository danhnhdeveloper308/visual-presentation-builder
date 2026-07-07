# ARCHITECTURE.md — Data Model & Kiến trúc

> Chỉ đọc file này khi task liên quan đến schema, Project Model JSON, hoặc luồng dữ liệu giữa module.

## 1. Project Model (JSON) — cấu trúc slide

Đây là "nguồn sự thật" (source of truth) cho một presentation. Canvas Editor đọc/ghi vào cấu trúc này; sau này AI Engine (Phase 4) cũng chỉ cần sinh ra đúng JSON theo schema này.

**Schema định nghĩa bằng zod tại `packages/shared/src/schemas/presentation.ts` — type TypeScript infer từ zod, KHÔNG viết type tay song song.** Backend dùng đúng schema này để validate `content` trước khi lưu (xem mục 5).

```ts
type Presentation = {
  schemaVersion: 1;          // BẮT BUỘC — tăng khi đổi cấu trúc JSON, để migrate content cũ
  title: string;
  themeId: string | null;
  slides: Slide[];
};
// id, createdAt, updatedAt KHÔNG nằm trong JSON — đã có ở cột của bảng Project, tránh 2 nguồn sự thật.

type Slide = {
  id: string;                 // nanoid, sinh ở client
  background: BackgroundConfig;
  elements: SlideElement[];
  transition?: TransitionType; // Phase 3
};
// KHÔNG có field `order` — thứ tự slide = vị trí trong mảng `slides`. Một nguồn sự thật duy nhất.

type SlideElement =
  | TextElement | ImageElement | ShapeElement | IconElement   // Phase 1
  | TableElement | ChartElement;                              // Phase 2

// Discriminated union theo `type` — KHÔNG dùng props: Record<string, unknown>.
// Base chung cho mọi element:
type ElementBase = {
  id: string;
  position: { x: number; y: number };  // toạ độ logic trên khung 1280×720 (16:9)
  size: { width: number; height: number };
  rotation: number;                    // độ
  zIndex: number;
  locked?: boolean;
  opacity?: number;                    // 0–1, mặc định 1
};

type TextElement  = ElementBase & { type: "text";  props: { content: string; fontFamily: string; fontSize: number; fontWeight: number; color: string; align: "left"|"center"|"right"; lineHeight: number } };
type ImageElement = ElementBase & { type: "image"; props: { assetId: string; url: string; objectFit: "cover"|"contain"; borderRadius?: number } };
type ShapeElement = ElementBase & { type: "shape"; props: { shape: "rect"|"ellipse"|"line"|"arrow"; fill: string; stroke?: string; strokeWidth?: number; borderRadius?: number } };
type IconElement  = ElementBase & { type: "icon";  props: { name: string; color: string } };
// Table/Chart: định nghĩa chi tiết khi vào Phase 2.

type BackgroundConfig = {
  type: "color" | "gradient" | "image";
  value: string;              // với image: assetId hoặc url
};

type TransitionType = "fade" | "slide" | "zoom"; // Phase 3
```

**Nguyên tắc:**
- Mọi thao tác kéo-thả/resize trên canvas (qua dnd-kit + pointer events) chỉ cập nhật `position`, `size`, `rotation`, `zIndex` của `SlideElement` — không thay đổi cấu trúc gốc.
- Toạ độ luôn là toạ độ logic trên khung 1280×720; zoom chỉ là CSS transform ở tầng render, KHÔNG bao giờ ghi toạ độ đã scale vào model.
- Text content phải được sanitize trước khi render (chống XSS) — xem `docs/BACKEND.md` mục 4.

## 2. Prisma Schema — outline entities

> Đây là outline mức entity, viết schema.prisma chi tiết khi bắt đầu implement Phase 1.

```
User
  id, email (unique), name, avatarUrl, passwordHash (nullable — null nếu chỉ login Google),
  googleId (nullable, unique), roleId, createdAt, updatedAt

Role
  id, name (unique — "admin", "user"), description
  // quan hệ với Permission qua bảng nối RolePermission (many-to-many)

Permission
  id, action (unique — "project:create", "project:delete", "template:publish", ...)

RolePermission            // bảng nối M2M — KHÔNG để roleId trong Permission
  roleId, permissionId    // @@id([roleId, permissionId])

Session
  id, userId, refreshTokenHash (unique), userAgent, ipAddress,
  expiresAt, revokedAt (nullable), replacedByHash (nullable — phục vụ reuse detection),
  createdAt

Project
  id, title, ownerId, content (Json — lưu Presentation model ở mục 1),
  revision (Int, default 0 — optimistic concurrency, xem mục 5),
  thumbnailUrl (nullable — snapshot slide đầu, sinh ở client khi save),
  status ("draft" | "published"), deletedAt (nullable — soft delete),
  createdAt, updatedAt

Asset                     // ảnh user upload (image element, background) — lưu trên Cloudflare R2
  id, ownerId, key (unique — object key trên R2), url (public URL),
  mimeType, sizeBytes, width, height, createdAt

ProjectCollaborator       // cho phase collaboration sau này, tạo bảng sẵn nhưng chưa dùng
  id, projectId, userId, role ("editor" | "viewer")   // @@unique([projectId, userId])

Theme
  id, name, config (Json — font/màu/background preset), isSystemTheme (bool),
  createdBy (nullable), createdAt, updatedAt

Template
  id, title, thumbnailUrl, content (Json — Presentation mẫu), category,
  isPublic (bool), createdBy (nullable), createdAt, updatedAt
```

**Lưu ý phân quyền:** Role chỉ có 2 cấp hệ thống (`admin`, `user`). Quyền trên từng project (owner/editor/viewer) là **resource-level**, check bằng ownership + `ProjectCollaborator` trong service layer — KHÔNG nhét vào Role toàn cục.

**Lý do lưu `content` là `Json`** thay vì tách bảng Slide/Element riêng: giai đoạn đầu presentation có cấu trúc lồng nhau sâu và thay đổi thường xuyên theo UI — lưu nguyên khối JSON giúp đơn giản hóa load/save toàn bộ project khi mở editor, tránh join phức tạp. Có thể tách bảng sau nếu cần query sâu vào từng slide (ví dụ search nội dung). `schemaVersion` trong JSON là chốt an toàn để migrate về sau.

## 3. Ranh giới module (Backend NestJS)

```
/apps/api/src
  /auth         → login, register, Google OAuth callback, session/cookie, CSRF
  /rbac         → Role, Permission, Guard, Decorator, seed
  /users
  /projects     → CRUD project, lưu/tải + validate content JSON, check ownership
  /assets       → upload ảnh lên Cloudflare R2 qua presigned URL (Phase 1 — image element cần ngay)
  /themes
  /templates
  /export       → Phase 3: PDF/PPTX/PNG generation
  /ai           → Phase 4, để trống module rỗng, chưa implement
```

## 4. packages/shared (@repo/shared)

Zod schema + type + constants dùng chung FE–BE, zod là source of truth:

```
packages/shared/src
  /schemas      → presentation.ts (mục 1), auth.ts (login/register), project.ts (create/update)
  /constants    → permissions.ts (danh sách action mặc định), limits.ts (size giới hạn)
  /types        → type infer từ zod, export chung
```

FE dùng schema cho react-hook-form (`zodResolver`); BE dùng cùng schema trong ValidationPipe (qua `nestjs-zod`) hoặc gọi `.parse()` trong service — hai phía không bao giờ lệch rule.

## 5. Luồng dữ liệu Frontend ↔ Backend

- **React Query**: mọi gọi API đi qua React Query hooks; hooks gọi qua fetch wrapper tại `apps/web/src/lib/api/` (KHÔNG axios, KHÔNG fetch trực tiếp trong component).
- **Zustand**: chỉ giữ state cục bộ của canvas editor hiện tại (selected element, zoom, undo/redo stack) — KHÔNG lưu dữ liệu đã có trên server vào Zustand để tránh 2 nguồn sự thật xung đột.
- Khi user chỉnh sửa trên canvas → cập nhật Zustand store trước (tức thời, mượt) → debounce ~1.5s → gọi mutation qua React Query để lưu lên server.
- **Optimistic concurrency (chống mất dữ liệu khi mở 2 tab):** mutation save gửi kèm `revision` hiện tại. Server so khớp: đúng → lưu + `revision + 1`; lệch → trả `409 Conflict`, FE hiện thông báo "Project đã được sửa ở nơi khác, tải lại?".
- **Server-side validation:** BE parse `content` bằng zod schema `Presentation` từ `@repo/shared` trước khi lưu + giới hạn body size (2MB) — không tin JSON từ client.
