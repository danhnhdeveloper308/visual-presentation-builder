/**
 * Danh sách permission mặc định (format `resource:action`) + mapping theo role hệ thống.
 * Seed script của API đọc từ đây — KHÔNG hardcode chuỗi permission ở nơi khác.
 */
export const PERMISSIONS = {
  PROJECT_CREATE: "project:create",
  PROJECT_READ: "project:read",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  ASSET_CREATE: "asset:create",
  ASSET_DELETE: "asset:delete",
  TEMPLATE_READ: "template:read",
  TEMPLATE_MANAGE: "template:manage", // tạo/sửa/publish template hệ thống
  THEME_READ: "theme:read",
  THEME_MANAGE: "theme:manage",
  USER_MANAGE: "user:manage", // admin quản lý user
} as const;

export type PermissionAction = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionAction[] = Object.values(PERMISSIONS);

/** Role hệ thống — quyền theo từng project (owner/editor/viewer) là resource-level, không nằm ở đây. */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, PermissionAction[]> = {
  admin: ALL_PERMISSIONS,
  user: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.ASSET_CREATE,
    PERMISSIONS.ASSET_DELETE,
    PERMISSIONS.TEMPLATE_READ,
    PERMISSIONS.THEME_READ,
  ],
};
