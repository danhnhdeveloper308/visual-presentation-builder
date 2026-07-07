import type { CookieOptions, Response } from 'express';
import { REFRESH_TOKEN_TTL_MS } from './token.service';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
/** Refresh cookie chỉ gửi tới các route /auth (refresh, logout) — giảm bề mặt lộ token. */
const REFRESH_COOKIE_PATH = '/auth';

function baseOptions(isProd: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax', // xem docs/BACKEND.md mục 1 — strict phá OAuth redirect + external link
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  isProd: boolean,
) {
  // Cookie access sống 30d để proxy.ts còn thấy "có session" — JWT bên trong
  // vẫn hết hạn sau 15m, API enforce; FE wrapper tự refresh khi 401.
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(isProd),
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(isProd),
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

export function clearAuthCookies(res: Response, isProd: boolean) {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(isProd), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(isProd), path: REFRESH_COOKIE_PATH });
}
