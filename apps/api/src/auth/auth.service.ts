import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import type { Env } from '../config/env.validation';
import { MailService } from '../mail/mail.service';
import { buildResetPasswordEmail } from '../mail/templates';
import { TokenService, REFRESH_TOKEN_TTL_MS } from './token.service';

/** Token đặt lại mật khẩu có hiệu lực trong 1 giờ. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
    private readonly config: ConfigService<Env, true>,
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

  /* ---------- Quên / đặt lại mật khẩu ---------- */

  /**
   * Gửi email đặt lại mật khẩu. LUÔN trả về như nhau dù email có tồn tại hay không
   * (chống dò email). Tài khoản bị khóa không gửi. Mỗi lần gọi vô hiệu hóa token cũ
   * chưa dùng của user rồi tạo token mới (raw gửi qua email, chỉ lưu hash).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Không lộ thông tin: user không tồn tại / bị khóa → im lặng trả về success
    if (!user || user.lockedAt) return;

    // Vô hiệu token cũ chưa dùng (đánh dấu đã dùng) để chỉ 1 link còn hiệu lực
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = this.tokens.generateResetToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.tokens.hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const frontend = this.config.get('FRONTEND_ORIGIN', { infer: true });
    const resetUrl = `${frontend}/reset-password?token=${rawToken}`;
    try {
      const { subject, html, text } = buildResetPasswordEmail(user.name, resetUrl);
      await this.mail.send({ to: user.email, toName: user.name, subject, html, text });
    } catch (err) {
      // Không ném ra ngoài (tránh lộ email tồn tại + tránh 500) — chỉ log để xử lý
      this.logger.error(`Gửi email reset cho ${user.email} thất bại: ${String(err)}`);
    }
  }

  /**
   * Đặt lại mật khẩu bằng token từ email. Token hợp lệ = tồn tại, chưa dùng, chưa hết hạn.
   * Thành công: đặt passwordHash mới, đánh dấu token đã dùng, THU HỒI mọi phiên đăng nhập
   * của user (buộc đăng nhập lại bằng mật khẩu mới trên mọi thiết bị).
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.tokens.hashToken(rawToken);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
    if (record.user.lockedAt) {
      throw new UnauthorizedException(ACCOUNT_LOCKED);
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Thu hồi toàn bộ session — thiết bị khác văng ngay (AuthGuard check revoked mỗi request)
      this.prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
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
