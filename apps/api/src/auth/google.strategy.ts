import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import type { Env } from '../config/env.validation';
import type { GoogleProfile } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService<Env, true>) {
    super({
      // Provider này chỉ được đăng ký khi env Google đầy đủ (xem auth.module.ts)
      clientID: config.get('GOOGLE_CLIENT_ID', { infer: true }) ?? '',
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', { infer: true }) ?? '',
      callbackURL: config.get('GOOGLE_CALLBACK_URL', { infer: true }) ?? '',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleProfile {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Tài khoản Google không cung cấp email');
    }
    return {
      googleId: profile.id,
      email,
      name: profile.displayName || email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
