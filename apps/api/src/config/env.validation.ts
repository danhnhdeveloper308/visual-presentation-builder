import { z } from 'zod';

/**
 * Validate toàn bộ env khi boot — thiếu/sai key là fail-fast ngay lúc khởi động,
 * không để lỗi runtime mơ hồ về sau.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url(),

  // Auth (Phase 0.5 dùng — bắt buộc có sẵn để không quên cấu hình)
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Google OAuth — optional cho tới khi bật tính năng
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Cloudflare R2 (S3-compatible) — storage cho Asset
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_R2_S3_URL: z.string().url(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),

  // Email (Brevo) — gửi mail đặt lại mật khẩu. Thiếu API key: chạy chế độ dev
  // (log link ra console thay vì gửi thật). Sender phải là email đã verify trên Brevo.
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().default('danhnh.developer@gmail.com'),
  BREVO_SENDER_NAME: z.string().default('Visual Builder'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return result.data;
}
