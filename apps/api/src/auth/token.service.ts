import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccessTokenPayload } from '../rbac/guards/auth.guard';

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  signAccessToken(userId: string, role: string, sessionId: string): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, role, sessionId };
    return this.jwt.signAsync(payload); // secret + expiresIn 15m cấu hình ở JwtModule
  }

  /** Refresh token là chuỗi random opaque (không phải JWT) — chỉ lưu HASH trong DB. */
  generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  /** Token đặt lại mật khẩu — random opaque, gửi raw qua email, lưu HASH trong DB. */
  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
