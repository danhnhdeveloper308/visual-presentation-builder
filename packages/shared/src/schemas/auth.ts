import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Tên không được để trống").max(100),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .max(72)
    .regex(/[a-zA-Z]/, "Mật khẩu phải có chữ cái")
    .regex(/[0-9]/, "Mật khẩu phải có chữ số"),
});

/** User trả về cho FE — KHÔNG bao giờ chứa passwordHash/token. */
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
