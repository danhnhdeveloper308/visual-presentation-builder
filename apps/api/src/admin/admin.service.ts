import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  SUPERADMIN_EMAIL,
  type AdminUserSummary,
  type SetUserQuotaInput,
} from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

/** Quản trị user (trang /admin): danh sách + khóa/mở khóa + chỉnh quota lưu trữ. */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(): Promise<AdminUserSummary[]> {
    const [users, usageByOwner, projectsByOwner] = await Promise.all([
      this.prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.asset.groupBy({ by: ['ownerId'], _sum: { sizeBytes: true } }),
      this.prisma.project.groupBy({
        by: ['ownerId'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const usage = new Map(usageByOwner.map((u) => [u.ownerId, u._sum.sizeBytes ?? 0]));
    const projects = new Map(projectsByOwner.map((p) => [p.ownerId, p._count._all]));

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      role: u.role.name,
      lockedAt: u.lockedAt?.toISOString() ?? null,
      storageQuotaBytes: u.storageQuotaBytes,
      usedStorageBytes: usage.get(u.id) ?? 0,
      projectCount: projects.get(u.id) ?? 0,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  /**
   * Khóa: set lockedAt + revoke TOÀN BỘ session (AuthGuard check revoked mỗi request
   * → mọi thiết bị văng ngay request kế tiếp); mở khóa: lockedAt = null.
   * Không tự khóa mình, không khóa SUPERADMIN.
   */
  async setLock(adminId: string, targetUserId: string, locked: boolean): Promise<void> {
    const target = await this.findTarget(targetUserId);
    if (locked) {
      if (target.id === adminId) throw new BadRequestException('Không thể tự khóa chính mình');
      if (target.email === SUPERADMIN_EMAIL) {
        throw new BadRequestException('Không thể khóa tài khoản SUPERADMIN');
      }
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: target.id },
          data: { lockedAt: new Date() },
        }),
        this.prisma.session.updateMany({
          where: { userId: target.id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);
    } else {
      await this.prisma.user.update({ where: { id: target.id }, data: { lockedAt: null } });
    }
  }

  async setQuota(targetUserId: string, input: SetUserQuotaInput): Promise<void> {
    const target = await this.findTarget(targetUserId);
    await this.prisma.user.update({
      where: { id: target.id },
      data: { storageQuotaBytes: input.storageQuotaBytes },
    });
  }

  private async findTarget(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy user');
    return user;
  }
}
