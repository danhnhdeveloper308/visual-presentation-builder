import { z } from "zod";
import { LIMITS } from "../constants/limits";

/** Trang quản trị (admin) — quản lý user: khóa/mở khóa + chỉnh quota lưu trữ. */

export const setUserLockSchema = z.object({
  locked: z.boolean(),
});

export const setUserQuotaSchema = z.object({
  storageQuotaBytes: z
    .number()
    .int()
    .min(0)
    .max(LIMITS.USER_STORAGE_QUOTA_MAX_BYTES, "Quota tối đa 10GB"),
});

export type SetUserLockInput = z.infer<typeof setUserLockSchema>;
export type SetUserQuotaInput = z.infer<typeof setUserQuotaSchema>;

/** 1 user trong danh sách quản trị. */
export type AdminUserSummary = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  /** khác null = đang bị khóa. */
  lockedAt: string | null;
  storageQuotaBytes: number;
  /** Tổng dung lượng asset đã dùng (bytes). */
  usedStorageBytes: number;
  projectCount: number;
  createdAt: string;
};

/** Dung lượng lưu trữ của user hiện tại (hiển thị quota). */
export type StorageUsage = {
  usedBytes: number;
  quotaBytes: number;
};
