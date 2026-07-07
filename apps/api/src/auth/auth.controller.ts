import {
  Body,
  Controller,
  Get,
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
  loginSchema,
  registerSchema,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
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
    const result = await this.auth.googleLogin(profile, this.clientMeta(req));
    this.applyCookies(res, result);
    res.redirect(`${this.config.get('FRONTEND_ORIGIN', { infer: true })}/dashboard`);
  }
}
