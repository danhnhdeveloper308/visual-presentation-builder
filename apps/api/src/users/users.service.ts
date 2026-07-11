import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { AuthUser, ChangePasswordInput, UpdateProfileInput } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cập nhật hồ sơ (tên / avatar) — email không đổi được (định danh tài khoản). */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: input,
      include: { role: true },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
      hasPassword: user.passwordHash != null,
    };
  }

  /**
   * Đổi mật khẩu (đã có → phải nhập mật khẩu hiện tại) hoặc ĐẶT lần đầu
   * (tài khoản Google chưa có passwordHash). Đổi xong thu hồi MỌI phiên khác —
   * thiết bị lạ đang giữ session bị đăng xuất ngay.
   */
  async changePassword(
    userId: string,
    currentSessionId: string,
    input: ChangePasswordInput,
  ): Promise<{ revokedOtherSessions: number }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.passwordHash) {
      if (!input.currentPassword) {
        throw new BadRequestException('Cần nhập mật khẩu hiện tại');
      }
      const ok = await argon2.verify(user.passwordHash, input.currentPassword);
      if (!ok) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(input.newPassword) },
    });

    const { count } = await this.prisma.session.updateMany({
      where: { userId, id: { not: currentSessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { revokedOtherSessions: count };
  }
}
