import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { PermissionAction } from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import type { RequestUser } from '../decorators/current-user.decorator';

const CACHE_TTL_MS = 60_000;

@Injectable()
export class PermissionsGuard implements CanActivate {
  // Cache permission theo role — tránh query DB mỗi request; TTL ngắn để đổi quyền có tác dụng nhanh
  private readonly cache = new Map<string, { permissions: Set<string>; expiresAt: number }>();

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionAction[] | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const user = req.user;
    if (!user) throw new ForbiddenException();

    const permissions = await this.getRolePermissions(user.role);
    const missing = required.filter((p) => !permissions.has(p));
    if (missing.length > 0) {
      throw new ForbiddenException(`Thiếu quyền: ${missing.join(', ')}`);
    }
    return true;
  }

  private async getRolePermissions(roleName: string): Promise<Set<string>> {
    const cached = this.cache.get(roleName);
    if (cached && cached.expiresAt > Date.now()) return cached.permissions;

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
      include: { permissions: { include: { permission: true } } },
    });
    const permissions = new Set(role?.permissions.map((rp) => rp.permission.action) ?? []);
    this.cache.set(roleName, { permissions, expiresAt: Date.now() + CACHE_TTL_MS });
    return permissions;
  }
}
