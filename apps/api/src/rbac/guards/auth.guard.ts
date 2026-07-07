import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { RequestUser } from '../decorators/current-user.decorator';

export type AccessTokenPayload = {
  sub: string;
  role: string;
  sessionId: string;
};

export const ACCESS_TOKEN_COOKIE = 'access_token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser; cookies: Record<string, string> }>();

    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!token) throw new UnauthorizedException('Chưa đăng nhập');

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    // Check session còn hiệu lực — revoke có tác dụng NGAY, không đợi JWT hết hạn
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      select: { revokedAt: true, expiresAt: true },
    });
    if (!session || session.revokedAt !== null || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã kết thúc');
    }

    req.user = { id: payload.sub, role: payload.role, sessionId: payload.sessionId };
    return true;
  }
}
