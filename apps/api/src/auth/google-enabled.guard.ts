import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';

/** Chặn route Google OAuth khi chưa cấu hình GOOGLE_CLIENT_ID/SECRET trong env. */
@Injectable()
export class GoogleEnabledGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(): boolean {
    const id = this.config.get('GOOGLE_CLIENT_ID', { infer: true });
    const secret = this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });
    if (!id || !secret) {
      throw new NotFoundException('Đăng nhập Google chưa được bật');
    }
    return true;
  }
}
