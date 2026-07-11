import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type AuthUser,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from '@repo/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Public } from '../rbac/decorators/public.decorator';
import { CurrentUser, type RequestUser } from '../rbac/decorators/current-user.decorator';
import type { Env } from '../config/env.validation';
import { AuthService, type AuthResult, type GoogleProfile } from './auth.service';
import { GoogleEnabledGuard } from './google-enabled.guard';
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from './cookies';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private get isProd(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  private applyCookies(res: Response, result: AuthResult): AuthUser {
    setAuthCookies(
      res,
      { accessToken: result.accessToken, refreshToken: result.refreshToken },
      this.isProd,
    );
    return result.user;
  }

  private clientMeta(req: Request) {
    return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    return this.applyCookies(res, await this.auth.register(body, this.clientMeta(req)));
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    return this.applyCookies(res, await this.auth.login(body, this.clientMeta(req)));
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    const raw = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    if (!raw) {
      clearAuthCookies(res, this.isProd);
      throw new UnauthorizedException('Không có refresh token');
    }
    try {
      return this.applyCookies(res, await this.auth.refresh(raw, this.clientMeta(req)));
    } catch (err) {
      clearAuthCookies(res, this.isProd);
      throw err;
    }
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const raw = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    await this.auth.logout(raw);
    clearAuthCookies(res, this.isProd);
    return { success: true };
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser): Promise<AuthUser> {
    return this.auth.me(user.id);
  }

  /* ---------- Quên / đặt lại mật khẩu ---------- */

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) body: ForgotPasswordInput,
  ): Promise<{ success: true }> {
    await this.auth.forgotPassword(body.email);
    // Luôn trả success như nhau — không lộ email có tồn tại hay không
    return { success: true };
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
  ): Promise<{ success: true }> {
    await this.auth.resetPassword(body.token, body.newPassword);
    return { success: true };
  }

  /* ---------- Quản lý phiên đăng nhập (trang tài khoản) ---------- */

  @Get('sessions')
  listSessions(@CurrentUser() user: RequestUser) {
    return this.auth.listSessions(user.id, user.sessionId);
  }

  @Post('sessions/revoke-others')
  async revokeOtherSessions(@CurrentUser() user: RequestUser) {
    const revoked = await this.auth.revokeOtherSessions(user.id, user.sessionId);
    return { revoked };
  }

  @Delete('sessions/:id')
  async revokeSession(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.auth.revokeSession(user.id, id);
    return { success: true };
  }

  @Public()
  @UseGuards(GoogleEnabledGuard, PassportAuthGuard('google'))
  @Get('google')
  google(): void {
    // Passport redirect sang Google — không bao giờ chạy tới đây
  }

  @Public()
  @UseGuards(GoogleEnabledGuard, PassportAuthGuard('google'))
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const profile = req.user as GoogleProfile;
    const frontend = this.config.get('FRONTEND_ORIGIN', { infer: true }) as string;
    let result: AuthResult;
    try {
      result = await this.auth.googleLogin(profile, this.clientMeta(req));
    } catch (err) {
      // Tài khoản bị khóa (401) → đưa về trang thông báo thay vì trả JSON trần
      if (err instanceof UnauthorizedException) {
        res.redirect(`${frontend}/locked`);
        return;
      }
      throw err;
    }
    this.applyCookies(res, result);
    res.redirect(`${frontend}/dashboard`);
  }
}
