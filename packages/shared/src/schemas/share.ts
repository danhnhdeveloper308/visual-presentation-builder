import { z } from "zod";
import type { Presentation } from "./presentation";

/**
 * Chia sẻ project (2 tầng):
 * - Share với USER cụ thể qua bảng ProjectCollaborator: role `editor` (sửa được nội dung)
 *   hoặc `viewer` (chỉ xem) — quản lý bởi owner.
 * - Share PUBLIC bằng link: `shareToken` ngẫu nhiên trên Project, ai có link đều XEM được
 *   (read-only, không cần đăng nhập) tại `/p/<token>`; tắt = xóa token (link cũ chết).
 */

export const collaboratorRoleSchema = z.enum(["editor", "viewer"]);

export const addCollaboratorSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  role: collaboratorRoleSchema,
});

export const updateCollaboratorSchema = z.object({
  role: collaboratorRoleSchema,
});

export type CollaboratorRole = z.infer<typeof collaboratorRoleSchema>;
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type UpdateCollaboratorInput = z.infer<typeof updateCollaboratorSchema>;

/** Quyền của user hiện tại trên 1 project. */
export type ProjectRole = "owner" | CollaboratorRole;

export type CollaboratorDto = {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: CollaboratorRole;
};

/** Trạng thái share public của project (chỉ owner thấy). */
export type ShareInfo = { shareToken: string | null };

/** Nội dung trình bày qua link public — read-only, không lộ thông tin chủ sở hữu. */
export type PublicPresentationDto = {
  title: string;
  content: Presentation;
  updatedAt: string;
};
