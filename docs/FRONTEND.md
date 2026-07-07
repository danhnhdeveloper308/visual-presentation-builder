# FRONTEND.md — Next.js, State Management, Form, Drag & Drop

> Chỉ đọc file này khi task liên quan UI, Next.js routing, state, form, hoặc canvas/drag-drop.

## 1. Next.js 16 — `proxy.ts`

- File `proxy.ts` (KHÔNG phải `middleware.ts`) đặt ở root hoặc trong `src/`, cùng cấp với `app/`.
- Export named function `proxy` (không phải `middleware`):

```ts
// proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("access_token");
  if (!hasSession && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"],
};
```

- `proxy.ts` chạy trên **Node.js runtime** (khác Edge runtime của middleware cũ).
- **Quan trọng:** `proxy.ts` chỉ dùng cho check nhanh (có cookie hay không, redirect thô) — KHÔNG xác thực đầy đủ quyền hạn ở đây; permission check chi tiết vẫn ở NestJS backend.

## 2. Tầng gọi API — fetch wrapper + React Query

- **KHÔNG dùng axios.** Toàn bộ gọi API qua custom fetch wrapper tại `src/lib/api/`:
  - luôn `credentials: 'include'` (cookie auth);
  - base URL đọc từ `NEXT_PUBLIC_API_URL`;
  - parse lỗi về shape thống nhất `{ statusCode, message }`;
  - **tự động refresh:** gặp 401 → gọi `/auth/refresh` một lần → retry request gốc; refresh cũng fail → đá về `/login`.
- Toàn bộ component dùng React Query (`useQuery`/`useMutation`) bọc trên wrapper này — KHÔNG gọi fetch trực tiếp trong component.
- Tổ chức hook theo resource: `hooks/queries/useProject.ts`, `hooks/mutations/useSaveProject.ts`...
- `queryKey` có cấu trúc rõ ràng: `['project', projectId]`, `['templates', category]`. Invalidate đúng chỗ sau mutation.

## 3. Zustand — Client/UI State

- Dùng cho state **cục bộ của editor**, KHÔNG cache dữ liệu server (đó là việc của React Query).
- Store gợi ý cho canvas editor:

```ts
// stores/useEditorStore.ts
type EditorState = {
  presentation: Presentation | null; // bản làm việc (working copy) khi editor mở
  selectedElementId: string | null;
  activeSlideId: string | null;
  zoom: number;
  dirty: boolean;                    // có thay đổi chưa save
  history: { past: Presentation[]; future: Presentation[] }; // undo/redo, cap 50 bước
  // actions: setSelected, updateElement, addElement, removeElement,
  //          reorderSlides, undo, redo, ...
};
```

- **Ngoại lệ có chủ đích với nguyên tắc "không để server data vào Zustand":** khi editor mở, `presentation` được nạp 1 lần từ React Query vào store làm working copy — vì canvas cần mutate tần suất cao (kéo thả 60fps). Server state của React Query chỉ dùng để load ban đầu + save; trong phiên editor, store là nguồn sự thật, save đẩy ngược lên server.
- Undo/redo: snapshot toàn bộ `Presentation` mỗi thao tác hoàn chỉnh (kết thúc drag, kết thúc gõ text — KHÔNG snapshot từng keystroke/từng pixel), cap 50 bước để tránh phình bộ nhớ.
- Tách store nhỏ theo domain (editor store, UI store cho modal/sidebar) — tránh 1 store khổng lồ.

## 4. Canvas Editor — quyết định đã chốt: DOM-based, KHÔNG Konva/Fabric

- Slide render bằng **DOM thuần**: khung 1280×720 toạ độ logic, mỗi element là 1 `div` absolute-positioned (`transform: translate/rotate`), zoom = CSS `transform: scale` trên khung — **toạ độ ghi vào model luôn là toạ độ logic, phải chia lại theo zoom khi tính từ pointer event.**
- Lý do: Phase 1–2 chỉ cần text/image/shape/icon — DOM đủ, dễ style bằng CSS, text editing dùng `contentEditable` tự nhiên, không tốn công học/gánh Konva. Chỉ xem xét canvas engine nếu Phase 3+ cần vẽ tự do/filter phức tạp.

### Drag & Drop (dnd-kit)

**a) Sắp xếp thứ tự slide (panel trái):** `@dnd-kit/sortable` với `SortableContext` + `useSortable`, chuẩn pattern list sortable.

**b) Kéo element tự do trên canvas:** `@dnd-kit/core` với `useDraggable`, tính `position` mới từ `delta` của `DragEndEvent` (nhớ chia theo zoom), cập nhật Zustand ngay (mượt), sau đó debounce save:

```ts
function handleDragEnd(event: DragEndEvent) {
  const { active, delta } = event;
  updateElementPosition(active.id as string, {
    dx: delta.x / zoom,
    dy: delta.y / zoom,
  });
  pushHistory();      // 1 snapshot cho cả thao tác drag
  debouncedSave();    // debounce ~1.5s gọi mutation lưu server (kèm revision)
}
```

**c) Resize/rotate:** dnd-kit không hỗ trợ — tự viết 8 handle resize + 1 handle rotate bằng pointer events (`onPointerDown/Move/Up` + `setPointerCapture`), cùng cơ chế cập nhật Zustand → debounce save.

- Save luôn gửi kèm `revision`; nhận `409 Conflict` → hiện dialog "Project đã thay đổi ở nơi khác — tải lại?" (chi tiết `docs/ARCHITECTURE.md` mục 5).

## 5. react-hook-form + zod

- Mọi form (login, register, create project, edit theme...) theo pattern:

```ts
import { loginSchema } from "@repo/shared";

const form = useForm<z.infer<typeof loginSchema>>({
  resolver: zodResolver(loginSchema),
});
```

- **Schema zod đặt ở `packages/shared` (`@repo/shared`)** — KHÔNG viết schema riêng trong `apps/web` cho payload đi qua API, để FE và BE dùng chung một nguồn rule. Schema chỉ-UI (không đi qua API) mới được đặt cục bộ.
- Lỗi validate hiển thị qua `formState.errors`, không tự viết state lỗi riêng.

## 6. Quy tắc chung UI

- **shadcn/ui** (style new-york, base neutral, Tailwind CSS v4): component copy vào `src/components/ui/` qua `pnpm dlx shadcn@latest add <name>` (chạy trong `apps/web`) — KHÔNG tự viết lại component đã có trong shadcn. Config ở `components.json`; theme variables ở `src/app/globals.css`.
- **Icon: lucide-react** — dùng cho toàn bộ UI và cho `IconElement` trên slide (`props.name` = tên icon lucide). Không trộn thư viện icon khác.
- Component chia theo domain: `components/editor/`, `components/dashboard/`, `components/template/`; primitives dùng chung ở `components/ui/` (shadcn).
- Không mix logic gọi API trực tiếp trong component render — luôn qua hook riêng.
- Element trong slide có text do user nhập: render đã được BE sanitize, nhưng vẫn KHÔNG dùng `dangerouslySetInnerHTML` với dữ liệu thô.
