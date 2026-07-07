import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { Env } from '../config/env.validation';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { GoogleStrategy } from './google.strategy';
import { GoogleEnabledGuard } from './google-enabled.guard';

// Chỉ đăng ký GoogleStrategy khi env đầy đủ — constructor của Strategy
// throw nếu clientID rỗng. Route /auth/google bị GoogleEnabledGuard chặn 404.
const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    GoogleEnabledGuard,
    ...(googleEnabled ? [GoogleStrategy] : []),
  ],
  exports: [TokenService],
})
export class AuthModule {}
