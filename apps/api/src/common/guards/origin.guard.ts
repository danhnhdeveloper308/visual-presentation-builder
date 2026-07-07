import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Env } from '../../config/env.validation';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Chống CSRF: check Origin header cho mọi request có side-effect.
 * Browser LUÔN gửi Origin cho fetch/XHR/form POST cross-origin — attacker không giả được.
 * Origin vắng mặt (curl, server-to-server, test) thì cho qua: các client đó không mang cookie
 * của victim nên không phải CSRF. Xem docs/BACKEND.md mục 1.1.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;

    const origin = req.headers.origin;
    if (!origin) return true;

    const allowed = this.config.get('FRONTEND_ORIGIN', { infer: true });
    if (origin !== allowed) {
      throw new ForbiddenException('Origin không được phép');
    }
    return true;
  }
}
