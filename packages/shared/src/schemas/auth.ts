import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

/** Quy tắc mật khẩu dùng chung cho đăng ký + đổi/đặt mật khẩu. */
export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .max(72)
  .regex(/[a-zA-Z]/, "Mật khẩu phải có chữ cái")
  .regex(/[0-9]/, "Mật khẩu phải có chữ số");

export const registerSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").max(100),
  email: z.string().email("Email không hợp lệ"),
  password: passwordSchema,
});

/** User trả về cho FE — KHÔNG bao giờ chứa passwordHash/token. */
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  /** false = tài khoản chỉ đăng nhập Google, chưa đặt mật khẩu. */
  hasPassword: z.boolean(),
});

/* ---------- Trang tài khoản ---------- */

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  /** Bắt buộc khi tài khoản ĐÃ có mật khẩu; user Google đặt lần đầu thì bỏ trống. */
  currentPassword: z.string().optional(),
  newPassword: passwordSchema,
});

/** 1 phiên đăng nhập đang hoạt động của user. */
export type SessionDto = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  /** Phiên đang dùng để gọi API này. */
  current: boolean;
};

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
