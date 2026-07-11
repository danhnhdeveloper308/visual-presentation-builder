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
  TEMPLATE_CREATE: "template:create",
  TEMPLATE_UPDATE: "template:update",
  TEMPLATE_DELETE: "template:delete",
  TEMPLATE_MANAGE: "template:manage", // dành riêng cho quản trị template HỆ THỐNG (chưa dùng, để mở rộng sau)
  THEME_READ: "theme:read",
  THEME_CREATE: "theme:create",
  THEME_UPDATE: "theme:update",
  THEME_DELETE: "theme:delete",
  THEME_MANAGE: "theme:manage", // dành riêng cho quản trị theme HỆ THỐNG (chưa dùng, để mở rộng sau)
  USER_MANAGE: "user:manage", // admin quản lý user
} as const;

export type PermissionAction = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * SUPERADMIN: tự gán role admin khi đăng nhập/đăng ký, không thể bị khóa/hạ quyền
 * từ trang quản trị (chốt theo yêu cầu user 2026-07-11).
 */
export const SUPERADMIN_EMAIL = "danhnh.developer@gmail.com";

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
    PERMISSIONS.TEMPLATE_CREATE,
    PERMISSIONS.TEMPLATE_UPDATE,
    PERMISSIONS.TEMPLATE_DELETE,
    PERMISSIONS.THEME_READ,
    PERMISSIONS.THEME_CREATE,
    PERMISSIONS.THEME_UPDATE,
    PERMISSIONS.THEME_DELETE,
  ],
};
