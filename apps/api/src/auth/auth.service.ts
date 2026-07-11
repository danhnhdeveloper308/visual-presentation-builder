import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  ROLES,
  SUPERADMIN_EMAIL,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
  type SessionDto,
} from '@repo/shared';
import type { User, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService, REFRESH_TOKEN_TTL_MS } from './token.service';

export type AuthResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

type ClientMeta = { userAgent?: string; ipAddress?: string };

const INVALID_CREDENTIALS = 'Email hoặc mật khẩu không đúng';
const ACCOUNT_LOCKED = 'Tài khoản đã bị khóa — liên hệ quản trị viên';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async register(input: RegisterInput, meta: ClientMeta): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const role = await this.getDefaultRole();
    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash, roleId: role.id },
      include: { role: true },
    });

    return this.createSession(user, meta);
  }

  async login(input: LoginInput, meta: ClientMeta): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { role: true },
    });
    // passwordHash null = tài khoản chỉ login Google — trả lỗi generic, không lộ thông tin
    if (!user?.passwordHash) throw new UnauthorizedException(INVALID_CREDENTIALS);

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) throw new UnauthorizedException(INVALID_CREDENTIALS);
    if (user.lockedAt) throw new UnauthorizedException(ACCOUNT_LOCKED);

    return this.createSession(user, meta);
  }

  async googleLogin(profile: GoogleProfile, meta: ClientMeta): Promise<AuthResult> {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
      include: { role: true },
    });

    if (!user) {
      const byEmail = await this.prisma.user.findUnique({ where: { email: profile.email } });
      if (byEmail) {
        // Email đã đăng ký trước (bằng password) → merge: gắn googleId, KHÔNG tạo user trùng
        user = await this.prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: profile.googleId, avatarUrl: byEmail.avatarUrl ?? profile.avatarUrl },
          include: { role: true },
        });
      } else {
        const role = await this.getDefaultRole();
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
            googleId: profile.googleId,
            roleId: role.id,
          },
          include: { role: true },
        });
      }
    }

    if (user.lockedAt) throw new UnauthorizedException(ACCOUNT_LOCKED);
    return this.createSession(user, meta);
  }

  /**
   * Refresh token rotation + reuse detection (docs/BACKEND.md mục 1):
   * - Token hợp lệ → phát cặp token mới, hash cũ lưu vào replacedByHash.
   * - Token ĐÃ rotate bị dùng lại → nghi bị đánh cắp → revoke TOÀN BỘ session của user.
   */
  async refresh(rawToken: string, _meta: ClientMeta): Promise<AuthResult> {
    const hash = this.tokens.hashToken(rawToken);

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hash },
      include: { user: { include: { role: true } } },
    });

    if (!session) {
      // Reuse detection: hash này từng là token cũ của một session đã rotate?
      const reused = await this.prisma.session.findFirst({
        where: { replacedByHash: hash },
        select: { userId: true },
      });
      if (reused) {
        await this.prisma.session.updateMany({
          where: { userId: reused.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    if (session.revokedAt !== null || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    const newRefresh = this.tokens.generateRefreshToken();
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: this.tokens.hashToken(newRefresh),
        replacedByHash: hash,
      },
    });

    const accessToken = await this.tokens.signAccessToken(
      session.user.id,
      session.user.role.name,
      session.id,
    );
    return { user: this.toAuthUser(session.user), accessToken, refreshToken: newRefresh };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const hash = this.tokens.hashToken(rawToken);
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.toAuthUser(user);
  }

  private async createSession(
    user: User & { role: Role },
    meta: ClientMeta,
  ): Promise<AuthResult> {
    // SUPERADMIN (email chốt cứng) luôn có role admin — tự thăng ngay khi đăng nhập/đăng ký
    if (user.email === SUPERADMIN_EMAIL && user.role.name !== ROLES.ADMIN) {
      const adminRole = await this.prisma.role.findUnique({ where: { name: ROLES.ADMIN } });
      if (adminRole) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { roleId: adminRole.id },
          include: { role: true },
        });
      }
    }

    const refreshToken = this.tokens.generateRefreshToken();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.tokens.hashToken(refreshToken),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    const accessToken = await this.tokens.signAccessToken(user.id, user.role.name, session.id);
    return { user: this.toAuthUser(user), accessToken, refreshToken };
  }

  private async getDefaultRole(): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where: { name: ROLES.USER } });
    if (!role) {
      throw new InternalServerErrorException('Chưa seed roles — chạy `pnpm db:seed`');
    }
    return role;
  }

  private toAuthUser(user: User & { role: Role }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
      hasPassword: user.passwordHash != null,
    };
  }

  /* ---------- Quản lý phiên đăng nhập (trang tài khoản) ---------- */

  /** Phiên còn hiệu lực của user — phiên đang gọi API đánh dấu `current`. */
  async listSessions(userId: string, currentSessionId: string): Promise<SessionDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
    });
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      current: s.id === currentSessionId,
    }));
  }

  /**
   * Thu hồi 1 phiên — AuthGuard check `revokedAt` trong DB mỗi request nên thiết bị đó
   * bị đăng xuất NGAY ở request kế tiếp (không cần đợi access token hết hạn).
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const { count } = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy phiên đăng nhập');
  }

  /** Đăng xuất mọi thiết bị KHÁC (giữ phiên hiện tại). */
  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const { count } = await this.prisma.session.updateMany({
      where: { userId, id: { not: currentSessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return count;
  }
}
